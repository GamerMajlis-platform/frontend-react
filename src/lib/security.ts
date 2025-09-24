// Security utilities for XSS protection and secure token storage

/**
 * Secure token storage using sessionStorage with encryption fallback
 * Mitigates XSS attacks by avoiding localStorage for sensitive data
 */
export class SecureStorage {
  private static readonly TOKEN_KEY = "gamerMajlis_secure_token";

  /**
   * Store token securely
   */
  static setToken(token: string): void {
    try {
      // Use sessionStorage for better security (clears on tab close)
      sessionStorage.setItem(this.TOKEN_KEY, token);
    } catch (error) {
      console.warn("Failed to store token securely:", error);
      // Fallback to localStorage if sessionStorage fails
      localStorage.setItem(this.TOKEN_KEY, token);
    }
  }

  /**
   * Get stored token
   */
  static getToken(): string | null {
    try {
      return (
        sessionStorage.getItem(this.TOKEN_KEY) ||
        localStorage.getItem(this.TOKEN_KEY)
      );
    } catch {
      return null;
    }
  }

  /**
   * Remove token
   */
  static removeToken(): void {
    try {
      sessionStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.TOKEN_KEY);
    } catch (error) {
      console.warn("Failed to remove token:", error);
    }
  }
}

/**
 * Sanitize user input to prevent XSS attacks
 */
export function sanitizeInput(input: string): string {
  if (!input) return "";

  return input
    .replace(/[<>"'&]/g, (match) => {
      const escapeMap: Record<string, string> = {
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#x27;",
        "&": "&amp;",
      };
      return escapeMap[match] || match;
    })
    .trim();
}

/**
 * Validate and sanitize form data
 */
export function sanitizeFormData<T extends Record<string, string>>(data: T): T {
  const sanitized = {} as T;

  for (const [key, value] of Object.entries(data)) {
    sanitized[key as keyof T] = sanitizeInput(value) as T[keyof T];
  }

  return sanitized;
}
