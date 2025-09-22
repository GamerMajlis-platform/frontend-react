// Authentication Service - Handles all API communication
import { apiFetch, ApiError, createFormData } from "../lib/api";
import { API_ENDPOINTS, STORAGE_KEYS } from "../config/constants";
import { SessionService } from "./SessionService";
import type {
  User,
  LoginResponse,
  SignupResponse,
  ProfileResponse,
  TokenValidationResponse,
  BackendResponse,
} from "../types/auth";

export class AuthService {
  /**
   * Register a new user
   */
  static async register(
    displayName: string,
    email: string,
    password: string
  ): Promise<SignupResponse> {
    try {
      const formData = createFormData({
        displayName,
        email,
        password,
      });

      const data = await apiFetch<SignupResponse>(API_ENDPOINTS.auth.signup, {
        method: "POST",
        body: formData,
        useFormData: true,
      });

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
  static async login(
    identifier: string,
    password: string
  ): Promise<LoginResponse> {
    try {
      const formData = createFormData({
        identifier, // Can be email or displayName
        password,
      });

      const data = await apiFetch<LoginResponse>(API_ENDPOINTS.auth.login, {
        method: "POST",
        body: formData,
        useFormData: true,
      });

      if (data.success && data.token && data.user) {
        this.storeAuthData(data);
      }

      return data;
    } catch (err) {
      if (err instanceof ApiError) {
        let errorMessage = "Login failed";
        if (err.status === 401) {
          errorMessage = "Invalid email/username or password";
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
      await apiFetch<BackendResponse>(API_ENDPOINTS.auth.logout, {
        method: "POST",
      });
    } catch (error) {
      // Continue with local logout even if backend call fails
      console.warn("Backend logout failed:", error);
    } finally {
      // Always clear session and local storage
      try {
        SessionService.clearSession();
      } catch {
        // Fallback to clearing auth data directly
        this.clearAuthData();
      }
    }
  }

  /**
   * Get current user from backend
   */
  static async getCurrentUser(): Promise<User> {
    try {
      const data = await apiFetch<ProfileResponse>(API_ENDPOINTS.auth.me);
      if (data.success && data.user) {
        return data.user;
      }
      throw new Error("Failed to get user data");
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        this.clearAuthData();
        throw new Error("Session expired. Please login again.");
      }
      throw err;
    }
  }

  /**
   * Validate current token
   */
  static async validateToken(): Promise<boolean> {
    try {
      const token = this.getStoredToken();
      if (!token) return false;

      const data = await apiFetch<TokenValidationResponse>(
        API_ENDPOINTS.auth.validateToken
      );
      return data.valid;
    } catch (err) {
      console.warn("Token validation failed:", err);
      this.clearAuthData();
      return false;
    }
  }

  /**
   * Store authentication data in localStorage
   */
  private static storeAuthData(data: LoginResponse): void {
    try {
      localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(data.user));
      // Persist token via SessionService so timer/storage is consistent
      if (data.token) {
        try {
          SessionService.storeToken(data.token);
        } catch {
          // Fallback to direct storage if SessionService unavailable
          localStorage.setItem(STORAGE_KEYS.auth, data.token);
        }
      }
    } catch {
      console.warn("Failed to persist auth data");
    }
  }

  /**
   * Clear all authentication data
   */
  private static clearAuthData(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.auth);
      localStorage.removeItem(STORAGE_KEYS.user);
    } catch {
      console.warn("Failed to clear auth data");
    }
  }

  /**
   * Get stored token
   */
  static getStoredToken(): string | null {
    try {
      return localStorage.getItem(STORAGE_KEYS.auth);
    } catch {
      return null;
    }
  }

  /**
   * Get stored user data
   */
  static getStoredUser(): User | null {
    const userData = (() => {
      try {
        return localStorage.getItem(STORAGE_KEYS.user);
      } catch {
        return null;
      }
    })();
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
   * Make authenticated API requests (deprecated - use apiFetch instead)
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
      // Redirect to login using a safe method instead of hash manipulation
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("auth-redirect-login"));
      }
      throw new Error("Session expired. Please login again.");
    }

    return response;
  }
}