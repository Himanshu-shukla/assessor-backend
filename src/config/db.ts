import mongoose from "mongoose";

export const connectDB = async () => {
  await mongoose.connect(process.env.DATABASE_URL as string);
  console.log("✅ MongoDB Connected");
};