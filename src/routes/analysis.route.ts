import { FastifyInstance } from "fastify";
import { Assessment } from "../models/Assessment";
import { generateAIResumeAnalysis } from "../services/aiAnalysis.service";
import { computeRank } from "../services/ranking.service";

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

}