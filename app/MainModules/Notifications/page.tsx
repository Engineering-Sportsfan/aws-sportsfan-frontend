"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Check,
  Circle,
  AlertCircle,
  Info,
  Star,
  Swords,
  MessageSquare,
  Flame,
  Trophy,
  Sparkles,
  RefreshCw,
  ArrowLeft,
  Trash2,
  X,
  Bell,
  Calendar,
} from "lucide-react";
import { handleGoBack } from "@/utils/backButton";

const TOKENS = {
  bg: "#0b0b0f",
  panel: "#121216",
  panelRow: "#16161c",
  rowHover: "#1c1c24",
  border: "rgba(255,255,255,0.08)",
  borderSoft: "rgba(255,255,255,0.04)",
  textPrimary: "#ffffff",
  textMuted: "#a0a0ab",
  textFaint: "#71717a",
  gold: "#FFD700",
  green: "#00c864",
  low: "#71717a"
};

const FEATURE_META: Record<string, { icon: any; label: string }> = {
  fliparena: { icon: Swords, label: "Flip Arena" },
  flipline: { icon: MessageSquare, label: "FlipLINE" },
  schedule: { icon: Trophy, label: "Schedule & Live" },
  store: { icon: Info, label: "Store" },
  reward: { icon: Star, label: "Rewards" },
  general: { icon: AlertCircle, label: "General" }
};

const PRIORITY_COLOR: Record<string, string> = {
  HIGH: "#ff4444",
  NORMAL: "#cd620e",
  LOW: "#71717a"
};

function timeAgo(dateString?: string | number) {
  if (!dateString) return "";
  const now = new Date();
  const past = new Date(typeof dateString === "number" ? dateString : dateString);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

function getClientDedupeKey(n: any): string {
  if (!n) return "";
  const notifType = (n.notification_type || n.type || "").toLowerCase();
  if (
    n.eventId &&
    (notifType === "schedule_reminder" ||
      notifType.includes("reminder") ||
      notifType === "live_match" ||
      notifType.includes("live"))
  ) {
    return `REM#${notifType}#${n.eventId}`;
  }
  let baseId = (n.id || n.notification_id || "").trim();
  if (!baseId && n.SK && typeof n.SK === "string" && n.SK.startsWith("NOTIF#")) {
    baseId = n.SK.split("#").pop() || "";
  }
  if (baseId) {
    let stripped = baseId
      .replace(/_[^_@]+@[^.]+.*$/, "")
      .replace(/_u_[^_]+$/, "")
      .replace(/_anon_[^_]+$/, "")
      .trim();

    // Strip dynamic timestamps from reminder IDs to ensure identical deduping
    if (stripped.startsWith("ntf_rem_")) {
      stripped = stripped.replace(/^(ntf_rem_[^_]+)(?:_\d+)+$/, "$1");
    } else if (stripped.startsWith("ntf_live_")) {
      stripped = stripped.replace(/^(ntf_live_[^_]+)(?:_\d+)+$/, "$1");
    }

    if (stripped.startsWith("ntf_") || stripped.length > 8) {
      return `ID#${stripped}`;
    }
  }
  if (n.aggregation_key) {
    return `AGGR#${n.aggregation_key}`;
  }
  if (baseId) {
    return `ID#${baseId}`;
  }
  const entity = n.entity_id || n.entityId || n.title || "";
  const body = n.body || n.message || "";
  return `SIG#${notifType}###${entity}###${body}`;
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="text-xs font-semibold px-3 py-1.5 rounded-full transition-colors whitespace-nowrap cursor-pointer"
      style={{
        background: active ? "linear-gradient(135deg,#c9115f,#cd620e)" : "rgba(255,255,255,0.05)",
        color: active ? "#ffffff" : "#a0a0ab",
        border: active ? "1px solid rgba(201,17,95,0.4)" : "1px solid rgba(255,255,255,0.08)"
      }}
    >
      {label}
    </button>
  );
}

export default function NotificationCenter() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  // Local storage cached user fallback for instant hydration
  const [cachedUser, setCachedUser] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("auth_user");
        if (stored) setCachedUser(JSON.parse(stored));
      } catch {}
    }
  }, []);

  const effectiveEmail = user?.email || cachedUser?.email || "";
  const effectiveUid =
    user?.userId || user?.actualUserId || user?.uid || cachedUser?.userId || cachedUser?.actualUserId || "";
  const effectiveActualUserId =
    user?.actualUserId || user?.userId || cachedUser?.actualUserId || cachedUser?.userId || "";

  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");

  const fetchNotifications = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setIsRefreshing(true);
    else setLoading(true);

    const emailParam = effectiveEmail;
    const uidParam = effectiveUid;
    const actualIdParam = effectiveActualUserId;

    const lastAllReadAt = typeof window !== "undefined" ? Number(localStorage.getItem("notifications_all_read_at") || 0) : 0;
    const lastAllClearedAt = typeof window !== "undefined" ? Number(localStorage.getItem("notifications_all_cleared_at") || 0) : 0;
    let clearedIds: string[] = [];
    try {
      clearedIds = JSON.parse(localStorage.getItem("notifications_cleared_ids") || "[]");
    } catch {}

    const dedupeMap = new Map<string, any>();

    const addNotifToMap = (notif: any) => {
      if (!notif) return;
      if (!notif.title && !notif.body && !notif.message) return; // Skip malformed empty cards
      const key = getClientDedupeKey(notif);
      const notifId = notif.id || notif.notification_id;
      const notifTime = new Date(notif.sent_at || notif.createdAt || 0).getTime();

      // Skip if previously cleared by this user
      if (notifId && clearedIds.includes(notifId)) return;
      if (lastAllClearedAt > 0 && notifTime > 0 && notifTime <= lastAllClearedAt) return;

      const isMarkedReadLocally = lastAllReadAt > 0 && notifTime > 0 && notifTime <= lastAllReadAt;

      if (!dedupeMap.has(key)) {
        const isRead = isMarkedReadLocally || Boolean(notif.isRead !== undefined ? notif.isRead : notif.read);
        dedupeMap.set(key, { ...notif, isRead, read: isRead });
      } else {
        const existing = dedupeMap.get(key);
        const isExistingRead = Boolean(existing.isRead !== undefined ? existing.isRead : existing.read);
        const isCurrentRead = Boolean(notif.isRead !== undefined ? notif.isRead : notif.read);
        const isRead = isMarkedReadLocally || isExistingRead || isCurrentRead;
        dedupeMap.set(key, { ...existing, ...notif, isRead, read: isRead });
      }
    };

    // 1. Load locally stored scheduled & live match reminder notifications
    if (typeof window !== "undefined") {
      try {
        const userStorageKey = `sf_reminder_notifications_${uidParam || emailParam || actualIdParam || "anon"}`;
        const localList: any[] = JSON.parse(localStorage.getItem(userStorageKey) || "[]");
        const globalList: any[] = JSON.parse(localStorage.getItem("sf_reminder_notifications") || "[]");
        [...localList, ...globalList].forEach(addNotifToMap);
      } catch (e) {
        console.warn("[Notifications] Local storage load notice:", e);
      }
    }

    if (!emailParam && !uidParam && !actualIdParam) {
      setItems(Array.from(dedupeMap.values()));
      setLoading(false);
      setIsRefreshing(false);
      return;
    }

    try {
      const q = new URLSearchParams();
      if (emailParam) q.append("email", emailParam);
      if (uidParam) q.append("uid", uidParam);
      if (actualIdParam && actualIdParam !== uidParam) q.append("actualUserId", actualIdParam);

      const res = await fetch(`/api/notifications?${q.toString()}`, {
        cache: "no-store",
        headers: { "Pragma": "no-cache" }
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.notifications)) {
        data.notifications.forEach(addNotifToMap);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      // Sort newest first by sent_at / createdAt
      const sorted = Array.from(dedupeMap.values()).sort((a, b) => {
        const timeA = new Date(a.sent_at || a.createdAt || 0).getTime();
        const timeB = new Date(b.sent_at || b.createdAt || 0).getTime();
        return timeB - timeA;
      });
      setItems(sorted);
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [effectiveEmail, effectiveUid, effectiveActualUserId]);

  useEffect(() => {
    if (!authLoading) {
      fetchNotifications();
    }
  }, [authLoading, effectiveEmail, effectiveUid, effectiveActualUserId, fetchNotifications]);

  // Auto-refresh when window receives focus in background without resetting loading state
  useEffect(() => {
    const onFocus = () => fetchNotifications(true);
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [fetchNotifications]);

  // Normalize feature area mapping & client-side deduplication guarantee
  const dedupeClientMap = new Map<string, any>();
  for (const n of items) {
    const key = getClientDedupeKey(n);
    if (!dedupeClientMap.has(key)) {
      dedupeClientMap.set(key, n);
    }
  }

  const itemsWithFeature = Array.from(dedupeClientMap.values()).map((n) => {
    let feature_area = "general";
    const nType = (n.notification_type || n.type || "").toLowerCase();

    if (
      nType.startsWith("fliparena") ||
      nType.includes("arena") ||
      nType.includes("quiz") ||
      nType.includes("poll") ||
      nType.includes("prediction") ||
      nType.includes("battle") ||
      nType.includes("meme")
    ) {
      feature_area = "fliparena";
    } else if (nType.startsWith("flipline") || nType.includes("flipline")) {
      feature_area = "flipline";
    } else if (
      nType.includes("schedule") ||
      nType.includes("reminder") ||
      nType.includes("match") ||
      nType.includes("live") ||
      n.category === "schedule" ||
      n.category === "reminder"
    ) {
      feature_area = "schedule";
    } else if (nType.startsWith("store") || n.category === "store") {
      feature_area = "store";
    } else if (
      nType.startsWith("reward") ||
      nType.includes("bonus") ||
      nType.includes("points") ||
      n.category === "reward"
    ) {
      feature_area = "reward";
    } else if (n.category) {
      feature_area = n.category;
    }

    const isRead =
      n.isRead !== undefined ? Boolean(n.isRead) : n.read !== undefined ? Boolean(n.read) : false;

    return {
      ...n,
      feature_area,
      isRead,
    };
  });

  const unreadCount = itemsWithFeature.filter((n) => !n.isRead).length;

  const featuresPresent = Array.from(new Set(itemsWithFeature.map((n) => n.feature_area)));
  const visible = itemsWithFeature.filter(
    (n) => filter === "all" || n.feature_area === filter
  );

  async function markRead(notification: any, ctaClicked = false) {
    // If already read, never reduce the counter or re-trigger
    if (notification.isRead && !ctaClicked) return;

    const notifId = notification.id || notification.notification_id;
    const targetKey = getClientDedupeKey(notification);

    // Optimistic update — mark as read and optionally cta_clicked ONLY for this notification
    setItems((prev) =>
      prev.map((n) =>
        (n.id === notifId || n.notification_id === notifId || (targetKey && getClientDedupeKey(n) === targetKey))
          ? { ...n, isRead: true, read: true, ...(ctaClicked && { cta_clicked: true }) }
          : n
      )
    );

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("sf360:notifications-read", { detail: { notifId } }));
    }

    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        keepalive: true,
        body: JSON.stringify({
          action: "markRead",
          id: notifId,
          email: effectiveEmail,
          userId: effectiveUid,
          pk: notification.PK || notification.pk,
          sk: notification.SK || notification.sk || notification._sk,
          ctaClicked,
        })
      });
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  }

  async function markAllRead() {
    if (typeof window !== "undefined") {
      localStorage.setItem("notifications_all_read_at", String(Date.now()));
      window.dispatchEvent(new CustomEvent("sf360:notifications-read", { detail: { all: true } }));
    }
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true, read: true })));
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        keepalive: true,
        body: JSON.stringify({
          action: "markAllRead",
          email: effectiveEmail,
          userId: effectiveUid,
        })
      });
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
    }
  }

  async function clearAllNotifications() {
    if (items.length === 0) return;
    const now = Date.now();
    if (typeof window !== "undefined") {
      localStorage.setItem("notifications_all_cleared_at", String(now));
      localStorage.removeItem(`sf_reminder_notifications_${effectiveUid || effectiveEmail || "anon"}`);
      localStorage.removeItem("sf_reminder_notifications");
      window.dispatchEvent(new CustomEvent("sf360:notifications-read", { detail: { all: true, cleared: true } }));
    }
    setItems([]);
    try {
      await fetch("/api/notifications", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        keepalive: true,
        body: JSON.stringify({
          all: true,
          email: effectiveEmail,
          userId: effectiveUid,
          actualUserId: effectiveActualUserId,
        })
      });
    } catch (err) {
      console.error("Failed to clear all notifications:", err);
    }
  }

  async function clearSingleNotification(notification: any, e?: React.MouseEvent) {
    if (e) e.stopPropagation();
    const notifId = notification.id || notification.notification_id;
    const targetKey = getClientDedupeKey(notification);

    setItems((prev) =>
      prev.filter(
        (n) =>
          n.id !== notifId &&
          n.notification_id !== notifId &&
          (!targetKey || getClientDedupeKey(n) !== targetKey)
      )
    );

    if (typeof window !== "undefined") {
      try {
        const existing = JSON.parse(localStorage.getItem("notifications_cleared_ids") || "[]");
        if (notifId && !existing.includes(notifId)) {
          existing.push(notifId);
          localStorage.setItem("notifications_cleared_ids", JSON.stringify(existing));
        }

        const userStorageKey = `sf_reminder_notifications_${effectiveUid || effectiveEmail || "anon"}`;
        const localList: any[] = JSON.parse(localStorage.getItem(userStorageKey) || "[]");
        const filteredLocal = localList.filter((n) => n.id !== notifId && n.notification_id !== notifId);
        localStorage.setItem(userStorageKey, JSON.stringify(filteredLocal));

        const allList: any[] = JSON.parse(localStorage.getItem("sf_reminder_notifications") || "[]");
        const filteredAll = allList.filter((n) => n.id !== notifId && n.notification_id !== notifId);
        localStorage.setItem("sf_reminder_notifications", JSON.stringify(filteredAll));
      } catch {}
      window.dispatchEvent(new CustomEvent("sf360:notifications-read", { detail: { notifId, cleared: true } }));
    }

    try {
      await fetch("/api/notifications", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        keepalive: true,
        body: JSON.stringify({
          id: notifId,
          sk: notification.SK || notification.sk,
          email: effectiveEmail,
          userId: effectiveUid,
          actualUserId: effectiveActualUserId,
        })
      });
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  }

  async function handleCta(n: any) {
    await markRead(n, true);
    const target = n.cta_target || n.ctaTarget;
    if (target) {
      router.push(target);
    }
  }

  return (
    <div
      style={{ background: TOKENS.bg, minHeight: "100vh" }}
      className="w-full p-4 sm:p-6 font-sans"
    >
      <div
        className="w-full max-w-3xl mx-auto rounded-2xl overflow-hidden shadow-2xl"
        style={{
          background: TOKENS.panel,
          border: `1px solid ${TOKENS.border}`,
        }}
      >
        {/* Header */}
        <div
          className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-5 py-4"
          style={{ borderBottom: `1px solid ${TOKENS.border}` }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => handleGoBack(router)}
              data-nav="back"
              aria-label="Go back"
              title="Go back"
              className="flex items-center justify-center w-8 h-8 rounded-lg transition-all active:scale-95 cursor-pointer shrink-0"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: `1px solid ${TOKENS.border}`,
                color: TOKENS.textMuted,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.12)";
                e.currentTarget.style.color = TOKENS.textPrimary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                e.currentTarget.style.color = TOKENS.textMuted;
              }}
            >
              <ArrowLeft size={16} />
            </button>

            <span
              className="uppercase text-xs sm:text-sm font-black tracking-widest truncate"
              style={{
                color: TOKENS.textPrimary,
                letterSpacing: "0.14em",
              }}
            >
              Notifications
            </span>

            <span
              className="font-mono text-xs font-bold px-2 py-0.5 rounded shrink-0"
              style={{
                background: unreadCount > 0 ? "rgba(255, 215, 0, 0.15)" : TOKENS.borderSoft,
                color: unreadCount > 0 ? TOKENS.gold : TOKENS.textFaint,
                border: unreadCount > 0 ? "1px solid rgba(255, 215, 0, 0.3)" : "none",
              }}
            >
              {String(unreadCount).padStart(2, "0")} NEW
            </span>

            <button
              onClick={() => fetchNotifications(true)}
              disabled={isRefreshing}
              title="Refresh Notifications"
              className="p-1.5 rounded-full text-zinc-400 hover:text-white transition-colors cursor-pointer shrink-0"
            >
              <RefreshCw size={13} className={isRefreshing ? "animate-spin text-amber-400" : ""} />
            </button>
          </div>

          {/* Action Buttons: Mark all read & Clear all */}
          <div className="flex items-center gap-2 shrink-0">
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/10 border border-white/10 transition-colors cursor-pointer"
                style={{ color: TOKENS.textMuted }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = TOKENS.textPrimary)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = TOKENS.textMuted)
                }
              >
                <Check size={13} />
                <span>Mark all read</span>
              </button>
            )}

            {items.length > 0 && (
              <button
                onClick={clearAllNotifications}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 text-rose-300 hover:text-white transition-colors cursor-pointer"
              >
                <Trash2 size={13} />
                <span>Clear all</span>
              </button>
            )}
          </div>
        </div>

        {/* Feature filters */}
        {featuresPresent.length > 1 && (
          <div
            className="flex items-center gap-1.5 px-4 py-2.5 overflow-x-auto scrollbar-none"
            style={{ borderBottom: `1px solid ${TOKENS.borderSoft}` }}
          >
            <Chip
              label="All"
              active={filter === "all"}
              onClick={() => setFilter("all")}
            />

            {featuresPresent.map((f) => (
              <Chip
                key={f}
                label={FEATURE_META[f]?.label ?? f}
                active={filter === f}
                onClick={() => setFilter(f)}
              />
            ))}
          </div>
        )}

        {/* Notifications list */}
        <div className="max-h-[calc(100vh-180px)] overflow-y-auto">
          {authLoading && !effectiveEmail && !effectiveUid ? (
            <div className="py-10 flex flex-col items-center gap-2">
              <div
                className="w-5 h-5 rounded-full border-2 animate-spin"
                style={{
                  borderColor: TOKENS.border,
                  borderTopColor: TOKENS.gold,
                }}
              />
              <span
                className="text-xs"
                style={{ color: TOKENS.textFaint }}
              >
                Verifying session...
              </span>
            </div>
          ) : (!effectiveEmail && !effectiveUid) ? (
            <div className="py-12 flex flex-col items-center gap-2 px-6 text-center">
              <AlertCircle
                size={22}
                color={TOKENS.textFaint}
                strokeWidth={1.5}
              />
              <span
                className="text-sm font-semibold"
                style={{ color: TOKENS.textPrimary }}
              >
                Sign in required
              </span>
              <span
                className="text-xs"
                style={{ color: TOKENS.textFaint }}
              >
                Please log in to view your notification feed.
              </span>
            </div>
          ) : loading && items.length === 0 ? (
            <div className="py-10 flex flex-col items-center gap-2">
              <div
                className="w-5 h-5 rounded-full border-2 animate-spin"
                style={{
                  borderColor: TOKENS.border,
                  borderTopColor: TOKENS.gold,
                }}
              />

              <span
                className="text-xs"
                style={{ color: TOKENS.textFaint }}
              >
                Loading your feed
              </span>
            </div>
          ) : visible.length === 0 ? (
            <div className="py-12 flex flex-col items-center gap-2 px-6 text-center">
              <Circle
                size={22}
                color={TOKENS.textFaint}
                strokeWidth={1.5}
              />

              <span
                className="text-sm font-semibold"
                style={{ color: TOKENS.textPrimary }}
              >
                All caught up
              </span>

              <span
                className="text-xs"
                style={{ color: TOKENS.textFaint }}
              >
                Nothing here right now — you&apos;re completely up to date!
              </span>
            </div>
          ) : (
            visible.map((n) => {
              const meta =
                FEATURE_META[n.feature_area] ?? {
                  icon: Circle,
                  label: n.feature_area,
                };

              const Icon = meta.icon;

              return (
                <div
                  key={getClientDedupeKey(n) || n.notification_id || n.id || n.SK}
                  onClick={() => {
                    const nType = (n.notification_type || n.type || "").toLowerCase();
                    const isScheduleReminder = nType === "schedule_reminder" || nType.includes("reminder");
                    if (!isScheduleReminder && (n.cta_target || n.ctaTarget) && (n.cta_label || n.ctaLabel)) {
                      handleCta(n);
                    } else if (!n.isRead) {
                      markRead(n);
                    }
                  }}
                  className="relative flex items-start gap-3 px-4 py-3.5 cursor-pointer transition-colors group"
                  style={{
                    borderBottom: `1px solid ${TOKENS.borderSoft}`,
                    background: n.isRead
                      ? "transparent"
                      : TOKENS.panelRow,
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = TOKENS.rowHover)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = n.isRead
                      ? "transparent"
                      : TOKENS.panelRow)
                  }
                >
                  <div
                    className="w-[3px] self-stretch rounded-full shrink-0"
                    style={{
                      background:
                        PRIORITY_COLOR[n.priority] ?? TOKENS.low,
                    }}
                  />

                  {(() => {
                    const notifAvatar =
                      n.photoURL ||
                      n.actor_photoURL ||
                      n.actorPhoto ||
                      n.actor_avatar ||
                      n.actorAvatar ||
                      n.userAvatar ||
                      n.user_avatar ||
                      n.avatar ||
                      null;

                    return (
                      <div
                        className="relative flex items-center justify-center w-8 h-8 rounded-lg shrink-0 mt-0.5 overflow-hidden"
                        style={{ background: TOKENS.borderSoft }}
                      >
                        {notifAvatar ? (
                          <img
                            src={notifAvatar}
                            alt={n.actor_name || "User"}
                            className="w-full h-full object-cover rounded-lg"
                            onError={(e) => {
                              (e.currentTarget as HTMLElement).style.display = "none";
                              const fallbackEl = e.currentTarget.parentElement?.querySelector(".notif-fallback-icon") as HTMLElement;
                              if (fallbackEl) fallbackEl.style.display = "flex";
                            }}
                          />
                        ) : null}
                        <div
                          className={`notif-fallback-icon items-center justify-center w-full h-full ${notifAvatar ? "hidden" : "flex"}`}
                        >
                          <Icon
                            size={14}
                            color={TOKENS.textMuted}
                            strokeWidth={2}
                          />
                        </div>
                      </div>
                    );
                  })()}

                  <div className="flex-1 min-w-0 pr-6">
                    <div className="flex items-start justify-between gap-2">
                      <span
                        className="text-sm font-bold leading-snug"
                        style={{ color: TOKENS.textPrimary }}
                      >
                        {n.title || "Notification"}
                      </span>

                      <span
                        className="font-mono text-[10px] shrink-0 mt-0.5"
                        style={{ color: TOKENS.textFaint }}
                      >
                        {timeAgo(n.sent_at || n.createdAt)}
                      </span>
                    </div>

                    <p
                      className="text-xs leading-relaxed mt-0.5 pr-2"
                      style={{ color: TOKENS.textMuted }}
                    >
                      {n.body || n.message}
                    </p>

                    {(() => {
                      const nType = (n.notification_type || n.type || "").toLowerCase();
                      const isScheduleReminder = nType === "schedule_reminder" || nType.includes("reminder");
                      const ctaLabel = n.cta_label || n.ctaLabel;
                      if (isScheduleReminder || !ctaLabel) return null;

                      return (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCta(n);
                          }}
                          className="mt-2 text-xs font-bold px-3 py-1.5 rounded-full transition-transform active:scale-95 cursor-pointer"
                          style={{
                            background: TOKENS.gold,
                            color: TOKENS.bg,
                          }}
                        >
                          {ctaLabel}
                        </button>
                      );
                    })()}
                  </div>

                  {/* Actions column on right: Green dot if unread + Dismiss (X) */}
                  <div className="flex items-center gap-2 shrink-0 pt-0.5">
                    {!n.isRead && (
                      <span
                        title="Unread notification"
                        className="w-2 h-2 rounded-full shrink-0 shadow-[0_0_8px_#00c864]"
                        style={{ background: TOKENS.green }}
                      />
                    )}

                    <button
                      type="button"
                      onClick={(e) => clearSingleNotification(n, e)}
                      title="Dismiss notification"
                      aria-label="Dismiss notification"
                      className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-1 rounded hover:bg-white/10 text-zinc-400 hover:text-rose-400 transition-all cursor-pointer"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}