"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  MapPin,
  BarChart3,
  Calendar,
  Trophy,
  Shield,
  Users,
  Clock,
  TrendingUp,
  Star,
  Target,
} from "lucide-react";

// ─── Local flag assets (/public/FIFA) ──────────────────────────────────────
const FLAG_FILE: Record<string, string> = {
  "USA": "usa",
  "United States": "usa",
  "Korea Republic": "south-korea",
  "South Korea": "south-korea",
  "Ivory Coast": "ivory-coast",
  "Cote d'Ivoire": "ivory-coast",
  "Côte d'Ivoire": "ivory-coast",
  "Republic of Ireland": "republic-of-ireland",
  "Czechia": "czech-republic",
  "Türkiye": "turkey",
  "Bosnia and Herzegovina": "bosnia",
};

function getFlagSlug(countryName?: string): string {
  if (!countryName) return "";
  const trimmed = countryName.trim();

  if (FLAG_FILE[trimmed]) return FLAG_FILE[trimmed];

  const lower = trimmed.toLowerCase();
  const found = Object.entries(FLAG_FILE).find(([k]) => k.toLowerCase() === lower);
  if (found) return found[1];

  return lower
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function flagSrc(countryName?: string): string {
  const slug = getFlagSlug(countryName);
  if (!slug) return "";
  return `/FIFA/${slug}.svg`;
}

function altFlagSrc(countryName?: string): string {
  // Fallback: try a simple slugified version of the raw name,
  // in case the mapped slug doesn't match the actual file on disk.
  if (!countryName) return "";
  const altSlug = countryName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
  const mappedSlug = getFlagSlug(countryName);
  if (altSlug && altSlug !== mappedSlug) return `/FIFA/${altSlug}.svg`;
  return "";
}

// ─── Country Code Fallback (used when flag image is unavailable) ──────────
const COUNTRY_CODE: Record<string, string> = {
  "Czechia": "CZ",
  "Czech Republic": "CZ",
  "South Korea": "KR",
  "Korea Republic": "KR",
  "United States": "US",
  "USA": "US",
  "Ivory Coast": "CI",
  "Cote d'Ivoire": "CI",
  "Côte d'Ivoire": "CI",
  "Republic of Ireland": "IE",
  "Türkiye": "TR",
  "Turkey": "TR",
  "Bosnia and Herzegovina": "BA",
  "New Zealand": "NZ",
  "South Africa": "ZA",
  "Saudi Arabia": "SA",
  "Cabo Verde": "CV",
  "Congo DR": "CD",
};

function countryCode(name?: string): string {
  if (!name) return "??";
  const trimmed = name.trim();
  if (COUNTRY_CODE[trimmed]) return COUNTRY_CODE[trimmed];
  const found = Object.entries(COUNTRY_CODE).find(([k]) => k.toLowerCase() === trimmed.toLowerCase());
  if (found) return found[1];
  // Default: first two letters of the name
  const letters = trimmed.replace(/[^a-zA-Z]/g, "");
  return (letters.slice(0, 2) || "??").toUpperCase();
}

// ─── Types ────────────────────────────────────────────────────────────────

type Team = {
  name: string;
  p: number;
  w: number;
  d: number;
  l: number;
  gd: number;
  pts: number;
};

type Group = {
  name: string;
  color: string;
  teams: Team[];
};

type Fixture = {
  status: "LIVE" | "UPCOMING" | "FT";
  group: string;
  time?: string;
  minute?: string;
  homeName: string;
  homeScore?: number;
  awayName: string;
  awayScore?: number;
  venue: string;
};

type Result = {
  homeName: string;
  homeScore: number;
  awayName: string;
  awayScore: number;
  group: string;
  when: string;
};

type BracketTeam = {
  name?: string;
  label?: string;
};

type BracketMatch = {
  id: string;
  date?: string;
  time?: string;
  home: BracketTeam;
  away: BracketTeam;
  homeScore?: number;
  awayScore?: number;
  status?: "done" | "upcoming" | "tbd";
};

// ─── Data ────────────────────────────────────────────────────────────────

const groups: Group[] = [
  {
    name: "GROUP A", color: "#22c55e",
    teams: [
      { name: "Mexico",         p: 1, w: 1, d: 0, l: 0, gd:  2, pts: 3 },
      { name: "South Korea",    p: 1, w: 1, d: 0, l: 0, gd:  1, pts: 3 },
      { name: "Czechia",        p: 1, w: 0, d: 0, l: 1, gd: -1, pts: 0 },
      { name: "South Africa",   p: 1, w: 0, d: 0, l: 1, gd: -2, pts: 0 },
    ],
  },
  {
    name: "GROUP B", color: "#a855f7",
    teams: [
      { name: "Canada",                 p: 0, w: 0, d: 0, l: 0, gd: 0, pts: 0 },
      { name: "Bosnia and Herzegovina", p: 0, w: 0, d: 0, l: 0, gd: 0, pts: 0 },
      { name: "Qatar",                  p: 0, w: 0, d: 0, l: 0, gd: 0, pts: 0 },
      { name: "Switzerland",            p: 0, w: 0, d: 0, l: 0, gd: 0, pts: 0 },
    ],
  },
  {
    name: "GROUP C", color: "#3b82f6",
    teams: [
      { name: "Brazil",   p: 0, w: 0, d: 0, l: 0, gd: 0, pts: 0 },
      { name: "Morocco",  p: 0, w: 0, d: 0, l: 0, gd: 0, pts: 0 },
      { name: "Haiti",    p: 0, w: 0, d: 0, l: 0, gd: 0, pts: 0 },
      { name: "Scotland", p: 0, w: 0, d: 0, l: 0, gd: 0, pts: 0 },
    ],
  },
  {
    name: "GROUP D", color: "#eab308",
    teams: [
      { name: "USA",       p: 0, w: 0, d: 0, l: 0, gd: 0, pts: 0 },
      { name: "Paraguay",  p: 0, w: 0, d: 0, l: 0, gd: 0, pts: 0 },
      { name: "Australia", p: 0, w: 0, d: 0, l: 0, gd: 0, pts: 0 },
      { name: "Türkiye",   p: 0, w: 0, d: 0, l: 0, gd: 0, pts: 0 },
    ],
  },
  {
    name: "GROUP E", color: "#06b6d4",
    teams: [
      { name: "Germany",       p: 0, w: 0, d: 0, l: 0, gd: 0, pts: 0 },
      { name: "Curaçao",       p: 0, w: 0, d: 0, l: 0, gd: 0, pts: 0 },
      { name: "Ivory Coast",   p: 0, w: 0, d: 0, l: 0, gd: 0, pts: 0 },
      { name: "Ecuador",       p: 0, w: 0, d: 0, l: 0, gd: 0, pts: 0 },
    ],
  },
  {
    name: "GROUP F", color: "#ec4899",
    teams: [
      { name: "Netherlands", p: 0, w: 0, d: 0, l: 0, gd: 0, pts: 0 },
      { name: "Japan",       p: 0, w: 0, d: 0, l: 0, gd: 0, pts: 0 },
      { name: "Sweden",      p: 0, w: 0, d: 0, l: 0, gd: 0, pts: 0 },
      { name: "Tunisia",     p: 0, w: 0, d: 0, l: 0, gd: 0, pts: 0 },
    ],
  },
  {
    name: "GROUP G", color: "#f43f5e",
    teams: [
      { name: "Belgium",     p: 0, w: 0, d: 0, l: 0, gd: 0, pts: 0 },
      { name: "Egypt",       p: 0, w: 0, d: 0, l: 0, gd: 0, pts: 0 },
      { name: "IR Iran",     p: 0, w: 0, d: 0, l: 0, gd: 0, pts: 0 },
      { name: "New Zealand", p: 0, w: 0, d: 0, l: 0, gd: 0, pts: 0 },
    ],
  },
  {
    name: "GROUP H", color: "#8b5cf6",
    teams: [
      { name: "Spain",        p: 0, w: 0, d: 0, l: 0, gd: 0, pts: 0 },
      { name: "Cabo Verde",   p: 0, w: 0, d: 0, l: 0, gd: 0, pts: 0 },
      { name: "Saudi Arabia", p: 0, w: 0, d: 0, l: 0, gd: 0, pts: 0 },
      { name: "Uruguay",      p: 0, w: 0, d: 0, l: 0, gd: 0, pts: 0 },
    ],
  },
  {
    name: "GROUP I", color: "#10b981",
    teams: [
      { name: "France",  p: 0, w: 0, d: 0, l: 0, gd: 0, pts: 0 },
      { name: "Senegal", p: 0, w: 0, d: 0, l: 0, gd: 0, pts: 0 },
      { name: "Iraq",    p: 0, w: 0, d: 0, l: 0, gd: 0, pts: 0 },
      { name: "Norway",  p: 0, w: 0, d: 0, l: 0, gd: 0, pts: 0 },
    ],
  },
  {
    name: "GROUP J", color: "#f97316",
    teams: [
      { name: "Argentina", p: 0, w: 0, d: 0, l: 0, gd: 0, pts: 0 },
      { name: "Algeria",   p: 0, w: 0, d: 0, l: 0, gd: 0, pts: 0 },
      { name: "Austria",   p: 0, w: 0, d: 0, l: 0, gd: 0, pts: 0 },
      { name: "Jordan",    p: 0, w: 0, d: 0, l: 0, gd: 0, pts: 0 },
    ],
  },
  {
    name: "GROUP K", color: "#0ea5e9",
    teams: [
      { name: "Portugal",   p: 0, w: 0, d: 0, l: 0, gd: 0, pts: 0 },
      { name: "Congo DR",   p: 0, w: 0, d: 0, l: 0, gd: 0, pts: 0 },
      { name: "Uzbekistan", p: 0, w: 0, d: 0, l: 0, gd: 0, pts: 0 },
      { name: "Colombia",   p: 0, w: 0, d: 0, l: 0, gd: 0, pts: 0 },
    ],
  },
  {
    name: "GROUP L", color: "#d946ef",
    teams: [
      { name: "England", p: 0, w: 0, d: 0, l: 0, gd: 0, pts: 0 },
      { name: "Croatia", p: 0, w: 0, d: 0, l: 0, gd: 0, pts: 0 },
      { name: "Ghana",   p: 0, w: 0, d: 0, l: 0, gd: 0, pts: 0 },
      { name: "Panama",  p: 0, w: 0, d: 0, l: 0, gd: 0, pts: 0 },
    ],
  },
];

const todaysMatches: Fixture[] = [
  {
    status: "FT", group: "Group A", minute: "FT",
    homeName: "South Korea", homeScore: 2,
    awayName: "Czechia", awayScore: 1,
    venue: "MetLife Stadium, NJ",
  },
  {
    status: "FT", group: "Group A", minute: "FT",
    homeName: "Mexico", homeScore: 2,
    awayName: "South Africa", awayScore: 0,
    venue: "Azteca Stadium",
  }
];

const upcomingFixtures: Fixture[] = [
  { status: "UPCOMING", group: "Group B", time: "12:30 AM", homeName: "Canada",       awayName: "Bosnia and Herzegovina", venue: "BMO Field" },
  { status: "UPCOMING", group: "Group D", time: "6:30 AM",  homeName: "USA",          awayName: "Paraguay", venue: "SoFi Stadium" },
  { status: "UPCOMING", group: "Group B", time: "12:30 AM", homeName: "Qatar",        awayName: "Switzerland", venue: "MetLife Stadium" },
  { status: "UPCOMING", group: "Group C", time: "3:30 AM",  homeName: "Brazil",       awayName: "Morocco", venue: "Hard Rock Stadium" },
  { status: "UPCOMING", group: "Group C", time: "6:30 AM",  homeName: "Haiti",        awayName: "Scotland", venue: "Gillette Stadium" },
  { status: "UPCOMING", group: "Group D", time: "9:30 AM",  homeName: "Australia",    awayName: "Türkiye", venue: "Q2 Stadium" },
  { status: "UPCOMING", group: "Group E", time: "10:30 PM", homeName: "Germany",      awayName: "Curaçao", venue: "Mercedes-Benz Stadium" },
  { status: "UPCOMING", group: "Group F", time: "1:30 AM",  homeName: "Netherlands",  awayName: "Japan", venue: "Lumen Field" },
  { status: "UPCOMING", group: "Group E", time: "4:30 AM",  homeName: "Ivory Coast",  awayName: "Ecuador", venue: "NRG Stadium" },
  { status: "UPCOMING", group: "Group F", time: "7:30 AM",  homeName: "Sweden",       awayName: "Tunisia", venue: "Levi's Stadium" },
  { status: "UPCOMING", group: "Group H", time: "9:30 PM",  homeName: "Spain",        awayName: "Cabo Verde", venue: "MetLife Stadium" },
];

const recentResults: Result[] = [
  { homeName: "Mexico", homeScore: 2, awayName: "South Africa", awayScore: 0, group: "Group A", when: "Today" },
  { homeName: "South Korea", homeScore: 2, awayName: "Czechia", awayScore: 1, group: "Group A", when: "Today" },
];

const r16Matches: BracketMatch[] = [
  { id: "r16-1", date: "JUN 28", time: "9:00 PM",  home: { label: "1A" }, away: { label: "2B" }, status: "tbd" },
  { id: "r16-2", date: "JUN 28", time: "1:30 AM",  home: { label: "1C" }, away: { label: "2D" }, status: "tbd" },
  { id: "r16-3", date: "JUN 29", time: "9:00 PM",  home: { label: "1E" }, away: { label: "2F" }, status: "tbd" },
  { id: "r16-4", date: "JUN 29", time: "1:30 AM",  home: { label: "M4" }, away: { label: "M5" }, status: "tbd" },
  { id: "r16-5", date: "JUN 30", time: "9:00 PM",  home: { label: "M6" }, away: { label: "M7" }, status: "tbd" },
  { id: "r16-6", date: "JUN 30", time: "1:30 AM",  home: { label: "M8" }, away: { label: "M9" }, status: "tbd" },
  { id: "r16-7", date: "JUL 1",  time: "9:00 PM",  home: { label: "M10" }, away: { label: "M11" }, status: "tbd" },
  { id: "r16-8", date: "JUL 1",  time: "1:30 AM",  home: { label: "M12" }, away: { label: "M13" }, status: "tbd" },
];

const qfMatches: BracketMatch[] = [
  { id: "qf-1", date: "JUL 4", time: "9:00 PM",  home: {}, away: {}, status: "tbd" },
  { id: "qf-2", date: "JUL 4", time: "1:30 AM",  home: {}, away: {}, status: "tbd" },
  { id: "qf-3", date: "JUL 5", time: "9:00 PM",  home: {}, away: {}, status: "tbd" },
  { id: "qf-4", date: "JUL 5", time: "1:30 AM",  home: {}, away: {}, status: "tbd" },
];

const sfMatches: BracketMatch[] = [
  { id: "sf-1", date: "JUL 8", time: "1:30 AM", home: {}, away: {}, status: "tbd" },
  { id: "sf-2", date: "JUL 9", time: "1:30 AM", home: {}, away: {}, status: "tbd" },
];

const finalMatch: BracketMatch = {
  id: "final", date: "JUL 13", time: "9:00 PM",
  home: {}, away: {}, status: "tbd",
};

const tabs = [
  { key: "overview",   label: "OVERVIEW",          icon: Trophy },
  { key: "stats",      label: "TOURNAMENT STATS",  icon: BarChart3 },
  { key: "fixtures",   label: "FIXTURES",           icon: Calendar },
  { key: "knockouts",  label: "KNOCKOUTS",          icon: Trophy },
];

// ─── Flag Image Components ────────────────────────────────────────────────

function FlagBadge({ name, size = "md" }: { name?: string; size?: "sm" | "md" | "lg" }) {
  const dims =
    size === "lg" ? "w-14 h-10 sm:w-20 sm:h-14 md:w-24 md:h-16 rounded-xl sm:rounded-2xl"
    : size === "md" ? "w-14 h-10 rounded-xl"
    : "w-7 h-5 rounded-md";

  const codeSize = size === "lg" ? "text-base sm:text-lg" : size === "md" ? "text-[11px]" : "text-[8px]";
  // const src = name ? flagSrc(name) : "";
const src = name === "Czechia" ? "" : (name ? flagSrc(name) : "");
  return (
    <div
      className={`${dims} flex items-center justify-center border border-white/10 overflow-hidden flex-shrink-0 relative`}
      style={{ background: "linear-gradient(160deg, #1B2A4A 0%, #0E1830 100%)" }}
    >
      {src ? (
        <>
          <img
            src={src}
            alt={name}
            className="w-full h-full object-cover absolute inset-0"
            loading="lazy"
            onError={(e) => {
              const img = e.target as HTMLImageElement;
              const alt = altFlagSrc(name);
              if (alt && img.dataset.triedAlt !== "1") {
                img.dataset.triedAlt = "1";
                img.src = alt;
                return;
              }
              img.style.display = "none";
              const fallback = img.nextElementSibling as HTMLElement | null;
              if (fallback) fallback.style.display = "flex";
            }}
          />
          <div className="w-full h-full flex items-center justify-center" style={{ display: "none" }}>
            <span className={`font-black text-gray-400 tracking-wider ${codeSize}`}>{countryCode(name)}</span>
          </div>
        </>
      ) : (
        <span className={`font-black text-gray-400 tracking-wider ${codeSize}`}>{countryCode(name)}</span>
      )}
    </div>
  );
}

function FlagChip({ name }: { name?: string }) {
  const src = name === "Czechia" ? "" : (name ? flagSrc(name) : "");

  return (
    <div
      className="w-6 h-[18px] sm:w-8 sm:h-6 rounded-md border border-white/10 flex items-center justify-center flex-shrink-0 overflow-hidden"
      style={{ background: "linear-gradient(160deg, #1B2A4A 0%, #0E1830 100%)" }}
    >
      {src ? (
        <img
          src={src}
          alt={name}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => {
            const img = e.target as HTMLImageElement;
            const alt = altFlagSrc(name);
            if (alt && img.dataset.triedAlt !== "1") {
              img.dataset.triedAlt = "1";
              img.src = alt;
              return;
            }
            img.replaceWith(
              Object.assign(document.createElement("span"), {
                textContent: countryCode(name),
                className: "text-[7px] font-black text-gray-400",
              })
            );
          }}
        />
      ) : (
        <span className="text-[7px] font-black text-gray-400">{countryCode(name)}</span>
      )}
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function MatchCenter() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  // const featured = todaysMatches;
  const featured = todaysMatches[0];

  return (
    <div
      className="min-h-screen text-white font-sans pb-10"
      style={{ background: "linear-gradient(160deg, #050B1E 0%, #060C20 40%, #04081A 100%)" }}
    >
      <div className="max-w-[1100px] mx-auto px-2 sm:px-4 pt-5">

        {/* ── HEADER ───────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between gap-2 mb-5">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm font-bold tracking-widest text-gray-300 hover:text-white transition-colors flex-shrink-0"
          >
            <ChevronLeft size={20} />
            <span className="hidden sm:inline">MATCH CENTER</span>
          </button>

          <div className="flex flex-col items-center flex-1 min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 max-w-full">
              <span className="text-base sm:text-2xl flex-shrink-0">🏆</span>
              <h1 className="text-[12px] sm:text-xl font-black tracking-wide text-white whitespace-nowrap">
                FIFA WORLD CUP 2026<sup className="text-[8px]">™</sup>
              </h1>
            </div>
            <span className="text-[8px] sm:text-[10px] tracking-[0.1em] sm:tracking-[0.15em] text-gray-400 font-semibold mt-0.5 text-center whitespace-nowrap">
              GROUP A • MATCHDAY 1
            </span>
          </div>

          <div className="w-5 sm:flex-1 flex-shrink-0" />
        </div>

        {/* ── LIVE MATCH CARD ──────────────────────────────────────────── */}
        <div
          className="relative rounded-2xl border border-white/10 overflow-hidden mb-5 shadow-[0_0_30px_rgba(10,21,48,0.8)]"
          style={{ background: "linear-gradient(135deg,#0A1530 0%,#0E1F45 50%, #0A1530 100%)" }}
        >
          <div
            className="absolute inset-0 opacity-25 pointer-events-none"
            style={{
              background: "repeating-linear-gradient(115deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 1px, transparent 1px, transparent 46px)",
            }}
          />
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-500/10 blur-[120px] pointer-events-none" />

          <button className="absolute top-3 right-3 w-7 h-7 rounded-lg border border-white/10 flex items-center justify-center text-gray-300 hover:bg-white/10 z-10 transition-colors">
            <ChevronDown size={14} className="rotate-180" />
          </button>

          <div className="relative z-10 p-3 sm:p-6 md:p-8">
            <div className="flex items-center justify-between gap-1 sm:gap-4">
              <div className="flex flex-col items-center gap-2 sm:gap-3 flex-1 min-w-0 max-w-[35%] sm:max-w-none">
                <FlagBadge name={featured.homeName} size="lg" />
                <span className="font-black tracking-wide sm:tracking-widest text-[10px] sm:text-sm md:text-base text-center leading-tight break-words w-full">{featured?.homeName?.toUpperCase()}</span>
              </div>
              <div className="flex flex-col items-center gap-2 flex-shrink-0">
                <div className="flex items-center gap-1.5 sm:gap-4 md:gap-6">
                  <span className="text-2xl sm:text-4xl md:text-5xl font-black text-white">{featured.homeScore}</span>
                  <div className="flex flex-col items-center justify-center px-0.5 sm:px-1">
                    <span className="bg-white/5 text-blue-300 border border-blue-500/30 text-[9px] sm:text-[12px] font-black italic px-2 sm:px-4 py-1 sm:py-1.5 rounded-lg shadow-[0_0_15px_rgba(37,99,235,0.2)] tracking-widest">
                      V/S
                    </span>
                  </div>
                  <span className="text-2xl sm:text-4xl md:text-5xl font-black text-white">{featured.awayScore}</span>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2 sm:gap-3 flex-1 min-w-0 max-w-[35%] sm:max-w-none">
                {/* <FlagBadge name={featured.awayName} size="lg" /> */}
                {featured.awayName === "Czechia" ? (
  <div
    className="w-14 h-10 sm:w-20 sm:h-14 md:w-24 md:h-16 rounded-xl sm:rounded-2xl
      flex items-center justify-center border border-white/10"
    style={{
      background: "linear-gradient(160deg, #1B2A4A 0%, #0E1830 100%)",
    }}
  >
    <span className="font-black text-gray-300 text-xl tracking-wider">
      CZ
    </span>
  </div>
) : (
  <FlagBadge name={featured.awayName} size="lg" />
)}
                <span className="font-black tracking-wide sm:tracking-widest text-[10px] sm:text-sm md:text-base text-center leading-tight break-words w-full">{featured?.awayName?.toUpperCase()}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-6 text-[12px] px-1 sm:px-10">
              <div className="flex flex-col gap-2 w-full sm:w-1/2 sm:items-start">
                <div className="flex items-center gap-2 bg-blue-500/10 border-l-2 border border-blue-500/30 px-3 py-1.5 rounded-lg shadow-sm w-full sm:w-fit sm:max-w-full">
                  <FlagChip name={featured.homeName} />
                  <span className="text-blue-400 text-sm flex-shrink-0">⚽</span>
                  <span className="font-semibold text-gray-200 truncate flex-1 sm:flex-initial">Hwang In-beom</span>
                  <span className="text-blue-400 font-black flex-shrink-0">67'</span>
                </div>
                <div className="flex items-center gap-2 bg-blue-500/10 border-l-2 border border-blue-500/30 px-3 py-1.5 rounded-lg shadow-sm w-full sm:w-fit sm:max-w-full">
                  <FlagChip name={featured.homeName} />
                  <span className="text-blue-400 text-sm flex-shrink-0">⚽</span>
                  <span className="font-semibold text-gray-200 truncate flex-1 sm:flex-initial">Oh Hyeon-gyu</span>
                  <span className="text-blue-400 font-black flex-shrink-0">80'</span>
                </div>
              </div>
              <div className="flex flex-col gap-2 w-full sm:w-1/2 sm:items-end">
                <div className="flex items-center gap-2 bg-pink-500/10 border-l-2 border border-pink-500/30 px-3 py-1.5 rounded-lg shadow-sm w-full sm:w-fit sm:max-w-full">
                  <FlagChip name={featured.awayName} />
                  <span className="text-pink-400 text-sm flex-shrink-0">⚽</span>
                  <span className="font-semibold text-gray-200 truncate flex-1 sm:flex-initial">Ladislav Krejčí</span>
                  <span className="text-pink-400 font-black flex-shrink-0">59'</span>
                </div>
              </div>
            </div>

            <div className="flex justify-center items-center mt-6">
              <div className="flex items-center gap-2 text-[10px] sm:text-[11px] font-black tracking-[0.15em] sm:tracking-[0.2em] text-blue-300 bg-blue-500/10 border border-blue-500/20 px-3 sm:px-5 py-2 sm:py-2.5 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.15)] text-center">
                <MapPin size={14} className="text-blue-400 flex-shrink-0" />
                {featured.venue.toUpperCase()}
              </div>
            </div>
          </div>

          <div className="relative z-10 border-t border-white/10 mt-4">
            <StatRow label="POSSESSION" left="62%" right="38%" leftColor="text-blue-400" rightColor="text-gray-400" />
            <StatRow label="SHOTS ON GOAL" left="6" right="4" leftColor="text-blue-400" />
            <StatRow label="FOULS COMMITTED" left="8" right="16" rightColor="text-red-400" />
            <StatRow label="YELLOW CARDS" left="1" right="0" leftColor="text-yellow-400" rightColor="text-gray-500" />
            <StatRow label="RED CARDS" left="0" right="0" leftColor="text-gray-500" rightColor="text-gray-500" />
            <StatRow label="CORNERS" left="4" right="5" rightColor="text-blue-400" />
            <StatRow label="SAVES" left="3" right="4" rightColor="text-blue-400" />
            <StatRow label="EXPECTED GOALS" left="2.00" right="0.80" leftColor="text-blue-400" />
          </div>
        </div>

        {/* ── TABS ─────────────────────────────────────────────────────── */}
        <div
          className="flex items-center gap-1 rounded-2xl border border-white/10 p-1.5 mb-5 overflow-x-auto"
          style={{ background: "rgba(10,18,40,0.7)" }}
        >
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = activeTab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`flex items-center gap-1.5 px-3 sm:px-4 py-2.5 rounded-xl text-[10px] sm:text-[11px] font-bold tracking-widest whitespace-nowrap transition-all flex-1 justify-center ${
                  active ? "text-blue-400 border border-blue-500/40" : "text-gray-400 hover:text-white border border-transparent"
                }`}
                style={active ? { background: "rgba(37,99,235,0.15)" } : undefined}
              >
                <Icon size={13} />
                <span className="hidden sm:inline">{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* ── TAB CONTENT ──────────────────────────────────────────────── */}

        {/* ── OVERVIEW ── */}
        {activeTab === "overview" && (
          <>
            <div className="mb-5">
              <h2 className="text-sm font-black tracking-[0.2em] mb-3 text-gray-200">GROUPS</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groups.map((g) => (
                  <div key={g.name} className="rounded-2xl border border-white/10 p-3 sm:p-4" style={{ background: "rgba(10,18,40,0.7)" }}>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: g.color }} />
                      <h3 className="text-xs font-black tracking-widest" style={{ color: g.color }}>{g.name}</h3>
                    </div>

                    {/* Header row */}
                    <div className="grid grid-cols-[1rem_1fr_repeat(6,1.2rem)] sm:grid-cols-[1.2rem_1fr_repeat(6,1.5rem)] gap-y-2 text-[9px] sm:text-[10px] text-gray-500 font-bold mb-1.5 px-1 tracking-wider">
                      <span /><span />
                      {["P","W","D","L","GD","PTS"].map(h => (
                        <span key={h} className="text-center">{h}</span>
                      ))}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      {g.teams.map((team, idx) => (
                        <div
                          key={team.name}
                          className="grid grid-cols-[1rem_1fr_repeat(6,1.2rem)] sm:grid-cols-[1.2rem_1fr_repeat(6,1.5rem)] items-center text-[10px] sm:text-[11px] rounded-lg px-1 py-1.5"
                          style={idx < 2 ? { background: "rgba(255,255,255,0.04)" } : undefined}
                        >
                          <span className="text-gray-500 font-bold text-center text-[9px] sm:text-[10px]">{idx + 1}</span>
                          <span className="flex items-center gap-1.5 min-w-0">
                            <FlagChip name={team.name} />
                            <span className="truncate font-semibold text-gray-200 text-[10px] sm:text-[11px]">{team.name}</span>
                          </span>
                          <span className="text-center text-gray-400">{team.p}</span>
                          <span className="text-center text-gray-400">{team.w}</span>
                          <span className="text-center text-gray-400">{team.d}</span>
                          <span className="text-center text-gray-400">{team.l}</span>
                          <span className="text-center text-gray-400">{team.gd > 0 ? `+${team.gd}` : team.gd}</span>
                          <span className="text-center font-black" style={{ color: g.color }}>{team.pts}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-sm font-black tracking-[0.2em] mb-3 text-gray-200">TODAY'S MATCHES</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {todaysMatches.map((m, i) => <MatchCard key={i} m={m} />)}
              </div>
            </div>
          </>
        )}

        {/* ── TOURNAMENT STATS ── */}
        {activeTab === "stats" && <TournamentStatsTab />}

        {/* ── FIXTURES ── */}
        {activeTab === "fixtures" && <FixturesTab />}

        {/* ── KNOCKOUTS ── */}
        {activeTab === "knockouts" && <KnockoutsTab />}

      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TOURNAMENT STATS TAB
// ─────────────────────────────────────────────────────────────────────────────

function TournamentStatsTab() {
  const overviewItems = [
    { icon: BarChart3, label: "MATCHES PLAYED",   value: "2",  color: "#60a5fa" },
    { icon: Users,     label: "TEAMS",             value: "48",  color: "#a78bfa" },
    { icon: Calendar,  label: "TOURNAMENT DAYS",   value: "39",  color: "#34d399" },
    { icon: Target,    label: "GOALS SCORED",      value: "5", color: "#f59e0b" },
  ];

  const keyStats = [
    { icon: "⚽", label: "GOALS",         value: "5",  sub: "2.5 Goals per match" },
    { icon: "👟", label: "ASSISTS",       value: "3",   sub: "1.5 Assists per match" },
    { icon: "🛡️", label: "CLEAN SHEETS", value: "1",   sub: "0.5 per match" },
    { icon: "🧤", label: "SAVES",         value: "14",  sub: "7.0 Saves per match" },
    { icon: "🎯", label: "PASS ACCURACY", value: "81%",  sub: "Total Pass Accuracy" },
    { icon: "⚡", label: "POSSESSION",    value: "50%",  sub: "Average Possession" },
  ];

  const insights = [
    { icon: TrendingUp, label: "Most goals in a match",  value: "3 Goals",  color: "#60a5fa" },
    { icon: Star,       label: "Highest scoring team",   value: "2 Goals", color: "#a78bfa" },
    { icon: Clock,      label: "Most goals in a day",    value: "5 Goals", color: "#34d399" },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* Overview */}
      <div className="rounded-2xl border border-white/10 p-5" style={{ background: "rgba(10,18,40,0.85)" }}>
        <h2 className="text-sm font-black tracking-[0.2em] text-gray-200 mb-5">TOURNAMENT OVERVIEW</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {overviewItems.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="flex flex-col items-center gap-2 py-3">
                <div className="w-12 h-12 rounded-full flex items-center justify-center border"
                  style={{ background: `${item.color}20`, borderColor: `${item.color}40` }}>
                  <Icon size={20} style={{ color: item.color }} />
                </div>
                <span className="text-2xl sm:text-3xl font-black text-white">{item.value}</span>
                <span className="text-[9px] sm:text-[10px] font-bold tracking-[0.15em] text-gray-400 text-center">{item.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Key Stats */}
      <div className="rounded-2xl border border-white/10 p-5" style={{ background: "rgba(10,18,40,0.85)" }}>
        <h2 className="text-sm font-black tracking-[0.2em] text-gray-200 mb-5">KEY STATS</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {keyStats.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-blue-500/20 p-4 sm:p-5 flex flex-col items-center text-center gap-2 relative overflow-hidden"
              style={{ background: "linear-gradient(160deg, rgba(37,99,235,0.12) 0%, rgba(10,18,40,0.9) 100%)" }}
            >
              <span className="text-2xl">{s.icon}</span>
              <span className="text-[10px] font-bold tracking-[0.2em] text-gray-400">{s.label}</span>
              <span className="text-2xl sm:text-3xl font-black text-white">{s.value}</span>
              <span className="text-[10px] text-blue-400/80 font-semibold">{s.sub}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Insights */}
      <div className="rounded-2xl border border-white/10 p-5" style={{ background: "rgba(10,18,40,0.85)" }}>
        <h2 className="text-sm font-black tracking-[0.2em] text-gray-200 mb-5">TOURNAMENT INSIGHTS</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {insights.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="rounded-xl border p-4 flex items-center gap-4"
                style={{ background: "rgba(16,26,52,0.7)", borderColor: `${item.color}25` }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${item.color}20` }}>
                  <Icon size={20} style={{ color: item.color }} />
                </div>
                <div>
                  <div className="text-[10px] text-gray-400 font-semibold mb-0.5">{item.label}</div>
                  <div className="text-lg font-black text-white">{item.value}</div>
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-center text-[10px] text-gray-600 mt-4 flex items-center justify-center gap-1">
          <Clock size={10} /> All stats are updated in real time
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FIXTURES TAB
// ─────────────────────────────────────────────────────────────────────────────

function FixturesTab() {
  // const nextMatch = upcomingFixtures; // Fix: select the first upcoming match
  const nextMatch = upcomingFixtures[0];

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Upcoming Fixtures */}
        <div className="rounded-2xl border border-white/10 p-5 flex flex-col gap-3" style={{ background: "rgba(10,18,40,0.85)" }}>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Calendar size={14} className="text-blue-400" />
            </div>
            <h2 className="text-sm font-black tracking-[0.2em] text-gray-200">UPCOMING FIXTURES</h2>
          </div>
          {upcomingFixtures.map((m, i) => <UpcomingFixtureRow key={i} m={m} />)}
          <p className="text-center text-[10px] text-gray-600 flex items-center justify-center gap-1 mt-1 border-t border-white/5 pt-3">
            <Clock size={10} /> All times are shown in your local time
          </p>
        </div>

        {/* Recent Results */}
        <div className="rounded-2xl border border-white/10 p-5 flex flex-col gap-3" style={{ background: "rgba(10,18,40,0.85)" }}>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <Trophy size={14} className="text-purple-400" />
            </div>
            <h2 className="text-sm font-black tracking-[0.2em] text-gray-200">RECENT RESULTS</h2>
          </div>
          {recentResults.map((r, i) => <RecentResultRow key={i} r={r} />)}
        </div>
      </div>

      {/* Next Match Banner */}
      {nextMatch && (
        <div
          className="rounded-2xl border border-white/10 p-4 flex flex-col sm:flex-row items-center gap-4 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #0a1530 0%, #0d1f4a 50%, #0a1530 100%)" }}
        >
          <div className="absolute inset-0 opacity-10 pointer-events-none"
            style={{ backgroundImage: "radial-gradient(ellipse at bottom, rgba(37,99,235,0.4) 0%, transparent 70%)" }} />
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
              <Calendar size={18} className="text-blue-400" />
            </div>
            <div>
              <div className="text-[10px] text-blue-400 font-bold tracking-widest">NEXT MATCH</div>
              <div className="text-xl font-black text-white">{nextMatch.time}</div>
            </div>
          </div>
          <div className="relative z-10 flex items-center gap-3 flex-1 justify-center sm:justify-start">
            <FlagChip name={nextMatch.homeName} />
            <span className="text-sm font-bold text-white tracking-wider">{nextMatch.homeName}</span>
            <span className="bg-white/5 text-blue-400 border border-blue-500/20 font-black text-[11px] px-2 py-0.5 rounded shadow-sm italic mx-1">V/S</span>
            <span className="text-sm font-bold text-white tracking-wider">{nextMatch.awayName}</span>
            <FlagChip name={nextMatch.awayName} />
          </div>
          <div className="relative z-10 flex flex-col items-end gap-1">
            <span className="text-[10px] font-bold tracking-widest border border-white/20 rounded-lg px-3 py-1.5 text-gray-300"
              style={{ background: "rgba(255,255,255,0.06)" }}>
              {nextMatch.group.toUpperCase()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function UpcomingFixtureRow({ m }: { m: Fixture }) {
  return (
    <div
      className="rounded-xl border border-white/10 p-2.5 sm:p-3 flex items-center gap-1.5 sm:gap-2 hover:border-blue-500/30 transition-colors"
      style={{ background: "rgba(16,26,52,0.5)" }}
    >
      <div className="flex flex-col items-center flex-shrink-0 w-9 sm:w-14">
        <span className="text-[10px] sm:text-base font-black text-white leading-tight text-center">{m.time}</span>
      </div>
      <div className="w-0.5 h-8 rounded-full bg-blue-500 flex-shrink-0" />
      <div className="flex items-center gap-1.5 flex-1 min-w-0">
        <FlagChip name={m.homeName} />
        <span className="text-[11px] sm:text-[12px] font-bold truncate text-white">{m.homeName}</span>
      </div>
      <div className="flex flex-col items-center gap-0.5 flex-shrink-0 px-0.5 sm:px-1">
        <span className="text-[8px] sm:text-[9px] font-bold tracking-wider border border-white/10 rounded px-1 sm:px-1.5 py-0.5 text-blue-300 whitespace-nowrap"
          style={{ background: "rgba(37,99,235,0.15)" }}>
          {m.group.replace("Group ", "GRP ")}
        </span>
        <span className="text-[9px] sm:text-[10px] font-black text-blue-400">VS</span>
      </div>
      <div className="flex items-center gap-1.5 flex-1 min-w-0 justify-end">
        <span className="text-[11px] sm:text-[12px] font-bold truncate text-right text-white">{m.awayName}</span>
        <FlagChip name={m.awayName} />
      </div>
    </div>
  );
}

function RecentResultRow({ r }: { r: Result }) {
  const homeWon = r.homeScore > r.awayScore;
  const awayWon = r.awayScore > r.homeScore;
  return (
    <div
      className="rounded-xl border border-white/10 p-3 flex items-center gap-2 hover:border-white/20 transition-colors"
      style={{ background: "rgba(16,26,52,0.5)" }}
    >
      <span className="text-[9px] font-black bg-purple-600/30 text-purple-300 border border-purple-500/30 rounded px-1.5 py-0.5 flex-shrink-0">FT</span>
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <FlagChip name={r.homeName} />
        <span className={`text-[12px] font-bold truncate ${homeWon ? "text-white" : "text-gray-400"}`}>{r.homeName}</span>
      </div>
      <div className="flex-shrink-0 text-center px-2">
        <span className="text-base font-black">
          <span className={homeWon ? "text-white" : "text-gray-400"}>{r.homeScore}</span>
          <span className="text-gray-500"> - </span>
          <span className={awayWon ? "text-white" : "text-gray-400"}>{r.awayScore}</span>
        </span>
        <div className="text-[9px] text-gray-500 text-center">{r.group.replace("Group ", "Grp ")}</div>
      </div>
      <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
        <span className={`text-[12px] font-bold truncate text-right ${awayWon ? "text-white" : "text-gray-400"}`}>{r.awayName}</span>
        <FlagChip name={r.awayName} />
      </div>
      <ChevronRight size={14} className="text-gray-600 flex-shrink-0" />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// KNOCKOUTS TAB
// ─────────────────────────────────────────────────────────────────────────────

function KnockoutsTab() {
  return (
    <div className="rounded-2xl border border-white/10 p-4 sm:p-5" style={{ background: "rgba(10,18,40,0.85)" }}>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-sm font-black tracking-[0.2em] text-gray-200">ROAD TO THE FINAL</h2>
        <span className="text-[10px] font-bold tracking-widest text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer transition-colors">
          VIEW FULL BRACKET <ChevronRight size={12} />
        </span>
      </div>

      <div className="overflow-x-auto pb-2">
        <div style={{ minWidth: "820px" }}>
          {/* Column headers */}
          <div className="grid grid-cols-[1fr_1fr_1fr_1fr_140px] gap-3 mb-3 px-1">
            {["ROUND OF 16", "QUARTER FINALS", "SEMI FINALS", "FINAL", ""].map((h, i) => (
              <div key={i} className="text-center">
                <span className="text-[10px] font-black tracking-[0.15em] text-blue-400">{h}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-[1fr_1fr_1fr_1fr_140px] gap-3 items-stretch">
            <div className="flex flex-col gap-2.5 justify-around">
              {r16Matches.map((m) => <KOMatchCard key={m.id} match={m} />)}
            </div>
            <div className="flex flex-col gap-2.5 justify-around py-5">
              {qfMatches.map((m) => <KOMatchCard key={m.id} match={m} />)}
            </div>
            <div className="flex flex-col gap-2.5 justify-around py-16">
              {sfMatches.map((m) => <KOMatchCard key={m.id} match={m} />)}
            </div>
            <div className="flex flex-col justify-center py-24">
              <KOMatchCard match={finalMatch} highlight />
            </div>
            <div className="flex flex-col items-center justify-center gap-2 text-center py-10">
              <div className="relative">
                <div className="absolute -inset-3 rounded-full bg-yellow-400/10 blur-xl" />
                <Trophy size={52} className="text-yellow-400 drop-shadow-[0_0_20px_rgba(250,204,21,0.6)] relative" />
              </div>
              <span className="text-[11px] font-black tracking-[0.2em] text-yellow-400 mt-1">FINAL</span>
              <span className="text-[10px] text-gray-300 font-semibold">JUL 13, 2026</span>
              <span className="text-[9px] text-gray-500 tracking-wider">9:00 PM</span>
              <span className="text-[9px] text-gray-500 tracking-wider">METLIFE STADIUM</span>
              <span className="text-[8px] text-gray-600 tracking-wider mt-0.5">NEW JERSEY</span>
            </div>
          </div>
        </div>
      </div>

      <p className="text-center text-[10px] text-gray-600 flex items-center justify-center gap-1 mt-4 border-t border-white/5 pt-3">
        <Clock size={10} /> All times are shown in your local time
      </p>
    </div>
  );
}

function KOMatchCard({ match, highlight = false }: { match: BracketMatch; highlight?: boolean }) {
  const isTbd = match.status === "tbd";

  return (
    <div
      className={`rounded-xl border p-2.5 flex flex-col gap-1.5 transition-all ${
        highlight ? "border-blue-500/50 shadow-[0_0_20px_rgba(37,99,235,0.15)]" : "border-white/10 hover:border-white/20"
      }`}
      style={{
        background: highlight
          ? "linear-gradient(160deg, rgba(37,99,235,0.2) 0%, rgba(10,18,40,0.95) 100%)"
          : "rgba(14,24,48,0.8)",
      }}
    >
      {match.date && (
        <div className="flex items-center justify-between mb-0.5">
          <span className="text-[8px] font-bold tracking-wider text-blue-400/80">{match.date}</span>
          <span className="text-[8px] text-gray-600">{match.time}</span>
        </div>
      )}

      {/* Home */}
      <div className="flex items-center gap-1.5 rounded-md px-1.5 py-1">
        {match.home?.name ? (
          <FlagChip name={match.home.name} />
        ) : (
          <div className="w-8 h-6 rounded-md border border-white/10 flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(255,255,255,0.04)" }}>
            <Shield size={10} className="text-gray-600" />
          </div>
        )}
        <span className={`text-[10px] font-bold truncate flex-1 ${isTbd ? "text-gray-600" : "text-gray-300"}`}>
          {match.home?.label || "TBD"}
        </span>
        {match.homeScore !== undefined && (
          <span className="text-[11px] font-black text-white">{match.homeScore}</span>
        )}
      </div>

      <div className="h-px bg-white/5 mx-1" />

      {/* Away */}
      <div className="flex items-center gap-1.5 rounded-md px-1.5 py-1">
        {match.away?.name ? (
          <FlagChip name={match.away.name} />
        ) : (
          <div className="w-8 h-6 rounded-md border border-white/10 flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(255,255,255,0.04)" }}>
            <Shield size={10} className="text-gray-600" />
          </div>
        )}
        <span className={`text-[10px] font-bold truncate flex-1 ${isTbd ? "text-gray-600" : "text-gray-300"}`}>
          {match.away?.label || "TBD"}
        </span>
        {match.awayScore !== undefined && (
          <span className="text-[11px] font-black text-white">{match.awayScore}</span>
        )}
      </div>
    </div>
  );
}

// ─── Stat Row ─────────────────────────────────────────────────────────────────

function StatRow({ label, left, right, leftColor = "text-white", rightColor = "text-white" }: {
  label: string; left: string; right: string; leftColor?: string; rightColor?: string;
}) {
  // Parse for horizontal progress bars
  const lNum = parseFloat(left) || 0;
  const rNum = parseFloat(right) || 0;
  const total = lNum + rNum;
  const lPct = total > 0 ? (lNum / total) * 100 : 50;
  const rPct = total > 0 ? (rNum / total) * 100 : 50;

  return (
    <div className="relative flex flex-col justify-center px-3 sm:px-6 md:px-10 py-3.5 border-b border-white/5 last:border-b-0 hover:bg-white/[0.02] transition-colors">
      <div className="flex items-center justify-between relative z-10 mb-1.5 gap-2">
        <span className={`text-sm font-black w-10 sm:w-12 ${leftColor}`}>{left}</span>
        <span className="text-[10px] sm:text-[11px] text-gray-200 font-bold tracking-[0.1em] sm:tracking-[0.15em] drop-shadow-md text-center">{label}</span>
        <span className={`text-sm font-black w-10 sm:w-12 text-right ${rightColor}`}>{right}</span>
      </div>
      <div className="flex items-center justify-center gap-1 w-full max-w-[200px] mx-auto opacity-70">
        <div className="h-1.5 w-full bg-white/5 rounded-l-full overflow-hidden flex justify-end">
            <div className="h-full bg-blue-500 rounded-l-full" style={{ width: `${lPct}%` }} />
        </div>
        <div className="h-1.5 w-full bg-white/5 rounded-r-full overflow-hidden">
            <div className="h-full bg-gray-400 rounded-r-full" style={{ width: `${rPct}%` }} />
        </div>
      </div>
    </div>
  );
}

// ─── Overview Match Card ──────────────────────────────────────────────────────

function MatchCard({ m }: { m: Fixture }) {
  return (
    <div
      className={`rounded-2xl border p-4 flex flex-col gap-3 ${m.status === "LIVE" ? "border-blue-500/40" : "border-white/10"}`}
      style={{
        background: m.status === "LIVE"
          ? "linear-gradient(135deg, rgba(37,99,235,0.20) 0%, rgba(10,18,40,0.85) 75%)"
          : "rgba(10,18,40,0.7)",
      }}
    >
      <div className="flex items-center justify-between text-[11px]">
        {m.status === "LIVE" ? (
          <span className="flex items-center gap-1 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> LIVE
          </span>
        ) : (
          <span className="text-gray-400 font-semibold">{m.time}</span>
        )}
        <span className="text-gray-500 font-semibold tracking-wide">{m.group}</span>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex flex-col items-center gap-2 flex-1">
          <FlagBadge name={m.homeName} size="md" />
          <span className="text-[11px] font-bold">{m.homeName}</span>
        </div>
        <div className="flex flex-col items-center px-2">
          {m.status === "LIVE" || m.status === "FT" ? (
            <>
              <span className="text-2xl font-black text-white">{m.homeScore} - {m.awayScore}</span>
              <span className="text-[10px] text-blue-400 font-bold">{m.minute}</span>
            </>
          ) : (
            <span className="text-xs font-bold text-gray-500">VS</span>
          )}
        </div>
        <div className="flex flex-col items-center gap-2 flex-1">
          <FlagBadge name={m.awayName} size="md" />
          <span className="text-[11px] font-bold">{m.awayName}</span>
        </div>
      </div>
      <div className="flex items-center justify-center gap-1.5 text-[10px] text-gray-400 border-t border-white/10 pt-2">
        <MapPin size={11} />
        {m.venue}
      </div>
    </div>
  );
}
