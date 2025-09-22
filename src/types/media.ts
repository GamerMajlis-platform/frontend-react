export interface MediaUploader {
  id: number;
  displayName: string;
  profilePictureUrl?: string;
}

export interface Media {
  id: number;
  title: string;
  description?: string;
  originalFilename: string;
  storedFilename: string;
  filePath: string;
  mediaType: "VIDEO" | "IMAGE";
  fileSize: number;
  compressedSize?: number;
  compressionRatio?: number;
  thumbnailPath?: string;
  duration?: number; // for videos
  resolution?: string;
  tags: string[];
  gameCategory?: string;
  visibility: "PUBLIC" | "PRIVATE";
  viewCount: number;
  downloadCount: number;
  uploader?: MediaUploader;
  createdAt: string;
  updatedAt?: string;
}

export interface MediaUploadRequest {
  file: File;
  title: string;
  description?: string;
  tags?: string[];
  gameCategory?: string;
  visibility?: "PUBLIC" | "PRIVATE";
}

export interface MediaUpdateRequest {
  title?: string;
  description?: string;
  tags?: string[];
  gameCategory?: string;
  visibility?: "PUBLIC" | "PRIVATE";
}

export interface MediaListItem {
  id: number;
  title: string;
  thumbnailPath?: string;
  mediaType: "VIDEO" | "IMAGE";
  duration?: number;
  gameCategory?: string;
  viewCount: number;
  uploader: {
    id: number;
    displayName: string;
  };
  createdAt: string;
}

export interface MediaFilters {
  page?: number;
  size?: number;
  category?: string;
  type?: "VIDEO" | "IMAGE";
  visibility?: "PUBLIC" | "PRIVATE";
  myMedia?: boolean;
}

export interface MediaSearchFilters {
  query: string;
  page?: number;
  size?: number;
  type?: "VIDEO" | "IMAGE";
}

export interface TrendingMediaFilters {
  limit?: number;
  days?: number;
}

export interface MediaListResponse {
  success: boolean;
  message: string;
  media: MediaListItem[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export interface MediaResponse {
  success: boolean;
  message: string;
  media: Media;
}

export interface MediaUploadResponse {
  success: boolean;
  message: string;
  media: Media;
}

export interface MediaViewResponse {
  success: boolean;
  message: string;
  newViewCount: number;
}

export interface MediaDeleteResponse {
  success: boolean;
  message: string;
}

// Supported file types
export const SUPPORTED_VIDEO_TYPES = [
  "video/mp4",
  "video/avi",
  "video/mov",
  "video/quicktime",
];
export const SUPPORTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
];
export const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

// Game categories - defined in events.ts to avoid duplication
export const SUPPORTED_MEDIA_CATEGORIES = [
  "FPS",
  "MOBA",
  "RPG",
  "STRATEGY",
  "SPORTS",
  "RACING",
  "FIGHTING",
  "OTHER",
] as const;
