"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

type SetupItem = {
  id: string;
  label: string;
  category?: string;
  title?: string;
  image?: string;
  order?: number;
  active?: boolean;
};

export type SummaryItem = { label: string; image?: string };

const EDIT_URL = "/MainModules/RoarPreference?step=4&from=profile";

const SECTIONS: { category: string; icon: string; shape: "avatar" | "pill" }[] = [
  { category: "My Teams & Sports", icon: "★", shape: "avatar" },
  { category: "My Loyalties", icon: "★", shape: "pill" },
  { category: "My Interests", icon: "💬", shape: "pill" },
];

const card: React.CSSProperties = {
  background: "rgba(18,18,26,0.7)",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: 14,
};

function PlusButton({ round, onClick }: { round?: boolean; onClick: () => void }) {
  const size = round ? 56 : 30;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Add"
      style={{
        width: size, height: size, borderRadius: "50%", flexShrink: 0,
        background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.25)",
        color: "#fff", fontSize: round ? 26 : 18, cursor: "pointer", padding: 0, lineHeight: 1,
      }}
    >
      +
    </button>
  );
}

/**
 * "My Teams & Sports", "My Loyalties" and "My Interests" on the profile page.
 * The Edit link and "+" button open RoarPreference step 4.
 */
export function ProfileSetupSections({
  isOwn,
  selectedIds,
  onSummary,
}: {
  isOwn: boolean;
  /** Item ids saved on the profile. For the own profile they are fetched when omitted. */
  selectedIds?: string[];
  /** Reports the first two "My Teams & Sports" and "My Interests" labels (for the profile header). */
  onSummary?: (s: { teams: SummaryItem[]; interests: SummaryItem[] }) => void;
}) {
  const router = useRouter();
  const [items, setItems] = useState<SetupItem[]>([]);
  const [ownIds, setOwnIds] = useState<string[] | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const cfg = await axios.get("/api/roar/onboarding-config?type=profileSetup");
        if (!cancelled) setItems(cfg.data?.items ?? []);
      } catch {
        /* sections simply stay empty */
      }
      if (isOwn && selectedIds === undefined) {
        try {
          const ob = await axios.get("/api/roar/onboarding");
          if (!cancelled) setOwnIds(ob.data?.profileSetup ?? []);
        } catch {
          if (!cancelled) setOwnIds([]);
        }
      }
      if (!cancelled) setLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [isOwn, selectedIds]);

  const ids = selectedIds ?? ownIds ?? [];

  const grouped = useMemo(() => {
    const chosen = items
      .filter((i) => i.active !== false && ids.includes(i.id))
      .slice()
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const map: Record<string, SetupItem[]> = {};
    for (const it of chosen) {
      const key = it.category || it.title || "Other";
      (map[key] ||= []).push(it);
    }
    return map;
  }, [items, ids]);

  const toSummary = (list: SetupItem[]): SummaryItem[] =>
    list.slice(0, 2).map((i) => ({ label: i.label, image: i.image }));
  const teamsKey = JSON.stringify(toSummary(grouped["My Teams & Sports"] ?? []));
  const interestsKey = JSON.stringify(toSummary(grouped["My Interests"] ?? []));
  useEffect(() => {
    if (!loaded || !onSummary) return;
    onSummary({
      teams: JSON.parse(teamsKey),
      interests: JSON.parse(interestsKey),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, teamsKey, interestsKey]);

  const goEdit = () => router.push(EDIT_URL);

  if (!loaded) {
    const bar = (w: number | string, h: number, r = 8): React.CSSProperties => ({
      width: w, height: h, borderRadius: r, background: "rgba(255,255,255,0.12)",
      animation: "profile-setup-pulse 1.2s ease-in-out infinite",
    });
    return (
      <div style={{ padding: "18px 14px 0", display: "flex", flexDirection: "column", gap: 18 }}>
        <style>{`@keyframes profile-setup-pulse { 0%,100% { opacity: .35 } 50% { opacity: .7 } }`}</style>
        {SECTIONS.map(({ category, shape }) => (
          <div key={category} aria-busy="true">
            <div style={{ ...bar(140, 16), marginBottom: 14 }} />
            {shape === "avatar" ? (
              <div style={{ display: "flex", gap: 14 }}>
                {[0, 1, 2].map((i) => (
                  <div key={i} style={{ width: 64, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                    <div style={bar(56, 56, 28)} />
                    <div style={bar(44, 10, 5)} />
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ display: "flex", gap: 8 }}>
                {[84, 110, 70].map((w, i) => (
                  <div key={i} style={bar(w, 34, 10)} />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }
  // Someone else's profile with nothing selected: nothing to show.
  if (!isOwn && Object.keys(grouped).length === 0) return null;

  return (
    <div style={{ padding: "18px 14px 0", display: "flex", flexDirection: "column", gap: 18 }}>
      {SECTIONS.map(({ category, icon, shape }) => {
        const list = grouped[category] ?? [];
        if (!isOwn && list.length === 0) return null;
        return (
          <div key={category}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 15, fontWeight: 700, color: "#fff" }}>
                <span style={{ color: "#ff9f1c", fontSize: 16 }}>{icon}</span>
                {category}
              </span>
              {isOwn && (
                <button
                  type="button"
                  onClick={goEdit}
                  style={{ background: "none", border: "none", color: "#3ea6ff", fontSize: 14, fontWeight: 600, cursor: "pointer", padding: 0 }}
                >
                  Edit
                </button>
              )}
            </div>

            {shape === "avatar" ? (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 14, alignItems: "flex-start" }}>
                {list.map((it) => (
                  <div key={it.id} style={{ width: 64, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                    <span
                      style={{
                        width: 56, height: 56, borderRadius: "50%", overflow: "hidden",
                        background: "#12121a", border: "1px solid rgba(255,255,255,0.15)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}
                    >
                      {it.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={it.image} alt={it.label} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.7)" }}>
                          {it.label.slice(0, 2).toUpperCase()}
                        </span>
                      )}
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 500, color: "#fff", textAlign: "center", lineHeight: 1.2 }}>
                      {it.label}
                    </span>
                  </div>
                ))}
                {isOwn && <PlusButton round onClick={goEdit} />}
              </div>
            ) : (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                {list.map((it) => (
                  <span
                    key={it.id}
                    style={{
                      ...card, borderRadius: 10, padding: "8px 14px",
                      fontSize: 13, fontWeight: 500, color: "#fff",
                    }}
                  >
                    {it.label}
                  </span>
                ))}
                {isOwn && <PlusButton onClick={goEdit} />}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

const PREFERENCE_ROWS: { icon: string; title: string; subtitle: string; href: string }[] = [
  { icon: "🔔", title: "Match alerts", subtitle: "Live match updates, key moments", href: "/MainModules/Preferences" },
  { icon: "▶", title: "Content preferences", subtitle: "Highlights, analysis, player stories", href: "/MainModules/Preferences" },
  { icon: "💬", title: "Notification preferences", subtitle: "Predictions, debates, community activity", href: "/MainModules/Preferences" },
  { icon: "文A", title: "Language", subtitle: "English, Hindi", href: "/MainModules/Settings" },
];

/** "My Preferences" list shown below My Interests (own profile only). Static for now: no navigation. */
export function MyPreferencesCard() {
  return (
    <div style={{ padding: "22px 14px 8px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 15, fontWeight: 700, color: "#fff" }}>
          <span style={{ color: "#ff9f1c", fontSize: 16 }}>✱</span>
          My Preferences
        </span>
      </div>
      <div style={{ ...card, overflow: "hidden" }}>
        {PREFERENCE_ROWS.map((row, i) => (
          <div
            key={row.title}
            style={{
              width: "100%", display: "flex", alignItems: "center", gap: 14, padding: "14px 14px",
              textAlign: "left",
              borderTop: i === 0 ? "none" : "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <span
              style={{
                width: 44, height: 44, borderRadius: "50%", flexShrink: 0,
                background: "rgba(255,159,28,0.08)", border: "1px solid rgba(255,255,255,0.1)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#ff9f1c", fontSize: row.icon.length > 1 ? 14 : 20, fontWeight: 700,
              }}
            >
              {row.icon}
            </span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: "block", fontSize: 15, fontWeight: 600, color: "#fff" }}>{row.title}</span>
              <span style={{ display: "block", fontSize: 12.5, color: "rgba(255,255,255,0.55)", marginTop: 2 }}>
                {row.subtitle}
              </span>
            </span>
            <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 20 }}>›</span>
          </div>
        ))}
      </div>
    </div>
  );
}
