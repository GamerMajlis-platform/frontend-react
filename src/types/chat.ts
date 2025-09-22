export interface ChatUser {
  id: number;
  displayName: string;
  profilePictureUrl?: string;
}

export interface ChatRoom {
  id: number;
  name: string;
  description?: string;
  type: ChatRoomType;
  isPrivate: boolean;
  maxMembers?: number;
  currentMembers: number;
  gameTitle?: string;
  tournamentId?: number;
  eventId?: number;
  creator: ChatUser;
  moderatorIds?: number[];
  members?: ChatMember[];
  isActive: boolean;
  allowFileSharing: boolean;
  allowEmojis: boolean;
  messageHistoryDays?: number;
  slowModeSeconds?: number | null;
  totalMessages: number;
  lastActivity: string;
  createdAt: string;
  lastMessage?: LastMessage;
}

export interface ChatMember {
  id: number;
  user: ChatUser;
  role: ChatMemberRole;
  joinedAt: string;
  lastSeen?: string;
  isOnline?: boolean;
}

export interface ChatMessage {
  id: number;
  content: string;
  messageType: MessageType;
  sender: ChatUser;
  chatRoom?: {
    id: number;
    name: string;
  };
  replyToMessageId?: number;
  replyToMessage?: {
    id: number;
    content: string;
    sender: ChatUser;
  };
  fileUrl?: string | null;
  fileName?: string | null;
  fileSize?: number | null;
  createdAt: string;
  updatedAt?: string;
}

export interface LastMessage {
  id: number;
  content: string;
  sender: ChatUser;
  createdAt: string;
}

export interface OnlineUser {
  id: number;
  displayName: string;
  profilePictureUrl?: string;
  status: UserStatus;
  currentGame?: string;
  lastSeen: string;
}

export interface TypingIndicator {
  roomId: number;
  isTyping: boolean;
}

export interface ChatRoomsResponse {
  success: boolean;
  message: string;
  chatRooms: ChatRoom[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export interface ChatRoomResponse {
  success: boolean;
  message: string;
  chatRoom: ChatRoom;
}

export interface ChatMessagesResponse {
  success: boolean;
  message: string;
  messages: ChatMessage[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export interface ChatMessageResponse {
  success: boolean;
  message: string;
  chatMessage: ChatMessage;
}

export interface ChatMembersResponse {
  success: boolean;
  message: string;
  members: ChatMember[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export interface ChatMemberResponse {
  success: boolean;
  message: string;
  membership: ChatMember;
}

export interface OnlineUsersResponse {
  success: boolean;
  message: string;
  onlineUsers: OnlineUser[];
}

export interface TypingResponse {
  success: boolean;
  message: string;
  roomId: number;
  isTyping: boolean;
}

export interface ChatApiResponse {
  success: boolean;
  message: string;
}

// Enums
export type ChatRoomType = "GROUP" | "DIRECT_MESSAGE";

export type MessageType =
  | "TEXT"
  | "IMAGE"
  | "VIDEO"
  | "AUDIO"
  | "FILE"
  | "SYSTEM";

export type ChatMemberRole = "ADMIN" | "MODERATOR" | "MEMBER";

export type UserStatus =
  | "ONLINE"
  | "AWAY"
  | "BUSY"
  | "INVISIBLE"
  | "IN_GAME"
  | "OFFLINE";

// Create Room Form Data
export interface CreateChatRoomData {
  name: string;
  description?: string;
  type?: ChatRoomType;
  isPrivate?: boolean;
  maxMembers?: number;
  gameTitle?: string;
  tournamentId?: number;
  eventId?: number;
}

// Send Message Form Data
export interface SendMessageData {
  content: string;
  messageType?: MessageType;
  replyToMessageId?: number;
  file?: File;
}

// Add Member Form Data
export interface AddMemberData {
  role?: ChatMemberRole;
}

// Start Direct Message Data
export interface StartDirectMessageData {
  recipientId: number;
}

// Pagination and filtering
export interface ChatRoomsParams {
  page?: number;
  size?: number;
}

export interface ChatMessagesParams {
  page?: number;
  size?: number;
  beforeMessageId?: number;
  afterMessageId?: number;
}

export interface ChatMembersParams {
  page?: number;
  size?: number;
}
