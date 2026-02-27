import mongoose, { Schema, Document } from "mongoose";

export interface IAssessment extends Document {
  status: string;
  resumeText?: string;
  topSkills?: string[];
  score?: number;
  percentile?: number;
  swotAnalysis?: any;
  createdAt: Date;
}

const AssessmentSchema = new Schema<IAssessment>({
  status: { type: String, default: "uploading" },
  resumeText: String,
  topSkills: [String],
  score: Number,
  percentile: Number,
  swotAnalysis: Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now },
});

export const Assessment = mongoose.model<IAssessment>(
  "Assessment",
  AssessmentSchema
);