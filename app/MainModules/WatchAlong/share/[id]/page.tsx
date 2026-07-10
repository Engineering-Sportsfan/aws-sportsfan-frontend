import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.NEXT_PUBLIC_ADMIN_URL ||
  "https://sportsfan360.vercel.app";

async function getRoom(id: string) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/watch-along/${id}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    return data.room || data.data || data.currentRoom || null;
  } catch {
    return null;
  }
}

function getRoomImageUrl(displayPicture?: string) {
  if (!displayPicture) return `${APP_URL}/images/share.png`;
  if (displayPicture.startsWith("http://") || displayPicture.startsWith("https://")) {
    return displayPicture;
  }
  return `${APP_URL}${displayPicture.startsWith("/") ? "" : "/"}${displayPicture}`;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const room = await getRoom(id);

  if (!room) {
    return {
      title: "Watch Along | Sportsfan",
      description: "Join live Watch Along rooms on Sportsfan.",
    };
  }

  const imageUrl = getRoomImageUrl(room.displayPicture);
  const title = `${room.name} | Watch Along - IPL 2026`;
  const description = `${room.role}. Join the live Watch Along room, follow the action, and share the link with friends.`;
  const url = `${APP_URL}/MainModules/WatchAlong/share/${id}`;

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
          alt: room.name,
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

export default async function WatchAlongSharePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const room = await getRoom(id);

  if (!room) {
    notFound();
  }

  const imageUrl = getRoomImageUrl(room.displayPicture);
  const roomUrl = `${APP_URL}/MainModules/WatchAlong/room/${id}`;

  return (
    <div className="min-h-screen bg-[#111111] text-white flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl rounded-[28px] border border-white/10 bg-[#1a1a1a] shadow-2xl overflow-hidden">
        <div className="relative h-56 sm:h-72 bg-gradient-to-br from-pink-600/25 via-[#1a1a1a] to-orange-500/20">
          <img
            src={imageUrl}
            alt={room.name}
            className="absolute inset-0 w-full h-full object-cover opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-[#111111]/30 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <span className="inline-flex items-center rounded-full bg-pink-600 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
              Watch Along
            </span>
            <h1 className="mt-3 text-2xl sm:text-4xl font-bold leading-tight">{room.name}</h1>
            <p className="mt-2 text-white/80 max-w-xl">{room.role}</p>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <div className="grid gap-3 sm:grid-cols-3 mb-5">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <p className="text-xs uppercase tracking-wide text-white/50">Watching</p>
              <p className="mt-1 text-xl font-bold">{room.watching}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <p className="text-xs uppercase tracking-wide text-white/50">Engagement</p>
              <p className="mt-1 text-xl font-bold">{room.engagement}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <p className="text-xs uppercase tracking-wide text-white/50">Active</p>
              <p className="mt-1 text-xl font-bold">{room.active}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 mb-5">
            <p className="text-sm text-white/70">
              Join this room to watch live match reactions, predictions, chats, and fan activity.
              The share preview uses the room photo so it looks clean across WhatsApp, Threads, and Instagram.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href={roomUrl}
              className="inline-flex items-center justify-center rounded-full px-5 py-3 font-semibold text-white"
              style={{ background: "linear-gradient(90deg, #e91e63, #ff5722)" }}
            >
              Open Watch Room
            </Link>
            <Link
              href="/MainModules/WatchAlong"
              className="inline-flex items-center justify-center rounded-full px-5 py-3 font-semibold text-white border border-white/15 bg-white/5 hover:bg-white/10 transition-colors"
            >
              Back to Watch Along
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
