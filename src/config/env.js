export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8080";
export const TOP_PAGE_USER_ID = import.meta.env.VITE_TOP_PAGE_USER_ID ?? "3";
export const GOOGLE_AUTH_REDIRECT_PATH = import.meta.env.VITE_GOOGLE_AUTH_REDIRECT_PATH ?? "#/auth";

export function buildFrontendRedirectUrl() {
  return `${window.location.origin}${window.location.pathname}${GOOGLE_AUTH_REDIRECT_PATH}`;
}