/**
 * Date utility functions for the application
 */

/**
 * Gets the current week number of the year
 * @returns The week number (1-53)
 */
export const getCurrentWeekNumber = (): number => {
  const now = new Date();
  const start = new Date(now.getFullYear()-1, 9, 1);
  const diff = now.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const day = Math.floor(diff / oneDay);
  const weekNumber = Math.ceil((day + start.getDay()) / 7);
  return weekNumber;
};

/**
 * Gets the current week number with ordinal suffix (1st, 2nd, 3rd, etc.)
 * @returns The week number with ordinal suffix
 */
export const getCurrentWeekWithOrdinal = (): string => {
  const weekNumber = getCurrentWeekNumber();
  return addOrdinalSuffix(weekNumber);
};

/**
 * Adds an ordinal suffix to a number (1st, 2nd, 3rd, etc.)
 * @param n - The number to add a suffix to
 * @returns The number with an ordinal suffix
 */
export const addOrdinalSuffix = (n: number): string => {
  if (n >= 11 && n <= 13) {
    return n + "th";
  }
  
  switch (n % 10) {
    case 1:
      return n + "st";
    case 2:
      return n + "nd";
    case 3:
      return n + "rd";
    default:
      return n + "th";
  }
};

/**
 * Gets the name of the current day of the week
 * @returns The day name (Monday, Tuesday, etc.)
 */
export const getCurrentDayName = (): string => {
  const days = [
    "Sunday", 
    "Monday", 
    "Tuesday", 
    "Wednesday", 
    "Thursday", 
    "Friday", 
    "Saturday"
  ];
  const dayIndex = new Date().getDay();
  return days[dayIndex];
};

/**
 * Gets the name of the current month
 * @returns The month name (January, February, etc.)
 */
export const getCurrentMonthName = (): string => {
  const months = [
    "January", 
    "February", 
    "March", 
    "April", 
    "May", 
    "June", 
    "July", 
    "August", 
    "September", 
    "October", 
    "November", 
    "December"
  ];
  const monthIndex = new Date().getMonth();
  return months[monthIndex];
};

/**
 * Formats a date as a string
 * @param date - The date to format
 * @param format - The format string (default: 'MM/DD/YYYY')
 * @returns The formatted date string
 */
export const formatDate = (
  date: Date | string | null | undefined,
  format: string = 'MM/DD/YYYY'
): string => {
  if (!date) return '';
  
  // Convert to Date object if it's a string
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Check if date is valid
  if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
    return '';
  }
  
  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const year = String(dateObj.getFullYear());

  let result = format;
  result = result.replace(/DD/g, day);
  result = result.replace(/MM/g, month);
  result = result.replace(/YYYY/g, year);
  return result;
};

/**
 * Extends the Date prototype to add a getWeekday method
 */
declare global {
  interface Date {
    getWeekday(): string;
  }
}
