"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchQuestions = fetchQuestions;
const QuestionBank_1 = require("../models/QuestionBank");
async function fetchQuestions(skill) {
    const beginner = await QuestionBank_1.QuestionBank.aggregate([
        { $match: { skill, difficulty: "beginner" } },
        { $sample: { size: 2 } },
    ]);
    const intermediate = await QuestionBank_1.QuestionBank.aggregate([
        { $match: { skill, difficulty: "intermediate" } },
        { $sample: { size: 3 } },
    ]);
    const advanced = await QuestionBank_1.QuestionBank.aggregate([
        { $match: { skill, difficulty: "advanced" } },
        { $sample: { size: 2 } },
    ]);
    return [...beginner, ...intermediate, ...advanced];
}
//# sourceMappingURL=question.service.js.map