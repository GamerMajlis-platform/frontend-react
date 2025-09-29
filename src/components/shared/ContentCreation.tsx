import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { CreatePost } from "../posts/CreatePost";
import { MediaUpload } from "../media/MediaUpload";

interface ContentCreationProps {
  onPostCreated?: (postId: number) => void;
  onMediaUploaded?: (mediaId: number) => void;
  onError?: (error: string) => void;
}

export const ContentCreation: React.FC<ContentCreationProps> = ({
  onPostCreated,
  onMediaUploaded,
  onError,
}) => {
  const { t } = useTranslation();
  const [activeContentType, setActiveContentType] = useState<"post" | "media">(
    "post"
  );

  return (
    <div className="content-creation">
      {/* Content Type Selection */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center space-x-2">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          <span>{t("home.content.createTitle")}</span>
        </h2>

        {/* Content Type Tabs */}
        <div className="flex space-x-1 bg-gray-800/50 rounded-lg p-1">
          <button
            onClick={() => setActiveContentType("post")}
            className={`flex-1 px-4 py-2 rounded-md transition-all duration-200 font-medium ${
              activeContentType === "post"
                ? "bg-[#6fffe9] text-black"
                : "text-white hover:bg-white/10"
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <svg
                className="w-4 h-4"
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
              <span>{t("home.content.createPost")}</span>
            </div>
          </button>
          <button
            onClick={() => setActiveContentType("media")}
            className={`flex-1 px-4 py-2 rounded-md transition-all duration-200 font-medium ${
              activeContentType === "media"
                ? "bg-[#6fffe9] text-black"
                : "text-white hover:bg-white/10"
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              <span>{t("home.content.uploadMedia")}</span>
            </div>
          </button>
        </div>
      </div>

      {/* Content Creation Forms */}
      <div className="bg-gray-800/30 rounded-lg p-6">
        {activeContentType === "post" && (
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
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
              <span>{t("home.content.createPost")}</span>
            </h3>
            <CreatePost
              onPostCreated={(postId) => {
                onPostCreated?.(postId);
              }}
            />
          </div>
        )}

        {activeContentType === "media" && (
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
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
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              <span>{t("home.content.uploadMedia")}</span>
            </h3>
            <div className="space-y-4">
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <h4 className="text-blue-200 font-medium mb-2">
                  {t("media:upload.requirements", "Upload Requirements")}
                </h4>
                <ul className="text-blue-100/80 text-sm space-y-1">
                  <li>
                    •{" "}
                    {t(
                      "media:upload.formats",
                      "Formats: MP4, AVI, MOV, JPG, PNG, GIF"
                    )}
                  </li>
                  <li>
                    •{" "}
                    {t(
                      "media:upload.sizes",
                      "Max size: 100MB (videos), 10MB (images)"
                    )}
                  </li>
                  <li>
                    •{" "}
                    {t(
                      "media:upload.compression",
                      "Files will be compressed (min 30% reduction)"
                    )}
                  </li>
                  <li>
                    •{" "}
                    {t(
                      "media:upload.security",
                      "All files are scanned for security"
                    )}
                  </li>
                </ul>
              </div>
              <MediaUpload
                onUploadSuccess={(mediaId) => {
                  onMediaUploaded?.(mediaId);
                }}
                onUploadError={onError}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
