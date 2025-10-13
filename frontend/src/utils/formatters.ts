/**
 * Utility functions for formatting and parsing prices
 * Backend returns prices as strings from PostgreSQL Decimal fields
 */

/**
 * Safely converts a price (string or number) to a number
 * @param price - Price as string or number
 * @returns Price as number
 */
export function parsePrice(price: string | number): number {
  if (typeof price === 'number') {
    return price;
  }
  const parsed = parseFloat(price);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Formats a price with 2 decimal places
 * @param price - Price as string or number
 * @returns Formatted price string (e.g., "12.99")
 */
export function formatPrice(price: string | number): string {
  const num = parsePrice(price);
  return num.toFixed(2);
}

/**
 * Formats a price with currency symbol
 * @param price - Price as string or number
 * @returns Formatted price with £ symbol (e.g., "£12.99")
 */
export function formatCurrency(price: string | number): string {
  return `£${formatPrice(price)}`;
}

/**
 * Calculates total price from quantity and unit price
 * @param price - Unit price as string or number
 * @param quantity - Quantity
 * @returns Total price as number
 */
export function calculateTotal(price: string | number, quantity: number): number {
  return parsePrice(price) * quantity;
}

/**
 * Calculates percentage of a price
 * @param price - Base price as string or number
 * @param percentage - Percentage (e.g., 15 for 15%)
 * @returns Calculated amount as number
 */
export function calculatePercentage(price: string | number, percentage: number): number {
  return parsePrice(price) * (percentage / 100);
}
