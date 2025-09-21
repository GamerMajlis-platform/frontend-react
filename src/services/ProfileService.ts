// Profile Service - Handles profile-related API communication
import { apiFetch, createFormData } from "../lib/api";
import { API_ENDPOINTS } from "../config/constants";
import { AuthService } from "./AuthService";
import type {
  User,
  ProfileResponse,
  BackendResponse,
  UpdateProfileData,
} from "../types/auth";

export interface GamingStats {
  totalGames?: number;
  winRate?: number;
  favoriteMap?: string;
  [key: string]: unknown;
}

export class ProfileService {
  /**
   * Get current user's full profile
   */
  static async getMyProfile(): Promise<User> {
    try {
      const data = await apiFetch<ProfileResponse>(API_ENDPOINTS.profile.me);
      if (data.success && data.user) {
        return data.user;
      }
      throw new Error(data.message || "Failed to get profile");
    } catch (err) {
      console.error("Get profile error:", err);
      throw err;
    }
  }

  /**
   * Get any user's profile by ID
   */
  static async getUserProfile(userId: number): Promise<User> {
    try {
      const data = await apiFetch<ProfileResponse>(
        `${API_ENDPOINTS.profile.byId}/${userId}`
      );
      if (data.success && data.user) {
        return data.user;
      }
      throw new Error(data.message || "Failed to get user profile");
    } catch (err) {
      console.error("Get user profile error:", err);
      throw err;
    }
  }

  /**
   * Update current user's profile
   */
  static async updateProfile(profileData: UpdateProfileData): Promise<User> {
    try {
      const formData = createFormData(profileData as Record<string, string>);

      const data = await apiFetch<ProfileResponse>(API_ENDPOINTS.profile.me, {
        method: "PUT",
        body: formData,
        useFormData: true,
      });

      if (data.success && data.user) {
        // Update localStorage with new user data
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          try {
            const currentUser = JSON.parse(storedUser);
            const updatedUser = { ...currentUser, ...data.user };
            localStorage.setItem("user", JSON.stringify(updatedUser));
          } catch (e) {
            console.warn("Failed to update stored user data:", e);
          }
        }
        return data.user;
      }
      throw new Error(data.message || "Failed to update profile");
    } catch (err) {
      console.error("Update profile error:", err);
      throw err;
    }
  }

  /**
   * Upload profile picture
   */
  static async uploadProfilePicture(file: File): Promise<string> {
    try {
      if (!file) {
        throw new Error("No file provided");
      }

      // Test authentication first
      try {
        const currentUser = await AuthService.getCurrentUser();
        console.log(
          "✅ Authentication verified for upload",
          currentUser?.email
        );
      } catch (authErr) {
        console.error("❌ Authentication failed before upload:", authErr);
        throw new Error("Please log in again before uploading");
      }

      // Validate file type
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
      ];
      if (!allowedTypes.includes(file.type)) {
        throw new Error(
          "Invalid file type. Please upload JPG, PNG, or GIF files only."
        );
      }

      // Validate file size (10MB limit)
      const maxSize = 10 * 1024 * 1024; // 10MB in bytes
      if (file.size > maxSize) {
        throw new Error("File is too large. Maximum size is 10MB.");
      }

      const formData = new FormData();
      formData.append("file", file);

      // Debug logging
      console.log("📤 Upload Debug Info:");
      console.log("File name:", file.name);
      console.log("File type:", file.type);
      console.log("File size:", file.size, "bytes");
      console.log("File size (MB):", (file.size / (1024 * 1024)).toFixed(2));
      console.log("FormData entries:");
      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(
            `  ${key}: File(${value.name}, ${value.type}, ${value.size})`
          );
        } else {
          console.log(`  ${key}:`, value);
        }
      }
      console.log("Endpoint:", API_ENDPOINTS.profile.uploadPicture);

      const data = await apiFetch<
        BackendResponse & { profilePictureUrl: string }
      >(API_ENDPOINTS.profile.uploadPicture, {
        method: "POST",
        body: formData,
        useFormData: true,
      });

      console.log("Upload response:", data);

      if (data.success && data.profilePictureUrl) {
        return data.profilePictureUrl;
      }

      // Improved error reporting
      console.error("❌ Upload failed - Backend response:", {
        success: data.success,
        message: data.message,
        profilePictureUrl: data.profilePictureUrl,
        hasProfilePictureUrl: "profilePictureUrl" in data,
        fullResponse: data,
      });

      // Provide more specific error messages based on backend response
      const userMessage =
        data.message === "Failed to upload profile picture"
          ? "Unable to upload image. The backend server couldn't process the file. Please contact support."
          : data.message || "Upload failed. Please try again.";

      throw new Error(userMessage);
    } catch (err) {
      console.error("Upload profile picture error:", err);

      // Handle different types of errors
      if (err instanceof Error) {
        // If it's already a user-friendly message, keep it
        if (err.message.includes("Please") || err.message.includes("Unable")) {
          throw err;
        }
        throw new Error(`Failed to upload profile picture: ${err.message}`);
      }
      throw new Error("Failed to upload profile picture: Unknown error");
    }
  }

  /**
   * Remove profile picture
   */
  static async removeProfilePicture(): Promise<void> {
    try {
      const data = await apiFetch<BackendResponse>(
        `${API_ENDPOINTS.profile.me}/profile-picture`,
        {
          method: "DELETE",
        }
      );

      if (!data.success) {
        throw new Error(data.message || "Failed to remove profile picture");
      }
    } catch (err) {
      console.error("Remove profile picture error:", err);
      throw err;
    }
  }

  /**
   * Update gaming statistics
   */
  static async updateGamingStats(stats: GamingStats): Promise<string> {
    try {
      const formData = createFormData({
        gamingStatistics: JSON.stringify(stats),
      });

      const data = await apiFetch<
        BackendResponse & { gamingStatistics: string }
      >(`${API_ENDPOINTS.profile.me}/gaming-stats`, {
        method: "POST",
        body: formData,
        useFormData: true,
      });

      if (data.success && data.gamingStatistics) {
        return data.gamingStatistics;
      }
      throw new Error(data.message || "Failed to update gaming statistics");
    } catch (err) {
      console.error("Update gaming stats error:", err);
      throw err;
    }
  }

  /**
   * Parse JSON fields from user object
   */
  static parseUserJsonFields(user: User) {
    const parseJsonField = (field: string | undefined) => {
      try {
        return field ? JSON.parse(field) : {};
      } catch {
        return {};
      }
    };

    return {
      ...user,
      parsedGamingPreferences: parseJsonField(user.gamingPreferences),
      parsedSocialLinks: parseJsonField(user.socialLinks),
      parsedGamingStatistics: parseJsonField(user.gamingStatistics),
      parsedPrivacySettings: parseJsonField(user.privacySettings),
    };
  }
}
