/**
 * App-wide constants.
 * Import from here — never hard-code these values in components.
 */

// API
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api";

// App
export const APP_NAME = "SportsFan";
export const APP_VERSION = "2.0.0";

// Route paths (keep in sync with src/routes/index.tsx)
export const ROUTES = {
  HOME: "/",
  ATHLETE: (id: string) => `/athlete/${id}`,
  PLAYBOOK: "/playbook",
  AUDIO: "/audio",
  VIDEO: "/video",
  ARTICLE: "/article",
  FAN_ZONE: "/fan-zone",
  WATCH_ALONG: "/watch-along",
  WATCH_ALONG_EVENT: (id: string) => `/watch-along/${id}`,
  MATCH_INTELLIGENCE: "/match-intelligence",
  FAN_BATTLE: "/fan-battle",
  ASK_AI: "/ask-ai",
  ASK_AI_CHAT: "/ask-ai-chat",
  RECORDS_EXPLORER: "/records-explorer",
  MATCH_CENTRE: "/match-centre",
  PREDICTIONS: "/predictions",
  STORE: "/store",
  STORE_COACHES: "/store/coaches",
  STORE_SERVICES: "/store/services",
  STORE_SERVICE: (id: string) => `/store/service/${id}`,
  STORE_COACH: (id: string) => `/store/coach/${id}`,
  STORE_BOOKING: (id: string) => `/store/booking/${id}`,
  STORE_PAYMENT: (id: string) => `/store/payment/${id}`,
  STORE_BOOKING_SUCCESS: (id: string) => `/store/booking-success/${id}`,
  STORE_MY_BOOKINGS: "/store/my-bookings",
  STORE_REVIEW: (id: string) => `/store/review/${id}`,
} as const;

// Pagination
export const DEFAULT_PAGE_SIZE = 20;

// Media
export const FALLBACK_AVATAR = "/images/avatar-placeholder.png";
export const FALLBACK_THUMBNAIL = "/images/thumbnail-placeholder.png";
