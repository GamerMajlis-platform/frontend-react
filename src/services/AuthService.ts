// Authentication Service - Handles all API communication
import { ApiError } from "../lib";
import { BaseService } from "../lib/baseService";
import { API_ENDPOINTS } from "../config/constants";
import { SessionService } from "./SessionService";
import { UserStorage } from "../lib";
import type { User, LoginResponse, SignupResponse } from "../types/auth";

export class AuthService extends BaseService {
  /**
   * Register a new user
   */
  static async register(
    displayName: string,
    email: string,
    password: string
  ): Promise<SignupResponse> {
    try {
      const formData = this.createFormData({
        displayName,
        email,
        password,
      });
      const data = (await this.requestWithRetry(API_ENDPOINTS.auth.signup, {
        method: "POST",
        body: formData,
      })) as SignupResponse;
      return data;
    } catch (err) {
      if (err instanceof ApiError) {
        let errorMessage = "Registration failed";
        if (err.statusCode === 409) {
          errorMessage = "Email or username already exists";
        } else if (err.statusCode && err.statusCode >= 500) {
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
      const formData = this.createFormData({
        identifier, // Can be email or displayName
        password,
      });
      const data = (await this.requestWithRetry(API_ENDPOINTS.auth.login, {
        method: "POST",
        body: formData,
      })) as LoginResponse;
      if (data.success && data.token && data.user) {
        this.storeAuthData(data);
      }
      return data;
    } catch (err) {
      if (err instanceof ApiError) {
        let errorMessage = "Login failed";
        if (err.statusCode === 401) {
          errorMessage = "Invalid email/username or password";
        } else if (err.statusCode && err.statusCode >= 500) {
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
      await this.requestWithRetry(API_ENDPOINTS.auth.logout, {
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
      const data = (await this.requestWithRetry(API_ENDPOINTS.auth.me)) as {
        success: boolean;
        user?: User;
      };
      if (data.success && data.user) {
        return data.user;
      }
      throw new Error("Failed to get user data");
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 401) {
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

      const data = (await this.requestWithRetry(
        API_ENDPOINTS.auth.validateToken
      )) as { valid: boolean };
      return data.valid;
    } catch (err) {
      console.warn("Token validation failed:", err);
      this.clearAuthData();
      return false;
    }
  }

  /**
   * Store authentication data using secure storage
   */
  private static storeAuthData(data: LoginResponse): void {
    try {
      if (data.user && data.token) {
        // Use UserStorage for atomic user+token storage
        UserStorage.storeUserSession(data.user, data.token);
      }
    } catch (error) {
      console.warn("Failed to persist auth data:", error);
      throw error;
    }
  }

  /**
   * Clear all authentication data
   */
  private static clearAuthData(): void {
    try {
      // Use UserStorage for consistent session clearing
      UserStorage.clearUserSession();
      // Also ensure SessionService timers are stopped
      SessionService.clearSession();
    } catch (error) {
      console.warn("Failed to clear auth data:", error);
    }
  }

  /**
   * Get stored token via UserStorage
   */
  static getStoredToken(): string | null {
    return UserStorage.getStoredToken();
  }

  /**
   * Get stored user data
   */
  static getStoredUser(): User | null {
    return UserStorage.getStoredUser();
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    return UserStorage.hasValidSession();
  }
}
