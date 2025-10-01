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
import { ConfirmDialog } from "../shared/ConfirmDialog";

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
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState<string>("");
  const [openMenuFor, setOpenMenuFor] = useState<number | null>(null);

  // close any open menus when clicking outside
  React.useEffect(() => {
    const onDocClick = () => setOpenMenuFor(null);
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

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
      });
      if (resp.success) {
        // Backend returns flat comments; prepend new comment to list
        setComments((prev) => [resp.comment, ...prev]);
        onAdd?.(resp.comment);
        setNewComment("");
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

  const handleDelete = async (commentId: number) => {
    // handled by ConfirmDialog trigger
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

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  const promptDelete = (commentId: number) => {
    setPendingDeleteId(commentId);
    setConfirmOpen(true);
    setOpenMenuFor(null);
  };

  const onConfirmDelete = async () => {
    if (pendingDeleteId === null) return;
    await handleDelete(pendingDeleteId);
    setPendingDeleteId(null);
    setConfirmOpen(false);
  };

  const onCancelDelete = () => {
    setPendingDeleteId(null);
    setConfirmOpen(false);
  };

  const startEdit = (commentId: number, currentContent: string) => {
    setEditingCommentId(commentId);
    setEditingContent(currentContent);
  };

  const cancelEdit = () => {
    setEditingCommentId(null);
    setEditingContent("");
  };

  const saveEdit = async (commentId: number) => {
    if (!editingContent.trim()) return;
    try {
      const resp = await PostService.updateComment(
        commentId,
        editingContent.trim()
      );
      if (resp.success) {
        // update local state for flat comments
        setComments((prev) =>
          prev.map((c) => (c.id === commentId ? resp.comment : c))
        );
        cancelEdit();
      }
    } catch (err) {
      console.error("Failed to update comment:", err);
    }
  };

  return (
    <>
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
                  {/* Row: avatar+meta on one side, menu on the other (justify-between) */}
                  <div className={`flex items-start justify-between`}>
                    <div
                      className={`flex items-start ${
                        dir === "rtl" ? "flex-row-reverse" : "flex-row"
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

                      <div
                        className={`${
                          dir === "rtl" ? "mr-3 text-right" : "ml-3 text-left"
                        }`}
                      >
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
                    </div>

                    {/* three-dots menu for owner actions (Edit/Delete) */}
                    {currentUserId === comment.author.id && (
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuFor((prev) =>
                              prev === comment.id ? null : comment.id
                            );
                          }}
                          aria-label={t("common.more") || "More"}
                          className="p-1 text-gray-400 hover:text-[#6fffe9]"
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <circle
                              cx="12"
                              cy="5"
                              r="1.5"
                              fill="currentColor"
                            />
                            <circle
                              cx="12"
                              cy="12"
                              r="1.5"
                              fill="currentColor"
                            />
                            <circle
                              cx="12"
                              cy="19"
                              r="1.5"
                              fill="currentColor"
                            />
                          </svg>
                        </button>

                        {openMenuFor === comment.id && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className={`absolute z-10 mt-2 w-36 rounded-md bg-[#0b0b0b] border border-[rgba(255,255,255,0.04)] shadow-lg p-1 ${
                              dir === "rtl" ? "left-0" : "right-0"
                            }`}
                          >
                            <button
                              onClick={() => {
                                startEdit(comment.id, comment.content);
                                setOpenMenuFor(null);
                              }}
                              className="w-full text-left px-3 py-2 text-sm text-gray-100 hover:bg-[rgba(255,255,255,0.02)]"
                            >
                              {t("common.edit") || "Edit"}
                            </button>
                            <button
                              onClick={() => {
                                promptDelete(comment.id);
                              }}
                              className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-[rgba(255,255,255,0.02)]"
                            >
                              {t("common.delete") || "Delete"}
                            </button>
                          </div>
                        )}
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
            {/* no reply UI: backend does not support threaded replies */}
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
      <ConfirmDialog
        open={confirmOpen}
        title={t("posts:comments.confirmTitle")}
        message={t("posts:comments.confirmDelete")}
        onConfirm={onConfirmDelete}
        onCancel={onCancelDelete}
      />
    </>
  );
};

export default Comments;
