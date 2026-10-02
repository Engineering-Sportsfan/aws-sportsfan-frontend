import { useState, useEffect } from "react";
import { BADGE_CONFIG } from "../constants";

export function sanitizeAvatarUrl(raw: string | null | undefined): string | null {
  if (!raw || typeof raw !== "string") return null;
  let trimmed = raw.trim();
  if (!trimmed || trimmed === "undefined" || trimmed === "null") return null;

  // Ignore dicebear urls so real photo or colorful initials are used instead of cartoon SVGs
  if (trimmed.includes("dicebear.com") || trimmed.includes("api.dicebear")) {
    return null;
  }

  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    trimmed = trimmed.slice(1, -1).trim();
  }

  if (trimmed.startsWith("data:")) {
    trimmed = trimmed.replace(/\r?\n|\r|\s/g, "");
    const commaIdx = trimmed.indexOf(",");
    if (commaIdx !== -1) {
      const b64 = trimmed.slice(commaIdx + 1);
      if (b64.startsWith("/9j/")) {
        return `data:image/jpeg;base64,${b64}`;
      } else if (b64.startsWith("iVBORw0KGgo")) {
        return `data:image/png;base64,${b64}`;
      } else if (b64.startsWith("R0lGOD")) {
        return `data:image/gif;base64,${b64}`;
      } else if (b64.startsWith("UklGR")) {
        return `data:image/webp;base64,${b64}`;
      }
    }
    return trimmed;
  }

  const cleanedNoSpace = trimmed.replace(/\r?\n|\r|\s/g, "");
  if (cleanedNoSpace.startsWith("/9j/")) {
    return `data:image/jpeg;base64,${cleanedNoSpace}`;
  }
  if (cleanedNoSpace.startsWith("iVBORw0KGgo")) {
    return `data:image/png;base64,${cleanedNoSpace}`;
  }

  return trimmed;
}

const AVATAR_GRADIENTS = [
  "linear-gradient(135deg, #d97706, #ca8a04)",
  "linear-gradient(135deg, #9333ea, #4f46e5)",
  "linear-gradient(135deg, #db2777, #e11d48)",
  "linear-gradient(135deg, #2563eb, #0891b2)",
  "linear-gradient(135deg, #059669, #0d9488)",
  "linear-gradient(135deg, #ea580c, #dc2626)",
];

export function getAvatarGradient(name: string): string {
  let hash = 0;
  const str = name || "";
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length];
}

export function getInitials(name: string): string {
  if (!name) return "SF";
  const clean = name.replace(/[@_.-]/g, " ").trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return (clean.slice(0, 2) || "SF").toUpperCase();
}

interface Props {
  username: string;
  badge?: string;
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  avatarUrl?: string;
}

const SIZES: Record<string, any> = {
  sm: { outer: 25, avatar: 20, ring: 25, icon: 10, stroke: 3 },
  md: { outer: 30, avatar: 35, ring: 35, icon: 15, stroke: 3 },
  lg: { outer: 50, avatar: 40, ring: 50, icon: 18, stroke: 3 },
};

export default function AvatarWithBadge({ username, badge = "RISING_FAN", size = "md", onClick, avatarUrl: customAvatarUrl }: Props) {
  const s = SIZES[size] || SIZES.md;
  const cfg = BADGE_CONFIG[badge] || BADGE_CONFIG.RISING_FAN;
  const gradId = `rg-${username}-${size}`.replace(/[^a-zA-Z0-9]/g, "");
  const radius = (s.ring - s.stroke) / 2;
  const cx = s.outer / 2;
  const circ = 2 * Math.PI * radius;
  const resolvedAvatar = sanitizeAvatarUrl(customAvatarUrl);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [resolvedAvatar]);

  return (
    <div
      onClick={onClick}
      style={{
        width: s.outer,
        height: s.outer,
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        cursor: onClick ? "pointer" : undefined,
      }}
    >
      <svg width={s.outer} height={s.outer} style={{ position: "absolute", inset: 0 }}>
        <defs>
          {cfg.gradient && (
            <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
              {cfg.gradient.map((c: string, i: number) => (
                <stop
                  key={i}
                  offset={`${(i / (cfg.gradient.length - 1)) * 100}%`}
                  stopColor={c}
                />
              ))}
            </linearGradient>
          )}
        </defs>
        <circle
          cx={cx}
          cy={cx}
          r={radius}
          fill="none"
          stroke={cfg.borderOnly ? "var(--border)" : `url(#${gradId})`}
          strokeWidth={s.stroke}
          strokeDasharray={
            cfg.dashed
              ? "6 4"
              : cfg.animated
                ? `${circ * 0.25} ${circ * 0.75}`
                : undefined
          }
          strokeLinecap="round"
          className={cfg.animated ? "oracle-ring-animate" : ""}
          style={{ transformOrigin: `${cx}px ${cx}px` }}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          width: s.avatar,
          height: s.avatar,
          top: (s.outer - s.avatar) / 2,
          left: (s.outer - s.avatar) / 2,
          borderRadius: "50%",
          overflow: "hidden",
          background: "var(--bg-tertiary)",
          boxShadow: cfg.glow !== "none" ? cfg.glow : undefined,
        }}
      >
        {resolvedAvatar && !imgError ? (
          <img
            src={resolvedAvatar}
            alt={username}
            referrerPolicy="no-referrer"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              background: getAvatarGradient(username),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              color: "#ffffff",
              fontSize: Math.max(8, Math.round(s.avatar * 0.42)),
              textTransform: "uppercase",
              userSelect: "none",
            }}
          >
            {getInitials(username)}
          </div>
        )}
      </div>
      <div
        style={{
          position: "absolute",
          width: s.icon,
          height: s.icon,
          bottom: 0,
          right: 0,
          borderRadius: "50%",
          background: cfg.iconBg,
          border: "2px solid var(--bg-primary)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: s.icon <= 16 ? 8 : s.icon <= 20 ? 10 : 12,
          zIndex: 10,
          overflow: "hidden",
        }}
      >
        {cfg.iconSrc ? (
          <img
            src={cfg.iconSrc}
            alt={cfg.name || "badge"}
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
          />
        ) : (
          cfg.icon
        )}
      </div>
    </div>
  );
}
