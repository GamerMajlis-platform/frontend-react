import type { GameCategory } from "./events";

export interface PostAuthor {
  id: number;
  displayName: string;
  profilePictureUrl?: string;
}

export interface AttachedMedia {
  id: number;
  title: string;
  thumbnailPath?: string;
}

export interface Post {
  id: number;
  title: string;
  content: string;
  type: "TEXT" | "MEDIA" | "POLL";
  gameTitle?: string;
  gameCategory?: GameCategory;
  platform?: string;
  tags: string[];
  hashtags: string[];
  visibility: "PUBLIC" | "PRIVATE";
  viewCount: number;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  attachedMedia: AttachedMedia[];
  author: PostAuthor;
  createdAt: string;
  updatedAt?: string;
  isLiked?: boolean; // User-specific field
}

export interface PostCreateRequest {
  title: string;
  content: string;
  type?: "TEXT" | "MEDIA" | "POLL";
  gameTitle?: string;
  gameCategory?: GameCategory;
  platform?: string;
  tags?: string[];
  hashtags?: string[];
  mediaIds?: number[];
  visibility?: "PUBLIC" | "PRIVATE";
}

export interface PostUpdateRequest {
  title?: string;
  content?: string;
  gameTitle?: string;
  gameCategory?: GameCategory;
  platform?: string;
  tags?: string[];
  hashtags?: string[];
  visibility?: "PUBLIC" | "PRIVATE";
}

export interface PostListItem {
  id: number;
  title: string;
  content: string;
  gameCategory?: GameCategory;
  likeCount: number;
  commentCount: number;
  author: {
    id: number;
    displayName: string;
    profilePictureUrl?: string;
  };
  createdAt: string;
  isLiked?: boolean;
}

export interface Comment {
  id: number;
  content: string;
  author: PostAuthor;
  createdAt: string;
  updatedAt?: string;
  parentId?: number | null;
  // Optional list of replies (simple flat array for now)
  replies?: Comment[];
}

export interface CommentCreateRequest {
  content: string;
  parentId?: number | null;
}

export interface PostFilters {
  page?: number;
  size?: number;
  gameCategory?: GameCategory;
  type?: "TEXT" | "MEDIA" | "POLL";
  myPosts?: boolean;
}

export interface PostSearchFilters {
  query: string;
  page?: number;
  size?: number;
  gameCategory?: GameCategory;
}

export interface TrendingPostFilters {
  limit?: number;
  days?: number;
}

export interface CommentFilters {
  page?: number;
  size?: number;
}

export interface PostListResponse {
  success: boolean;
  message: string;
  posts: PostListItem[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export interface PostResponse {
  success: boolean;
  message: string;
  post: Post;
}

export interface PostCreateResponse {
  success: boolean;
  message: string;
  post: Post;
}

export interface PostLikeResponse {
  success: boolean;
  message: string;
  liked: boolean;
  newLikeCount: number;
}

export interface PostShareResponse {
  success: boolean;
  message: string;
  newShareCount: number;
}

export interface CommentListResponse {
  success: boolean;
  message: string;
  comments: Comment[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export interface CommentResponse {
  success: boolean;
  message: string;
  comment: Comment;
}

export interface PostDeleteResponse {
  success: boolean;
  message: string;
}

export interface CommentDeleteResponse {
  success: boolean;
  message: string;
}

// Gaming platforms
export const GAMING_PLATFORMS = [
  "PC",
  "PlayStation",
  "Xbox",
  "Nintendo Switch",
  "Mobile",
  "Steam",
  "Epic Games",
  "Origin",
  "Battle.net",
  "Other",
] as const;

export type GamingPlatform = (typeof GAMING_PLATFORMS)[number];

// Post types
export const POST_TYPES = ["TEXT", "MEDIA", "POLL"] as const;
export type PostType = (typeof POST_TYPES)[number];
