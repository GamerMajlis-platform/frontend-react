import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { chatService } from "../../services/ChatService";
import type { ChatRoom } from "../../types/chat";
import { useAppContext } from "../../context/useAppContext";

interface ChatRoomListProps {
  onRoomSelect: (room: ChatRoom) => void;
  selectedRoomId?: number;
  className?: string;
  view?: "ROOMS" | "DIRECT";
  refreshKey?: number;
}

const ChatRoomList: React.FC<ChatRoomListProps> = ({
  onRoomSelect,
  selectedRoomId,
  className = "",
  view = "ROOMS",
  refreshKey,
}) => {
  const { t } = useTranslation();
  const { user } = useAppContext();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRooms = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await chatService.getUserRooms({ page: 0, size: 50 });
      // Deduplicate rooms by id and prefer richer payloads (members, lastMessage, name)
      const respRooms = response.chatRooms || [];
      const dedupe = new Map<number, ChatRoom>();
      const score = (r: ChatRoom) => {
        let s = 0;
        if (r.members && r.members.length > 0) s += 4;
        if (r.lastMessage) s += 2;
        if (r.name) s += 1;
        if (r.lastActivity) s += 1;
        return s;
      };

      for (const r of respRooms) {
        const existing = dedupe.get(r.id);
        if (!existing) dedupe.set(r.id, r);
        else {
          const existingScore = score(existing);
          const newScore = score(r);
          if (newScore > existingScore) dedupe.set(r.id, r);
        }
      }

      setRooms(Array.from(dedupe.values()));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("chat:errors.loadRoomsFailed")
      );
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadRooms();
  }, [loadRooms, refreshKey]);

  const formatLastActivity = (lastActivity: string) => {
    if (!lastActivity) return "";
    const date = new Date(lastActivity);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1)
      return t("chat:justNow", { defaultValue: "Just now" });
    if (diffInMinutes < 60)
      return t("chat:minutesAgo", {
        defaultValue: "{{count}} minutes ago",
        count: diffInMinutes,
      });
    if (diffInMinutes < 1440)
      return t("chat:hoursAgo", {
        defaultValue: "{{count}} hours ago",
        count: Math.floor(diffInMinutes / 60),
      });
    return date.toLocaleDateString();
  };

  const formatTimestamp = (iso?: string) => {
    if (!iso) return "";
    return formatLastActivity(iso);
  };

  const getRoomIcon = (room: ChatRoom) => {
    if (room.type === "DIRECT_MESSAGE") return "💬";
    if (room.gameTitle) return "🎮";
    if (room.tournamentId) return "🏆";
    if (room.eventId) return "🎉";
    return "👥";
  };

  const truncateMessage = (content: string, maxLength: number = 50) => {
    if (!content) return "";
    return content.length > maxLength
      ? content.substring(0, maxLength) + "..."
      : content;
  };

  if (loading) {
    return (
      <div className={`space-y-3 ${className}`}>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-dark-secondary rounded-lg shadow-sm p-4 border border-slate-700">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-slate-600 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-600 rounded w-3/4"></div>
                  <div className="h-3 bg-slate-600 rounded w-1/2"></div>
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
        className={`bg-dark-secondary rounded-lg shadow-sm p-6 text-center border border-slate-700 ${className}`}
      >
        <div className="text-red-400 mb-4">⚠️</div>
        <p className="text-red-300 mb-4">{error}</p>
        <button
          onClick={loadRooms}
          className="px-4 py-2 bg-primary text-dark hover:bg-primary-hover transition-colors rounded-lg"
        >
          {t("common.retry")}
        </button>
      </div>
    );
  }

  const filteredRooms = rooms.filter((r) =>
    view === "DIRECT"
      ? r.type === "DIRECT_MESSAGE" && Boolean(r.lastMessage)
      : r.type !== "DIRECT_MESSAGE"
  );

  if (filteredRooms.length === 0) {
    return (
      <div
        className={`bg-dark-secondary rounded-lg shadow-sm p-6 text-center border border-slate-700 ${className}`}
      >
        <div className="text-4xl mb-4">💬</div>
        <h3 className="text-lg font-semibold mb-2 text-white">
          {view === "DIRECT"
            ? t("chat:noDirects", { defaultValue: "No direct messages" })
            : t("chat:noRooms", { defaultValue: "No rooms" })}
        </h3>
        <p className="text-gray-300">
          {view === "DIRECT"
            ? t("chat:noDirectsDescription", {
                defaultValue:
                  "You have no direct messages yet. Start a DM to chat with someone.",
              })
            : t("chat:noRoomsDescription", {
                defaultValue:
                  "You have no rooms yet. Create a room to start chatting.",
              })}
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">
          {view === "DIRECT"
            ? t("chat:directMessages", { defaultValue: "Direct Messages" })
            : t("chat:myRooms", { defaultValue: "My rooms" })}
        </h2>
        <span className="text-sm text-gray-500">
          {filteredRooms.length}{" "}
          {view === "DIRECT"
            ? t("chat:directs", { defaultValue: "conversations" })
            : t("chat:rooms", { defaultValue: "rooms" })}
        </span>
      </div>

      {filteredRooms.map((room) => {
        const membersCount =
          room.members?.length ??
          (room.type === "DIRECT_MESSAGE" ? 2 : room.currentMembers ?? 0);
        let title = room.name || "";
        if (room.type === "DIRECT_MESSAGE") {
          const other = (room.members || []).find(
            (m) => m.user?.id !== user?.id
          );
          if (other && other.user) title = other.user.displayName;
          else if (!title) {
            // Fallback: use lastMessage sender name if available
            const lastMsg = room.lastMessage;
            if (lastMsg && lastMsg.sender && lastMsg.sender.displayName)
              title = lastMsg.sender.displayName;
            else
              title = t("chat:directMessage", {
                defaultValue: "Direct Message",
              });
          }
        }
        const lastMsg = room.lastMessage;
        const timestamp = lastMsg?.createdAt ?? room.lastActivity;

        return (
          <div
            key={room.id}
            className={`bg-dark-secondary rounded-lg shadow-sm p-4 cursor-pointer transition-all duration-200 hover:shadow-md border border-slate-700 flex items-center ${
              selectedRoomId === room.id
                ? "ring-2 ring-primary bg-primary/10"
                : ""
            }`}
            onClick={() => onRoomSelect(room)}
          >
            <div className="flex-shrink-0 mr-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white text-xl">
                {getRoomIcon(room)}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white truncate max-w-[60%]">
                  {title}
                </h3>
                <span className="text-xs text-gray-400 ml-2">
                  {formatTimestamp(timestamp)}
                </span>
              </div>

              <div className="flex items-center justify-between mt-1">
                <div className="flex-1 min-w-0">
                  {lastMsg ? (
                    <p className="text-sm text-gray-300 truncate">
                      <span className="font-medium text-white">
                        {lastMsg.sender?.displayName
                          ? `${lastMsg.sender.displayName}:`
                          : ""}
                      </span>{" "}
                      {truncateMessage(lastMsg.content || "")}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-400 italic truncate">
                      {t("chat:noMessages", { defaultValue: "No messages" })}
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-2 ml-3">
                  {/* Hide privacy and members for direct messages */}
                  {room.type !== "DIRECT_MESSAGE" && room.isPrivate && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                      🔒 {t("chat:private", { defaultValue: "Private" })}
                    </span>
                  )}
                  {room.type !== "DIRECT_MESSAGE" && (
                    <span className="text-xs bg-slate-600 text-gray-200 px-2 py-1 rounded">
                      {membersCount}{" "}
                      {t("chat:members", { defaultValue: "members" })}
                    </span>
                  )}
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
        );
      })}
    </div>
  );
};

export default ChatRoomList;
