// meeting.routes.ts
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import meetingController from './meeting.controller.js';

console.log('🔄 Loading meeting routes...');

async function meetingRoutes(fastify: FastifyInstance, options: FastifyPluginOptions) {
  console.log('📝 Registering meeting routes...');
  
  // Get available slots for a date
  fastify.get('/meetings/available-slots', meetingController.getAvailableSlots.bind(meetingController));
  console.log('  ✅ GET /meetings/available-slots registered');

  // Book a new meeting
  fastify.post('/meetings/book', meetingController.bookMeeting.bind(meetingController));
  console.log('  ✅ POST /meetings/book registered');

  // Get meeting by ID
  fastify.get('/meetings/:id', meetingController.getMeeting.bind(meetingController));
  console.log('  ✅ GET /meetings/:id registered');

  // Get user's meetings
  fastify.get('/meetings', meetingController.getUserMeetings.bind(meetingController));
  console.log('  ✅ GET /meetings registered');

  // Cancel a meeting
  fastify.patch('/meetings/:id/cancel', meetingController.cancelMeeting.bind(meetingController));
  console.log('  ✅ PATCH /meetings/:id/cancel registered');

  // Reschedule a meeting
  fastify.patch('/meetings/:id/reschedule', meetingController.rescheduleMeeting.bind(meetingController));
  console.log('  ✅ PATCH /meetings/:id/reschedule registered');

  // Get upcoming meetings
  fastify.get('/meetings/upcoming', meetingController.getUpcomingMeetings.bind(meetingController));
  console.log('  ✅ GET /meetings/upcoming registered');
}

export default meetingRoutes;