// Authentication Service - Handles all API communication
export interface User {
  id: string;
  displayName: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface AuthError {
  error: string;
}

// Configuration
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

export class AuthService {
  /**
   * Register a new user
   */
  static async register(
    displayName: string,
    email: string,
    password: string
  ): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        displayName,
        email,
        password,
      }),
    });

    if (!response.ok) {
      let errorMessage = "Registration failed";

      try {
        const errorData: AuthError = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch {
        // If JSON parsing fails, use status-based messages
        if (response.status === 409) {
          errorMessage = "Email or username already exists";
        } else if (response.status >= 500) {
          errorMessage = "Server error. Please try again later.";
        }
      }

      throw new Error(errorMessage);
    }

    const data: AuthResponse = await response.json();

    // Store authentication data
    this.storeAuthData(data);

    return data;
  }

  /**
   * Login user
   */
  static async login(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    if (!response.ok) {
      let errorMessage = "Login failed";

      try {
        const errorData: AuthError = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch {
        // Status-based error messages
        if (response.status === 401) {
          errorMessage = "Invalid email or password";
        } else if (response.status >= 500) {
          errorMessage = "Server error. Please try again later.";
        }
      }

      throw new Error(errorMessage);
    }

    const data: AuthResponse = await response.json();

    // Store authentication data
    this.storeAuthData(data);

    return data;
  }

  /**
   * Logout user
   */
  static async logout(): Promise<void> {
    const token = this.getStoredToken();

    try {
      // Call backend logout endpoint
      await fetch(`${API_BASE}/auth/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      // Continue with local logout even if backend call fails
      console.warn("Backend logout failed:", error);
    } finally {
      // Always clear local storage
      this.clearAuthData();
    }
  }

  /**
   * Store authentication data in localStorage
   */
  private static storeAuthData(data: AuthResponse): void {
    localStorage.setItem("authToken", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
  }

  /**
   * Clear all authentication data
   */
  private static clearAuthData(): void {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
  }

  /**
   * Get stored token
   */
  static getStoredToken(): string | null {
    return localStorage.getItem("authToken");
  }

  /**
   * Get stored user data
   */
  static getStoredUser(): User | null {
    const userData = localStorage.getItem("userData");
    if (!userData) return null;

    try {
      return JSON.parse(userData);
    } catch {
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    const token = this.getStoredToken();
    const user = this.getStoredUser();
    return !!(token && user);
  }

  /**
   * Make authenticated API requests
   */
  static async authenticatedFetch(
    url: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const token = this.getStoredToken();

    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    // Handle token expiration
    if (response.status === 401) {
      this.clearAuthData();
      window.location.hash = "#login";
      throw new Error("Session expired. Please login again.");
    }

    return response;
  }
}
