import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { UserStorage } from "../../lib/userStorage";

interface AvatarModalProps {
  src: string;
  onClose: () => void;
}

export default function AvatarModal({ src, onClose }: AvatarModalProps) {
  const { t } = useTranslation();
  const [imgSize, setImgSize] = useState<{ w: number; h: number } | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Defensive: if document isn't available (SSR), render null
  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[20000] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-[90vw] max-h-[90vh] bg-[#071226] rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label={t("common.close")}
          className="absolute top-3 right-3 z-20 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/40"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="flex flex-col lg:flex-row items-center lg:items-stretch h-full w-full">
          <div className="flex-1 flex items-center justify-center p-4 lg:p-6 overflow-auto">
            <img
              src={src}
              alt={t("profile:avatarLargeAlt", "Profile image")}
              className="max-w-full max-h-[80vh] object-contain"
              onLoad={(e) => {
                const tgt = e.currentTarget as HTMLImageElement;
                setImgSize({ w: tgt.naturalWidth, h: tgt.naturalHeight });
              }}
            />
          </div>

          <div className="w-full lg:w-64 flex-shrink-0 bg-gradient-to-t from-black/30 to-transparent p-4 lg:p-6 flex flex-col items-center gap-4">
            {imgSize && (
              <div className="text-sm font-mono text-white/80">
                {imgSize.w} × {imgSize.h} px
              </div>
            )}

            <div className="w-full flex flex-col gap-3">
              <a
                href={src}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-white/10 text-white px-3 py-2 hover:bg-white/20"
                aria-label={t("profile:openOriginal", "Open")}
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
                <span>Open</span>
              </a>

              <button
                type="button"
                onClick={async (e) => {
                  e.preventDefault();
                  try {
                    const token = UserStorage.getStoredToken();
                    const headers: Record<string, string> = {};
                    if (token) headers["Authorization"] = `Bearer ${token}`;

                    const resp = await fetch(src, {
                      method: "GET",
                      headers,
                      // include credentials in case cookie-based auth is used
                      credentials: "include",
                    });

                    if (!resp.ok) {
                      throw new Error(
                        `Failed to fetch image: ${resp.status} ${resp.statusText}`
                      );
                    }

                    const blob = await resp.blob();

                    // Try to infer a filename from the URL; fall back to a generic name
                    let filename = "avatar";
                    try {
                      const u = new URL(src);
                      const parts = u.pathname.split("/").filter(Boolean);
                      const last = parts[parts.length - 1];
                      if (last) filename = last;
                    } catch {
                      // ignore
                    }

                    // If filename has no extension, try to use the blob type
                    if (!/\.[a-zA-Z0-9]+$/.test(filename)) {
                      const mime = blob.type || "image/png";
                      const ext = mime.split("/")[1] || "png";
                      filename = `${filename}.${ext}`;
                    }

                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = filename;
                    // append + click to trigger download
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                    // release blob url
                    URL.revokeObjectURL(url);
                  } catch (err: unknown) {
                    console.error("Download failed", err);
                    // Simple user feedback; project may use a toast system instead
                    const msg =
                      err instanceof Error ? err.message : String(err);
                    window.alert(msg || "Download failed");
                  }
                }}
                className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-white/10 text-white px-3 py-2 hover:bg-white/20"
                aria-label={t("profile:download", "Download")}
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span>Download</span>
              </button>

              {/* Remove button intentionally removed; only Open and Download remain */}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
