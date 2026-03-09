import mongoose from "mongoose";
import { FastifyInstance } from "fastify";
import { Assessment } from "../models/Assessment";
import { AssessmentQuestion } from "../models/AssessmentQuestion";
import { fetchQuestions } from "../services/question.service";
import { evaluateTest } from "../services/evaluation.service";

export default async function (fastify: FastifyInstance) {

  // GET /test/:id/questions — lazy-generate questions on first access
  fastify.get("/test/:id/questions", async (req: any, reply) => {
    const { id } = req.params;

    // Fast path: questions already exist
    const existing = await AssessmentQuestion.find({ assessmentId: id }).select(
      "_id skill subtopic difficulty text options"
    );
    if (existing.length > 0) return existing;

    // Lazy generation: create questions now (first time test is accessed)
    const assessment = await Assessment.findById(id);
    if (!assessment) {
      return reply.code(404).send({ error: "Assessment not found" });
    }

    const topSkills = assessment.topSkills ?? [];
    if (topSkills.length === 0) {
      return reply.code(400).send({ error: "No skills found to generate questions." });
    }

    const assessmentQuestions: any[] = [];
    const uniqueSkills = [...new Set(topSkills)];
    const seenQuestionIds = new Set<string>();

    for (const skill of uniqueSkills) {
      const questions = await fetchQuestions(skill);
      for (const q of questions) {
        const questionBankId = q._id.toString();
        if (seenQuestionIds.has(questionBankId)) continue;
        seenQuestionIds.add(questionBankId);

        const cleanOptions = q.options?.map((opt: any) => {
          const { _id, ...cleanOpt } = opt;
          return cleanOpt;
        }) || [];

        assessmentQuestions.push({
          _id: new mongoose.Types.ObjectId(),
          assessmentId: assessment._id,
          skill: q.skill,
          subtopic: q.subtopic,
          difficulty: q.difficulty,
          text: q.text,
          options: cleanOptions,
          correctOption: q.correctOption,
        });
      }
    }

    if (assessmentQuestions.length === 0) {
      return reply.code(404).send({ error: "No questions available for your skill set." });
    }

    await AssessmentQuestion.insertMany(assessmentQuestions);

    return AssessmentQuestion.find({ assessmentId: id }).select(
      "_id skill subtopic difficulty text options"
    );
  });

  // POST /test/:id/submit
  fastify.post("/test/:id/submit", async (req: any) => {
    return evaluateTest(req.params.id, req.body.answers);
  });
}