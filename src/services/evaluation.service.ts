import { Types } from "mongoose";
import { AssessmentQuestion } from "../models/AssessmentQuestion";
import { Assessment } from "../models/Assessment";

interface SubtopicStat {
  total: number;
  correct: number;
}

interface SWOT {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

/* -------------------------------------------------------
   Error Function (for percentile calculation)
------------------------------------------------------- */
function erf(x: number): number {
  const a1 = 0.254829592,
    a2 = -0.284496736,
    a3 = 1.421413741,
    a4 = -1.453152027,
    a5 = 1.061405429,
    p = 0.3275911;

  const sign = x < 0 ? -1 : 1;
  const absX = Math.abs(x);
  const t = 1.0 / (1.0 + p * absX);

  const y =
    1.0 -
    (((((a5 * t + a4) * t + a3) * t + a2) * t + a1) *
      t *
      Math.exp(-absX * absX));

  return sign * y;
}

/* -------------------------------------------------------
   MAIN EVALUATION FUNCTION
------------------------------------------------------- */
export async function evaluateTest(
  id: string,
  answers: Record<string, string>
) {
  const assessmentId = new Types.ObjectId(id);

  /* -------------------------------------------------------
     1️⃣ Fetch Questions + Historical Scores
  ------------------------------------------------------- */
  const [questions, statsData] = await Promise.all([
    AssessmentQuestion.find({ assessmentId }).lean(),
    Assessment.aggregate([
      {
        $match: {
          score: { $ne: null },
          _id: { $ne: assessmentId },
        },
      },
      {
        $group: {
          _id: null,
          scores: { $push: "$score" },
          avgScore: { $avg: "$score" },
          count: { $sum: 1 },
        },
      },
    ]),
  ]);

  if (!questions.length) {
    throw new Error("No questions found for this assessment.");
  }

  let earnedScore = 0;
  let maxPossibleScore = 0;

  const subtopicStats: Record<string, SubtopicStat> = {};
  const weights: Record<string, number> = {
    easy: 1,
    medium: 2,
    hard: 3,
    beginner: 1,
    intermediate: 2,
    advanced: 3,
  };

  const bulkOps = [];

  /* -------------------------------------------------------
     2️⃣ Score Calculation + Subtopic Aggregation
  ------------------------------------------------------- */
  for (const q of questions) {
    const userAnswer = answers[q._id.toString()] || "";
    const isCorrect = userAnswer === q.correctOption;

    const difficulty = (q.difficulty || "medium").toLowerCase();
    const weight = weights[difficulty] || 2;

    maxPossibleScore += weight;
    if (isCorrect) earnedScore += weight;

    const key = `${q.skill}: ${q.subtopic}`;

    if (!subtopicStats[key]) {
      subtopicStats[key] = { total: 0, correct: 0 };
    }

    subtopicStats[key].total++;
    if (isCorrect) subtopicStats[key].correct++;

    bulkOps.push({
      updateOne: {
        filter: { _id: q._id },
        update: { $set: { userAnswer } },
      },
    });
  }

  const percentage =
    maxPossibleScore === 0
      ? 0
      : Math.round((earnedScore / maxPossibleScore) * 100);

  /* -------------------------------------------------------
     3️⃣ Percentile Calculation
  ------------------------------------------------------- */
  let percentile = 50;

  if (statsData.length > 0 && statsData[0].count >= 5) {
    const { scores, avgScore } = statsData[0];

    const variance =
      scores.reduce(
        (sum: number, score: number) =>
          sum + Math.pow(score - avgScore, 2),
        0
      ) / scores.length;

    const stdDev = Math.sqrt(variance) || 1;

    percentile =
      0.5 *
      (1 +
        erf(
          (earnedScore - avgScore) /
            (stdDev * Math.sqrt(2))
        )) *
      100;
  }

  const roundedPercentile = Math.min(
    Math.max(Math.round(percentile), 1),
    99
  );

  /* -------------------------------------------------------
     4️⃣ SWOT Generation
  ------------------------------------------------------- */
  const swot: SWOT = {
    strengths: [],
    weaknesses: [],
    opportunities: [],
    threats: [],
  };

  for (const [topic, stat] of Object.entries(subtopicStats)) {
    const accuracy = stat.correct / stat.total;

    if (accuracy >= 0.75) {
      swot.strengths.push(topic);
    } else if (accuracy <= 0.45) {
      swot.weaknesses.push(topic);
    } else {
      swot.opportunities.push(topic);
    }
  }

  // Threat logic (business-based)
  if (swot.weaknesses.length >= 3) {
    swot.threats.push(
      "Multiple core areas require immediate improvement."
    );
  }

  if (percentage < 40) {
    swot.threats.push(
      "Overall performance below industry average."
    );
  }

  /* -------------------------------------------------------
     5️⃣ Save Results to Database
  ------------------------------------------------------- */
  await Promise.all([
    bulkOps.length > 0
      ? AssessmentQuestion.bulkWrite(bulkOps, { ordered: false })
      : Promise.resolve(),

    Assessment.findByIdAndUpdate(id, {
      score: earnedScore,
      percentile: roundedPercentile,
      swotAnalysis: swot,
      status: "completed",
      completedAt: new Date(),
    }),
  ]);

  /* -------------------------------------------------------
     6️⃣ Return Frontend-Ready Structure
  ------------------------------------------------------- */
  return {
    score: earnedScore,
    maxScore: maxPossibleScore,
    percentage,
    percentile: roundedPercentile,
    swotAnalysis: swot,
  };
}