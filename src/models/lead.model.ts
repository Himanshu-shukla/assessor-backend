import mongoose, { Schema, Document } from 'mongoose';

export interface ILead extends Document {
  name: string;
  email: string;
  phone: string;
  resumeText?: string;
  createdAt: Date;
}

const LeadSchema: Schema = new Schema({
  name: { 
    type: String, 
    required: true,
    trim: true 
  },
  email: { 
    type: String, 
    required: true, 
    lowercase: true,
    trim: true,
    // Indexing email is highly recommended for searching candidates
    index: true 
  },
  phone: { 
    type: String, 
    default: "Not provided" 
  },
//   resumeText: { 
//     type: String 
//   },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Create the model
const Lead = mongoose.model<ILead>('Lead', LeadSchema);

export default Lead;