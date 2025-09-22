// Profile Service - Handles profile-related API communication
import { apiFetch, createFormData } from "../lib/api";
import { API_ENDPOINTS, STORAGE_KEYS } from "../config/constants";
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

export interface ProfileSearchParams {
  query: string;
  page?: number;
  size?: number;
}

export interface ProfileSearchResult {
  id: number;
  displayName: string;
  bio?: string;
  profilePictureUrl?: string;
  roles: string[];
  createdAt: string;
}

export interface ProfileSearchResponse extends BackendResponse {
  profiles: ProfileSearchResult[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export interface ProfileSuggestion {
  id: number;
  displayName: string;
  bio?: string;
  profilePictureUrl?: string;
}

export interface ProfileSuggestionsResponse extends BackendResponse {
  suggestions: ProfileSuggestion[];
}

export class ProfileService {
  /**
   * Get current user's full profile
   */
  static async getMyProfile(): Promise<User> {
    try {
      const data = await apiFetch<ProfileResponse>(API_ENDPOINTS.profile.me);
      if (data.success && data.user) {
        // Parse JSON fields and persist to storage
        const parsed = this.parseUserJsonFields(data.user);
        try {
          localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(parsed));
        } catch (err) {
          console.warn("Failed to persist user after fetch:", err);
        }
        return parsed as User;
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
        return this.parseUserJsonFields(data.user) as User;
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
        // Update localStorage with new user data using unified storage key
        try {
          const storedUser = localStorage.getItem(STORAGE_KEYS.user);
          if (storedUser) {
            const currentUser = JSON.parse(storedUser);
            const updatedUser = { ...currentUser, ...data.user };
            localStorage.setItem(
              STORAGE_KEYS.user,
              JSON.stringify(updatedUser)
            );
          } else {
            // Ensure user is stored if not present
            localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(data.user));
          }
        } catch (err) {
          console.warn("Failed to update stored user data:", err);
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
        await AuthService.getCurrentUser();
      } catch {
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

      console.log("📤 Uploading profile picture:", {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        endpoint: API_ENDPOINTS.profile.uploadPicture,
      });

      const data = await apiFetch<
        BackendResponse & { profilePictureUrl: string }
      >(API_ENDPOINTS.profile.uploadPicture, {
        method: "POST",
        body: formData,
        useFormData: true,
      });

      console.log("✅ Profile picture upload response:", data);

      if (data.success && data.profilePictureUrl) {
        return data.profilePictureUrl;
      }

      // Provide more specific error messages based on backend response
      const userMessage =
        data.message === "Failed to upload profile picture"
          ? "Unable to upload image. The backend server couldn't process the file. Please contact support."
          : data.message || "Upload failed. Please try again.";

      throw new Error(userMessage);
    } catch (err) {
      console.error("Upload profile picture error:", err);

      // Log detailed error information for debugging
      if (err instanceof Error) {
        console.error("Error details:", {
          message: err.message,
          name: err.name,
          stack: err.stack,
        });
      }

      // Handle different types of errors
      if (err instanceof Error) {
        // If it's already a user-friendly message, keep it
        if (err.message.includes("Please") || err.message.includes("Unable")) {
          throw err;
        }

        // Check if it's a network/API error with more details
        if (
          err.message.includes("500") ||
          err.message.includes("Internal Server Error")
        ) {
          throw new Error(
            "Backend server error. The image upload service may be temporarily unavailable. Please try again later or contact support."
          );
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
        API_ENDPOINTS.profile.removePicture,
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
      >(API_ENDPOINTS.profile.updateStats, {
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
   * Search profiles by query
   */
  static async searchProfiles(
    params: ProfileSearchParams
  ): Promise<ProfileSearchResponse> {
    try {
      const searchParams = new URLSearchParams({
        query: params.query,
        page: (params.page || 0).toString(),
        size: (params.size || 20).toString(),
      });

      const data = await apiFetch<ProfileSearchResponse>(
        `${API_ENDPOINTS.profile.search}?${searchParams.toString()}`
      );

      if (data.success) {
        return data;
      }
      throw new Error(data.message || "Failed to search profiles");
    } catch (err) {
      console.error("Search profiles error:", err);
      throw err;
    }
  }

  /**
   * Get profile suggestions
   */
  static async getProfileSuggestions(
    limit: number = 10
  ): Promise<ProfileSuggestion[]> {
    try {
      const searchParams = new URLSearchParams({
        limit: limit.toString(),
      });

      const data = await apiFetch<ProfileSuggestionsResponse>(
        `${API_ENDPOINTS.profile.suggestions}?${searchParams.toString()}`
      );

      if (data.success && data.suggestions) {
        return data.suggestions;
      }
      throw new Error(data.message || "Failed to get profile suggestions");
    } catch (err) {
      console.error("Get profile suggestions error:", err);
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
