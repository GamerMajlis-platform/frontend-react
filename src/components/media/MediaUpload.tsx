import React, { useState, useRef } from "react";
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
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showUploadForm, setShowUploadForm] = useState(false);

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
            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg
                className="w-8 h-8 mb-4 text-gray-500"
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
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">
                  {t("media.upload.clickToUpload")}
                </span>{" "}
                {t("media.upload.orDragAndDrop")}
              </p>
              <p className="text-xs text-gray-500">
                {t("media.upload.supportedFormats")}
              </p>
            </div>
          </label>
        </div>
      ) : (
        <div className="upload-form bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">
            {t("media.upload.uploadDetails")}
          </h3>

          {selectedFile && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <span className="font-medium">
                  {t("media.upload.selectedFile")}:
                </span>{" "}
                {selectedFile.name}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">
                  {t("media.upload.fileSize")}:
                </span>{" "}
                {MediaService.formatFileSize(selectedFile.size)}
              </p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("media.upload.title")}
              </label>
              <input
                type="text"
                value={uploadData.title}
                onChange={(e) =>
                  setUploadData((prev) => ({ ...prev, title: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={t("media.upload.titlePlaceholder")}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("media.upload.description")}
                <span className="text-xs text-gray-500">
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={t("media.upload.descriptionPlaceholder")}
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("media.upload.tags")}
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={t("media.upload.tagsPlaceholder")}
              />
              <p className="text-xs text-gray-500 mt-1">
                {t("media.upload.tagsHelp")}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("media.upload.gameCategory")}
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                title={t("media.upload.gameCategory")}
              >
                <option value="">{t("media.upload.selectCategory")}</option>
                {GAME_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {t(`events.gameCategories.${category.toUpperCase()}`, {})}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("media.upload.visibility")}
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                title={t("media.upload.visibility")}
              >
                <option value="PUBLIC">{t("media.upload.public")}</option>
                <option value="PRIVATE">{t("media.upload.private")}</option>
              </select>
            </div>
          </div>

          {isUploading && (
            <div className="mt-4">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>{t("media.upload.uploading")}</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`bg-blue-600 h-2 rounded-full transition-all duration-300`}
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
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t("common.cancel")}
            </button>
            <button
              type="button"
              onClick={handleUpload}
              disabled={isUploading || !uploadData.title.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading
                ? t("media.upload.uploading")
                : t("media.upload.upload")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
