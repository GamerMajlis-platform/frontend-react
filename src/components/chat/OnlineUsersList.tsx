import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { chatService } from "../../services/ChatService";
import { useAppContext } from "../../context/useAppContext";
import type { OnlineUser } from "../../types/chat";

interface OnlineUsersListProps {
  onStartDirectMessage?: (userId: number) => void;
  className?: string;
}

export const OnlineUsersList: React.FC<OnlineUsersListProps> = ({
  onStartDirectMessage,
  className = "",
}) => {
  const { t } = useTranslation();
  const { user } = useAppContext();
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startingDmWith, setStartingDmWith] = useState<number | null>(null);

  const loadOnlineUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const users = await chatService.getOnlineUsers();
      // Filter out current user
      const filteredUsers = users.filter((u) =>
        user ? u.id !== user.id : true
      );
      setOnlineUsers(filteredUsers);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : t("chat.errors.loadOnlineUsersFailed")
      );
    } finally {
      setLoading(false);
    }
  }, [user, t]);

  useEffect(() => {
    loadOnlineUsers();

    // Refresh online users every 30 seconds
    const interval = setInterval(loadOnlineUsers, 30000);

    return () => clearInterval(interval);
  }, [loadOnlineUsers]);

  const handleStartDirectMessage = async (userId: number) => {
    if (!onStartDirectMessage) return;

    try {
      setStartingDmWith(userId);
      await onStartDirectMessage(userId);
    } catch (err) {
      console.error("Failed to start direct message:", err);
    } finally {
      setStartingDmWith(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ONLINE":
        return "🟢";
      case "AWAY":
        return "🟡";
      case "BUSY":
        return "🔴";
      case "IN_GAME":
        return "🎮";
      case "INVISIBLE":
        return "⚫";
      default:
        return "⚫";
    }
  };

  const getStatusText = (status: string) => {
    return t(`chat.status.${status.toLowerCase()}`);
  };

  const formatLastSeen = (lastSeen: string) => {
    const date = new Date(lastSeen);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return t("chat.justNow");
    if (diffInMinutes < 60)
      return t("chat.minutesAgo", { count: diffInMinutes });
    if (diffInMinutes < 1440)
      return t("chat.hoursAgo", { count: Math.floor(diffInMinutes / 60) });
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
        <div className="p-4 border-b">
          <h3 className="font-semibold">{t("chat.onlineUsers")}</h3>
        </div>
        <div className="space-y-3 p-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`bg-white rounded-lg shadow-sm border p-6 text-center ${className}`}
      >
        <div className="text-red-500 mb-4">⚠️</div>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={loadOnlineUsers}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          {t("common.retry")}
        </button>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">{t("chat.onlineUsers")}</h3>
          <span className="text-sm text-gray-500">
            {onlineUsers.length} {t("chat.online")}
          </span>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {onlineUsers.length === 0 ? (
          <div className="p-6 text-center">
            <div className="text-4xl mb-4">😴</div>
            <p className="text-gray-500">{t("chat.noOnlineUsers")}</p>
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {onlineUsers.map((onlineUser) => (
              <div
                key={onlineUser.id}
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {/* Avatar with status */}
                <div className="relative flex-shrink-0">
                  {onlineUser.profilePictureUrl ? (
                    <img
                      src={onlineUser.profilePictureUrl}
                      alt={onlineUser.displayName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center text-white font-medium">
                      {onlineUser.displayName.charAt(0).toUpperCase()}
                    </div>
                  )}

                  {/* Status indicator */}
                  <div className="absolute -bottom-1 -right-1 text-xs">
                    {getStatusIcon(onlineUser.status)}
                  </div>
                </div>

                {/* User info */}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 truncate">
                    {onlineUser.displayName}
                  </div>

                  <div className="text-sm text-gray-500">
                    {onlineUser.status === "IN_GAME" &&
                    onlineUser.currentGame ? (
                      <span className="flex items-center">
                        🎮 {onlineUser.currentGame}
                      </span>
                    ) : (
                      <span>{getStatusText(onlineUser.status)}</span>
                    )}
                  </div>

                  <div className="text-xs text-gray-400">
                    {t("chat.lastSeen")} {formatLastSeen(onlineUser.lastSeen)}
                  </div>
                </div>

                {/* Message button */}
                {onStartDirectMessage && (
                  <div className="flex-shrink-0">
                    <button
                      onClick={() => handleStartDirectMessage(onlineUser.id)}
                      disabled={startingDmWith === onlineUser.id}
                      className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors disabled:opacity-50"
                      title={t("chat.startDirectMessage")}
                    >
                      {startingDmWith === onlineUser.id ? "⏳" : "💬"}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Refresh indicator */}
      <div className="px-4 py-2 border-t bg-gray-50 text-center">
        <button
          onClick={loadOnlineUsers}
          className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="inline-block animate-spin w-3 h-3 border border-gray-400 border-t-transparent rounded-full mr-1"></span>
              {t("chat.refreshing")}
            </>
          ) : (
            <>🔄 {t("chat.refresh")}</>
          )}
        </button>
      </div>
    </div>
  );
};

export default OnlineUsersList;
