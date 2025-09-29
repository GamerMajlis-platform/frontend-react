import { API_CONFIG } from "../config/constants";

/**
 * Convert a backend-returned path (e.g. "/uploads/profile-pictures/xxx.jpg")
 * into an absolute URL that points at the server root (not the API prefix).
 *
 * The project uses VITE_API_BASE_URL or API_CONFIG.baseUrl which commonly
 * contains an "/api" prefix (e.g. http://localhost:8080/api). Static files
 * are served from the server root (http://localhost:8080/uploads/...), so
 * this helper strips a trailing "/api" when present.
 */
export function getUploadUrl(path?: string | null): string | null {
  if (!path) return null;

  // If already an absolute URL or data: URL, return as-is
  if (/^https?:\/\//i.test(path) || path.startsWith("data:")) return path;

  const rawBase =
    (import.meta.env.VITE_API_BASE_URL as string) || API_CONFIG.baseUrl;

  // Keep the configured API base as-is (including any trailing "/api")
  // and only trim a trailing slash. Uploads are served under the API prefix
  // in our deployment so we must not strip `/api` here.
  const base = rawBase.replace(/\/$/, "");

  // Ensure path starts with '/'
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${base}${normalizedPath}`;
}

/**
 * Build an alternate uploads URL that includes an "/api" segment in case the
 * backend serves static uploads under the API prefix (e.g. http://host:8080/api/uploads/...).
 * This is used as an onError fallback when the root uploads path returns 404.
 */
export function getAlternateUploadUrl(path?: string | null): string | null {
  if (!path) return null;
  if (/^https?:\/\//i.test(path) || path.startsWith("data:")) return path;

  const rawBase =
    (import.meta.env.VITE_API_BASE_URL as string) || API_CONFIG.baseUrl;

  const baseTrimmed = rawBase.replace(/\/$/, "");
  const hasApi = /\/api$/i.test(baseTrimmed);
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return hasApi
    ? `${baseTrimmed}${normalizedPath}`
    : `${baseTrimmed}/api${normalizedPath}`;
}

/**
 * Poll the server until a newly uploaded file becomes reachable (some backends
 * write files asynchronously). Tries both root and /api variants.
 */
export async function waitForUploadAvailable(
  path: string,
  opts: { timeoutMs?: number; intervalMs?: number } = {}
): Promise<string | null> {
  const timeoutMs = opts.timeoutMs ?? 4000;
  const intervalMs = opts.intervalMs ?? 300;
  const start = Date.now();

  const candidates = [getUploadUrl(path), getAlternateUploadUrl(path)].filter(
    Boolean
  ) as string[];

  while (Date.now() - start < timeoutMs) {
    for (const url of candidates) {
      try {
        const res = await fetch(url, { method: "HEAD" });
        if (res.ok) return url;
      } catch {
        /* ignore network blips */
      }
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  return null;
}

// In-memory cache of failed upload/static URLs (store normalized path)
const failedUploadPaths = new Set<string>();

/**
 * Mark a backend-returned path (e.g. "/uploads/...") as failed so the
 * frontend will stop attempting to load it repeatedly and fall back to default.
 */
export function markUploadPathFailed(path?: string | null) {
  if (!path) return;
  // Normalize stored key to start with '/'
  const key = path.startsWith("/") ? path : `/${path}`;
  failedUploadPaths.add(key);
}

/**
 * Check whether a path has been marked as failed
 */
export function isUploadPathFailed(path?: string | null): boolean {
  if (!path) return true;
  const key = path.startsWith("/") ? path : `/${path}`;
  return failedUploadPaths.has(key);
}

/**
 * Remove a path from the failed cache so the frontend will try to load it again.
 * Use this after a successful upload to clear any earlier failure state for
 * the same backend-returned path.
 */
export function unmarkUploadPathFailed(path?: string | null) {
  if (!path) return;
  const key = path.startsWith("/") ? path : `/${path}`;
  failedUploadPaths.delete(key);
}

// A minimal blank avatar represented as an inline SVG data URL. This mirrors
// the simple avatar glyph used in the profile dropdown and avoids depending on
// an external `/assets/default-avatar.png` file which may be missing.
export const DEFAULT_BLANK_AVATAR =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24">
      <rect width="100%" height="100%" fill="none" />
      <g fill="none" stroke="#1C2541" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
        <!-- Smaller head -->
        <circle cx="12" cy="8.2" r="2.8" />
        <!-- Slim shoulders / torso curve -->
        <path d="M4.5 20c1.5-4 3.5-5.3 7.5-5.3s6 1.3 7.5 5.3" />
      </g>
    </svg>
  `);

/**
 * Get a safe avatar src to use in <img>. Returns an absolute upload URL when
 * available and not previously marked as failed, otherwise returns a blank
 * inline SVG avatar data URL.
 */
export function getAvatarSrc(path?: string | null): string {
  if (!path) return DEFAULT_BLANK_AVATAR;
  if (isUploadPathFailed(path)) return DEFAULT_BLANK_AVATAR;
  const url = getUploadUrl(path);
  return url || DEFAULT_BLANK_AVATAR;
}

// ----- Media-specific helpers -----
/**
 * Normalize backend-returned media paths by removing transient "/tmp" segments
 * that some backends include (e.g. "/tmp/uploads/media/..." or
 * "/api/tmp/uploads/...") so the frontend consistently requests
 * "/uploads/media/..." (preserving an optional leading /api segment).
 * This helper is intentionally media-specific and minimal.
 */
export function normalizeMediaPath(path?: string | null): string | null {
  if (!path) return null;
  if (/^https?:\/\//i.test(path) || path.startsWith("data:")) return path;

  let p = path;
  if (!p.startsWith("/")) p = `/${p}`;

  // Remove '/api/tmp' -> '/api/' and '/tmp' -> '/'
  p = p.replace(/^\/api\/tmp(\/|$)/i, "/api/");
  p = p.replace(/^\/tmp(\/|$)/i, "/");

  // Collapse repeated slashes
  p = p.replace(/\/+/g, "/");

  if (!p.startsWith("/")) p = `/${p}`;
  return p;
}

/**
 * Media-specific URL builder. Normalizes transient tmp segments then
 * delegates to `getUploadUrl` to create an absolute URL using the
 * configured API base. Returns null if path is falsy.
 */
export function getMediaUrl(path?: string | null): string | null {
  const normalized = normalizeMediaPath(path);
  if (!normalized) return null;
  // If it's already absolute/data URL, normalizeMediaPath returns it.
  if (/^https?:\/\//i.test(normalized) || normalized.startsWith("data:"))
    return normalized;
  // Avoid duplicating `/api` when the configured base already contains it.
  const rawBase =
    (import.meta.env.VITE_API_BASE_URL as string) || API_CONFIG.baseUrl;
  const baseTrimmed = rawBase.replace(/\/$/, "");
  const baseHasApi = /\/api$/i.test(baseTrimmed);
  const pathHasApi = /^\/api/i.test(normalized);

  const finalPath =
    baseHasApi && pathHasApi ? normalized.replace(/^\/api/i, "") : normalized;
  return getUploadUrl(finalPath);
}
