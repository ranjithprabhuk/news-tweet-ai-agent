// src/utils/date.ts

/**
 * Format a date object to the format expected by AlphaVantage API
 * Format: YYYYMMDDTHHMM (e.g., 20220410T0130)
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}${month}${day}T${hours}${minutes}`;
}

/**
 * Parse a date string in the format YYYYMMDDTHHMM to a Date object
 */
export function parseDate(dateString: string): Date {
  const year = parseInt(dateString.substring(0, 4));
  const month = parseInt(dateString.substring(4, 6)) - 1; // Months are 0-indexed in JS
  const day = parseInt(dateString.substring(6, 8));
  const hours = parseInt(dateString.substring(9, 11));
  const minutes = parseInt(dateString.substring(11, 13));

  return new Date(year, month, day, hours, minutes);
}

/**
 * Get the difference between two dates in minutes
 */
export function getMinutesDifference(date1: Date, date2: Date): number {
  const diffMs = Math.abs(date2.getTime() - date1.getTime());
  return Math.floor(diffMs / (1000 * 60));
}
