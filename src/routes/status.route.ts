// routes/status.route.ts
import { FastifyInstance } from "fastify";
import { Assessment } from "../models/Assessment";

export default async function (fastify: FastifyInstance) {
  fastify.get("/status/:id", async (req: any, reply) => {
    const { id } = req.params;

    const assessment = await Assessment.findById(id);

    if (!assessment) {
      return reply.code(404).send({ error: "Assessment not found" });
    }

    return {
      status: assessment.status,
      ready: assessment.status === "ready",
    };
  });
}