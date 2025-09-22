import { apiFetch } from "../lib/api";
import {
  SUPPORTED_VIDEO_TYPES,
  SUPPORTED_IMAGE_TYPES,
  MAX_VIDEO_SIZE,
  MAX_IMAGE_SIZE,
} from "../types/media";
import type {
  MediaUploadRequest,
  MediaUpdateRequest,
  MediaFilters,
  MediaSearchFilters,
  TrendingMediaFilters,
  MediaListResponse,
  MediaResponse,
  MediaUploadResponse,
  MediaViewResponse,
  MediaDeleteResponse,
} from "../types";

export class MediaService {
  /**
   * Upload a new media file
   */
  static async uploadMedia(
    request: MediaUploadRequest
  ): Promise<MediaUploadResponse> {
    const formData = new FormData();
    formData.append("file", request.file);
    formData.append("title", request.title);

    if (request.description) {
      formData.append("description", request.description);
    }

    if (request.tags && request.tags.length > 0) {
      formData.append("tags", JSON.stringify(request.tags));
    }

    if (request.gameCategory) {
      formData.append("gameCategory", request.gameCategory);
    }

    if (request.visibility) {
      formData.append("visibility", request.visibility);
    }

    return await apiFetch<MediaUploadResponse>("/media/upload", {
      method: "POST",
      body: formData,
    });
  }

  /**
   * Get media details by ID
   */
  static async getMedia(mediaId: number): Promise<MediaResponse> {
    return await apiFetch<MediaResponse>(`/media/${mediaId}`);
  }

  /**
   * Get list of media with optional filters
   */
  static async getMediaList(
    filters: MediaFilters = {}
  ): Promise<MediaListResponse> {
    const params = new URLSearchParams();

    if (filters.page !== undefined) {
      params.append("page", filters.page.toString());
    }

    if (filters.size !== undefined) {
      params.append("size", filters.size.toString());
    }

    if (filters.category) {
      params.append("category", filters.category);
    }

    if (filters.type) {
      params.append("type", filters.type);
    }

    if (filters.visibility) {
      params.append("visibility", filters.visibility);
    }

    if (filters.myMedia !== undefined) {
      params.append("myMedia", filters.myMedia.toString());
    }

    return await apiFetch<MediaListResponse>(`/media?${params.toString()}`);
  }

  /**
   * Update media details
   */
  static async updateMedia(
    mediaId: number,
    request: MediaUpdateRequest
  ): Promise<MediaResponse> {
    const formData = new FormData();

    if (request.title) {
      formData.append("title", request.title);
    }

    if (request.description) {
      formData.append("description", request.description);
    }

    if (request.tags && request.tags.length > 0) {
      formData.append("tags", JSON.stringify(request.tags));
    }

    if (request.gameCategory) {
      formData.append("gameCategory", request.gameCategory);
    }

    if (request.visibility) {
      formData.append("visibility", request.visibility);
    }

    return await apiFetch<MediaResponse>(`/media/${mediaId}`, {
      method: "PUT",
      body: formData,
    });
  }

  /**
   * Delete media
   */
  static async deleteMedia(mediaId: number): Promise<MediaDeleteResponse> {
    return await apiFetch<MediaDeleteResponse>(`/media/${mediaId}`, {
      method: "DELETE",
    });
  }

  /**
   * Increment media view count
   */
  static async incrementViewCount(mediaId: number): Promise<MediaViewResponse> {
    return await apiFetch<MediaViewResponse>(`/media/${mediaId}/view`, {
      method: "POST",
    });
  }

  /**
   * Search media
   */
  static async searchMedia(
    filters: MediaSearchFilters
  ): Promise<MediaListResponse> {
    const params = new URLSearchParams();
    params.append("query", filters.query);

    if (filters.page !== undefined) {
      params.append("page", filters.page.toString());
    }

    if (filters.size !== undefined) {
      params.append("size", filters.size.toString());
    }

    if (filters.type) {
      params.append("type", filters.type);
    }

    return await apiFetch<MediaListResponse>(
      `/media/search?${params.toString()}`
    );
  }

  /**
   * Get trending media
   */
  static async getTrendingMedia(
    filters: TrendingMediaFilters = {}
  ): Promise<MediaListResponse> {
    const params = new URLSearchParams();

    if (filters.limit !== undefined) {
      params.append("limit", filters.limit.toString());
    }

    if (filters.days !== undefined) {
      params.append("days", filters.days.toString());
    }

    return await apiFetch<MediaListResponse>(
      `/media/trending?${params.toString()}`
    );
  }

  /**
   * Validate file before upload
   */
  static validateFile(file: File): { isValid: boolean; error?: string } {
    // Check file type
    const isVideo = SUPPORTED_VIDEO_TYPES.includes(file.type);
    const isImage = SUPPORTED_IMAGE_TYPES.includes(file.type);

    if (!isVideo && !isImage) {
      return {
        isValid: false,
        error:
          "Unsupported file type. Please upload MP4, AVI, MOV, JPG, PNG, or GIF files.",
      };
    }

    // Check file size
    if (isVideo && file.size > MAX_VIDEO_SIZE) {
      return {
        isValid: false,
        error: "Video file size exceeds 100MB limit.",
      };
    }

    if (isImage && file.size > MAX_IMAGE_SIZE) {
      return {
        isValid: false,
        error: "Image file size exceeds 10MB limit.",
      };
    }

    return { isValid: true };
  }

  /**
   * Format file size for display
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  /**
   * Format duration for display (seconds to MM:SS)
   */
  static formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  }
}
