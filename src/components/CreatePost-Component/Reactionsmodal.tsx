"use client";

import { useState, useEffect } from "react";
import { X, User } from "lucide-react";

type ReactionId = "like" | "love" | "haha" | "wow" | "sad" | "angry";

const REACTION_META: Record<ReactionId, { emoji: string; label: string; color: string }> = {
  like:  { emoji: "👍", label: "Like",  color: "#0a66c2" },
  love:  { emoji: "❤️", label: "Love",  color: "#df704d" },
  haha:  { emoji: "😂", label: "Haha",  color: "#f5c518" },
  wow:   { emoji: "😮", label: "Wow",   color: "#f5c518" },
  sad:   { emoji: "😢", label: "Sad",   color: "#f5c518" },
  angry: { emoji: "😡", label: "Angry", color: "#e05b2b" },
};

export interface Reactor {
  userId: string;
  userName: string;
  reaction: ReactionId;
  userAvatar?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  /** reactions map: { [userId]: reactionId } */
  reactions: Record<string, string>;
  /** userNames map: { [userId]: displayName } — optional, falls back to userId */
  userNames?: Record<string, string>;
  /** userAvatars map: { [userId]: avatarUrl } — optional */
  userAvatars?: Record<string, string>;
  totalLikes: number;
}

const ProfilePlaceholder = ({ size = 40 }: { size?: number }) => (
  <div
    className="bg-gradient-to-br from-[#C9115F] to-[#e8185a] rounded-full flex items-center justify-center text-white shrink-0"
    style={{ width: size, height: size }}
  >
    <User style={{ width: size * 0.45, height: size * 0.45 }} />
  </div>
);

export default function ReactionsModal({
  open,
  onClose,
  reactions,
  userNames = {},
  userAvatars = {},
  totalLikes,
}: Props) {
  const [activeTab, setActiveTab] = useState<"all" | ReactionId>("all");

  // Reset tab on open
  useEffect(() => {
    if (open) setActiveTab("all");
  }, [open]);

  if (!open) return null;

  // Build reactor list
  const reactors: Reactor[] = Object.entries(reactions).map(([userId, reaction]) => ({
    userId,
    userName: userNames[userId] || userId,
    reaction: (reaction as ReactionId) || "like",
    userAvatar: userAvatars[userId],
  }));

  // Count per reaction
  const counts = reactors.reduce<Record<string, number>>((acc, r) => {
    acc[r.reaction] = (acc[r.reaction] || 0) + 1;
    return acc;
  }, {});

  // Tabs: "all" + each reaction that has ≥1 vote
  const presentReactions = (Object.keys(REACTION_META) as ReactionId[]).filter(
    (r) => (counts[r] || 0) > 0
  );

  const displayed =
    activeTab === "all"
      ? reactors
      : reactors.filter((r) => r.reaction === activeTab);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="pointer-events-auto bg-[#1a1a1e] border border-white/10 rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-white/8 shrink-0">
            <h2 className="text-white font-semibold text-base">Reactions</h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/10 transition-colors text-white/50 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 px-4 py-2 border-b border-white/8 shrink-0 overflow-x-auto scrollbar-hide">
            {/* All tab */}
            <button
              onClick={() => setActiveTab("all")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === "all"
                  ? "bg-[#C9115F]/20 text-[#C9115F] border border-[#C9115F]/30"
                  : "text-white/50 hover:text-white/80 hover:bg-white/5"
              }`}
            >
              <span>All</span>
              <span className="text-xs opacity-80">{reactors.length}</span>
            </button>

            {presentReactions.map((rid) => {
              const meta = REACTION_META[rid];
              return (
                <button
                  key={rid}
                  onClick={() => setActiveTab(rid)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                    activeTab === rid
                      ? "bg-white/10 text-white border border-white/20"
                      : "text-white/50 hover:text-white/80 hover:bg-white/5"
                  }`}
                >
                  <span className="text-base leading-none">{meta.emoji}</span>
                  <span className="text-xs opacity-80">{counts[rid]}</span>
                </button>
              );
            })}
          </div>

          {/* List */}
          <div className="overflow-y-auto flex-1 py-2">
            {displayed.length === 0 ? (
              <p className="text-white/30 text-sm text-center py-8">No reactions yet</p>
            ) : (
              displayed.map((reactor) => {
                const meta = REACTION_META[reactor.reaction] || REACTION_META.like;
                return (
                  <div
                    key={reactor.userId}
                    className="flex items-center gap-3 px-5 py-3 hover:bg-white/5 transition-colors"
                  >
                    {/* Avatar with reaction badge */}
                    <div className="relative shrink-0">
                      {reactor.userAvatar ? (
                        <img
                          src={reactor.userAvatar}
                          alt={reactor.userName}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <ProfilePlaceholder size={40} />
                      )}
                      {/* Reaction badge */}
                      <span
                        className="absolute -bottom-0.5 -right-0.5 text-sm leading-none w-5 h-5 flex items-center justify-center rounded-full bg-[#1a1a1e] border border-white/10"
                        title={meta.label}
                      >
                        {meta.emoji}
                      </span>
                    </div>

                    {/* Name */}
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">
                        {reactor.userName}
                      </p>
                      <p className="text-white/35 text-xs">{meta.label}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </>
  );
}