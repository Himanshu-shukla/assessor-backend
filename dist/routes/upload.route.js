"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const mongoose_1 = __importDefault(require("mongoose"));
const Assessment_1 = require("../models/Assessment");
const AssessmentQuestion_1 = require("../models/AssessmentQuestion");
const pdf_service_1 = require("../services/pdf.service");
const skill_service_1 = require("../services/skill.service");
const question_service_1 = require("../services/question.service");
async function default_1(fastify) {
    fastify.post("/upload", async (req, reply) => {
        try {
            const file = await req.file();
            if (!file) {
                return reply.code(400).send({ error: "No file uploaded" });
            }
            const buffer = await file.toBuffer();
            const resumeText = await (0, pdf_service_1.extractPdfText)(buffer);
            const topSkills = await (0, skill_service_1.extractTopSkills)(resumeText);
            const assessment = await Assessment_1.Assessment.create({
                resumeText,
                topSkills,
                status: "ready",
            });
            const assessmentQuestions = [];
            // 🔥 1. Deduplicate skills to prevent unnecessary duplicate queries
            const uniqueSkills = [...new Set(topSkills)];
            // 🔥 2. Create a Set to track questions we've already added
            const seenQuestionIds = new Set();
            for (const skill of uniqueSkills) {
                const questions = await (0, question_service_1.fetchQuestions)(skill);
                for (const q of questions) {
                    // 🔥 3. Check if we have already added this specific question
                    const questionBankId = q._id.toString();
                    if (seenQuestionIds.has(questionBankId)) {
                        continue; // Skip this question, it's a duplicate!
                    }
                    // Mark this question as seen
                    seenQuestionIds.add(questionBankId);
                    const cleanOptions = q.options?.map((opt) => {
                        const { _id, ...cleanOpt } = opt;
                        return cleanOpt;
                    }) || [];
                    assessmentQuestions.push({
                        _id: new mongoose_1.default.Types.ObjectId(), // Keep forcing a fresh ID for safety
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
                await AssessmentQuestion_1.AssessmentQuestion.insertMany(assessmentQuestions);
            }
            return {
                assessmentId: assessment._id,
                totalQuestions: assessmentQuestions.length,
            };
        }
        catch (error) {
            console.error("UPLOAD ERROR:", error);
            return reply.code(500).send({ error: "Upload failed", details: error.message });
        }
    });
}
//# sourceMappingURL=upload.route.js.map