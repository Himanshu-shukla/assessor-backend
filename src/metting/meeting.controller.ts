import { FastifyRequest, FastifyReply } from 'fastify';
import meetingService from './meeting.service.js';
import { validateMeetingInput } from './utills/meetingValidation.js';
import { IMeeting } from './meeting.model.js';
interface AvailableSlotsQuery {
  date: string;
  duration?: string;
}

interface BookMeetingBody {
  name: string;
  email: string;
  phone: string;
  title?: string;
  description?: string;
  date: string;
  startTime: string;
  endTime: string;
  meetingType?: 'video' | 'phone' | 'in-person';
  timezone?: string;
}

interface CancelMeetingBody {
  reason?: string;
}

interface RescheduleBody {
  date: string;
  startTime: string;
  endTime: string;
}

interface Params {
  id: string;
}

interface UserMeetingsQuery {
  email: string;
  status?: string;
}

class MeetingController {
  /**
   * Get available slots
   */
  async getAvailableSlots(
    request: FastifyRequest<{ Querystring: AvailableSlotsQuery }>,
    reply: FastifyReply
  ) {
    const startTime = Date.now();
    
    try {
      const { date, duration = '60' } = request.query;
      
      if (!date) {
        return reply.status(400).send({
          success: false,
          error: 'Date parameter is required'
        });
      }
      
      // Validate date
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        return reply.status(400).send({
          success: false,
          error: 'Invalid date format'
        });
      }
      
      // Don't allow past dates
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (parsedDate < today) {
        return reply.status(400).send({
          success: false,
          error: 'Cannot check availability for past dates'
        });
      }
      
      const availableSlots = await meetingService.getAvailableSlots(
        parsedDate, 
        parseInt(duration)
      );
      
      const responseTime = Date.now() - startTime;
      
      return reply.send({
        success: true,
        data: availableSlots,
        meta: {
          date: parsedDate.toISOString().split('T')[0],
          duration: parseInt(duration),
          totalSlots: availableSlots.length,
          responseTime: `${responseTime}ms`
        }
      });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch available slots'
      });
    }
  }

  /**
   * Book a meeting
   */
  async bookMeeting(
    request: FastifyRequest<{ Body: BookMeetingBody }>,
    reply: FastifyReply
  ) {
    const startTime = Date.now();
    
    try {
      const meetingData = request.body;
      
      // Validate input
      const validation = validateMeetingInput(meetingData);
      if (!validation.isValid) {
        return reply.status(400).send({
          success: false,
          errors: validation.errors
        });
      }
      
      // Create meeting
      const meeting = await meetingService.createMeeting(meetingData, {
        ipAddress: request.ip,
        userAgent: request.headers['user-agent']
      });
      
      // Send confirmation email asynchronously
      this.sendConfirmationEmail(meeting).catch(err => {
        request.log.error('Failed to send confirmation email:', err);
      });
      
      const responseTime = Date.now() - startTime;
      
      return reply.status(201).send({
        success: true,
        message: 'Meeting booked successfully',
        data: meeting,
        meta: {
          responseTime: `${responseTime}ms`
        }
      });
    } catch (error: any) {
      request.log.error(error);
      
      // Handle specific errors
      if (error.message === 'This time slot is already booked') {
        return reply.status(409).send({
          success: false,
          error: error.message
        });
      }
      
      // Handle duplicate key error
      if (error.code === 11000) {
        return reply.status(409).send({
          success: false,
          error: 'This time slot is already booked'
        });
      }
      
      return reply.status(500).send({
        success: false,
        error: 'Failed to book meeting'
      });
    }
  }

  /**
   * Get meeting details
   */
  async getMeeting(
    request: FastifyRequest<{ Params: Params }>,
    reply: FastifyReply
  ) {
    const startTime = Date.now();
    
    try {
      const { id } = request.params;
      
      const meeting = await meetingService.getMeetingById(id);
      
      const responseTime = Date.now() - startTime;
      
      return reply.send({
        success: true,
        data: meeting,
        meta: { responseTime: `${responseTime}ms` }
      });
    } catch (error: any) {
      request.log.error(error);
      
      if (error.message === 'Meeting not found') {
        return reply.status(404).send({
          success: false,
          error: error.message
        });
      }
      
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch meeting'
      });
    }
  }

  /**
   * Get user's meetings
   */
  async getUserMeetings(
    request: FastifyRequest<{ Querystring: UserMeetingsQuery }>,
    reply: FastifyReply
  ) {
    const startTime = Date.now();
    
    try {
      const { email, status } = request.query;
      
      if (!email) {
        return reply.status(400).send({
          success: false,
          error: 'Email parameter is required'
        });
      }
      
      const meetings = await meetingService.getUserMeetings(email, status);
      
      const responseTime = Date.now() - startTime;
      
      return reply.send({
        success: true,
        data: meetings,
        meta: {
          total: meetings.length,
          responseTime: `${responseTime}ms`
        }
      });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch user meetings'
      });
    }
  }

  /**
   * Cancel a meeting
   */
  async cancelMeeting(
    request: FastifyRequest<{ Params: Params; Body: CancelMeetingBody }>,
    reply: FastifyReply
  ) {
    const startTime = Date.now();
    
    try {
      const { id } = request.params;
      const { reason } = request.body;
      
      const meeting = await meetingService.cancelMeeting(id, reason);
      
      // Send cancellation email asynchronously
      this.sendCancellationEmail(meeting).catch(err => {
        request.log.error('Failed to send cancellation email:', err);
      });
      
      const responseTime = Date.now() - startTime;
      
      return reply.send({
        success: true,
        message: 'Meeting cancelled successfully',
        data: meeting,
        meta: { responseTime: `${responseTime}ms` }
      });
    } catch (error: any) {
      request.log.error(error);
      
      if (error.message === 'Meeting not found') {
        return reply.status(404).send({
          success: false,
          error: error.message
        });
      }
      
      return reply.status(500).send({
        success: false,
        error: 'Failed to cancel meeting'
      });
    }
  }

  /**
   * Reschedule a meeting
   */
  async rescheduleMeeting(
    request: FastifyRequest<{ Params: Params; Body: RescheduleBody }>,
    reply: FastifyReply
  ) {
    const startTime = Date.now();
    
    try {
      const { id } = request.params;
      const { date, startTime: newStartTime, endTime } = request.body;
      
      // Get existing meeting
      const existingMeeting = await meetingService.getMeetingById(id);
      
      // Check if new slot is available
      const isAvailable = await meetingService.isTimeSlotAvailable(
        date, 
        newStartTime, 
        endTime
      );
      
      if (!isAvailable) {
        return reply.status(409).send({
          success: false,
          error: 'Selected time slot is not available'
        });
      }
      
      // Cancel old meeting
      await meetingService.cancelMeeting(id, 'Rescheduled');
      
      // Create new meeting
      const newMeeting = await meetingService.createMeeting({
        ...existingMeeting,
        date,
        startTime: newStartTime,
        endTime
      } as any, {
        ipAddress: request.ip,
        userAgent: request.headers['user-agent']
      });
      
      const responseTime = Date.now() - startTime;
      
      return reply.send({
        success: true,
        message: 'Meeting rescheduled successfully',
        data: newMeeting,
        meta: { responseTime: `${responseTime}ms` }
      });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to reschedule meeting'
      });
    }
  }

  /**
   * Get upcoming meetings
   */
  async getUpcomingMeetings(
    request: FastifyRequest<{ Querystring: { days?: string } }>,
    reply: FastifyReply
  ) {
    const startTime = Date.now();
    
    try {
      const { days = '7' } = request.query;
      
      const meetings = await meetingService.getUpcomingMeetings(parseInt(days));
      
      const responseTime = Date.now() - startTime;
      
      return reply.send({
        success: true,
        data: meetings,
        meta: {
          total: meetings.length,
          responseTime: `${responseTime}ms`
        }
      });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch upcoming meetings'
      });
    }
  }

  /**
   * Send confirmation email (mock implementation)
   */
  private async sendConfirmationEmail(meeting: Partial<IMeeting>): Promise<void> {
    // Implement your email sending logic here
    console.log(`Sending confirmation email to ${meeting.email}`);
    // await emailService.sendMeetingConfirmation(meeting);
  }

  /**
   * Send cancellation email (mock implementation)
   */
  private async sendCancellationEmail(meeting: Partial<IMeeting>): Promise<void> {
    // Implement your email sending logic here
    console.log(`Sending cancellation email to ${meeting.email}`);
    // await emailService.sendMeetingCancellation(meeting);
  }
}

export default new MeetingController();