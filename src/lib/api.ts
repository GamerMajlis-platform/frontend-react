const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

export class ApiError extends Error {
  status?: number;
  data?: unknown;
  constructor(message: string, status?: number, data?: unknown) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

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
    // try to extract an error message from the parsed JSON if available
    let errMsg: string | undefined = undefined;
    if (typeof data === "object" && data !== null) {
      const obj = data as Record<string, unknown>;
      const maybeError = obj["error"];
      if (typeof maybeError === "string") errMsg = maybeError;
    }
    const finalMsg = errMsg || res.statusText || "API Error";
    throw new ApiError(finalMsg, res.status, data);
  }

  return data as T;
}
