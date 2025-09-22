import { API_CONFIG, STORAGE_KEYS } from "../config/constants";
import { ErrorHandler, RetryHandler } from "./errors";

// Use the unified env var `VITE_API_BASE_URL` if set, otherwise fall back to constant
const API_BASE = import.meta.env.VITE_API_BASE_URL || API_CONFIG.baseUrl;

// Log API configuration on startup
console.log("🔧 API Configuration:", {
  baseUrl: API_BASE,
  environment: import.meta.env.NODE_ENV || "development",
  timeout: API_CONFIG.timeout,
});

export interface ApiOptions extends RequestInit {
  useFormData?: boolean;
  retryOptions?: {
    maxAttempts?: number;
    delay?: number;
    backoffFactor?: number;
  };
}

export async function apiFetch<T = unknown>(
  path: string,
  options: ApiOptions = {}
): Promise<T> {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem(STORAGE_KEYS.auth)
      : null;

  const { useFormData = false, retryOptions, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    ...((fetchOptions.headers as Record<string, string>) || {}),
  };

  // Only set Content-Type to JSON if not using form data
  if (!useFormData && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const makeRequest = async (): Promise<T> => {
    try {
      const url = `${API_BASE}${path}`;
      console.log(`🌐 API Request: ${fetchOptions.method || "GET"} ${url}`);

      const res = await fetch(url, {
        ...fetchOptions,
        headers,
      });

      console.log(
        `📡 API Response: ${res.status} ${res.statusText} for ${
          fetchOptions.method || "GET"
        } ${path}`
      );

      return await ErrorHandler.handleResponse<T>(res);
    } catch (error) {
      console.error(
        `❌ API Error for ${fetchOptions.method || "GET"} ${path}:`,
        error
      );
      const apiError = ErrorHandler.handleNetworkError(error);
      ErrorHandler.logError(
        apiError,
        `apiFetch: ${fetchOptions.method || "GET"} ${path}`
      );
      throw apiError;
    }
  };

  // Apply retry logic if specified
  if (retryOptions) {
    return RetryHandler.retry(makeRequest, retryOptions);
  }

  return makeRequest();
}

// Re-export ApiError for backward compatibility
export { ApiError } from "./errors";

// Helper function to create FormData from object
export function createFormData(data: Record<string, string | Blob>): FormData {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    formData.append(key, value);
  });
  return formData;
}
