import { Types } from "mongoose";
import { AssessmentQuestion } from "../models/AssessmentQuestion";
import { Assessment } from "../models/Assessment";

interface SubtopicStat { total: number; correct: number; }
interface SWOT { strengths: string[]; weaknesses: string[]; }

// Math optimization: Pre-calculate constants for the Error Function
function erf(x: number): number {
  const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741, a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
  const sign = x < 0 ? -1 : 1;
  const absX = Math.abs(x);
  const t = 1.0 / (1.0 + p * absX);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-absX * absX);
  return sign * y;
}

export async function evaluateTest(id: string, answers: Record<string, string>) {
  const assessmentId = new Types.ObjectId(id);

  // OPTIMIZATION 1: Fetch all questions and historical stats in parallel
  const [questions, statsData] = await Promise.all([
    AssessmentQuestion.find({ assessmentId }).lean(),
    Assessment.aggregate([
      { $match: { score: { $ne: null }, _id: { $ne: assessmentId } } },
      { $group: { 
          _id: null, 
          scores: { $push: "$score" },
          avgScore: { $avg: "$score" },
          count: { $sum: 1 }
      }}
    ])
  ]);

  let earnedScore = 0;
  let maxPossibleScore = 0;
  const subtopicStats: Record<string, SubtopicStat> = {};
  const weights: Record<string, number> = { easy: 1, medium: 2, hard: 3 };
  const bulkOps = [];

  // OPTIMIZATION 2: Single loop for scoring and preparing bulk updates
  for (const q of questions) {
    const userAnswer = answers[q._id.toString()] || "";
    const isCorrect = userAnswer === q.correctOption;
    const weight = weights[(q.difficulty || "medium").toLowerCase()] || 2;
    
    maxPossibleScore += weight;
    if (isCorrect) earnedScore += weight;

    const key = `${q.skill}: ${q.subtopic}`;
    if (!subtopicStats[key]) subtopicStats[key] = { total: 0, correct: 0 };
    
    const s = subtopicStats[key]!;
    s.total++;
    if (isCorrect) s.correct++;

    bulkOps.push({
      updateOne: { filter: { _id: q._id }, update: { $set: { userAnswer } } }
    });
  }

  // OPTIMIZATION 3: Calculate Percentile using Aggregated Math
  let percentile = 50;
  if (statsData.length > 0 && statsData[0].count >= 5) {
    const { scores, avgScore } = statsData[0];
    const variance = scores.reduce((a: number, b: number) => a + Math.pow(b - avgScore, 2), 0) / scores.length;
    const stdDev = Math.sqrt(variance) || 1;
    percentile = 0.5 * (1 + erf((earnedScore - avgScore) / (stdDev * Math.sqrt(2)))) * 100;
  }

  const swot: SWOT = { strengths: [], weaknesses: [] };
  for (const [topic, s] of Object.entries(subtopicStats)) {
    const acc = s.correct / s.total;
    if (acc >= 0.75) swot.strengths.push(topic);
    else if (acc <= 0.45) swot.weaknesses.push(topic);
  }

  const roundedPercentile = Math.min(Math.max(Math.round(percentile), 1), 99);

  // OPTIMIZATION 4: Fire and forget bulk updates if possible, or await final state
  await Promise.all([
    bulkOps.length > 0 ? AssessmentQuestion.bulkWrite(bulkOps, { ordered: false }) : Promise.resolve(),
    Assessment.findByIdAndUpdate(id, {
      score: earnedScore,
      percentile: roundedPercentile,
      swotAnalysis: swot,
      status: "completed",
      completedAt: new Date()
    })
  ]);

  return {
    score: earnedScore,
    maxScore: maxPossibleScore,
    percentage: Math.round((earnedScore / maxPossibleScore) * 100),
    percentile: roundedPercentile,
    swot
  };
}