"use client";

import Link from "next/link";
import { ArrowRight, Trophy, Zap, Gamepad2, Rocket } from "lucide-react";
import { useRouter } from "next/navigation";

export default function FantasyGamesHub() {
  const router = useRouter();

  const games = [
    {
      id: "book-cricket",
      title: "Book Cricket",
      subtitle: "CLASSIC CLASSROOM",
      description: "Relive the nostalgia. Flip pages to score runs and take wickets in this legendary classroom game.",
      icon: <Gamepad2 size={32} className="text-[#e91e8c]" />,
      emoji: "📖",
      color: "from-[#e91e8c] to-[#ff6b35]",
      href: "/MainModules/FantasyGames/book-cricket",
      isHot: true,
    },
    {
      id: "circle-cricket",
      title: "Circle Cricket",
      subtitle: "FAST-PACED ACTION",
      description: "Bat, chase, and swing the format. Experience dynamic circle-based cricket with instant feedback.",
      icon: <Zap size={32} className="text-[#60a5fa]" />,
      emoji: "🎯",
      color: "from-blue-600 to-cyan-500",
      href: "/MainModules/FantasyGames/circle-cricket",
      isHot: false,
    },
    {
      id: "hand-cricket",
      title: "Hand Cricket",
      subtitle: "GESTURE MASTER",
      description: "Play the traditional hand-cricket game — choose odd/even, bowl and bat using taps.",
      icon: <Trophy size={32} className="text-[#fbbf24]" />,
      emoji: "🤚",
      color: "from-amber-500 to-orange-400",
      href: "/MainModules/FantasyGames/hand-cricket",
      isHot: false,
    },
    {
      id: "coming-soon",
      title: "Cricket Pro",
      subtitle: "NEXT GENERATION",
      description: "We're working on exciting new cricket fantasy games. Stay tuned for the ultimate experience.",
      icon: <Rocket size={32} className="text-[#a855f7]" />,
      emoji: "🚀",
      color: "from-purple-600 to-pink-500",
      href: null,
      isHot: false,
    },
  ];

  return (
    <div className="min-h-screen bg-[#07070f] px-4 py-12 sm:px-6 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-pink-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-16 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-4">
            <span className="w-2 h-2 rounded-full bg-[#e91e8c] animate-pulse" />
            <span className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">Gaming Hub</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-black text-white mb-4 tracking-tight">
            FANTASY <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#e91e8c] to-[#ff6b35]">GAMES</span>
          </h1>
          <p className="text-gray-500 text-sm sm:text-base max-w-xl mx-auto leading-relaxed font-medium">
            Test your skills, support your favorites, and build your legacy in the ultimate cricket gaming destination.
          </p>
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {games.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>

        {/* Footer Info */}
        <div className="mt-20 text-center">
          <div className="inline-block p-[1px] rounded-full bg-gradient-to-r from-white/5 via-white/20 to-white/5">
            <div className="px-6 py-2 rounded-full bg-[#07070f] text-gray-600 text-[10px] font-bold tracking-[0.2em] uppercase">
              Powered by SportsFan360
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface FantasyGame {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  emoji: string;
  color: string;
  href: string | null;
  isHot: boolean;
}

function GameCard({ game }: { game: FantasyGame }) {
  const isAvailable = !!game.href;

  return (
    <div className={`group relative rounded-2xl sm:rounded-3xl overflow-hidden border transition-all duration-500 flex flex-col h-full ${
      isAvailable 
        ? "bg-[#0f1520] border-white/5 hover:border-[#e91e8c]/30 hover:shadow-2xl hover:shadow-[#e91e8c]/10" 
        : "bg-[#0f1520]/50 border-white/5 opacity-80"
    }`}>
      {/* Highlight glow */}
      <div className={`absolute -top-16 -right-16 w-32 h-32 bg-gradient-to-br ${game.color} blur-[40px] opacity-0 group-hover:opacity-20 transition-opacity duration-700`} />

      <div className="p-4 sm:p-8 flex flex-col h-full">
        <div className="flex justify-between items-start mb-4">
          <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-xl">
            {/* Scale icon for mobile */}
            <div className="scale-75 sm:scale-100">
              {game.icon}
            </div>
          </div>
          {game.isHot && (
            <span className="px-1.5 py-0.5 rounded-md bg-[#e91e8c] text-white text-[7px] sm:text-[9px] font-black tracking-tighter uppercase">HOT</span>
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[8px] sm:text-[10px] font-bold tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r ${game.color}`}>
              {game.subtitle}
            </span>
          </div>
          <h2 className="text-base sm:text-xl font-black text-white mb-2 tracking-tight line-clamp-2">
            {game.title}
          </h2>
          <p className="text-gray-500 text-[10px] sm:text-sm leading-tight sm:leading-relaxed font-medium mb-4 line-clamp-2 sm:line-clamp-none">
            {game.description}
          </p>
        </div>

        <div className="mt-auto">
          {isAvailable ? (
            <Link 
              href={game.href!}
              className="inline-flex items-center gap-2 sm:gap-3 px-4 py-2 sm:px-6 sm:py-3 rounded-lg sm:rounded-xl text-white text-[9px] sm:text-xs font-bold transition-all hover:gap-4 shadow-lg active:scale-95 whitespace-nowrap"
              style={{ background: "linear-gradient(90deg, #e91e8c, #ff6b35)" }}
            >
              PLAY NOW
              <ArrowRight size={14} className="sm:w-4 sm:h-4" />
            </Link>
          ) : (
            <div className="inline-flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 rounded-lg sm:rounded-xl bg-white/5 border border-white/10 text-gray-500 text-[9px] sm:text-xs font-bold cursor-not-allowed whitespace-nowrap">
              COMING SOON
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
