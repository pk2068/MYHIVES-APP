// filepath: src/utils/time-utils.ts
import ms, { StringValue } from 'ms';

/**
 * Converts a time string (1h, 7d, 15m) into seconds for Redis.
 * @param timeString The string from your config/env
 */
export const getSecondsFromConfig = (timeString: string): number => {
  const milliseconds = ms(timeString as StringValue);
  if (!milliseconds) return 3600; // Fallback to 1 hour if parsing fails
  return Math.floor(milliseconds / 1000);
};

/**
 * Calculates remaining seconds for a specific JWT.
 */
export const getRemainingSeconds = (expiryTimestamp: number): number => {
  const currentTime = Math.floor(Date.now() / 1000);
  const remaining = expiryTimestamp - currentTime;
  return remaining > 0 ? remaining : 0;
};
