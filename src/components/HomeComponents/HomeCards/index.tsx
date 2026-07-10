"use client";
import Link from "next/link";
import { Mic, Play, List, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";

type Stat = {
  label: string;
  value: string;
};

type CardProps = {
  id: number;
  title: string;
  subtitle: string;
  profileUrl: string;
  image: string;
  stats: Stat[];
  buttonText: string;
  buttonIcon?: "play" | "chart";
  buttonUrl?: string;
};

interface Playlist {
  id: string;
  name: string;
  audioIds: string[];
  createdAt: number;
  updatedAt: number;
}

interface Team360Post {
  id: string;
  teamName: string;
}

interface Team360Playlist {
  id: string;
  team360PostId: string;
  audioDrops: unknown[];
  videoDrops: unknown[];
  createdAt: number;
  updatedAt: number;
}

interface TeamPlaylistItem {
  id: string;
  title: string;
  dropCount: number;
  href: string;
}

interface MatchInfo {
  team1?: string;
  team2?: string;
  type?: string;
  speaker?: string;
  date?: string;
}

interface AudioFile {
  id: string;
  title: string;
  url: string;
  duration: string;
  createdAt: string;
  matchInfo?: MatchInfo;
  views?: string | number;
  likes?: number;
  listens?: number;
  signals?: number;
}

interface VideoFile {
  id: string;
  title: string;
  url: string;
  duration: string;
  createdAt: string;
  playerInfo?: {
    playerName?: string;
    chapter?: string;
    chapterNumber?: number;
  };
  views?: string | number;
  likes?: number;
  listens?: number;
  signals?: number;
}

type BadgeType = "FEATURE" | "ANALYSIS" | "OPINION" | "NEWS" | "DAWN DISPATCH";

interface Article {
  id: string;
  badge: BadgeType;
  title: string;
  author: string;
  description: string[];
  readTime: string;
  views: string;
  viewCount?: number;
  image: string;
  createdAt: number;
  updatedAt?: number;
  commentCount?: number;
}

interface TrendingDrop {
  id: string;
  type: "audio" | "video";
  title: string;
  displayTitle: string;
  displaySubtitle: string;
  href: string;
  score: number;
  plays: number;
  views: number;
  likes: number;
  createdAt: string;
}

// IPL Teams mapping for filtering
const IPL_TEAMS: Record<string, string[]> = {
  "Mumbai Indians": ["MI", "Mumbai"],
  "Chennai Super Kings": ["CSK", "Chennai"],
  "Royal Challengers Bengaluru": ["RCB", "Bengaluru", "Bangalore"],
  "Sunrisers Hyderabad": ["SRH", "Hyderabad"],
  "Kolkata Knight Riders": ["KKR", "Kolkata"],
  "Delhi Capitals": ["DC", "Delhi"],
  "Rajasthan Royals": ["RR", "Rajasthan"],
  "Punjab Kings": ["PBKS", "Punjab"],
  "Lucknow Super Giants": ["LSG", "Lucknow"],
  "Gujarat Titans": ["GT", "Gujarat"],
};

const homeCardsData: CardProps[] = [
  {
    id: 1,
    title: "IPL T20 2026 360World",
    subtitle: "Exclusive content from all 10 teams",
    image: "/images/ipl360.jpg",
    profileUrl: "",
    stats: [
      { label: "Teams", value: "10" },
      { label: "Drops", value: "0" },
      { label: "Plays", value: "0" },
    ],
    buttonText: "View Full Playlist",
    buttonIcon: "play",
    buttonUrl: "/MainModules/MatchesDropContent",
  },
  {
    id: 2,
    title: "SportsFan360",
    subtitle: "Your ultimate sports companion",
    image: "/images/sportsfan360.jpeg",
    profileUrl: "/MainModules/sportsfanprofile",
    stats: [
      { label: "Articles", value: "0" },
      { label: "Views", value: "0" },
      { label: "Active", value: "1.8M" },
    ],
    buttonText: "Read All Articles",
    buttonIcon: "chart",
    buttonUrl: "/MainModules/CricketArticles"
  },
  {
    id: 3,
    title: "My Playlists",
    subtitle: "All your favorite sports content in one place",
    image: "/images/cricketarticlessecond.jpg",
    profileUrl: "/MainModules/Playlists",
    stats: [
      { label: "Playlists", value: "0" },
      { label: "Total Drops", value: "0" },
      { label: "Saved", value: "0" },
    ],
    buttonText: "View All Playlists",
    buttonIcon: "chart",
    buttonUrl: "/MainModules/Playlists"
  },
  {
    id: 4,
    title: "FIFA World Cup 2026",
    subtitle: "The world's biggest football tournament",
    image: "/images/fifa2026.png",
    profileUrl: "",
    stats: [
      { label: "Teams", value: "48" },
      { label: "Drops", value: "0" },
      { label: "Matches", value: "104" },
    ],
    buttonText: "View Full Playlist",
    buttonIcon: "play",
    buttonUrl: "/MainModules/MatchesDropContent?team=FIFA",
  },
  {
    id: 5,
    title: "Women's T20 2026",
    subtitle: "Exclusive coverage of women's cricket",
    image: "/images/womens_t20.jpg",
    profileUrl: "",
    stats: [
      { label: "Teams", value: "10" },
      { label: "Drops", value: "0" },
      { label: "Plays", value: "0" },
    ],
    buttonText: "View Full Playlist",
    buttonIcon: "play",
    buttonUrl: "/MainModules/MatchesDropContent?team=Women%20T20",
  },
];

function getDisplayTitle(audio: AudioFile): string {
  const title = (audio.title || "").toLowerCase();
  if (title.includes("toss report")) return "TOSS REPORT";
  if (title.includes("post match")) return "POST MATCH";
  if (title.includes("pre match")) return "PRE MATCH";
  if (title.includes("match analysis")) return "MATCH ANALYSIS";
  if (title.includes("highlights")) return "HIGHLIGHTS";
  if (title.includes("dawn dispatch")) return "DAWN DISPATCH";
  const type = audio.matchInfo?.type;
  if (type && type !== "unknown") {
    return type.replace(/_/g, " ").toUpperCase();
  }
  return "AUDIO DROP";
}

function getSpeakerLabel(audio: AudioFile): string {
  const speaker = audio.matchInfo?.speaker || "";
  return speaker
    .replace(/^toss report\s*/i, "")
    .replace(/^script\s*/i, "")
    .replace(/^story\s*/i, "")
    .trim() || "Audio Drop";
}

// Newest-first sort by createdAt
function newestFirst<T extends { createdAt: string }>(arr: T[]): T[] {
  return [...arr].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

// Format number (e.g., 1200 → "1.2K")
function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

// Check if a drop is from an IPL match
function isIPLDrop(matchInfo?: MatchInfo, title?: string): boolean {
  if (!matchInfo) return false;
  const teams = [matchInfo.team1, matchInfo.team2];
  const allTeamKeys = Object.keys(IPL_TEAMS);
  return teams.some(team => team && allTeamKeys.includes(team));
}

// Extract match name from audio title (e.g., "GT vs RCB" from "GT vs RCB - TOSS REPORT")
function extractMatchName(title: string): string {
  if (!title) return "";
  const dashIndex = title.indexOf(" - ");
  if (dashIndex > 0) {
    return title.substring(0, dashIndex).trim();
  }
  const keywords = ["TOSS REPORT", "POST MATCH", "PRE MATCH", "MATCH ANALYSIS", "HIGHLIGHTS"];
  for (const keyword of keywords) {
    if (title.toUpperCase().includes(keyword)) {
      const keywordIndex = title.toUpperCase().indexOf(keyword);
      return title.substring(0, keywordIndex).trim();
    }
  }
  return "";
}

function toNumericValue(value?: string | number): number {
  if (typeof value === "number") return value;
  if (!value) return 0;
  const numeric = String(value).replace(/[^\d]/g, "");
  return numeric ? parseInt(numeric, 10) : 0;
}

function formatTrendCount(count: number): string {
  return formatNumber(count);
}

// ── Latest Playlists List ─────────────────────────────────────────────────────
function LatestPlaylistsList({ userId }: { userId: string | null }) {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [teamPlaylists, setTeamPlaylists] = useState<TeamPlaylistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlaylists = async () => {
      setLoading(true);

      try {
        const [userPlaylistsRes, teamPostsRes, teamPlaylistsRes] = await Promise.all([
          userId
            ? axios.get(`/api/playlists?userId=${userId}`)
            : Promise.resolve({ data: { success: true, playlists: [] } }),
          axios.get("/api/team360"),
          axios.get("/api/team360-playlist")
        ]);

        if (userPlaylistsRes.data.success) {
          const sorted = (userPlaylistsRes.data.playlists || []).sort((a: Playlist, b: Playlist) => b.createdAt - a.createdAt);
          setPlaylists(sorted.slice(0, 3));
        } else {
          setPlaylists([]);
        }

        const teamPosts: Team360Post[] = teamPostsRes.data.posts || [];
        const teamNameById = new Map(teamPosts.map((post) => [post.id, post.teamName] as const));

        const latestTeamPlaylists = (teamPlaylistsRes.data?.success && Array.isArray(teamPlaylistsRes.data.playlists)
          ? (teamPlaylistsRes.data.playlists as Team360Playlist[])
          : [])
          .sort((a, b) => b.createdAt - a.createdAt)
          .slice(0, 3)
          .map((playlist) => {
            const dropCount = (playlist.audioDrops?.length || 0) + (playlist.videoDrops?.length || 0);
            const teamName = teamNameById.get(playlist.team360PostId) || "Team 360 Playlist";
            return {
              id: playlist.id,
              title: teamName,
              dropCount,
              href: `/MainModules/MatchesDropContent?team=${encodeURIComponent(teamName)}`,
            };
          });

        setTeamPlaylists(latestTeamPlaylists);
      } catch (err) {
        console.error("Error fetching playlists:", err);
        setPlaylists([]);
        setTeamPlaylists([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylists();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex flex-col gap-2 mt-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 bg-[#1c1c1c] rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 mt-2">
      {playlists.length > 0 ? (
        playlists.map((playlist) => (
          <Link
            key={playlist.id}
            href={`/MainModules/Playlists?playlistId=${playlist.id}`}
          >
            <div className="flex items-center gap-2 bg-[#1c1c1c] rounded-lg px-2 py-2 hover:bg-[#2a2a2a] transition-colors cursor-pointer">
              <List size={18} className="text-[#C9115F] flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-white text-[11px] lg:text-[12px] font-medium leading-tight truncate">
                  {playlist.name}
                </p>
                <p className="text-gray-500 text-[9px] lg:text-[10px] leading-tight">
                  {playlist.audioIds.length} {playlist.audioIds.length === 1 ? "drop" : "drops"}
                </p>
              </div>
            </div>
          </Link>
        ))
      ) : (
        <div className="mt-1 text-center py-2">
          <p className="text-gray-500 text-[11px]">No personal playlists yet</p>
          <p className="text-gray-600 text-[9px] mt-1">Team 360 playlists are shown below if available</p>
        </div>
      )}
    </div>
  );
}

// ── Latest Drops List (Unified Audio + Video, filtered by type) ───────────────
interface UnifiedDrop {
  id: string;
  title: string;
  type: 'audio' | 'video';
  createdAt: string;
  displayTitle: string;
  displaySubtitle: string;
  href: string;
}

function LatestDropsList({ type }: { type: string }) {
  const [drops, setDrops] = useState<UnifiedDrop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDrops = async () => {
      try {
        const [audioRes, videoRes] = await Promise.all([
          axios.get(`/api/cloudinary/audio?type=${type}&limit=100`),
          axios.get(`/api/cloudinary/video?type=${type}&limit=100`)
        ]);

        let combined: UnifiedDrop[] = [];

        if (audioRes.data.success) {
          const audios = (audioRes.data.audioFiles as AudioFile[]).map(a => ({
            id: a.id,
            title: a.title,
            type: 'audio' as const,
            createdAt: a.createdAt,
            displayTitle: getDisplayTitle(a),
            displaySubtitle: extractMatchName(a.title)
              ? `${getSpeakerLabel(a)} · ${extractMatchName(a.title)}`
              : `${getDisplayTitle(a)} · ${getSpeakerLabel(a)}`,
            href: `/MainModules/MatchesDropContent/AudioDropScreen?id=${encodeURIComponent(a.id)}`
          }));
          combined = [...combined, ...audios];
        }

        if (videoRes.data.success) {
          const videos = (videoRes.data.videoFiles as VideoFile[]).map(v => ({
            id: v.id,
            title: v.title,
            type: 'video' as const,
            createdAt: v.createdAt,
            displayTitle: v.title,
            displaySubtitle: v.playerInfo?.playerName
              ? `${v.playerInfo.playerName.charAt(0).toUpperCase() + v.playerInfo.playerName.slice(1)} · Chapter ${v.playerInfo.chapterNumber}`
              : "Video Drop",
            href: `/MainModules/MatchesDropContent/VideoDropScreen?id=${encodeURIComponent(v.id)}`
          }));
          combined = [...combined, ...videos];
        }

        combined.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setDrops(combined.slice(0, 4));
      } catch (err) {
        console.error("Failed to fetch drops", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDrops();
  }, [type]);

  if (loading) {
    return (
      <div className="flex flex-col gap-1.5 mt-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-8 bg-[#1c1c1c] rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (drops.length === 0) return null;

  return (
    <div className="flex flex-col gap-1.5 mt-2">
      {drops.map((drop) => (
        <Link key={`${drop.type}-${drop.id}`} href={drop.href}>
          <div className="flex items-center gap-2 bg-[#1c1c1c] rounded-lg px-2 py-1.5 hover:bg-[#2a2a2a] transition-colors">
            {drop.type === 'audio' ? (
              <Mic size={18} className="text-[#C9115F] flex-shrink-0" />
            ) : (
              <Play size={18} className="text-[#C9115F] flex-shrink-0" fill="#C9115F" />
            )}
            <div className="min-w-0 flex-1">
              <p className="text-white text-[10px] lg:text-[12px] font-medium leading-tight truncate">
                {drop.displayTitle}
              </p>
              <p className="text-gray-500 text-[9px] lg:text-[12px] leading-tight truncate">
                {drop.displaySubtitle}
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

// ── Trending Drops List ───────────────────────────────────────────────────────
function TrendingDropsList() {
  const [drops, setDrops] = useState<TrendingDrop[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const fetchTrendingDrops = async () => {
      try {
        const [audioRes, videoRes, playsRes] = await Promise.allSettled([
          axios.get(`/api/cloudinary/audio?limit=100`),
          axios.get(`/api/cloudinary/video?limit=100`),
          axios.get(`/api/cloudinary/plays`),
        ]);

        const playsMap: Record<string, number> =
          playsRes.status === "fulfilled" ? playsRes.value.data.plays || {} : {};

        const combined: TrendingDrop[] = [];

        if (audioRes.status === "fulfilled" && audioRes.value.data.success) {
          const audioFiles = (audioRes.value.data.audioFiles || []) as AudioFile[];
          audioFiles.forEach((audio) => {
            const plays = playsMap[audio.id] || 0;
            const likes = typeof audio.likes === "number" ? audio.likes : 0;
            const score = plays + likes;

            combined.push({
              id: audio.id,
              type: "audio",
              title: audio.title,
              displayTitle: getDisplayTitle(audio),
              displaySubtitle: extractMatchName(audio.title)
                ? `${getSpeakerLabel(audio)} · ${extractMatchName(audio.title)}`
                : `${getSpeakerLabel(audio)} · Audio Drop`,
              href: `/MainModules/MatchesDropContent/AudioDropScreen?id=${encodeURIComponent(audio.id)}`,
              score,
              plays,
              views: 0,
              likes,
              createdAt: audio.createdAt,
            });
          });
        }

        if (videoRes.status === "fulfilled" && videoRes.value.data.success) {
          const videoFiles = (videoRes.value.data.videoFiles || []) as VideoFile[];
          videoFiles.forEach((video) => {
            const plays = playsMap[video.id] || 0;
            const likes = typeof video.likes === "number" ? video.likes : 0;
            const score = plays + likes;

            combined.push({
              id: video.id,
              type: "video",
              title: video.title,
              displayTitle: video.title,
              displaySubtitle: video.playerInfo?.playerName
                ? `${video.playerInfo.playerName} · Chapter ${video.playerInfo.chapterNumber ?? "-"}`
                : "Video Drop",
              href: `/MainModules/MatchesDropContent/VideoDropScreen?id=${encodeURIComponent(video.id)}`,
              score,
              plays,
              views: 0,
              likes,
              createdAt: video.createdAt,
            });
          });
        }

        combined.sort((a, b) => {
          if (b.score !== a.score) return b.score - a.score;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });

        setDrops(combined.slice(0, 10));
      } catch (err) {
        console.error("Failed to fetch trending drops", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingDrops();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col gap-1.5 mt-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-8 bg-[#1c1c1c] rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (drops.length === 0) {
    return (
      <div className="mt-1 text-center py-2">
        <p className="text-gray-500 text-[11px]">No trending drops yet</p>
        <p className="text-gray-600 text-[9px] mt-1">Drops will appear here once engagement builds up</p>
      </div>
    );
  }

  const visibleDrops = showAll ? drops : drops.slice(0, 5);

  return (
    <div className="flex flex-col gap-1.5 mt-2">
      {visibleDrops.map((drop, index) => (
        <Link key={`${drop.type}-${drop.id}`} href={drop.href}>
          <div className="flex items-center gap-2 bg-[#1c1c1c] rounded-lg px-2 py-1.5 hover:bg-[#2a2a2a] transition-colors">
            <div className="w-6 h-6 rounded-full bg-[#C9115F]/15 text-[#C9115F] flex items-center justify-center flex-shrink-0 text-[10px] font-semibold">
              {index + 1}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="text-white text-[10px] lg:text-[12px] font-medium leading-tight truncate">
                  {drop.displayTitle}
                </p>
                <span className="text-[8px] uppercase tracking-wide text-[#C9115F] bg-[#C9115F]/10 px-1.5 py-0.5 rounded-full flex-shrink-0">
                  {drop.type}
                </span>
              </div>
              <p className="text-gray-500 text-[9px] lg:text-[10px] leading-tight truncate">
                {drop.displaySubtitle}
              </p>
              <p className="text-gray-600 text-[8px] lg:text-[9px] leading-tight mt-0.5">
                {formatTrendCount(drop.plays)} plays · {formatTrendCount(drop.likes)} likes
              </p>
            </div>
          </div>
        </Link>
      ))}

      {drops.length > 5 && (
        <button
          type="button"
          onClick={() => setShowAll((current) => !current)}
          className="mt-1 w-full rounded-lg border border-white/10 bg-[#1c1c1c] px-3 py-2 text-[10px] font-medium text-white hover:bg-[#2a2a2a] transition-colors"
        >
          {showAll ? "Show Less" : "View All"}
        </button>
      )}
    </div>
  );
}

// ── Latest Articles List ──────────────────────────────────────────────────────
function LatestArticlesList() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("/api/cricket-articles")
      .then(res => {
        if (res.data.success) {
          const sorted = (res.data.articles || []).sort((a: Article, b: Article) => b.createdAt - a.createdAt);
          setArticles(sorted.slice(0, 3));
        }
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col gap-1.5 mt-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-8 bg-[#1c1c1c] rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (articles.length === 0) return null;

  return (
    <div className="flex flex-col gap-1.5 mt-2">
      {articles.map((article) => (
        <Link
          key={article.id}
          href={`/MainModules/CricketArticles/${article.id}`}
        >
          <div className="flex items-center gap-2 bg-[#1c1c1c] rounded-lg px-2 py-1.5 hover:bg-[#2a2a2a] transition-colors">
            <div className="w-8 h-8 rounded-md overflow-hidden bg-gray-800 flex-shrink-0">
              <img
                src={article.image}
                alt={article.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-white text-[10px] lg:text-[12px] font-medium leading-tight truncate">
                {article.title}
              </p>
              <p className="text-gray-500 text-[9px] lg:text-[12px] leading-tight">
                {article.badge} · {article.readTime}
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function HomeCardsSection() {
  const { user } = useAuth();
  const [cardsData, setCardsData] = useState<CardProps[]>(homeCardsData);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [playlistStats, setPlaylistStats] = useState({ totalPlaylists: 0, totalDrops: 0 });

  const userId = user?.userId || null;

  // Fetch playlist stats
  useEffect(() => {
    if (!userId) return;

    const fetchPlaylistStats = async () => {
      try {
        const res = await axios.get(`/api/playlists?userId=${userId}`);
        if (res.data.success) {
          const playlists = res.data.playlists || [];
          const totalPlaylists = playlists.length;
          const totalDrops = playlists.reduce((sum: number, p: Playlist) => sum + p.audioIds.length, 0);

          setPlaylistStats({ totalPlaylists, totalDrops });

          setCardsData(prevCards =>
            prevCards.map(card =>
              card.id === 3
                ? {
                  ...card,
                  stats: card.stats.map(stat => {
                    if (stat.label === "Playlists") return { ...stat, value: totalPlaylists.toString() };
                    if (stat.label === "Total Drops") return { ...stat, value: totalDrops.toString() };
                    if (stat.label === "Saved") return { ...stat, value: formatNumber(totalDrops) };
                    return stat;
                  }),
                }
                : card
            )
          );
        }
      } catch (err) {
        console.error("Error fetching playlist stats:", err);
      }
    };

    fetchPlaylistStats();
  }, [userId]);

  // Fetch drops and plays stats for IPL, FIFA, Women's T20 cards
  useEffect(() => {
    const fetchDrops = async () => {
      try {
        const [iplRes, fifaRes, womensRes, playsRes] = await Promise.allSettled([
          axios.get(`/api/cloudinary/audio?type=ipl&limit=500`),
          axios.get(`/api/cloudinary/audio?type=fifa&limit=500`),
          axios.get(`/api/cloudinary/audio?type=womens_t20&limit=500`),
          axios.get(`/api/cloudinary/plays`),
        ]);

        const iplCount =
          iplRes.status === "fulfilled"
            ? iplRes.value.data.totalCount || iplRes.value.data.audioFiles?.length || 0
            : 0;

        const fifaCount =
          fifaRes.status === "fulfilled"
            ? fifaRes.value.data.totalCount || fifaRes.value.data.audioFiles?.length || 0
            : 0;

        const womensCount =
          womensRes.status === "fulfilled"
            ? womensRes.value.data.totalCount || womensRes.value.data.audioFiles?.length || 0
            : 0;

        const playsMap: Record<string, number> =
          playsRes.status === "fulfilled" ? playsRes.value.data.plays || {} : {};

        const totalPlays = Object.values(playsMap).reduce((sum, n) => sum + n, 0);

        setCardsData(prevCards =>
          prevCards.map(card =>
            (card.id === 1 || card.id === 4 || card.id === 5)
              ? {
                ...card,
                stats: card.stats.map(stat => {
                  if (stat.label === "Drops") {
                    if (card.id === 1) return { ...stat, value: iplCount.toString() };
                    if (card.id === 4) return { ...stat, value: fifaCount.toString() };
                    if (card.id === 5) return { ...stat, value: womensCount.toString() };
                  }
                  if (stat.label === "Plays") return { ...stat, value: formatNumber(totalPlays) };
                  return stat;
                }),
              }
              : card
          )
        );
      } catch (err: unknown) {
        console.log("Stats fetch error:", err);
        setError("Failed to load stats.");
      } finally {
        setLoading(false);
      }
    };

    fetchDrops();
  }, []);

  // Fetch article stats for card 2
  useEffect(() => {
    const fetchArticleStats = async () => {
      try {
        const res = await axios.get("/api/cricket-articles");
        if (res.data.success) {
          const articles = res.data.articles || [];
          const totalArticles = articles.length;

          const totalViews = articles.reduce((sum: number, art: Article) => {
            const viewsStr = art.views || "0";
            const numeric = parseInt(viewsStr.replace(/[^\d]/g, "")) || 0;
            return sum + numeric;
          }, 0);

          setCardsData(prevCards =>
            prevCards.map(card =>
              card.id === 2
                ? {
                  ...card,
                  stats: card.stats.map(stat => {
                    if (stat.label === "Articles") return { ...stat, value: totalArticles.toString() };
                    if (stat.label === "Views") return { ...stat, value: formatNumber(totalViews) };
                    return stat;
                  }),
                }
                : card
            )
          );
        }
      } catch (err) {
        console.error("Error fetching article stats:", err);
      }
    };

    fetchArticleStats();
  }, []);

  return (
    <div className="mt-6">
      <div className="flex gap-4 overflow-x-auto [scrollbar-width:none] snap-x snap-mandatory">
        {cardsData.map((card) => (
          <div
            key={card.id}
            className="min-w-[200px] max-w-[256px] snap-start bg-[#111] rounded-2xl p-3 shadow-lg flex flex-col h-fit"
          >
            {/* Image */}
            <div className="relative rounded-xl overflow-hidden flex-shrink-0">
              <Link href={card.profileUrl}>
                <img
                  src={card.image}
                  // className="w-[256px] h-[120px] object-fit rounded-lg"
                  className="w-[256px] h-[120px] object-cover rounded-lg"
                  alt={card.title}
                />
              </Link>
              <div className="absolute bottom-0 p-3 bg-gradient-to-t from-black/80 to-transparent w-full">
                <h2 className="text-[14px] font-bold leading-tight">{card.title}</h2>
                <p className="text-[10px] text-gray-300">{card.subtitle}</p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 mt-2 text-center">
              {card.stats.map((stat, i) => (
                <div key={i} className="bg-[#1c1c1c] p-2 rounded-lg">
                  <p className="text-gray-400 text-[9px]">{stat.label}</p>
                  <p className="font-semibold text-[12px] text-white">
                    {loading && card.id === 1 && (stat.label === "Drops" || stat.label === "Plays") ? (
                      <span className="inline-block w-8 h-3 bg-gray-700 rounded animate-pulse"></span>
                    ) : (
                      stat.value
                    )}
                  </p>
                </div>
              ))}
            </div>

            {/* Latest Drops — IPL, FIFA, Women's T20 cards */}
            {(card.id === 1 || card.id === 4 || card.id === 5) && (
              <>
                <p className="text-gray-500 text-[10px] mt-3 mb-1 font-medium uppercase tracking-wide">
                  Latest Drops
                </p>
                {card.id === 1 && <LatestDropsList type="ipl" />}
                {card.id === 4 && <LatestDropsList type="fifa" />}
                {card.id === 5 && <LatestDropsList type="womens_t20" />}
              </>
            )}

            {/* Latest Articles — SportsFan360 card */}
            {card.id === 2 && (
              <>
                <p className="text-gray-500 text-[10px] mt-3 mb-1 font-medium uppercase tracking-wide">
                  Latest Articles
                </p>
                <LatestArticlesList />
              </>
            )}

            {/* Recent Playlists — My Playlists card */}
            {card.id === 3 && (
              <>
                <p className="text-gray-500 text-[10px] mt-3 mb-1 font-medium uppercase tracking-wide">
                  Recent Playlists
                </p>
                <LatestPlaylistsList userId={userId} />
              </>
            )}

            {/* Primary CTA button — all cards */}
            <div className="mt-auto pt-2">
              <Link href={card.buttonUrl || "#"}>
                <button className="w-full bg-gradient-to-r from-pink-500 to-orange-500 py-1.5 rounded-full font-semibold text-[13px] flex items-center justify-center gap-2 cursor-pointer">
                  {card.buttonIcon === "play"
                    ? <img src="/images/explore.png" alt="Play" />
                    : <img src="/images/discover.png" alt="Chart" />}
                  {card.buttonText}
                </button>
              </Link>
            </div>

            {/* Secondary button — IPL: Match Center */}
            {card.id === 1 && (
              <div className="pt-2">
                <Link href="/MainModules/Matchcenter">
                  <button className="w-full bg-[#1c1c1c] border border-[#C9115F]/40 py-1.5 rounded-full font-semibold text-[13px] flex items-center justify-center gap-2 cursor-pointer text-white hover:bg-[#2a2a2a] transition-colors">
                    <span>🏆</span>
                    Match center
                  </button>
                </Link>
              </div>
            )}

            {/* Secondary button — FIFA: Group Standings */}
            {card.id === 4 && (
              <div className="pt-2">
                <Link href="/MainModules/FIFAWorldCup/Standings">
                  <button className="w-full bg-[#1c1c1c] border border-[#C9115F]/40 py-1.5 rounded-full font-semibold text-[13px] flex items-center justify-center gap-2 cursor-pointer text-white hover:bg-[#2a2a2a] transition-colors">
                    <span>⚽</span>
                    Group Standings
                  </button>
                </Link>
              </div>
            )}

            {/* Secondary button — Women's T20: Match Center */}
            {card.id === 5 && (
              <div className="pt-2">
                <Link href="/MainModules/WomensT20/Matchcenter">
                  <button className="w-full bg-[#1c1c1c] border border-[#C9115F]/40 py-1.5 rounded-full font-semibold text-[13px] flex items-center justify-center gap-2 cursor-pointer text-white hover:bg-[#2a2a2a] transition-colors">
                    <span>🏏</span>
                    Match Center
                  </button>
                </Link>
              </div>
            )}
          </div>
        ))}

        {/* Trending Drops card */}
        <div className="min-w-[200px] max-w-[256px] snap-start bg-[#111] rounded-2xl p-3 shadow-lg flex flex-col h-fit">
          <div className="relative rounded-xl overflow-hidden flex-shrink-0">
            <div className="w-[256px] h-[120px] rounded-lg overflow-hidden relative">
              <img src="/images/trending_drops_bg.png" alt="Trending Drops" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 flex items-end p-3">
                <div>
                  <h2 className="text-[14px] font-bold leading-tight">Trending Drops</h2>
                  <p className="text-[10px] text-gray-300">Top 10 by plays, views and likes</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3">
            <p className="text-gray-500 text-[10px] mb-1 font-medium uppercase tracking-wide flex items-center gap-1">
              <TrendingUp size={12} />
              Trending Drops
            </p>
            <TrendingDropsList />
          </div>
        </div>
      </div>

      {error && (
        <div className="text-center text-red-500 text-xs mt-4">
          {error}
        </div>
      )}
    </div>
  );
}
