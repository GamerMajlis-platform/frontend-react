import { BaseService } from "../lib/baseService";
import type {
  ChatRoom,
  ChatMessage,
  ChatMember,
  OnlineUser,
  ChatRoomsResponse,
  ChatRoomResponse,
  ChatMessagesResponse,
  ChatMessageResponse,
  ChatMembersResponse,
  ChatMemberResponse,
  OnlineUsersResponse,
  TypingResponse,
  ChatApiResponse,
  CreateChatRoomData,
  SendMessageData,
  AddMemberData,
  StartDirectMessageData,
  ChatRoomsParams,
  ChatMessagesParams,
  ChatMembersParams,
} from "../types/chat";

class ChatService extends BaseService {
  /**
   * API #60: Create Chat Room
   * Creates a new chat room with specified settings
   */
  async createRoom(data: CreateChatRoomData): Promise<ChatRoom> {
    const formData = ChatService.createFormData({
      name: data.name,
      description: data.description ?? "",
      type: data.type ?? "",
      isPrivate: data.isPrivate !== undefined ? data.isPrivate.toString() : "",
      maxMembers:
        data.maxMembers !== undefined ? data.maxMembers.toString() : "",
      gameTitle: data.gameTitle ?? "",
      tournamentId:
        data.tournamentId !== undefined ? data.tournamentId.toString() : "",
      eventId: data.eventId !== undefined ? data.eventId.toString() : "",
    });
    const response = await ChatService.authenticatedRequest<ChatRoomResponse>(
      "/chat/rooms",
      {
        method: "POST",
        body: formData,
      }
    );
    return response.chatRoom;
  }

  /**
   * API #61: Get User Chat Rooms
   * Retrieves all chat rooms the user is a member of
   */
  async getUserRooms(params: ChatRoomsParams = {}): Promise<ChatRoomsResponse> {
    const searchParams = new URLSearchParams();
    if (params.page !== undefined)
      searchParams.append("page", params.page.toString());
    if (params.size !== undefined)
      searchParams.append("size", params.size.toString());

    const url = `/chat/rooms${
      searchParams.toString() ? `?${searchParams.toString()}` : ""
    }`;
    return await ChatService.authenticatedRequest<ChatRoomsResponse>(url, {
      method: "GET",
    });
  }

  /**
   * API #62: Get Chat Room Details
   * Retrieves detailed information about a specific chat room
   */
  async getRoomDetails(roomId: number): Promise<ChatRoom> {
    const response = await ChatService.authenticatedRequest<ChatRoomResponse>(
      `/chat/rooms/${roomId}`,
      {
        method: "GET",
      }
    );
    return response.chatRoom;
  }

  /**
   * API #63: Join Chat Room
   * Joins a chat room as a member
   */
  async joinRoom(roomId: number): Promise<ChatMember> {
    const response = await ChatService.authenticatedRequest<ChatMemberResponse>(
      `/chat/rooms/${roomId}/join`,
      {
        method: "POST",
      }
    );
    return response.membership;
  }

  /**
   * API #64: Leave Chat Room
   * Leaves a chat room
   */
  async leaveRoom(roomId: number): Promise<void> {
    await ChatService.authenticatedRequest<ChatApiResponse>(
      `/chat/rooms/${roomId}/leave`,
      {
        method: "POST",
      }
    );
  }

  /**
   * API #65: Send Message
   * Sends a message to a chat room with optional file attachment
   */
  async sendMessage(
    roomId: number,
    data: SendMessageData
  ): Promise<ChatMessage> {
    const formData = ChatService.createFormData({
      content: data.content,
      messageType: data.messageType ?? "",
      replyToMessageId:
        data.replyToMessageId !== undefined
          ? data.replyToMessageId.toString()
          : "",
      file: data.file ?? "",
    });
    const response =
      await ChatService.authenticatedRequest<ChatMessageResponse>(
        `/chat/rooms/${roomId}/messages`,
        {
          method: "POST",
          body: formData,
        }
      );
    return response.chatMessage;
  }

  /**
   * API #66: Get Chat Messages
   * Retrieves messages from a chat room with pagination and filtering
   */
  async getMessages(
    roomId: number,
    params: ChatMessagesParams = {}
  ): Promise<ChatMessagesResponse> {
    const searchParams = new URLSearchParams();
    if (params.page !== undefined)
      searchParams.append("page", params.page.toString());
    if (params.size !== undefined)
      searchParams.append("size", params.size.toString());
    if (params.beforeMessageId !== undefined)
      searchParams.append("beforeMessageId", params.beforeMessageId.toString());
    if (params.afterMessageId !== undefined)
      searchParams.append("afterMessageId", params.afterMessageId.toString());

    const url = `/chat/rooms/${roomId}/messages${
      searchParams.toString() ? `?${searchParams.toString()}` : ""
    }`;
    return await ChatService.authenticatedRequest<ChatMessagesResponse>(url, {
      method: "GET",
    });
  }

  /**
   * API #67: Delete Message
   * Deletes a specific message (must be sender or moderator)
   */
  async deleteMessage(messageId: number): Promise<void> {
    await ChatService.authenticatedRequest<ChatApiResponse>(
      `/chat/messages/${messageId}`,
      {
        method: "DELETE",
      }
    );
  }

  /**
   * API #68: Add Chat Room Member
   * Adds a member to a chat room (admin/moderator only)
   */
  async addMember(
    roomId: number,
    memberId: number,
    data: AddMemberData = {}
  ): Promise<ChatMember> {
    const formData = ChatService.createFormData({
      role: data.role ?? "",
    });
    const response = await ChatService.authenticatedRequest<ChatMemberResponse>(
      `/chat/rooms/${roomId}/members/${memberId}`,
      {
        method: "POST",
        body: formData,
      }
    );
    return response.membership;
  }

  /**
   * API #69: Remove Chat Room Member
   * Removes a member from a chat room (admin/moderator only)
   */
  async removeMember(roomId: number, memberId: number): Promise<void> {
    await ChatService.authenticatedRequest<ChatApiResponse>(
      `/chat/rooms/${roomId}/members/${memberId}`,
      {
        method: "DELETE",
      }
    );
  }

  /**
   * API: Delete Chat Room
   * Permanently deletes a chat room (admin/creator only)
   */
  async deleteRoom(roomId: number): Promise<void> {
    await ChatService.authenticatedRequest<ChatApiResponse>(
      `/chat/rooms/${roomId}`,
      {
        method: "DELETE",
      }
    );
  }

  /**
   * API #70: Get Chat Room Members
   * Retrieves all members of a chat room with their status
   */
  async getMembers(
    roomId: number,
    params: ChatMembersParams = {}
  ): Promise<ChatMembersResponse> {
    const searchParams = new URLSearchParams();
    if (params.page !== undefined)
      searchParams.append("page", params.page.toString());
    if (params.size !== undefined)
      searchParams.append("size", params.size.toString());

    const url = `/chat/rooms/${roomId}/members${
      searchParams.toString() ? `?${searchParams.toString()}` : ""
    }`;
    return await ChatService.authenticatedRequest<ChatMembersResponse>(url, {
      method: "GET",
    });
  }

  /**
   * API #71: Start Direct Message
   * Starts a direct message conversation with another user
   */
  async startDirectMessage(data: StartDirectMessageData): Promise<ChatRoom> {
    const formData = ChatService.createFormData({
      recipientId: data.recipientId.toString(),
    });
    const response = await ChatService.authenticatedRequest<ChatRoomResponse>(
      "/chat/direct",
      {
        method: "POST",
        body: formData,
      }
    );
    return response.chatRoom;
  }

  /**
   * API #72: Get Online Users
   * Retrieves list of currently online users
   */
  async getOnlineUsers(): Promise<OnlineUser[]> {
    const response =
      await ChatService.authenticatedRequest<OnlineUsersResponse>(
        "/chat/online-users",
        {
          method: "GET",
        }
      );
    return response.onlineUsers;
  }

  /**
   * API: Get Suggested Rooms
   * Retrieves rooms suggested by other players (feed)
   */
  async getSuggestedRooms(
    params: ChatRoomsParams = {}
  ): Promise<ChatRoomsResponse> {
    const searchParams = new URLSearchParams();
    if (params.page !== undefined)
      searchParams.append("page", params.page.toString());
    if (params.size !== undefined)
      searchParams.append("size", params.size.toString());

    const url = `/chat/suggested${
      searchParams.toString() ? `?${searchParams.toString()}` : ""
    }`;
    return await ChatService.authenticatedRequest<ChatRoomsResponse>(url, {
      method: "GET",
    });
  }

  /**
   * API #73: Send Typing Indicator
   * Sends typing indicator to a chat room
   */
  async sendTypingIndicator(
    roomId: number,
    isTyping: boolean = true
  ): Promise<TypingResponse> {
    const formData = ChatService.createFormData({
      roomId: roomId.toString(),
      isTyping: isTyping.toString(),
    });
    return await ChatService.authenticatedRequest<TypingResponse>(
      "/chat/typing",
      {
        method: "POST",
        body: formData,
      }
    );
  }

  /**
   * Utility method to check if user can moderate a room
   */
  isUserModerator(room: ChatRoom, userId: number): boolean {
    // Be defensive: room.creator or members may be undefined for certain room shapes
    const creatorId = room.creator?.id;
    const isCreator = creatorId !== undefined && creatorId === userId;
    const isModeratorId = room.moderatorIds?.includes(userId) ?? false;
    const isMemberModerator =
      room.members?.some(
        (m) => m.user?.id === userId && ["ADMIN", "MODERATOR"].includes(m.role)
      ) ?? false;

    return isCreator || isModeratorId || isMemberModerator;
  }

  /**
   * Utility method to format file size
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  /**
   * Utility method to check if message type supports preview
   */
  isPreviewableMessage(messageType: string): boolean {
    return ["IMAGE", "VIDEO"].includes(messageType);
  }

  /**
   * Utility method to get message type icon
   */
  getMessageTypeIcon(messageType: string): string {
    const iconMap: Record<string, string> = {
      TEXT: "💬",
      IMAGE: "🖼️",
      VIDEO: "🎥",
      AUDIO: "🎵",
      FILE: "📄",
      SYSTEM: "⚙️",
    };
    return iconMap[messageType] || "💬";
  }

  // ===== CHAT ENHANCEMENT FEATURES =====

  /**
   * T24: Message toxicity filtering
   */
  private messageHistory: Map<number, { count: number; lastMessage: number }> =
    new Map();
  private blockedUsers: Set<number> = new Set();

  /**
   * F17: Spam detection - rate limiting for rapid messaging
   */
  isSpamming(userId: number): boolean {
    const now = Date.now();
    const userHistory = this.messageHistory.get(userId);

    if (!userHistory) {
      this.messageHistory.set(userId, { count: 1, lastMessage: now });
      return false;
    }

    // Reset count if more than 60 seconds have passed
    if (now - userHistory.lastMessage > 60000) {
      this.messageHistory.set(userId, { count: 1, lastMessage: now });
      return false;
    }

    // Check if user is sending more than 10 messages per minute
    userHistory.count++;
    userHistory.lastMessage = now;

    return userHistory.count > 10;
  }

  /**
   * T24: Basic toxicity filter for messages
   */
  containsToxicContent(message: string): { isToxic: boolean; reason?: string } {
    const toxicWords = [
      "hate",
      "toxic",
      "spam",
      "abuse",
      "harassment",
      "inappropriate",
      "offensive",
      "threatening",
    ];

    const lowerMessage = message.toLowerCase();
    const foundToxicWord = toxicWords.find((word) =>
      lowerMessage.includes(word)
    );

    if (foundToxicWord) {
      return {
        isToxic: true,
        reason: `Message contains inappropriate content: ${foundToxicWord}`,
      };
    }

    // Check for excessive caps (more than 70% uppercase)
    const capsCount = (message.match(/[A-Z]/g) || []).length;
    const letterCount = (message.match(/[A-Za-z]/g) || []).length;

    if (letterCount > 10 && capsCount / letterCount > 0.7) {
      return {
        isToxic: true,
        reason: "Message contains excessive capitalization",
      };
    }

    return { isToxic: false };
  }

  /**
   * F16: Block user functionality
   */
  blockUser(userId: number): void {
    this.blockedUsers.add(userId);
  }

  /**
   * F16: Unblock user functionality
   */
  unblockUser(userId: number): void {
    this.blockedUsers.delete(userId);
  }

  /**
   * F16: Check if user is blocked
   */
  isUserBlocked(userId: number): boolean {
    return this.blockedUsers.has(userId);
  }

  /**
   * Enhanced send message with validation
   */
  async sendMessageWithValidation(
    roomId: number,
    data: SendMessageData,
    userId: number
  ): Promise<ChatMessage> {
    // F16: Check if user is blocked
    if (this.isUserBlocked(userId)) {
      throw new Error("You are blocked from sending messages");
    }

    // F17: Check for spam
    if (this.isSpamming(userId)) {
      throw new Error(
        "You are sending messages too quickly. Please slow down."
      );
    }

    // T24: Check for toxic content
    if (data.content) {
      const toxicityCheck = this.containsToxicContent(data.content);
      if (toxicityCheck.isToxic) {
        throw new Error(
          toxicityCheck.reason || "Message contains inappropriate content"
        );
      }
    }

    // T21: Message length validation (already handled in UI but double-check)
    if (data.content && data.content.length > 1000) {
      throw new Error("Message exceeds maximum length of 1000 characters");
    }

    // If all validations pass, send the message
    return this.sendMessage(roomId, data);
  }

  /**
   * T23: Chat history preservation (30 days)
   * This would typically be handled by backend, but we can track it client-side
   */
  private messageRetentionDays = 30;

  /**
   * Check if message is within retention period
   */
  isMessageWithinRetention(messageDate: string): boolean {
    const messageTime = new Date(messageDate).getTime();
    const retentionTime = this.messageRetentionDays * 24 * 60 * 60 * 1000;
    const cutoffTime = Date.now() - retentionTime;

    return messageTime > cutoffTime;
  }

  /**
   * Filter messages by retention policy
   */
  filterMessagesByRetention(messages: ChatMessage[]): ChatMessage[] {
    return messages.filter((message) =>
      this.isMessageWithinRetention(message.createdAt)
    );
  }
}

// Export singleton instance
export const chatService = new ChatService();
export default chatService;
