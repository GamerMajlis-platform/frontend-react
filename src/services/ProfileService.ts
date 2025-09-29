// Profile Service - Handles profile-related API communication
import { API_ENDPOINTS } from "../config/constants";
import { AuthService } from "./AuthService";
import { MediaService } from "./MediaService";
import { BaseService } from "../lib/baseService";
import { UserStorage } from "../lib/userStorage";
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

export class ProfileService extends BaseService {
  /**
   * T12: Validate profile picture aspect ratio
   * Kept here because it's profile-specific validation and may differ from general media rules.
   */
  static async validateProfilePicture(
    file: File
  ): Promise<{ isValid: boolean; error?: string }> {
    // Make aspect ratio enforcement configurable via environment variable
    // VITE_REQUIRE_SQUARE_AVATAR=true|false (default true)
    const requireSquareFlag = import.meta.env.VITE_REQUIRE_SQUARE_AVATAR as
      | string
      | undefined;
    const requireSquare =
      requireSquareFlag === "true" || requireSquareFlag === "1";

    if (!requireSquare) {
      // If frontend is configured to not require square avatars, just ensure image loads
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve({ isValid: true });
        img.onerror = () =>
          resolve({ isValid: false, error: "Invalid image file" });
        img.src = URL.createObjectURL(file);
      });
    }

    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const aspectRatio = img.width / img.height;
        const tolerance = 0.1; // 10% tolerance for square aspect ratio

        if (Math.abs(aspectRatio - 1) > tolerance) {
          resolve({
            isValid: false,
            error: "Profile picture must have a square aspect ratio (1:1)",
          });
        } else {
          resolve({ isValid: true });
        }
      };

      img.onerror = () => {
        resolve({ isValid: false, error: "Invalid image file" });
      };

      img.src = URL.createObjectURL(file);
    });
  }
  /**
   * Get current user's full profile
   */
  static async getMyProfile(): Promise<User> {
    try {
      const data = await this.authenticatedRequest<ProfileResponse>(
        API_ENDPOINTS.profile.me
      );
      if (data.success && data.user) {
        const parsed = this.parseUserJsonFields(data.user);
        try {
          UserStorage.updateStoredUser(parsed as User);
        } catch (err) {
          console.warn("Failed to persist user after fetch:", err);
        }
        return parsed as User;
      }
      throw new Error(data.message || "Failed to get profile");
    } catch (err) {
      this.handleServiceError(err, "ProfileService", "getMyProfile");
    }
  }

  /**
   * Get any user's profile by ID
   */
  static async getUserProfile(userId: number): Promise<User> {
    try {
      this.validateRequired({ userId });
      const data = await this.requestWithRetry<ProfileResponse>(
        `${API_ENDPOINTS.profile.byId}/${userId}`
      );
      if (data.success && data.user) {
        return this.parseUserJsonFields(data.user) as User;
      }
      throw new Error(data.message || "Failed to get user profile");
    } catch (err) {
      this.handleServiceError(err, "ProfileService", "getUserProfile");
    }
  }

  /**
   * Update current user's profile
   */
  static async updateProfile(profileData: UpdateProfileData): Promise<User> {
    try {
      this.validateRequired({ profileData });
      const formData = this.createFormData(
        profileData as Record<string, string>
      );
      const data = await this.authenticatedRequest<ProfileResponse>(
        API_ENDPOINTS.profile.me,
        {
          method: "PUT",
          body: formData,
          useFormData: true,
        }
      );
      if (data.success && data.user) {
        const parsed = this.parseUserJsonFields(data.user);
        try {
          const storedUser = UserStorage.getStoredUser();
          if (storedUser) {
            const updatedUser = { ...storedUser, ...parsed };
            UserStorage.updateStoredUser(updatedUser as User);
          } else {
            UserStorage.updateStoredUser(parsed as User);
          }
        } catch (err) {
          console.warn("Failed to update stored user data:", err);
        }
        return parsed as User;
      }
      throw new Error(data.message || "Failed to update profile");
    } catch (err) {
      this.handleServiceError(err, "ProfileService", "updateProfile");
    }
  }

  /**
   * Upload profile picture with T12 validation
   */
  static async uploadProfilePicture(file: File): Promise<string> {
    try {
      this.validateRequired({ file });
      await AuthService.getCurrentUser();
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

      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize)
        throw new Error("File is too large. Maximum size is 10MB.");

      const aspectRatioValidation = await this.validateProfilePicture(file);
      if (!aspectRatioValidation.isValid)
        throw new Error(aspectRatioValidation.error);

      const securityCheck = await MediaService.detectMaliciousFile(file);
      if (!securityCheck.isSafe)
        throw new Error(securityCheck.reason || "File failed security check");

      const formData = new FormData();
      formData.append("file", file);

      const data = await this.authenticatedRequest<
        BackendResponse & { profilePictureUrl?: string }
      >(API_ENDPOINTS.profile.uploadPicture, {
        method: "POST",
        body: formData,
        useFormData: true,
      });

      if (data.success) {
        const resp = data as unknown as Record<string, unknown>;
        // Helpful debug output in development to inspect backend response shape
        if (import.meta.env.DEV) {
          try {
            console.debug(
              "ProfileService.uploadProfilePicture response:",
              resp
            );
          } catch {
            /* ignore */
          }
        }

        // 1) direct string
        const profilePictureUrl = resp["profilePictureUrl"];
        if (typeof profilePictureUrl === "string") return profilePictureUrl;

        // 2) file object metadata
        const maybeFileObj = (resp["file"] ||
          resp["profilePicture"] ||
          resp["media"]) as Record<string, unknown> | undefined;
        if (maybeFileObj && typeof maybeFileObj === "object") {
          const maybeId = maybeFileObj["id"];
          if (typeof maybeId === "number" || typeof maybeId === "string")
            return String(maybeId);

          const filenameRaw =
            maybeFileObj["storedFilename"] ||
            maybeFileObj["file"] ||
            maybeFileObj["filename"] ||
            maybeFileObj["filePath"];
          if (typeof filenameRaw === "string" && filenameRaw.length > 0) {
            const filename = filenameRaw;
            if (
              filename.startsWith("/") ||
              /^https?:\/\//i.test(filename) ||
              filename.startsWith("data:")
            )
              return filename;
            return `/uploads/profile-pictures/${filename}`;
          }
        }

        // 3) fallback keys
        for (const key of ["url", "path"]) {
          const val = resp[key];
          if (typeof val === "string") return val;
        }
      }

      const userMessage =
        data.message === "Failed to upload profile picture"
          ? "Unable to upload image. The backend server couldn't process the file. Please contact support."
          : data.message || "Upload failed. Please try again.";
      throw new Error(userMessage);
    } catch (err) {
      this.handleServiceError(err, "ProfileService", "uploadProfilePicture");
    }
  }

  /**
   * Update gaming statistics
   */
  static async updateGamingStats(stats: GamingStats): Promise<string> {
    try {
      this.validateRequired({ stats });
      const formData = this.createFormData({
        gamingStatistics: JSON.stringify(stats),
      });
      const data = await this.authenticatedRequest<
        BackendResponse & { gamingStatistics: string }
      >(API_ENDPOINTS.profile.updateStats, {
        method: "POST",
        body: formData,
        useFormData: true,
      });
      const gamingStatsVal = (data as unknown as Record<string, unknown>)[
        "gamingStatistics"
      ];
      if (data.success && typeof gamingStatsVal === "string")
        return gamingStatsVal as string;
      throw new Error(data.message || "Failed to update gaming statistics");
    } catch (err) {
      this.handleServiceError(err, "ProfileService", "updateGamingStats");
    }
  }

  /**
   * Remove current user's profile picture
   */
  static async removeProfilePicture(): Promise<void> {
    try {
      const data = await this.authenticatedRequest<BackendResponse>(
        API_ENDPOINTS.profile.removePicture,
        { method: "DELETE" }
      );
      if (!data.success)
        throw new Error(data.message || "Failed to remove profile picture");
      return;
    } catch (err) {
      this.handleServiceError(err, "ProfileService", "removeProfilePicture");
    }
  }

  /**
   * Search profiles with query params
   */
  static async searchProfiles(
    params: ProfileSearchParams
  ): Promise<ProfileSearchResponse> {
    try {
      const qs = new URLSearchParams();
      if (params.query) qs.set("query", params.query);
      if (typeof params.page === "number") qs.set("page", String(params.page));
      if (typeof params.size === "number") qs.set("size", String(params.size));

      const data = await this.requestWithRetry<ProfileSearchResponse>(
        `${API_ENDPOINTS.profile.search}?${qs.toString()}`
      );

      if (data.success) return data;
      throw new Error(data.message || "Failed to search profiles");
    } catch (err) {
      this.handleServiceError(err, "ProfileService", "searchProfiles");
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
      const data = await this.requestWithRetry<ProfileSuggestionsResponse>(
        `${API_ENDPOINTS.profile.suggestions}?${searchParams.toString()}`
      );
      if (data.success && data.suggestions) {
        return data.suggestions;
      }
      throw new Error(data.message || "Failed to get profile suggestions");
    } catch (err) {
      this.handleServiceError(err, "ProfileService", "getProfileSuggestions");
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
      // Normalize privacy settings keys: different backends may use
      // `profileVisibility` (string) or `profileVisible` (boolean) or `visibility`.
      // Also accept a few alternate keys for visibility of socials/stats.
      parsedPrivacySettings: (() => {
        const raw = parseJsonField(user.privacySettings) as Record<
          string,
          unknown
        >;
        const normalized: Record<string, unknown> = { ...raw };

        // Normalize profile visibility into a string: 'public' | 'friends' | 'private'
        if (typeof raw["profileVisibility"] === "string") {
          normalized["profileVisibility"] = raw["profileVisibility"];
        } else if (typeof raw["visibility"] === "string") {
          normalized["profileVisibility"] = raw["visibility"];
        } else if (typeof raw["profileVisible"] === "boolean") {
          // older shape: profileVisible: true/false
          normalized["profileVisibility"] = raw["profileVisible"]
            ? "public"
            : "private";
        }

        // Normalize gaming stats visibility to boolean `showGamingStats`
        if (typeof raw["showGamingStats"] === "boolean") {
          normalized["showGamingStats"] = raw["showGamingStats"];
        } else if (typeof raw["gamingStatsVisible"] === "boolean") {
          normalized["showGamingStats"] = raw["gamingStatsVisible"];
        } else if (typeof raw["showGamingStatistics"] === "boolean") {
          normalized["showGamingStats"] = raw["showGamingStatistics"];
        }

        // Normalize social links visibility to boolean `showSocialLinks`
        if (typeof raw["showSocialLinks"] === "boolean") {
          normalized["showSocialLinks"] = raw["showSocialLinks"];
        } else if (typeof raw["socialLinksVisible"] === "boolean") {
          normalized["showSocialLinks"] = raw["socialLinksVisible"];
        }

        // Normalize online status visibility to boolean `showOnlineStatus`
        if (typeof raw["showOnlineStatus"] === "boolean") {
          normalized["showOnlineStatus"] = raw["showOnlineStatus"];
        } else if (typeof raw["onlineStatusVisible"] === "boolean") {
          normalized["showOnlineStatus"] = raw["onlineStatusVisible"];
        }

        return normalized;
      })(),
    };
  }
}
