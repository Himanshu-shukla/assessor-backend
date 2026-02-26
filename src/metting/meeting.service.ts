import { IMeeting, Meeting } from "./meeting.model.js";


interface CreateMeetingData {
  name: string;
  email: string;
  phone: string;
  title?: string;
  description?: string;
  date: Date | string;
  startTime: string;
  endTime: string;
  meetingType?: 'video' | 'phone' | 'in-person';
  timezone?: string;
}

interface Metadata {
  ipAddress?: string;
  userAgent?: string;
}

interface AvailableSlot {
  startTime: string;
  endTime: string;
  available: boolean;
}

class MeetingService {
  /**
   * Get available slots for a specific date
   */
  async getAvailableSlots(date: Date | string, duration: number = 60): Promise<AvailableSlot[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    const bookedMeetings = await Meeting.find({
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $ne: 'cancelled' }
    }).select('startTime endTime').lean();
    
    // Generate available slots (9 AM to 5 PM)
    const availableSlots: AvailableSlot[] = [];
    const workingHours = { start: 9, end: 17 };
    
    for (let hour = workingHours.start; hour < workingHours.end; hour++) {
      for (let minute = 0; minute < 60; minute += duration) {
        const slotStart = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const slotEnd = Meeting.calculateEndTime(slotStart, duration);
        
        // Check if slot is available
        const isBooked = bookedMeetings.some(meeting => 
          slotStart < meeting.endTime && slotEnd > meeting.startTime
        );
        
        if (!isBooked) {
          availableSlots.push({
            startTime: slotStart,
            endTime: slotEnd,
            available: true
          });
        }
      }
    }
    
    return availableSlots;
  }

  /**
   * Create a new meeting booking
   */
  async createMeeting(data: CreateMeetingData, metadata: Metadata = {}): Promise<Partial<IMeeting>> {
    const meetingDate = new Date(data.date);
    meetingDate.setHours(0, 0, 0, 0);
    
    // Check if slot is already booked
    const existingMeeting = await Meeting.findOne({
      date: meetingDate,
      startTime: data.startTime,
      status: { $ne: 'cancelled' }
    });
    
    if (existingMeeting) {
      throw new Error('This time slot is already booked');
    }
    
    // Create meeting
    const meeting = new Meeting({
      ...data,
      date: meetingDate,
      ipAddress: metadata.ipAddress,
      userAgent: metadata.userAgent,
      title: data.title || 'Consultation Meeting',
      meetingType: data.meetingType || 'video',
      timezone: data.timezone || 'UTC'
    });
    
    await meeting.save();
    
    // Return sanitized meeting
    return this.sanitizeMeeting(meeting.toObject());
  }

  /**
   * Get meeting by ID
   */
  async getMeetingById(id: string): Promise<Partial<IMeeting>> {
    const meeting = await Meeting.findById(id).lean();
    if (!meeting) {
      throw new Error('Meeting not found');
    }
    return this.sanitizeMeeting(meeting);
  }

  /**
   * Get user's meetings by email
   */
  async getUserMeetings(email: string, status?: string): Promise<Partial<IMeeting>[]> {
    const query: any = { email: email.toLowerCase() };
    if (status) {
      query.status = status;
    }
    
    const meetings = await Meeting.find(query)
      .sort({ date: -1, startTime: -1 })
      .lean();
    
    return meetings.map(meeting => this.sanitizeMeeting(meeting));
  }

  /**
   * Cancel a meeting
   */
  async cancelMeeting(id: string, reason: string = ''): Promise<Partial<IMeeting>> {
    const meeting = await Meeting.findByIdAndUpdate(
      id,
      {
        status: 'cancelled',
        cancelledAt: new Date(),
        cancellationReason: reason
      },
      { new: true }
    ).lean();
    
    if (!meeting) {
      throw new Error('Meeting not found');
    }
    
    return this.sanitizeMeeting(meeting);
  }

  /**
   * Update meeting status
   */
  async updateMeetingStatus(id: string, status: IMeeting['status']): Promise<Partial<IMeeting>> {
    const meeting = await Meeting.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).lean();
    
    if (!meeting) {
      throw new Error('Meeting not found');
    }
    
    return this.sanitizeMeeting(meeting);
  }

  /**
   * Check if a time slot is available
   */
  async isTimeSlotAvailable(date: Date | string, startTime: string, endTime: string): Promise<boolean> {
    const meetingDate = new Date(date);
    meetingDate.setHours(0, 0, 0, 0);
    
    const existingMeeting = await Meeting.findOne({
      date: meetingDate,
      status: { $ne: 'cancelled' },
      $or: [
        {
          startTime: { $lt: endTime },
          endTime: { $gt: startTime }
        }
      ]
    });
    
    return !existingMeeting;
  }

  /**
   * Get upcoming meetings
   */
  async getUpcomingMeetings(days: number = 7): Promise<Partial<IMeeting>[]> {
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);
    endDate.setHours(23, 59, 59, 999);
    
    const meetings = await Meeting.find({
      date: { $gte: startDate, $lte: endDate },
      status: { $in: ['pending', 'confirmed'] }
    })
      .sort({ date: 1, startTime: 1 })
      .lean();
    
    return meetings.map(meeting => this.sanitizeMeeting(meeting));
  }

  /**
   * Get meeting statistics
   */
  async getMeetingStats(startDate: Date, endDate: Date): Promise<any[]> {
    const stats = await Meeting.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startDate,
            $lte: endDate
          }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalDuration: { $sum: '$duration' }
        }
      }
    ]);
    
    return stats;
  }

  /**
   * Sanitize meeting object (remove sensitive data)
   */
  private sanitizeMeeting(meeting: any): Partial<IMeeting> {
    const sanitized = { ...meeting };
    
    // Remove sensitive/internal fields
    delete sanitized.ipAddress;
    delete sanitized.userAgent;
    delete sanitized.adminNotes;
    delete sanitized.__v;
    
    // Format date
    if (sanitized.date) {
      sanitized.date = new Date(sanitized.date).toISOString().split('T')[0] as any;
    }
    
    return sanitized;
  }
}

export default new MeetingService();