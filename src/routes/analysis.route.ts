import { FastifyInstance } from "fastify";
import { Assessment } from "../models/Assessment";
import { generateAIResumeAnalysis } from "../services/aiAnalysis.service";
import { computeRank } from "../services/ranking.service";
import { batchAnalysisQueue, enqueueBulkAssessments } from "../services/aiBatch.service";

export default async function (fastify: FastifyInstance) {

  // 🔹 POST — Generate AI Report + Compute Rank
  fastify.post("/analysis/:id", async (req: any, reply) => {
    try {
      const { id } = req.params;

      const assessment = await Assessment.findById(id);

      if (!assessment) {
        return reply.code(404).send({ error: "Assessment not found" });
      }

      if (!assessment.resumeText) {
        return reply.code(400).send({ error: "Resume text missing" });
      }

      // Prevent regenerating if already exists
      if (assessment.aiReport) {
        return {
          message: "AI report already exists",
          report: assessment.aiReport,
          resumeRank: assessment.resumeRank,
        };
      }

      const aiReport = await generateAIResumeAnalysis(
        assessment.resumeText
      );

      // Compute probability-based rank from AI total_score
      const resumeRank = computeRank(
        aiReport?.total_score ?? 0,
        assessment.topSkills ?? []
      );

      assessment.analysisType = "ai";
      assessment.aiReport = aiReport;
      assessment.resumeRank = resumeRank;
      await assessment.save();

      return {
        message: "AI Analysis completed",
        report: aiReport,
        resumeRank,
      };

    } catch (error: any) {
      console.error("AI ERROR:", error);
      return reply.code(500).send({ error: "AI Analysis failed" });
    }
  });

  // 🔹 GET — Fetch Existing AI Report + Rank
  fastify.get("/analysis/:id", async (req: any, reply) => {
    try {
      const { id } = req.params;

      const assessment = await Assessment.findById(id);

      if (!assessment) {
        return reply.code(404).send({ error: "Assessment not found" });
      }

      if (!assessment.aiReport) {
        return reply.code(404).send({ error: "AI report not generated yet" });
      }

      // Re-compute rank on-the-fly if it was never persisted (for old records)
      const resumeRank =
        assessment.resumeRank ??
        computeRank(
          (assessment.aiReport as any)?.total_score ?? 0,
          assessment.topSkills ?? []
        );

      return {
        report: assessment.aiReport,
        resumeRank,
      };

    } catch (error: any) {
      console.error("FETCH ERROR:", error);
      return reply.code(500).send({ error: "Failed to fetch analysis" });
    }
  });

  // 🔹 GET — Fetch 2 Random Resumes for Battle
  fastify.get("/analysis/battle/matchup", async (req: any, reply) => {
    try {
      // Find 2 random assessments that already have an AI Report
      const candidates = await Assessment.aggregate([
        { $match: { aiReport: { $exists: true } } },
        { $sample: { size: 2 } },
        { $project: { _id: 1, name: 1, topSkills: 1, aiReport: 1, battleWins: 1, battleLosses: 1 } }
      ]);

      if (candidates.length < 2) {
        return reply.code(400).send({ error: "Not enough analyzed resumes to battle." });
      }

      return reply.send({ candidates });
    } catch (error: any) {
      console.error("BATTLE MATCHUP ERROR:", error);
      return reply.code(500).send({ error: "Failed to fetch matchup" });
    }
  });

  // 🔹 POST — Record Battle Vote
  fastify.post("/analysis/battle/vote", async (req: any, reply) => {
    try {
      const { winnerId, loserId } = req.body as { winnerId: string, loserId: string };

      if (!winnerId || !loserId) {
        return reply.code(400).send({ error: "Missing winner or loser ID" });
      }

      await Promise.all([
        Assessment.findByIdAndUpdate(winnerId, { $inc: { battleWins: 1 } }),
        Assessment.findByIdAndUpdate(loserId, { $inc: { battleLosses: 1 } })
      ]);

      return reply.send({ message: "Vote recorded successfully" });
    } catch (error: any) {
      console.error("BATTLE VOTE ERROR:", error);
      return reply.code(500).send({ error: "Failed to record vote" });
    }
  });

  // 🔹 POST — Submit Batch Analysis
  fastify.post("/analysis/batch", async (req: any, reply) => {
    try {
      const { assessmentIds, jobDescription } = req.body as { assessmentIds: string[], jobDescription?: string };

      if (!assessmentIds || !Array.isArray(assessmentIds)) {
        return reply.code(400).send({ error: "Invalid payload. Expected assessmentIds array." });
      }

      // Fetch ONLY what is needed, lean() for speed
      const assessmentsToProcess = await Assessment.find({
        _id: { $in: assessmentIds },
        aiReport: { $exists: false }
      })
      .select('_id resumeText topSkills')
      .lean();

      if (assessmentsToProcess.length === 0) {
        return reply.send({ message: "No assessments needed processing.", jobIds: [] });
      }

      await enqueueBulkAssessments(assessmentsToProcess, jobDescription);

      return reply.send({ 
        message: "Batch analysis started", 
        jobIds: assessmentsToProcess.map((a: any) => `assessment-${a._id}`) 
      });
    } catch (error: any) {
      console.error("BATCH ERROR:", error);
      return reply.code(500).send({ error: "Batch submission failed" });
    }
  });

  // 🔹 POST — Get Batch Job Statuses
  fastify.post("/analysis/batch/status", async (req: any, reply) => {
    try {
      const { jobIds } = req.body as { jobIds: string[] };

      if (!jobIds || !Array.isArray(jobIds)) {
        return reply.code(400).send({ error: "Invalid payload. Expected jobIds array." });
      }

      const statuses = await Promise.all(
        jobIds.map(async (id) => {
          const job = await batchAnalysisQueue.getJob(id);
          if (!job) return { id, state: "not-found" };
          const state = await job.getState();
          const result = job.returnvalue;
          return { id, state, result };
        })
      );

      return { statuses };
    } catch (error: any) {
      console.error("BATCH STATUS ERROR:", error);
      return reply.code(500).send({ error: "Status check failed" });
    }
  });

}