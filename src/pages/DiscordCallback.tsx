import React, { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { DiscordService } from "../services/DiscordService";
import { useAppContext } from "../context/useAppContext";

/**
 * Discord OAuth Callback Page
 * Handles Discord OAuth callback and processes authentication
 */
const DiscordCallback: React.FC = () => {
  const { t } = useTranslation();
  const { refreshProfile } = useAppContext();
  const [status, setStatus] = useState<"processing" | "success" | "error">(
    "processing"
  );
  const [error, setError] = useState<string | null>(null);

  const handleCallback = useCallback(async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("code");
      const state = urlParams.get("state");
      const error = urlParams.get("error");

      // Check for OAuth errors
      if (error) {
        throw new Error(`Discord OAuth error: ${error}`);
      }

      // Validate required parameters
      if (!code || !state) {
        throw new Error("Missing required OAuth parameters");
      }

      setStatus("processing");

      // Process OAuth callback
      const response = await DiscordService.handleOAuthCallback(code, state);

      if (response.success && response.token && response.user) {
        // Store authentication token
        localStorage.setItem("gamermajlis_auth_token", response.token);

        // Refresh user profile to get updated state
        await refreshProfile();

        setStatus("success");

        // Get return URL from stored state
        const storedState = DiscordService.getStoredOAuthState();
        const returnUrl = storedState?.returnUrl || "/";

        // Redirect after a brief delay to show success state
        setTimeout(() => {
          window.location.href = returnUrl;
        }, 2000);
      } else {
        throw new Error("Authentication failed");
      }
    } catch (err) {
      console.error("Discord callback error:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Authentication failed";
      setError(errorMessage);
      setStatus("error");

      // Clear any stored OAuth state
      DiscordService.clearOAuthState();

      // Redirect to login page after a delay
      setTimeout(() => {
        window.location.href = "/login";
      }, 3000);
    }
  }, [refreshProfile]);

  useEffect(() => {
    handleCallback();
  }, [handleCallback]);

  const renderContent = () => {
    switch (status) {
      case "processing":
        return (
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 border-4 border-[#5865F2] border-t-transparent rounded-full animate-spin" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {t("discord.callback.processing")}
            </h2>
            <p className="text-gray-600">
              {t("discord.callback.processingDescription")}
            </p>
          </div>
        );

      case "success":
        return (
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-green-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-green-900 mb-2">
              {t("discord.callback.success")}
            </h2>
            <p className="text-green-700">
              {t("discord.callback.successDescription")}
            </p>
          </div>
        );

      case "error":
        return (
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-red-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-red-900 mb-2">
              {t("discord.callback.error")}
            </h2>
            <p className="text-red-700 mb-4">
              {error || t("discord.callback.errorDescription")}
            </p>
            <button
              onClick={() => (window.location.href = "/login")}
              className="px-4 py-2 bg-[#5865F2] text-white rounded-lg hover:bg-[#4752C4] transition-colors"
            >
              {t("discord.callback.backToLogin")}
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-center justify-center mb-6">
          <svg
            className="w-12 h-12 text-[#5865F2]"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.210.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.010c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.120.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.210 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.210 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
          </svg>
        </div>

        {renderContent()}
      </div>
    </div>
  );
};

export default DiscordCallback;
