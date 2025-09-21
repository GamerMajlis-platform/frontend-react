import { useCallback, useState } from "react";
import { useAppContext } from "../context/useAppContext";
import { ProfileService } from "../services/ProfileService";
import type { UpdateProfileData } from "../types/auth";

export interface UseProfileResult {
  isLoading: boolean;
  error: string | null;
  refreshProfile: () => Promise<void>;
  updateProfile: (data: UpdateProfileData) => Promise<void>;
  uploadProfilePicture: (file: File) => Promise<string>;
  removeProfilePicture: () => Promise<void>;
  updateGamingStats: (stats: Record<string, unknown>) => Promise<void>;
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

  return {
    isLoading,
    error,
    refreshProfile,
    updateProfile,
    uploadProfilePicture,
    removeProfilePicture,
    updateGamingStats,
    clearError,
  };
}
