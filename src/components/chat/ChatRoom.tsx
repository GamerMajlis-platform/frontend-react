import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { chatService } from "../../services/ChatService";
import { useAppContext } from "../../context/useAppContext";
import type { ChatRoom as ChatRoomType, ChatMessage } from "../../types/chat";

interface ChatRoomProps {
  room: ChatRoomType;
  onRoomUpdate: (room: ChatRoomType) => void;
  className?: string;
}

export const ChatRoom: React.FC<ChatRoomProps> = ({
  room,
  onRoomUpdate,
  className = "",
}) => {
  const { t } = useTranslation();
  const { user } = useAppContext();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);

  const loadMessages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await chatService.getMessages(room.id, {
        page: 0,
        size: 50,
      });
      setMessages(response.messages.reverse()); // Reverse to show newest at bottom
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("chat.errors.loadMessagesFailed")
      );
    } finally {
      setLoading(false);
    }
  }, [room.id, t]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

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
      return t("chat.today");
    } else if (date.toDateString() === yesterday.toDateString()) {
      return t("chat.yesterday");
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
        <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white">
          {icon}
        </div>
        <div className="flex-1">
          <h2 className="font-semibold text-gray-900">{room.name}</h2>
          <p className="text-sm text-gray-500">
            {room.currentMembers} {t("chat.members")}
            {room.gameTitle && ` • ${room.gameTitle}`}
          </p>
        </div>
        {room.isPrivate && (
          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
            🔒 {t("chat.private")}
          </span>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div
        className={`bg-white rounded-lg shadow-sm border flex flex-col h-full ${className}`}
      >
        {getRoomHeader()}
        <div className="flex-1 p-4 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex space-x-3">
                <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-300 rounded w-3/4"></div>
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
        className={`bg-white rounded-lg shadow-sm border flex flex-col h-full ${className}`}
      >
        {getRoomHeader()}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <div className="text-red-500 mb-4">⚠️</div>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={loadMessages}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
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
      className={`bg-white rounded-lg shadow-sm border flex flex-col h-full ${className}`}
    >
      {getRoomHeader()}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">💬</div>
            <p className="text-gray-500">{t("chat.noMessagesYet")}</p>
            <p className="text-sm text-gray-400 mt-2">
              {t("chat.startConversation")}
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
                    <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
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
                    <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
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
                          ? "bg-primary text-white"
                          : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      {(!user || message.sender.id !== user.id) && (
                        <div className="text-xs font-medium mb-1 opacity-75">
                          {message.sender.displayName}
                        </div>
                      )}

                      <p className="text-sm">{message.content}</p>

                      <div
                        className={`flex items-center justify-between mt-2 text-xs ${
                          user && message.sender.id === user.id
                            ? "text-white/75"
                            : "text-gray-500"
                        }`}
                      >
                        <span>{formatMessageTime(message.createdAt)}</span>
                        {canDeleteMessage(message) && (
                          <button
                            onClick={() => handleDeleteMessage(message.id)}
                            className="ml-2 hover:text-red-500 transition-colors"
                            title={t("chat.deleteMessage")}
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
            placeholder={t("chat.typeMessage")}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={sending}
            maxLength={1000}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? "⏳" : "📤"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatRoom;
