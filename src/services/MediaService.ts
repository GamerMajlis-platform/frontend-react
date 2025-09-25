import { BaseService } from "../lib/baseService";
import { API_ENDPOINTS } from "../config/constants";
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

export class MediaService extends BaseService {
  // Store uploaded file hashes for duplicate detection
  private static uploadedHashes = new Set<string>();

  /**
   * Upload a new media file
   */
  static async uploadMedia(
    request: MediaUploadRequest,
    onProgress?: (progress: number) => void
  ): Promise<MediaUploadResponse> {
    // Validate file before upload
    const validation = this.validateFile(request.file);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    // F4: Duplicate media detection
    const duplicateCheck = await this.detectDuplicate(request.file);
    if (duplicateCheck.isDuplicate) {
      throw new Error("This file has already been uploaded");
    }

    // Check for malicious file patterns
    const maliciousCheck = await this.detectMaliciousFile(request.file);
    if (!maliciousCheck.isSafe) {
      throw new Error(maliciousCheck.reason || "File failed security check");
    }

    // F6: Content toxicity screening (placeholder for actual implementation)
    const toxicityCheck = await this.scanForToxicity(request.file);
    if (!toxicityCheck.isClean) {
      throw new Error("Content failed toxicity screening");
    }

    // F7: NSFW content detection (placeholder for actual implementation)
    const nsfwCheck = await this.detectNSFW(request.file);
    if (nsfwCheck.isNSFW) {
      throw new Error("NSFW content detected and restricted");
    }

    // T19/Image compression for images
    let fileToUpload = request.file;
    if (request.file.type.startsWith("image/")) {
      fileToUpload = await this.compressImage(request.file);
    }

    const formData = new FormData();
    formData.append("file", fileToUpload);
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

    // Enhanced upload with progress tracking
    const xhr = new XMLHttpRequest();

    return new Promise<MediaUploadResponse>((resolve, reject) => {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = Math.round((event.loaded / event.total) * 100);
          onProgress(progress);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch {
            reject(new Error("Invalid response format"));
          }
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      };

      xhr.onerror = () => reject(new Error("Upload failed"));

      xhr.open("POST", API_ENDPOINTS.media.upload);
      xhr.send(formData);
    });
  }

  /**
   * Get media details by ID
   */
  static async getMedia(mediaId: number): Promise<MediaResponse> {
    return await this.requestWithRetry<MediaResponse>(
      `${API_ENDPOINTS.media.byId}/${mediaId}`
    );
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

    return await this.requestWithRetry<MediaListResponse>(
      `${API_ENDPOINTS.media.list}?${params.toString()}`
    );
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

    return await this.authenticatedRequest<MediaResponse>(
      `${API_ENDPOINTS.media.update}/${mediaId}`,
      {
        method: "PUT",
        body: formData,
        useFormData: true,
      }
    );
  }

  /**
   * Delete media
   */
  static async deleteMedia(mediaId: number): Promise<MediaDeleteResponse> {
    return await this.authenticatedRequest<MediaDeleteResponse>(
      `${API_ENDPOINTS.media.delete}/${mediaId}`,
      {
        method: "DELETE",
      }
    );
  }

  /**
   * Increment media view count
   */
  static async incrementViewCount(mediaId: number): Promise<MediaViewResponse> {
    return await this.requestWithRetry<MediaViewResponse>(
      `${API_ENDPOINTS.media.view}/${mediaId}/view`,
      {
        method: "POST",
      }
    );
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

    return await this.requestWithRetry<MediaListResponse>(
      `${API_ENDPOINTS.media.search}?${params.toString()}`
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

    return await this.requestWithRetry<MediaListResponse>(
      `${API_ENDPOINTS.media.trending}?${params.toString()}`
    );
  }

  /**
   * Validate file before upload (T5-T9 requirements)
   */
  static validateFile(file: File): { isValid: boolean; error?: string } {
    // T5: Supported formats validation
    const supportedFormats = [
      ...SUPPORTED_VIDEO_TYPES, // MP4, AVI, MOV
      ...SUPPORTED_IMAGE_TYPES, // JPG, PNG, GIF
    ];

    if (!supportedFormats.includes(file.type)) {
      return {
        isValid: false,
        error:
          "Unsupported file format. Supported formats: MP4, AVI, MOV, JPG, PNG, GIF",
      };
    }

    // T6: File size validation
    const isVideo = SUPPORTED_VIDEO_TYPES.includes(file.type);
    const isImage = SUPPORTED_IMAGE_TYPES.includes(file.type);

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
   * T9: Detect malicious files
   */
  static async detectMaliciousFile(
    file: File
  ): Promise<{ isSafe: boolean; reason?: string }> {
    try {
      // Check file signature/magic numbers
      const buffer = await file.slice(0, 32).arrayBuffer();
      const bytes = new Uint8Array(buffer);

      // Validate file signatures
      const signatures = {
        mp4: [0x00, 0x00, 0x00, null, 0x66, 0x74, 0x79, 0x70], // MP4
        png: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], // PNG
        jpg: [0xff, 0xd8, 0xff], // JPEG
        gif: [0x47, 0x49, 0x46, 0x38], // GIF
      };

      let validSignature = false;
      for (const signature of Object.values(signatures)) {
        const matches = signature.every(
          (byte, index) => byte === null || bytes[index] === byte
        );
        if (matches) {
          validSignature = true;
          break;
        }
      }

      if (!validSignature && file.type.startsWith("video/")) {
        // For video files, check for common video signatures
        const videoSignatures = [
          [0x00, 0x00, 0x00], // Generic video container
          [0x1a, 0x45, 0xdf], // Matroska/WebM
          [0x52, 0x49, 0x46], // AVI (RIFF)
        ];

        validSignature = videoSignatures.some((signature) =>
          signature.every((byte, index) => bytes[index] === byte)
        );
      }

      if (!validSignature) {
        return {
          isSafe: false,
          reason: "File signature doesn't match its extension",
        };
      }

      // Check for suspicious file names
      const suspiciousPatterns = [
        /\.(exe|bat|cmd|scr|pif|com|vbs|js|jar)$/i,
        /script/i,
        /<script/i,
        /javascript:/i,
      ];

      if (suspiciousPatterns.some((pattern) => pattern.test(file.name))) {
        return {
          isSafe: false,
          reason: "Suspicious file name or content detected",
        };
      }

      return { isSafe: true };
    } catch {
      return {
        isSafe: false,
        reason: "Failed to verify file safety",
      };
    }
  }

  /**
   * T12: Validate profile picture aspect ratio
   */
  static async validateProfilePicture(
    file: File
  ): Promise<{ isValid: boolean; error?: string }> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const aspectRatio = img.width / img.height;
        const tolerance = 0.1; // 10% tolerance for square aspect ratio

        if (Math.abs(aspectRatio - 1) > tolerance) {
          resolve({
            isValid: false,
            error: "Profile picture must have a square aspect ratio (1:1)",
          });
        } else {
          resolve({ isValid: true });
        }
      };

      img.onerror = () => {
        resolve({
          isValid: false,
          error: "Invalid image file",
        });
      };

      img.src = URL.createObjectURL(file);
    });
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

  /**
   * F4: Detect duplicate media files using SHA-256 hash
   */
  static async detectDuplicate(
    file: File
  ): Promise<{ isDuplicate: boolean; hash?: string }> {
    try {
      const buffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hash = hashArray
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      const isDuplicate = this.uploadedHashes.has(hash);
      if (!isDuplicate) {
        this.uploadedHashes.add(hash);
      }

      return { isDuplicate, hash };
    } catch {
      return { isDuplicate: false };
    }
  }

  /**
   * T19: Compress images before upload
   */
  static async compressImage(file: File, quality = 0.8): Promise<File> {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions (max 1920x1080)
        const maxWidth = 1920;
        const maxHeight = 1080;
        let { width, height } = img;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }

        canvas.width = width;
        canvas.height = height;

        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              resolve(file); // Return original if compression fails
            }
          },
          file.type,
          quality
        );
      };

      img.onerror = () => resolve(file); // Return original if processing fails
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * F6: Content toxicity screening (placeholder implementation)
   * In a real implementation, this would call a content moderation API
   */
  static async scanForToxicity(
    file: File
  ): Promise<{ isClean: boolean; reason?: string }> {
    try {
      // Placeholder implementation - check filename for obvious toxic content
      const suspiciousTerms = [
        "hate",
        "violence",
        "explicit",
        "toxic",
        "harmful",
      ];

      const fileName = file.name.toLowerCase();
      const containsSuspiciousTerms = suspiciousTerms.some((term) =>
        fileName.includes(term)
      );

      if (containsSuspiciousTerms) {
        return {
          isClean: false,
          reason: "Content may contain inappropriate material",
        };
      }

      // In production, integrate with services like:
      // - Google Cloud Vision API
      // - AWS Rekognition
      // - Azure Content Moderator
      // - OpenAI Moderation API

      return { isClean: true };
    } catch {
      return { isClean: true }; // Default to allow if checking fails
    }
  }

  /**
   * F7: NSFW content detection (placeholder implementation)
   * In a real implementation, this would use AI/ML services
   */
  static async detectNSFW(
    file: File
  ): Promise<{ isNSFW: boolean; confidence?: number }> {
    try {
      // Placeholder implementation - basic filename checking
      const nsfwTerms = ["adult", "nsfw", "explicit", "mature", "sexual"];

      const fileName = file.name.toLowerCase();
      const isNSFW = nsfwTerms.some((term) => fileName.includes(term));

      // In production, integrate with services like:
      // - Google Cloud Vision API (Safe Search)
      // - AWS Rekognition (Unsafe Content Detection)
      // - Microsoft Azure Content Moderator
      // - Sightengine API

      return { isNSFW, confidence: isNSFW ? 0.9 : 0.1 };
    } catch {
      return { isNSFW: false }; // Default to safe if detection fails
    }
  }

  /**
   * F5: Generate thumbnail for video files (placeholder implementation)
   */
  static async generateVideoThumbnail(
    file: File
  ): Promise<{ thumbnail?: Blob; error?: string }> {
    try {
      return new Promise((resolve) => {
        const video = document.createElement("video");
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        video.onloadedmetadata = () => {
          // Seek to 25% of video duration for thumbnail
          video.currentTime = video.duration * 0.25;
        };

        video.onseeked = () => {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;

          ctx?.drawImage(video, 0, 0);

          canvas.toBlob(
            (blob) => {
              resolve(
                blob
                  ? { thumbnail: blob }
                  : { error: "Failed to generate thumbnail" }
              );
            },
            "image/jpeg",
            0.8
          );
        };

        video.onerror = () => {
          resolve({ error: "Failed to load video" });
        };

        video.src = URL.createObjectURL(file);
      });
    } catch {
      return { error: "Thumbnail generation not supported" };
    }
  }
}
