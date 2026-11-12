"use client";

import { useState } from "react";

type Tab = "badges" | "tiers" | "how";

export type LevelOverlayProps = {
  open: boolean;
  onClose: () => void;
  level: number;
  levelName: string;
  pct: number;
  xpRemaining: number;
  totalPoints: number;
  tierLevel?: number;
  tierLabel?: string;
  /** Feature badges: { feature, level, icons, labels, label, thresholds } */
  featureBadges: any[];
  /** Special badges: { id, name, unlocked, iconSrc, icon, imageUrl } */
  specialBadges: any[];
  /** Opinions: any debate / hot-take like objects */
  opinions: any[];
  onBadgeClick?: (badge: any) => void;
  resolveSpecialIcon?: (b: any) => string;
};

const TIER_COUNT = 7;

const card: React.CSSProperties = {
  background: "rgba(18,18,26,0.7)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 14,
};

function num(v: any): number | undefined {
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

function compact(n: number | undefined): string {
  if (n === undefined) return "0";
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, "")}K`;
  return String(n);
}

export function LevelOverlay(p: LevelOverlayProps) {
  const [tab, setTab] = useState<Tab>("badges");
  const [showAllBadges, setShowAllBadges] = useState(false);
  if (!p.open) return null;

  const wonFeature = p.featureBadges.filter((fb) => fb.level > 0);
  const wonSpecial = p.specialBadges.filter((b) => b.unlocked !== false);
  const badgeCount = wonFeature.length + wonSpecial.length;

  // One combined list, latest-earned first (stable: keeps the existing order when no timestamps exist).
  const earnedAt = (b: any): number => {
    const raw = b?.earnedAt ?? b?.unlockedAt ?? b?.awardedAt ?? b?.achievedAt ?? b?.updatedAt ?? b?.createdAt;
    const t = typeof raw === "number" ? raw : raw ? Date.parse(String(raw)) : 0;
    return Number.isFinite(t) ? t : 0;
  };
  const badgeEntries = [
    ...wonFeature.map((badge) => ({ kind: "feature" as const, badge })),
    ...wonSpecial.map((badge) => ({ kind: "special" as const, badge })),
  ]
    .map((e, i) => ({ ...e, i, t: earnedAt(e.badge) }))
    .sort((a, b) => b.t - a.t || a.i - b.i);
  // Single row only: the latest 4 until "View all" is tapped.
  const shownBadges = showAllBadges ? badgeEntries : badgeEntries.slice(0, 4);

  const body = (
    <div
      style={{
        position: "absolute", inset: 0, zIndex: 60, background: "#070b14", color: "#fff",
        display: "flex", flexDirection: "column", overflow: "hidden",
      }}
    >
      {/* Top bar with back button (stays inside the page area, so the sidebar remains visible) */}
      <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <button
          type="button"
          onClick={p.onClose}
          aria-label="Back"
          data-nav="back"
          style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", padding: "4px 2px", display: "flex" }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>Level &amp; Badges</h3>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflowY: "auto", overscrollBehavior: "contain", paddingBottom: 40 }}>
        {/* Level header card */}
        <div style={{ padding: "16px 14px 18px" }}>
          <div
            style={{
              ...card, padding: 16, display: "flex", alignItems: "center", gap: 16,
              background: "linear-gradient(135deg, rgba(147,51,234,0.18), rgba(18,18,26,0.8))",
            }}
          >
            <div
              style={{
                width: 64, height: 72, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
                clipPath: "polygon(50% 0, 100% 15%, 100% 65%, 50% 100%, 0 65%, 0 15%)",
                background: "linear-gradient(160deg, #d946ef, #7c3aed)",
                fontSize: 30, fontWeight: 900,
              }}
            >
              {p.level}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 800 }}>Level {p.level}</div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "rgba(255,255,255,0.85)" }}>{p.levelName}</div>
                </div>
                <div style={{ textAlign: "right", fontSize: 11, color: "rgba(255,255,255,0.55)", lineHeight: 1.3 }}>
                  Next level
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>
                    {p.xpRemaining.toLocaleString()} pts
                  </div>
                </div>
              </div>
              <div style={{ height: 8, background: "rgba(255,255,255,0.12)", borderRadius: 4, overflow: "hidden", marginTop: 10 }}>
                <div style={{ height: "100%", width: `${p.pct}%`, background: "linear-gradient(90deg, #ff6b35, #ff9f1c)", borderRadius: 4 }} />
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 6 }}>
                {p.totalPoints.toLocaleString()} pts total
              </div>
            </div>
          </div>
        </div>
        {/* Tabs */}
        <div style={{ display: "flex", marginTop: 0, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          {([["badges", "Badges"], ["tiers", "Tiers"], ["how", "How It Works"]] as const).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              style={{
                flex: 1, padding: "12px 0", background: "none", border: "none", cursor: "pointer",
                fontSize: 15, fontWeight: 600,
                color: tab === id ? "#ff9f1c" : "rgba(255,255,255,0.75)",
                borderBottom: tab === id ? "2px solid #ff9f1c" : "2px solid transparent",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "badges" && (
          <div className="badges-section" style={{ padding: "16px 14px 0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, gap: 10 }}>
              <span style={{ fontSize: 17, fontWeight: 700 }}>My Badges</span>
              <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {/* <span style={{ color: "#3ea6ff", fontSize: 13, fontWeight: 600 }}>{badgeCount} won</span> */}
                {badgeCount > 4 && (
                  <button
                    type="button"
                    onClick={() => setShowAllBadges((v) => !v)}
                    style={{
                      padding: "4px 12px", borderRadius: 16, cursor: "pointer", fontSize: 12, fontWeight: 600,
                      color: "#3ea6ff", background: "rgba(62,166,255,0.1)", border: "1px solid rgba(62,166,255,0.3)",
                    }}
                  >
                    {showAllBadges ? "Show less" : "View all"}
                  </button>
                )}
              </span>
            </div>

            {badgeCount === 0 ? (
              <div style={{ ...card, padding: "22px 16px", textAlign: "center", fontSize: 13, color: "rgba(255,255,255,0.5)" }}>
                No badges won yet — get posting, predicting, and debating!
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
                {shownBadges.map(({ kind, badge }) => {
                  const isFeature = kind === "feature";
                  const icon = isFeature
                    ? badge.icons?.[Math.max(0, badge.level - 1)]
                    : (p.resolveSpecialIcon ? p.resolveSpecialIcon(badge) : badge.iconSrc || badge.icon || badge.imageUrl);
                  const name = isFeature
                    ? (badge.labels?.[Math.max(0, badge.level - 1)] || badge.label || badge.feature)
                    : (badge.name || badge.title || "Special Badge");
                  return (
                    <button
                      key={isFeature ? `f-${badge.feature}` : `s-${badge.id ?? name}`}
                      type="button"
                      onClick={() => p.onBadgeClick?.({ kind, badge })}
                      style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}
                    >
                      <span style={{ width: 64, height: 64, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {icon ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={icon} alt={name} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                        ) : (
                          <span style={{ fontSize: 30 }}>🏅</span>
                        )}
                      </span>
                      <span style={{ fontSize: 11.5, fontWeight: 600, textAlign: "center", lineHeight: 1.2 }}>{name}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* My Opinions */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "26px 0 12px" }}>
              <span style={{ fontSize: 17, fontWeight: 700 }}>My Opinions</span>
              <span style={{ color: "#3ea6ff", fontSize: 13, fontWeight: 600 }}>{p.opinions.length} total</span>
            </div>
            {p.opinions.length === 0 ? (
              <div style={{ ...card, padding: "22px 16px", textAlign: "center", fontSize: 13, color: "rgba(255,255,255,0.5)" }}>
                Your debates and hot takes will show up here.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {p.opinions.slice(0, 20).map((o, i) => {
                  const title = o.title || o.question || o.topic || o.text || o.content || "Opinion";
                  const agreed = num(o.agreed ?? o.agreeCount ?? o.agree ?? o.yesCount ?? o.likes);
                  const disagreed = num(o.disagreed ?? o.disagreeCount ?? o.disagree ?? o.noCount);
                  const image = o.image || o.imageUrl || o.icon;
                  return (
                    <div key={o.id ?? i} style={{ ...card, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12 }}>
                      <span
                        style={{
                          width: 44, height: 44, borderRadius: "50%", flexShrink: 0, overflow: "hidden",
                          background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
                        }}
                      >
                        {image && typeof image === "string" && image.startsWith("http") ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          "💬"
                        )}
                      </span>
                      <span style={{ flex: 1, minWidth: 0 }}>
                        <span
                          style={{
                            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
                            fontSize: 14, fontWeight: 600, lineHeight: 1.3,
                          }}
                        >
                          {title}
                        </span>
                        {(agreed !== undefined || disagreed !== undefined) && (
                          <span style={{ display: "block", fontSize: 12, color: "rgba(255,255,255,0.55)", marginTop: 4 }}>
                            {compact(agreed)} agreed · {compact(disagreed)} disagreed
                          </span>
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {tab === "tiers" && (
          <div style={{ padding: "16px 14px 0", display: "flex", flexDirection: "column", gap: 10 }}>
            {Array.from({ length: TIER_COUNT }, (_, i) => i + 1).map((t) => {
              const current = p.tierLevel === t;
              const reached = (p.tierLevel ?? 0) >= t;
              return (
                <div
                  key={t}
                  style={{
                    ...card, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12,
                    borderColor: current ? "#ff9f1c" : "rgba(255,255,255,0.08)",
                    opacity: reached ? 1 : 0.55,
                  }}
                >
                  <span
                    style={{
                      width: 34, height: 34, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                      fontWeight: 800, background: reached ? "linear-gradient(135deg,#ff6b35,#ff9f1c)" : "rgba(255,255,255,0.08)",
                    }}
                  >
                    {t}
                  </span>
                  <span style={{ flex: 1, fontSize: 15, fontWeight: 600 }}>
                    Tier {t}
                    {current && p.tierLabel ? <span style={{ color: "rgba(255,255,255,0.55)", fontWeight: 500 }}> · {p.tierLabel}</span> : null}
                  </span>
                  {current && <span style={{ fontSize: 11, color: "#ff9f1c", fontWeight: 700 }}>CURRENT</span>}
                </div>
              );
            })}
          </div>
        )}

        {tab === "how" && (
          <div style={{ padding: "16px 14px 0", display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ ...card, padding: 16 }}>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>Earn points</div>
              <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.65)", lineHeight: 1.5 }}>
                Posting, predicting, debating, reacting and playing quizzes all earn points. Level 1 needs 1,000 pts, and
                each next level needs 1,000 pts more than the one before.
              </p>
            </div>
            <div style={{ ...card, padding: 16 }}>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 10 }}>Win badges</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {p.featureBadges.map((fb) => (
                  <div key={fb.feature} style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                    <span style={{ textTransform: "capitalize", color: "rgba(255,255,255,0.85)" }}>
                      {String(fb.feature).replace(/([A-Z])/g, " $1")}
                    </span>
                    <span style={{ color: "rgba(255,255,255,0.55)" }}>
                      Level {fb.level}/{fb.labels?.length ?? 5}
                      {fb.thresholds ? ` · next at ${fb.thresholds[Math.min(fb.level, fb.thresholds.length - 1)]}` : ""}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return body;
}
