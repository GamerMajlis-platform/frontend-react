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

import { apiFetch, ApiError } from "../lib/api";

export class AuthService {
  /**
   * Register a new user
   */
  static async register(
    displayName: string,
    email: string,
    password: string
  ): Promise<AuthResponse> {
    try {
      const data = await apiFetch<AuthResponse>("/auth/register", {
        method: "POST",
        body: JSON.stringify({ displayName, email, password }),
      });

      this.storeAuthData(data);
      return data;
    } catch (err) {
      if (err instanceof ApiError) {
        let errorMessage = "Registration failed";
        if (err.status === 409) {
          errorMessage = "Email or username already exists";
        } else if (err.status && err.status >= 500) {
          errorMessage = "Server error. Please try again later.";
        } else if (err.message) {
          errorMessage = err.message;
        }
        throw new Error(errorMessage);
      }
      throw err;
    }
  }

  /**
   * Login user
   */
  static async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const data = await apiFetch<AuthResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      this.storeAuthData(data);
      return data;
    } catch (err) {
      if (err instanceof ApiError) {
        let errorMessage = "Login failed";
        if (err.status === 401) {
          errorMessage = "Invalid email or password";
        } else if (err.status && err.status >= 500) {
          errorMessage = "Server error. Please try again later.";
        } else if (err.message) {
          errorMessage = err.message;
        }
        throw new Error(errorMessage);
      }
      throw err;
    }
  }

  /**
   * Logout user
   */
  static async logout(): Promise<void> {
    try {
      // Call backend logout endpoint
      await apiFetch("/auth/logout", { method: "POST" });
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
    const userData = localStorage.getItem("user");
    if (!userData) return null;

    try {
      return JSON.parse(userData) as User;
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
