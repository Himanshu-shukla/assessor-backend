1. Get Available Slots
bash
curl -X GET "http://localhost:4000/api/meetings/available-slots?date=2024-12-25&duration=60" \
  -H "Content-Type: application/json"
2. Book a Meeting
bash
curl -X POST http://localhost:4000/api/meetings/book \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john.doe@example.com",
    "phone": "+1234567890",
    "title": "Technical Interview Consultation",
    "description": "Need help with system design",
    "date": "2024-12-25",
    "startTime": "10:00",
    "endTime": "11:00",
    "meetingType": "video",
    "timezone": "UTC"
  }'
3. Get Meeting by ID
bash
# Replace MEETING_ID with actual meeting ID from booking response
curl -X GET http://localhost:4000/api/meetings/MEETING_ID \
  -H "Content-Type: application/json"
4. Get User's Meetings by Email
bash
# Get all meetings for a user
curl -X GET "http://localhost:4000/api/meetings?email=john.doe@example.com" \
  -H "Content-Type: application/json"

# Get meetings with specific status
curl -X GET "http://localhost:4000/api/meetings?email=john.doe@example.com&status=pending" \
  -H "Content-Type: application/json"
5. Cancel a Meeting
bash
# Replace MEETING_ID with actual meeting ID
curl -X PATCH http://localhost:4000/api/meetings/MEETING_ID/cancel \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Schedule conflict"
  }'
6. Reschedule a Meeting
bash
# Replace MEETING_ID with actual meeting ID
curl -X PATCH http://localhost:4000/api/meetings/MEETING_ID/reschedule \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2024-12-26",
    "startTime": "14:00",
    "endTime": "15:00"
  }'
7. Get Upcoming Meetings
bash
# Get upcoming meetings for next 7 days (default)
curl -X GET http://localhost:4000/api/meetings/upcoming \
  -H "Content-Type: application/json"

# Get upcoming meetings for next 14 days
curl -X GET "http://localhost:4000/api/meetings/upcoming?days=14" \
  -H "Content-Type: application/json"
Complete Workflow Example
bash
# 1. First check available slots
curl -X GET "http://localhost:4000/api/meetings/available-slots?date=2024-12-25"

# 2. Book a meeting (save the meeting ID from response)
curl -X POST http://localhost:4000/api/meetings/book \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Smith",
    "email": "jane.smith@example.com",
    "phone": "9876543210",
    "date": "2024-12-25",
    "startTime": "10:00",
    "endTime": "11:00"
  }'

# 3. Check the meeting details (replace with actual ID)
curl -X GET http://localhost:4000/api/meetings/67c5e8b2d4f5a1b2c3d4e5f6

# 4. Get all meetings for this user
curl -X GET "http://localhost:4000/api/meetings?email=jane.smith@example.com"

# 5. Cancel the meeting if needed
curl -X PATCH http://localhost:4000/api/meetings/67c5e8b2d4f5a1b2c3d4e5f6/cancel \
  -H "Content-Type: application/json" \
  -d '{"reason": "No longer needed"}'
Test if Server is Running
bash
# Test route to verify server is working
curl -X GET http://localhost:4000/test