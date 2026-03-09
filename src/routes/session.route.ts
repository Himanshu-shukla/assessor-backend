import { FastifyInstance } from "fastify";
import { Assessment } from "../models/Assessment";

export default async function (fastify: FastifyInstance) {
  // GET /session/:sessionId — return all assessments for this session
  fastify.get("/session/:sessionId", async (req: any, reply) => {
    const { sessionId } = req.params;
    if (!sessionId) return reply.code(400).send({ error: "Session ID required" });

    const assessments = await Assessment.find({ sessionId })
      .select("_id name status resumeRank aiReport createdAt topSkills")
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    return {
      sessionId,
      assessments: assessments.map((a: any) => ({
        id: a._id,
        name: a.name,
        status: a.status,
        hasAnalysis: !!a.aiReport,
        resumeRank: a.resumeRank ?? null,
        topSkills: (a.topSkills ?? []).slice(0, 3),
        createdAt: a.createdAt,
      })),
    };
  });
}
