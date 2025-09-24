import { API_CONFIG, STORAGE_KEYS } from "../config/constants";
import { ErrorHandler, RetryHandler } from "./errors";
import { SecureStorage } from "./security";

// Use the unified env var `VITE_API_BASE_URL` if set, otherwise fall back to constant
const API_BASE = import.meta.env.VITE_API_BASE_URL || API_CONFIG.baseUrl;

// Log API configuration on startup (dev-only)
if (import.meta.env.DEV) {
  console.debug("🔧 API Configuration:", {
    baseUrl: API_BASE,
    environment: import.meta.env.NODE_ENV || "development",
    timeout: API_CONFIG.timeout,
  });
}

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
  // Prefer secure token storage (sessionStorage) then fall back to legacy localStorage key
  const token =
    typeof window !== "undefined"
      ? SecureStorage.getToken() || localStorage.getItem(STORAGE_KEYS.auth)
      : null;

  const { useFormData = false, retryOptions, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    ...((fetchOptions.headers as Record<string, string>) || {}),
  };

  // Detect FormData body automatically to avoid incorrect Content-Type header
  const isFormDataBody =
    useFormData ||
    (typeof FormData !== "undefined" && fetchOptions.body instanceof FormData);

  // Only set Content-Type to JSON if not using form data and not already provided
  if (!isFormDataBody && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  } else if (isFormDataBody) {
    // Ensure we do NOT manually set Content-Type for FormData (browser will add boundary)
    if (headers["Content-Type"]) {
      delete headers["Content-Type"];
    }
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const makeRequest = async (): Promise<T> => {
    try {
      const url = `${API_BASE}${path}`;
      if (import.meta.env.DEV) {
        console.debug(`🌐 API Request: ${fetchOptions.method || "GET"} ${url}`);
      }

      if (
        import.meta.env.DEV &&
        isFormDataBody &&
        fetchOptions.body instanceof FormData
      ) {
        const debugEntries: Record<string, unknown> = {};
        fetchOptions.body.forEach((v, k) => {
          debugEntries[k] =
            v instanceof File
              ? { file: v.name, size: v.size, type: v.type }
              : v;
        });
        if (import.meta.env.DEV) {
          console.debug("🧪 FormData Payload:", debugEntries);
        }
      }

      const res = await fetch(url, {
        credentials: fetchOptions.credentials || "include",
        ...fetchOptions,
        headers,
      });

      if (import.meta.env.DEV) {
        console.debug(
          `📡 API Response: ${res.status} ${res.statusText} for ${
            fetchOptions.method || "GET"
          } ${path}`
        );
      }

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
