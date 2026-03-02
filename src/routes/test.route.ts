import { FastifyInstance } from "fastify";
import { AssessmentQuestion } from "../models/AssessmentQuestion";
import { evaluateTest } from "../services/evaluation.service";

export default async function (fastify: FastifyInstance) {
  fastify.get("/test/:id/questions", async (req: any) => {
    return AssessmentQuestion.find({ assessmentId: req.params.id }).select(
      "_id skill subtopic difficulty text options"
    );
  });

  fastify.post("/test/:id/submit", async (req: any) => {
    return evaluateTest(req.params.id, req.body.answers);
  });
}