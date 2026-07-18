export const SXP_ACTIVITY_REFRESH_EVENT = "sxp:refresh-activities";

export function emitSxpActivityRefresh(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(SXP_ACTIVITY_REFRESH_EVENT));
}

export function onSxpActivityRefresh(handler: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  const listener = () => handler();
  window.addEventListener(SXP_ACTIVITY_REFRESH_EVENT, listener);
  return () => window.removeEventListener(SXP_ACTIVITY_REFRESH_EVENT, listener);
}
