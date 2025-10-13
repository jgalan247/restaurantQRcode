/**
 * Card Validation Utilities
 * Mock validation for testing - will be replaced with actual payment processor validation
 */

export interface CardValidationErrors {
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
  cardholderName?: string;
}

/**
 * Format card number with spaces (XXXX XXXX XXXX XXXX)
 */
export function formatCardNumber(value: string): string {
  // Remove all non-digits
  const digits = value.replace(/\D/g, '');

  // Limit to 16 digits
  const limited = digits.slice(0, 16);

  // Add space every 4 digits
  return limited.replace(/(\d{4})(?=\d)/g, '$1 ');
}

/**
 * Format expiry date (MM/YY)
 */
export function formatExpiryDate(value: string): string {
  // Remove all non-digits
  const digits = value.replace(/\D/g, '');

  // Limit to 4 digits (MMYY)
  const limited = digits.slice(0, 4);

  // Add / after MM
  if (limited.length >= 2) {
    return `${limited.slice(0, 2)}/${limited.slice(2)}`;
  }

  return limited;
}

/**
 * Format CVV (3 digits only)
 */
export function formatCVV(value: string): string {
  // Remove all non-digits and limit to 3
  return value.replace(/\D/g, '').slice(0, 3);
}

/**
 * Validate card number (exactly 16 digits)
 * TEST MODE: Any 16 digits will pass
 */
export function validateCardNumber(cardNumber: string): string | null {
  const digits = cardNumber.replace(/\D/g, '');

  if (digits.length === 0) {
    return 'Card number is required';
  }

  if (digits.length !== 16) {
    return 'Card number must be exactly 16 digits';
  }

  // TODO: In production, add Luhn algorithm validation
  // TODO: Replace with actual CityPay card validation

  return null; // Valid
}

/**
 * Validate expiry date (MM/YY format, future date)
 */
export function validateExpiryDate(expiryDate: string): string | null {
  if (!expiryDate || expiryDate.length === 0) {
    return 'Expiry date is required';
  }

  const parts = expiryDate.split('/');

  if (parts.length !== 2) {
    return 'Expiry date must be in MM/YY format';
  }

  const month = parseInt(parts[0], 10);
  const year = parseInt(parts[1], 10);

  // Validate month
  if (isNaN(month) || month < 1 || month > 12) {
    return 'Invalid month (must be 01-12)';
  }

  // Validate year format
  if (isNaN(year) || parts[1].length !== 2) {
    return 'Invalid year (must be YY format)';
  }

  // Check if date is in the future
  const now = new Date();
  const currentYear = now.getFullYear() % 100; // Get last 2 digits
  const currentMonth = now.getMonth() + 1; // 0-indexed

  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    return 'Card has expired';
  }

  // TODO: Replace with actual CityPay expiry validation

  return null; // Valid
}

/**
 * Validate CVV (exactly 3 digits)
 */
export function validateCVV(cvv: string): string | null {
  const digits = cvv.replace(/\D/g, '');

  if (digits.length === 0) {
    return 'CVV is required';
  }

  if (digits.length !== 3) {
    return 'CVV must be exactly 3 digits';
  }

  // TODO: Replace with actual CityPay CVV validation

  return null; // Valid
}

/**
 * Validate cardholder name (optional for testing)
 */
export function validateCardholderName(name: string): string | null {
  // Optional field for testing
  if (name && name.trim().length < 2) {
    return 'Name must be at least 2 characters';
  }

  return null; // Valid
}

/**
 * Validate all card fields
 */
export function validateCard(
  cardNumber: string,
  expiryDate: string,
  cvv: string,
  cardholderName: string
): CardValidationErrors {
  const errors: CardValidationErrors = {};

  const cardNumberError = validateCardNumber(cardNumber);
  if (cardNumberError) errors.cardNumber = cardNumberError;

  const expiryError = validateExpiryDate(expiryDate);
  if (expiryError) errors.expiryDate = expiryError;

  const cvvError = validateCVV(cvv);
  if (cvvError) errors.cvv = cvvError;

  const nameError = validateCardholderName(cardholderName);
  if (nameError) errors.cardholderName = nameError;

  return errors;
}

/**
 * Check if validation errors object is empty
 */
export function hasValidationErrors(errors: CardValidationErrors): boolean {
  return Object.keys(errors).length > 0;
}

/**
 * Get test card numbers for development
 */
export const TEST_CARDS = {
  visa: '4111 1111 1111 1111',
  mastercard: '5555 5555 5555 4444',
  amex: '3782 822463 10005', // Note: Amex has 15 digits (not supported in this mock)
  discover: '6011 1111 1111 1117',
};
