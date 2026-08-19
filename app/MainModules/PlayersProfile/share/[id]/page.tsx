import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.NEXT_PUBLIC_ADMIN_URL ||
  "https://sportsfan360.vercel.app";

type PlayerProfile = {
  name?: string;
  team?: string;
  avatar?: string;
  about?: string;
  stats?: {
    runs?: string;
    sr?: string;
    avg?: string;
  };
};

type PlayerMedia = {
  mediaItems?: unknown[];
};

type PlayerSeason = {
  season?: {
    year?: string;
  };
};

type PlayerInsights = {
  insights?: unknown[];
  strengths?: unknown[];
};

type PlayerResponse = {
  profile?: PlayerProfile;
  season?: PlayerSeason;
  insights?: PlayerInsights;
  media?: PlayerMedia;
};

async function getPlayer(playerId: string): Promise<PlayerResponse | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/player-profile/search/${playerId}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    return data.data || data.player || data || null;
  } catch {
    return null;
  }
}

function resolveImageUrl(image?: string) {
  if (!image) return `${APP_URL}/images/share.png`;
  if (image.startsWith("http://") || image.startsWith("https://")) return image;
  return `${APP_URL}${image.startsWith("/") ? "" : "/"}${image}`;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const player = await getPlayer(id);

  if (!player?.profile) {
    return {
      title: "Player 360 World | Sportsfan",
      description: "Share Player 360 World cards on Sportsfan.",
    };
  }

  const imageUrl = resolveImageUrl(player.profile.avatar);
  const title = `${player.profile.name || "Player"} | Player 360 World - Sportsfan`;
  const description = `${player.profile.team || "Player 360"}. ${player.profile.about || "Latest Player 360 World post."}`;
  const url = `${APP_URL}/MainModules/PlayersProfile/share/${id}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: "Sportsfan",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: player.profile.name || "Player",
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function PlayerSharePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const player = await getPlayer(id);

  if (!player?.profile) {
    notFound();
  }

  const imageUrl = resolveImageUrl(player.profile.avatar);
  const shareUrl = `${APP_URL}/MainModules/PlayersProfile/share/${id}`;
  const profileUrl = `${APP_URL}/MainModules/PlayersProfile?id=${encodeURIComponent(id)}&tab=highlights`;

  return (
    <div className="min-h-screen bg-[#0d0d10] text-white flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl rounded-[28px] border border-white/10 bg-[#111114] shadow-2xl overflow-hidden">
        <div className="relative h-56 sm:h-72 bg-gradient-to-br from-pink-600/20 via-[#111114] to-orange-500/20">
          <img src={imageUrl} alt={player.profile.name || "Player"} className="absolute inset-0 w-full h-full object-cover opacity-85" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d10] via-[#0d0d10]/30 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <span className="inline-flex items-center rounded-full bg-pink-600 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
              Player 360 World
            </span>
            <h1 className="mt-3 text-2xl sm:text-4xl font-bold leading-tight">{player.profile.name || "Player"}</h1>
            <p className="mt-2 text-white/80 max-w-xl">{player.profile.team || "Player 360"}</p>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <div className="grid gap-3 sm:grid-cols-3 mb-5">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <p className="text-xs uppercase tracking-wide text-white/50">Runs</p>
              <p className="mt-1 text-xl font-bold">{player.profile.stats?.runs || "0"}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <p className="text-xs uppercase tracking-wide text-white/50">Strike Rate</p>
              <p className="mt-1 text-xl font-bold">{player.profile.stats?.sr || "0"}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <p className="text-xs uppercase tracking-wide text-white/50">Average</p>
              <p className="mt-1 text-xl font-bold">{player.profile.stats?.avg || "0"}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 mb-5">
            <p className="text-sm text-white/70">
              {player.profile.about || "Latest Player 360 World post."}
            </p>
            <p className="mt-2 text-xs text-white/45 break-all">{shareUrl}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href={profileUrl}
              className="inline-flex items-center justify-center rounded-full px-5 py-3 font-semibold text-white"
              style={{ background: "linear-gradient(90deg, #e91e63, #ff5722)" }}
            >
              Open Player Profile
            </Link>
            <Link
              href="/MainModules/HomePage"
              className="inline-flex items-center justify-center rounded-full px-5 py-3 font-semibold text-white border border-white/15 bg-white/5 hover:bg-white/10 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
