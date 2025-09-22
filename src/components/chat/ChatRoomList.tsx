import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { chatService } from "../../services/ChatService";
import type { ChatRoom } from "../../types/chat";

interface ChatRoomListProps {
  onRoomSelect: (room: ChatRoom) => void;
  selectedRoomId?: number;
  className?: string;
}

export const ChatRoomList: React.FC<ChatRoomListProps> = ({
  onRoomSelect,
  selectedRoomId,
  className = "",
}) => {
  const { t } = useTranslation();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRooms = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await chatService.getUserRooms({ page: 0, size: 50 });
      setRooms(response.chatRooms);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("chat.errors.loadRoomsFailed")
      );
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  const formatLastActivity = (lastActivity: string) => {
    const date = new Date(lastActivity);
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

  const getRoomIcon = (room: ChatRoom) => {
    if (room.type === "DIRECT_MESSAGE") return "💬";
    if (room.gameTitle) return "🎮";
    if (room.tournamentId) return "🏆";
    if (room.eventId) return "🎉";
    return "👥";
  };

  const truncateMessage = (content: string, maxLength: number = 50) => {
    return content.length > maxLength
      ? content.substring(0, maxLength) + "..."
      : content;
  };

  if (loading) {
    return (
      <div className={`space-y-3 ${className}`}>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-white rounded-lg shadow-sm p-4 border">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`bg-white rounded-lg shadow-sm p-6 text-center border ${className}`}
      >
        <div className="text-red-500 mb-4">⚠️</div>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={loadRooms}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          {t("common.retry")}
        </button>
      </div>
    );
  }

  if (rooms.length === 0) {
    return (
      <div
        className={`bg-white rounded-lg shadow-sm p-6 text-center border ${className}`}
      >
        <div className="text-4xl mb-4">💬</div>
        <h3 className="text-lg font-semibold mb-2">{t("chat.noRooms")}</h3>
        <p className="text-gray-600">{t("chat.noRoomsDescription")}</p>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">{t("chat.myRooms")}</h2>
        <span className="text-sm text-gray-500">
          {rooms.length} {t("chat.rooms")}
        </span>
      </div>

      {rooms.map((room) => (
        <div
          key={room.id}
          className={`bg-white rounded-lg shadow-sm p-4 cursor-pointer transition-all duration-200 hover:shadow-md border ${
            selectedRoomId === room.id
              ? "ring-2 ring-primary bg-primary/5"
              : "hover:bg-gray-50"
          }`}
          onClick={() => onRoomSelect(room)}
        >
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white text-xl">
                {getRoomIcon(room)}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900 truncate">
                  {room.name}
                </h3>
                <span className="text-xs text-gray-500">
                  {formatLastActivity(room.lastActivity)}
                </span>
              </div>

              <div className="flex items-center justify-between mt-1">
                <div className="flex-1">
                  {room.lastMessage ? (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">
                        {room.lastMessage.sender.displayName}:
                      </span>{" "}
                      {truncateMessage(room.lastMessage.content)}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-500 italic">
                      {t("chat.noMessages")}
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-2 ml-2">
                  {room.isPrivate && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                      🔒 {t("chat.private")}
                    </span>
                  )}
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                    {room.currentMembers} {t("chat.members")}
                  </span>
                </div>
              </div>

              {room.gameTitle && (
                <div className="mt-2">
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    🎮 {room.gameTitle}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChatRoomList;
