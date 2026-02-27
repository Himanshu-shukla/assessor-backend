import { QuestionBank } from "../models/QuestionBank";

export async function fetchQuestions(skill: string) {
  const beginner = await QuestionBank.aggregate([
    { $match: { skill, difficulty: "beginner" } },
    { $sample: { size: 2 } },
  ]);

  const intermediate = await QuestionBank.aggregate([
    { $match: { skill, difficulty: "intermediate" } },
    { $sample: { size: 3 } },
  ]);

  const advanced = await QuestionBank.aggregate([
    { $match: { skill, difficulty: "advanced" } },
    { $sample: { size: 2 } },
  ]);

  return [...beginner, ...intermediate, ...advanced];
}