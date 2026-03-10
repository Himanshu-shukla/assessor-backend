import mongoose, { Schema, Document } from "mongoose";

export interface IAssessment extends Document {
  // New Lead Fields
  name: string;
  email: string;
  phone: string;

  sessionId?: string;

  // Existing Fields
  status: string;
  resumeText?: string;
  topSkills?: string[];
  analysisType?: "test" | "ai";
  score?: number;
  percentile?: number;
  swotAnalysis?: any;
  aiReport?: any;
  resumeRank?: {
    rank: number;
    total: number;
    percentile: number;
    profileKey: string;
  };
  battleWins?: number;
  battleLosses?: number;
  createdAt: Date;
}

const AssessmentSchema = new Schema<IAssessment>({
  // Lead Data stored directly in Assessment
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  phone: { type: String, default: "Not provided" },

  // Assessment Data
  status: { type: String, default: "uploading" },
  sessionId: { type: String, index: true },
  resumeText: String,
  topSkills: [String],
  score: Number,
  percentile: Number,
  swotAnalysis: Schema.Types.Mixed,
  analysisType: { type: String, enum: ["test", "ai"] },
  aiReport: Schema.Types.Mixed,
  resumeRank: Schema.Types.Mixed,
  battleWins: { type: Number, default: 0 },
  battleLosses: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

export const Assessment = mongoose.model<IAssessment>(
  "Assessment",
  AssessmentSchema
);