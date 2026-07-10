// "use client";

// import { Heart } from "lucide-react";
// import { useAuth } from "@/context/AuthContext";

// interface Props {
//   postId: string;
//   likes: number;
//   likedBy: string[];
//   onToggle: (postId: string, userId: string) => void;
// }

// export default function PostLikeButton({ postId, likes, likedBy, onToggle }: Props) {
//   const { user } = useAuth();
//   const userId = user?.userId || user?.email || "";
//   const isLiked = !!userId && likedBy?.includes(userId);

//   const handleClick = () => {
//     if (!userId) return; // require auth
//     onToggle(postId, userId);
//   };

// //   return (
// //     <button
// //       onClick={handleClick}
// //       disabled={!userId}
// //       className={`flex items-center gap-1.5 text-sm transition-all duration-200 active:scale-90 ${
// //         isLiked
// //           ? "text-[#C9115F]"
// //           : "text-white/40 hover:text-white/70"
// //       } disabled:opacity-40 disabled:cursor-not-allowed`}
// //       title={isLiked ? "Unlike" : "Like"}
// //     >
// //       <Heart
// //         className="w-4 h-4 transition-transform duration-150"
// //         fill={isLiked ? "currentColor" : "none"}
// //         style={{ transform: isLiked ? "scale(1.15)" : "scale(1)" }}
// //       />
// //       {likes > 0 && <span className="tabular-nums">{likes}</span>}
// //     </button>
// //   );

// return (
//   <button
//     onClick={handleClick}
//     disabled={!userId}
//     className={`flex items-center gap-1.5 transition-all duration-200 active:scale-90 ${
//       isLiked ? "text-[#C9115F]" : "text-white/40 hover:text-white/70"
//     } disabled:opacity-40 disabled:cursor-not-allowed`}
//     title={isLiked ? "Unlike" : "Like"}
//   >
//     <Heart
//       className="w-4 h-4 transition-transform duration-150"
//       fill={isLiked ? "currentColor" : "none"}
//       style={{ transform: isLiked ? "scale(1.15)" : "scale(1)" }}
//     />
//     {likes > 0 && <span className="tabular-nums text-sm">{likes}</span>}
//   </button>
// );
// }




"use client";

import { useState, useRef, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";

const REACTIONS = [
    { id: "like",  emoji: "👍", label: "Like",  color: "#4267B2" },
    { id: "love",  emoji: "❤️", label: "Love",  color: "#F33E58" },
    { id: "haha",  emoji: "😆", label: "Haha",  color: "#F7B125" },
    { id: "wow",   emoji: "😮", label: "Wow",   color: "#F7B125" },
    { id: "sad",   emoji: "😢", label: "Sad",   color: "#F7B125" },
    { id: "angry", emoji: "😡", label: "Angry", color: "#E9710F" },
] as const;

type ReactionId = typeof REACTIONS[number]["id"];

interface Props {
    postId: string;
    likes: number;
    likedBy: string[];
    reactions?: Record<string, string>; // userId → reactionId (string for compat)
    onToggle: (postId: string, userId: string, reaction?: ReactionId) => void;
}

export default function PostLikeButton({
    postId,
    likes,
    likedBy,
    reactions = {},
    onToggle,
}: Props) {
    const { user } = useAuth();
    const userId = user?.userId || user?.email || "";

    const isLiked = !!userId && likedBy?.includes(userId);

    // Cast the stored string to ReactionId — safe because we only ever write valid ReactionIds
    const currentReactionId = userId ? (reactions[userId] as ReactionId | undefined) : undefined;

    // Find the full reaction object
    const activeReaction =
        currentReactionId
            ? REACTIONS.find((r) => r.id === currentReactionId) ?? null
            : isLiked
            ? REACTIONS[0]
            : null;

    const [showPicker, setShowPicker] = useState(false);
    const [hoveredReaction, setHoveredReaction] = useState<ReactionId | null>(null);
    const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const showTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const longPressRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const clearHide = () => {
        if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };

    const scheduleHide = useCallback(() => {
        clearHide();
        hideTimeoutRef.current = setTimeout(() => setShowPicker(false), 400);
    }, []);

    const scheduleShow = useCallback(() => {
        clearHide();
        if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current);
        showTimeoutRef.current = setTimeout(() => setShowPicker(true), 500);
    }, []);

    const handlePressStart = () => {
        longPressRef.current = setTimeout(() => setShowPicker(true), 500);
    };
    const handlePressEnd = () => {
        if (longPressRef.current) clearTimeout(longPressRef.current);
    };

    const handleReactionClick = (reactionId: ReactionId) => {
        if (!userId) return;
        clearHide();
        if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current);
        setShowPicker(false);
        onToggle(postId, userId, reactionId);
    };

    const handleMainClick = () => {
        if (!userId) return;
        if (showPicker) {
            setShowPicker(false);
            return;
        }
        if (isLiked || currentReactionId) {
            onToggle(postId, userId, undefined);
        } else {
            onToggle(postId, userId, "like");
        }
    };

    return (
        <div
            className="relative flex items-center"
            onMouseLeave={scheduleHide}
        >
            {/* Reaction Picker */}
            {showPicker && (
                <div
                    className="absolute bottom-full left-0 mb-2 z-50"
                    onMouseEnter={clearHide}
                    onMouseLeave={scheduleHide}
                >
                    <div
                        className="flex items-center gap-1 px-2 py-2 rounded-full shadow-2xl border border-white/10"
                        style={{
                            background: "rgba(28, 28, 32, 0.97)",
                            backdropFilter: "blur(16px)",
                        }}
                    >
                        {REACTIONS.map((reaction) => {
                            const isActive = currentReactionId === reaction.id;
                            return (
                                <button
                                    key={reaction.id}
                                    onClick={() => handleReactionClick(reaction.id)}
                                    onMouseEnter={() => setHoveredReaction(reaction.id)}
                                    onMouseLeave={() => setHoveredReaction(null)}
                                    className="relative flex flex-col items-center outline-none"
                                    style={{
                                        transition: "transform 150ms ease",
                                        transform:
                                            hoveredReaction === reaction.id
                                                ? "scale(1.45) translateY(-6px)"
                                                : isActive
                                                ? "scale(1.2)"
                                                : "scale(1)",
                                    }}
                                    title={reaction.label}
                                >
                                    <span
                                        className="text-2xl leading-none select-none"
                                        style={{
                                            filter: isActive
                                                ? `drop-shadow(0 0 6px ${reaction.color})`
                                                : "drop-shadow(0 2px 4px rgba(0,0,0,0.4))",
                                        }}
                                    >
                                        {reaction.emoji}
                                    </span>
                                    {isActive && (
                                        <span
                                            className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                                            style={{ background: reaction.color }}
                                        />
                                    )}
                                    {hoveredReaction === reaction.id && (
                                        <span
                                            className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-semibold px-1.5 py-0.5 rounded-full whitespace-nowrap pointer-events-none"
                                            style={{
                                                background: "rgba(0,0,0,0.85)",
                                                color: reaction.color,
                                            }}
                                        >
                                            {reaction.label}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                    <div
                        className="absolute left-5 -bottom-1 w-2 h-2 rotate-45 border-r border-b border-white/10"
                        style={{ background: "rgba(28,28,32,0.97)" }}
                    />
                </div>
            )}

            {/* Main Button */}
            <button
                onClick={handleMainClick}
                onMouseEnter={scheduleShow}
                onTouchStart={handlePressStart}
                onTouchEnd={handlePressEnd}
                disabled={!userId}
                className="flex items-center gap-1.5 transition-all duration-200 active:scale-90 disabled:opacity-40 disabled:cursor-not-allowed select-none"
                style={{
                    color: activeReaction ? activeReaction.color : "rgba(255,255,255,0.4)",
                }}
                title={activeReaction ? activeReaction.label : "Like"}
            >
                {activeReaction ? (
                    <span
                        style={{
                            fontSize: "1.1rem",
                            lineHeight: 1,
                            display: "inline-block",
                            transform: "scale(1.05)",
                            filter: `drop-shadow(0 1px 3px ${activeReaction.color}88)`,
                        }}
                    >
                        {activeReaction.emoji}
                    </span>
                ) : (
                    <svg
                        className="w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z" />
                        <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                    </svg>
                )}
                {likes > 0 && (
                    <span className="tabular-nums text-sm">{likes}</span>
                )}
            </button>
        </div>
    );
}