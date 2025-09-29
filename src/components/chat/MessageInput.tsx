import React, { useState, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { chatService } from "../../services/ChatService";
import type { ChatMessage, SendMessageData } from "../../types/chat";

interface MessageInputProps {
  roomId: number;
  onMessageSent: (message: ChatMessage) => void;
  replyToMessage?: ChatMessage | null;
  onCancelReply?: () => void;
  className?: string;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  roomId,
  onMessageSent,
  replyToMessage,
  onCancelReply,
  className = "",
}) => {
  const { t } = useTranslation();
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if ((!content.trim() && !selectedFile) || sending) return;

    try {
      setSending(true);

      const messageData: SendMessageData = {
        content: content.trim(),
        messageType: selectedFile ? getFileMessageType(selectedFile) : "TEXT",
      };

      if (replyToMessage) {
        messageData.replyToMessageId = replyToMessage.id;
      }

      if (selectedFile) {
        messageData.file = selectedFile;
      }

      const message = await chatService.sendMessage(roomId, messageData);
      onMessageSent(message);

      // Reset form
      setContent("");
      setSelectedFile(null);
      if (onCancelReply) onCancelReply();

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // Focus back to textarea
      textareaRef.current?.focus();
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setSending(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 10MB as per API spec)
      if (file.size > 10 * 1024 * 1024) {
        alert(t("chat:errors.fileTooLarge"));
        return;
      }
      setSelectedFile(file);
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getFileMessageType = (
    file: File
  ): "IMAGE" | "VIDEO" | "AUDIO" | "FILE" => {
    const type = file.type.toLowerCase();
    if (type.startsWith("image/")) return "IMAGE";
    if (type.startsWith("video/")) return "VIDEO";
    if (type.startsWith("audio/")) return "AUDIO";
    return "FILE";
  };

  const getFileIcon = (file: File) => {
    const messageType = getFileMessageType(file);
    switch (messageType) {
      case "IMAGE":
        return "🖼️";
      case "VIDEO":
        return "🎥";
      case "AUDIO":
        return "🎵";
      default:
        return "📄";
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as React.FormEvent);
    }
  };

  const handleTyping = useCallback(async () => {
    try {
      await chatService.sendTypingIndicator(roomId, true);
    } catch {
      // Ignore typing indicator errors
    }
  }, [roomId]);

  // Auto-resize textarea
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);

    // Auto-resize
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px";

    // Send typing indicator
    if (e.target.value.trim()) {
      handleTyping();
    }
  };

  return (
    <div className={`border-t bg-dark-secondary ${className}`}>
      {/* Reply indicator */}
      {replyToMessage && (
        <div className="px-4 py-2 bg-slate-700/40 border-b border-slate-700 flex items-center justify-between text-gray-200">
          <div className="flex-1">
            <div className="text-xs text-gray-500">{t("chat:replyingTo")}</div>
            <div className="text-sm font-medium text-gray-700">
              {replyToMessage.sender.displayName}
            </div>
            <div className="text-sm text-gray-600 truncate">
              {replyToMessage.content}
            </div>
          </div>
          {onCancelReply && (
            <button
              onClick={onCancelReply}
              className="ml-2 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          )}
        </div>
      )}

      {/* File preview */}
      {selectedFile && (
        <div className="px-4 py-2 bg-slate-700/30 border-b border-slate-700 flex items-center justify-between text-gray-200">
          <div className="flex items-center space-x-2">
            <span className="text-lg">{getFileIcon(selectedFile)}</span>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-700">
                {selectedFile.name}
              </div>
              <div className="text-xs text-gray-500">
                {formatFileSize(selectedFile.size)}
              </div>
            </div>
          </div>
          <button
            onClick={removeSelectedFile}
            className="ml-2 text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
      )}

      {/* Input area */}
      <div className="p-4">
        <form onSubmit={handleSubmit} className="flex items-end space-x-3">
          {/* File input (hidden) */}
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            className="hidden"
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
            aria-label={t("chat:attachFile")}
          />

          {/* File attachment button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex-shrink-0 p-2 text-gray-300 hover:text-white hover:bg-slate-700/40 rounded-full transition-colors"
            disabled={sending}
            title={t("chat:attachFile")}
          >
            📎
          </button>

          {/* Message textarea */}
          <div className="flex-1">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={handleTextareaChange}
              onKeyPress={handleKeyPress}
              placeholder={t("chat:typeMessage")}
              className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-primary resize-none min-h-[42px] max-h-[120px] text-gray-200"
              disabled={sending}
              maxLength={1000}
              rows={1}
            />
          </div>

          {/* Send button */}
          <button
            type="submit"
            disabled={(!content.trim() && !selectedFile) || sending}
            className="flex-shrink-0 p-2 bg-primary text-dark rounded-full hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title={t("chat:sendMessage")}
          >
            {sending ? (
              <div className="w-5 h-5 flex items-center justify-center">
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <span className="block w-5 h-5 text-center leading-5">📤</span>
            )}
          </button>
        </form>

        {/* Character count */}
        {content.length > 800 && (
          <div className="mt-1 text-right">
            <span
              className={`text-xs ${
                content.length > 950 ? "text-red-500" : "text-gray-400"
              }`}
            >
              {content.length}/1000
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageInput;
