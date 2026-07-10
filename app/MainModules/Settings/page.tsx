"use client";

import { useState } from "react";
import Link from "next/link"

// ─── Types ────────────────────────────────────────────────────────────────────

type ThemeOption = "Dark" | "Light" | "System";

interface SettingRowBase {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface SettingRowChevron extends SettingRowBase {
  type: "chevron";
}

interface SettingRowToggle extends SettingRowBase {
  type: "toggle";
  toggleKey: string;
}

interface SettingRowSelect extends SettingRowBase {
  type: "select";
  selectKey: string;
  options: ThemeOption[];
}

type SettingRow = SettingRowChevron | SettingRowToggle | SettingRowSelect;

interface SettingsSection {
  label: string;
  rows: SettingRow[];
}

// ─── Icons ────────────────────────────────────────────────────────────────────

const IconPerson = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="#e5003d" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={18} height={18}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
  </svg>
);

const IconLock = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="#e5003d" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={18} height={18}>
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const IconMail = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="#e5003d" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={18} height={18}>
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <polyline points="2 4 12 13 22 4" />
  </svg>
);

const IconBell = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="#e5003d" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={18} height={18}>
    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const IconPlay = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="#e5003d" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={18} height={18}>
    <circle cx="12" cy="12" r="10" />
    <polygon points="10 8 16 12 10 16 10 8" />
  </svg>
);

const IconGrid = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="#e5003d" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={18} height={18}>
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);

const IconMoon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="#e5003d" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={18} height={18}>
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const IconShield = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="#e5003d" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={18} height={18}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const IconBlock = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="#e5003d" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={18} height={18}>
    <circle cx="12" cy="12" r="10" />
    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
  </svg>
);

const IconTrash = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="#e5003d" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={18} height={18}>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14H6L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4h6v2" />
  </svg>
);

const IconChevronLeft = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" width={18} height={18}>
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const IconChevron = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" width={16} height={16}>
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

// ─── Data ─────────────────────────────────────────────────────────────────────

const SECTIONS: SettingsSection[] = [
  {
    label: "Account",
    rows: [
      { id: "personal", type: "chevron", title: "Personal Information", description: "Update your name, username, email and personal details", icon: <IconPerson /> },
      { id: "password", type: "chevron", title: "Change Password", description: "Update your password to keep your account secure", icon: <IconLock /> },
      { id: "email", type: "chevron", title: "Email Preferences", description: "Manage email notifications and updates", icon: <IconMail /> },
    ],
  },
  {
    label: "Preferences",
    rows: [
      { id: "notifications", type: "toggle", toggleKey: "pushNotifications", title: "Push Notifications", description: "Manage push notification preferences", icon: <IconBell /> },
      { id: "watchAlong", type: "chevron", title: "Watch Along Preferences", description: "Set default quality, auto-play and other watch settings", icon: <IconPlay /> },
      { id: "content", type: "chevron", title: "Content Preferences", description: "Choose your favorite sports, teams and topics", icon: <IconGrid /> },
      { id: "darkMode", type: "select", selectKey: "theme", options: ["Dark", "Light", "System"], title: "Dark Mode", description: "Choose your preferred theme", icon: <IconMoon /> },
    ],
  },
  {
    label: "Account & Security",
    rows: [
      { id: "privacy", type: "chevron", title: "Privacy & Security", description: "Manage your privacy settings and data", icon: <IconShield /> },
      { id: "blocked", type: "chevron", title: "Blocked Users", description: "Manage users you have blocked", icon: <IconBlock /> },
      { id: "delete", type: "chevron", title: "Delete Account", description: "Permanently delete your account and data", icon: <IconTrash /> },
    ],
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

interface ToggleProps {
  checked: boolean;
  onChange: (val: boolean) => void;
}

const Toggle: React.FC<ToggleProps> = ({ checked, onChange }) => (
  <button
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    style={{
      position: "relative",
      width: 44,
      height: 26,
      borderRadius: 999,
      background: checked ? "#e5003d" : "#444",
      border: "none",
      cursor: "pointer",
      transition: "background 0.2s",
      flexShrink: 0,
      padding: 0,
    }}
  >
    <span
      style={{
        position: "absolute",
        width: 20,
        height: 20,
        background: "#fff",
        borderRadius: "50%",
        top: 3,
        left: checked ? 21 : 3,
        transition: "left 0.2s",
        boxShadow: "0 1px 4px rgba(0,0,0,0.4)",
      }}
    />
  </button>
);

interface SelectProps {
  value: ThemeOption;
  options: ThemeOption[];
  onChange: (val: ThemeOption) => void;
}

const ThemedSelect: React.FC<SelectProps> = ({ value, options, onChange }) => (
  <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as ThemeOption)}
      style={{
        appearance: "none",
        WebkitAppearance: "none",
        background: "#2a2a2a",
        border: "1px solid #383838",
        color: "#ccc",
        fontSize: 13,
        padding: "5px 28px 5px 10px",
        borderRadius: 6,
        cursor: "pointer",
        outline: "none",
      }}
    >
      {options.map((o) => (
        <option key={o} value={o}>{o}</option>
      ))}
    </select>
    <svg
      viewBox="0 0 10 6"
      width={10}
      height={6}
      style={{ position: "absolute", right: 8, pointerEvents: "none" }}
    >
      <path fill="#888" d="M0 0l5 6 5-6z" />
    </svg>
  </div>
);

// ─── Row ──────────────────────────────────────────────────────────────────────

interface RowProps {
  row: SettingRow;
  isLast: boolean;
  toggles: Record<string, boolean>;
  selects: Record<string, ThemeOption>;
  onToggle: (key: string, val: boolean) => void;
  onSelect: (key: string, val: ThemeOption) => void;
}

const SettingRowItem: React.FC<RowProps> = ({ row, isLast, toggles, selects, onToggle, onSelect }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        padding: "14px 16px",
        cursor: "pointer",
        background: hovered ? "#222" : "transparent",
        transition: "background 0.15s",
        position: "relative",
        borderBottom: isLast ? "none" : "1px solid #252525",
      }}
    >
      {/* Icon */}
      <div style={{ width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", marginRight: 14, flexShrink: 0 }}>
        {row.icon}
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: "#e8e8e8", lineHeight: 1.3 }}>{row.title}</div>
        <div style={{ fontSize: 12, color: "#666", marginTop: 2, lineHeight: 1.3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {row.description}
        </div>
      </div>

      {/* Action */}
      <div style={{ marginLeft: 12, flexShrink: 0, display: "flex", alignItems: "center" }}>
        {row.type === "chevron" && <IconChevron />}
        {row.type === "toggle" && (
          <Toggle
            checked={toggles[row.toggleKey] ?? false}
            onChange={(val) => onToggle(row.toggleKey, val)}
          />
        )}
        {row.type === "select" && (
          <ThemedSelect
            value={selects[row.selectKey] ?? row.options[0]}
            options={row.options}
            onChange={(val) => onSelect(row.selectKey, val)}
          />
        )}
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

// ─── Main Component ───────────────────────────────────────────────────────────

const SettingsPage: React.FC = () => {
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    pushNotifications: true,
  });

  const [selects, setSelects] = useState<Record<string, ThemeOption>>({
    theme: "Dark",
  });

  const handleToggle = (key: string, val: boolean) => setToggles((prev) => ({ ...prev, [key]: val }));
  const handleSelect = (key: string, val: ThemeOption) => setSelects((prev) => ({ ...prev, [key]: val }));

  return (
    <div style={{ background: "#0d0d0d", minHeight: "100vh", padding: "24px 16px", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      <div style={{ maxWidth: 720, margin: "0 auto", width: "100%" }}>

        {/* Header — clicking the arrow goes home */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <Link
            href="/MainModules/HomePage"
            aria-label="Back to Home"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "transparent",
              border: "none",
              padding: 0,
              cursor: "pointer",
              color: "#aaa",
              flexShrink: 0,
              transition: "color 0.15s",
              textDecoration: "none"
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#f0f0f0"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#aaa"; }}
          >
            <IconChevronLeft />
          </Link>
          <div style={{ width: 4, height: 22, background: "#e5003d", borderRadius: 2, flexShrink: 0 }} />
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "#f0f0f0", letterSpacing: 0.2, margin: 0 }}>Settings</h1>
        </div>
        <p style={{ fontSize: 12.5, color: "#666", marginBottom: 28, marginLeft: 34 }}>
          Manage your account preferences and app settings
        </p>

        {/* Sections */}
        {SECTIONS.map((section) => (
          <div key={section.label}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#888", letterSpacing: 0.3, marginBottom: 6, marginTop: 22 }}>
              {section.label}
            </div>
            <div style={{ background: "#1a1a1a", borderRadius: 10, overflow: "hidden", marginBottom: 6 }}>
              {section.rows.map((row, idx) => (
                <SettingRowItem
                  key={row.id}
                  row={row}
                  isLast={idx === section.rows.length - 1}
                  toggles={toggles}
                  selects={selects}
                  onToggle={handleToggle}
                  onSelect={handleSelect}
                />
              ))}
            </div>
          </div>
        ))}

      </div>
    </div>
  );
};

export default SettingsPage;

