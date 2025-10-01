import { BaseService } from "../lib/baseService";
import type {
  PostCreateRequest,
  PostUpdateRequest,
  PostFilters,
  PostSearchFilters,
  TrendingPostFilters,
  CommentFilters,
  CommentCreateRequest,
  PostListResponse,
  PostResponse,
  PostCreateResponse,
  PostLikeResponse,
  PostShareResponse,
  CommentListResponse,
  CommentResponse,
  PostDeleteResponse,
  CommentDeleteResponse,
} from "../types";

export class PostService extends BaseService {
  /**
   * Create a new post
   */
  static async createPost(
    request: PostCreateRequest
  ): Promise<PostCreateResponse> {
    const formData = new FormData();
    formData.append("title", request.title);
    formData.append("content", request.content);

    if (request.type) {
      formData.append("type", request.type);
    }

    if (request.gameTitle) {
      formData.append("gameTitle", request.gameTitle);
    }

    if (request.gameCategory) {
      formData.append("gameCategory", request.gameCategory);
    }

    if (request.platform) {
      formData.append("platform", request.platform);
    }

    if (request.tags && request.tags.length > 0) {
      formData.append("tags", JSON.stringify(request.tags));
    }

    if (request.hashtags && request.hashtags.length > 0) {
      formData.append("hashtags", JSON.stringify(request.hashtags));
    }

    if (request.mediaIds && request.mediaIds.length > 0) {
      formData.append("mediaIds", JSON.stringify(request.mediaIds));
    }

    if (request.visibility) {
      formData.append("visibility", request.visibility);
    }

    const response = await this.authenticatedRequest<PostCreateResponse>(
      "/posts",
      {
        method: "POST",
        body: formData,
        useFormData: true,
      }
    );
    if (
      response &&
      typeof response === "object" &&
      (response as PostCreateResponse).post
    ) {
      const r = response as PostCreateResponse;
      r.post = this.normalizePost(r.post);
    }
    return response;
  }

  /**
   * Get post details by ID
   */
  static async getPost(postId: number): Promise<PostResponse> {
    return await this.requestWithRetry<PostResponse>(`/posts/${postId}`);
  }

  /**
   * Get posts feed with optional filters
   */
  static async getPostsFeed(
    filters: PostFilters = {}
  ): Promise<PostListResponse> {
    const params = new URLSearchParams();

    if (filters.page !== undefined) {
      params.append("page", filters.page.toString());
    }

    if (filters.size !== undefined) {
      params.append("size", filters.size.toString());
    }

    if (filters.gameCategory) {
      params.append("gameCategory", filters.gameCategory);
    }

    if (filters.type) {
      params.append("type", filters.type);
    }

    if (filters.myPosts !== undefined) {
      params.append("myPosts", filters.myPosts.toString());
    }

    return await this.requestWithRetry<PostListResponse>(
      `/posts?${params.toString()}`
    );
  }

  /**
   * Update post
   */
  static async updatePost(
    postId: number,
    request: PostUpdateRequest
  ): Promise<PostResponse> {
    const formData = new FormData();

    if (request.title) {
      formData.append("title", request.title);
    }

    if (request.content) {
      formData.append("content", request.content);
    }

    if (request.gameTitle) {
      formData.append("gameTitle", request.gameTitle);
    }

    if (request.gameCategory) {
      formData.append("gameCategory", request.gameCategory);
    }

    if (request.platform) {
      formData.append("platform", request.platform);
    }

    if (request.tags && request.tags.length > 0) {
      formData.append("tags", JSON.stringify(request.tags));
    }

    if (request.hashtags && request.hashtags.length > 0) {
      formData.append("hashtags", JSON.stringify(request.hashtags));
    }

    if (request.visibility) {
      formData.append("visibility", request.visibility);
    }

    const response = await this.authenticatedRequest<PostResponse>(
      `/posts/${postId}`,
      {
        method: "PUT",
        body: formData,
        useFormData: true,
      }
    );
    if (
      response &&
      typeof response === "object" &&
      (response as PostResponse).post
    ) {
      const r = response as PostResponse;
      r.post = this.normalizePost(r.post);
    }
    return response;
  }

  /**
   * Delete post
   */
  static async deletePost(postId: number): Promise<PostDeleteResponse> {
    return await this.authenticatedRequest<PostDeleteResponse>(
      `/posts/${postId}`,
      {
        method: "DELETE",
      }
    );
  }

  /**
   * Like or unlike a post
   */
  static async toggleLike(postId: number): Promise<PostLikeResponse> {
    return await this.authenticatedRequest<PostLikeResponse>(
      `/posts/${postId}/like`,
      {
        method: "POST",
      }
    );
  }

  /**
   * Share a post
   */
  static async sharePost(postId: number): Promise<PostShareResponse> {
    return await this.authenticatedRequest<PostShareResponse>(
      `/posts/${postId}/share`,
      {
        method: "POST",
      }
    );
  }

  /**
   * Add comment to post
   */
  static async addComment(
    postId: number,
    request: CommentCreateRequest
  ): Promise<CommentResponse> {
    const formData = new FormData();
    formData.append("content", request.content);

    return await this.authenticatedRequest<CommentResponse>(
      `/posts/${postId}/comments`,
      {
        method: "POST",
        body: formData,
        useFormData: true,
      }
    );
  }

  /**
   * Normalize backend stringified JSON arrays for tags/hashtags into string[]
   */
  static normalizeArrayField(field: unknown): string[] {
    if (Array.isArray(field)) return field as string[];
    if (typeof field === "string") {
      try {
        const parsed = JSON.parse(field);
        return Array.isArray(parsed) ? (parsed as string[]) : [];
      } catch {
        // Fallback: attempt to split comma separated string
        if (field.includes("[")) return [];
        return field
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      }
    }
    return [];
  }

  /**
   * Utility to normalize a Post object structure (mutates a shallow clone)
   */
  static normalizePost<T extends { tags?: unknown; hashtags?: unknown }>(
    post: T
  ): T & { tags: string[]; hashtags: string[] } {
    return {
      ...(post as T),
      tags: this.normalizeArrayField(post.tags),
      hashtags: this.normalizeArrayField(post.hashtags),
    };
  }

  /**
   * Get post comments
   */
  static async getComments(
    postId: number,
    filters: CommentFilters = {}
  ): Promise<CommentListResponse> {
    const params = new URLSearchParams();

    if (filters.page !== undefined) {
      params.append("page", filters.page.toString());
    }

    if (filters.size !== undefined) {
      params.append("size", filters.size.toString());
    }

    return await this.requestWithRetry<CommentListResponse>(
      `/posts/${postId}/comments?${params.toString()}`
    );
  }

  /**
   * Delete comment
   */
  static async deleteComment(
    commentId: number
  ): Promise<CommentDeleteResponse> {
    return await this.authenticatedRequest<CommentDeleteResponse>(
      `/posts/comments/${commentId}`,
      {
        method: "DELETE",
      }
    );
  }

  /**
   * Update comment
   */
  static async updateComment(
    commentId: number,
    content: string
  ): Promise<CommentResponse> {
    const formData = new FormData();
    formData.append("content", content);

    return await this.authenticatedRequest<CommentResponse>(
      `/posts/comments/${commentId}`,
      {
        method: "PUT",
        body: formData,
        useFormData: true,
      }
    );
  }

  /**
   * Search posts
   */
  static async searchPosts(
    filters: PostSearchFilters
  ): Promise<PostListResponse> {
    const params = new URLSearchParams();
    params.append("query", filters.query);

    if (filters.page !== undefined) {
      params.append("page", filters.page.toString());
    }

    if (filters.size !== undefined) {
      params.append("size", filters.size.toString());
    }

    if (filters.gameCategory) {
      params.append("gameCategory", filters.gameCategory);
    }

    return await this.requestWithRetry<PostListResponse>(
      `/posts/search?${params.toString()}`
    );
  }

  /**
   * Get trending posts
   */
  static async getTrendingPosts(
    filters: TrendingPostFilters = {}
  ): Promise<PostListResponse> {
    const params = new URLSearchParams();

    if (filters.limit !== undefined) {
      params.append("limit", filters.limit.toString());
    }

    if (filters.days !== undefined) {
      params.append("days", filters.days.toString());
    }

    return await this.requestWithRetry<PostListResponse>(
      `/posts/trending?${params.toString()}`
    );
  }

  /**
   * Format hashtags for display (ensure they start with #)
   */
  static formatHashtags(hashtags: string[]): string[] {
    return hashtags.map((tag) => (tag.startsWith("#") ? tag : `#${tag}`));
  }

  /**
   * Extract hashtags from text content
   */
  static extractHashtags(text: string): string[] {
    const hashtagRegex = /#[a-zA-Z0-9_]+/g;
    const matches = text.match(hashtagRegex);
    return matches ? matches.map((tag) => tag.substring(1)) : [];
  }

  /**
   * Format post content with clickable hashtags
   */
  static formatPostContent(content: string): string {
    return content.replace(
      /#([a-zA-Z0-9_]+)/g,
      '<span class="hashtag">#$1</span>'
    );
  }

  /**
   * Get time ago string for posts
   */
  static getTimeAgo(dateString: string): string {
    const now = new Date();
    const postDate = new Date(dateString);
    const diffInSeconds = Math.floor(
      (now.getTime() - postDate.getTime()) / 1000
    );

    if (diffInSeconds < 60) {
      return "just now";
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays}d ago`;
    }

    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) {
      return `${diffInWeeks}w ago`;
    }

    return postDate.toLocaleDateString();
  }

  /**
   * Format engagement numbers (likes, comments, shares)
   */
  static formatEngagementCount(count: number): string {
    if (count < 1000) {
      return count.toString();
    }

    if (count < 1000000) {
      const kCount = Math.floor(count / 100) / 10;
      return kCount % 1 === 0 ? `${Math.floor(kCount)}k` : `${kCount}k`;
    }

    const mCount = Math.floor(count / 100000) / 10;
    return mCount % 1 === 0 ? `${Math.floor(mCount)}M` : `${mCount}M`;
  }
}
