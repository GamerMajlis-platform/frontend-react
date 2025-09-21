import { API_CONFIG } from "../config/constants";

const API_BASE = import.meta.env.VITE_API_URL || API_CONFIG.baseUrl;

export class ApiError extends Error {
  status?: number;
  data?: unknown;
  constructor(message: string, status?: number, data?: unknown) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

export interface ApiOptions extends RequestInit {
  useFormData?: boolean;
}

export async function apiFetch<T = unknown>(
  path: string,
  options: ApiOptions = {}
): Promise<T> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

  const { useFormData = false, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    ...(fetchOptions.headers as Record<string, string>),
  };

  // Only set Content-Type to JSON if not using form data
  if (!useFormData && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...fetchOptions,
    headers,
  });

  // Debug multipart uploads
  if (fetchOptions.body instanceof FormData) {
    console.log("🔍 Multipart Upload Debug:");
    console.log("URL:", `${API_BASE}${path}`);
    console.log("Method:", fetchOptions.method || "GET");
    console.log("Headers sent:", headers);
    console.log("Body type:", typeof fetchOptions.body);
    console.log("FormData entries:", [...fetchOptions.body.entries()]);
  }

  const text = await res.text();
  const contentType = res.headers.get("content-type") || "";
  let data: unknown = undefined;

  if (contentType.includes("application/json") && text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  } else {
    data = text;
  }

  if (!res.ok) {
    // Extract error message from response
    let errMsg: string | undefined = undefined;
    if (typeof data === "object" && data !== null) {
      const obj = data as Record<string, unknown>;
      const maybeError = obj["error"] || obj["message"];
      if (typeof maybeError === "string") errMsg = maybeError;
    }

    const finalMsg = errMsg || res.statusText || "API Error";
    throw new ApiError(finalMsg, res.status, data);
  }

  return data as T;
}

// Helper function to create FormData from object
export function createFormData(data: Record<string, string | Blob>): FormData {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    formData.append(key, value);
  });
  return formData;
}
