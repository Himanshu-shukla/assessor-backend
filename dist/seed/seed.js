"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const Skill_1 = require("../models/Skill");
const QuestionBank_1 = require("../models/QuestionBank");
const skills_data_1 = require("./skills.data");
const questions_data_1 = require("./questions.data");
dotenv_1.default.config();
async function seed() {
    try {
        await mongoose_1.default.connect(process.env.DATABASE_URL);
        console.log("✅ Connected to MongoDB");
        // ---- Clear Existing (Optional) ----
        await Skill_1.Skill.deleteMany({});
        await QuestionBank_1.QuestionBank.deleteMany({});
        // ---- Insert Skills ----
        await Skill_1.Skill.insertMany(skills_data_1.skillsData);
        console.log(`✅ Inserted ${skills_data_1.skillsData.length} skills`);
        // ---- Insert Questions ----
        await QuestionBank_1.QuestionBank.insertMany(questions_data_1.questionsData);
        console.log(`✅ Inserted ${questions_data_1.questionsData.length} questions`);
        console.log("🎉 Database seeded successfully!");
        process.exit(0);
    }
    catch (error) {
        console.error("❌ Seeding failed:", error);
        process.exit(1);
    }
}
seed();
//# sourceMappingURL=seed.js.map