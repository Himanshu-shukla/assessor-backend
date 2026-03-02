import mongoose, { Schema, Document, Types } from "mongoose";

export interface IAssessmentQuestion extends Document {
  assessmentId: Types.ObjectId;
  skill: string;
  subtopic: string;
  difficulty: string;
  text: string;
  options: any[];
  correctOption: string;
  userAnswer?: string;
}

const SchemaDef = new Schema<IAssessmentQuestion>({
  assessmentId: { type: Schema.Types.ObjectId, ref: "Assessment" },
  skill: String,
  subtopic: String,
  difficulty: String,
  text: String,
  options: Schema.Types.Mixed,
  correctOption: String,
  userAnswer: String,
});

SchemaDef.index(
  { assessmentId: 1, text: 1 },
  { unique: true }
);

export const AssessmentQuestion = mongoose.model<IAssessmentQuestion>(
  "AssessmentQuestion",
  SchemaDef
);