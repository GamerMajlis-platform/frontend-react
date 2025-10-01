import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { MediaService } from "../../services/MediaService";
import { getMediaUrl } from "../../lib/urls";
import type { MediaListItem, MediaResponse } from "../../types";

interface MediaDetailsModalProps {
  media: MediaListItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const MediaDetailsModal: React.FC<MediaDetailsModalProps> = ({
  media,
  isOpen,
  onClose,
}) => {
  const { t } = useTranslation();
  const [details, setDetails] = useState<MediaResponse["media"] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mediaId = media?.id;

  useEffect(() => {
    if (!isOpen || !mediaId) return;
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await MediaService.getMedia(mediaId);
        if (!mounted) return;
        if (data.success) {
          setDetails(data.media);
        } else {
          setError(data.message || t("media:details.loadError"));
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : t("media:details.loadError"));
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [isOpen, mediaId, t]);

  const fileUrl = useMemo(() => {
    if (!mediaId) return "";
    // Prefer canonical filePath returned in details (e.g. "/uploads/media/...")
    // normalized via getMediaUrl. If that's missing, fall back to a simple
    // uploads path based on id (static, predictable) so images/videos still load.
    const fromDetails = getMediaUrl(details?.filePath || null);
    if (fromDetails) return fromDetails;

    // If backend returned a storedFilename, use it (preferred), otherwise
    // fall back to a predictable uploads path using the id.
    const detailsWithFilename = details as unknown as {
      storedFilename?: string;
    } | null;
    const storedFilename = detailsWithFilename?.storedFilename;
    if (storedFilename)
      return getMediaUrl(`/uploads/media/${storedFilename}`) || "";

    return getMediaUrl(`/uploads/media/${mediaId}`) || "";
  }, [mediaId, details]);

  // (no variants/quality selector by default)

  if (!isOpen || !media) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative bg-[#0b132b] border border-white/10 rounded-xl w-[min(100%,1000px)] max-h-[90vh] overflow-hidden shadow-xl">
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
          <h3 className="text-white font-semibold text-lg truncate max-w-[90%]">
            {details?.title || media.title}
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-sm rounded bg-white/10 text-white hover:bg-white/20"
            >
              {t("common.close")}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-white">
            {t("common.loading")}
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-400">{error}</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            <div className="bg-black flex flex-col items-stretch justify-center aspect-video lg:aspect-auto lg:min-h-[60vh]">
              {media.mediaType === "VIDEO" ? (
                <>
                  <video
                    className="w-full h-full"
                    controls
                    poster={getMediaUrl(details?.thumbnailPath) || undefined}
                  >
                    <source src={fileUrl} />
                  </video>
                </>
              ) : (
                <img
                  src={fileUrl}
                  alt={details?.title || media.title}
                  className="w-full h-full object-contain"
                />
              )}
            </div>
            <div className="p-5 text-white space-y-4 overflow-y-auto lg:max-h-[60vh]">
              {details?.description && (
                <p className="text-white/80 whitespace-pre-wrap break-words max-w-full">
                  {details.description}
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                {(Array.isArray(details?.tags)
                  ? (details?.tags as string[])
                  : typeof details?.tags === "string"
                  ? (details?.tags as string).split(",").map((s) => s.trim())
                  : []
                )
                  .filter(Boolean)
                  .map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 rounded-full text-xs bg-white/10"
                    >
                      #{tag}
                    </span>
                  ))}
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm text-white/80">
                <div>
                  <span className="text-white/50">
                    {t("media:details.type")}:
                  </span>{" "}
                  {media.mediaType}
                </div>
                <div>
                  <span className="text-white/50">
                    {t("media:details.category")}:
                  </span>{" "}
                  {String(details?.gameCategory || "-")}
                </div>
                <div>
                  <span className="text-white/50">
                    {t("media:details.visibility")}:
                  </span>{" "}
                  {String(details?.visibility || "PUBLIC")}
                </div>
                <div>
                  <span className="text-white/50">
                    {t("media:details.views")}:
                  </span>{" "}
                  {details?.viewCount ?? media.viewCount ?? 0}
                </div>
                {details?.fileSize !== undefined && (
                  <div>
                    <span className="text-white/50">
                      {t("media:details.size")}:
                    </span>{" "}
                    {MediaService.formatFileSize(details.fileSize)}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaDetailsModal;
