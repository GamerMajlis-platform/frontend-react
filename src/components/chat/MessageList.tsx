import React, { useState, useEffect, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { chatService } from "../../services/ChatService";
import { useAppContext } from "../../context/useAppContext";
import type { ChatMessage, ChatRoom } from "../../types/chat";

interface MessageListProps {
  room: ChatRoom;
  messages: ChatMessage[];
  onMessagesUpdate: (messages: ChatMessage[]) => void;
  className?: string;
}

export const MessageList: React.FC<MessageListProps> = ({
  room,
  messages,
  onMessagesUpdate,
  className = "",
}) => {
  const { t } = useTranslation();
  const { user } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadMoreMessages = useCallback(async () => {
    if (loading || !hasMore || messages.length === 0) return;

    try {
      setLoading(true);
      const oldestMessage = messages[0];
      const response = await chatService.getMessages(room.id, {
        beforeMessageId: oldestMessage.id,
        size: 20,
      });

      if (response.messages.length === 0) {
        setHasMore(false);
      } else {
        const newMessages = [...response.messages.reverse(), ...messages];
        onMessagesUpdate(newMessages);
      }
    } catch (err) {
      console.error("Failed to load more messages:", err);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, messages, room.id, onMessagesUpdate]);

  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    // Load more messages when scrolled to top
    if (container.scrollTop === 0 && hasMore && !loading) {
      loadMoreMessages();
    }
  }, [hasMore, loading, loadMoreMessages]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages.length]);

  const handleDeleteMessage = async (messageId: number) => {
    try {
      await chatService.deleteMessage(messageId);
      const updatedMessages = messages.filter((m) => m.id !== messageId);
      onMessagesUpdate(updatedMessages);
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

  const groupMessagesByDate = (messages: ChatMessage[]) => {
    const groups: { date: string; messages: ChatMessage[] }[] = [];
    let currentDate = "";
    let currentGroup: ChatMessage[] = [];

    messages.forEach((message) => {
      const messageDate = formatMessageDate(message.createdAt);

      if (messageDate !== currentDate) {
        if (currentGroup.length > 0) {
          groups.push({ date: currentDate, messages: currentGroup });
        }
        currentDate = messageDate;
        currentGroup = [message];
      } else {
        currentGroup.push(message);
      }
    });

    if (currentGroup.length > 0) {
      groups.push({ date: currentDate, messages: currentGroup });
    }

    return groups;
  };

  if (messages.length === 0) {
    return (
      <div
        className={`flex-1 flex items-center justify-center p-6 ${className}`}
      >
        <div className="text-center">
          <div className="text-4xl mb-4">💬</div>
          <p className="text-gray-500">{t("chat.noMessagesYet")}</p>
          <p className="text-sm text-gray-400 mt-2">
            {t("chat.startConversation")}
          </p>
        </div>
      </div>
    );
  }

  const messageGroups = groupMessagesByDate(messages);

  return (
    <div
      ref={messagesContainerRef}
      className={`flex-1 overflow-y-auto p-4 space-y-4 ${className}`}
      onScroll={handleScroll}
    >
      {/* Loading indicator for older messages */}
      {loading && (
        <div className="text-center py-2">
          <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          <span className="ml-2 text-sm text-gray-500">
            {t("chat.loadingMessages")}
          </span>
        </div>
      )}

      {/* No more messages indicator */}
      {!hasMore && messages.length > 0 && (
        <div className="text-center py-2">
          <span className="text-xs text-gray-400">
            {t("chat.noMoreMessages")}
          </span>
        </div>
      )}

      {/* Message groups by date */}
      {messageGroups.map((group, groupIndex) => (
        <div key={`${group.date}-${groupIndex}`}>
          {/* Date separator */}
          <div className="text-center my-4">
            <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {group.date}
            </span>
          </div>

          {/* Messages for this date */}
          <div className="space-y-3">
            {group.messages.map((message, messageIndex) => {
              const isOwnMessage = user && message.sender.id === user.id;
              const prevMessage =
                messageIndex > 0 ? group.messages[messageIndex - 1] : null;
              const isSameSender =
                prevMessage && prevMessage.sender.id === message.sender.id;
              const showAvatar = !isSameSender || !isOwnMessage;

              return (
                <div
                  key={message.id}
                  className={`flex space-x-3 ${
                    isOwnMessage ? "justify-end" : ""
                  }`}
                >
                  {/* Avatar for other users */}
                  {!isOwnMessage && (
                    <div
                      className={`w-8 h-8 flex-shrink-0 ${
                        showAvatar ? "" : "invisible"
                      }`}
                    >
                      {showAvatar && (
                        <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                          {message.sender.displayName.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Message content */}
                  <div
                    className={`max-w-xs lg:max-w-md ${
                      isOwnMessage ? "order-first" : ""
                    }`}
                  >
                    <div
                      className={`rounded-lg p-3 ${
                        isOwnMessage
                          ? "bg-primary text-white"
                          : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      {/* Sender name (for other users and first message in group) */}
                      {!isOwnMessage && showAvatar && (
                        <div className="text-xs font-medium mb-1 opacity-75">
                          {message.sender.displayName}
                        </div>
                      )}

                      {/* Reply indicator */}
                      {message.replyToMessage && (
                        <div
                          className={`mb-2 p-2 rounded border-l-2 text-xs ${
                            isOwnMessage
                              ? "bg-white/20 border-white/40 text-white/80"
                              : "bg-gray-200 border-gray-400 text-gray-600"
                          }`}
                        >
                          <div className="font-medium">
                            {message.replyToMessage.sender.displayName}
                          </div>
                          <div className="truncate">
                            {message.replyToMessage.content}
                          </div>
                        </div>
                      )}

                      {/* Message content */}
                      <p className="text-sm">{message.content}</p>

                      {/* File attachment */}
                      {message.fileUrl && (
                        <div className="mt-2">
                          <a
                            href={message.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`text-xs underline ${
                              isOwnMessage ? "text-white/80" : "text-blue-600"
                            }`}
                          >
                            📎 {message.fileName || t("chat.attachment")}
                          </a>
                        </div>
                      )}

                      {/* Message footer */}
                      <div
                        className={`flex items-center justify-between mt-2 text-xs ${
                          isOwnMessage ? "text-white/75" : "text-gray-500"
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

                  {/* Avatar for own messages */}
                  {isOwnMessage && (
                    <div
                      className={`w-8 h-8 flex-shrink-0 ${
                        showAvatar ? "" : "invisible"
                      }`}
                    >
                      {showAvatar && (
                        <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white text-sm font-medium">
                          {message.sender.displayName.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Scroll to bottom anchor */}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
