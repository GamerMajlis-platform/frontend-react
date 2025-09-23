import React, { useState, useEffect, useCallback, useRef } from "react";
import { useDeepStable, useStableEmptyObject } from "../../hooks/useDeepStable";
import { useTranslation } from "react-i18next";
import { MediaService } from "../../services/MediaService";
import { MediaPreview } from "./MediaPreview";
import type { MediaListItem, MediaFilters } from "../../types";

interface MediaGalleryProps {
  filters?: MediaFilters;
  onMediaSelect?: (media: MediaListItem) => void;
  className?: string;
  gridCols?: "auto" | 2 | 3 | 4 | 6;
}

export const MediaGallery: React.FC<MediaGalleryProps> = ({
  filters,
  onMediaSelect,
  className = "",
  gridCols = "auto",
}) => {
  const { t } = useTranslation();

  const [media, setMedia] = useState<MediaListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
    hasMore: false,
  });

  const inFlightRef = useRef(false);
  const lastSignatureRef = useRef<string | null>(null);
  const mountedRef = useRef(false);

  const emptyObj = useStableEmptyObject<MediaFilters>();
  const stableFilters = useDeepStable(filters ?? emptyObj);

  const loadMedia = useCallback(
    async (page = 0, append = false) => {
      if (inFlightRef.current) return;
      const signature = JSON.stringify({ stableFilters, page, append });
      if (!append && lastSignatureRef.current === signature) return;
      inFlightRef.current = true;
      try {
        setLoading(true);
        setError(null);

        const response = await MediaService.getMediaList({
          ...stableFilters,
          page,
          size: 20,
        });

        if (response.success) {
          lastSignatureRef.current = signature;
          // Media list items do not include tags field; use response directly
          const items = response.media;
          setMedia((prev) => (append ? [...prev, ...items] : items));
          setPagination({
            currentPage: response.currentPage,
            totalPages: response.totalPages,
            totalElements: response.totalElements,
            hasMore: response.currentPage < response.totalPages - 1,
          });
        } else {
          setError(response.message || t("media.gallery.loadError"));
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : t("media.gallery.loadError")
        );
      } finally {
        setLoading(false);
        inFlightRef.current = false;
      }
    },
    [stableFilters, t]
  );

  const loadMore = () => {
    if (pagination.hasMore && !loading) {
      loadMedia(pagination.currentPage + 1, true);
    }
  };

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      loadMedia();
    }
  }, [loadMedia]);

  // React to filter changes
  const lastFilterHashRef = useRef<string | null>(null);
  useEffect(() => {
    const hash = JSON.stringify(stableFilters);
    if (
      mountedRef.current &&
      lastFilterHashRef.current !== null &&
      lastFilterHashRef.current !== hash
    ) {
      lastSignatureRef.current = null;
      setMedia([]);
      setPagination({
        currentPage: 0,
        totalPages: 0,
        totalElements: 0,
        hasMore: false,
      });
      loadMedia(0, false);
    }
    lastFilterHashRef.current = hash;
  }, [stableFilters, loadMedia]);

  const getGridClasses = () => {
    switch (gridCols) {
      case 2:
        return "grid-cols-2";
      case 3:
        return "grid-cols-3";
      case 4:
        return "grid-cols-4";
      case 6:
        return "grid-cols-6";
      default:
        return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
    }
  };

  if (loading && media.length === 0) {
    return (
      <div className={`media-gallery ${className}`}>
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`media-gallery ${className}`}>
        <div className="text-center py-8">
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
            onClick={() => loadMedia()}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {t("common.retry")}
          </button>
        </div>
      </div>
    );
  }

  if (media.length === 0) {
    return (
      <div className={`media-gallery ${className}`}>
        <div className="text-center py-8">
          <svg
            className="w-12 h-12 mx-auto mb-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 110 2h-1v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6H3a1 1 0 110-2h4zM6 6v12h12V6H6zm3 3a1 1 0 112 0v6a1 1 0 11-2 0V9zm4 0a1 1 0 112 0v6a1 1 0 11-2 0V9z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {t("media.gallery.noMedia")}
          </h3>
          <p className="text-gray-600">
            {t("media.gallery.noMediaDescription")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`media-gallery ${className}`}>
      <div className={`grid ${getGridClasses()} gap-4`}>
        {media.map((item) => (
          <div key={item.id} className="cursor-pointer">
            <MediaPreview
              media={{
                ...item,
                description: "",
                originalFilename: "",
                storedFilename: "",
                filePath: `/api/media/${item.id}/file`,
                fileSize: 0,
                tags: [],
                visibility: "PUBLIC",
                downloadCount: 0,
                createdAt: item.createdAt,
              }}
              onClick={() => onMediaSelect?.(item)}
              showControls={false}
            />
          </div>
        ))}
      </div>

      {pagination.hasMore && (
        <div className="flex justify-center mt-8">
          <button
            onClick={loadMore}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? t("common.loading") : t("media.gallery.loadMore")}
          </button>
        </div>
      )}

      {media.length > 0 && (
        <div className="text-center mt-4 text-sm text-gray-600">
          {t("media.gallery.showing", {
            count: media.length,
            total: pagination.totalElements,
          })}
        </div>
      )}
    </div>
  );
};
