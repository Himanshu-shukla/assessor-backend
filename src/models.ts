import mongoose, { Schema, Document, Types } from 'mongoose';

// --- Database Connection ---
export const connectDB = async () => {
  try {
    if (mongoose.connection.readyState >= 1) return;
    await mongoose.connect(process.env.DATABASE_URL as string);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// --- Interfaces ---
export interface IAssessment extends Document {
  status: string;
  resumeText?: string;
  extractedStack?: Record<string, any>;
  swotAnalysis?: Record<string, any>;
  score?: number;
  percentile?: number;
  createdAt: Date;
}

export interface IQuestion extends Document {
  assessmentId: Types.ObjectId;
  skill: string;
  text: string;
  options: any[]; 
  correctOption: string;
  userAnswer?: string;
}

// --- Schemas ---
const AssessmentSchema = new Schema<IAssessment>({
  status: { type: String, default: 'uploading' },
  resumeText: { type: String },
  extractedStack: { type: Schema.Types.Mixed }, 
  swotAnalysis: { type: Schema.Types.Mixed },   
  score: { type: Number },
  percentile: { type: Number },
  createdAt: { type: Date, default: Date.now }
});

const QuestionSchema = new Schema<IQuestion>({
  assessmentId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Assessment', 
    required: true 
  },
  skill: { type: String, required: true },
  text: { type: String, required: true },
  options: { type: Schema.Types.Mixed, required: true }, 
  correctOption: { type: String, required: true },
  userAnswer: { type: String }
});

// --- Models ---
export const Assessment = mongoose.model<IAssessment>('Assessment', AssessmentSchema);
export const Question = mongoose.model<IQuestion>('Question', QuestionSchema);