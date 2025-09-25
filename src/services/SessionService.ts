// Session Management Service - Handles token validation and session lifecycle
import { BaseService } from "../lib/baseService";
import { API_ENDPOINTS } from "../config/constants";
import { SecureStorage, UserStorage } from "../lib";
import type { BackendResponse } from "../types/auth";

interface TokenValidationResponse extends BackendResponse {
  valid: boolean;
  userId: number;
  username: string;
}

export class SessionService extends BaseService {
  private static readonly REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes
  private static readonly SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours
  private static readonly ACTIVITY_CHECK_INTERVAL = 60 * 1000; // 1 minute
  private static refreshTimer: number | null = null;
  private static activityTimer: number | null = null;
  private static lastActivity: number = Date.now();

  /**
   * Initialize session management - validate token and start refresh timer
   */
  static async initializeSession(): Promise<boolean> {
    try {
      // Migrate legacy storage format if needed
      UserStorage.migrateLegacyStorage();

      const token = this.getStoredToken();
      if (!token) {
        return false;
      }

      // Check if session has expired due to inactivity
      if (this.isSessionExpiredByInactivity()) {
        this.clearSession();
        return false;
      }

      const isValid = await this.validateToken();

      if (isValid) {
        this.startTokenRefreshTimer();
        this.startActivityMonitoring();
        this.updateLastActivity();
        return true;
      } else {
        this.clearSession();
        return false;
      }
    } catch (error) {
      console.error("Session initialization failed:", error);
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
      const response = await this.authenticatedRequest<TokenValidationResponse>(
        API_ENDPOINTS.auth.validateToken,
        { method: "GET" }
      );
      if (import.meta.env.DEV) {
        console.log("🔍 Token validation response:", {
          valid: response.valid,
          userId: response.userId,
          username: response.username,
        });
      }
      return response.valid === true;
    } catch (error) {
      this.handleServiceError(error, "SessionService", "validateToken");
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
      if (import.meta.env.DEV) {
        console.log("🔄 Performing scheduled token validation...");
      }
      const isValid = await this.validateToken();

      if (!isValid) {
        if (import.meta.env.DEV) {
          console.log("❌ Token expired - logging user out");
        }
        // Trigger logout through event system
        window.dispatchEvent(new CustomEvent("session:expired"));
      } else if (import.meta.env.DEV) {
        console.log("✅ Token still valid");
      }
    }, this.REFRESH_INTERVAL);

    if (import.meta.env.DEV) {
      console.log(
        `⏰ Token refresh timer started (${
          this.REFRESH_INTERVAL / 1000
        }s interval)`
      );
    }
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
    return UserStorage.getStoredToken();
  }

  /**
   * Store authentication token
   */
  static storeToken(token: string): void {
    try {
      SecureStorage.setToken(token);
    } catch (error) {
      console.error("Failed to store token:", error);
    }
  }

  /**
   * Clear all session data
   */
  static clearSession(): void {
    try {
      // Use UserStorage for atomic session clearing
      UserStorage.clearUserSession();

      // Stop timers
      this.stopTokenRefreshTimer();

      if (this.activityTimer) {
        clearInterval(this.activityTimer);
        this.activityTimer = null;
      }
    } catch (error) {
      console.error("Failed to clear session:", error);
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
      await this.authenticatedRequest<BackendResponse>(
        API_ENDPOINTS.auth.logout,
        {
          method: "POST",
        }
      );
      this.logSuccess("SessionService", "logout");
    } catch (error) {
      this.handleServiceError(error, "SessionService", "logout");
    } finally {
      this.clearSession();
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

  /**
   * Check if session has expired due to 24-hour inactivity
   */
  private static isSessionExpiredByInactivity(): boolean {
    const lastActivityTime = localStorage.getItem("lastActivity");
    if (!lastActivityTime) {
      return false; // No activity recorded, assume fresh session
    }

    const timeSinceLastActivity = Date.now() - parseInt(lastActivityTime, 10);
    return timeSinceLastActivity > this.SESSION_TIMEOUT;
  }

  /**
   * Update last activity timestamp
   */
  private static updateLastActivity(): void {
    this.lastActivity = Date.now();
    localStorage.setItem("lastActivity", this.lastActivity.toString());
  }

  /**
   * Start monitoring user activity for 24-hour timeout
   */
  private static startActivityMonitoring(): void {
    // Clear existing timer
    if (this.activityTimer) {
      clearInterval(this.activityTimer);
    }

    // Update activity on user interactions
    const updateActivity = () => this.updateLastActivity();

    // Listen to various user activity events
    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ];
    events.forEach((event) => {
      document.addEventListener(event, updateActivity, { passive: true });
    });

    // Check for session timeout periodically
    this.activityTimer = setInterval(() => {
      if (this.isSessionExpiredByInactivity()) {
        console.error("Session expired due to 24-hour inactivity");
        // Remove activity listeners
        events.forEach((event) => {
          document.removeEventListener(event, updateActivity);
        });
        this.clearSession();
        window.dispatchEvent(new CustomEvent("session:expired"));
      }
    }, this.ACTIVITY_CHECK_INTERVAL);
  }
}

export default SessionService;
