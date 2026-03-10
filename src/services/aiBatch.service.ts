import { Queue, Worker, Job } from "bullmq";
import Redis from "ioredis";
import { Assessment } from "../models/Assessment";
import { generateAIResumeAnalysis } from "./aiAnalysis.service";
import { computeRank } from "./ranking.service";

const redisConnection = new Redis(process.env.REDIS_URL || "redis://127.0.0.1:6379", {
  maxRetriesPerRequest: null,
});

export const batchAnalysisQueue = new Queue("BatchAnalysisQueue", {
  connection: redisConnection,
});

const worker = new Worker(
  "BatchAnalysisQueue",
  async (job: Job) => {
    const { assessmentId, jobDescription } = job.data;
    
    // Process the individual assessment
    const assessment = await Assessment.findById(assessmentId);
    
    if (!assessment || !assessment.resumeText) {
      throw new Error(`Assessment ${assessmentId} missing or has no resume text`);
    }
    
    // Skip if already has report to save tokens
    if (assessment.aiReport) {
        return { status: "skipped", reason: "AI report already exists" };
    }

    const aiReport = await generateAIResumeAnalysis(assessment.resumeText, jobDescription);
    const resumeRank = computeRank(aiReport?.total_score ?? 0, assessment.topSkills ?? []);

    assessment.analysisType = "ai";
    assessment.aiReport = aiReport;
    assessment.resumeRank = resumeRank;
    await assessment.save();

    return { status: "completed", assessmentId, total_score: aiReport?.total_score };
  },
  { connection: redisConnection, concurrency: 5 } // Process up to 5 resumes concurrently
);

worker.on("completed", (job) => {
  console.log(`[Batch] Job ${job.id} completed for assessment ${job.data.assessmentId}`);
});

worker.on("failed", (job, err) => {
  console.error(`[Batch] Job ${job?.id} failed for assessment ${job?.data.assessmentId}`, err);
});
