/**
 * Utility functions for safe formatting of values
 */

/**
 * Safely format a value as a price string
 * Handles null, undefined, strings, and numbers
 */
export const formatPrice = (value: any): string => {
  if (value === null || value === undefined) return '0.00';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return isNaN(num) ? '0.00' : num.toFixed(2);
};

/**
 * Safely parse a value as a number
 * Returns 0 if the value cannot be parsed
 */
export const safeParseNumber = (value: any): number => {
  if (value === null || value === undefined) return 0;
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return isNaN(num) ? 0 : num;
};

/**
 * Format currency with symbol
 */
export const formatCurrency = (value: any, symbol: string = '£'): string => {
  return `${symbol}${formatPrice(value)}`;
};

/**
 * Format percentage
 */
export const formatPercentage = (value: any): string => {
  const num = safeParseNumber(value);
  return `${num.toFixed(0)}%`;
};
