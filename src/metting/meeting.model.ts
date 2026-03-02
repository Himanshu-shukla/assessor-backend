import mongoose, { Schema, Document, Model } from 'mongoose';

// --- Interface ---
export interface IMeeting extends Document {
  name: string;
  email: string;
  phone: string;
  title: string;
  description?: string;
  date: Date;
  startTime: string;
  endTime: string;
  duration?: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  meetingType: 'video' | 'phone' | 'in-person';
  timezone: string;
  ipAddress?: string;
  userAgent?: string;
  remindersSent: boolean;
  cancelledAt?: Date;
  cancellationReason?: string;
  adminNotes?: string;
  // Methods
  isOverlapping(otherMeeting: IMeeting): boolean;
}

// --- Schema ---
const meetingSchema = new Schema<IMeeting>({
  name: { type: String, required: [true, 'Name is required'], trim: true, index: true },
  email: { type: String, required: [true, 'Email is required'], lowercase: true, trim: true, index: true },
  phone: { type: String, required: [true, 'Phone number is required'], trim: true },
  title: { type: String, default: 'Consultation Meeting', trim: true },
  description: { type: String, trim: true, maxlength: 500 },
  date: { type: Date, required: [true, 'Date is required'], index: true },
  startTime: { 
    type: String, 
    required: [true, 'Start time is required'], 
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'] 
  },
  endTime: { 
    type: String, 
    required: [true, 'End time is required'], 
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'] 
  },
  duration: { type: Number, min: 15, max: 480 },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'cancelled', 'completed'], 
    default: 'pending', 
    index: true 
  },
  meetingType: { type: String, enum: ['video', 'phone', 'in-person'], default: 'video' },
  timezone: { type: String, default: 'UTC' },
  ipAddress: String,
  userAgent: String,
  remindersSent: { type: Boolean, default: false },
  cancelledAt: Date,
  cancellationReason: String,
  adminNotes: String
}, {
  timestamps: true
});

// --- Indexes ---
meetingSchema.index({ date: 1, startTime: 1 }, { unique: true });
meetingSchema.index({ email: 1, status: 1 });
meetingSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 });

// --- Middleware ---
meetingSchema.pre<IMeeting>('save', async function() {
    // Check if we need to recalculate duration
    if (this.isModified('startTime') || this.isModified('endTime')) {
      if (this.startTime && this.endTime) {
        const start = this.startTime.split(':').map(Number);
        const end = this.endTime.split(':').map(Number);
        
        // Use ! to satisfy TypeScript that index 0 and 1 exist
        let startMinutes = start[0]! * 60 + start[1]!;
        let endMinutes = end[0]! * 60 + end[1]!;
  
        // Handle meetings that wrap past midnight
        if (endMinutes < startMinutes) {
          endMinutes += 1440; // Add 24 hours in minutes
        }
        
        this.duration = endMinutes - startMinutes;
      }
    }
  });

// --- Instance Methods ---
meetingSchema.methods.isOverlapping = function(this: IMeeting, otherMeeting: IMeeting): boolean {
  return (
    this.date.getTime() === otherMeeting.date.getTime() &&
    this.startTime < otherMeeting.endTime &&
    this.endTime > otherMeeting.startTime
  );
};

// --- Static Methods ---
interface MeetingModel extends Model<IMeeting> {
  calculateEndTime(startTime: string, durationMinutes: number): string;
}

meetingSchema.statics.calculateEndTime = function(startTime: string, durationMinutes: number): string {
  const parts = startTime.split(':').map(Number);
  
  // Use ! for the static method array as well
  const hours = parts[0]!;
  const minutes = parts[1]!;
  
  const totalMinutes = hours * 60 + minutes + durationMinutes;
  
  const endHours = Math.floor((totalMinutes % 1440) / 60);
  const endMinutes = totalMinutes % 60;
  
  return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
};

// --- Model Export ---
export const Meeting = mongoose.model<IMeeting, MeetingModel>('Meeting', meetingSchema);