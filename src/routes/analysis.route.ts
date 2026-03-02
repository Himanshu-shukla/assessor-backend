import { FastifyInstance } from "fastify";
import { Assessment } from "../models/Assessment";
import { generateAIResumeAnalysis } from "../services/aiAnalysis.service";

export default async function (fastify: FastifyInstance) {

  // 🔹 POST — Generate AI Report
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
        };
      }

      const aiReport = await generateAIResumeAnalysis(
        assessment.resumeText
      );

      assessment.analysisType = "ai";
      assessment.aiReport = aiReport;
      await assessment.save();

      return {
        message: "AI Analysis completed",
        report: aiReport,
      };

    } catch (error: any) {
      console.error("AI ERROR:", error);
      return reply.code(500).send({ error: "AI Analysis failed" });
    }
  });

  // 🔹 GET — Fetch Existing AI Report
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

      return {
        report: assessment.aiReport,
      };

    } catch (error: any) {
      console.error("FETCH ERROR:", error);
      return reply.code(500).send({ error: "Failed to fetch analysis" });
    }
  });

}