import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { DiscordService } from "../../services/DiscordService";
import type { DiscordUserInfoProps, DiscordUser } from "../../types";

/**
 * Discord User Info Component
 * Displays linked Discord account information
 */
export const DiscordUserInfo: React.FC<DiscordUserInfoProps> = ({
  className = "",
  showActions = true,
  onUnlink,
}) => {
  const { t } = useTranslation();
  const [discordUser, setDiscordUser] = useState<DiscordUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUnlinking, setIsUnlinking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDiscordUser();
  }, []);

  const loadDiscordUser = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await DiscordService.getUserInfo();

      if (response.success && response.discordUser) {
        setDiscordUser(response.discordUser);
      } else {
        setDiscordUser(null);
      }
    } catch (error) {
      console.error("Failed to load Discord user info:", error);
      setError("Failed to load Discord account information");
      setDiscordUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnlink = async () => {
    if (isUnlinking) return;

    try {
      setIsUnlinking(true);
      setError(null);
      await DiscordService.unlinkAccount();
      setDiscordUser(null);
      onUnlink?.();
    } catch (error) {
      console.error("Failed to unlink Discord account:", error);
      setError("Failed to unlink Discord account");
    } finally {
      setIsUnlinking(false);
    }
  };

  if (isLoading) {
    return (
      <div className={`flex items-center gap-3 p-4 ${className}`}>
        <div className="w-8 h-8 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
        <span className="text-gray-600">{t("discord.userInfo.loading")}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`p-4 bg-red-50 border border-red-200 rounded-lg ${className}`}
      >
        <div className="flex items-center gap-2">
          <svg
            className="w-5 h-5 text-red-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-red-700 font-medium">{error}</span>
        </div>
        <button
          onClick={loadDiscordUser}
          className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
        >
          {t("common.tryAgain")}
        </button>
      </div>
    );
  }

  if (!discordUser) {
    return (
      <div
        className={`p-4 bg-gray-50 border border-gray-200 rounded-lg ${className}`}
      >
        <div className="flex items-center gap-3">
          <svg
            className="w-8 h-8 text-gray-400"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.210.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.010c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.120.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.210 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.210 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
          </svg>
          <span className="text-gray-600">
            {t("discord.userInfo.notLinked")}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`p-4 bg-white border border-gray-200 rounded-lg ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3 flex-1">
          {discordUser.avatar ? (
            <img
              src={`https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png?size=64`}
              alt={`${discordUser.username} avatar`}
              className="w-12 h-12 rounded-full"
            />
          ) : (
            <div className="w-12 h-12 bg-[#5865F2] rounded-full flex items-center justify-center text-white text-lg font-medium">
              {discordUser.username.charAt(0).toUpperCase()}
            </div>
          )}

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900">
                {discordUser.username}#{discordUser.discriminator}
              </h3>
              {discordUser.verified && (
                <svg
                  className="w-4 h-4 text-green-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
            <p className="text-sm text-gray-600">{discordUser.email}</p>
            {discordUser.linkedAt && (
              <p className="text-xs text-gray-500 mt-1">
                {t("discord.userInfo.linkedAt", {
                  date: new Date(discordUser.linkedAt).toLocaleDateString(),
                })}
              </p>
            )}
          </div>
        </div>

        {showActions && (
          <button
            onClick={handleUnlink}
            disabled={isUnlinking}
            className="ml-4 px-3 py-1 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUnlinking ? (
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                {t("discord.userInfo.unlinking")}
              </div>
            ) : (
              t("discord.userInfo.unlink")
            )}
          </button>
        )}
      </div>
    </div>
  );
};
