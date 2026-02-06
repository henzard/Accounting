// Date formatting utilities

/**
 * Format a date to a readable string
 * @param date - The date to format
 * @param format - Optional format type ('short' | 'long' | 'iso')
 * @returns Formatted date string
 */
export function formatDate(date: Date, format: 'short' | 'long' | 'iso' = 'short'): string {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return 'Invalid Date';
  }

  switch (format) {
    case 'iso':
      return date.toISOString();
    
    case 'long':
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    
    case 'short':
    default:
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
  }
}

/**
 * Format a date to show only the time
 * @param date - The date to format
 * @returns Formatted time string (e.g., "3:45 PM")
 */
export function formatTime(date: Date): string {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return 'Invalid Time';
  }

  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

/**
 * Format a date to show both date and time
 * @param date - The date to format
 * @returns Formatted date and time string
 */
export function formatDateTime(date: Date): string {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return 'Invalid Date';
  }

  return `${formatDate(date)} at ${formatTime(date)}`;
}

/**
 * Get a relative time string (e.g., "2 days ago", "in 3 hours")
 * @param date - The date to compare
 * @returns Relative time string
 */
export function formatRelativeTime(date: Date): string {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return 'Invalid Date';
  }

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffSeconds < 60) {
    return 'just now';
  } else if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  } else if (diffWeeks < 4) {
    return `${diffWeeks} week${diffWeeks !== 1 ? 's' : ''} ago`;
  } else if (diffMonths < 12) {
    return `${diffMonths} month${diffMonths !== 1 ? 's' : ''} ago`;
  } else {
    return `${diffYears} year${diffYears !== 1 ? 's' : ''} ago`;
  }
}

/**
 * Check if two dates are on the same day
 * @param date1 - First date
 * @param date2 - Second date
 * @returns True if dates are on the same day
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Get the start of day for a date
 * @param date - The date
 * @returns Date at start of day (00:00:00.000)
 */
export function startOfDay(date: Date): Date {
  const newDate = new Date(date);
  newDate.setHours(0, 0, 0, 0);
  return newDate;
}

/**
 * Get the end of day for a date
 * @param date - The date
 * @returns Date at end of day (23:59:59.999)
 */
export function endOfDay(date: Date): Date {
  const newDate = new Date(date);
  newDate.setHours(23, 59, 59, 999);
  return newDate;
}

/**
 * Add days to a date
 * @param date - The starting date
 * @param days - Number of days to add (can be negative)
 * @returns New date with days added
 */
export function addDays(date: Date, days: number): Date {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() + days);
  return newDate;
}

/**
 * Add months to a date
 * @param date - The starting date
 * @param months - Number of months to add (can be negative)
 * @returns New date with months added
 */
export function addMonths(date: Date, months: number): Date {
  const newDate = new Date(date);
  newDate.setMonth(newDate.getMonth() + months);
  return newDate;
}

/**
 * Get the first day of the month for a date
 * @param date - The date
 * @returns Date at first day of month
 */
export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

/**
 * Get the last day of the month for a date
 * @param date - The date
 * @returns Date at last day of month
 */
export function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}
