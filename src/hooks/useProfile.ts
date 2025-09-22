import { useCallback, useState } from "react";
import { useAppContext } from "../context/useAppContext";
import {
  ProfileService,
  type ProfileSearchParams,
  type ProfileSearchResponse,
  type ProfileSuggestion,
} from "../services/ProfileService";
import type { UpdateProfileData, User } from "../types/auth";

export interface UseProfileResult {
  isLoading: boolean;
  error: string | null;
  refreshProfile: () => Promise<void>;
  updateProfile: (data: UpdateProfileData) => Promise<void>;
  uploadProfilePicture: (file: File) => Promise<string>;
  removeProfilePicture: () => Promise<void>;
  updateGamingStats: (stats: Record<string, unknown>) => Promise<void>;
  getUserProfile: (userId: number) => Promise<User>;
  searchProfiles: (
    params: ProfileSearchParams
  ) => Promise<ProfileSearchResponse>;
  getProfileSuggestions: (limit?: number) => Promise<ProfileSuggestion[]>;
  clearError: () => void;
}

export function useProfile(): UseProfileResult {
  const {
    refreshProfile: contextRefreshProfile,
    updateProfile: contextUpdateProfile,
    uploadProfilePicture: contextUploadProfilePicture,
  } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const refreshProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await contextRefreshProfile();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to refresh profile";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [contextRefreshProfile]);

  const updateProfile = useCallback(
    async (data: UpdateProfileData) => {
      setIsLoading(true);
      setError(null);
      try {
        await contextUpdateProfile(data);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to update profile";
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [contextUpdateProfile]
  );

  const uploadProfilePicture = useCallback(
    async (file: File): Promise<string> => {
      setIsLoading(true);
      setError(null);
      try {
        return await contextUploadProfilePicture(file);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to upload profile picture";
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [contextUploadProfilePicture]
  );

  const removeProfilePicture = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await ProfileService.removeProfilePicture();
      await contextRefreshProfile();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to remove profile picture";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [contextRefreshProfile]);

  const updateGamingStats = useCallback(
    async (stats: Record<string, unknown>) => {
      setIsLoading(true);
      setError(null);
      try {
        await ProfileService.updateGamingStats(stats);
        await contextRefreshProfile();
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to update gaming statistics";
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [contextRefreshProfile]
  );

  const getUserProfile = useCallback(async (userId: number): Promise<User> => {
    setIsLoading(true);
    setError(null);
    try {
      return await ProfileService.getUserProfile(userId);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to get user profile";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const searchProfiles = useCallback(
    async (params: ProfileSearchParams): Promise<ProfileSearchResponse> => {
      setIsLoading(true);
      setError(null);
      try {
        return await ProfileService.searchProfiles(params);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to search profiles";
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const getProfileSuggestions = useCallback(
    async (limit?: number): Promise<ProfileSuggestion[]> => {
      setIsLoading(true);
      setError(null);
      try {
        return await ProfileService.getProfileSuggestions(limit);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to get profile suggestions";
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    isLoading,
    error,
    refreshProfile,
    updateProfile,
    uploadProfilePicture,
    removeProfilePicture,
    updateGamingStats,
    getUserProfile,
    searchProfiles,
    getProfileSuggestions,
    clearError,
  };
}
