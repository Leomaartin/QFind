const sanitizeUrl = (url?: string): string => {
  if (!url || typeof url !== "string") return "";
  const trimmed = url.trim();
  if (trimmed === "undefined" || trimmed === "null") return "";
  return trimmed.replace(/\/+$/, "");
};

// If NEXT_PUBLIC_FRONTEND_URL is set, use it; otherwise empty string (same origin)
export const FRONTEND_URL =
  sanitizeUrl(process.env.NEXT_PUBLIC_FRONTEND_URL) || "";

// If NEXT_PUBLIC_BACKEND_URL is set, use it; otherwise fallback to FRONTEND_URL or empty string (same origin)
export const BACKEND_URL =
  sanitizeUrl(process.env.NEXT_PUBLIC_BACKEND_URL) ||
  sanitizeUrl(process.env.NEXT_PUBLIC_FRONTEND_URL) ||
  "";

/**
 * Returns a guaranteed valid URL for internal API endpoints.
 * Example: getApiUrl("/api/services") -> "https://ferreteriapichi-qfindfront.nsawnt.easypanel.host/api/services"
 * If no backend domain is configured, returns "/api/services" directly, ensuring the browser calls the current host.
 * It will NEVER produce "/undefined/api/...".
 */
export const getApiUrl = (path: string): string => {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const baseUrl =
    sanitizeUrl(process.env.NEXT_PUBLIC_BACKEND_URL) ||
    sanitizeUrl(process.env.NEXT_PUBLIC_FRONTEND_URL) ||
    BACKEND_URL;

  if (baseUrl) {
    return `${baseUrl}${cleanPath}`;
  }
  return cleanPath;
};
