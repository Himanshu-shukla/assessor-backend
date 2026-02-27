import mongoose, { Schema, Document } from "mongoose";

export interface ISkill extends Document {
  name: string;
  aliases: string[];
  category: string;
  weight: number;
  subtopics: string[];
}

const SkillSchema = new Schema<ISkill>({
  name: { type: String, required: true, unique: true },
  aliases: { type: [String], required: true },
  category: String,
  weight: { type: Number, default: 1 },
  subtopics: [String],
});

export const Skill = mongoose.model<ISkill>("Skill", SkillSchema);