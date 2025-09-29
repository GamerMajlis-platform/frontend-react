import { useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { MediaService } from "../../services/MediaService";
import type { Media } from "../../types";
import { getMediaUrl } from "../../lib/urls";

// Map common file extensions to MIME types for video sources
function getVideoMimeType(nameOrUrl?: string | null): string {
  if (!nameOrUrl) return "video/mp4";
  const m = nameOrUrl.match(/\.([a-z0-9]+)(\?|#|$)/i);
  const ext = m ? m[1].toLowerCase() : "mp4";
  switch (ext) {
    case "mp4":
      return "video/mp4";
    case "mov":
      return "video/quicktime";
    case "avi":
      return "video/x-msvideo";
    default:
      return "video/mp4";
  }
}

interface MediaCardProps {
  media: Media;
  onClick?: () => void;
  showControls?: boolean;
  className?: string;
}

export const MediaCard: React.FC<MediaCardProps> = ({
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

  // Allow inline play on click for feed previews when controls are hidden.
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Attempt to trigger resource fetch when src/poster change by calling
  // load() on the video element. Browsers still control fetching but this
  // helps in many cases alongside preload="auto".
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    try {
      v.load();
    } catch {
      /* ignore */
    }
  }, [media.thumbnailPath, media.filePath]);

  const handleInlineClick = async () => {
    // If the consumer provided an onClick (which opens modal), prefer that
    // behavior when showControls is explicitly disabled in the parent.
    if (onClick) {
      // Still attempt inline play when there are no controls visible.
      if (!showControls && videoRef.current) {
        try {
          if (videoRef.current.paused) {
            await videoRef.current.play();
            videoRef.current.controls = true; // reveal controls once playing
            handleViewIncrement();
          } else {
            videoRef.current.pause();
          }
        } catch {
          // Play may fail (autoplay policies), fallback to opening details
          onClick();
        }
        return;
      }
      // If controls are visible, delegate to provided onClick
      onClick();
      return;
    }

    // No onClick provided: perform inline toggle
    if (videoRef.current) {
      try {
        if (videoRef.current.paused) {
          await videoRef.current.play();
          videoRef.current.controls = true;
          handleViewIncrement();
        } else {
          videoRef.current.pause();
        }
      } catch {
        /* ignore playback errors */
      }
    }
  };

  const renderMedia = () => {
    const poster = getMediaUrl(media.thumbnailPath) || undefined;
    const src = getMediaUrl(media.filePath) || media.filePath;
    // Determine MIME type from storedFilename (preferred) or from src
    const fileNameCandidate =
      (media as unknown as { storedFilename?: string }).storedFilename || src;
    const mimeType = getVideoMimeType(fileNameCandidate);

    if (media.mediaType === "VIDEO") {
      return (
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          poster={poster}
          controls={showControls}
          preload="auto"
          playsInline
          muted
          onPlay={handleViewIncrement}
          onClick={handleInlineClick}
        >
          <source src={src} type={mimeType} />
          {t("media:preview.videoNotSupported")}
        </video>
      );
    } else {
      return (
        <img
          src={src}
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

  // uploader info is intentionally shown outside the media card (in the feed)

  return (
    <div className={`media-preview group ${className}`}>
      <div
        className={`bg-[rgba(255,255,255,0.03)] rounded-xl shadow border border-[rgba(255,255,255,0.06)] overflow-hidden transform transition-all duration-200 group-hover:scale-[1.01]`}
      >
        <div className="aspect-video bg-gray-900 relative overflow-hidden">
          {media.mediaType === "VIDEO" && (
            <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-black bg-opacity-40 flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-white"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            </div>
          )}

          <div className="w-full h-full overflow-hidden">
            <div className="w-full h-full transform transition-transform duration-500 group-hover:scale-105">
              {renderMedia()}
            </div>
          </div>
        </div>

        {/* Intentionally keep the media container minimal. Metadata is rendered by the parent feed. */}
      </div>
    </div>
  );
};

export default MediaCard;
