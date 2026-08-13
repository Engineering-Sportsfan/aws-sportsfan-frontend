"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Check, Circle, AlertCircle, Info, Star } from "lucide-react";

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
  store: { icon: Info, label: "Store" },
  reward: { icon: Star, label: "Rewards" },
  general: { icon: AlertCircle, label: "General" }
};

const PRIORITY_COLOR: Record<string, string> = {
  HIGH: "#ff4444",
  NORMAL: "#cd620e",
  LOW: "#71717a"
};

function timeAgo(dateString?: string) {
  if (!dateString) return "";
  const now = new Date();
  const past = new Date(dateString);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="text-xs font-semibold px-3 py-1.5 rounded-full transition-colors whitespace-nowrap"
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
  const { user, loading: authLoading } = useAuth();
  const email = user?.email || user?.userId;
  const uid = user?.userId;

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");

  const fetchNotifications = async () => {
    if (authLoading) return;
    setLoading(true);
    if (!email && !uid) {
      setLoading(false);
      return;
    }
    try {
      const q = new URLSearchParams();
      if (email) q.append("email", email);
      if (uid) q.append("uid", uid);
      const res = await fetch(`/api/notifications?${q.toString()}`);
      const data = await res.json();
      if (data.success && data.notifications) {
        setItems(data.notifications);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [email, uid, authLoading]);

  const unreadCount = items.filter((n) => !n.isRead).length;
  // Normalize feature area mapping
  const itemsWithFeature = items.map((n) => ({
    ...n,
    feature_area: n.category || (n.notification_type && n.notification_type.startsWith("store.") ? "store" : n.type || "general")
  }));
  const featuresPresent = [...new Set(itemsWithFeature.map((n) => n.feature_area))];
  const visible = itemsWithFeature.filter(
    (n) => filter === "all" || n.feature_area === filter
  );

  async function markRead(notification: any, ctaClicked = false) {
    const id = notification.id || notification.notification_id;
    // Optimistic update — mark as read and optionally cta_clicked
    setItems((prev) =>
      prev.map((n) =>
        (n.id === id || n.notification_id === id)
          ? { ...n, isRead: true, ...(ctaClicked && { cta_clicked: true }) }
          : n
      )
    );
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "markRead",
          id,
          email,
          // Send the exact PK and SK from the DynamoDB item so the backend
          // can update directly without having to derive or look up the key.
          // PK may use underscores (e.g. USER#rahul_yadav_sportsfan360_com)
          // which never matches a derived USER#email format.
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
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "markAllRead",
          email,
          uid  // also send uid so backend can query USER#uid PK variant
        })
      });
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
    }
  }

  function handleCta(n: any) {
    // Mark as read AND set cta_clicked=true in a single PATCH call
    markRead(n, true);
    if (n.cta_target || n.ctaTarget) {
      window.location.href = n.cta_target || n.ctaTarget;
    }
  }

  return (
    <div
      style={{ background: TOKENS.bg, minHeight: "100vh" }}
      className="w-full p-6 font-sans"
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
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: `1px solid ${TOKENS.border}` }}
        >
          <div className="flex items-center gap-3">
            <span
              className="uppercase text-xs font-black tracking-widest"
              style={{
                color: TOKENS.textPrimary,
                letterSpacing: "0.14em",
              }}
            >
              Notifications
            </span>

            <span
              className="font-mono text-xs font-bold px-2 py-0.5 rounded"
              style={{
                background: TOKENS.borderSoft,
                color: TOKENS.gold,
              }}
            >
              {String(unreadCount).padStart(2, "0")} NEW
            </span>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-1 text-xs font-semibold transition-colors"
              style={{ color: TOKENS.textMuted }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = TOKENS.textPrimary)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = TOKENS.textMuted)
              }
            >
              <Check size={13} />
              Mark all read
            </button>
          )}
        </div>

        {/* Feature filters */}
        {featuresPresent.length > 1 && (
          <div
            className="flex items-center gap-1.5 px-4 py-2.5 overflow-x-auto"
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

        {/* Notifications */}
        <div className="max-h-[calc(100vh-180px)] overflow-y-auto">
          {authLoading ? (
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
          ) : (!email && !uid) ? (
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
          ) : loading ? (
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
                  Nothing here yet — check back during the next match.
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
                  key={n.notification_id || n.id}
                  onClick={() =>
                    !n.isRead && markRead(n)
                  }
                  className="relative flex gap-3 px-4 py-3.5 cursor-pointer transition-colors"
                  style={{
                    borderBottom: `1px solid ${TOKENS.borderSoft}`,
                    background: n.isRead
                      ? "transparent"
                      : TOKENS.panelRow,
                  }}
                  onMouseEnter={(e) =>
                  (e.currentTarget.style.background =
                    TOKENS.rowHover)
                  }
                  onMouseLeave={(e) =>
                  (e.currentTarget.style.background = n.isRead
                    ? "transparent"
                    : TOKENS.panelRow)
                  }
                >
                  <div
                    className="w-[3px] rounded-full shrink-0"
                    style={{
                      background:
                        PRIORITY_COLOR[n.priority] ?? TOKENS.low,
                    }}
                  />

                  <div
                    className="relative flex items-center justify-center w-8 h-8 rounded-lg shrink-0 mt-0.5"
                    style={{ background: TOKENS.borderSoft }}
                  >
                    <Icon
                      size={14}
                      color={TOKENS.textMuted}
                      strokeWidth={2}
                    />

                    {n.live && (
                      <span
                        className="absolute -top-1 -right-1 w-2 h-2 rounded-full animate-pulse"
                        style={{ background: TOKENS.green }}
                      />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <span
                        className="text-sm font-bold leading-snug"
                        style={{ color: TOKENS.textPrimary }}
                      >
                        {n.title}
                      </span>

                      <span
                        className="font-mono text-[10px] shrink-0 mt-0.5"
                        style={{ color: TOKENS.textFaint }}
                      >
                        {timeAgo(n.sent_at)}
                      </span>
                    </div>

                    <p
                      className="text-xs leading-relaxed mt-0.5 pr-2"
                      style={{ color: TOKENS.textMuted }}
                    >
                      {n.body}
                    </p>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCta(n);
                      }}
                      className="mt-2 text-xs font-bold px-3 py-1.5 rounded-full transition-transform active:scale-95"
                      style={{
                        background: TOKENS.gold,
                        color: TOKENS.bg,
                      }}
                    >
                      {n.cta_label}
                    </button>
                  </div>

                  {!n.isRead && (
                    <span
                      className="absolute top-4 right-4 w-1.5 h-1.5 rounded-full"
                      style={{ background: TOKENS.green }}
                    />
                  )}
                </div>
                );
              })
          )}
        </div>
      </div>
    </div>
  );
}