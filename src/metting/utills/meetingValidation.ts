interface MeetingInput {
    name: string;
    email: string;
    phone: string;
    date: string;
    startTime: string;
    endTime: string;
    meetingType?: string;
  }
  
  interface ValidationResult {
    isValid: boolean;
    errors: string[];
  }
  
  /**
   * Validate meeting input data
   */
  export const validateMeetingInput = (data: MeetingInput): ValidationResult => {
    const errors: string[] = [];
    
    // Name validation
    if (!data.name || data.name.trim().length < 2) {
      errors.push('Name must be at least 2 characters long');
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email || !emailRegex.test(data.email)) {
      errors.push('Valid email is required');
    }
    
    // Phone validation (basic international format)
    const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,4}[-\s.]?[0-9]{1,9}$/;
    if (!data.phone || !phoneRegex.test(data.phone)) {
      errors.push('Valid phone number is required');
    }
    
    // Date validation
    const meetingDate = new Date(data.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (isNaN(meetingDate.getTime())) {
      errors.push('Invalid date format');
    } else if (meetingDate < today) {
      errors.push('Meeting date must be in the future');
    }
    
    // Time validation
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!data.startTime || !timeRegex.test(data.startTime)) {
      errors.push('Invalid start time format (use HH:MM)');
    }
    if (!data.endTime || !timeRegex.test(data.endTime)) {
      errors.push('Invalid end time format (use HH:MM)');
    }
    
    // Time range validation
    if (data.startTime && data.endTime) {
      const start = data.startTime.split(':').map(Number);
      const end = data.endTime.split(':').map(Number);
      
      // Added ! to tell TS these elements are definitely present
      const startMinutes = start[0]! * 60 + start[1]!;
      let endMinutes = end[0]! * 60 + end[1]!;
      
      // Handle meetings that wrap past midnight
      if (endMinutes < startMinutes) {
        endMinutes += 1440;
      }
      
      if (endMinutes <= startMinutes) {
        errors.push('End time must be after start time');
      }
      
      const duration = endMinutes - startMinutes;
      if (duration < 15) {
        errors.push('Meeting must be at least 15 minutes long');
      }
      if (duration > 480) {
        errors.push('Meeting cannot exceed 8 hours');
      }
      
      // Check if within working hours (9 AM - 5 PM)
      // Added ! here as well
      if (start[0]! < 9 || start[0]! >= 17) {
        errors.push('Meetings are only available between 9 AM and 5 PM');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
};