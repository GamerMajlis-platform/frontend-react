// Session Management Service - Handles token validation and session lifecycle
import { apiFetch } from "../lib/api";
import { API_ENDPOINTS } from "../config/constants";
import type { BackendResponse } from "../types/auth";

interface TokenValidationResponse extends BackendResponse {
  valid: boolean;
  userId: number;
  username: string;
}

export class SessionService {
  private static readonly TOKEN_KEY = "authToken";
  private static readonly REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes
  private static refreshTimer: number | null = null;

  /**
   * Initialize session management - validate token and start refresh timer
   */
  static async initializeSession(): Promise<boolean> {
    try {
      const token = this.getStoredToken();
      if (!token) {
        console.log("🔑 No stored token found - user not logged in");
        return false;
      }

      console.log("🔍 Validating stored token...");
      const isValid = await this.validateToken();

      if (isValid) {
        console.log("✅ Session restored successfully");
        this.startTokenRefreshTimer();
        return true;
      } else {
        console.log("❌ Stored token is invalid - clearing session");
        this.clearSession();
        return false;
      }
    } catch (error) {
      console.error("❌ Session initialization failed:", error);
      this.clearSession();
      return false;
    }
  }

  /**
   * Validate current token with backend
   */
  static async validateToken(): Promise<boolean> {
    try {
      const token = this.getStoredToken();
      if (!token) {
        return false;
      }

      const response = await apiFetch<TokenValidationResponse>(
        API_ENDPOINTS.auth.validateToken,
        {
          method: "GET",
        }
      );

      console.log("🔍 Token validation response:", {
        valid: response.valid,
        userId: response.userId,
        username: response.username,
      });

      return response.valid === true;
    } catch (error) {
      console.error("❌ Token validation failed:", error);
      return false;
    }
  }

  /**
   * Start automatic token validation timer
   */
  static startTokenRefreshTimer(): void {
    // Clear existing timer
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }

    this.refreshTimer = setInterval(async () => {
      console.log("🔄 Performing scheduled token validation...");
      const isValid = await this.validateToken();

      if (!isValid) {
        console.log("❌ Token expired - logging user out");
        // Trigger logout through event system
        window.dispatchEvent(new CustomEvent("session:expired"));
      } else {
        console.log("✅ Token still valid");
      }
    }, this.REFRESH_INTERVAL);

    console.log(
      `⏰ Token refresh timer started (${
        this.REFRESH_INTERVAL / 1000
      }s interval)`
    );
  }

  /**
   * Stop token refresh timer
   */
  static stopTokenRefreshTimer(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
      console.log("⏹️ Token refresh timer stopped");
    }
  }

  /**
   * Get stored authentication token
   */
  static getStoredToken(): string | null {
    try {
      return localStorage.getItem(this.TOKEN_KEY);
    } catch {
      return null;
    }
  }

  /**
   * Store authentication token
   */
  static storeToken(token: string): void {
    try {
      localStorage.setItem(this.TOKEN_KEY, token);
      console.log("💾 Token stored successfully");
    } catch (error) {
      console.error("❌ Failed to store token:", error);
    }
  }

  /**
   * Clear all session data
   */
  static clearSession(): void {
    try {
      localStorage.removeItem(this.TOKEN_KEY);
      this.stopTokenRefreshTimer();
      console.log("🧹 Session cleared");
    } catch (error) {
      console.error("❌ Failed to clear session:", error);
    }
  }

  /**
   * Check if user is currently logged in (has valid token)
   */
  static isLoggedIn(): boolean {
    const token = this.getStoredToken();
    return !!token;
  }

  /**
   * Logout user and clear session
   */
  static async logout(): Promise<void> {
    try {
      // Call backend logout endpoint
      await apiFetch<BackendResponse>(API_ENDPOINTS.auth.logout, {
        method: "POST",
      });
      console.log("✅ Backend logout successful");
    } catch (error) {
      console.error("❌ Backend logout failed:", error);
      // Continue with client-side logout even if backend fails
    } finally {
      // Always clear local session
      this.clearSession();
      // Trigger logout event
      window.dispatchEvent(new CustomEvent("session:logout"));
    }
  }

  /**
   * Handle session expiration
   */
  static onSessionExpired(callback: () => void): () => void {
    const handleExpiration = () => {
      this.clearSession();
      callback();
    };

    window.addEventListener("session:expired", handleExpiration);

    // Return cleanup function
    return () => {
      window.removeEventListener("session:expired", handleExpiration);
    };
  }

  /**
   * Handle logout events
   */
  static onLogout(callback: () => void): () => void {
    window.addEventListener("session:logout", callback);

    // Return cleanup function
    return () => {
      window.removeEventListener("session:logout", callback);
    };
  }
}

export default SessionService;
