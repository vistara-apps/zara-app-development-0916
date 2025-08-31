// Format duration in milliseconds to a readable string (HH:MM:SS)
export const formatDuration = (durationMs) => {
  if (!durationMs) return '00:00:00';
  
  const totalSeconds = Math.floor(durationMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  return [
    hours.toString().padStart(2, '0'),
    minutes.toString().padStart(2, '0'),
    seconds.toString().padStart(2, '0')
  ].join(':');
};

// Format duration in hours to a readable string (e.g., "16h 30m")
export const formatHoursDuration = (hours) => {
  if (hours === undefined || hours === null) return '';
  
  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);
  
  if (minutes === 0) {
    return `${wholeHours}h`;
  }
  
  return `${wholeHours}h ${minutes}m`;
};

// Format time string (HH:MM) to a readable format (e.g., "8:00 AM")
export const formatTimeString = (timeString) => {
  if (!timeString) return '';
  
  const [hours, minutes] = timeString.split(':').map(Number);
  
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
};

// Get current time as a string (HH:MM)
export const getCurrentTimeString = () => {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  
  return `${hours}:${minutes}`;
};

// Parse time string (HH:MM) to Date object
export const parseTimeString = (timeString, baseDate = new Date()) => {
  if (!timeString) return null;
  
  const [hours, minutes] = timeString.split(':').map(Number);
  
  const date = new Date(baseDate);
  date.setHours(hours, minutes, 0, 0);
  
  return date;
};

// Calculate time difference in hours between two time strings
export const getTimeDifferenceInHours = (startTime, endTime) => {
  if (!startTime || !endTime) return 0;
  
  const start = parseTimeString(startTime);
  let end = parseTimeString(endTime);
  
  // Handle overnight periods
  if (end < start) {
    end.setDate(end.getDate() + 1);
  }
  
  const diffMs = end - start;
  return diffMs / (1000 * 60 * 60);
};

// Check if current time is within a time window
export const isTimeInWindow = (startTime, endTime) => {
  if (!startTime || !endTime) return false;
  
  const now = new Date();
  const start = parseTimeString(startTime);
  let end = parseTimeString(endTime);
  
  // Handle overnight periods
  if (end < start) {
    end.setDate(end.getDate() + 1);
    
    // If now is before start, check if it's after midnight
    if (now < start) {
      now.setDate(now.getDate() + 1);
    }
  }
  
  return now >= start && now <= end;
};

// Get formatted date string (e.g., "Mon, Jan 1")
export const getFormattedDateString = (date = new Date()) => {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
};

// Get day of week name
export const getDayOfWeekName = (date = new Date()) => {
  return date.toLocaleDateString('en-US', { weekday: 'long' });
};

// Get time ago string (e.g., "2 hours ago", "5 days ago")
export const getTimeAgoString = (date) => {
  if (!date) return '';
  
  const now = new Date();
  const diffMs = now - date;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffDays > 0) {
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  }
  
  if (diffHours > 0) {
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  }
  
  if (diffMinutes > 0) {
    return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
  }
  
  return 'Just now';
};

