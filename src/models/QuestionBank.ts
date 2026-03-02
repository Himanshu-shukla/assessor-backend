import mongoose, { Schema, Document } from "mongoose";

export interface IQuestionBank extends Document {
  skill: string;
  subtopic: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  text: string;
  options: { id: string; text: string }[];
  correctOption: string;
}

const QuestionBankSchema = new Schema<IQuestionBank>({
  skill: { type: String, index: true },
  subtopic: String,
  difficulty: {
    type: String,
    enum: ["beginner", "intermediate", "advanced"],
  },
  text: String,
  options: Schema.Types.Mixed,
  correctOption: String,
});

export const QuestionBank = mongoose.model<IQuestionBank>(
  "QuestionBank",
  QuestionBankSchema
);