import React, { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useAppContext } from "../../context/useAppContext";
import { chatService } from "../../services/ChatService";
import type { ChatRoom } from "../../types/chat";

interface Props {
  refreshKey?: number;
  className?: string;
  onRoomJoined?: (room: ChatRoom) => void;
  selectedRoomId?: number | null;
}

const RoomSuggestions: React.FC<Props> = ({
  refreshKey,
  className = "",
  onRoomJoined,
  selectedRoomId = null,
}) => {
  const { t } = useTranslation();
  const { user } = useAppContext();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSuggestions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Use the normal user rooms endpoint and build suggestions client-side.
      const resp = await chatService.getUserRooms({ page: 0, size: 50 });
      const all = resp.chatRooms || [];

      // Filter out private rooms, the currently selected room, and rooms created by the current user
      const candidates = all.filter(
        (r) =>
          !r.isPrivate &&
          r.id !== (selectedRoomId ?? null) &&
          r.creator?.id !== user?.id
      );

      // If small set, return up to 10
      if (candidates.length <= 10) {
        setRooms(candidates.slice(0, 10));
        return;
      }

      // Otherwise, preferentially (per request) build suggestions by randomly choosing
      // between the first and last room IDs from the list until we have up to 10 unique rooms.
      const suggestionsMap = new Map<number, ChatRoom>();
      let attempts = 0;
      while (suggestionsMap.size < 10 && attempts < 50) {
        const pick =
          Math.random() < 0.5
            ? candidates[0]
            : candidates[candidates.length - 1];
        suggestionsMap.set(pick.id, pick);
        attempts++;
      }

      // If we still don't have 10 unique rooms (possible if endpoints are same), fill from shuffled candidates
      if (suggestionsMap.size < 10) {
        const shuffled = candidates.sort(() => 0.5 - Math.random());
        for (const r of shuffled) {
          if (suggestionsMap.size >= 10) break;
          suggestionsMap.set(r.id, r);
        }
      }

      setRooms(Array.from(suggestionsMap.values()).slice(0, 10));
    } catch (e) {
      setError(
        e instanceof Error ? e.message : t("chat:errors.loadSuggestions")
      );
    } finally {
      setLoading(false);
    }
  }, [t, selectedRoomId, user?.id]);

  useEffect(() => {
    loadSuggestions();
  }, [loadSuggestions, refreshKey]);

  const handleJoin = async (room: ChatRoom) => {
    try {
      await chatService.joinRoom(room.id);
      if (onRoomJoined) onRoomJoined(room);
    } catch (e) {
      // show simple console error; UI improvements possible later
      console.error("Failed to join suggested room:", e);
    }
  };

  if (loading) {
    return (
      <div className={`px-3 py-2 ${className}`}>
        <div className="text-xs text-gray-400">
          {t("chat:loadingSuggestions", "Loading suggestions...")}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-3 ${className}`}>
        <div className="text-sm text-red-400">
          {t("chat:errors.loadSuggestions", "Failed to load suggestions")}
        </div>
        <button className="mt-2 text-sm text-primary" onClick={loadSuggestions}>
          {t("common.retry")}
        </button>
      </div>
    );
  }

  if (rooms.length === 0) {
    return (
      <div className={`px-3 py-2 text-xs text-gray-400 ${className}`}>
        {t("chat:noSuggestions", "No suggested rooms right now")}
      </div>
    );
  }

  return (
    <div className={`space-y-2 px-3 py-2 ${className}`}>
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold">
          {t("chat:suggestions", "Suggested Rooms")}
        </h4>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-400">{rooms.length}</span>
          <button
            onClick={loadSuggestions}
            title={t("chat:refreshSuggestions", "Refresh")}
            className="text-xs text-gray-300 hover:text-white"
          >
            ⟳
          </button>
        </div>
      </div>

      {rooms.map((room) => (
        <div
          key={room.id}
          className="flex items-center justify-between bg-dark-secondary px-2 py-1 rounded border border-slate-700"
        >
          <div className="min-w-0 pr-2">
            <div className="text-xs font-medium text-white truncate">
              {room.name}
            </div>
            <div className="text-xxs text-gray-400 truncate">
              {room.creator?.displayName} • {room.currentMembers}{" "}
              {t("chat:membersShort", "members")}
            </div>
          </div>
          <div className="ml-3 flex items-center space-x-2">
            {room.isPrivate && (
              <span className="text-xxs px-2 py-0.5 rounded bg-yellow-100 text-yellow-800">
                🔒
              </span>
            )}
            <button
              onClick={() => handleJoin(room)}
              className="text-xs px-2 py-0.5 bg-primary text-black rounded hover:bg-primary-dark"
            >
              {t("chat:join", "Join")}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RoomSuggestions;
