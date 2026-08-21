"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Calendar,
  MapPin,
  Clock,
  Share2,
  Info,
  Bell,
  BellOff,
  Play,
  Tv,
  Award,
  Trophy,
  X,
  TrendingUp,
  Sparkles
} from "lucide-react";
import Link from "next/link";

// ── SVG Inline Flags ────────────────────────────────────────────────────────
const IndiaFlag = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={`${className} rounded shadow-sm`} viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg">
    <rect width="900" height="600" fill="#FFF"/>
    <rect width="900" height="200" fill="#FF9933"/>
    <rect y="400" width="900" height="200" fill="#128807"/>
    <g transform="translate(450,300)">
      <circle r="92" fill="none" stroke="#000080" strokeWidth="6.5"/>
      <circle r="16" fill="#000080"/>
      {Array.from({ length: 24 }).map((_, i) => (
        <line
          key={i}
          x1="0"
          y1="0"
          x2="0"
          y2="-92"
          stroke="#000080"
          strokeWidth="4"
          transform={`rotate(${i * 15})`}
        />
      ))}
    </g>
  </svg>
);

const SriLankaFlag = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={`${className} rounded shadow-sm`} viewBox="0 0 1200 600" xmlns="http://www.w3.org/2000/svg">
    <rect width="1200" height="600" fill="#FFBE29"/>
    <rect x="25" y="25" width="230" height="550" fill="#005A36"/>
    <rect x="280" y="25" width="230" height="550" fill="#FF6600"/>
    <rect x="535" y="25" width="640" height="550" fill="#800000"/>
    <path d="M575,65 Q585,45 605,65 Q585,85 575,65" fill="#FFBE29"/>
    <path d="M1135,65 Q1125,45 1105,65 Q1125,85 1135,65" fill="#FFBE29"/>
    <path d="M575,535 Q585,555 605,535 Q585,515 575,535" fill="#FFBE29"/>
    <path d="M1135,535 Q1125,555 1105,535 Q1125,515 1135,535" fill="#FFBE29"/>
    <g transform="translate(850, 300) scale(1.6) translate(-10, -10)">
      <path d="M-30,-20 C-10,-40 20,-20 30,0 C20,20 -10,30 -30,10 Z" fill="#FFBE29"/>
      <path d="M30,0 L50,-30 L30,-15 L20,-25 Z" fill="#FFBE29"/>
    </g>
  </svg>
);

// ── Match Types & Constants ──────────────────────────────────────────────────
interface Score {
  runs: string;
  wickets?: string;
  declared?: boolean;
}

interface BatsmanScore {
  batsman: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  dismissal: string;
}

interface BowlerStats {
  bowler: string;
  overs: number;
  maidens: number;
  runs: number;
  wickets: number;
}

interface Match {
  id: string;
  date: string;
  dateLabel: string;
  title: string;
  format: "Test" | "Warm-up" | "ODI" | "T20";
  venue: string;
  status: "completed" | "upcoming" | "live";
  teamA: {
    name: string;
    short: string;
    innings: Score[];
    flag: React.ComponentType<{ className?: string }>;
  };
  teamB: {
    name: string;
    short: string;
    innings: Score[];
    flag: React.ComponentType<{ className?: string }>;
  };
  result?: string;
  timeLabel?: string;
  timestamp: number;
  scorecard?: {
    teamAFirstInnings: { batting: BatsmanScore[]; bowling: BowlerStats[] };
    teamASecondInnings?: { batting: BatsmanScore[]; bowling: BowlerStats[] };
    teamBFirstInnings: { batting: BatsmanScore[]; bowling: BowlerStats[] };
    teamBSecondInnings?: { batting: BatsmanScore[]; bowling: BowlerStats[] };
  };
}

// ── Mock Matches Data ─────────────────────────────────────────────────────────
const MOCK_MATCHES: Match[] = [
  {
    id: "match-1",
    date: "FRI, AUG 7 2026",
    dateLabel: "Friday, August 7, 2026",
    title: "3-Day Warm-up Match",
    format: "Warm-up",
    venue: "Colombo, Nondescripts Cricket Club Ground",
    status: "completed",
    teamA: {
      name: "Sri Lanka Cricket XI",
      short: "SL XI",
      innings: [{ runs: "363/8", declared: true }, { runs: "200/6", declared: true }],
      flag: SriLankaFlag,
    },
    teamB: {
      name: "India",
      short: "IND",
      innings: [{ runs: "357/6", declared: true }, { runs: "214/4" }],
      flag: IndiaFlag,
    },
    result: "India won by 6 wkts",
    timestamp: new Date("2026-08-07").getTime(),
    scorecard: {
      teamAFirstInnings: {
        batting: [
          { batsman: "Pathum Nissanka", runs: 74, balls: 98, fours: 9, sixes: 1, dismissal: "c Pant b Bumrah" },
          { batsman: "Avishka Fernando", runs: 42, balls: 61, fours: 5, sixes: 0, dismissal: "lbw b Siraj" },
          { batsman: "Kusal Mendis", runs: 110, balls: 142, fours: 12, sixes: 3, dismissal: "retired hurt" },
          { batsman: "Charith Asalanka", runs: 58, balls: 84, fours: 6, sixes: 1, dismissal: "c Jadeja b Ashwin" },
        ],
        bowling: [
          { bowler: "Jasprit Bumrah", overs: 18, maidens: 4, runs: 62, wickets: 2 },
          { bowler: "Mohammed Siraj", overs: 15, maidens: 2, runs: 54, wickets: 1 },
          { bowler: "Ravichandran Ashwin", overs: 22, maidens: 3, runs: 85, wickets: 3 },
        ]
      },
      teamBFirstInnings: {
        batting: [
          { batsman: "Rohit Sharma", runs: 67, balls: 78, fours: 8, sixes: 2, dismissal: "c Mendis b Wellalage" },
          { batsman: "Yashasvi Jaiswal", runs: 92, balls: 115, fours: 11, sixes: 1, dismissal: "c Hasaranga b Fernando" },
          { batsman: "Shubman Gill", runs: 48, balls: 65, fours: 4, sixes: 1, dismissal: "b Theekshana" },
          { batsman: "Virat Kohli", runs: 84, balls: 102, fours: 9, sixes: 0, dismissal: "not out" },
        ],
        bowling: [
          { bowler: "Vishwa Fernando", overs: 16, maidens: 1, runs: 72, wickets: 1 },
          { bowler: "Dunith Wellalage", overs: 20, maidens: 2, runs: 88, wickets: 2 },
          { bowler: "Maheesh Theekshana", overs: 18, maidens: 3, runs: 64, wickets: 1 },
        ]
      }
    }
  },
  {
    id: "match-2",
    date: "SAT, AUG 15 2026",
    dateLabel: "Saturday, August 15, 2026",
    title: "1st Test Match",
    format: "Test",
    venue: "Galle, Galle International Stadium",
    status: "completed",
    teamA: {
      name: "India",
      short: "IND",
      innings: [{ runs: "462" }, { runs: "193" }],
      flag: IndiaFlag,
    },
    teamB: {
      name: "Sri Lanka",
      short: "SL",
      innings: [{ runs: "284" }, { runs: "206" }],
      flag: SriLankaFlag,
    },
    result: "India won by 165 runs",
    timestamp: new Date("2026-08-15").getTime(),
    scorecard: {
      teamAFirstInnings: {
        batting: [
          { batsman: "Yashasvi Jaiswal", runs: 144, balls: 210, fours: 16, sixes: 2, dismissal: "c Mendis b Fernando" },
          { batsman: "Rohit Sharma", runs: 35, balls: 54, fours: 4, sixes: 0, dismissal: "lbw b Asalanka" },
          { batsman: "Shubman Gill", runs: 102, balls: 164, fours: 12, sixes: 1, dismissal: "c Hasaranga b Wellalage" },
          { batsman: "Virat Kohli", runs: 78, balls: 120, fours: 8, sixes: 0, dismissal: "c Mathews b Jayasuriya" },
        ],
        bowling: [
          { bowler: "Asitha Fernando", overs: 24, maidens: 3, runs: 94, wickets: 1 },
          { bowler: "Prabath Jayasuriya", overs: 32, maidens: 5, runs: 118, wickets: 2 },
          { bowler: "Dunith Wellalage", overs: 18, maidens: 2, runs: 76, wickets: 1 },
        ]
      },
      teamBFirstInnings: {
        batting: [
          { batsman: "Pathum Nissanka", runs: 53, balls: 84, fours: 6, sixes: 0, dismissal: "c Pant b Siraj" },
          { batsman: "Dimuth Karunaratne", runs: 28, balls: 45, fours: 3, sixes: 0, dismissal: "lbw b Bumrah" },
          { batsman: "Dinesh Chandimal", runs: 87, balls: 154, fours: 9, sixes: 1, dismissal: "c Rohit b Jadeja" },
          { batsman: "Angelo Mathews", runs: 42, balls: 90, fours: 4, sixes: 0, dismissal: "c Gill b Ashwin" },
        ],
        bowling: [
          { bowler: "Jasprit Bumrah", overs: 19, maidens: 6, runs: 52, wickets: 3 },
          { bowler: "Mohammed Siraj", overs: 14, maidens: 2, runs: 48, wickets: 1 },
          { bowler: "Ravindra Jadeja", overs: 22, maidens: 4, runs: 68, wickets: 2 },
          { bowler: "Ravichandran Ashwin", overs: 25, maidens: 5, runs: 72, wickets: 4 },
        ]
      }
    }
  },
  {
    id: "match-3",
    date: "SUN, AUG 23 2026",
    dateLabel: "Sunday, August 23, 2026",
    title: "2nd Test Match",
    format: "Test",
    venue: "Colombo, Sinhalese Sports Club Ground",
    status: "upcoming",
    teamA: {
      name: "Sri Lanka",
      short: "SL",
      innings: [],
      flag: SriLankaFlag,
    },
    teamB: {
      name: "India",
      short: "IND",
      innings: [],
      flag: IndiaFlag,
    },
    timeLabel: "10:00 AM / 4:30 AM (GMT) / 10:00 AM (LOCAL)",
    timestamp: new Date("2026-08-23T10:00:00+05:30").getTime(),
  },
];

export default function NewMatchCenterPage() {
  const [activeTab, setActiveTab] = useState<"all" | "completed" | "upcoming">("all");
  const [remindedMatches, setRemindedMatches] = useState<Set<string>>(new Set());
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [activeScorecardTab, setActiveScorecardTab] = useState<"teamA" | "teamB">("teamA");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Auto-dismiss toast
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const toggleReminder = (matchId: string) => {
    setRemindedMatches((prev) => {
      const updated = new Set(prev);
      if (updated.has(matchId)) {
        updated.delete(matchId);
        setToastMessage("Match reminder removed!");
      } else {
        updated.add(matchId);
        setToastMessage("Match reminder set successfully! 🔔");
      }
      return updated;
    });
  };

  const filteredMatches = useMemo(() => {
    if (activeTab === "all") return MOCK_MATCHES;
    return MOCK_MATCHES.filter((m) => m.status === activeTab);
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-[#08080c] text-white font-sans pb-16">
      {/* Dynamic Toast Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-[#FF0055] text-white px-5 py-3 rounded-xl shadow-xl shadow-pink-500/20 font-bold text-xs uppercase tracking-wide flex items-center gap-2 border border-white/10 animate-in slide-in-from-top duration-300">
          <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
          {toastMessage}
        </div>
      )}

      {/* Premium Hero Banner */}
      <div className="relative overflow-hidden h-[180px] sm:h-[220px] bg-gradient-to-r from-indigo-950/60 via-[#08080c] to-[#08080c] border-b border-white/5 flex items-center">
        {/* Background glow meshes */}
        <div className="absolute top-0 left-1/4 w-[250px] h-[250px] rounded-full bg-pink-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        <div className="max-w-[1200px] w-full mx-auto px-4 md:px-8 relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1 md:space-y-2">
            <div className="inline-flex items-center gap-1 bg-gradient-to-r from-amber-600/30 to-orange-600/30 border border-orange-500/40 rounded-full px-3 py-1">
              <Trophy className="w-3.5 h-3.5 text-yellow-400" />
              <span className="text-[10px] uppercase font-black text-orange-400 tracking-wider">IND vs SL Test Series</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-gray-400">
              Match Center
            </h1>
            <p className="text-xs text-gray-400 font-medium">
              Live updates, fixture lists, and premium scorecards for the 2026 Bilateral Series.
            </p>
          </div>

          {/* Quick Series Status Card */}
          <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/5 p-3 sm:p-4 shrink-0 flex items-center gap-4">
            <div className="text-center">
              <span className="block text-[8px] text-gray-400 font-bold uppercase tracking-wider">Series Standings</span>
              <span className="text-sm font-black text-emerald-400">IND leads 2-0</span>
              <span className="block text-[9px] text-gray-500 font-medium mt-0.5">2 matches played</span>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="flex gap-1.5">
              <IndiaFlag className="w-8 h-5" />
              <span className="text-xs font-bold text-gray-300">vs</span>
              <SriLankaFlag className="w-8 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Filter Tabs & Fixture Lists */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Segmented Filter Tab Controls */}
          <div className="flex items-center gap-2 bg-[#12121e]/85 p-1 rounded-2xl border border-white/5 backdrop-blur-md">
            {[
              { id: "all", label: "All Matches" },
              { id: "completed", label: "Results" },
              { id: "upcoming", label: "Upcoming" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as "all" | "completed" | "upcoming")}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-[#FF0055] to-[#FF4500] text-white shadow-lg shadow-pink-500/10"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Matches List Grid */}
          <div className="space-y-6">
            {filteredMatches.length > 0 ? (
              filteredMatches.map((match) => {
                const TeamAFlag = match.teamA.flag;
                const TeamBFlag = match.teamB.flag;
                const isUpcoming = match.status === "upcoming";

                return (
                  <div key={match.id} className="space-y-2">
                    {/* Date label header */}
                    <div className="flex items-center gap-2 text-xs font-black uppercase text-pink-500 tracking-widest pl-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{match.date}</span>
                    </div>

                    {/* Premium Card container */}
                    <div className="bg-[#12121e]/80 border border-white/5 rounded-3xl p-5 hover:border-white/10 transition-colors backdrop-blur-md shadow-xl flex flex-col justify-between space-y-4">
                      
                      {/* Card Top Meta */}
                      <div className="flex items-center justify-between text-[10px] font-bold text-gray-400">
                        <span className="flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${isUpcoming ? "bg-amber-400 animate-pulse" : "bg-gray-500"}`} />
                          {match.title}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-emerald-400" />
                          {match.venue}
                        </span>
                      </div>

                      {/* Scoreboard Block */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-1.5">
                        
                        {/* Team Info Block */}
                        <div className="space-y-3 flex-1 w-full">
                          
                          {/* Team A Row */}
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-2.5">
                              <TeamAFlag className="w-6 h-4 shrink-0" />
                              <span className="text-sm font-bold text-white tracking-tight">{match.teamA.name}</span>
                            </div>
                            {!isUpcoming && match.teamA.innings.length > 0 && (
                              <div className="text-right">
                                <span className="text-sm font-black text-white">
                                  {match.teamA.innings.map((inn, i) => (
                                    <React.Fragment key={i}>
                                      {i > 0 && " & "}
                                      {inn.runs}
                                      {inn.declared && " d"}
                                    </React.Fragment>
                                  ))}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Team B Row */}
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-2.5">
                              <TeamBFlag className="w-6 h-4 shrink-0" />
                              <span className="text-sm font-bold text-white tracking-tight">{match.teamB.name}</span>
                            </div>
                            {!isUpcoming && match.teamB.innings.length > 0 && (
                              <div className="text-right">
                                <span className="text-sm font-black text-white">
                                  {match.teamB.innings.map((inn, i) => (
                                    <React.Fragment key={i}>
                                      {i > 0 && " & "}
                                      {inn.runs}
                                      {inn.declared && " d"}
                                    </React.Fragment>
                                  ))}
                                </span>
                              </div>
                            )}
                          </div>

                        </div>

                        {/* Upcoming specific time block */}
                        {isUpcoming && (
                          <div className="w-full sm:w-auto shrink-0 bg-black/35 rounded-2xl p-3 border border-white/5 flex flex-col justify-center sm:text-right space-y-1">
                            <div className="flex items-center gap-1.5 text-orange-400 font-bold text-[10px] uppercase">
                              <Clock className="w-3.5 h-3.5" />
                              Match starts at 04:30 GMT
                            </div>
                            <span className="text-[11px] font-semibold text-gray-300 line-clamp-1">{match.timeLabel}</span>
                          </div>
                        )}

                      </div>

                      {/* Card Action Controls & Status */}
                      <div className="pt-3 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        
                        {/* Custom outcome/result text */}
                        <div>
                          {match.result ? (
                            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                              {match.result}
                            </span>
                          ) : (
                            <span className="text-[10px] font-black text-orange-400 uppercase tracking-wider bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20 animate-pulse">
                              Scheduled
                            </span>
                          )}
                        </div>

                        {/* Actions buttons */}
                        <div className="flex items-center gap-2">
                          {isUpcoming ? (
                            <>
                              <button
                                onClick={() => toggleReminder(match.id)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all active:scale-95 ${
                                  remindedMatches.has(match.id)
                                    ? "bg-red-500/20 border-red-500 text-red-500"
                                    : "border-white/10 hover:bg-white/5 text-gray-300 hover:text-white"
                                }`}
                              >
                                {remindedMatches.has(match.id) ? (
                                  <>
                                    <BellOff className="w-3.5 h-3.5" />
                                    Mute
                                  </>
                                ) : (
                                  <>
                                    <Bell className="w-3.5 h-3.5" />
                                    Remind Me
                                  </>
                                )}
                              </button>
                              
                              <Link
                                href="/MainModules/WatchAlong"
                                className="bg-gradient-to-r from-[#FF0055] to-[#FF4500] hover:from-[#ff1a66] hover:to-[#ff5714] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-pink-500/10 active:scale-95"
                              >
                                <Tv className="w-3.5 h-3.5" />
                                Join Lobby
                              </Link>
                            </>
                          ) : (
                            <>
                              {match.scorecard && (
                                <button
                                  onClick={() => {
                                    setSelectedMatch(match);
                                    setActiveScorecardTab("teamA");
                                  }}
                                  className="px-4 py-2 rounded-xl text-xs font-bold border border-white/10 hover:bg-white/5 text-gray-300 hover:text-white flex items-center gap-1 transition-all active:scale-95"
                                >
                                  <Info className="w-3.5 h-3.5" />
                                  Scorecard
                                </button>
                              )}
                              
                              <Link
                                href="/MainModules/WatchAlong"
                                className="bg-white/5 hover:bg-white/10 text-[#FF0055] hover:text-[#ff1a66] border border-[#FF0055]/30 hover:border-[#FF0055]/50 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95"
                              >
                                <Play className="w-3.5 h-3.5 fill-current" />
                                Highlights
                              </Link>
                            </>
                          )}
                        </div>

                      </div>

                    </div>
                  </div>
                );
              })
            ) : (
              <div className="bg-[#12121e]/80 border border-white/5 rounded-3xl p-8 text-center text-gray-400 font-medium">
                No fixtures found for the selected tab.
              </div>
            )}
          </div>

        </div>

        {/* Right Side: Series Overview & Statistics (Sticky Widget) */}
        <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-6 self-start">
          
          {/* Series Summary Widget */}
          <div className="bg-[#12121e]/80 border border-white/5 rounded-3xl p-5 backdrop-blur-md shadow-xl space-y-4">
            <div className="flex items-center gap-2 border-b border-white/5 pb-3">
              <Trophy className="w-4 h-4 text-yellow-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-pink-400">Series Summary</h3>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center bg-black/30 p-2.5 rounded-xl border border-white/5">
                <span className="text-[11px] font-semibold text-gray-400">Total Matches</span>
                <span className="text-xs font-black text-white">3 (2 Test, 1 Warm-up)</span>
              </div>
              <div className="flex justify-between items-center bg-black/30 p-2.5 rounded-xl border border-white/5">
                <span className="text-[11px] font-semibold text-gray-400">Format</span>
                <span className="text-xs font-black text-white">Red-ball / Multi-day</span>
              </div>
              <div className="flex justify-between items-center bg-black/30 p-2.5 rounded-xl border border-white/5">
                <span className="text-[11px] font-semibold text-gray-400">Status</span>
                <span className="text-xs font-black text-orange-400 flex items-center gap-1 animate-pulse">
                  Active
                </span>
              </div>
            </div>

            <div className="pt-2">
              <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 pl-0.5">Top Performers (India)</h4>
              <div className="space-y-2">
  <div className="flex items-center justify-between p-2 rounded-xl hover:bg-white/5 transition-colors">
    <div className="flex items-center gap-2">
      <span className="text-xs">🏏</span>
      <div>
        <span className="block text-[11px] font-bold text-white">Devdutt Padikkal</span>
        <span className="block text-[8px] text-gray-500 font-semibold uppercase">211 Runs • Avg 105.5</span>
      </div>
    </div>
    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
  </div>
  <div className="flex items-center justify-between p-2 rounded-xl hover:bg-white/5 transition-colors">
    <div className="flex items-center gap-2">
      <span className="text-xs">🔮</span>
      <div>
        <span className="block text-[11px] font-bold text-white">Manav Suthar</span>
        <span className="block text-[8px] text-gray-500 font-semibold uppercase">10 Wickets • Avg 13.1</span>
      </div>
    </div>
    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
  </div>
</div>
            </div>
          </div>

          {/* Interactive Share Campaign Info */}
          <div className="bg-gradient-to-br from-indigo-950/40 to-slate-950 border border-white/5 rounded-3xl p-5 backdrop-blur-md shadow-xl flex flex-col justify-between space-y-4">
            <div className="space-y-1">
              <span className="text-xs font-black text-[#FF0055] uppercase tracking-wider">SF360 Exclusives</span>
              <h4 className="text-sm font-bold text-white leading-snug">Host a Watch Along room with friends!</h4>
              <p className="text-[10px] text-gray-400 font-medium">Create a lobby for the 2nd Test SSC match starting Aug 23.</p>
            </div>
            <Link
              href="/MainModules/HostDashboard"
              className="w-full bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wider py-2.5 rounded-xl border border-white/10 flex items-center justify-center gap-1.5 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5 text-cyan-400" />
              Invite Friends
            </Link>
          </div>

        </div>

      </div>

      {/* ── Scorecard Detailed Modal Overlay ─────────────────────────────────── */}
      {selectedMatch && (
        <div className="fixed inset-0 z-50 bg-[#08080c]/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#12121e] border border-white/10 w-full max-w-[700px] rounded-3xl max-h-[85vh] overflow-y-auto shadow-2xl relative flex flex-col animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-white/5 sticky top-0 bg-[#12121e] z-10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">Scorecard Preview</h3>
                  <span className="text-[10px] text-gray-500 font-semibold">{selectedMatch.title} • {selectedMatch.venue}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedMatch(null)}
                className="p-1.5 bg-white/5 border border-white/5 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scorecard Tabs */}
            <div className="flex border-b border-white/5 bg-black/25">
              <button
                onClick={() => setActiveScorecardTab("teamA")}
                className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
                  activeScorecardTab === "teamA"
                    ? "border-[#FF0055] text-white bg-white/5"
                    : "border-transparent text-gray-400 hover:text-white"
                }`}
              >
                {selectedMatch.teamA.name}
              </button>
              <button
                onClick={() => setActiveScorecardTab("teamB")}
                className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
                  activeScorecardTab === "teamB"
                    ? "border-[#FF0055] text-white bg-white/5"
                    : "border-transparent text-gray-400 hover:text-white"
                }`}
              >
                {selectedMatch.teamB.name}
              </button>
            </div>

            {/* Modal Contents */}
            <div className="p-5 space-y-6">
              {/* Scorecard Data render */}
              {selectedMatch.scorecard ? (
                <>
                  {/* Select corresponding innings */}
                  {(() => {
                    const inningsData = activeScorecardTab === "teamA" 
                      ? selectedMatch.scorecard.teamAFirstInnings 
                      : selectedMatch.scorecard.teamBFirstInnings;
                    
                    if (!inningsData) return <p className="text-xs text-gray-400 text-center">No batting scorecard details compiled yet.</p>;

                    return (
                      <div className="space-y-5">
                        {/* Batting details */}
                        <div className="space-y-2">
                          <h4 className="text-xs font-black text-pink-400 uppercase tracking-wider pl-0.5">Batting</h4>
                          <div className="overflow-x-auto rounded-2xl border border-white/5 bg-black/20">
                            <table className="w-full text-left border-collapse text-xs">
                              <thead>
                                <tr className="border-b border-white/5 bg-white/5 text-gray-400 font-bold">
                                  <th className="p-3">Batsman</th>
                                  <th className="p-3">Dismissal</th>
                                  <th className="p-3 text-right">Runs</th>
                                  <th className="p-3 text-right">Balls</th>
                                  <th className="p-3 text-right">4s</th>
                                  <th className="p-3 text-right">6s</th>
                                </tr>
                              </thead>
                              <tbody>
                                {inningsData.batting.map((bats, index) => (
                                  <tr key={index} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                    <td className="p-3 font-bold text-white">{bats.batsman}</td>
                                    <td className="p-3 text-gray-400 text-[11px]">{bats.dismissal}</td>
                                    <td className="p-3 text-right font-black text-white">{bats.runs}</td>
                                    <td className="p-3 text-right text-gray-300">{bats.balls}</td>
                                    <td className="p-3 text-right text-gray-300">{bats.fours}</td>
                                    <td className="p-3 text-right text-gray-300">{bats.sixes}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Bowling details */}
                        <div className="space-y-2">
                          <h4 className="text-xs font-black text-pink-400 uppercase tracking-wider pl-0.5">Bowling</h4>
                          <div className="overflow-x-auto rounded-2xl border border-white/5 bg-black/20">
                            <table className="w-full text-left border-collapse text-xs">
                              <thead>
                                <tr className="border-b border-white/5 bg-white/5 text-gray-400 font-bold">
                                  <th className="p-3">Bowler</th>
                                  <th className="p-3 text-right">Overs</th>
                                  <th className="p-3 text-right">Maidens</th>
                                  <th className="p-3 text-right">Runs</th>
                                  <th className="p-3 text-right">Wickets</th>
                                </tr>
                              </thead>
                              <tbody>
                                {inningsData.bowling.map((bowl, index) => (
                                  <tr key={index} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                    <td className="p-3 font-bold text-white">{bowl.bowler}</td>
                                    <td className="p-3 text-right text-gray-300">{bowl.overs}</td>
                                    <td className="p-3 text-right text-gray-300">{bowl.maidens}</td>
                                    <td className="p-3 text-right text-gray-300">{bowl.runs}</td>
                                    <td className="p-3 text-right font-black text-yellow-400">{bowl.wickets}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </>
              ) : (
                <div className="text-center py-6 text-gray-400 font-medium">
                  Detailed scorecard data is not available for this warm-up match.
                </div>
              )}
            </div>
            
            {/* Modal Footer */}
            <div className="p-4 border-t border-white/5 bg-black/25 flex justify-end sticky bottom-0 z-10">
              <button
                onClick={() => setSelectedMatch(null)}
                className="bg-gradient-to-r from-[#FF0055] to-[#FF4500] text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-transform active:scale-95 shadow-md"
              >
                Close Preview
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}