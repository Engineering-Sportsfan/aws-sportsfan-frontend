import { avatarUrl, BADGE_CONFIG } from "../constants";

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
        <img
          src={customAvatarUrl || avatarUrl(username)}
          alt={username}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          loading="lazy"
        />
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
        }}
      >
        {cfg.icon}
      </div>
    </div>
  );
}
