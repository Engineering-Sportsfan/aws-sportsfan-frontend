"use client";

import React, { useState, useEffect, useMemo } from "react";
import { ChevronLeft, Search, Filter, X } from "lucide-react";
import {
  getAllAthletes,
  type AthleteListItem,
} from "@/services/newAthlete.service";
import { useRouter } from "next/navigation";

// ── Gradient palette for athlete cards (cycles through) ──────────────────────
const CARD_GRADIENTS = [
  "from-[#4a0d2e] via-[#2e0a1f] to-[#1a0812]",
  "from-[#0d1f4a] via-[#0a152e] to-[#080d1a]",
  "from-[#2e1a0a] via-[#1f0f06] to-[#120803]",
  "from-[#0a2e2e] via-[#061f1f] to-[#031212]",
  "from-[#2e0a2e] via-[#1f061f] to-[#120312]",
  "from-[#1a2e0a] via-[#0f1f06] to-[#081203]",
  "from-[#2e1a2e] via-[#1a0f1a] to-[#0d060d]",
  "from-[#0a1a2e] via-[#06101f] to-[#030812]",
];

const AVATAR_GRADIENTS = [
  "from-[#FF6B9D] to-[#FF0055]",
  "from-[#6B9DFF] to-[#0055FF]",
  "from-[#FF9D6B] to-[#FF4500]",
  "from-[#6BFFB4] to-[#00C853]",
  "from-[#C86BFF] to-[#7C00FF]",
  "from-[#FFD36B] to-[#FF8C00]",
  "from-[#FF6B6B] to-[#FF0000]",
  "from-[#6BFFF6] to-[#00BCD4]",
];

const GENDER_ICONS: Record<string, string> = {
  male: "♂",
  female: "♀",
  Male: "♂",
  Female: "♀",
  men: "♂",
  women: "♀",
  Men: "♂",
  Women: "♀",
  M: "♂",
  F: "♀",
};

// Normalize DynamoDB gender values ("Men"/"Women") to frontend labels ("Male"/"Female")
function normalizeGender(raw: string): string {
  const g = raw.trim().toLowerCase();
  if (g === "men" || g === "male" || g === "m") return "Male";
  if (g === "women" || g === "female" || g === "f") return "Female";
  return raw;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function getName(a: AthleteListItem): string {
  return a.name || a.coreInfo?.name || "–";
}

function getSport(a: AthleteListItem): string {
  return (
    a.sport ||
    a.performance?.primaryEvent ||
    a.analytics?.sport ||
    "–"
  );
}

function getCountry(a: AthleteListItem): string {
  return a.country || a.coreInfo?.country || "–";
}

function getDob(a: AthleteListItem): string {
  return a.dob || a.coreInfo?.dob || "";
}

function getGender(a: AthleteListItem): string {
  const raw = a.gender || a.coreInfo?.gender || "";
  return raw ? normalizeGender(raw) : "";
}

function getWorldRank(a: AthleteListItem): string | null {
  const r =
    a.worldRank ??
    (a as any)?.analytics?.stats?.worldRank ??
    (a as any)?.performance?.stats?.worldRank;
  if (r === undefined || r === null || r === "" || r === "–") return null;
  return String(r);
}

function getProfileImage(a: AthleteListItem): string | null {
  return a.profileImage || a.coreInfo?.profileImage || null;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "?";
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

function formatDob(dob: string): string {
  if (!dob) return "–";
  try {
    return new Date(dob).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dob;
  }
}

// ── Skeleton Card ──────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="relative rounded-2xl overflow-hidden bg-[#12121e] border border-white/5 animate-pulse">
      <div className="h-[160px] bg-white/5" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-white/10 rounded w-3/4" />
        <div className="h-3 bg-white/5 rounded w-1/2" />
        <div className="h-3 bg-white/5 rounded w-2/5" />
        <div className="h-6 bg-white/5 rounded-full w-24 mt-1" />
      </div>
    </div>
  );
}

// ── Athlete Card ───────────────────────────────────────────────────────────

interface AthleteCardProps {
  athlete: AthleteListItem;
  index: number;
  onClick: () => void;
}

function AthleteCard({ athlete, index, onClick }: AthleteCardProps) {
  const name = getName(athlete);
  const sport = getSport(athlete);
  const dob = getDob(athlete);
  const gender = getGender(athlete);
  const rank = getWorldRank(athlete);
  const profileImage = getProfileImage(athlete);
  const initials = getInitials(name);
  const cardGrad = CARD_GRADIENTS[index % CARD_GRADIENTS.length];
  const avatarGrad = AVATAR_GRADIENTS[index % AVATAR_GRADIENTS.length];
  const genderIcon = GENDER_ICONS[gender] ?? "";
  const countryCode =
    (athlete as any)?.countryCode ??
    (athlete as any)?.coreInfo?.countryCode ??
    null;

  return (
    <div
      onClick={onClick}
      className={`relative rounded-2xl overflow-hidden cursor-pointer border border-white/5 bg-gradient-to-br ${cardGrad}
        transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/50 hover:border-white/12 active:scale-[0.98] group`}
    >
      {/* Card Hero area */}
      <div className="relative h-[168px] flex items-center justify-center overflow-hidden">
        {/* Subtle radial glow */}
        <div
          className={`absolute inset-0 opacity-25 bg-gradient-to-br ${avatarGrad} blur-3xl scale-150`}
        />

        {/* Gender icon - top left */}
        {genderIcon && (
          <div className="absolute top-3 left-3 w-6 h-6 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 flex items-center justify-center text-[11px] text-gray-300 font-bold z-10">
            {genderIcon}
          </div>
        )}

        {/* Country - top right */}
        {countryCode && (
          <div className="absolute top-3 right-3 text-[11px] font-black text-white/80 tracking-wide z-10">
            {countryCode}
          </div>
        )}

        {/* Avatar */}
        <div className="relative z-10">
          <div
            className={`w-[88px] h-[88px] rounded-full p-[2.5px] bg-gradient-to-br ${avatarGrad} shadow-2xl group-hover:scale-105 transition-transform duration-300`}
          >
            <div className="w-full h-full rounded-full overflow-hidden bg-[#0f0f1a] flex items-center justify-center">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt={name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-2xl font-black tracking-tight select-none text-white">
                  {initials}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="px-4 pt-3 pb-4">
        <h3 className="text-[15px] font-extrabold text-white leading-tight truncate group-hover:text-[#FF7A00] transition-colors">
          {name}
        </h3>
        <p className="text-[11px] text-gray-400 font-medium mt-0.5 truncate">
          {sport}
        </p>
        {dob && (
          <p className="text-[10px] text-gray-500 font-medium mt-1">
            <span className="text-gray-600 uppercase text-[9px] tracking-wider font-bold">
              DOB:{" "}
            </span>
            {formatDob(dob)}
          </p>
        )}

        {/* World Rank badge */}
        {rank && (
          <div className="mt-2.5 inline-flex items-center gap-1.5 bg-[#FF0055]/15 border border-[#FF0055]/25 rounded-full px-2.5 py-1">
            <span className="text-[10px] font-extrabold text-[#FF7A00]">
              World #{rank}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────

const DISCIPLINES = [
  "All Sports",
  "Athletics",
  "Badminton",
  "Boxing",
  "Cricket",
  "Shooting",
  "Wrestling",
  "Swimming",
  "Weightlifting",
];

type GenderFilter = "All" | "Male" | "Female";

export default function AthleteHomePage() {
  const router = useRouter();
  const [athletes, setAthletes] = useState<AthleteListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [genderFilter, setGenderFilter] = useState<GenderFilter>("All");
  const [disciplineFilter, setDisciplineFilter] = useState("All Sports");
  const [showDisciplineDropdown, setShowDisciplineDropdown] = useState(false);

  const load = () => {
    setLoading(true);
    setError(null);
    getAllAthletes()
      .then(setAthletes)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);
  console.log("all athlete", athletes);
  // ── Filtered athletes ────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return athletes.filter((a) => {
      const name = getName(a).toLowerCase();
      const sport = getSport(a).toLowerCase();
      // getGender already normalizes "Men"→"Male" and "Women"→"Female"
      const gender = getGender(a); // e.g. "Male" | "Female" | ""

      const matchesSearch =
        !searchQuery ||
        name.includes(searchQuery.toLowerCase()) ||
        sport.includes(searchQuery.toLowerCase());

      // genderFilter is "All" | "Male" | "Female" — direct comparison after normalization
      const matchesGender =
        genderFilter === "All" || gender === genderFilter;

      const matchesDiscipline =
        disciplineFilter === "All Sports" ||
        sport.toLowerCase().includes(disciplineFilter.toLowerCase());

      return matchesSearch && matchesGender && matchesDiscipline;
    });
  }, [athletes, searchQuery, genderFilter, disciplineFilter]);

  const handleAthleteClick = (athlete: AthleteListItem) => {
    if (athlete.athleteId) {
      router.push(`/MainModules/AthleteProfile/${athlete.athleteId}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a10] text-white font-sans">
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-in-up { animation: fadeInUp 0.4s ease both; }
      `}</style>

      {/* ── Top Nav ──────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-30 bg-[#0a0a10]/90 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center justify-between px-4 py-3 max-w-2xl mx-auto">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="w-9 h-9 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center text-gray-300 hover:bg-white/10 transition-colors active:scale-95"
              aria-label="Go back"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-[18px] font-black text-white tracking-tight leading-none">
                Athlete Discovery
              </h1>
              <p className="text-[11px] text-gray-500 font-medium mt-0.5">
                {loading
                  ? "Loading athletes…"
                  : `${filtered.length} athlete${filtered.length !== 1 ? "s" : ""} found`}
              </p>
            </div>
          </div>

          {/* Logo mark */}
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#FF7A00] to-[#FF0055] flex items-center justify-center shadow-lg shadow-[#FF0055]/30">
            <span className="text-white font-black text-xs">SF</span>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pb-10">
        {/* ── Search Bar ─────────────────────────────────────────────── */}
        <div className="mt-5 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          <input
            id="athlete-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search athletes or discipline…"
            className="w-full bg-[#16161f] border border-white/8 rounded-2xl pl-11 pr-11 py-3.5 text-sm text-white placeholder-gray-600 outline-none focus:border-[#FF0055]/40 focus:ring-2 focus:ring-[#FF0055]/10 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* ── Filter Row ─────────────────────────────────────────────── */}
        <div className="flex items-center gap-2.5 mt-4 relative">
          {/* Gender filters */}
          {(["All", "Male", "Female"] as GenderFilter[]).map((g) => (
            <button
              key={g}
              id={`gender-filter-${g.toLowerCase()}`}
              onClick={() => setGenderFilter(g)}
              className={`px-4 py-2 rounded-full text-xs font-bold border transition-all active:scale-95 ${
                genderFilter === g
                  ? "bg-gradient-to-r from-[#FF0055] to-[#FF7A00] text-white border-transparent shadow-lg shadow-[#FF0055]/20"
                  : "bg-[#16161f] border-white/10 text-gray-400 hover:border-white/20 hover:text-white"
              }`}
            >
              {g === "Male" ? "♂ Male" : g === "Female" ? "♀ Female" : g}
            </button>
          ))}

          {/* Discipline dropdown */}
          <div className="ml-auto relative">
            <button
              id="discipline-filter-btn"
              onClick={() => setShowDisciplineDropdown((p) => !p)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold border transition-all active:scale-95 ${
                disciplineFilter !== "All Sports"
                  ? "bg-[#FF7A00]/20 border-[#FF7A00]/40 text-[#FF7A00]"
                  : "bg-[#16161f] border-white/10 text-gray-400 hover:border-white/20 hover:text-white"
              }`}
            >
              🏅 {disciplineFilter === "All Sports" ? "Discipline" : disciplineFilter}
              <Filter className="w-3 h-3" />
            </button>

            {showDisciplineDropdown && (
              <div className="absolute right-0 top-full mt-2 w-44 bg-[#16161f] border border-white/10 rounded-2xl shadow-2xl shadow-black/60 z-40 overflow-hidden">
                {DISCIPLINES.map((d) => (
                  <button
                    key={d}
                    onClick={() => {
                      setDisciplineFilter(d);
                      setShowDisciplineDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-xs font-semibold transition-colors ${
                      disciplineFilter === d
                        ? "text-[#FF7A00] bg-[#FF7A00]/10"
                        : "text-gray-300 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Click outside to close dropdown */}
        {showDisciplineDropdown && (
          <div
            className="fixed inset-0 z-30"
            onClick={() => setShowDisciplineDropdown(false)}
          />
        )}

        {/* ── Content ────────────────────────────────────────────────── */}
        <div className="mt-5">
          {/* Loading State */}
          {loading && (
            <div className="grid grid-cols-2 gap-3.5">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
              <span className="text-5xl">⚠️</span>
              <p className="text-red-400 font-bold text-sm">{error}</p>
              <button
                onClick={load}
                className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#FF0055] to-[#FF7A00] text-white text-xs font-bold active:scale-95 transition-all"
              >
                Retry
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
              <span className="text-5xl">🔍</span>
              <p className="text-white font-bold">No athletes found</p>
              <p className="text-gray-500 text-xs max-w-[240px]">
                Try adjusting your search or filters to find athletes.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setGenderFilter("All");
                  setDisciplineFilter("All Sports");
                }}
                className="px-5 py-2 rounded-full bg-white/5 border border-white/10 text-gray-300 text-xs font-semibold hover:bg-white/10 transition-all"
              >
                Clear Filters
              </button>
            </div>
          )}

          {/* Athlete Grid */}
          {!loading && !error && filtered.length > 0 && (
            <div className="grid grid-cols-2 gap-3.5">
              {filtered.map((athlete, i) => (
                <div
                  key={athlete.entityId ?? i}
                  className="fade-in-up"
                  style={{ animationDelay: `${Math.min(i * 40, 400)}ms` }}
                >
                  <AthleteCard
                    athlete={athlete}
                    index={i}
                    onClick={() => handleAthleteClick(athlete)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}