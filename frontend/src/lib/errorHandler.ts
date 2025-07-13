// Error handling utility for the SkillSwap application

export interface AppError {
  message: string;
  code?: string;
  status?: number;
  details?: any;
}

export class SkillSwapError extends Error {
  public code?: string;
  public status?: number;
  public details?: any;

  constructor(message: string, code?: string, status?: number, details?: any) {
    super(message);
    this.name = 'SkillSwapError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

// Error message mapping for user-friendly messages
const ERROR_MESSAGES = {
  // Network errors
  NETWORK_ERROR: 'Unable to connect to the server. Please check your internet connection.',
  TIMEOUT_ERROR: 'Request timed out. Please try again.',
  
  // Authentication errors
  UNAUTHORIZED: 'Please log in to continue.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  INVALID_CREDENTIALS: 'Invalid email or password.',
  TOKEN_EXPIRED: 'Your session has expired. Please log in again.',
  
  // Registration errors
  USERNAME_TAKEN: 'This username is already taken. Please choose another.',
  EMAIL_TAKEN: 'This email is already registered. Please use a different email or try logging in.',
  WEAK_PASSWORD: 'Password must be at least 8 characters long and contain letters and numbers.',
  PASSWORDS_DONT_MATCH: 'Passwords do not match.',
  
  // Profile errors
  INVALID_AVATAR: 'Please select a valid image file (PNG, JPG, JPEG, or SVG).',
  PROFILE_UPDATE_FAILED: 'Failed to update profile. Please try again.',
  
  // Swap request errors
  SWAP_REQUEST_FAILED: 'Failed to send swap request. Please try again.',
  INVALID_SWAP_DATA: 'Please fill in all required fields for the swap request.',
  SELF_SWAP_ERROR: 'You cannot send a swap request to yourself.',
  USER_NOT_FOUND: 'User not found.',
  
  // Rating errors
  RATING_FAILED: 'Failed to submit rating. Please try again.',
  INVALID_RATING: 'Please select a valid rating.',
  
  // Admin errors
  ADMIN_ACCESS_DENIED: 'Admin access required.',
  USER_BAN_FAILED: 'Failed to ban user. Please try again.',
  SKILL_REJECTION_FAILED: 'Failed to reject skill. Please try again.',
  
  // General errors
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
};

// Parse error from API response
export function parseApiError(error: any): AppError {
  console.error('API Error:', error);
  
  // Handle axios errors
  if (error.response) {
    const { status, data } = error.response;
    
    // Handle specific status codes
    switch (status) {
      case 400:
        return {
          message: data?.message || data?.error || ERROR_MESSAGES.VALIDATION_ERROR,
          code: 'VALIDATION_ERROR',
          status,
          details: data
        };
      case 401:
        return {
          message: ERROR_MESSAGES.UNAUTHORIZED,
          code: 'UNAUTHORIZED',
          status
        };
      case 403:
        return {
          message: ERROR_MESSAGES.FORBIDDEN,
          code: 'FORBIDDEN',
          status
        };
      case 404:
        return {
          message: ERROR_MESSAGES.USER_NOT_FOUND,
          code: 'NOT_FOUND',
          status
        };
      case 500:
        return {
          message: ERROR_MESSAGES.SERVER_ERROR,
          code: 'SERVER_ERROR',
          status
        };
      default:
        return {
          message: data?.message || ERROR_MESSAGES.UNKNOWN_ERROR,
          code: 'API_ERROR',
          status,
          details: data
        };
    }
  }
  
  // Handle network errors
  if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
    return {
      message: ERROR_MESSAGES.NETWORK_ERROR,
      code: 'NETWORK_ERROR'
    };
  }
  
  // Handle timeout errors
  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    return {
      message: ERROR_MESSAGES.TIMEOUT_ERROR,
      code: 'TIMEOUT_ERROR'
    };
  }
  
  // Handle other errors
  return {
    message: error.message || ERROR_MESSAGES.UNKNOWN_ERROR,
    code: 'UNKNOWN_ERROR'
  };
}

// Validate form data and return user-friendly errors
export function validateFormData(data: any, rules: any): AppError[] {
  const errors: AppError[] = [];
  
  for (const [field, rule] of Object.entries(rules)) {
    const value = data[field];
    
    if (rule.required && (!value || value.trim() === '')) {
      errors.push({
        message: `${field.charAt(0).toUpperCase() + field.slice(1)} is required.`,
        code: 'VALIDATION_ERROR',
        details: { field }
      });
    }
    
    if (rule.minLength && value && value.length < rule.minLength) {
      errors.push({
        message: `${field.charAt(0).toUpperCase() + field.slice(1)} must be at least ${rule.minLength} characters.`,
        code: 'VALIDATION_ERROR',
        details: { field, minLength: rule.minLength }
      });
    }
    
    if (rule.maxLength && value && value.length > rule.maxLength) {
      errors.push({
        message: `${field.charAt(0).toUpperCase() + field.slice(1)} must be no more than ${rule.maxLength} characters.`,
        code: 'VALIDATION_ERROR',
        details: { field, maxLength: rule.maxLength }
      });
    }
    
    if (rule.pattern && value && !rule.pattern.test(value)) {
      errors.push({
        message: rule.message || `${field.charAt(0).toUpperCase() + field.slice(1)} format is invalid.`,
        code: 'VALIDATION_ERROR',
        details: { field }
      });
    }
  }
  
  return errors;
}

// Handle async operations with error handling
export async function handleAsyncOperation<T>(
  operation: () => Promise<T>,
  errorHandler?: (error: AppError) => void
): Promise<{ data?: T; error?: AppError }> {
  try {
    const data = await operation();
    return { data };
  } catch (error: any) {
    const appError = parseApiError(error);
    if (errorHandler) {
      errorHandler(appError);
    }
    return { error: appError };
  }
}

// Log error for debugging
export function logError(error: AppError, context?: string) {
  console.error(`[${context || 'App'}] Error:`, {
    message: error.message,
    code: error.code,
    status: error.status,
    details: error.details,
    timestamp: new Date().toISOString()
  });
}

// Get user-friendly error message
export function getUserFriendlyMessage(error: AppError): string {
  return error.message || ERROR_MESSAGES.UNKNOWN_ERROR;
}

// Check if error is retryable
export function isRetryableError(error: AppError): boolean {
  const retryableCodes = ['NETWORK_ERROR', 'TIMEOUT_ERROR', 'SERVER_ERROR'];
  return retryableCodes.includes(error.code || '');
}

// Retry operation with exponential backoff
export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: AppError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = parseApiError(error);
      
      if (attempt === maxRetries || !isRetryableError(lastError)) {
        throw lastError;
      }
      
      // Wait with exponential backoff
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
} 