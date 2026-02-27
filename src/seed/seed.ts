import mongoose from "mongoose";
import dotenv from "dotenv";
import { Skill } from "../models/Skill";
import { QuestionBank } from "../models/QuestionBank";
import { skillsData } from "./skills.data";
import { questionsData } from "./questions.data";

dotenv.config();

async function seed() {
  try {
    await mongoose.connect(process.env.DATABASE_URL as string);
    console.log("✅ Connected to MongoDB");

    // ---- Clear Existing (Optional) ----
    await Skill.deleteMany({});
    await QuestionBank.deleteMany({});

    // ---- Insert Skills ----
    await Skill.insertMany(skillsData);
    console.log(`✅ Inserted ${skillsData.length} skills`);

    // ---- Insert Questions ----
    await QuestionBank.insertMany(questionsData);
    console.log(`✅ Inserted ${questionsData.length} questions`);

    console.log("🎉 Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

seed();