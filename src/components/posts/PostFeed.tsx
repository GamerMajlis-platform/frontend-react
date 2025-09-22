import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { PostService } from "../../services/PostService";
import { PostCard } from "./PostCard";
import type { PostListItem, PostFilters } from "../../types";

interface PostFeedProps {
  filters?: PostFilters;
  currentUserId?: number;
  onPostClick?: (postId: number) => void;
  className?: string;
}

export const PostFeed: React.FC<PostFeedProps> = ({
  filters = {},
  currentUserId,
  onPostClick,
  className = "",
}) => {
  const { t } = useTranslation();

  const [posts, setPosts] = useState<PostListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
    hasMore: false,
  });

  const loadPosts = useCallback(
    async (page = 0, append = false) => {
      try {
        setLoading(true);
        setError(null);

        const response = await PostService.getPostsFeed({
          ...filters,
          page,
          size: 10,
        });

        if (response.success) {
          const newPosts = append
            ? [...posts, ...response.posts]
            : response.posts;
          setPosts(newPosts);
          setPagination({
            currentPage: response.currentPage,
            totalPages: response.totalPages,
            totalElements: response.totalElements,
            hasMore: response.currentPage < response.totalPages - 1,
          });
        } else {
          setError(response.message || t("posts.feed.loadError"));
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : t("posts.feed.loadError")
        );
      } finally {
        setLoading(false);
      }
    },
    [filters, posts, t]
  );

  const loadMore = () => {
    if (pagination.hasMore && !loading) {
      loadPosts(pagination.currentPage + 1, true);
    }
  };

  const handleLike = (postId: number, isLiked: boolean) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId
          ? {
              ...post,
              isLiked,
              likeCount: isLiked ? post.likeCount + 1 : post.likeCount - 1,
            }
          : post
      )
    );
  };

  const handleComment = (postId: number) => {
    onPostClick?.(postId);
  };

  const handleShare = (postId: number) => {
    // Share functionality - could track shares in future
    console.log("Post shared:", postId);
  };

  const handleDelete = async (postId: number) => {
    if (!window.confirm(t("posts.feed.confirmDelete"))) {
      return;
    }

    try {
      const response = await PostService.deletePost(postId);
      if (response.success) {
        setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
      }
    } catch (error) {
      console.error("Failed to delete post:", error);
    }
  };

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  if (loading && posts.length === 0) {
    return (
      <div className={`post-feed ${className}`}>
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse"
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-24"></div>
                  <div className="h-3 bg-gray-300 rounded w-16"></div>
                </div>
              </div>
              <div className="space-y-2 mb-4">
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-3 bg-gray-300 rounded w-full"></div>
                <div className="h-3 bg-gray-300 rounded w-5/6"></div>
              </div>
              <div className="flex space-x-4">
                <div className="h-8 bg-gray-300 rounded w-16"></div>
                <div className="h-8 bg-gray-300 rounded w-16"></div>
                <div className="h-8 bg-gray-300 rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`post-feed ${className}`}>
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">
            <svg
              className="w-12 h-12 mx-auto mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-sm">{error}</p>
          </div>
          <button
            onClick={() => loadPosts()}
            className="bg-[#6fffe9] text-black px-6 py-3 rounded-lg hover:bg-[#5ee6d3] transition-colors font-medium"
          >
            {t("common.retry")}
          </button>
        </div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className={`post-feed ${className}`}>
        <div className="text-center py-12">
          <svg
            className="w-16 h-16 mx-auto mb-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {t("posts.feed.noPosts")}
          </h3>
          <p className="text-gray-600 max-w-md mx-auto">
            {t("posts.feed.noPostsDescription")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`post-feed ${className}`}>
      <div className="space-y-4">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            currentUserId={currentUserId}
            onLike={handleLike}
            onComment={handleComment}
            onShare={handleShare}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {pagination.hasMore && (
        <div className="flex justify-center mt-8">
          <button
            onClick={loadMore}
            disabled={loading}
            className="bg-[#6fffe9] text-black px-8 py-3 rounded-lg hover:bg-[#5ee6d3] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? t("common.loading") : t("posts.feed.loadMore")}
          </button>
        </div>
      )}

      {posts.length > 0 && (
        <div className="text-center mt-6 text-sm text-gray-500">
          {t("posts.feed.showing", {
            count: posts.length,
            total: pagination.totalElements,
          })}
        </div>
      )}
    </div>
  );
};
