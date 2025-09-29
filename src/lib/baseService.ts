/**
 * Base Service Class
 *
 * Provides common patterns and utilities for all domain services,
 * ensuring consistent error handling, logging, and API interaction patterns.
 */

import { apiFetch, type ApiOptions } from "./api";
import { ApiError, RetryHandler } from "./errors";
import { UserStorage } from "./userStorage";

export abstract class BaseService {
  /**
   * Make an authenticated API request
   * Ensures user is authenticated before making the request
   */
  protected static async authenticatedRequest<T>(
    endpoint: string,
    options: ApiOptions = {}
  ): Promise<T> {
    // Debug: surface whether a valid session/token exists
    // (do not print the token value)
    try {
      console.debug(
        "BaseService.authenticatedRequest - hasValidSession",
        UserStorage.hasValidSession(),
        "hasStoredToken",
        !!UserStorage.getStoredToken()
      );
    } catch {
      // ignore debug errors
    }

    // Check authentication before making request
    if (!UserStorage.hasValidSession()) {
      throw new ApiError("Authentication required", "AUTH_REQUIRED", 401);
    }

    return apiFetch<T>(endpoint, options);
  }

  /**
   * Make a request with safe retry configuration based on HTTP method
   */
  protected static async requestWithRetry<T>(
    endpoint: string,
    options: ApiOptions = {}
  ): Promise<T> {
    const method = options.method || "GET";

    // Create method-aware retry options if not provided
    if (!options.retryOptions) {
      options.retryOptions = RetryHandler.createRetryOptions(method, {
        maxAttempts: 2, // Conservative default
      });
    }

    return apiFetch<T>(endpoint, options);
  }

  /**
   * Handle service-level errors with consistent logging
   */
  protected static handleServiceError(
    error: unknown,
    context: string,
    operation: string
  ): never {
    if (error instanceof ApiError) {
      console.error(`❌ ${context} - ${operation} failed:`, {
        message: error.message,
        errorCode: error.errorCode,
        statusCode: error.statusCode,
        context,
        operation,
      });
      throw error;
    }

    const serviceError = new ApiError(
      `${operation} failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
      "SERVICE_ERROR",
      0
    );

    console.error(`❌ ${context} - ${operation} failed:`, {
      originalError: error,
      context,
      operation,
    });

    throw serviceError;
  }

  /**
   * Log successful service operations (development only)
   */
  protected static logSuccess(
    context: string,
    operation: string,
    details?: Record<string, unknown>
  ): void {
    if (import.meta.env.DEV) {
      console.log(`✅ ${context} - ${operation} successful`, details || {});
    }
  }

  /**
   * Validate required parameters
   */
  protected static validateRequired(params: Record<string, unknown>): void {
    const missing = Object.entries(params)
      .filter(
        ([, value]) => value === undefined || value === null || value === ""
      )
      .map(([key]) => key);

    if (missing.length > 0) {
      throw new ApiError(
        `Missing required parameters: ${missing.join(", ")}`,
        "VALIDATION_ERROR",
        400
      );
    }
  }

  /**
   * Create form data with optional file validation
   */
  protected static createFormData(
    data: Record<string, string | Blob | File>,
    validateFiles = true
  ): FormData {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (value instanceof File && validateFiles) {
        // Basic file validation
        if (value.size === 0) {
          throw new ApiError(`File "${key}" is empty`, "VALIDATION_ERROR", 400);
        }
      }
      formData.append(key, value);
    });

    return formData;
  }
}
