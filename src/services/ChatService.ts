import { apiFetch } from "../lib/api";
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

class ChatService {
  /**
   * API #60: Create Chat Room
   * Creates a new chat room with specified settings
   */
  async createRoom(data: CreateChatRoomData): Promise<ChatRoom> {
    const formData = new FormData();
    formData.append("name", data.name);

    if (data.description) formData.append("description", data.description);
    if (data.type) formData.append("type", data.type);
    if (data.isPrivate !== undefined)
      formData.append("isPrivate", data.isPrivate.toString());
    if (data.maxMembers)
      formData.append("maxMembers", data.maxMembers.toString());
    if (data.gameTitle) formData.append("gameTitle", data.gameTitle);
    if (data.tournamentId)
      formData.append("tournamentId", data.tournamentId.toString());
    if (data.eventId) formData.append("eventId", data.eventId.toString());

    const response = await apiFetch<ChatRoomResponse>("/chat/rooms", {
      method: "POST",
      body: formData,
    });

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
    return await apiFetch<ChatRoomsResponse>(url, {
      method: "GET",
    });
  }

  /**
   * API #62: Get Chat Room Details
   * Retrieves detailed information about a specific chat room
   */
  async getRoomDetails(roomId: number): Promise<ChatRoom> {
    const response = await apiFetch<ChatRoomResponse>(`/chat/rooms/${roomId}`, {
      method: "GET",
    });

    return response.chatRoom;
  }

  /**
   * API #63: Join Chat Room
   * Joins a chat room as a member
   */
  async joinRoom(roomId: number): Promise<ChatMember> {
    const response = await apiFetch<ChatMemberResponse>(
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
    await apiFetch<ChatApiResponse>(`/chat/rooms/${roomId}/leave`, {
      method: "POST",
    });
  }

  /**
   * API #65: Send Message
   * Sends a message to a chat room with optional file attachment
   */
  async sendMessage(
    roomId: number,
    data: SendMessageData
  ): Promise<ChatMessage> {
    const formData = new FormData();
    formData.append("content", data.content);

    if (data.messageType) formData.append("messageType", data.messageType);
    if (data.replyToMessageId)
      formData.append("replyToMessageId", data.replyToMessageId.toString());
    if (data.file) formData.append("file", data.file);

    const response = await apiFetch<ChatMessageResponse>(
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
    return await apiFetch<ChatMessagesResponse>(url, {
      method: "GET",
    });
  }

  /**
   * API #67: Delete Message
   * Deletes a specific message (must be sender or moderator)
   */
  async deleteMessage(messageId: number): Promise<void> {
    await apiFetch<ChatApiResponse>(`/chat/messages/${messageId}`, {
      method: "DELETE",
    });
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
    const formData = new FormData();
    if (data.role) formData.append("role", data.role);

    const response = await apiFetch<ChatMemberResponse>(
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
    await apiFetch<ChatApiResponse>(
      `/chat/rooms/${roomId}/members/${memberId}`,
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
    return await apiFetch<ChatMembersResponse>(url, {
      method: "GET",
    });
  }

  /**
   * API #71: Start Direct Message
   * Starts a direct message conversation with another user
   */
  async startDirectMessage(data: StartDirectMessageData): Promise<ChatRoom> {
    const formData = new FormData();
    formData.append("recipientId", data.recipientId.toString());

    const response = await apiFetch<ChatRoomResponse>("/chat/direct", {
      method: "POST",
      body: formData,
    });

    return response.chatRoom;
  }

  /**
   * API #72: Get Online Users
   * Retrieves list of currently online users
   */
  async getOnlineUsers(): Promise<OnlineUser[]> {
    const response = await apiFetch<OnlineUsersResponse>("/chat/online-users", {
      method: "GET",
    });

    return response.onlineUsers;
  }

  /**
   * API #73: Send Typing Indicator
   * Sends typing indicator to a chat room
   */
  async sendTypingIndicator(
    roomId: number,
    isTyping: boolean = true
  ): Promise<TypingResponse> {
    const formData = new FormData();
    formData.append("roomId", roomId.toString());
    formData.append("isTyping", isTyping.toString());

    return await apiFetch<TypingResponse>("/chat/typing", {
      method: "POST",
      body: formData,
    });
  }

  /**
   * Utility method to check if user can moderate a room
   */
  isUserModerator(room: ChatRoom, userId: number): boolean {
    return (
      room.creator.id === userId ||
      (room.moderatorIds?.includes(userId) ?? false) ||
      (room.members?.some(
        (m) => m.user.id === userId && ["ADMIN", "MODERATOR"].includes(m.role)
      ) ??
        false)
    );
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
}

// Export singleton instance
export const chatService = new ChatService();
export default chatService;
