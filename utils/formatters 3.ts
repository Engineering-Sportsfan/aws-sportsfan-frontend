/**
 * Formatters — date, number, stat, currency utilities.
 */

/** Format a date string to a human-readable date */
export function formatDate(dateStr: string, locale = "en-IN"): string {
  return new Date(dateStr).toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** Format a date-time string (e.g. "Jun 17, 2026, 3:30 PM") */
export function formatDateTime(dateStr: string, locale = "en-IN"): string {
  return new Date(dateStr).toLocaleString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Format a relative time (e.g. "2 hours ago") */
export function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

/** Format a currency amount */
export function formatCurrency(amount: number, currency = "INR", locale = "en-IN"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Format a price from paise/cents to standard display format */
export function formatPrice(paise: number, currency = "INR", locale = "en-IN"): string {
  return formatCurrency(paise / 100, currency, locale);
}

/** Format a large number with abbreviation (e.g. 1.2M, 45K) */
export function formatCount(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return String(num);
}

/** Format a percentage (e.g. 0.75 → "75%") */
export function formatPercent(value: number, decimals = 0): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/** Format a match duration in seconds to MM:SS */
export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}
