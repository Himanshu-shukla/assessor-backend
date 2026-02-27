import mongoose from "mongoose";
import { FastifyInstance } from "fastify";
import { Assessment } from "../models/Assessment";
import { AssessmentQuestion } from "../models/AssessmentQuestion";
import { extractPdfText } from "../services/pdf.service";
import { extractTopSkills } from "../services/skill.service";
import { fetchQuestions } from "../services/question.service";

export default async function (fastify: FastifyInstance) {
  fastify.post("/upload", async (req: any, reply) => {
    try {
      const file = await req.file();
      if (!file) {
        return reply.code(400).send({ error: "No file uploaded" });
      }

      const buffer = await file.toBuffer();
      const resumeText = await extractPdfText(buffer);
      const topSkills = await extractTopSkills(resumeText);

      const assessment = await Assessment.create({
        resumeText,
        topSkills,
        status: "ready",
      });

      const assessmentQuestions = [];
      
      // 🔥 1. Deduplicate skills to prevent unnecessary duplicate queries
      const uniqueSkills = [...new Set(topSkills)];
      
      // 🔥 2. Create a Set to track questions we've already added
      const seenQuestionIds = new Set<string>();

      for (const skill of uniqueSkills) {
        const questions = await fetchQuestions(skill);

        for (const q of questions) {
          // 🔥 3. Check if we have already added this specific question
          const questionBankId = q._id.toString();
          if (seenQuestionIds.has(questionBankId)) {
            continue; // Skip this question, it's a duplicate!
          }
          
          // Mark this question as seen
          seenQuestionIds.add(questionBankId);

          const cleanOptions = q.options?.map((opt: any) => {
            const { _id, ...cleanOpt } = opt;
            return cleanOpt;
          }) || [];

          assessmentQuestions.push({
            _id: new mongoose.Types.ObjectId(), // Keep forcing a fresh ID for safety
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

      if (assessmentQuestions.length > 0) {
        await AssessmentQuestion.insertMany(assessmentQuestions);
      }

      return {
        assessmentId: assessment._id,
        totalQuestions: assessmentQuestions.length,
      };

    } catch (error: any) {
      console.error("UPLOAD ERROR:", error);
      return reply.code(500).send({ error: "Upload failed", details: error.message });
    }
  });
}