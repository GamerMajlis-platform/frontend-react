import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { PostService } from "../../services/PostService";
import { Comments } from "./Comments";
import type { PostListItem } from "../../types";
import { Link } from "react-router-dom";
import {
  markUploadPathFailed,
  getAvatarSrc,
  DEFAULT_BLANK_AVATAR,
} from "../../lib/urls";

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
  const [showComments, setShowComments] = useState(false);
  const [localCommentCount, setLocalCommentCount] = useState(post.commentCount);
  const [localPost, setLocalPost] = useState(post);
  const [showEdit, setShowEdit] = useState(false);
  const [editTitle, setEditTitle] = useState(post.title || "");
  const [editContent, setEditContent] = useState(post.content || "");

  useEffect(() => {
    setLocalPost(post);
    setEditTitle(post.title || "");
    setEditContent(post.content || "");
  }, [post]);

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
    // Escape HTML to avoid XSS and preserve newlines, then format hashtags
    const escapeHtml = (str: string) =>
      str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#039;");

    const escaped = escapeHtml(content);
    const withBreaks = escaped.replace(/\r\n|\r|\n/g, "<br />");
    return withBreaks.replace(
      /#([a-zA-Z0-9_]+)/g,
      '<span class="text-blue-500 hover:text-blue-600 cursor-pointer">#$1</span>'
    );
  };

  const [expanded, setExpanded] = useState(false);
  const PREVIEW_LENGTH = 500; // chars for preview (match media behavior)
  const isLongContent = (localPost.content || "").length > PREVIEW_LENGTH;
  const getPreview = (content: string) => {
    if (!content) return "";
    if (content.length <= PREVIEW_LENGTH) return content;
    return content.slice(0, PREVIEW_LENGTH) + "...";
  };

  const isOwnPost = currentUserId === post.author.id;

  return (
    <div className={`post-wrapper mb-4 ${className}`}>
      {/* Author / Publisher header outside the main container */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-3">
          <Link
            to={`/profile/${post.author.id}`}
            className="flex items-center gap-3"
          >
            <img
              src={getAvatarSrc(post.author.profilePictureUrl)}
              alt={post.author.displayName}
              className="w-10 h-10 rounded-full object-cover"
              data-original={post.author.profilePictureUrl ?? undefined}
              onError={(e) => {
                const img = e.target as HTMLImageElement;
                const orig = img.getAttribute("data-original");
                markUploadPathFailed(orig ?? undefined);
                img.src = DEFAULT_BLANK_AVATAR;
              }}
            />
            <div>
              <h3 className="font-semibold text-gray-100 text-sm">
                {post.author.displayName}
              </h3>
              <p className="text-gray-400 text-xs">
                {PostService.getTimeAgo(post.createdAt)}
              </p>
            </div>
          </Link>
        </div>

        {/* Post Menu (kept at same visual level as author) */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="text-gray-400 hover:text-gray-200 p-1 rounded-full hover:bg-[rgba(255,255,255,0.02)]"
            aria-label={t("posts:menu")}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>

          {showMenu && (
            <div
              className={`absolute ${
                // align dropdown to the left in RTL, right in LTR to avoid going off-screen
                typeof window !== "undefined" &&
                document.documentElement.dir === "rtl"
                  ? "left-0"
                  : "right-0"
              } mt-1 w-48 bg-[rgba(11,19,43,0.9)] rounded-md shadow-lg border border-[rgba(255,255,255,0.04)] z-10`}
            >
              <div className="py-1">
                {isOwnPost && (
                  <button
                    onClick={() => {
                      // open inline edit
                      setShowEdit(true);
                      setEditTitle(localPost.title || "");
                      setEditContent(localPost.content || "");
                      setShowMenu(false);
                    }}
                    className="block px-4 py-2 text-sm text-gray-200 hover:bg-[rgba(255,255,255,0.02)] w-full text-left"
                  >
                    {t("posts:edit") || "Edit"}
                  </button>
                )}
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `${window.location.origin}/posts/${post.id}`
                    );
                    setShowMenu(false);
                  }}
                  className="block px-4 py-2 text-sm text-gray-200 hover:bg-[rgba(255,255,255,0.02)] w-full text-left"
                >
                  {t("posts:copyLink")}
                </button>
                {isOwnPost && (
                  <button
                    onClick={() => {
                      onDelete?.(post.id);
                      setShowMenu(false);
                    }}
                    className="block px-4 py-2 text-sm text-red-400 hover:bg-[rgba(239,68,68,0.06)] w-full text-left"
                  >
                    {t("posts:delete")}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <article
        className={`post-card bg-[rgba(255,255,255,0.03)] rounded-xl shadow-md border border-[rgba(255,255,255,0.06)] p-6 transition-shadow`}
      >
        {/* Title on top separated with a horizontal rule */}
        <div className="pb-3 border-b border-[rgba(255,255,255,0.06)] mb-4">
          {!showEdit ? (
            <h2 className="text-lg font-semibold text-gray-100">
              {localPost.title}
            </h2>
          ) : (
            <div className="space-y-2">
              <input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-md bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.04)] text-gray-100"
                placeholder={t("posts:editTitlePlaceholder") || "Title"}
                aria-label={t("posts:editTitlePlaceholder") || "Title"}
              />
            </div>
          )}
        </div>

        {/* Post Content */}
        <div className="mb-4">
          {!showEdit ? (
            <div className="text-gray-200 leading-relaxed">
              <div
                className="break-words max-w-full whitespace-pre-wrap"
                dangerouslySetInnerHTML={{
                  __html: formatContent(
                    expanded ? localPost.content : getPreview(localPost.content)
                  ),
                }}
              />
              {isLongContent && (
                <button
                  onClick={() => setExpanded((s) => !s)}
                  className="text-xs text-[#6fffe9] mt-2"
                >
                  {expanded ? t("common.hide") : t("common.readMore")}
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 rounded-md bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.04)] text-gray-100 resize-none"
                placeholder={t("posts:editContentPlaceholder") || "Content"}
                aria-label={t("posts:editContentPlaceholder") || "Content"}
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={async () => {
                    try {
                      const resp = await PostService.updatePost(post.id, {
                        title: editTitle,
                        content: editContent,
                      });
                      if (resp && resp.post) {
                        // Only update fields we know exist on the PostListItem
                        setLocalPost(
                          (prev) =>
                            ({
                              ...(prev || {}),
                              title: resp.post.title,
                              content: resp.post.content,
                            } as PostListItem)
                        );
                        setShowEdit(false);
                      }
                    } catch (err) {
                      console.error("Failed to update post:", err);
                    }
                  }}
                  className="px-3 py-1 bg-[#6fffe9] text-black rounded-md text-sm"
                >
                  {t("common.save")}
                </button>
                <button
                  onClick={() => setShowEdit(false)}
                  className="px-3 py-1 bg-transparent text-sm text-gray-300 rounded-md"
                >
                  {t("common.cancel")}
                </button>
              </div>
            </div>
          )}

          {/* Game Category Badge */}

          {/* Game Category Badge */}
          {post.gameCategory && (
            <div className="mt-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[rgba(111,255,233,0.08)] text-[#6fffe9]">
                {t(`events:gameCategories.${post.gameCategory.toUpperCase()}`)}
              </span>
            </div>
          )}
        </div>

        {/* Engagement Bar */}
        <div className="flex items-center justify-between pt-4 border-t border-[rgba(255,255,255,0.06)]">
          <div className="flex items-center space-x-6">
            {/* Like Button */}
            <button
              onClick={handleLike}
              disabled={isLiking}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors border ${
                post.isLiked
                  ? "border-red-500"
                  : "border-[rgba(239,68,68,0.18)]"
              } bg-transparent disabled:opacity-50 ${
                post.isLiked
                  ? ""
                  : "hover:bg-[rgba(239,68,68,0.06)] hover:text-red-500"
              }`}
            >
              <svg
                className={`w-5 h-5 ${
                  post.isLiked ? "text-red-500" : "text-gray-300"
                }`}
                viewBox="0 0 24 24"
                fill={post.isLiked ? "currentColor" : "none"}
                stroke={post.isLiked ? "none" : "currentColor"}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              <span className="text-sm font-medium text-gray-100">
                {PostService.formatEngagementCount(post.likeCount)}
              </span>
            </button>

            {/* Comment Button */}
            <button
              onClick={() => {
                setShowComments((s) => !s);
                onComment?.(post.id);
              }}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-300 hover:text-[#6fffe9] hover:bg-[rgba(111,255,233,0.03)] transition-colors"
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
              <span className="text-sm font-medium text-gray-100">
                {PostService.formatEngagementCount(localCommentCount)}
              </span>
            </button>

            {/* Share Button */}
            <button
              onClick={handleShare}
              disabled={isSharing}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-300 hover:text-[#5BC0BE] hover:bg-[rgba(91,192,190,0.04)] transition-colors disabled:opacity-50"
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
              <span className="text-sm font-medium text-gray-100">
                {t("posts:share")}
              </span>
            </button>
          </div>
        </div>

        {/* Comments Section (lazy shown) */}
        {showComments && (
          <div className="mt-4">
            <Comments
              postId={post.id}
              currentUserId={currentUserId}
              onAdd={() => {
                setLocalCommentCount((c) => c + 1);
              }}
              onDelete={() => {
                setLocalCommentCount((c) => Math.max(0, c - 1));
              }}
            />
          </div>
        )}
      </article>
    </div>
  );
};
