import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.NEXT_PUBLIC_ADMIN_URL ||
  "https://sportsfan360.vercel.app";

type MatchInfo = {
  team1?: string;
  team2?: string;
  type?: string;
  speaker?: string;
  date?: string;
};

type AudioFile = {
  id: string;
  title: string;
  fileName: string;
  url: string;
  duration: string;
  durationSeconds: number;
  size: number;
  sizeFormatted: string;
  format: string;
  createdAt: string;
  createdAtFormatted: string;
  folder: string;
  matchInfo?: MatchInfo;
};

type AudioDrop = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  listens: number;
  signals: number;
  duration: string;
  date: string;
  room: string;
  audioUrl: string;
  sizeFormatted: string;
  speaker?: string;
  team1?: string;
  team2?: string;
};

async function getAudioFiles() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/cloudinary/audio?limit=100`, {
      cache: "no-store",
    });

    if (!res.ok) {
      return [] as AudioFile[];
    }

    const data = await res.json();
    return data.audioFiles || [];
  } catch {
    return [] as AudioFile[];
  }
}

function resolveImageUrl(image?: string) {
  if (!image) return `${APP_URL}/images/share.png`;
  if (image.startsWith("http://") || image.startsWith("https://")) return image;
  return `${APP_URL}${image.startsWith("/") ? "" : "/"}${image}`;
}

function audioFileToAudioDrop(audio: AudioFile): AudioDrop {
  return {
    id: audio.id,
    title: audio.title,
    subtitle: audio.matchInfo?.type
      ? `${audio.matchInfo.type.replace(/_/g, " ")} — ${audio.matchInfo.team1 ?? ""} vs ${audio.matchInfo.team2 ?? ""}`
      : "Audio Drop",
    description: audio.matchInfo
      ? `${audio.matchInfo.team1 ?? ""} vs ${audio.matchInfo.team2 ?? ""} — ${audio.matchInfo.type?.replace(/_/g, " ") ?? ""}`
      : audio.title,
    listens: 0,
    signals: 0,
    duration: audio.duration,
    date: audio.createdAtFormatted,
    room: audio.matchInfo?.team1 ? `${audio.matchInfo.team1} vs ${audio.matchInfo.team2}` : "Audio Room",
    audioUrl: audio.url,
    sizeFormatted: audio.sizeFormatted,
    speaker: audio.matchInfo?.speaker,
    team1: audio.matchInfo?.team1,
    team2: audio.matchInfo?.team2,
  };
}

function findAudioDrop(audioFiles: AudioFile[], id?: string, url?: string) {
  if (id) {
    const target = audioFiles.find((item) => item.id === id);
    if (target) return audioFileToAudioDrop(target);
  }

  if (url) {
    const decodedUrl = decodeURIComponent(url);
    const target = audioFiles.find((item) => item.url === decodedUrl);
    if (target) return audioFileToAudioDrop(target);
  }

  return null;
}

async function getAudioDrop(searchParams: { id?: string; url?: string }) {
  const audioFiles = await getAudioFiles();
  return findAudioDrop(audioFiles, searchParams.id, searchParams.url);
}

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ id?: string; url?: string }> }): Promise<Metadata> {
  const params = await searchParams;
  const drop = await getAudioDrop(params);

  if (!drop) {
    return {
      title: "Audio Drop | Sportsfan",
      description: "Share Sportsfan audio drops with a preview card.",
    };
  }

  const title = `${drop.title} | Audio Drop - Sportsfan`;
  const description = `${drop.subtitle}. ${drop.description || "Share this audio drop with friends."}`;
  const url = `${APP_URL}/MainModules/AudioDrop/share${params.id ? `?id=${encodeURIComponent(params.id)}` : params.url ? `?url=${encodeURIComponent(params.url)}` : ""}`;
  const imageUrl = resolveImageUrl(undefined);

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
          alt: drop.title,
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

export default async function AudioDropSharePage({ searchParams }: { searchParams: Promise<{ id?: string; url?: string }> }) {
  const params = await searchParams;
  const drop = await getAudioDrop(params);

  if (!drop) {
    notFound();
  }

  const audioDropUrl = params.id
    ? `${APP_URL}/MainModules/MatchesDropContent/AudioDropScreen?id=${encodeURIComponent(params.id)}`
    : params.url
      ? `${APP_URL}/MainModules/MatchesDropContent/AudioDropScreen?url=${encodeURIComponent(params.url)}`
      : `${APP_URL}/MainModules/MatchesDropContent/AudioDropScreen`;

  return (
    <div className="min-h-screen bg-[#0d0d10] text-white flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl rounded-[28px] border border-white/10 bg-[#111114] shadow-2xl overflow-hidden">
        <div className="relative h-56 sm:h-72 bg-gradient-to-br from-pink-600/20 via-[#111114] to-orange-500/20">
          <img
            src={resolveImageUrl(undefined)}
            alt={drop.title}
            className="absolute inset-0 w-full h-full object-cover opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d10] via-[#0d0d10]/30 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <span className="inline-flex items-center rounded-full bg-pink-600 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
              Audio Drop
            </span>
            <h1 className="mt-3 text-2xl sm:text-4xl font-bold leading-tight">{drop.title}</h1>
            <p className="mt-2 text-white/80 max-w-xl">{drop.subtitle}</p>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <div className="grid gap-3 sm:grid-cols-3 mb-5">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <p className="text-xs uppercase tracking-wide text-white/50">Listens</p>
              <p className="mt-1 text-xl font-bold">{drop.listens.toLocaleString()}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <p className="text-xs uppercase tracking-wide text-white/50">Signals</p>
              <p className="mt-1 text-xl font-bold">{drop.signals.toLocaleString()}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <p className="text-xs uppercase tracking-wide text-white/50">Duration</p>
              <p className="mt-1 text-xl font-bold">{drop.duration}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 mb-5">
            <p className="text-sm text-white/70">
              {drop.description || "Latest audio drop from Sportsfan."}
            </p>
            <p className="mt-2 text-xs text-white/45">
              {drop.date || "Recent"} · {drop.room}
            </p>
            <p className="mt-2 text-xs text-white/35 break-all">{audioDropUrl}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href={audioDropUrl}
              className="inline-flex items-center justify-center rounded-full px-5 py-3 font-semibold text-white"
              style={{ background: "linear-gradient(90deg, #e91e63, #ff5722)" }}
            >
              Open Audio Drop
            </Link>
            <Link
              href="/MainModules/AudioDrop"
              className="inline-flex items-center justify-center rounded-full px-5 py-3 font-semibold text-white border border-white/15 bg-white/5 hover:bg-white/10 transition-colors"
            >
              Back to Audio Drop
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
