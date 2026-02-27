"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluateTest = evaluateTest;
const mongoose_1 = require("mongoose");
const AssessmentQuestion_1 = require("../models/AssessmentQuestion");
const Assessment_1 = require("../models/Assessment");
const math_1 = require("../utils/math");
async function evaluateTest(id, answers) {
    const questions = await AssessmentQuestion_1.AssessmentQuestion.find({
        assessmentId: new mongoose_1.Types.ObjectId(id),
    });
    let score = 0;
    // Properly typed record
    const subtopicStats = {};
    for (const q of questions) {
        const questionId = q._id.toString(); // FIX 1
        const isCorrect = answers[questionId] === q.correctOption;
        if (isCorrect)
            score += 2;
        const key = `${q.skill}-${q.subtopic}`;
        if (!subtopicStats[key]) {
            subtopicStats[key] = { total: 0, correct: 0 };
        }
        subtopicStats[key].total += 1;
        if (isCorrect) {
            subtopicStats[key].correct += 1;
        }
    }
    // Fetch previous scores
    const previousAssessments = await Assessment_1.Assessment.find({
        score: { $ne: null },
    }).select("score");
    const scores = previousAssessments
        .map((a) => a.score)
        .filter((s) => typeof s === "number");
    let percentile = 50;
    if (scores.length > 5) {
        const mean = scores.reduce((sum, val) => sum + val, 0) / scores.length;
        const variance = scores.reduce((sum, val) => sum + (val - mean) ** 2, 0) /
            scores.length;
        const stdDev = Math.sqrt(variance) || 1;
        const zScore = (score - mean) / stdDev;
        percentile =
            0.5 * (1 + (0, math_1.erf)(zScore / Math.sqrt(2))) * 100;
    }
    // Properly typed SWOT
    const swot = {
        strengths: [],
        weaknesses: [],
    };
    for (const [topic, stats] of Object.entries(subtopicStats)) {
        const accuracy = stats.correct / stats.total;
        if (accuracy >= 0.8) {
            swot.strengths.push(`Strong in ${topic}`);
        }
        else if (accuracy <= 0.4) {
            swot.weaknesses.push(`Weak in ${topic}`);
        }
    }
    await Assessment_1.Assessment.findByIdAndUpdate(id, {
        score,
        percentile: Math.round(percentile),
        swotAnalysis: swot,
        status: "completed",
    });
    return {
        score,
        percentile: Math.round(percentile),
        swot,
    };
}
//# sourceMappingURL=evaluation.service.js.map