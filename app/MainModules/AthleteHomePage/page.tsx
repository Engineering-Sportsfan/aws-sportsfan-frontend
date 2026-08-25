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

/** Raw sportId from DynamoDB (e.g. "athletics"). Lower-cased for comparison. */
function getSportId(a: AthleteListItem): string {
  return (a.sportId ?? "").toLowerCase();
}

/** Sub-category from performance.category (e.g. "Javelin Throw"). */
function getCategory(a: AthleteListItem): string {
  return a.performance?.category ?? "";
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
  const initials = getInitials(name);
  const profileImage = getProfileImage(athlete);
  const rank = getWorldRank(athlete);

  // Format DOB if available, e.g. "5 Nov 1991"
  const formattedDob = dob ? formatDob(dob) : "";

  // Combine details: "Cricket / DOB: 5 Nov 1991" or "Cricket / Rank: #1"
  const details = [
    sport,
    formattedDob ? `DOB: ${formattedDob}` : "",
    rank ? `Rank: #${rank}` : ""
  ].filter(Boolean).join(" / ");

  return (
    <div
      onClick={onClick}
      className="flex items-center gap-3.5 p-3 rounded-2xl cursor-pointer border border-[#ff2d55]/15 bg-gradient-to-r from-[#210915] to-[#12040b] hover:from-[#351426] hover:to-[#1e0a14] transition-all duration-300 hover:-translate-y-[2px] active:scale-[0.98] group"
      style={{
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)"
      }}
    >
      {/* Avatar Circle with Pink Border */}
      <div className="w-12 h-12 rounded-full border-2 border-[#ff2d55] flex-shrink-0 bg-black flex items-center justify-center overflow-hidden relative">
        {profileImage ? (
          <img
            src={profileImage}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-[13px] font-black text-white tracking-tight uppercase select-none">
            {initials}
          </span>
        )}
      </div>

      {/* Texts Stacked Vertically */}
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <h3 className="text-[14.5px] font-bold text-white leading-tight truncate group-hover:text-[#ff2d55] transition-colors">
          {name}
        </h3>
        <p className="text-[11px] text-white/50 mt-0.5 truncate leading-tight">
          {details}
        </p>
      </div>
    </div>
  );
}

// ── Club Card ──────────────────────────────────────────────────────────────

interface ClubCardProps {
  club: any;
  index: number;
  onClick: () => void;
}

function ClubCard({ club, index, onClick }: ClubCardProps) {
  const name = club.clubName || "–";
  const sport = club.sportId || "–";
  const logo = club.logoUrl || null;
  const initials = getInitials(name);
  const country = club.country || "";

  // Combine details: "Football / England"
  const details = [
    sport,
    country ? country.toUpperCase() : ""
  ].filter(Boolean).join(" / ");

  return (
    <div
      onClick={onClick}
      className="flex items-center gap-3.5 p-3 rounded-2xl cursor-pointer border border-[#ff2d55]/15 bg-gradient-to-r from-[#210915] to-[#12040b] hover:from-[#351426] hover:to-[#1e0a14] transition-all duration-300 hover:-translate-y-[2px] active:scale-[0.98] group"
      style={{
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)"
      }}
    >
      {/* Avatar Circle with Pink Border */}
      <div className="w-12 h-12 rounded-full border-2 border-[#ff2d55] flex-shrink-0 bg-black flex items-center justify-center overflow-hidden relative">
        {logo ? (
          <img
            src={logo}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-[13px] font-black text-white tracking-tight uppercase select-none">
            {initials}
          </span>
        )}
      </div>

      {/* Texts Stacked Vertically */}
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <h3 className="text-[14.5px] font-bold text-white leading-tight truncate group-hover:text-[#ff2d55] transition-colors">
          {name}
        </h3>
        <p className="text-[11px] text-white/50 mt-0.5 truncate leading-tight uppercase">
          {details}
        </p>
      </div>
    </div>
  );
}


// ── Main Page ──────────────────────────────────────────────────────────────

// ── Known sports (label → sportId value stored in DynamoDB) ─────────────────
const SPORT_OPTIONS: { label: string; id: string }[] = [
  { label: "All Sports", id: "" },
  { label: "Athletics",    id: "athletics" },
  // { label: "Badminton",    id: "badminton" },
  // { label: "Boxing",       id: "boxing" },
  { label: "Cricket",      id: "cricket" },
  // { label: "Shooting",     id: "shooting" },
  // { label: "Wrestling",    id: "wrestling" },
  // { label: "Swimming",     id: "swimming" },
  // { label: "Weightlifting",id: "weightlifting" },
];

type GenderFilter = "All" | "Male" | "Female";

export default function AthleteHomePage() {
  const router = useRouter();
  const [athletes, setAthletes] = useState<AthleteListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [genderFilter, setGenderFilter] = useState<GenderFilter>("All");
  // Sport filter: matches sportId field in DynamoDB (empty string = All Sports)
  const [sportFilter, setSportFilter] = useState("");
  // Category filter: matches performance.category (empty string = All Categories)
  const [categoryFilter, setCategoryFilter] = useState("");
  const [showSportDropdown, setShowSportDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  // ── Clubs state and views ──────────────────────────────────────────────────
  const [viewMode, setViewMode] = useState<"athletes" | "clubs">("athletes");
  const [clubs, setClubs] = useState<any[]>([]);
  const [clubsLoading, setClubsLoading] = useState(false);
  const [clubsError, setClubsError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    getAllAthletes()
      .then(setAthletes)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  };
  const loadClubs = async () => {
    setClubsLoading(true);
    setClubsError(null);
    console.log("loadClubs: fetching from /api/ms_teams");
    try {
      const res = await fetch("/api/ms_teams");
      console.log("loadClubs response status:", res.status);
      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }
      const data = await res.json();
      console.log("loadClubs data received:", data);
      if (data.success) {
        setClubs(data.teams || []);
      } else {
        setClubsError("Failed to retrieve clubs");
      }
    } catch (err: any) {
      console.error("loadClubs fetch error:", err);
      setClubsError(err.message || "Failed to load clubs");
    } finally {
      setClubsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);
  console.log("Atheles", athletes);

  useEffect(() => {
    if (viewMode === "clubs" && clubs.length === 0) {
      loadClubs();
    }
  }, [viewMode, clubs.length]);

  console.log("clubs  ", clubs);
  const filteredClubs = useMemo(() => {
    return clubs.filter((c) => {
      const name = (c.clubName || "").toLowerCase();
      const sport = (c.sportId || "").toLowerCase();
      const country = (c.country || "").toLowerCase();

      const matchesSearch =
        !searchQuery ||
        name.includes(searchQuery.toLowerCase()) ||
        sport.includes(searchQuery.toLowerCase()) ||
        country.includes(searchQuery.toLowerCase());

      const matchesSport =
        !sportFilter || sport === sportFilter.toLowerCase();

      return matchesSearch && matchesSport;
    });
  }, [clubs, searchQuery, sportFilter]);


  // ── Dynamic category list from athletes that match the selected sport ────
  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    athletes.forEach((a) => {
      if (sportFilter && getSportId(a) !== sportFilter) return;
      const cat = getCategory(a);
      if (cat) cats.add(cat);
    });
    return Array.from(cats).sort();
  }, [athletes, sportFilter]);

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

      // Sport filter: compare against sportId field (case-insensitive)
      const matchesSport =
        !sportFilter || getSportId(a) === sportFilter;

      // Category filter: compare against performance.category
      const matchesCategory =
        !categoryFilter || getCategory(a) === categoryFilter;

      return matchesSearch && matchesGender && matchesSport && matchesCategory;
    });
  }, [athletes, searchQuery, genderFilter, sportFilter, categoryFilter]);

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
        <div className="flex items-center justify-between px-4 py-1 max-w-2xl mx-auto">
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
                {viewMode === "athletes" ? (
                  loading
                    ? "Loading athletes…"
                    : `${filtered.length} athlete${filtered.length !== 1 ? "s" : ""} found`
                ) : (
                  clubsLoading
                    ? "Loading clubs…"
                    : `${filteredClubs.length} club${filteredClubs.length !== 1 ? "s" : ""} found`
                )}
              </p>
            </div>
          </div>

          {/* Logo mark */}
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#FF7A00] to-[#FF0055] flex items-center justify-center shadow-lg shadow-[#FF0055]/30">
            <span className="text-white font-black text-xs">SF</span>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4">
        {/* ── Search Bar ─────────────────────────────────────────────── */}
        <div className="relative">
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
        <div className="flex items-center gap-2 pt-2 flex-wrap relative">
          {/* Gender filters */}
          {(["All", "Male", "Female"] as GenderFilter[]).map((g) => (
            <button
              key={g}
              id={`gender-filter-${g.toLowerCase()}`}
              onClick={() => {
                setViewMode("athletes");
                setGenderFilter(g);
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all active:scale-95 ${
                viewMode === "athletes" && genderFilter === g
                  ? "bg-gradient-to-r from-[#FF0055] to-[#FF7A00] text-white border-transparent shadow-lg shadow-[#FF0055]/20"
                  : "bg-[#16161f] border-white/10 text-gray-400 hover:border-white/20 hover:text-white"
              }`}
            >
              {g === "Male" ? "♂ Male" : g === "Female" ? "♀ Female" : g}
            </button>
          ))}

          {/* Clubs filter tab */}
          <button
            id="clubs-filter-btn"
            onClick={() => {
              setViewMode("clubs");
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all active:scale-95 ${viewMode === "clubs"
                ? "bg-gradient-to-r from-[#FF0055] to-[#FF7A00] text-white border-transparent shadow-lg shadow-[#FF0055]/20"
                : "bg-[#16161f] border-white/10 text-gray-400 hover:border-white/20 hover:text-white"
              }`}
          >
            🛡️ Nations
          </button>

          {/* Sport dropdown */}
          <div className="relative ml-auto">
            <button
              id="sport-filter-btn"
              onClick={() => { setShowSportDropdown((p) => !p); setShowCategoryDropdown(false); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all active:scale-95 ${
                sportFilter
                  ? "bg-[#FF7A00]/20 border-[#FF7A00]/40 text-[#FF7A00]"
                  : "bg-[#16161f] border-white/10 text-gray-400 hover:border-white/20 hover:text-white"
              }`}
            >
              🏅 {sportFilter ? SPORT_OPTIONS.find((s) => s.id === sportFilter)?.label ?? sportFilter : "Sport"}
              <Filter className="w-3 h-3" />
            </button>

            {showSportDropdown && (
              <div className="absolute right-0 top-full mt-2 w-44 bg-[#16161f] border border-white/10 rounded-2xl shadow-2xl shadow-black/60 z-40 overflow-hidden">
                {SPORT_OPTIONS.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setSportFilter(s.id);
                      setCategoryFilter(""); // reset sub-category when sport changes
                      setShowSportDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-xs font-semibold transition-colors ${
                      sportFilter === s.id
                        ? "text-[#FF7A00] bg-[#FF7A00]/10"
                        : "text-gray-300 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Category dropdown — only shown when a sport is selected and categories exist */}
          {sportFilter && availableCategories.length > 0 && (
            <div className="relative">
              <button
                id="category-filter-btn"
                onClick={() => { setShowCategoryDropdown((p) => !p); setShowSportDropdown(false); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all active:scale-95 ${
                  categoryFilter
                    ? "bg-[#FF0055]/20 border-[#FF0055]/40 text-[#FF0055]"
                    : "bg-[#16161f] border-white/10 text-gray-400 hover:border-white/20 hover:text-white"
                }`}
              >
                🎯 {categoryFilter || "Category"}
                <Filter className="w-3 h-3" />
              </button>

              {showCategoryDropdown && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-[#16161f] border border-white/10 rounded-2xl shadow-2xl shadow-black/60 z-40 overflow-hidden max-h-60 overflow-y-auto">
                  <button
                    onClick={() => { setCategoryFilter(""); setShowCategoryDropdown(false); }}
                    className={`w-full text-left px-4 py-2.5 text-xs font-semibold transition-colors ${
                      !categoryFilter
                        ? "text-[#FF0055] bg-[#FF0055]/10"
                        : "text-gray-300 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    All Categories
                  </button>
                  {availableCategories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => { setCategoryFilter(cat); setShowCategoryDropdown(false); }}
                      className={`w-full text-left px-4 py-2.5 text-xs font-semibold transition-colors ${
                        categoryFilter === cat
                          ? "text-[#FF0055] bg-[#FF0055]/10"
                          : "text-gray-300 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Click outside to close dropdowns */}
        {(showSportDropdown || showCategoryDropdown) && (
          <div
            className="fixed inset-0 z-30"
            onClick={() => { setShowSportDropdown(false); setShowCategoryDropdown(false); }}
          />
        )}

        {/* ── Content ────────────────────────────────────────────────── */}
        <div className="mt-2">
          {/* Loading State */}
          {((viewMode === "athletes" && loading) || (viewMode === "clubs" && clubsLoading)) && (
            <div className="grid grid-cols-2 gap-3.5">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          )}

          {/* Error State - Athletes */}
          {viewMode === "athletes" && !loading && error && (
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

          {/* Error State - Clubs */}
          {viewMode === "clubs" && !clubsLoading && clubsError && (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
              <span className="text-5xl">⚠️</span>
              <p className="text-red-400 font-bold text-sm">{clubsError}</p>
              <button
                onClick={loadClubs}
                className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#FF0055] to-[#FF7A00] text-white text-xs font-bold active:scale-95 transition-all"
              >
                Retry
              </button>
            </div>
          )}

          {/* Empty State - Athletes */}
          {viewMode === "athletes" && !loading && !error && filtered.length === 0 && (
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
                  setSportFilter("");
                  setCategoryFilter("");
                }}
                className="px-5 py-2 rounded-full bg-white/5 border border-white/10 text-gray-300 text-xs font-semibold hover:bg-white/10 transition-all"
              >
                Clear Filters
              </button>
            </div>
          )}

          {/* Empty State - Clubs */}
          {viewMode === "clubs" && !clubsLoading && !clubsError && filteredClubs.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
              <span className="text-5xl">🔍</span>
              <p className="text-white font-bold">No clubs found</p>
              <p className="text-gray-500 text-xs max-w-[240px]">
                Try adjusting your search or filters to find clubs.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSportFilter("");
                }}
                className="px-5 py-2 rounded-full bg-white/5 border border-white/10 text-gray-300 text-xs font-semibold hover:bg-white/10 transition-all"
              >
                Clear Filters
              </button>
            </div>
          )}

          {/* Athlete Grid */}
          {viewMode === "athletes" && !loading && !error && filtered.length > 0 && (
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

          {/* Clubs Grid */}
          {viewMode === "clubs" && !clubsLoading && !clubsError && filteredClubs.length > 0 && (
            <div className="grid grid-cols-2 gap-3.5">
              {filteredClubs.map((club, i) => (
                <div
                  key={club.entityId ?? i}
                  className="fade-in-up"
                  style={{ animationDelay: `${Math.min(i * 40, 400)}ms` }}
                >
                  <ClubCard
                    club={club}
                    index={i}
                    onClick={() => {
                      const slug = club.entityId?.replace(/^CLUB#/, "") || club.team_id || "";
                      router.push(`/MainModules/NationsProfile/${slug}`);
                    }}
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