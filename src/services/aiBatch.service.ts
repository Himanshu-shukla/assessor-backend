import { Queue, Worker, Job } from "bullmq";
import Redis from "ioredis";
import { Assessment } from "../models/Assessment";
import { generateAIResumeAnalysis } from "./aiAnalysis.service";
import { computeRank } from "./ranking.service";

// ─── 1. REDIS CONNECTIONS (Pooled & Split) ───────────────────────────────────
// Queue and Worker get dedicated connections to prevent load blocking
const redisOptions = {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  lazyConnect: true, // Optimized for pooling
};

const queueConnection = new Redis(process.env.REDIS_URL || "redis://127.0.0.1:6379", redisOptions);
const workerConnection = new Redis(process.env.REDIS_URL || "redis://127.0.0.1:6379", redisOptions);

// ─── 2. QUEUE CONFIGURATION ──────────────────────────────────────────────────
export const batchAnalysisQueue = new Queue("BatchAnalysisQueue", {
  connection: queueConnection,
  defaultJobOptions: {
    attempts: 3, // Auto-retry AI API failures
    backoff: { type: "exponential", delay: 2000 },
    removeOnComplete: true, // Complete backpressure protection (no memory spikes)
    removeOnFail: true,
  },
});

// ─── 3. THE PRODUCER: BULK ENQUEUE (ZERO DB READS LATER) ─────────────────────
export async function enqueueBulkAssessments(assessments: any[], jobDescription?: string) {
  const CHUNK_SIZE = 100; // Redis sweet spot

  for (let i = 0; i < assessments.length; i += CHUNK_SIZE) {
    const chunk = assessments.slice(i, i + CHUNK_SIZE);

    // KEY FIX: Passing resumeText directly so the worker doesn't query the DB
    await batchAnalysisQueue.addBulk(
      chunk.map((a) => ({
        name: "analyzeResume",
        data: {
          assessmentId: a._id.toString(),
          resumeText: a.resumeText,
          jobDescription: jobDescription,
          topSkills: a.topSkills || [],
        },
        // Using 'jobId' to prevent duplicate jobs for the same assessment analysis
        opts: { jobId: `assessment-${a._id.toString()}` }, 
      }))
    );
  }
  console.log(`[Queue] Successfully enqueued ${assessments.length} resumes.`);
}

// ─── 4. THE WRITE BUFFER: BATCH MONGODB UPDATES ──────────────────────────────
class WriteBuffer {
  private buffer: any[] = [];
  private flushTimer: NodeJS.Timeout | null = null;
  private readonly FLUSH_SIZE = 50;   // Save to DB every 50 resumes
  private readonly FLUSH_INTERVAL = 2000; // Or max wait of 2 seconds

  // Returns a Promise that resolves when the DB batch is successfully written
  push(assessmentId: string, aiReport: any, resumeRank: any): Promise<void> {
    return new Promise((resolve, reject) => {
      this.buffer.push({ assessmentId, aiReport, resumeRank, resolve, reject });

      if (this.buffer.length >= this.FLUSH_SIZE) {
        this.flush();
      } else if (!this.flushTimer) {
        this.flushTimer = setTimeout(() => this.flush(), this.FLUSH_INTERVAL);
      }
    });
  }

  async flush() {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }
    if (this.buffer.length === 0) return;

    // Small fix: slice precisely FLUSH_SIZE to prevent massive writes when memory spikes
    const batch = this.buffer.splice(0, this.FLUSH_SIZE);

    try {
      // 1 bulkWrite replaces 50 individual .save() calls!
      await Assessment.bulkWrite(
        batch.map(({ assessmentId, aiReport, resumeRank }) => ({
          updateOne: {
            filter: { _id: assessmentId },
            update: { $set: { analysisType: "ai", aiReport, resumeRank } },
          },
        })),
        { ordered: false }
      );
      console.log(`[DB] Flushed batch of ${batch.length} updates to MongoDB`);
      
      // Resolve promises so BullMQ safely marks the jobs as Complete after they are persisted!
      batch.forEach(item => item.resolve());
    } catch (err: any) {
      console.error("[DB] Bulk write failed", err);
      // Reject promises gracefully to trigger BullMQ retry logic if DB is down.
      batch.forEach(item => item.reject(err));
    }

    // Process leftover buffer iteratively
    if (this.buffer.length > 0) {
      this.flushTimer = setTimeout(() => this.flush(), 20); // Flush rest right after 20ms
    }
  }
}

const writeBuffer = new WriteBuffer();

// ─── 5. THE WORKER: HIGH CONCURRENCY & AI RATE LIMITED ───────────────────────
const worker = new Worker(
  "BatchAnalysisQueue",
  async (job: Job) => {
    // Destructure everything from the job. NO DB READS!
    const { assessmentId, resumeText, jobDescription, topSkills } = job.data;

    if (!resumeText) {
      return { status: "skipped", reason: "No resume text provided" };
    }

    // Call AI (Your bottleneck, handled by concurrency/limiter below)
    const aiReport = await generateAIResumeAnalysis(resumeText, jobDescription);
    const resumeRank = computeRank(aiReport?.total_score ?? 0, topSkills);

    // Push to memory buffer instead of awaiting a DB save.
    // We await this push to ensure the data is written safely to DB before the job finishes.
    await writeBuffer.push(assessmentId, aiReport, resumeRank);

    return { status: "completed", assessmentId };
  },
  {
    connection: workerConnection,
    // How many jobs this Node process runs at once
    concurrency: 100, 
    // PREVENT 429 ERRORS: Max 50 AI calls per second (Adjust to your AI provider limits!)
    limiter: {
      max: 50,
      duration: 1000, 
    },
  }
);

// Minimal logging to prevent terminal lag
worker.on("failed", (job, err) => {
  console.error(`[Worker] Job ${job?.id} failed:`, err.message);
});

// ─── 6. GRACEFUL SHUTDOWN (CRITICAL FOR BUFFER) ──────────────────────────────
process.on("SIGINT", async () => {
  console.log("Shutting down... Flushing final DB writes.");
  await writeBuffer.flush();
  await worker.close();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("Shutting down... Flushing final DB writes.");
  await writeBuffer.flush();
  await worker.close();
  process.exit(0);
});
