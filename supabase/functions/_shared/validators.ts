/**
 * Input Validation Utilities for Edge Functions
 * Provides consistent validation patterns
 */

/**
 * Validate that required fields exist in the body
 * @param body - Request body to validate
 * @param requiredFields - Array of required field names
 * @throws Error if validation fails
 */
export function validateRequiredFields(body: any, requiredFields: string[]): void {
  if (!body || typeof body !== 'object') {
    throw new Error('INVALID_INPUT: Request body must be an object');
  }

  const missingFields = requiredFields.filter(
    field => !(field in body) || body[field] === undefined || body[field] === null
  );

  if (missingFields.length > 0) {
    throw new Error(`MISSING_FIELD: Required fields missing: ${missingFields.join(', ')}`);
  }
}

/**
 * Validate string field
 * @param value - Value to validate
 * @param fieldName - Field name for error messages
 * @param options - Validation options
 */
export function validateString(
  value: any,
  fieldName: string,
  options: { minLength?: number; maxLength?: number; pattern?: RegExp } = {}
): void {
  if (typeof value !== 'string') {
    throw new Error(`INVALID_INPUT: ${fieldName} must be a string`);
  }

  if (options.minLength && value.length < options.minLength) {
    throw new Error(`INVALID_INPUT: ${fieldName} must be at least ${options.minLength} characters`);
  }

  if (options.maxLength && value.length > options.maxLength) {
    throw new Error(`INVALID_INPUT: ${fieldName} must be at most ${options.maxLength} characters`);
  }

  if (options.pattern && !options.pattern.test(value)) {
    throw new Error(`INVALID_INPUT: ${fieldName} has invalid format`);
  }
}

/**
 * Validate number field
 * @param value - Value to validate
 * @param fieldName - Field name for error messages
 * @param options - Validation options
 */
export function validateNumber(
  value: any,
  fieldName: string,
  options: { min?: number; max?: number; integer?: boolean } = {}
): void {
  if (typeof value !== 'number' || isNaN(value)) {
    throw new Error(`INVALID_INPUT: ${fieldName} must be a number`);
  }

  if (options.integer && !Number.isInteger(value)) {
    throw new Error(`INVALID_INPUT: ${fieldName} must be an integer`);
  }

  if (options.min !== undefined && value < options.min) {
    throw new Error(`INVALID_INPUT: ${fieldName} must be at least ${options.min}`);
  }

  if (options.max !== undefined && value > options.max) {
    throw new Error(`INVALID_INPUT: ${fieldName} must be at most ${options.max}`);
  }
}

/**
 * Validate array field
 * @param value - Value to validate
 * @param fieldName - Field name for error messages
 * @param options - Validation options
 */
export function validateArray(
  value: any,
  fieldName: string,
  options: { minLength?: number; maxLength?: number; itemValidator?: (item: any) => void } = {}
): void {
  if (!Array.isArray(value)) {
    throw new Error(`INVALID_INPUT: ${fieldName} must be an array`);
  }

  if (options.minLength && value.length < options.minLength) {
    throw new Error(`INVALID_INPUT: ${fieldName} must have at least ${options.minLength} items`);
  }

  if (options.maxLength && value.length > options.maxLength) {
    throw new Error(`INVALID_INPUT: ${fieldName} must have at most ${options.maxLength} items`);
  }

  if (options.itemValidator) {
    value.forEach((item, index) => {
      try {
        options.itemValidator!(item);
      } catch (error) {
        throw new Error(`INVALID_INPUT: ${fieldName}[${index}] - ${error instanceof Error ? error.message : 'validation failed'}`);
      }
    });
  }
}

/**
 * Validate email format
 * @param email - Email to validate
 * @param fieldName - Field name for error messages
 */
export function validateEmail(email: any, fieldName: string = 'email'): void {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  validateString(email, fieldName, { pattern: emailPattern });
}

/**
 * Validate URL format
 * @param url - URL to validate
 * @param fieldName - Field name for error messages
 */
export function validateUrl(url: any, fieldName: string = 'url'): void {
  if (typeof url !== 'string') {
    throw new Error(`INVALID_INPUT: ${fieldName} must be a string`);
  }

  try {
    new URL(url);
  } catch {
    throw new Error(`INVALID_INPUT: ${fieldName} must be a valid URL`);
  }
}

/**
 * Validate UUID format
 * @param uuid - UUID to validate
 * @param fieldName - Field name for error messages
 */
export function validateUuid(uuid: any, fieldName: string = 'id'): void {
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  validateString(uuid, fieldName, { pattern: uuidPattern });
}

/**
 * Validate enum value
 * @param value - Value to validate
 * @param fieldName - Field name for error messages
 * @param allowedValues - Array of allowed values
 */
export function validateEnum(value: any, fieldName: string, allowedValues: any[]): void {
  if (!allowedValues.includes(value)) {
    throw new Error(`INVALID_INPUT: ${fieldName} must be one of: ${allowedValues.join(', ')}`);
  }
}

/**
 * Validate pagination parameters
 * @param params - Pagination parameters
 */
export function validatePagination(params: any): { page: number; limit: number; offset: number } {
  const page = params.page ? parseInt(params.page) : 1;
  const limit = params.limit ? parseInt(params.limit) : 10;

  validateNumber(page, 'page', { min: 1, integer: true });
  validateNumber(limit, 'limit', { min: 1, max: 100, integer: true });

  return {
    page,
    limit,
    offset: (page - 1) * limit,
  };
}
