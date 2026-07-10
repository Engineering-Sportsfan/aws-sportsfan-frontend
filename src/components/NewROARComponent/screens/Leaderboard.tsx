import { useState } from "react";
import { motion } from "framer-motion";
import AvatarWithBadge from "../components/AvatarWithBadge";
import { FilterPills } from "../components/shared";
import { LEADERBOARD_DATA, BADGE_LABELS, LB_TABS, CURRENT_USER } from "../constants";

interface Props {
  onBack: () => void;
  onCompose: () => void;
}

const RANK_COLOR = ["#C0C0C0", "#FFB800", "#CD7F32"];

export default function Leaderboard({ onBack, onCompose }: Props) {
  const [tab, setTab] = useState("All Time");
  const list = LEADERBOARD_DATA;
  const podium = list.slice(0, 3);
  // Display order: 2nd, 1st, 3rd
  const podiumOrder = [podium[1], podium[0], podium[2]];

  return (
    <div className="screen-scroll">
      <div style={{ padding: "16px 16px 0", display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={onBack} style={{ fontSize: 22, background: "none", border: "none", cursor: "pointer", color: "var(--text-primary)" }}>←</button>
        <h1 className="font-display" style={{ fontSize: 40, letterSpacing: "0.04em" }}>Leaderboards</h1>
      </div>

      <div style={{ padding: "12px 16px" }}>
        <FilterPills options={LB_TABS} active={tab} onChange={setTab} />
      </div>

      {/* Podium */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 8, padding: "24px 16px 16px" }}>
        {podiumOrder.map((fan, i) =>
          fan ? (
            <motion.div
              key={fan.username}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              style={{ textAlign: "center", flex: i === 1 ? 1.2 : 1 }}
            >
              <AvatarWithBadge username={fan.username} badge={fan.badge} size={i === 1 ? "lg" : "md"} />
              <p className="font-display" style={{ fontSize: 13, marginTop: 8, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 90, margin: "8px auto 0" }}>
                {fan.username.split("_")[0]}
              </p>
              <p className="font-display" style={{ fontSize: 22, color: RANK_COLOR[i === 1 ? 1 : i === 0 ? 0 : 2] }}>
                {fan.accuracy}%
              </p>
            </motion.div>
          ) : null,
        )}
      </div>

      {/* Full list */}
      <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: 8 }}>
        {list.map((fan, i) => {
          const isYou = fan.username === CURRENT_USER.username;
          const accColor = fan.accuracy >= 70 ? "var(--correct-green)" : fan.accuracy >= 60 ? "var(--pending-amber)" : "var(--text-muted)";
          return (
            <motion.div
              key={fan.username}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 20, background: "var(--bg-secondary)", border: `1px solid ${isYou ? "var(--accent-magenta)" : "var(--border)"}`, borderLeft: isYou ? "4px solid var(--accent-magenta)" : undefined }}
            >
              <span className="font-display" style={{ fontSize: 24, width: 32, textAlign: "center", color: ["#FFB800", "#C0C0C0", "#CD7F32"][fan.rank - 1] || "var(--text-muted)", flexShrink: 0 }}>
                {fan.rank}
              </span>
              <AvatarWithBadge username={fan.username} badge={fan.badge} size="sm" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 700, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {fan.username}
                  {isYou && <span style={{ marginLeft: 6, fontSize: 10, color: "var(--accent-magenta)" }}>You</span>}
                </p>
                <p style={{ fontSize: 10, color: "var(--text-secondary)" }}>{BADGE_LABELS[fan.badge]} · {fan.team}</p>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <p className="font-display" style={{ fontSize: 22, color: accColor }}>{fan.accuracy}%</p>
                <p style={{ fontSize: 10, color: "var(--text-muted)" }}>{fan.predictions} calls</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Sticky CTA for user outside top 10 */}
      {CURRENT_USER.rank > 10 && (
        <div style={{ position: "sticky", bottom: 0, padding: "12px 16px" }}>
          <div className="glass-card" style={{ padding: "14px 16px", borderLeft: "4px solid var(--accent-magenta)" }}>
            <p style={{ fontSize: 13 }}>
              You're ranked #{CURRENT_USER.rank} · {CURRENT_USER.accuracy}% accuracy · {CURRENT_USER.rank - 10} spots from top 10
            </p>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={onCompose}
              className="btn-gradient"
              style={{ marginTop: 10, width: "100%", padding: "10px", borderRadius: 999, fontSize: 13, border: "none", cursor: "pointer" }}
            >
              Make a prediction →
            </motion.button>
          </div>
        </div>
      )}
    </div>
  );
}
