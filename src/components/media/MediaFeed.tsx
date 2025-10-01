import React, { useState, useEffect, useCallback, useRef } from "react";
import { useDeepStable, useStableEmptyObject } from "../../hooks/useDeepStable";
import { useTranslation } from "react-i18next";
import { MediaService } from "../../services/MediaService";
import { ConfirmDialog } from "../shared/ConfirmDialog";
import { MediaCard } from "./MediaCard";
import { MediaDetailsModal } from "./MediaDetailsModal";
import type { MediaListItem, MediaFilters } from "../../types";
import { Link } from "react-router-dom";
import { useAppContext } from "../../context/useAppContext";
import { PostService } from "../../services/PostService";
import {
  markUploadPathFailed,
  getAvatarSrc,
  DEFAULT_BLANK_AVATAR,
} from "../../lib/urls";

interface MediaFeedProps {
  filters?: MediaFilters;
  onMediaSelect?: (media: MediaListItem) => void;
  className?: string;
  initialMedia?: MediaListItem[] | null;
}

export const MediaFeed: React.FC<MediaFeedProps> = ({
  filters,
  onMediaSelect,
  className = "",
  initialMedia = null,
}) => {
  const { t } = useTranslation();

  const [media, setMedia] = useState<MediaListItem[]>(initialMedia ?? []);
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
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const [selected, setSelected] = useState<MediaListItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [expandedDescriptions, setExpandedDescriptions] = useState<{
    [id: number]: boolean;
  }>({});
  const { user } = useAppContext();
  const currentUserId = user?.id;

  const [showMenuId, setShowMenuId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState<string>("");
  const [editDescription, setEditDescription] = useState<string>("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteMediaId, setPendingDeleteMediaId] = useState<
    number | null
  >(null);

  const emptyObj = useStableEmptyObject<MediaFilters>();
  const stableFilters = useDeepStable(filters ?? emptyObj);

  const loadMedia = useCallback(
    async (page = 0, append = false) => {
      if (initialMedia) return;
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
          const items = response.media;
          setMedia((prev) => (append ? [...prev, ...items] : items));
          setPagination({
            currentPage: response.currentPage,
            totalPages: response.totalPages,
            totalElements: response.totalElements,
            hasMore: response.currentPage < response.totalPages - 1,
          });
        } else {
          setError(response.message || t("media:gallery.loadError"));
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : t("media:gallery.loadError")
        );
      } finally {
        setLoading(false);
        inFlightRef.current = false;
      }
    },
    [stableFilters, t, initialMedia]
  );

  const loadMore = () => {
    if (initialMedia) return;
    if (pagination.hasMore && !loading) {
      loadMedia(pagination.currentPage + 1, true);
    }
  };

  useEffect(() => {
    if (!sentinelRef.current) return;
    const el = sentinelRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            loadMore();
          }
        });
      },
      { rootMargin: "600px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.hasMore, loading, loadMedia]);

  const handleOpenDetails = (item: MediaListItem) => {
    setMedia((prev) =>
      prev.map((m) =>
        m.id === item.id ? { ...m, viewCount: (m.viewCount ?? 0) + 1 } : m
      )
    );
    setSelected({ ...item, viewCount: (item.viewCount ?? 0) + 1 });
    setModalOpen(true);
  };

  const handleUpdated = (updated: MediaListItem) => {
    setMedia((prev) =>
      prev.map((m) => (m.id === updated.id ? { ...m, ...updated } : m))
    );
  };

  const handleDeleted = (deletedId: number) => {
    setMedia((prev) => prev.filter((m) => m.id !== deletedId));
  };

  const onConfirmDeleteMedia = async () => {
    if (pendingDeleteMediaId == null) return;
    try {
      const res = await MediaService.deleteMedia(pendingDeleteMediaId);
      if (res.success) {
        handleDeleted(pendingDeleteMediaId);
      }
    } catch (err) {
      console.error("Failed to delete media", err);
    } finally {
      setPendingDeleteMediaId(null);
      setConfirmOpen(false);
    }
  };

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      if (!initialMedia) loadMedia();
    }
  }, [loadMedia, initialMedia]);

  // Respond to changes in initialMedia (e.g. search results). When
  // `initialMedia` is provided, show it and disable further list loading.
  useEffect(() => {
    if (initialMedia) {
      setMedia(initialMedia);
      setPagination({
        currentPage: 0,
        totalPages: 1,
        totalElements: initialMedia.length,
        hasMore: false,
      });
    } else {
      // When initialMedia is cleared, reset and allow normal loading
      setMedia([]);
      setPagination({
        currentPage: 0,
        totalPages: 0,
        totalElements: 0,
        hasMore: false,
      });
      // trigger load only if component already mounted
      if (mountedRef.current) loadMedia(0, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialMedia]);

  const lastFilterHashRef = useRef<string | null>(null);
  useEffect(() => {
    const hash = JSON.stringify(stableFilters);
    if (
      mountedRef.current &&
      lastFilterHashRef.current !== null &&
      lastFilterHashRef.current !== hash
    ) {
      lastSignatureRef.current = null;
      if (!initialMedia) setMedia([]);
      setPagination({
        currentPage: 0,
        totalPages: 0,
        totalElements: 0,
        hasMore: false,
      });
      if (!initialMedia) loadMedia(0, false);
    }
    lastFilterHashRef.current = hash;
  }, [stableFilters, loadMedia, initialMedia]);

  if (loading && media.length === 0) {
    return (
      <div className={`media-gallery ${className}`}>
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6fffe9]"></div>
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
              className="w-12 h-12 mx-auto mb-2 text-red-500"
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
            <p className="text-sm text-gray-200">{error}</p>
          </div>
          <button
            onClick={() => loadMedia()}
            className="bg-[#6fffe9] text-black px-4 py-2 rounded hover:bg-[#5ee6d3]"
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
          <h3 className="text-lg font-medium text-gray-200 mb-2">
            {t("media:feed.noMedia", "No media yet")}
          </h3>
          <p className="text-gray-400">
            {t("media:feed.emptyDescription", "No media to display.")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`media-feed ${className}`}>
      <div className={`flex flex-col gap-6`}>
        {media.map((item) => (
          <div key={item.id} className="w-full flex justify-center">
            <div className="w-full lg:w-3/4">
              <div className="flex items-center justify-between mb-2 px-2">
                <Link
                  to={`/profile/${item.uploader.id}`}
                  className="flex items-center gap-3"
                >
                  {(() => {
                    const uploaderProfile = (
                      item.uploader as unknown as { profilePictureUrl?: string }
                    ).profilePictureUrl as string | undefined | null;
                    return (
                      <img
                        src={getAvatarSrc(uploaderProfile)}
                        alt={item.uploader.displayName}
                        className="w-10 h-10 rounded-full object-cover"
                        data-original={uploaderProfile ?? undefined}
                        onError={(e) => {
                          const img = e.target as HTMLImageElement;
                          const orig = img.getAttribute("data-original");
                          markUploadPathFailed(orig ?? undefined);
                          img.src = DEFAULT_BLANK_AVATAR;
                        }}
                      />
                    );
                  })()}
                  <div>
                    <h3 className="font-semibold text-gray-100 text-sm">
                      {item.uploader.displayName}
                    </h3>
                    <p className="text-gray-400 text-xs">
                      {PostService.getTimeAgo(item.createdAt)}
                    </p>
                  </div>
                </Link>

                {/* Three-dots menu similar to posts */}
                <div className="relative">
                  <button
                    onClick={() =>
                      setShowMenuId(showMenuId === item.id ? null : item.id)
                    }
                    className="text-gray-400 hover:text-gray-200 p-1 rounded-full hover:bg-[rgba(255,255,255,0.02)]"
                    aria-label={t("media:menu")}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                  </button>

                  {showMenuId === item.id && (
                    <div
                      className={`absolute ${
                        typeof window !== "undefined" &&
                        document.documentElement.dir === "rtl"
                          ? "left-0"
                          : "right-0"
                      } mt-1 w-44 bg-[rgba(11,19,43,0.9)] rounded-md shadow-lg border border-[rgba(255,255,255,0.04)] z-10`}
                    >
                      <div className="py-1">
                        {/* Owner-only edit */}
                        {currentUserId === item.uploader.id && (
                          <button
                            onClick={() => {
                              setEditingId(item.id);
                              setEditTitle(item.title || "");
                              setEditDescription(
                                (item as unknown as { description?: string })
                                  .description || ""
                              );
                              setShowMenuId(null);
                            }}
                            className="block px-4 py-2 text-sm text-gray-200 hover:bg-[rgba(255,255,255,0.02)] w-full text-left"
                          >
                            {t("media:edit") || "Edit"}
                          </button>
                        )}

                        <button
                          onClick={() => {
                            try {
                              navigator.clipboard.writeText(
                                `${window.location.origin}/media/${item.id}`
                              );
                            } catch {
                              // ignore
                            }
                            setShowMenuId(null);
                          }}
                          className="block px-4 py-2 text-sm text-gray-200 hover:bg-[rgba(255,255,255,0.02)] w-full text-left"
                        >
                          {t("media:copyLink") || "Copy link"}
                        </button>

                        {currentUserId === item.uploader.id && (
                          <button
                            onClick={() => {
                              setShowMenuId(null);
                              setPendingDeleteMediaId(item.id);
                              setConfirmOpen(true);
                            }}
                            className="block px-4 py-2 text-sm text-red-400 hover:bg-[rgba(239,68,68,0.06)] w-full text-left"
                          >
                            {t("media:delete") || "Delete"}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Title / Description / Tags moved above the media (Facebook-like) */}
              {(() => {
                const itemDesc = (item as unknown as { description?: string })
                  .description;
                const itemCandidate = item as unknown as { tags?: unknown };
                const itemTags = Array.isArray(itemCandidate.tags)
                  ? (itemCandidate.tags as string[])
                  : [];

                return editingId === item.id ? (
                  <div className="p-4 bg-[rgba(255,255,255,0.02)] mb-2">
                    <div className="mb-2">
                      <input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full px-3 py-2 rounded bg-white/5 border border-white/10 outline-none focus:ring-2 focus:ring-[#6fffe9]"
                        placeholder={t("media:upload.title")}
                      />
                    </div>
                    <div className="mb-3">
                      <textarea
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 rounded bg-white/5 border border-white/10 outline-none focus:ring-2 focus:ring-[#6fffe9]"
                        placeholder={t("media:upload.description")}
                      />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => {
                          setEditingId(null);
                          setEditTitle("");
                          setEditDescription("");
                        }}
                        className="px-3 py-1.5 rounded bg-white/10 text-white"
                      >
                        {t("common.cancel")}
                      </button>
                      <button
                        onClick={async () => {
                          try {
                            const data = await MediaService.updateMedia(
                              item.id,
                              {
                                title: editTitle || undefined,
                                description: editDescription || undefined,
                              }
                            );
                            if (data.success) {
                              handleUpdated({
                                id: data.media.id,
                                title: data.media.title,
                                thumbnailPath: data.media.thumbnailPath,
                                mediaType: data.media.mediaType,
                                duration: (data.media as { duration?: number })
                                  .duration,
                                gameCategory: String(
                                  data.media.gameCategory || ""
                                ),
                                viewCount: data.media.viewCount,
                                uploader: data.media.uploader as {
                                  id: number;
                                  displayName: string;
                                },
                                createdAt: data.media.createdAt,
                              });
                              setEditingId(null);
                            }
                          } catch (err) {
                            console.error("Failed to update media", err);
                          }
                        }}
                        className="px-3 py-1.5 rounded bg-[#6fffe9] text-black"
                      >
                        {t("common.save")}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mb-3 px-2 text-left">
                    <h4 className="font-semibold text-base text-white truncate mx-auto text-center">
                      {item.title}
                    </h4>
                    {itemDesc &&
                      (() => {
                        const isExpanded = !!expandedDescriptions[item.id];
                        const short =
                          itemDesc.length > 180
                            ? itemDesc.slice(0, 180) + "..."
                            : itemDesc;
                        return (
                          <div className="mt-1">
                            <p className="text-sm text-white text-left whitespace-pre-wrap break-words max-w-full">
                              {isExpanded ? itemDesc : short}
                            </p>
                            {itemDesc.length > 180 && (
                              <button
                                onClick={() =>
                                  setExpandedDescriptions((prev) => ({
                                    ...prev,
                                    [item.id]: !prev[item.id],
                                  }))
                                }
                                className="text-xs text-[#6fffe9] mt-1"
                              >
                                {isExpanded
                                  ? t("common.hide", "Hide")
                                  : t("common.readMore", "Read more")}
                              </button>
                            )}
                          </div>
                        );
                      })()}
                    {itemTags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {itemTags.slice(0, 3).map((tag, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center px-2 py-1 rounded-full text-sm font-medium bg-[rgba(111,255,233,0.06)] text-[#6fffe9]"
                          >
                            #{tag}
                          </span>
                        ))}
                        {itemTags.length > 3 && (
                          <span className="text-xs text-gray-400">
                            +{itemTags.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })()}

              <div className="cursor-pointer bg-white/3 border border-white/6 rounded-lg overflow-hidden">
                {/* Build a minimal Media object from MediaListItem so MediaCard has required fields */}
                <MediaCard
                  media={{
                    id: item.id,
                    title: item.title,
                    description: "",
                    originalFilename: "",
                    storedFilename: "",
                    // For VIDEO items prefer the actual video file as filePath so
                    // the <video> element has a playable source. Use thumbnailPath
                    // as the poster instead. For images, keep thumbnail as source.
                    filePath:
                      item.mediaType === "VIDEO"
                        ? (item as unknown as { storedFilename?: string })
                            .storedFilename
                          ? `/uploads/media/${
                              (item as unknown as { storedFilename?: string })
                                .storedFilename
                            }`
                          : `/uploads/media/${item.id}`
                        : item.thumbnailPath ||
                          ((item as unknown as { storedFilename?: string })
                            .storedFilename
                            ? `/uploads/media/${
                                (item as unknown as { storedFilename?: string })
                                  .storedFilename
                              }`
                            : `/uploads/media/${item.id}`),
                    mediaType: item.mediaType,
                    fileSize: 0,
                    compressedSize: undefined,
                    compressionRatio: undefined,
                    thumbnailPath: item.thumbnailPath,
                    duration: item.duration,
                    resolution: undefined,
                    tags: [],
                    gameCategory: item.gameCategory,
                    visibility: "PUBLIC",
                    viewCount: item.viewCount ?? 0,
                    downloadCount: 0,
                    uploader: {
                      id: item.uploader.id,
                      displayName: item.uploader.displayName,
                    },
                    createdAt: item.createdAt,
                    updatedAt: undefined,
                  }}
                  onClick={() => {
                    onMediaSelect?.(item);
                    handleOpenDetails(item);
                  }}
                  showControls={false}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {!initialMedia && <div ref={sentinelRef} className="h-1" />}

      {media.length > 0 && !initialMedia && (
        <div className="text-center mt-4 text-sm text-gray-600">
          {t("media:feed.showing", {
            count: media.length,
            total: pagination.totalElements,
          })}
        </div>
      )}

      <ConfirmDialog
        open={confirmOpen}
        title={t("media:feed.confirmTitle")}
        message={t("media:feed.confirmDelete")}
        onConfirm={onConfirmDeleteMedia}
        onCancel={() => {
          setPendingDeleteMediaId(null);
          setConfirmOpen(false);
        }}
      />

      <MediaDetailsModal
        media={selected}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
};

export default MediaFeed;
