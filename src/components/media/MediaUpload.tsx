import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { MediaService } from "../../services/MediaService";
import type { MediaUploadRequest, GameCategory } from "../../types";

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

interface MediaUploadProps {
  onUploadSuccess?: (mediaId: number) => void;
  onUploadError?: (error: string) => void;
  accept?: string;
  className?: string;
}

export const MediaUpload: React.FC<MediaUploadProps> = ({
  onUploadSuccess,
  onUploadError,
  accept = "video/*,image/*",
  className = "",
}) => {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [tagList, setTagList] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const [uploadData, setUploadData] = useState({
    title: "",
    description: "",
    tags: "",
    gameCategory: "" as GameCategory | "",
    visibility: "PUBLIC" as "PUBLIC" | "PRIVATE",
  });

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // T5-T6: Validate file format and size
      const validation = MediaService.validateFile(file);
      if (!validation.isValid) {
        onUploadError?.(validation.error || "Invalid file");
        return;
      }

      // T9: Check for malicious files
      const securityCheck = await MediaService.detectMaliciousFile(file);
      if (!securityCheck.isSafe) {
        onUploadError?.(securityCheck.reason || "File failed security check");
        return;
      }

      setSelectedFile(file);
      // create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setUploadData((prev) => ({
        ...prev,
        title: file.name.split(".")[0], // Default title from filename
      }));
      setShowUploadForm(true);
    } catch (error) {
      onUploadError?.(
        error instanceof Error ? error.message : "File validation failed"
      );
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const uploadRequest: MediaUploadRequest = {
        file: selectedFile,
        title: uploadData.title,
        description: uploadData.description || undefined,
        tags: uploadData.tags
          ? uploadData.tags.split(",").map((tag) => tag.trim())
          : undefined,
        gameCategory: uploadData.gameCategory || undefined,
        visibility: uploadData.visibility,
      };

      // T8: Upload with progress indicator
      const response = await MediaService.uploadMedia(
        uploadRequest,
        (progress) => {
          setUploadProgress(progress);
        }
      );

      if (response.success) {
        // T7: Verify compression requirements (minimum 30% reduction)
        if (response.media.compressedSize && response.media.fileSize) {
          const compressionRatio =
            (response.media.fileSize - response.media.compressedSize) /
            response.media.fileSize;
          if (compressionRatio < 0.3) {
            console.warn(
              "Warning: File compression did not meet 30% reduction requirement"
            );
          }
        }

        onUploadSuccess?.(response.media.id);
        resetForm();
      } else {
        onUploadError?.(response.message || "Upload failed");
      }
    } catch (error) {
      onUploadError?.(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setTagList([]);
    setShowUploadForm(false);
    setUploadData({
      title: "",
      description: "",
      tags: "",
      gameCategory: "",
      visibility: "PUBLIC",
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCancel = () => {
    resetForm();
  };

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const addTag = (tag: string) => {
    const t = tag.trim();
    if (!t) return;
    setTagList((prev) => (prev.includes(t) ? prev : [...prev, t]));
    setUploadData((prev) => ({
      ...prev,
      tags: (prev.tags ? prev.tags + ", " : "") + t,
    }));
  };

  const removeTag = (tag: string) => {
    setTagList((prev) => prev.filter((t) => t !== tag));
    setUploadData((prev) => ({
      ...prev,
      tags: tagList.filter((t) => t !== tag).join(", "),
    }));
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file && fileInputRef.current) {
      fileInputRef.current.files = e.dataTransfer.files;
      await handleFileSelect({
        target: { files: e.dataTransfer.files },
      } as unknown as React.ChangeEvent<HTMLInputElement>);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  return (
    <div className={`media-upload ${className}`}>
      {!showUploadForm ? (
        <div className="upload-trigger">
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileSelect}
            className="hidden"
            id="media-upload-input"
          />
          <label
            htmlFor="media-upload-input"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
              dragActive
                ? "ring-2 ring-primary/40 bg-primary/10 border-primary/30"
                : "bg-transparent border-slate-600/40 hover:bg-slate-700/50"
            }`}
          >
            <div className="flex flex-col items-center justify-center pt-3 pb-3">
              <svg
                className="w-9 h-9 mb-3 text-primary"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 20 16"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                />
              </svg>
              <p className="mb-1 text-sm text-slate-200">
                <span className="font-semibold text-primary">
                  {t("media:upload.clickToUpload")}
                </span>{" "}
                {t("media:upload.orDragAndDrop")}
              </p>
              <p className="text-xs text-slate-400">
                {t("media:upload.supportedFormats")}
              </p>
            </div>
          </label>
        </div>
      ) : (
        <div className="upload-form bg-slate-700/50 p-6 rounded-lg border border-slate-600/40">
          <h3 className="text-lg font-semibold mb-4 text-white">
            {t("media:upload.uploadDetails")}
          </h3>

          {selectedFile && (
            <div className="mb-4 p-3 bg-slate-800/40 rounded-lg border border-slate-600/40">
              <div className="flex items-start gap-4">
                {previewUrl ? (
                  <div className="w-28 h-20 bg-gray-800 rounded overflow-hidden flex items-center justify-center">
                    {selectedFile.type.startsWith("video") ? (
                      <video
                        className="w-full h-full object-cover"
                        src={previewUrl}
                      />
                    ) : (
                      <img
                        className="w-full h-full object-cover"
                        src={previewUrl}
                        alt={selectedFile.name}
                      />
                    )}
                  </div>
                ) : (
                  <div className="w-28 h-20 bg-gray-800 rounded flex items-center justify-center text-gray-400">
                    <svg
                      className="w-6 h-6"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M16 3v4M8 3v4m8 4l-4 4-4-4"
                      />
                    </svg>
                  </div>
                )}

                <div className="flex-1">
                  <p className="text-sm text-white font-medium truncate">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-slate-400">
                    {MediaService.formatFileSize(selectedFile.size)}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {selectedFile.type}
                  </p>
                </div>
              </div>
              {/* Tags chips */}
              <div className="mt-3">
                <div className="flex items-center gap-2 flex-wrap">
                  {tagList.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary"
                    >
                      #{tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="ml-2 text-slate-400 hover:text-slate-200 text-xs"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="mt-2">
                  <input
                    type="text"
                    placeholder={t("media:upload.addTag")}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTag((e.target as HTMLInputElement).value);
                        (e.target as HTMLInputElement).value = "";
                      }
                    }}
                    className="w-full px-3 py-2 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-transparent text-white placeholder-slate-400"
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    {t("media:upload.tagsHelp")}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-1">
                {t("media:upload.title")}
              </label>
              <input
                type="text"
                value={uploadData.title}
                onChange={(e) =>
                  setUploadData((prev) => ({ ...prev, title: e.target.value }))
                }
                className="w-full px-3 py-2 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-transparent text-white placeholder-slate-400"
                placeholder={t("media:upload.titlePlaceholder")}
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-1">
                {t("media:upload.description")}
                <span className="text-xs text-slate-400">
                  {" "}
                  ({t("common.optional")})
                </span>
              </label>
              <textarea
                value={uploadData.description}
                onChange={(e) =>
                  setUploadData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-transparent text-white placeholder-slate-400"
                placeholder={t("media:upload.descriptionPlaceholder")}
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                {t("media:upload.tags")}
                <span className="text-xs text-gray-500">
                  {" "}
                  ({t("common.optional")})
                </span>
              </label>
              <input
                type="text"
                value={uploadData.tags}
                onChange={(e) =>
                  setUploadData((prev) => ({ ...prev, tags: e.target.value }))
                }
                className="w-full px-3 py-2 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-transparent text-white placeholder-slate-400"
                placeholder={t("media:upload.tagsPlaceholder")}
              />
              <p className="text-xs text-slate-400 mt-1">
                {t("media:upload.tagsHelp")}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                {t("media:upload.gameCategory")}
                <span className="text-xs text-gray-500">
                  {" "}
                  ({t("common.optional")})
                </span>
              </label>
              <select
                value={uploadData.gameCategory}
                onChange={(e) =>
                  setUploadData((prev) => ({
                    ...prev,
                    gameCategory: e.target.value as GameCategory,
                  }))
                }
                className="w-full px-3 py-2 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-transparent text-white placeholder-slate-400"
                title={t("media:upload.gameCategory")}
              >
                <option value="" className="bg-[#0B132B] text-[#EEEEEE]">
                  {t("media:upload.selectCategory")}
                </option>
                {GAME_CATEGORIES.map((category) => (
                  <option
                    key={category}
                    value={category}
                    className="bg-[#0B132B] text-[#EEEEEE]"
                  >
                    {t(`events:gameCategories.${category.toUpperCase()}`, {})}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                {t("media:upload.visibility")}
                <span className="text-xs text-gray-500">
                  {" "}
                  ({t("common.optional")})
                </span>
              </label>
              <select
                value={uploadData.visibility}
                onChange={(e) =>
                  setUploadData((prev) => ({
                    ...prev,
                    visibility: e.target.value as "PUBLIC" | "PRIVATE",
                  }))
                }
                className="w-full px-3 py-2 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-transparent text-white placeholder-slate-400"
                title={t("media:upload.visibility")}
              >
                <option value="PUBLIC" className="bg-[#0B132B] text-[#EEEEEE]">
                  {t("media:upload.public")}
                </option>
                <option value="PRIVATE" className="bg-[#0B132B] text-[#EEEEEE]">
                  {t("media:upload.private")}
                </option>
              </select>
            </div>
          </div>

          {isUploading && (
            <div className="mt-4">
              <div className="flex justify-between text-sm text-slate-300 mb-1">
                <span>{t("media:upload.uploading")}</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-slate-700/40 rounded-full h-2">
                <div
                  className={`bg-primary h-2 rounded-full transition-all duration-300`}
                  data-progress={uploadProgress}
                />
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isUploading}
              className="px-4 py-2 text-white bg-transparent border border-slate-600 rounded-md hover:bg-slate-700/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t("common.cancel")}
            </button>
            <button
              type="button"
              onClick={handleUpload}
              disabled={isUploading || !uploadData.title.trim()}
              className="px-4 py-2 bg-primary text-slate-900 rounded-md hover:bg-primary/80 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading
                ? t("media:upload.uploading")
                : t("media:upload.upload")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
