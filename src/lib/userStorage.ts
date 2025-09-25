/**
 * User Storage Utility
 *
 * Centralizes user data and token storage management to ensure atomic operations
 * and consistent storage/clearing across the application.
 */

import { SecureStorage } from "./security";
import { STORAGE_KEYS } from "../config/constants";
import type { User } from "../types/auth";

export class UserStorage {
  /**
   * Store user data and token atomically
   */
  static storeUserSession(user: User, token: string): void {
    try {
      // Store token securely first
      SecureStorage.setToken(token);

      // Then store user data
      localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));

      // Clear any legacy auth token storage
      localStorage.removeItem(STORAGE_KEYS.auth);

      console.log("✅ User session stored successfully");
    } catch (error) {
      console.error("Failed to store user session:", error);
      // If storing fails, clean up partial state
      this.clearUserSession();
      throw error;
    }
  }

  /**
   * Clear all user session data atomically
   */
  static clearUserSession(): void {
    try {
      // Remove token from secure storage
      SecureStorage.removeToken();

      // Remove legacy token storage (both keys for safety)
      localStorage.removeItem(STORAGE_KEYS.auth);

      // Remove user data
      localStorage.removeItem(STORAGE_KEYS.user);

      // Remove activity tracking
      localStorage.removeItem("lastActivity");

      console.log("✅ User session cleared successfully");
    } catch (error) {
      console.error("Failed to clear user session:", error);
      // Continue clearing what we can even if some operations fail
    }
  }

  /**
   * Get stored user data
   */
  static getStoredUser(): User | null {
    try {
      const userData = localStorage.getItem(STORAGE_KEYS.user);
      if (!userData) return null;

      return JSON.parse(userData) as User;
    } catch (error) {
      console.warn("Failed to parse stored user data:", error);
      return null;
    }
  }

  /**
   * Update stored user data (preserves token)
   */
  static updateStoredUser(user: User): void {
    try {
      localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
    } catch (error) {
      console.error("Failed to update stored user:", error);
      throw error;
    }
  }

  /**
   * Get stored token
   */
  static getStoredToken(): string | null {
    return SecureStorage.getToken() || localStorage.getItem(STORAGE_KEYS.auth);
  }

  /**
   * Check if user session exists (both user and token)
   */
  static hasValidSession(): boolean {
    const user = this.getStoredUser();
    const token = this.getStoredToken();
    return !!(user && token);
  }

  /**
   * Migrate legacy storage to new format
   */
  static migrateLegacyStorage(): void {
    try {
      const legacyToken = localStorage.getItem(STORAGE_KEYS.auth);
      const currentToken = SecureStorage.getToken();

      // If we have a legacy token but no current token, migrate it
      if (legacyToken && !currentToken) {
        SecureStorage.setToken(legacyToken);
        localStorage.removeItem(STORAGE_KEYS.auth);
        console.log("🔄 Migrated legacy token storage");
      }
    } catch (error) {
      console.warn("Failed to migrate legacy storage:", error);
    }
  }
}
