import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AvatarWithBadge from "../components/AvatarWithBadge";
import { FilterPills } from "../components/shared";
import { NOTIF_FILTERS, TYPE_STYLES } from "../constants";
import type { Notification, Room } from "../types";

interface Props {
  notifications: Notification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onCompose: () => void;
  onJoinRoom: (room?: any) => void;
  onNavigateTab: (tab: string) => void;
  rooms?: Room[];
}

export default function Notifications({
  notifications,
  onMarkRead,
  onMarkAllRead,
  onCompose,
  onJoinRoom,
  onNavigateTab,
  rooms = [],
}: Props) {
  const [filter, setFilter] = useState("All");

  const unread = notifications.filter((n) => !n.read).length;

  const filtered = notifications.filter((n) => {
    if (filter === "All") return true;
    if (filter === "Predictions") return n.type.includes("PREDICTION");
    if (filter === "Challenges") return n.type === "CHALLENGE" || n.type === "RIVAL";
    if (filter === "Badges") return n.type === "BADGE" || n.type === "FAN_OF_WEEK";
    if (filter === "Match") return n.type === "MATCH_LIVE" || n.type === "HEATING_UP";
    return true;
  });

  const findRoomForNotification = (n: Notification) => {
    if (!rooms.length) return null;
    const matchText = `${n.title} ${n.subtitle}`.toLowerCase();
    const matchedRoom = rooms.find(
      (room) =>
        matchText.includes(room.name.toLowerCase()) ||
        room.name.toLowerCase().includes("india") ||
        room.name.toLowerCase().includes("australia"),
    );
    return matchedRoom || rooms[0];
  };

  return (
    <div className="screen-scroll">
      <div style={{ padding: "16px 16px 0", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={() => onNavigateTab("home")}
            style={{ fontSize: 22, background: "none", border: "none", cursor: "pointer", color: "var(--text-primary)" }}
          >
            ←
          </button>
          <div>
            <h1 className="font-display" style={{ fontSize: 40, letterSpacing: "0.04em" }}>Alerts</h1>
            {unread > 0 && (
              <span style={{ display: "inline-block", marginTop: 4, padding: "2px 10px", borderRadius: 999, background: "var(--accent-magenta)", fontSize: 11, fontWeight: 700 }}>
                {unread} unread
              </span>
            )}
          </div>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onMarkAllRead}
          style={{ fontSize: 12, color: "var(--accent-magenta)", background: "none", border: "none", cursor: "pointer", marginTop: 8, fontWeight: 700 }}
        >
          Mark all read
        </motion.button>
      </div>

      <div style={{ padding: "12px 16px" }}>
        <FilterPills options={NOTIF_FILTERS} active={filter} onChange={setFilter} />
      </div>

      <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: 10 }}>
        <AnimatePresence>
          {filtered.map((n, i) => {
            const style = TYPE_STYLES[n.type] || TYPE_STYLES.CHALLENGE;
            const targetRoom = findRoomForNotification(n);

            return (
              <motion.div
                key={n.id}
                layout
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => {
                  onMarkRead(n.id);
                  if (n.type === "MATCH_LIVE" || n.type === "HEATING_UP") { onJoinRoom(targetRoom); return; }
                  if (n.type === "CHALLENGE") { onCompose(); return; }
                  if (n.type.includes("PREDICTION") || n.type === "BADGE" || n.type === "FAN_OF_WEEK") { onNavigateTab("profile"); return; }
                  onNavigateTab("home");
                }}
                style={{
                  position: "relative", width: "100%", padding: "14px 16px", borderRadius: 24,
                  textAlign: "left", cursor: "pointer",
                  background: n.read ? "rgba(14,14,20,0.9)" : "rgba(22,22,31,0.95)",
                  border: "1px solid var(--border)",
                  borderLeft: `3px solid ${n.read ? "var(--border)" : style.color}`,
                  transition: "background 0.2s",
                }}
              >
                <span style={{ fontSize: 10, fontWeight: 800, padding: "3px 8px", borderRadius: 999, background: `${style.color}22`, color: style.color, letterSpacing: "0.06em" }}>
                  {style.pulse && (
                    <span className="live-pulse" style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "var(--live-green)", marginRight: 4, verticalAlign: "middle" }} />
                  )}
                  {style.label}
                </span>

                <div style={{ display: "flex", gap: 12, marginTop: 10, alignItems: "flex-start" }}>
                  {n.fan && (
                    <div style={{ flexShrink: 0 }}>
                      <AvatarWithBadge username={n.fan.username} badge={n.fan.badge} size="sm" />
                    </div>
                  )}
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "white", lineHeight: 1.4 }}>{n.title}</p>
                    <p style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4 }}>{n.subtitle}</p>
                    {n.cta && (
                      <button
                        onClick={(e) => { e.stopPropagation(); if (n.type.includes("PREDICTION")) onNavigateTab("profile"); else onCompose(); }}
                        style={{ marginTop: 6, fontSize: 12, color: "var(--accent-magenta)", fontWeight: 700, background: "none", border: "none", cursor: "pointer" }}
                      >
                        {n.cta} →
                      </button>
                    )}
                    {n.type === "MATCH_LIVE" && (
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => { e.stopPropagation(); onJoinRoom(targetRoom); }}
                        className="btn-gradient"
                        style={{ marginTop: 8, padding: "6px 16px", borderRadius: 999, fontSize: 12, border: "none", cursor: "pointer" }}
                      >
                        Join the room →
                      </motion.button>
                    )}
                  </div>
                </div>

                <p style={{ position: "absolute", top: 14, right: 14, fontSize: 11, color: "var(--text-muted)" }}>{n.time}</p>
                {!n.read && <span style={{ position: "absolute", top: 14, right: 14, width: 8, height: 8, borderRadius: "50%", background: "var(--accent-magenta)", display: "block" }} />}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
