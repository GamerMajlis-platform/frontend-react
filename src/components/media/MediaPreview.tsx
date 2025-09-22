import React from "react";
import { useTranslation } from "react-i18next";
import { MediaService } from "../../services/MediaService";
import type { Media } from "../../types";

interface MediaPreviewProps {
  media: Media;
  onClick?: () => void;
  showControls?: boolean;
  className?: string;
}

export const MediaPreview: React.FC<MediaPreviewProps> = ({
  media,
  onClick,
  showControls = true,
  className = "",
}) => {
  const { t } = useTranslation();

  const handleViewIncrement = async () => {
    try {
      await MediaService.incrementViewCount(media.id);
    } catch (error) {
      console.error("Failed to increment view count:", error);
    }
  };

  const renderMedia = () => {
    if (media.mediaType === "VIDEO") {
      return (
        <video
          className="w-full h-full object-cover"
          poster={media.thumbnailPath}
          controls={showControls}
          onPlay={handleViewIncrement}
          onClick={onClick}
        >
          <source src={media.filePath} type="video/mp4" />
          {t("media.preview.videoNotSupported")}
        </video>
      );
    } else {
      return (
        <img
          src={media.filePath}
          alt={media.title}
          className="w-full h-full object-cover cursor-pointer"
          onClick={() => {
            handleViewIncrement();
            onClick?.();
          }}
          loading="lazy"
        />
      );
    }
  };

  return (
    <div className={`media-preview relative group ${className}`}>
      <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
        {renderMedia()}

        {/* Overlay with media info */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-end">
          <div className="p-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 w-full">
            <h3 className="font-semibold text-sm mb-1 truncate">
              {media.title}
            </h3>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-3">
                {media.duration && (
                  <span className="bg-black bg-opacity-50 px-2 py-1 rounded">
                    {MediaService.formatDuration(media.duration)}
                  </span>
                )}
                <span>{MediaService.formatFileSize(media.fileSize)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="flex items-center">
                  <svg
                    className="w-3 h-3 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path
                      fillRule="evenodd"
                      d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {media.viewCount}
                </span>
                {media.gameCategory && (
                  <span className="bg-blue-600 px-2 py-1 rounded text-xs">
                    {t(`gameCategories.${media.gameCategory.toLowerCase()}`)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Media metadata below preview */}
      <div className="mt-2">
        <h4 className="font-medium text-sm text-gray-900 truncate">
          {media.title}
        </h4>
        {media.description && (
          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
            {media.description}
          </p>
        )}
        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            {media.uploader && (
              <>
                <img
                  src={media.uploader.profilePictureUrl}
                  alt={media.uploader.displayName}
                  className="w-4 h-4 rounded-full"
                />
                <span>{media.uploader.displayName}</span>
              </>
            )}
          </div>
          <time dateTime={media.createdAt}>
            {new Date(media.createdAt).toLocaleDateString()}
          </time>
        </div>
        {media.tags && media.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {media.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
              >
                #{tag}
              </span>
            ))}
            {media.tags.length > 3 && (
              <span className="text-xs text-gray-500">
                +{media.tags.length - 3} {t("media.preview.moreTags")}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
