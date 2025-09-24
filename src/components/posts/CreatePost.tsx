import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { PostService } from "../../services/PostService";
import type {
  PostCreateRequest,
  GameCategory,
  GamingPlatform,
} from "../../types";

// Game categories for selection
const GAME_CATEGORIES: GameCategory[] = [
  "FPS",
  "MOBA",
  "RPG",
  "STRATEGY",
  "SPORTS",
  "RACING",
  "FIGHTING",
  "OTHER",
];

// Gaming platforms
const GAMING_PLATFORMS: GamingPlatform[] = [
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
];

interface CreatePostProps {
  onPostCreated?: (postId: number) => void;
  onCancel?: () => void;
  className?: string;
  isModal?: boolean;
}

export const CreatePost: React.FC<CreatePostProps> = ({
  onPostCreated,
  onCancel,
  className = "",
  isModal = false,
}) => {
  const { t } = useTranslation();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [postData, setPostData] = useState({
    title: "",
    content: "",
    gameTitle: "",
    gameCategory: "" as GameCategory | "",
    platform: "" as GamingPlatform | "",
    tags: "",
    hashtags: "",
    visibility: "PUBLIC" as "PUBLIC" | "PRIVATE",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!postData.title.trim() || !postData.content.trim()) {
      setError(t("posts.create.requiredFields"));
      return;
    }

    setIsSubmitting(true);
    try {
      const createRequest: PostCreateRequest = {
        title: postData.title.trim(),
        content: postData.content.trim(),
        gameTitle: postData.gameTitle.trim() || undefined,
        gameCategory: postData.gameCategory || undefined,
        platform: postData.platform || undefined,
        tags: postData.tags
          ? postData.tags
              .split(",")
              .map((tag) => tag.trim())
              .filter(Boolean)
          : undefined,
        hashtags: postData.hashtags
          ? postData.hashtags
              .split(",")
              .map((tag) => tag.trim())
              .filter(Boolean)
          : undefined,
        visibility: postData.visibility,
      };

      const response = await PostService.createPost(createRequest);

      if (response.success) {
        setShowSuccess(true);
        setTimeout(() => {
          onPostCreated?.(response.post.id);
          resetForm();
          setShowSuccess(false);
        }, 2000);
      } else {
        setError(response.message || t("posts.create.createError"));
      }
    } catch (error) {
      console.error("Failed to create post:", error);
      setError(
        error instanceof Error ? error.message : t("posts.create.createError")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setPostData({
      title: "",
      content: "",
      gameTitle: "",
      gameCategory: "",
      platform: "",
      tags: "",
      hashtags: "",
      visibility: "PUBLIC",
    });
  };

  const handleCancel = () => {
    resetForm();
    onCancel?.();
  };

  const extractHashtags = (text: string) => {
    const hashtags = PostService.extractHashtags(text);
    if (hashtags.length > 0) {
      setPostData((prev) => ({
        ...prev,
        hashtags: hashtags.join(", "),
      }));
    }
  };

  const containerClasses = isModal
    ? `create-post-modal ${className}`
    : `create-post-form bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`;

  return (
    <div className={containerClasses}>
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-900">
          {t("posts.create.title")}
        </h2>
        <p className="text-gray-600 text-sm mt-1">
          {t("posts.create.subtitle")}
        </p>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 text-green-600 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
            <p className="text-green-800 text-sm font-medium">
              {t("posts.create.successMessage")}
            </p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 text-red-600 mr-2"
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
            <p className="text-red-800 text-sm font-medium">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Post Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("posts.create.postTitle")}
          </label>
          <input
            type="text"
            value={postData.title}
            onChange={(e) =>
              setPostData((prev) => ({ ...prev, title: e.target.value }))
            }
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6fffe9] focus:border-transparent"
            placeholder={t("posts.create.titlePlaceholder")}
            maxLength={200}
            required
          />
          <div className="text-xs text-gray-500 mt-1">
            {postData.title.length}/200
          </div>
        </div>

        {/* Post Content */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("posts.create.content")}
          </label>
          <textarea
            value={postData.content}
            onChange={(e) => {
              setPostData((prev) => ({ ...prev, content: e.target.value }));
              extractHashtags(e.target.value);
            }}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6fffe9] focus:border-transparent resize-none"
            placeholder={t("posts.create.contentPlaceholder")}
            rows={6}
            maxLength={2000}
            required
          />
          <div className="text-xs text-gray-500 mt-1">
            {postData.content.length}/2000
          </div>
        </div>

        {/* Gaming Details Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Game Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("posts.create.gameTitle")}
              <span className="text-xs text-gray-500">
                {" "}
                ({t("common.optional")})
              </span>
            </label>
            <input
              type="text"
              value={postData.gameTitle}
              onChange={(e) =>
                setPostData((prev) => ({ ...prev, gameTitle: e.target.value }))
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6fffe9] focus:border-transparent"
              placeholder={t("posts.create.gameTitlePlaceholder")}
            />
          </div>

          {/* Game Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("posts.create.gameCategory")}
              <span className="text-xs text-gray-500">
                {" "}
                ({t("common.optional")})
              </span>
            </label>
            <select
              value={postData.gameCategory}
              onChange={(e) =>
                setPostData((prev) => ({
                  ...prev,
                  gameCategory: e.target.value as GameCategory,
                }))
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6fffe9] focus:border-transparent"
              title={t("posts.create.gameCategory")}
            >
              <option value="">{t("posts.create.selectCategory")}</option>
              {GAME_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {t(`events:gameCategories.${category.toUpperCase()}`, {})}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Platform and Tags Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Gaming Platform */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("posts.create.platform")}
              <span className="text-xs text-gray-500">
                {" "}
                ({t("common.optional")})
              </span>
            </label>
            <select
              value={postData.platform}
              onChange={(e) =>
                setPostData((prev) => ({
                  ...prev,
                  platform: e.target.value as GamingPlatform,
                }))
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6fffe9] focus:border-transparent"
              title={t("posts.create.platform")}
            >
              <option value="">{t("posts.create.selectPlatform")}</option>
              {GAMING_PLATFORMS.map((platform) => (
                <option key={platform} value={platform}>
                  {platform}
                </option>
              ))}
            </select>
          </div>

          {/* Visibility */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("posts.create.visibility")}
              <span className="text-xs text-gray-500">
                {" "}
                ({t("common.optional")})
              </span>
            </label>
            <select
              value={postData.visibility}
              onChange={(e) =>
                setPostData((prev) => ({
                  ...prev,
                  visibility: e.target.value as "PUBLIC" | "PRIVATE",
                }))
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6fffe9] focus:border-transparent"
              title={t("posts.create.visibility")}
            >
              <option value="PUBLIC">{t("posts.create.public")}</option>
              <option value="PRIVATE">{t("posts.create.private")}</option>
            </select>
          </div>
        </div>

        {/* Tags and Hashtags Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("posts.create.tags")}
              <span className="text-xs text-gray-500">
                {" "}
                ({t("common.optional")})
              </span>
            </label>
            <input
              type="text"
              value={postData.tags}
              onChange={(e) =>
                setPostData((prev) => ({ ...prev, tags: e.target.value }))
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6fffe9] focus:border-transparent"
              placeholder={t("posts.create.tagsPlaceholder")}
            />
            <p className="text-xs text-gray-500 mt-1">
              {t("posts.create.tagsHelp")}
            </p>
          </div>

          {/* Hashtags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("posts.create.hashtags")}
              <span className="text-xs text-gray-500">
                {" "}
                ({t("common.optional")})
              </span>
            </label>
            <input
              type="text"
              value={postData.hashtags}
              onChange={(e) =>
                setPostData((prev) => ({ ...prev, hashtags: e.target.value }))
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6fffe9] focus:border-transparent"
              placeholder={t("posts.create.hashtagsPlaceholder")}
            />
            <p className="text-xs text-gray-500 mt-1">
              {t("posts.create.hashtagsHelp")}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
          {onCancel && (
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t("common.cancel")}
            </button>
          )}
          <button
            type="submit"
            disabled={
              isSubmitting || !postData.title.trim() || !postData.content.trim()
            }
            className="px-6 py-3 bg-[#6fffe9] text-black rounded-lg hover:bg-[#5ee6d3] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isSubmitting
              ? t("posts.create.publishing")
              : t("posts.create.publish")}
          </button>
        </div>
      </form>
    </div>
  );
};
