import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { PostService } from "../../services/PostService";
import type { PostListItem } from "../../types";

interface PostCardProps {
  post: PostListItem;
  onLike?: (postId: number, isLiked: boolean) => void;
  onComment?: (postId: number) => void;
  onShare?: (postId: number) => void;
  onDelete?: (postId: number) => void;
  currentUserId?: number;
  className?: string;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  onLike,
  onComment,
  onShare,
  onDelete,
  currentUserId,
  className = "",
}) => {
  const { t } = useTranslation();
  const [isLiking, setIsLiking] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleLike = async () => {
    if (isLiking) return;

    setIsLiking(true);
    try {
      const response = await PostService.toggleLike(post.id);
      if (response.success) {
        onLike?.(post.id, response.liked);
      }
    } catch (error) {
      console.error("Failed to toggle like:", error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleShare = async () => {
    if (isSharing) return;

    setIsSharing(true);
    try {
      const response = await PostService.sharePost(post.id);
      if (response.success) {
        onShare?.(post.id);
      }
    } catch (error) {
      console.error("Failed to share post:", error);
    } finally {
      setIsSharing(false);
    }
  };

  const formatContent = (content: string) => {
    // Simple hashtag formatting
    return content.replace(
      /#([a-zA-Z0-9_]+)/g,
      '<span class="text-blue-500 hover:text-blue-600 cursor-pointer">#$1</span>'
    );
  };

  const isOwnPost = currentUserId === post.author.id;

  return (
    <article
      className={`post-card bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-4 hover:shadow-md transition-shadow ${className}`}
    >
      {/* Post Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <img
            src={post.author.profilePictureUrl || "/assets/default-avatar.png"}
            alt={post.author.displayName}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">
              {post.author.displayName}
            </h3>
            <p className="text-gray-500 text-xs">
              {PostService.getTimeAgo(post.createdAt)}
            </p>
          </div>
        </div>

        {/* Post Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
            aria-label={t("posts.menu")}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
              <div className="py-1">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `${window.location.origin}/posts/${post.id}`
                    );
                    setShowMenu(false);
                  }}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  {t("posts.copyLink")}
                </button>
                {isOwnPost && (
                  <button
                    onClick={() => {
                      onDelete?.(post.id);
                      setShowMenu(false);
                    }}
                    className="block px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                  >
                    {t("posts.delete")}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Post Content */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          {post.title}
        </h2>
        <div
          className="text-gray-700 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: formatContent(post.content) }}
        />

        {/* Game Category Badge */}
        {post.gameCategory && (
          <div className="mt-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {t(`gameCategories.${post.gameCategory.toLowerCase()}`)}
            </span>
          </div>
        )}
      </div>

      {/* Engagement Bar */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-6">
          {/* Like Button */}
          <button
            onClick={handleLike}
            disabled={isLiking}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
              post.isLiked
                ? "text-red-600 bg-red-50 hover:bg-red-100"
                : "text-gray-600 hover:text-red-600 hover:bg-red-50"
            } disabled:opacity-50`}
          >
            <svg
              className={`w-5 h-5 ${post.isLiked ? "fill-current" : ""}`}
              fill={post.isLiked ? "currentColor" : "none"}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <span className="text-sm font-medium">
              {PostService.formatEngagementCount(post.likeCount)}
            </span>
          </button>

          {/* Comment Button */}
          <button
            onClick={() => onComment?.(post.id)}
            className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <span className="text-sm font-medium">
              {PostService.formatEngagementCount(post.commentCount)}
            </span>
          </button>

          {/* Share Button */}
          <button
            onClick={handleShare}
            disabled={isSharing}
            className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-600 hover:text-green-600 hover:bg-green-50 transition-colors disabled:opacity-50"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
              />
            </svg>
            <span className="text-sm font-medium">{t("posts.share")}</span>
          </button>
        </div>
      </div>
    </article>
  );
};
