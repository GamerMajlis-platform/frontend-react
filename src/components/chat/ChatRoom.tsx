import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { chatService } from "../../services/ChatService";
import webSocketService from "../../services/WebSocketService";
import { SendAlt, ArrowLeft } from "../../lib/icons";
import { useAppContext } from "../../context/useAppContext";
import type { ChatRoom as ChatRoomType, ChatMessage } from "../../types/chat";
import ConfirmDialog from "../shared/ConfirmDialog";

interface ChatRoomProps {
  room: ChatRoomType;
  onRoomUpdate: (room: ChatRoomType) => void;
  onRoomDeleted?: (roomId: number) => void;
  className?: string;
  // Mobile back control
  onBack?: () => void;
  showBack?: boolean;
}

export const ChatRoom: React.FC<ChatRoomProps> = ({
  room,
  onRoomUpdate,
  onRoomDeleted,
  className = "",
  onBack,
  showBack,
}) => {
  const { t, i18n } = useTranslation();
  const { user } = useAppContext();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const loadMessages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await chatService.getMessages(room.id, {
        page: 0,
        size: 50,
      });
      // Defensive: backend may return undefined for messages
      const msgs = Array.isArray(response.messages) ? response.messages : [];
      setMessages(msgs.slice().reverse()); // Reverse to show newest at bottom
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("chat:errors.loadMessagesFailed")
      );
    } finally {
      setLoading(false);
    }
  }, [room.id, t]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  // Subscribe to incoming websocket chat messages so DMs/rooms update live
  useEffect(() => {
    const handleIncoming = (data: { roomId: number; message: unknown }) => {
      if (data?.roomId !== room.id) return;

      try {
        const m = data.message as Record<string, unknown>;
        // Map websocket message shape to ChatMessage minimal shape used here
        const mapped: ChatMessage = {
          id: m.id,
          content: (m.content as string) || "",
          messageType:
            typeof m.messageType === "string"
              ? (m.messageType as string)
              : "TEXT",
          sender: (() => {
            const s = m.sender;
            if (typeof s === "object" && s && !(s instanceof Array)) {
              const obj = s as Record<string, unknown>;
              return {
                id:
                  typeof obj.id === "number"
                    ? (obj.id as number)
                    : Number(obj.id) || 0,
                displayName:
                  typeof obj.displayName === "string"
                    ? (obj.displayName as string)
                    : String(obj.displayName ?? ""),
                profilePictureUrl:
                  typeof obj.profilePictureUrl === "string"
                    ? (obj.profilePictureUrl as string)
                    : undefined,
              };
            }
            return { id: 0, displayName: "", profilePictureUrl: undefined };
          })(),
          createdAt:
            (m.createdAt as string) ||
            (m.timestamp as string) ||
            new Date().toISOString(),
        } as ChatMessage;

        setMessages((prev) => [...prev, mapped]);

        // Inform parent to update room's lastActivity / lastMessage
        const updatedRoom = {
          ...room,
          lastActivity: mapped.createdAt,
          lastMessage: {
            id: mapped.id,
            content: mapped.content,
            sender: mapped.sender,
            createdAt: mapped.createdAt,
          },
        } as ChatRoomType;
        onRoomUpdate(updatedRoom);
      } catch (e) {
        console.debug(
          "Failed to handle incoming WS chatMessage in ChatRoom",
          e
        );
      }
    };

    webSocketService.on("chatMessage", handleIncoming);
    // Subscribe to the specific room topic so backend sends room messages here
    const topic = `/topic/chat/room/${room.id}`;
    webSocketService.subscribeToTopic(topic);
    return () => {
      webSocketService.off("chatMessage", handleIncoming);
      webSocketService.unsubscribeFromTopic(`/topic/chat/room/${room.id}`);
    };
  }, [room, onRoomUpdate]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);
      const message = await chatService.sendMessage(room.id, {
        content: newMessage.trim(),
        messageType: "TEXT",
      });

      setMessages((prev) => [...prev, message]);
      setNewMessage("");

      // Update room's last activity
      const updatedRoom = { ...room, lastActivity: new Date().toISOString() };
      onRoomUpdate(updatedRoom);
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setSending(false);
    }
  };

  const handleDeleteMessage = async (messageId: number) => {
    try {
      await chatService.deleteMessage(messageId);
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
    } catch (err) {
      console.error("Failed to delete message:", err);
    }
  };

  const canDeleteMessage = (message: ChatMessage) => {
    return (
      user &&
      (message.sender.id === user.id ||
        chatService.isUserModerator(room, user.id))
    );
  };

  const formatMessageTime = (createdAt: string) => {
    const date = new Date(createdAt);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatMessageDate = (createdAt: string) => {
    const date = new Date(createdAt);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return t("chat:today");
    } else if (date.toDateString() === yesterday.toDateString()) {
      return t("chat:yesterday");
    } else {
      return date.toLocaleDateString();
    }
  };

  const getRoomHeader = () => {
    const icon =
      room.type === "DIRECT_MESSAGE"
        ? "💬"
        : room.gameTitle
        ? "🎮"
        : room.tournamentId
        ? "🏆"
        : room.eventId
        ? "🎉"
        : "👥";

    return (
      <div className="flex items-center space-x-3 p-4 border-b">
        {showBack && onBack ? (
          <button
            onClick={onBack}
            className="mr-2 text-white text-xl p-1 rounded hover:bg-slate-700/30 flex items-center justify-center"
            aria-label={t("chat:back", "Back")}
          >
            <ArrowLeft
              size={18}
              className={`${i18n?.dir?.() === "rtl" ? "rtl-flip" : ""} w-5 h-5`}
            />
          </button>
        ) : null}
        <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white">
          {icon}
        </div>
        <div className="flex-1">
          <h2 className="font-semibold text-white">
            {room.type === "DIRECT_MESSAGE"
              ? (() => {
                  const other = (room.members || []).find(
                    (m) => m.user?.id !== user?.id
                  );
                  if (other?.user?.displayName) return other.user.displayName;
                  return (
                    room.name ||
                    t("chat:directMessage", { defaultValue: "Direct Message" })
                  );
                })()
              : room.name}
          </h2>
          <p className="text-sm text-gray-300">
            {/* For direct messages we don't show members count or visibility */}
            {room.type !== "DIRECT_MESSAGE" && (
              <>
                {room.currentMembers} {t("chat:members")}
                {room.gameTitle && ` • ${room.gameTitle}`}
              </>
            )}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {/* Don't show privacy badge for direct messages */}
          {room.type !== "DIRECT_MESSAGE" && room.isPrivate && (
            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
              🔒 {t("chat:private")}
            </span>
          )}
          {/* Show delete button to creator or moderators */}
          {user &&
            ((room.creator && room.creator.id === user.id) ||
              (user.id !== undefined &&
                chatService.isUserModerator(room, user.id))) && (
              <button
                onClick={() => setConfirmOpen(true)}
                className="ml-2 text-xs px-2 py-1 rounded bg-red-600 text-white hover:bg-red-700"
                title={t("chat:deleteRoom", "Delete room")}
              >
                🗑️
              </button>
            )}
        </div>
      </div>
    );
  };

  const onCancelDeleteRoom = () => setConfirmOpen(false);

  const onConfirmDeleteRoom = async () => {
    setConfirmOpen(false);
    try {
      // If backend supports deleting rooms, call the API. Otherwise caller
      // can simulate deletion by handling the onRoomDeleted callback.
      await chatService.deleteRoom(room.id);
      if (onRoomDeleted) onRoomDeleted(room.id);
    } catch (err) {
      console.error("Failed to delete room:", err);
      // Fallback: still notify parent so UI can update if appropriate
      if (onRoomDeleted) onRoomDeleted(room.id);
    }
  };

  if (loading) {
    return (
      <div
        className={`bg-dark-secondary rounded-lg shadow-sm border border-slate-700 flex flex-col h-full ${className}`}
      >
        {getRoomHeader()}
        <div className="flex-1 p-4 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex space-x-3">
                <div className="w-8 h-8 bg-slate-600 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-600 rounded w-1/4"></div>
                  <div className="h-3 bg-slate-600 rounded w-3/4"></div>
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
        className={`bg-dark-secondary rounded-lg shadow-sm border border-slate-700 flex flex-col h-full ${className}`}
      >
        {getRoomHeader()}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center text-white">
            <div className="text-red-400 mb-4">⚠️</div>
            <p className="text-red-300 mb-4">{error}</p>
            <button
              onClick={loadMessages}
              className="px-4 py-2 bg-primary text-dark hover:bg-primary-hover transition-colors rounded-lg"
            >
              {t("common.retry")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  let lastMessageDate = "";

  return (
    <div
      className={`bg-dark-secondary rounded-lg shadow-sm border border-slate-700 flex flex-col h-full ${className}`}
    >
      {getRoomHeader()}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar min-h-0">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">💬</div>
            <p className="text-gray-300">{t("chat:noMessagesYet")}</p>
            <p className="text-sm text-gray-400 mt-2">
              {t("chat:startConversation")}
            </p>
          </div>
        ) : (
          messages.map((message) => {
            const messageDate = formatMessageDate(message.createdAt);
            const showDateSeparator = messageDate !== lastMessageDate;
            lastMessageDate = messageDate;

            return (
              <div key={message.id}>
                {showDateSeparator && (
                  <div className="text-center my-4">
                    <span className="text-xs text-gray-300 bg-slate-600/30 px-3 py-1 rounded-full">
                      {messageDate}
                    </span>
                  </div>
                )}

                <div
                  className={`flex space-x-3 ${
                    user && message.sender.id === user.id ? "justify-end" : ""
                  }`}
                >
                  {(!user || message.sender.id !== user.id) && (
                    <div className="w-8 h-8 bg-gradient-to-br from-slate-500 to-slate-700 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                      {message.sender.displayName.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div
                    className={`max-w-xs lg:max-w-md ${
                      user && message.sender.id === user.id ? "order-first" : ""
                    }`}
                  >
                    <div
                      className={`rounded-lg p-3 ${
                        user && message.sender.id === user.id
                          ? "bg-primary text-dark"
                          : "bg-slate-700 text-gray-100"
                      }`}
                    >
                      {(!user || message.sender.id !== user.id) && (
                        <div className="text-xs font-medium mb-1 opacity-75 text-gray-300">
                          {message.sender.displayName}
                        </div>
                      )}

                      <p className="text-sm">{message.content}</p>

                      <div
                        className={`flex items-center justify-between mt-2 text-xs ${
                          user && message.sender.id === user.id
                            ? "text-dark/70"
                            : "text-gray-400"
                        }`}
                      >
                        <span>{formatMessageTime(message.createdAt)}</span>
                        {canDeleteMessage(message) && (
                          <button
                            onClick={() => handleDeleteMessage(message.id)}
                            className="ml-2 hover:text-red-500 transition-colors"
                            title={t("chat:deleteMessage")}
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {user && message.sender.id === user.id && (
                    <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                      {message.sender.displayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Message Input */}
      <div className="border-t p-4">
        <form onSubmit={handleSendMessage} className="flex space-x-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={t("chat:typeMessage")}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={sending}
            maxLength={1000}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            aria-label={t("chat:send", "Send")}
            title={t("chat:send", "Send")}
            className="p-1 text-primary hover:text-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {sending ? (
              "⏳"
            ) : (
              // Minimal arrow icon: points right in LTR, flipped in RTL via .rtl-flip
              <SendAlt
                size={18}
                className={`${
                  i18n?.dir?.() === "rtl" ? "rtl-flip" : ""
                } w-5 h-5`}
                aria-hidden="true"
              />
            )}
          </button>
        </form>
      </div>
      <ConfirmDialog
        open={confirmOpen}
        title={t("chat:deleteRoom", "Delete room")}
        message={t("chat:confirmDelete", "Delete this room?")}
        confirmLabel={t("common.delete", "Delete")}
        cancelLabel={t("common.cancel", "Cancel")}
        onConfirm={onConfirmDeleteRoom}
        onCancel={onCancelDeleteRoom}
      />
    </div>
  );
};

export default ChatRoom;
