import React, { useEffect, useMemo, useState } from "react";
import { MediaService } from "../../services/MediaService";
import {
  getUploadUrl,
  getAlternateUploadUrl,
  markUploadPathFailed,
  DEFAULT_BLANK_AVATAR,
} from "../../lib/urls";

interface AvatarImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  /**
   * Backend-returned value which may be either a path ("/uploads/...")
   * or a stringified numeric media id ("123") or a data/absolute URL.
   */
  source?: string | null;
}

// Simple in-memory cache to avoid refetching media metadata repeatedly
const resolvedCache = new Map<string, string | null>();

export default function AvatarImage({
  source,
  alt,
  ...imgProps
}: AvatarImageProps) {
  const [src, setSrc] = useState<string>(DEFAULT_BLANK_AVATAR);
  const [triedAlternate, setTriedAlternate] = useState(false);

  const normalizedKey = useMemo(() => {
    if (!source) return "";
    return source.toString();
  }, [source]);

  useEffect(() => {
    let mounted = true;
    setTriedAlternate(false);

    async function resolve() {
      if (!normalizedKey) {
        if (mounted) setSrc(DEFAULT_BLANK_AVATAR);
        return;
      }

      // If it looks like an id (all digits), try fetching media metadata
      const isId = /^\d+$/i.test(normalizedKey);

      // Use cache if present
      if (resolvedCache.has(normalizedKey)) {
        const cached = resolvedCache.get(normalizedKey) as string | null;
        if (mounted) setSrc(cached ?? DEFAULT_BLANK_AVATAR);
        return;
      }

      try {
        let candidatePath: string | null = null;

        if (isId) {
          const mediaId = parseInt(normalizedKey, 10);
          try {
            const resp = await MediaService.getMedia(mediaId);
            if (resp && resp.media) {
              // prefer thumbnailPath if available
              candidatePath =
                resp.media.thumbnailPath || resp.media.filePath || null;
            }
          } catch {
            // ignore - fallback to treating it as path
            candidatePath = null;
          }
        }

        // If not resolved via media id, treat source as path/url
        if (!candidatePath) {
          candidatePath = normalizedKey;
        }

        // If it's already an absolute URL or data URL, use it directly
        if (
          /^https?:\/\//i.test(candidatePath) ||
          candidatePath.startsWith("data:")
        ) {
          resolvedCache.set(normalizedKey, candidatePath);
          if (mounted) setSrc(candidatePath);
          return;
        }

        // Build absolute upload URL (root) first
        const rootUrl = getUploadUrl(candidatePath);
        const altUrl = getAlternateUploadUrl(candidatePath);

        // Do not cache immediately: we need to confirm the URL is reachable.
        if (rootUrl) {
          if (mounted) setSrc(rootUrl);
          // we'll let onError handler try altUrl, then mark failed only if both fail
          resolvedCache.set(normalizedKey, rootUrl);
        } else if (altUrl) {
          if (mounted) setSrc(altUrl);
          resolvedCache.set(normalizedKey, altUrl);
        } else {
          resolvedCache.set(normalizedKey, null);
          if (mounted) setSrc(DEFAULT_BLANK_AVATAR);
        }
      } catch {
        resolvedCache.set(normalizedKey, null);
        if (mounted) setSrc(DEFAULT_BLANK_AVATAR);
      }
    }

    resolve();

    return () => {
      mounted = false;
    };
  }, [normalizedKey]);

  return (
    <img
      {...imgProps}
      src={src}
      alt={alt}
      data-original={source ?? undefined}
      onError={(e) => {
        const img = e.currentTarget as HTMLImageElement;
        const orig = img.getAttribute("data-original") || undefined;
        // If we haven't tried the /api alternate yet, try it first
        if (!triedAlternate && orig) {
          const altUrl = getAlternateUploadUrl(orig);
          if (altUrl && img.src !== altUrl) {
            setTriedAlternate(true);
            img.src = altUrl;
            return;
          }
        }

        // If we already tried alternate or no alternate exists, attempt a retry
        // after a short delay to allow server to finish writing the file.
        if (orig && triedAlternate) {
          // Try again after a small backoff before failing permanently.
          setTimeout(() => {
            try {
              const rootUrl = getUploadUrl(orig);
              const altUrl2 = getAlternateUploadUrl(orig);
              if (altUrl2 && img.src !== altUrl2) {
                img.src = altUrl2;
                return;
              }
              if (rootUrl && img.src !== rootUrl) {
                img.src = rootUrl;
                return;
              }
            } catch {
              /* ignore */
            }
            // If still failing, mark and fall back
            try {
              markUploadPathFailed(orig);
            } catch {
              /* ignore */
            }
            img.src = DEFAULT_BLANK_AVATAR;
          }, 800);
          return;
        }

        // Finally fallback for other cases
        try {
          markUploadPathFailed(orig);
        } catch {
          /* ignore */
        }
        img.src = DEFAULT_BLANK_AVATAR;
      }}
    />
  );
}
