import { FastifyInstance } from "fastify";
import { Assessment } from "../models/Assessment";
import { extractPdfText } from "../services/pdf.service";
import { extractTopSkills } from "../services/skill.service";

/**
 * Helper to extract basic lead info from resume text
 */
async function extractLeadDetails(text: string) {
  if (!text) {
    return { name: "Unknown", email: "Not found", phone: "Not found" };
  }

  const cleanText = text.replace(/\s+/g, ' ').trim();

  const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi;
  const phoneRegex = /(\+?\d{1,3}[-.\\s]?)?\(?\d{3}\)?[-.\\s]?\d{3}[-.\\s]?\d{4}/g;

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

      if (!topSkills || topSkills.length === 0) {
        return reply.code(400).send({ error: "No technical skills could be detected. Please upload a valid resume." });
      }

      // 3. Create Assessment with all data (Lead info + Skills)
      const sessionId = (req.headers["x-session-id"] as string) || undefined;
      const assessment = await Assessment.create({
        name,
        email,
        phone,
        resumeText,
        topSkills,
        sessionId,
        status: "ready",
      });

      return {
        assessmentId: assessment._id,
        candidateName: name,
      };

    } catch (error: any) {
      console.error("UPLOAD ERROR:", error);
      return reply.code(500).send({ error: "Upload failed", details: error.message });
    }
  });
}