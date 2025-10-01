import { useRef, useEffect, useState } from "react";
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
  const containerRef = useRef<HTMLDivElement | null>(null);
  // Track whether the user manually paused playback so the observer doesn't
  // restart it automatically. Distinguish programmatic pauses so we don't
  // treat observer-triggered pauses as user intent.
  const manualPauseRef = useRef(false);
  const programmaticPauseRef = useRef(false);
  const programmaticPlayRef = useRef(false);
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

  const [isPaused, setIsPaused] = useState(true);

  // Autoplay when the media card enters the viewport and pause when it leaves.
  useEffect(() => {
    if (media.mediaType !== "VIDEO") return;
    const el = containerRef.current;
    const video = videoRef.current;
    if (!el || !video) return;

    let observer: IntersectionObserver | null = null;
    try {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            // Use a reasonable visibility threshold so small partials don't autoplay.
            const visible =
              entry.isIntersecting && entry.intersectionRatio >= 0.5;
            if (visible) {
              // Only autoplay if the user has NOT manually paused the video.
              if (!manualPauseRef.current && video.paused) {
                programmaticPlayRef.current = true;
                video
                  .play()
                  .then(() => {
                    setIsPaused(false);
                    programmaticPlayRef.current = false;
                    // onPlay handler will increment views
                  })
                  .catch(() => {
                    programmaticPlayRef.current = false;
                    // ignore playback failures (policies, etc.)
                  });
              }
            } else {
              if (!video.paused) {
                // Mark this as a programmatic pause so onPause handler doesn't
                // treat it as a user-initiated pause.
                programmaticPauseRef.current = true;
                try {
                  video.pause();
                } catch {
                  /* ignore */
                }
                // setIsPaused will be handled in onPause
              }
            }
          });
        },
        { threshold: [0.5] }
      );
      observer.observe(el);
    } catch {
      /* IntersectionObserver may not be available in some environments */
    }

    return () => {
      if (observer && el) observer.unobserve(el);
      observer = null;
    };
  }, [media.mediaType, media.filePath]);

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
          onLoadedMetadata={() => {
            const v = videoRef.current;
            if (v) setIsPaused(!!v.paused);
          }}
          onPlay={() => {
            // If this play was triggered programmatically we clear that flag,
            // otherwise treat it as a user-initiated play and clear manual pause.
            if (programmaticPlayRef.current) {
              programmaticPlayRef.current = false;
            } else {
              manualPauseRef.current = false;
            }
            handleViewIncrement();
            setIsPaused(false);
          }}
          onPause={() => {
            // If this pause was programmatic (e.g. leaving viewport) clear the
            // programmatic flag and don't mark it as a user pause. Otherwise
            // the user intentionally paused and we should respect it.
            if (programmaticPauseRef.current) {
              programmaticPauseRef.current = false;
            } else {
              manualPauseRef.current = true;
            }
            setIsPaused(true);
          }}
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
      <div className="bg-[rgba(255,255,255,0.03)] rounded-xl shadow border border-[rgba(255,255,255,0.06)] overflow-hidden transition-shadow duration-200 hover:shadow-xl">
        <div
          ref={containerRef}
          className="aspect-video bg-gray-900 relative overflow-hidden"
        >
          {/* decorative overlay removed to avoid conflicting with interactive overlay */}

          <div className="w-full h-full overflow-hidden">
            <div className="w-full h-full">
              {renderMedia()}

              {/* Overlay play/pause button: visible when paused and when media is VIDEO */}
              {media.mediaType === "VIDEO" && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleInlineClick();
                    }}
                    aria-label={isPaused ? "Play" : "Pause"}
                    className={`pointer-events-auto w-12 h-12 rounded-full bg-black bg-opacity-40 flex items-center justify-center transition-opacity duration-200 ${
                      isPaused ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    {isPaused ? (
                      <svg
                        className="w-6 h-6 text-white"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    ) : (
                      <svg
                        className="w-6 h-6 text-white"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                      </svg>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Intentionally keep the media container minimal. Metadata is rendered by the parent feed. */}
      </div>
    </div>
  );
};

export default MediaCard;
