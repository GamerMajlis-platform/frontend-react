import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { PostService } from "../../services/PostService";
import type { Comment } from "../../types";
import { Link } from "react-router-dom";
import {
  markUploadPathFailed,
  getAvatarSrc,
  DEFAULT_BLANK_AVATAR,
} from "../../lib/urls";
import { useAppContext } from "../../context/useAppContext";

interface CommentsProps {
  postId: number;
  currentUserId?: number;
  onAdd?: (comment: Comment) => void;
  onDelete?: (commentId: number) => void;
}

export const Comments: React.FC<CommentsProps> = ({
  postId,
  currentUserId,
  onAdd,
  onDelete,
}) => {
  const { user } = useAppContext();
  const { t, i18n } = useTranslation();
  const dir = i18n?.dir
    ? i18n.dir()
    : typeof document !== "undefined"
    ? document.documentElement.dir
    : "ltr";

  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");
  const [adding, setAdding] = useState(false);
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState<string>("");

  const loadComments = async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await PostService.getComments(postId, { page: 0, size: 20 });
      if (resp.success) {
        setComments(resp.comments);
      } else {
        setError(resp.message || t("posts:comments.loadError"));
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("posts:comments.loadError")
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  const handleAdd = async () => {
    if (!newComment.trim()) return;
    setAdding(true);
    try {
      const resp = await PostService.addComment(postId, {
        content: newComment.trim(),
        parentId: replyTo ?? undefined,
      });
      if (resp.success) {
        // If reply, attempt to attach under parent locally
        if (resp.comment.parentId) {
          setComments((prev) => {
            const idx = prev.findIndex((c) => c.id === resp.comment.parentId);
            if (idx !== -1) {
              const copy = [...prev];
              const parent = { ...copy[idx] };
              parent.replies = parent.replies
                ? [resp.comment, ...parent.replies]
                : [resp.comment];
              copy[idx] = parent;
              return copy;
            }
            return [resp.comment, ...prev];
          });
        } else {
          setComments((prev) => [resp.comment, ...prev]);
        }
        onAdd?.(resp.comment);
        setNewComment("");
        setReplyTo(null);
      } else {
        setError(resp.message || t("posts:comments.addError"));
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("posts:comments.addError")
      );
    } finally {
      setAdding(false);
    }
  };

  const cancelReply = () => {
    setReplyTo(null);
    setNewComment("");
  };

  const handleDelete = async (commentId: number) => {
    if (!window.confirm(t("posts:comments.confirmDelete"))) return;
    try {
      const resp = await PostService.deleteComment(commentId);
      if (resp.success) {
        setComments((prev) => prev.filter((c) => c.id !== commentId));
        onDelete?.(commentId);
      }
    } catch (err) {
      console.error("Failed to delete comment:", err);
    }
  };

  const startEdit = (commentId: number, currentContent: string) => {
    setEditingCommentId(commentId);
    setEditingContent(currentContent);
  };

  const cancelEdit = () => {
    setEditingCommentId(null);
    setEditingContent("");
  };

  const saveEdit = async (commentId: number, parentId?: number | null) => {
    if (!editingContent.trim()) return;
    try {
      const resp = await PostService.updateComment(
        commentId,
        editingContent.trim()
      );
      if (resp.success) {
        // update local state: either top-level comment or a reply inside parent
        if (parentId) {
          setComments((prev) => {
            const copy = prev.map((c) => ({ ...c }));
            const pIdx = copy.findIndex((c) => c.id === parentId);
            if (pIdx !== -1) {
              const parent = { ...copy[pIdx] };
              parent.replies =
                parent.replies?.map((r) =>
                  r.id === commentId ? resp.comment : r
                ) || [];
              copy[pIdx] = parent;
            }
            return copy;
          });
        } else {
          setComments((prev) =>
            prev.map((c) => (c.id === commentId ? resp.comment : c))
          );
        }
        cancelEdit();
      }
    } catch (err) {
      console.error("Failed to update comment:", err);
    }
  };

  return (
    <div className="mt-4">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gray-100">
          {t("posts:comments.title") || `Comments (${comments.length})`}
        </h4>
      </div>

      <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.04)] rounded-lg p-3 space-y-3">
        {loading && (
          <div className="text-sm text-gray-400">{t("common.loading")}</div>
        )}
        {error && <div className="text-sm text-red-400">{error}</div>}

        {comments.length === 0 && !loading ? (
          <div className="text-sm text-gray-400">
            {t("posts:comments.noComments") || "No comments yet"}
          </div>
        ) : (
          <div className="space-y-3">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="bg-[rgba(0,0,0,0.05)] p-3 rounded-lg"
              >
                <div
                  className={`flex items-start ${
                    dir === "rtl" ? "flex-row-reverse" : ""
                  }`}
                >
                  <Link
                    to={`/profile/${comment.author.id}`}
                    className="flex-shrink-0"
                  >
                    <img
                      src={getAvatarSrc(comment.author.profilePictureUrl)}
                      alt={comment.author.displayName}
                      className="w-9 h-9 rounded-full object-cover"
                      data-original={
                        comment.author.profilePictureUrl ?? undefined
                      }
                      onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        const orig = img.getAttribute("data-original");
                        markUploadPathFailed(orig ?? undefined);
                        img.src = DEFAULT_BLANK_AVATAR;
                      }}
                    />
                  </Link>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <Link
                          to={`/profile/${comment.author.id}`}
                          className="text-sm font-medium text-gray-100 hover:text-[#6fffe9]"
                        >
                          {comment.author.displayName}
                        </Link>
                        <div className="text-xs text-gray-400">
                          {PostService.getTimeAgo(comment.createdAt)}
                        </div>
                      </div>
                      {currentUserId === comment.author.id && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              startEdit(comment.id, comment.content)
                            }
                            className="text-xs text-gray-400 hover:text-[#6fffe9]"
                          >
                            {t("common.edit") || "Edit"}
                          </button>
                          <button
                            onClick={() => handleDelete(comment.id)}
                            className="text-xs text-red-400 hover:text-red-500"
                          >
                            {t("common.delete")}
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="mt-2">
                      {editingCommentId === comment.id ? (
                        <div>
                          <textarea
                            value={editingContent}
                            onChange={(e) => setEditingContent(e.target.value)}
                            rows={3}
                            placeholder={
                              t("posts:comments.editPlaceholder") ||
                              "Edit your comment"
                            }
                            aria-label={
                              t("posts:comments.editPlaceholder") ||
                              "Edit your comment"
                            }
                            className="w-full px-3 py-2 rounded-md bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.04)] text-gray-100 resize-none"
                          />
                          <div className="mt-2 flex gap-2">
                            <button
                              onClick={() => saveEdit(comment.id)}
                              className="px-3 py-1 bg-[#6fffe9] text-black rounded-md text-sm"
                            >
                              {t("common.save")}
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="px-3 py-1 bg-transparent text-sm text-gray-300 rounded-md"
                            >
                              {t("common.cancel")}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-gray-100 whitespace-pre-wrap">
                          {comment.content}
                        </div>
                      )}
                    </div>

                    <div className="mt-2 flex items-center gap-3">
                      <button
                        onClick={() => setReplyTo(comment.id)}
                        className="text-xs text-gray-400 hover:text-[#6fffe9]"
                      >
                        {t("posts:comments.reply") || "Reply"}
                      </button>
                      <span className="text-xs text-gray-400">·</span>
                      <div className="text-xs text-gray-400">
                        {PostService.formatEngagementCount(
                          comment.replies?.length || 0
                        )}{" "}
                        replies
                      </div>
                    </div>

                    {comment.replies && comment.replies.length > 0 && (
                      <div
                        className={`mt-3 space-y-2 ${
                          dir === "rtl" ? "pr-12" : "pl-12"
                        }`}
                      >
                        {comment.replies.map((r) => (
                          <div
                            key={r.id}
                            className={`flex items-start ${
                              dir === "rtl" ? "flex-row-reverse" : ""
                            }`}
                          >
                            <Link
                              to={`/profile/${r.author.id}`}
                              className="flex-shrink-0"
                            >
                              <img
                                src={getAvatarSrc(r.author.profilePictureUrl)}
                                alt={r.author.displayName}
                                className="w-7 h-7 rounded-full object-cover"
                                data-original={
                                  r.author.profilePictureUrl ?? undefined
                                }
                                onError={(e) => {
                                  const img = e.target as HTMLImageElement;
                                  const orig =
                                    img.getAttribute("data-original");
                                  markUploadPathFailed(orig ?? undefined);
                                  img.src = DEFAULT_BLANK_AVATAR;
                                }}
                              />
                            </Link>
                            <div className="flex-1">
                              <div className="text-sm font-medium text-gray-100">
                                {r.author.displayName}
                              </div>
                              <div className="text-xs text-gray-400">
                                {PostService.getTimeAgo(r.createdAt)}
                              </div>
                              <div className="mt-1">
                                {editingCommentId === r.id ? (
                                  <div>
                                    <textarea
                                      value={editingContent}
                                      onChange={(e) =>
                                        setEditingContent(e.target.value)
                                      }
                                      rows={2}
                                      placeholder={
                                        t("posts:comments.editPlaceholder") ||
                                        "Edit your reply"
                                      }
                                      aria-label={
                                        t("posts:comments.editPlaceholder") ||
                                        "Edit your reply"
                                      }
                                      className="w-full px-2 py-1 rounded-md bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.04)] text-gray-100 resize-none"
                                    />
                                    <div className="mt-2 flex gap-2">
                                      <button
                                        onClick={() =>
                                          saveEdit(r.id, comment.id)
                                        }
                                        className="px-3 py-1 bg-[#6fffe9] text-black rounded-md text-sm"
                                      >
                                        {t("common.save")}
                                      </button>
                                      <button
                                        onClick={cancelEdit}
                                        className="px-3 py-1 bg-transparent text-sm text-gray-300 rounded-md"
                                      >
                                        {t("common.cancel")}
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="text-gray-100 whitespace-pre-wrap">
                                    {r.content}
                                  </div>
                                )}
                              </div>
                              {currentUserId === r.author.id && (
                                <div className="mt-1 flex items-center gap-2">
                                  <button
                                    onClick={() => startEdit(r.id, r.content)}
                                    className="text-xs text-gray-400 hover:text-[#6fffe9]"
                                  >
                                    {t("common.edit") || "Edit"}
                                  </button>
                                  <button
                                    onClick={() => handleDelete(r.id)}
                                    className="text-xs text-red-400 hover:text-red-500"
                                  >
                                    {t("common.delete")}
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="my-3 border-t border-[rgba(255,255,255,0.04)]" />

      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <img
            src={getAvatarSrc(user?.profilePictureUrl)}
            alt={user?.displayName || "You"}
            className="w-9 h-9 rounded-full object-cover"
            data-original={user?.profilePictureUrl ?? undefined}
            onError={(e) => {
              const img = e.target as HTMLImageElement;
              const orig = img.getAttribute("data-original");
              markUploadPathFailed(orig ?? undefined);
              img.src = DEFAULT_BLANK_AVATAR;
            }}
          />
        </div>
        <div className="flex-1">
          {replyTo && (
            <div className="mb-2 flex items-center justify-between bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.03)] rounded-md px-3 py-2">
              <div className="text-sm text-gray-200">
                {t("posts:comments.replyingTo") || "Replying to a comment"}
              </div>
              <button
                onClick={cancelReply}
                className="text-xs text-gray-400 hover:text-[#6fffe9]"
              >
                {t("common.cancel") || "Cancel"}
              </button>
            </div>
          )}
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={2}
            placeholder={t("posts:comments.placeholder")}
            className="w-full px-3 py-2 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.04)] text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6fffe9] resize-none"
          />
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              {/* future: add emoji / attach buttons */}
            </div>
            <div>
              <button
                onClick={handleAdd}
                disabled={adding || !newComment.trim()}
                className="px-4 py-2 bg-[#6fffe9] text-black rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {adding ? t("common.saving") : t("posts:comments.add")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Comments;
