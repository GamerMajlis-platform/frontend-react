import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { DiscordService } from "../../services/DiscordService";
import type { DiscordLinkButtonProps, DiscordUser } from "../../types";

/**
 * Discord Link/Unlink Button Component
 * Manages Discord account linking in user settings
 */
export const DiscordLinkButton: React.FC<DiscordLinkButtonProps> = ({
  className = "",
  variant = "primary",
  size = "md",
  onLink,
  onUnlink,
  onError,
}) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [isLinked, setIsLinked] = useState(false);
  const [discordUser, setDiscordUser] = useState<DiscordUser | null>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);

  // Keep a stable ref to the onLink callback so we don't re-run the
  // initial status check whenever a parent re-renders with a new
  // inline function reference.
  const onLinkRef = React.useRef(onLink);
  React.useEffect(() => {
    onLinkRef.current = onLink;
  }, [onLink]);

  const checkLinkStatus = async () => {
    try {
      setIsCheckingStatus(true);
      const response = await DiscordService.getUserInfo();

      if (response.success && response.discordUser) {
        setIsLinked(true);
        setDiscordUser(response.discordUser);
        onLinkRef.current?.(response.discordUser);
      } else {
        setIsLinked(false);
        setDiscordUser(null);
      }
    } catch {
      setIsLinked(false);
      setDiscordUser(null);
    } finally {
      setIsCheckingStatus(false);
    }
  };

  // Run the check only on mount — don't re-run when parent passes a new
  // inline callback reference, which caused excessive re-checking.
  React.useEffect(() => {
    checkLinkStatus();
  }, []);

  const getVariantClasses = () => {
    if (isLinked) {
      return "bg-red-600 hover:bg-red-700 text-white";
    }

    switch (variant) {
      case "secondary":
        return "bg-gray-600 hover:bg-gray-700 text-white";
      case "outline":
        return "border-2 border-[#5865F2] text-[#5865F2] hover:bg-[#5865F2] hover:text-white";
      default:
        return "bg-[#5865F2] hover:bg-[#4752C4] text-white";
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "px-3 py-2 text-sm";
      case "lg":
        return "px-6 py-4 text-lg";
      default:
        return "px-4 py-3 text-base";
    }
  };

  const handleLinkAccount = async () => {
    if (isLoading) return;

    try {
      setIsLoading(true);
      // For linking, we need to initiate OAuth flow
      await DiscordService.initiateOAuth(
        `${window.location.origin}${window.location.pathname}`
      );
    } catch (error) {
      console.error("Discord link failed:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to link Discord account";
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnlinkAccount = async () => {
    if (isLoading) return;

    try {
      setIsLoading(true);
      await DiscordService.unlinkAccount();
      setIsLinked(false);
      setDiscordUser(null);
      onUnlink?.();
    } catch (error) {
      console.error("Discord unlink failed:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to unlink Discord account";
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingStatus) {
    return (
      <div
        className={`flex items-center justify-center ${getSizeClasses()} ${className}`}
      >
        <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
        <span className="ml-2 text-gray-600">{t("discord.link.checking")}</span>
      </div>
    );
  }

  return (
    <div className={className}>
      {isLinked && discordUser && (
        <div className="mb-3 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            {discordUser.avatar ? (
              <img
                src={`https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png?size=32`}
                alt={`${discordUser.username} avatar`}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <div className="w-8 h-8 bg-[#5865F2] rounded-full flex items-center justify-center text-white text-sm font-medium">
                {discordUser.username.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1">
              <p className="font-medium text-gray-900">
                {discordUser.username}#{discordUser.discriminator}
              </p>
              <p className="text-sm text-gray-600">{discordUser.email}</p>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={isLinked ? handleUnlinkAccount : handleLinkAccount}
        disabled={isLoading}
        className={`
          flex items-center justify-center gap-3 rounded-lg font-medium w-full
          transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
          ${getVariantClasses()}
          ${getSizeClasses()}
        `}
      >
        {/* Discord Logo SVG */}
        <svg
          className="w-5 h-5"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.210.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.010c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.120.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.210 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.210 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
        </svg>

        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            {isLinked ? t("discord.link.unlinking") : t("discord.link.linking")}
          </div>
        ) : isLinked ? (
          t("discord.link.unlink")
        ) : (
          t("discord.link.link")
        )}
      </button>
    </div>
  );
};
