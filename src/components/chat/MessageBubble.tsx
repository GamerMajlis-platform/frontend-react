import React from "react";
import { useTranslation } from "react-i18next";
import { useAppContext } from "../../context/useAppContext";
import type { ChatMessage, ChatRoom } from "../../types/chat";
import { chatService } from "../../services/ChatService";

interface MessageBubbleProps {
  message: ChatMessage;
  room: ChatRoom;
  showAvatar?: boolean;
  showSenderName?: boolean;
  onReply?: (message: ChatMessage) => void;
  onDelete?: (messageId: number) => void;
  className?: string;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  room,
  showAvatar = true,
  showSenderName = true,
  onReply,
  onDelete,
  className = "",
}) => {
  const { t } = useTranslation();
  const { user } = useAppContext();

  const isOwnMessage = user && message.sender.id === user.id;

  const canDeleteMessage = () => {
    return (
      user &&
      (message.sender.id === user.id ||
        chatService.isUserModerator(room, user.id))
    );
  };

  const formatTime = (createdAt: string) => {
    const date = new Date(createdAt);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const getMessageTypeIcon = () => {
    return chatService.getMessageTypeIcon(message.messageType);
  };

  const handleReply = () => {
    if (onReply) {
      onReply(message);
    }
  };

  const handleDelete = () => {
    if (onDelete && canDeleteMessage()) {
      onDelete(message.id);
    }
  };

  return (
    <div
      className={`flex space-x-3 ${
        isOwnMessage ? "justify-end" : ""
      } ${className}`}
    >
      {/* Avatar for other users */}
      {!isOwnMessage && showAvatar && (
        <div className="w-8 h-8 flex-shrink-0">
          {message.sender.profilePictureUrl ? (
            <img
              src={message.sender.profilePictureUrl}
              alt={message.sender.displayName}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
              {message.sender.displayName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      )}

      {/* Message content */}
      <div
        className={`max-w-xs lg:max-w-md ${isOwnMessage ? "order-first" : ""}`}
      >
        <div
          className={`rounded-lg p-3 relative group ${
            isOwnMessage ? "bg-primary text-white" : "bg-gray-100 text-gray-900"
          }`}
        >
          {/* Sender name for group messages */}
          {!isOwnMessage && showSenderName && (
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
              <div className="truncate">{message.replyToMessage.content}</div>
            </div>
          )}

          {/* Message type indicator */}
          {message.messageType !== "TEXT" && (
            <div className="flex items-center mb-2 text-xs opacity-75">
              <span className="mr-1">{getMessageTypeIcon()}</span>
              <span>
                {t(`chat.messageTypes.${message.messageType.toLowerCase()}`)}
              </span>
            </div>
          )}

          {/* Message content */}
          <div className="text-sm">{message.content}</div>

          {/* File attachment */}
          {message.fileUrl && (
            <div className="mt-2">
              {chatService.isPreviewableMessage(message.messageType) ? (
                <div className="max-w-full">
                  {message.messageType === "IMAGE" ? (
                    <img
                      src={message.fileUrl}
                      alt={message.fileName || "Image"}
                      className="max-w-full h-auto rounded border"
                    />
                  ) : message.messageType === "VIDEO" ? (
                    <video
                      src={message.fileUrl}
                      controls
                      className="max-w-full h-auto rounded border"
                    >
                      {t("chat.videoNotSupported")}
                    </video>
                  ) : null}
                </div>
              ) : (
                <a
                  href={message.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center text-xs underline ${
                    isOwnMessage
                      ? "text-white/80 hover:text-white"
                      : "text-blue-600 hover:text-blue-800"
                  }`}
                >
                  <span className="mr-1">📎</span>
                  <span>
                    {message.fileName || t("chat.attachment")}
                    {message.fileSize && (
                      <span className="ml-1 opacity-75">
                        ({chatService.formatFileSize(message.fileSize)})
                      </span>
                    )}
                  </span>
                </a>
              )}
            </div>
          )}

          {/* Message actions (visible on hover) */}
          <div
            className={`absolute top-2 ${
              isOwnMessage ? "left-2" : "right-2"
            } opacity-0 group-hover:opacity-100 transition-opacity`}
          >
            <div className="flex items-center space-x-1">
              {/* Reply button */}
              {onReply && (
                <button
                  onClick={handleReply}
                  className={`p-1 rounded text-xs hover:bg-black/10 ${
                    isOwnMessage
                      ? "text-white/75 hover:text-white"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  title={t("chat.reply")}
                >
                  ↩️
                </button>
              )}

              {/* Delete button */}
              {canDeleteMessage() && onDelete && (
                <button
                  onClick={handleDelete}
                  className={`p-1 rounded text-xs hover:bg-red-500/20 hover:text-red-500 ${
                    isOwnMessage ? "text-white/75" : "text-gray-500"
                  }`}
                  title={t("chat.deleteMessage")}
                >
                  🗑️
                </button>
              )}
            </div>
          </div>

          {/* Message footer */}
          <div
            className={`flex items-center justify-between mt-2 text-xs ${
              isOwnMessage ? "text-white/75" : "text-gray-500"
            }`}
          >
            <span>{formatTime(message.createdAt)}</span>
            {message.updatedAt && message.updatedAt !== message.createdAt && (
              <span className="italic opacity-75">{t("chat.edited")}</span>
            )}
          </div>
        </div>
      </div>

      {/* Avatar for own messages */}
      {isOwnMessage && showAvatar && (
        <div className="w-8 h-8 flex-shrink-0">
          {user?.profilePictureUrl ? (
            <img
              src={user.profilePictureUrl}
              alt={user.displayName}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white text-sm font-medium">
              {user?.displayName?.charAt(0).toUpperCase() || "?"}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MessageBubble;
