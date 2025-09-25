/**
 * Standard API Error Response Types
 * Based on the API specification error formats
 */

export interface ApiErrorResponse {
  success: false;
  message: string;
  errorCode: string;
  errors?: Record<string, string>;
}

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Standard error codes from API specification
 */
export const ApiErrorCode = {
  AUTH_REQUIRED: "AUTH_REQUIRED",
  ACCESS_DENIED: "ACCESS_DENIED",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  NOT_FOUND: "NOT_FOUND",
  INTERNAL_ERROR: "INTERNAL_ERROR",
  RATE_LIMITED: "RATE_LIMITED",
  CONFLICT: "CONFLICT",
  DISCORD_OAUTH_ERROR: "DISCORD_OAUTH_ERROR",
  CHAT_ROOM_FULL: "CHAT_ROOM_FULL",
  MESSAGE_TOO_LONG: "MESSAGE_TOO_LONG",
  FILE_TOO_LARGE: "FILE_TOO_LARGE",
  INVALID_FILE_TYPE: "INVALID_FILE_TYPE",
} as const;

export type ApiErrorCodeType = (typeof ApiErrorCode)[keyof typeof ApiErrorCode];

/**
 * API Error class with standardized error handling
 */
export class ApiError extends Error {
  public readonly errorCode: string;
  public readonly statusCode: number;
  public readonly errors?: Record<string, string>;

  constructor(
    message: string,
    errorCode: string,
    statusCode: number,
    errors?: Record<string, string>
  ) {
    super(message);
    this.name = "ApiError";
    this.errorCode = errorCode;
    this.statusCode = statusCode;
    this.errors = errors;
  }

  /**
   * Create ApiError from response object
   */
  static fromResponse(
    response: ApiErrorResponse,
    statusCode: number
  ): ApiError {
    return new ApiError(
      response.message,
      response.errorCode,
      statusCode,
      response.errors
    );
  }

  /**
   * Check if error is authentication related
   */
  get isAuthError(): boolean {
    return (
      this.errorCode === ApiErrorCode.AUTH_REQUIRED || this.statusCode === 401
    );
  }

  /**
   * Check if error is authorization related
   */
  get isAuthorizationError(): boolean {
    return (
      this.errorCode === ApiErrorCode.ACCESS_DENIED || this.statusCode === 403
    );
  }

  /**
   * Check if error is validation related
   */
  get isValidationError(): boolean {
    return (
      this.errorCode === ApiErrorCode.VALIDATION_ERROR ||
      this.statusCode === 400
    );
  }

  /**
   * Check if error is not found related
   */
  get isNotFoundError(): boolean {
    return this.errorCode === ApiErrorCode.NOT_FOUND || this.statusCode === 404;
  }

  /**
   * Check if error is server related
   */
  get isServerError(): boolean {
    return (
      this.errorCode === ApiErrorCode.INTERNAL_ERROR || this.statusCode >= 500
    );
  }

  /**
   * Get user-friendly error message
   */
  getUserMessage(t: (key: string, fallback?: string) => string): string {
    switch (this.errorCode) {
      case ApiErrorCode.AUTH_REQUIRED:
        return t("errors.authRequired", "Please log in to continue");

      case ApiErrorCode.ACCESS_DENIED:
        return t(
          "errors.accessDenied",
          "You don't have permission to perform this action"
        );

      case ApiErrorCode.VALIDATION_ERROR:
        if (this.errors) {
          // Return first validation error
          const firstError = Object.values(this.errors)[0];
          return firstError || this.message;
        }
        return t(
          "errors.validationFailed",
          "Please check your input and try again"
        );

      case ApiErrorCode.NOT_FOUND:
        return t("errors.notFound", "The requested resource was not found");

      case ApiErrorCode.RATE_LIMITED:
        return t(
          "errors.rateLimited",
          "Too many requests. Please wait and try again"
        );

      case ApiErrorCode.DISCORD_OAUTH_ERROR:
        return t(
          "errors.discordOAuth",
          "Discord authentication failed. Please try again"
        );

      case ApiErrorCode.CHAT_ROOM_FULL:
        return t("errors.chatRoomFull", "This chat room is full");

      case ApiErrorCode.MESSAGE_TOO_LONG:
        return t("errors.messageTooLong", "Message is too long");

      case ApiErrorCode.FILE_TOO_LARGE:
        return t("errors.fileTooLarge", "File is too large");

      case ApiErrorCode.INVALID_FILE_TYPE:
        return t("errors.invalidFileType", "Invalid file type");

      case ApiErrorCode.INTERNAL_ERROR:
      default:
        return t(
          "errors.serverError",
          "Something went wrong. Please try again later"
        );
    }
  }

  /**
   * Get all validation errors as formatted object
   */
  getValidationErrors(): Record<string, string> {
    return this.errors || {};
  }
}

/**
 * Enhanced error handler utility
 */
export class ErrorHandler {
  /**
   * Handle API response and throw ApiError if not successful
   */
  static async handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get("content-type");
    const isJson = contentType?.includes("application/json");

    if (response.ok) {
      if (isJson) {
        const data = await response.json();
        // Handle both wrapped and unwrapped success responses
        return data.data !== undefined ? data.data : data;
      }
      return {} as T;
    }

    // Handle error responses
    let errorData: ApiErrorResponse;

    if (isJson) {
      errorData = await response.json();
    } else {
      // Fallback for non-JSON error responses
      const text = await response.text();
      errorData = {
        success: false,
        message: text || response.statusText || "Unknown error",
        errorCode: ErrorHandler.getErrorCodeFromStatus(response.status),
      };
    }

    throw ApiError.fromResponse(errorData, response.status);
  }

  /**
   * Get error code based on HTTP status
   */
  private static getErrorCodeFromStatus(status: number): string {
    switch (status) {
      case 401:
        return ApiErrorCode.AUTH_REQUIRED;
      case 403:
        return ApiErrorCode.ACCESS_DENIED;
      case 400:
        return ApiErrorCode.VALIDATION_ERROR;
      case 404:
        return ApiErrorCode.NOT_FOUND;
      case 429:
        return ApiErrorCode.RATE_LIMITED;
      case 409:
        return ApiErrorCode.CONFLICT;
      default:
        return status >= 500 ? ApiErrorCode.INTERNAL_ERROR : "UNKNOWN_ERROR";
    }
  }

  /**
   * Handle network and other non-HTTP errors
   */
  static handleNetworkError(error: unknown): ApiError {
    if (error instanceof ApiError) {
      return error;
    }

    if (error instanceof Error) {
      // Network errors, CORS errors, etc.
      if (error.name === "TypeError" && error.message.includes("fetch")) {
        return new ApiError(
          "Network error. Please check your connection",
          "NETWORK_ERROR",
          0
        );
      }

      return new ApiError(error.message, "UNKNOWN_ERROR", 0);
    }

    return new ApiError("An unexpected error occurred", "UNKNOWN_ERROR", 0);
  }

  /**
   * Log error for debugging purposes
   */
  static logError(error: ApiError, context?: string): void {
    const logData = {
      message: error.message,
      errorCode: error.errorCode,
      statusCode: error.statusCode,
      errors: error.errors,
      context,
      timestamp: new Date().toISOString(),
    };

    if (import.meta.env.DEV) {
      console.error("API Error:", logData);
    }

    // In production, you might want to send this to a logging service
    // Example: sendToLoggingService(logData);
  }
}

/**
 * Retry configuration options with idempotency awareness
 */
export interface RetryOptions {
  maxAttempts?: number;
  delay?: number;
  backoffFactor?: number;
  retryCondition?: (error: ApiError) => boolean;
  /** Whether the operation is idempotent (safe to retry) */
  isIdempotent?: boolean;
  /** Custom idempotency key for operations that may be safely retried */
  idempotencyKey?: string;
}

/**
 * Enhanced retry utility for failed requests with idempotency awareness
 */
export class RetryHandler {
  /**
   * Retry a function with exponential backoff and idempotency awareness
   */
  static async retry<T>(
    fn: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<T> {
    const {
      maxAttempts = 3,
      delay = 1000,
      backoffFactor = 2,
      isIdempotent = false, // Default to false for safety
      retryCondition = (error) => error.isServerError && !error.isAuthError,
    } = options;

    // Enhanced retry condition that considers idempotency
    const shouldRetry = (error: ApiError, attempt: number): boolean => {
      // Don't retry on the last attempt
      if (attempt >= maxAttempts) return false;

      // Don't retry auth errors (they won't resolve by retrying)
      if (error.isAuthError || error.isAuthorizationError) return false;

      // For non-idempotent operations, only retry on network/server errors
      // and avoid retrying client errors (4xx) except for timeouts
      if (!isIdempotent) {
        return error.isServerError || error.errorCode === "NETWORK_ERROR";
      }

      // For idempotent operations, use the custom retry condition
      return retryCondition(error);
    };

    let lastError: ApiError;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        const apiError =
          error instanceof ApiError
            ? error
            : ErrorHandler.handleNetworkError(error);

        lastError = apiError;

        // Use enhanced retry condition
        if (!shouldRetry(apiError, attempt)) {
          if (import.meta.env.DEV) {
            console.debug(
              `🚫 Not retrying request (attempt ${attempt}/${maxAttempts}):`,
              {
                error: apiError.message,
                errorCode: apiError.errorCode,
                isIdempotent,
                reason:
                  attempt >= maxAttempts
                    ? "max attempts reached"
                    : "retry condition failed",
              }
            );
          }
          throw apiError;
        }

        // Log retry attempt in development
        if (import.meta.env.DEV) {
          console.debug(
            `🔄 Retrying request (attempt ${attempt}/${maxAttempts}):`,
            {
              error: apiError.message,
              errorCode: apiError.errorCode,
              isIdempotent,
              waitTime: delay * Math.pow(backoffFactor, attempt - 1),
            }
          );
        }

        // Wait before retrying with exponential backoff
        const waitTime = delay * Math.pow(backoffFactor, attempt - 1);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }

    throw lastError!;
  }

  /**
   * Determine if an HTTP method is naturally idempotent
   */
  static isMethodIdempotent(method: string): boolean {
    const idempotentMethods = ["GET", "HEAD", "OPTIONS", "PUT", "DELETE"];
    return idempotentMethods.includes(method.toUpperCase());
  }

  /**
   * Create safe retry options for a given HTTP method
   */
  static createRetryOptions(
    method: string,
    customOptions: Partial<RetryOptions> = {}
  ): RetryOptions {
    const isIdempotent = this.isMethodIdempotent(method);

    return {
      maxAttempts: 3,
      delay: 1000,
      backoffFactor: 2,
      isIdempotent,
      ...customOptions,
    };
  }
}
