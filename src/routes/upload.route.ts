import mongoose from "mongoose";
import { FastifyInstance } from "fastify";
import { Assessment } from "../models/Assessment";
import { AssessmentQuestion } from "../models/AssessmentQuestion";
import { extractPdfText } from "../services/pdf.service";
import { extractTopSkills } from "../services/skill.service";
import { fetchQuestions } from "../services/question.service";

/**
 * Helper to extract basic lead info from resume text
 */
async function extractLeadDetails(text: string) {
  if (!text) {
    return { name: "Unknown", email: "Not found", phone: "Not found" };
  }

  const cleanText = text.replace(/\s+/g, ' ').trim();

  const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi;
  const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
  
  const emailMatch = cleanText.match(emailRegex);
  const phoneMatch = cleanText.match(phoneRegex);
  
  // Safe extraction for the name (usually first line)
  const nameGuess = text.split('\n')[0]?.trim()?.substring(0, 50) ?? "Unknown Candidate";

  return {
    name: nameGuess,
    email: emailMatch ? emailMatch[0] : "Not found",
    phone: phoneMatch ? phoneMatch[0] : "Not found"
  };
}

export default async function (fastify: FastifyInstance) {
  fastify.post("/upload", async (req: any, reply) => {
    try {
      const file = await req.file();
      if (!file) {
        return reply.code(400).send({ error: "No file uploaded" });
      }

      const buffer = await file.toBuffer();
      const resumeText = await extractPdfText(buffer);
      
      // 1. Extract Lead details from the text
      const { name, email, phone } = await extractLeadDetails(resumeText);
      
      // 2. Extract skills
      const topSkills = await extractTopSkills(resumeText);

      // 3. Create Assessment with all data (Lead info + Skills)
      const assessment = await Assessment.create({
        name,
        email,
        phone,
        resumeText,
        topSkills,
        status: "ready",
      });

      const assessmentQuestions = [];
      
      // Deduplicate skills to prevent unnecessary duplicate queries
      const uniqueSkills = [...new Set(topSkills)];
      
      // Create a Set to track questions we've already added
      const seenQuestionIds = new Set<string>();

      for (const skill of uniqueSkills) {
        const questions = await fetchQuestions(skill);

        for (const q of questions) {
          // Check if we have already added this specific question
          const questionBankId = q._id.toString();
          if (seenQuestionIds.has(questionBankId)) {
            continue; 
          }
          
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

      if (assessmentQuestions.length > 0) {
        await AssessmentQuestion.insertMany(assessmentQuestions);
      }

      return {
        assessmentId: assessment._id,
        candidateName: name,
        totalQuestions: assessmentQuestions.length,
      };

    } catch (error: any) {
      console.error("UPLOAD ERROR:", error);
      return reply.code(500).send({ error: "Upload failed", details: error.message });
    }
  });
}