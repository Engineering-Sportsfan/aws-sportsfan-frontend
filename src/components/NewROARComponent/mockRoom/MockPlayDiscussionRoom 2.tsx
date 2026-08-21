// // src/components/NewROARComponent/mockRoom/MockPlayDiscussionRoom.tsx
// //
// // Static "mock play" ROAR room — internal/demo only, gated by
// // canViewMockRooms() at the call site. Visual language (card shape,
// // avatar/name/tag/time header, reaction pills, inline comments) mirrors
// // DiscussionRoom.tsx, but there is NO network I/O anywhere in this file.
// // Reactions and comments the viewer adds persist to localStorage on
// // their own device only — a fresh device or cleared storage starts back
// // at the seeded dummy counts baked into the mock data.

// import React, { useMemo, useRef, useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { ChevronLeft, Send, ChevronDown, ChevronUp, Brain, History } from "lucide-react";
// import { useMockRoomFeed, type DisplayReaction } from "./useMockRoomFeed";
// import { getMockRoomDefinition } from "./mockRoomAccess";
// import type { MockFeedItem, RawMockPoll, RawMockSlider } from "./mockRoomTypes";

// interface Props {
//   roomId: string;
//   onBack: () => void;
//   showBackButton?: boolean;
//   currentUsername: string;
//   currentAvatarUrl?: string;
// }

// // Same emoji set used for comment/message reactions elsewhere in ROAR, so
// // the picker feels identical to the real rooms.
// const REACTION_EMOJI_OPTS = ["🔥", "❤️", "🤯", "😂", "👏", "🙅", "😢", "👍"];

// function initialsOf(name: string) {
//   return name.slice(0, 2).toUpperCase();
// }

// function PollBlock({ poll, campColors }: { poll: RawMockPoll; campColors: Record<string, string> }) {
//   if (poll.type === "quiz") {
//     return (
//       <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
//         {poll.opts.map((opt, i) => (
//           <div
//             key={i}
//             style={{
//               padding: "7px 10px", borderRadius: 8, fontSize: 11, fontWeight: 600,
//               background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "#e5e5f0",
//             }}
//           >
//             {String(opt[0] ?? "")}
//           </div>
//         ))}
//       </div>
//     );
//   }
//   if (poll.type === "lock") {
//     return (
//       <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
//         {poll.opts.map((opt, i) => (
//           <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
//             <span style={{ flex: "0 0 150px", fontSize: 11, color: "#e5e5f0" }}>{String(opt[0] ?? "")}</span>
//             <div style={{ flex: 1, height: 6, borderRadius: 4, background: "rgba(255,255,255,0.05)", opacity: 0.35 }} />
//             <span style={{ fontSize: 11 }}>🔒</span>
//           </div>
//         ))}
//       </div>
//     );
//   }
//   // camp / debate / battle / rate → [label, colorKey, pct]
//   // reaction                      → [label, pct]  (no color key)
//   const isRate = poll.type === "rate";
//   const hasColorKey = poll.type !== "reaction";
//   return (
//     <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
//       {poll.opts.map((opt, i) => {
//         const label = String(opt[0] ?? "");
//         const colorKey = hasColorKey ? (opt[1] as string | undefined) : undefined;
//         const rawVal = (hasColorKey ? opt[2] : opt[1]) as number | null | undefined;
//         const val = rawVal ?? 0;
//         const color = (colorKey && campColors[colorKey]) || "#F2B705";
//         const pct = isRate ? Math.min(100, val * 10) : val;
//         return (
//           <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
//             <span style={{ flex: "0 0 150px", fontSize: 11, color: "#e5e5f0" }}>{label}</span>
//             <div style={{ flex: 1, height: 6, borderRadius: 4, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
//               <div style={{ width: `${pct}%`, height: "100%", background: color }} />
//             </div>
//             <span style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", width: 32, textAlign: "right" }}>
//               {isRate ? val : `${val}%`}
//             </span>
//           </div>
//         );
//       })}
//     </div>
//   );
// }

// function SliderBlock({ slider }: { slider: RawMockSlider }) {
//   return (
//     <div style={{ marginTop: 8 }}>
//       <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "rgba(255,255,255,0.45)", marginBottom: 3 }}>
//         <span>{slider.left}</span>
//         <span>{slider.right}</span>
//       </div>
//       <div style={{ height: 8, borderRadius: 5, background: "#3D8BFF", position: "relative", overflow: "hidden" }}>
//         <div style={{ position: "absolute", inset: 0, right: `${100 - slider.pct}%`, background: "#14D8A0" }} />
//       </div>
//     </div>
//   );
// }

// function ReactionRow({
//   reactions, onToggle, onPickNew,
// }: {
//   reactions: DisplayReaction[];
//   onToggle: (emoji: string) => void;
//   onPickNew: (emoji: string) => void;
// }) {
//   const [pickerOpen, setPickerOpen] = useState(false);
//   const wrapRef = useRef<HTMLDivElement>(null);

//   return (
//     <div ref={wrapRef} style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", position: "relative" }}>
//       {reactions.map((r) => (
//         <button
//           key={r.emoji}
//           type="button"
//           onClick={() => onToggle(r.emoji)}
//           style={{
//             fontFamily: "monospace", fontSize: 11, display: "flex", alignItems: "center", gap: 4,
//             color: r.active ? "#fff" : "rgba(255,255,255,0.6)",
//             background: r.active ? "rgba(233,30,140,0.18)" : "rgba(255,255,255,0.03)",
//             border: `1px solid ${r.active ? "rgba(233,30,140,0.5)" : "rgba(255,255,255,0.1)"}`,
//             borderRadius: 12, padding: "2px 8px", cursor: "pointer",
//           }}
//         >
//           <span>{r.emoji}</span><span>{r.count}</span>
//         </button>
//       ))}
//       <button
//         type="button"
//         onClick={() => setPickerOpen((p) => !p)}
//         style={{
//           fontSize: 11, color: "rgba(255,255,255,0.4)", background: "rgba(255,255,255,0.03)",
//           border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "2px 8px", cursor: "pointer",
//         }}
//       >
//         + react
//       </button>
//       {pickerOpen && (
//         <div
//           style={{
//             position: "absolute", bottom: "100%", left: 0, marginBottom: 4, display: "flex", gap: 4,
//             background: "#181c24", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: 6, zIndex: 20,
//           }}
//         >
//           {REACTION_EMOJI_OPTS.map((e) => (
//             <button
//               key={e}
//               type="button"
//               onClick={() => { onPickNew(e); setPickerOpen(false); }}
//               style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, padding: 2 }}
//             >
//               {e}
//             </button>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }

// function CommentSection({
//   itemId, comments, onAdd, onDelete, currentAvatarUrl, accentColor,
// }: {
//   itemId: string;
//   comments: { id: string; authorName: string; authorAvatarUrl?: string; text: string; createdAt: number }[];
//   onAdd: (text: string) => void;
//   onDelete: (commentId: string) => void;
//   currentAvatarUrl?: string;
//   accentColor: string;
// }) {
//   const [open, setOpen] = useState(false);
//   const [text, setText] = useState("");

//   const submit = () => {
//     if (!text.trim()) return;
//     onAdd(text);
//     setText("");
//   };

//   return (
//     <div style={{ marginTop: 4 }}>
//       <button
//         type="button"
//         onClick={() => setOpen((o) => !o)}
//         style={{
//           display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer",
//           color: open ? accentColor : "#9494ad", fontSize: 11, fontWeight: 600, padding: 0, marginTop: 4,
//         }}
//       >
//         <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//           <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
//         </svg>
//         <span>{comments.length}</span>
//         {open ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
//       </button>

//       <AnimatePresence>
//         {open && (
//           <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} style={{ overflow: "hidden" }}>
//             <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 6 }}>
//               {comments.length === 0 ? (
//                 <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontStyle: "italic" }}>No replies yet — be the first!</p>
//               ) : (
//                 comments.map((c) => (
//                   <div key={c.id} style={{ display: "flex", gap: 6, alignItems: "flex-start" }}>
//                     <div style={{ width: 16, height: 16, borderRadius: "50%", flexShrink: 0, background: "linear-gradient(135deg,#e91e8c,#ff6b35)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
//                       {c.authorAvatarUrl ? (
//                         <img src={c.authorAvatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
//                       ) : (
//                         <span style={{ fontSize: 8, fontWeight: 800, color: "#fff" }}>{c.authorName[0]?.toUpperCase()}</span>
//                       )}
//                     </div>
//                     <div style={{ flex: 1, minWidth: 0 }}>
//                       <span style={{ fontWeight: 700, color: "#fff", fontSize: 10 }}>{c.authorName}</span>
//                       <p style={{ margin: 0, fontSize: 10, color: "rgba(255,255,255,0.75)", wordBreak: "break-word" }}>{c.text}</p>
//                     </div>
//                     <button
//                       type="button"
//                       onClick={() => onDelete(c.id)}
//                       style={{ background: "none", border: "none", cursor: "pointer", fontSize: 9, color: "rgba(255,255,255,0.3)" }}
//                       title="Delete"
//                     >
//                       ✕
//                     </button>
//                   </div>
//                 ))
//               )}

//               <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "3px 5px", borderRadius: 14, background: "rgba(255,255,255,0.04)", border: `1px solid ${accentColor}40` }}>
//                 {currentAvatarUrl ? (
//                   <img src={currentAvatarUrl} alt="" style={{ width: 18, height: 18, borderRadius: "50%", flexShrink: 0, objectFit: "cover" }} />
//                 ) : (
//                   <div style={{ width: 18, height: 18, borderRadius: "50%", flexShrink: 0, background: "linear-gradient(135deg,#e91e8c,#ff6b35)" }} />
//                 )}
//                 <input
//                   type="text"
//                   value={text}
//                   onChange={(e) => setText(e.target.value)}
//                   onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
//                   placeholder="Add a comment…"
//                   style={{ flex: 1, background: "none", border: "none", outline: "none", color: "#fff", fontSize: 11 }}
//                 />
//                 <button type="button" onClick={submit} disabled={!text.trim()} style={{ background: "none", border: "none", cursor: text.trim() ? "pointer" : "default", padding: 0 }}>
//                   <Send size={12} color={text.trim() ? accentColor : "rgba(255,255,255,0.3)"} />
//                 </button>
//               </div>
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }

// export default function MockPlayDiscussionRoom({ roomId, onBack, showBackButton = true, currentUsername, currentAvatarUrl }: Props) {
//   const def = getMockRoomDefinition(roomId);
//   const { feedItems, getItemState, getDisplayReactions, toggleReaction, addComment, deleteComment } =
//     useMockRoomFeed(roomId, def?.raw ?? [], currentUsername, currentAvatarUrl);

//   const meta = def?.meta;
//   const campColors = meta?.campColors ?? { neu: "#F2B705" };
//   const campLabels = meta?.campLabels ?? {};

//   const specialAccent: Record<string, { bg: string; border: string; tag: string; label: string }> = {
//     analysis: { bg: "rgba(242,183,5,0.07)", border: "#F2B705", tag: "#F2B705", label: "DOLLY · ANALYSIS" },
//     story: { bg: "rgba(177,140,255,0.07)", border: "#B18CFF", tag: "#B18CFF", label: "DOLLY · STORY ARC" },
//     spicy: { bg: "rgba(255,122,26,0.09)", border: "#FF7A1A", tag: "#FF7A1A", label: "DOLLY · SPICY" },
//   };

//   if (!def || !meta) {
//     return (
//       <div style={{ padding: 24, color: "#fff" }}>
//         <p>This mock room isn't available.</p>
//         <button type="button" onClick={onBack} style={{ color: "#e91e8c", background: "none", border: "none", cursor: "pointer" }}>← Back</button>
//       </div>
//     );
//   }

//   const handleBack = (e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); onBack(); };

//   return (
//     <div className="flex flex-col w-full bg-[#0e0e14]" style={{ height: "100%" }}>
//       {/* Ticker / header */}
//       <div className="shrink-0 px-3 py-1 bg-black border-b border-[var(--border)] overflow-hidden">
//         <div className="flex items-center gap-2 whitespace-nowrap">
//           <span className="w-2 h-2 rounded-full bg-[#FF4438] flex-shrink-0" />
//           <span className="text-[10px] font-mono text-white/50 truncate">
//             <b className="text-white">MOCK REPLAY</b> · {meta.tickerText}
//           </span>
//         </div>
//       </div>

//       <div className="shrink-0 px-3 py-2 bg-[rgba(14,14,20,0.98)] border-b border-[var(--border)]">
//         <div className="flex justify-between items-center gap-2">
//           <div className="flex items-center gap-2 min-w-0 flex-1">
//             {showBackButton && (
//               <button type="button" onClick={handleBack} className="bg-transparent border-none cursor-pointer text-white flex items-center p-0 flex-shrink-0">
//                 <ChevronLeft size={20} />
//               </button>
//             )}
//             <div className="text-left min-w-0 flex-1">
//               <p className="font-display text-base tracking-[0.02em] m-0 leading-tight text-white font-extrabold truncate">{meta.title}</p>
//               <span className="text-[9px] font-bold text-[#F2B705] uppercase tracking-wide">Mock Simulation · Internal Only</span>
//             </div>
//           </div>
//           {(meta.score || meta.scoreSubtitle) && (
//             <div className="text-right pr-0.5 flex-shrink-0">
//               {meta.score && <div className="font-display text-[16px] text-[var(--accent-yellow)] leading-none">{meta.score}</div>}
//               {/* {meta.scoreSubtitle && <div className="text-[8px] text-[var(--text-secondary)] mt-0">{meta.scoreSubtitle}</div>} */}
//             </div>
//           )}
//         </div>
//         {/* <p className="text-[10px] text-white/40 mt-1 leading-snug">{meta.subtitle}</p> */}
//         {/* <p className="text-[9px] text-white/30 mt-1 leading-snug border-t border-white/5 pt-1.5">{meta.resultFact}</p> */}
//       </div>

//       {/* Feed */}
//       <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-2 flex flex-col gap-0 min-h-0">
//         {feedItems.map((item: MockFeedItem) => {
//           if (item.kind === "divider") {
//             return (
//               <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 10, margin: "18px 0 8px" }}>
//                 <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
//                 <span style={{ fontFamily: "monospace", fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "#F2B705", whiteSpace: "nowrap" }}>
//                   {item.label}
//                 </span>
//                 <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
//               </div>
//             );
//           }

//           if (item.kind === "special") {
//             const accent = specialAccent[item.special];
//             return (
//               <div key={item.id} style={{ borderRadius: 12, padding: "12px 14px", border: "1px solid rgba(255,255,255,0.08)", borderLeft: `3px solid ${accent.border}`, background: accent.bg, marginBottom: 8 }}>
//                 <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
//                   {item.special === "analysis" ? <Brain size={10} color={accent.tag} /> : <History size={10} color={accent.tag} />}
//                   <span style={{ fontFamily: "monospace", fontSize: 9, letterSpacing: "0.08em", textTransform: "uppercase", color: accent.tag }}>{accent.label} · {item.time}</span>
//                 </div>
//                 <h4 style={{ fontSize: 13, color: "#fff", margin: "0 0 6px", fontWeight: 700 }}>{item.title}</h4>
//                 {item.pts && (
//                   <ul style={{ margin: "0 0 0 16px", padding: 0 }}>
//                     {item.pts.map((p, i) => (
//                       <li key={i} style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", marginBottom: 4 }}>{p}</li>
//                     ))}
//                   </ul>
//                 )}
//                 {item.text && <p style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", margin: 0 }}>{item.text}</p>}
//                 {item.poll && <PollBlock poll={item.poll} campColors={campColors} />}
//               </div>
//             );
//           }

//           // message
//           const camp = item.camp;
//           const avatarColor = campColors[camp] ?? campColors.neu;
//           const tagLabel = item.bot ? "AI" : campLabels[camp] ?? "";
//           const state = getItemState(item.id);
//           const displayReactions = getDisplayReactions(item.id, item.seedReactions);

//           return (
//             <div
//               key={item.id}
//               style={{
//                 display: "flex", gap: 10, padding: "10px 12px", marginBottom: 8, borderRadius: 10,
//                 background: item.bot ? "#171D26" : "#12171F", border: "1px solid rgba(255,255,255,0.07)",
//               }}
//             >
//               <div style={{ flex: "0 0 32px", width: 32, height: 32, borderRadius: "50%", background: avatarColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#0A0D12" }}>
//                 {initialsOf(item.name)}
//               </div>
//               <div style={{ flex: 1, minWidth: 0 }}>
//                 <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2, flexWrap: "wrap" }}>
//                   <span style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{item.name}</span>
//                   {tagLabel && (
//                     <span style={{ fontFamily: "monospace", fontSize: 9.5, letterSpacing: "0.04em", padding: "1px 6px", borderRadius: 4, color: avatarColor, background: `${avatarColor}1a`, border: `1px solid ${avatarColor}4d` }}>
//                       {tagLabel}
//                     </span>
//                   )}
//                   <span style={{ fontFamily: "monospace", fontSize: 10.5, color: "rgba(255,255,255,0.4)", marginLeft: "auto" }}>{item.time}</span>
//                 </div>
//                 <p style={{ fontSize: 13.5, color: "#E7ECF2", margin: 0 }}>{item.text}</p>
//                 {item.poll && <PollBlock poll={item.poll} campColors={campColors} />}
//                 {item.slider && <SliderBlock slider={item.slider} />}

//                 <ReactionRow
//                   reactions={displayReactions}
//                   onToggle={(emoji) => toggleReaction(item.id, emoji)}
//                   onPickNew={(emoji) => toggleReaction(item.id, emoji)}
//                 />
//                 <CommentSection
//                   itemId={item.id}
//                   comments={state.comments}
//                   onAdd={(text) => addComment(item.id, text)}
//                   onDelete={(commentId) => deleteComment(item.id, commentId)}
//                   currentAvatarUrl={currentAvatarUrl}
//                   accentColor="#e91e8c"
//                 />
//               </div>
//             </div>
//           );
//         })}
//         <p style={{ textAlign: "center", fontSize: 10, color: "rgba(255,255,255,0.25)", margin: "16px 0" }}>
//           SportsFan360 · ROAR mock match-room · illustrative simulation, not real user data
//         </p>
//       </div>
//     </div>
//   );
// }






// src/components/NewROARComponent/mockRoom/MockPlayDiscussionRoom.tsx
//
// Static "mock play" ROAR room — internal/demo only, gated by
// canViewMockRooms() at the call site. Visual language (card shape,
// avatar/name/tag/time header, reaction pills, inline comments) mirrors
// DiscussionRoom.tsx, but there is NO network I/O anywhere in this file.
// Reactions and comments the viewer adds persist to localStorage on
// their own device only — a fresh device or cleared storage starts back
// at the seeded dummy counts baked into the mock data.

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Send, ChevronDown, ChevronUp, Brain, History, Volume2, VolumeX, Share2, Image as ImageIcon } from "lucide-react";
import { useMockRoomFeed, type DisplayReaction } from "./useMockRoomFeed";
import { getMockRoomDefinition } from "./mockRoomAccess";
import type { MockFeedItem, RawMockPoll, RawMockSlider } from "./mockRoomTypes";

interface Props {
  roomId: string;
  onBack: () => void;
  showBackButton?: boolean;
  currentUsername: string;
  currentAvatarUrl?: string;
}

// Same emoji set used for comment/message reactions elsewhere in ROAR, so
// the picker feels identical to the real rooms.
const REACTION_EMOJI_OPTS = ["🔥", "❤️", "🤯", "😂", "👏", "🙅", "😢", "👍"];

function initialsOf(name: string) {
  return name.slice(0, 2).toUpperCase();
}

function ActiveFansStack({ count, totalJoinCount }: { count: number; totalJoinCount?: number }) {
  const formatCount = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : `${n}`);
  return (
    <div className="flex items-center gap-0 py-0.5 flex-shrink-0">
      <span className="text-[9px] font-semibold text-white/50 whitespace-nowrap">
        Members{" "}
        <span className="text-white font-bold">{formatCount(count)} active</span>
        {totalJoinCount !== undefined && totalJoinCount > 0 && (
          <>
            {" / "}
            <span className="text-white font-bold">{formatCount(totalJoinCount)}</span> total joined
          </>
        )}
      </span>
    </div>
  );
}

function PollBlock({ poll, campColors }: { poll: RawMockPoll; campColors: Record<string, string> }) {
  if (poll.type === "quiz") {
    return (
      <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
        {poll.opts.map((opt, i) => (
          <div
            key={i}
            style={{
              padding: "7px 10px", borderRadius: 8, fontSize: 11, fontWeight: 600,
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "#e5e5f0",
            }}
          >
            {String(opt[0] ?? "")}
          </div>
        ))}
      </div>
    );
  }
  if (poll.type === "lock") {
    return (
      <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
        {poll.opts.map((opt, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ flex: "0 0 150px", fontSize: 11, color: "#e5e5f0" }}>{String(opt[0] ?? "")}</span>
            <div style={{ flex: 1, height: 6, borderRadius: 4, background: "rgba(255,255,255,0.05)", opacity: 0.35 }} />
            <span style={{ fontSize: 11 }}>🔒</span>
          </div>
        ))}
      </div>
    );
  }
  // camp / debate / battle / rate → [label, colorKey, pct]
  // reaction                      → [label, pct]  (no color key)
  const isRate = poll.type === "rate";
  const hasColorKey = poll.type !== "reaction";
  return (
    <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
      {poll.opts.map((opt, i) => {
        const label = String(opt[0] ?? "");
        const colorKey = hasColorKey ? (opt[1] as string | undefined) : undefined;
        const rawVal = (hasColorKey ? opt[2] : opt[1]) as number | null | undefined;
        const val = rawVal ?? 0;
        const color = (colorKey && campColors[colorKey]) || "#F2B705";
        const pct = isRate ? Math.min(100, val * 10) : val;
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ flex: "0 0 150px", fontSize: 11, color: "#e5e5f0" }}>{label}</span>
            <div style={{ flex: 1, height: 6, borderRadius: 4, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
              <div style={{ width: `${pct}%`, height: "100%", background: color }} />
            </div>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", width: 32, textAlign: "right" }}>
              {isRate ? val : `${val}%`}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function SliderBlock({ slider }: { slider: RawMockSlider }) {
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "rgba(255,255,255,0.45)", marginBottom: 3 }}>
        <span>{slider.left}</span>
        <span>{slider.right}</span>
      </div>
      <div style={{ height: 8, borderRadius: 5, background: "#3D8BFF", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, right: `${100 - slider.pct}%`, background: "#14D8A0" }} />
      </div>
    </div>
  );
}

function ReactionRow({
  reactions, onToggle, onPickNew,
}: {
  reactions: DisplayReaction[];
  onToggle: (emoji: string) => void;
  onPickNew: (emoji: string) => void;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={wrapRef} style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", position: "relative" }}>
      {reactions.map((r) => (
        <button
          key={r.emoji}
          type="button"
          onClick={() => onToggle(r.emoji)}
          style={{
            fontFamily: "monospace", fontSize: 11, display: "flex", alignItems: "center", gap: 4,
            color: r.active ? "#fff" : "rgba(255,255,255,0.6)",
            background: r.active ? "rgba(233,30,140,0.18)" : "rgba(255,255,255,0.03)",
            border: `1px solid ${r.active ? "rgba(233,30,140,0.5)" : "rgba(255,255,255,0.1)"}`,
            borderRadius: 12, padding: "2px 8px", cursor: "pointer",
          }}
        >
          <span>{r.emoji}</span><span>{r.count}</span>
        </button>
      ))}
      <button
        type="button"
        onClick={() => setPickerOpen((p) => !p)}
        style={{
          fontSize: 11, color: "rgba(255,255,255,0.4)", background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "2px 8px", cursor: "pointer",
        }}
      >
        + react
      </button>
      {pickerOpen && (
        <div
          style={{
            position: "absolute", bottom: "100%", left: 0, marginBottom: 4, display: "flex", gap: 4,
            background: "#181c24", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: 6, zIndex: 20,
          }}
        >
          {REACTION_EMOJI_OPTS.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => { onPickNew(e); setPickerOpen(false); }}
              style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, padding: 2 }}
            >
              {e}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function CommentSection({
  itemId, comments, onAdd, onDelete, currentAvatarUrl, accentColor,
}: {
  itemId: string;
  comments: { id: string; authorName: string; authorAvatarUrl?: string; text: string; createdAt: number }[];
  onAdd: (text: string) => void;
  onDelete: (commentId: string) => void;
  currentAvatarUrl?: string;
  accentColor: string;
}) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");

  const submit = () => {
    if (!text.trim()) return;
    onAdd(text);
    setText("");
  };

  return (
    <div style={{ marginTop: 4 }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer",
          color: open ? accentColor : "#9494ad", fontSize: 11, fontWeight: 600, padding: 0, marginTop: 4,
        }}
      >
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        <span>{comments.length}</span>
        {open ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} style={{ overflow: "hidden" }}>
            <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 6 }}>
              {comments.length === 0 ? (
                <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontStyle: "italic" }}>No replies yet — be the first!</p>
              ) : (
                comments.map((c) => (
                  <div key={c.id} style={{ display: "flex", gap: 6, alignItems: "flex-start" }}>
                    <div style={{ width: 16, height: 16, borderRadius: "50%", flexShrink: 0, background: "linear-gradient(135deg,#e91e8c,#ff6b35)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                      {c.authorAvatarUrl ? (
                        <img src={c.authorAvatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <span style={{ fontSize: 8, fontWeight: 800, color: "#fff" }}>{c.authorName[0]?.toUpperCase()}</span>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ fontWeight: 700, color: "#fff", fontSize: 10 }}>{c.authorName}</span>
                      <p style={{ margin: 0, fontSize: 10, color: "rgba(255,255,255,0.75)", wordBreak: "break-word" }}>{c.text}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onDelete(c.id)}
                      style={{ background: "none", border: "none", cursor: "pointer", fontSize: 9, color: "rgba(255,255,255,0.3)" }}
                      title="Delete"
                    >
                      ✕
                    </button>
                  </div>
                ))
              )}

              <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "3px 5px", borderRadius: 14, background: "rgba(255,255,255,0.04)", border: `1px solid ${accentColor}40` }}>
                {currentAvatarUrl ? (
                  <img src={currentAvatarUrl} alt="" style={{ width: 18, height: 18, borderRadius: "50%", flexShrink: 0, objectFit: "cover" }} />
                ) : (
                  <div style={{ width: 18, height: 18, borderRadius: "50%", flexShrink: 0, background: "linear-gradient(135deg,#e91e8c,#ff6b35)" }} />
                )}
                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
                  placeholder="Add a comment…"
                  style={{ flex: 1, background: "none", border: "none", outline: "none", color: "#fff", fontSize: 11 }}
                />
                <button type="button" onClick={submit} disabled={!text.trim()} style={{ background: "none", border: "none", cursor: text.trim() ? "pointer" : "default", padding: 0 }}>
                  <Send size={12} color={text.trim() ? accentColor : "rgba(255,255,255,0.3)"} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

type LocalPost = {
  id: string;
  name: string;
  avatarUrl?: string;
  text: string;
  time: string;
  reactions: { emoji: string; count: number; active: boolean }[];
  comments: { id: string; authorName: string; authorAvatarUrl?: string; text: string; createdAt: number }[];
};

function localPostsStorageKey(roomId: string, username: string) {
  return `roar-mock-room:${roomId}:user-posts:${username}`;
}

function formatNowTime() {
  return new Date().toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

// currentUsername often looks like "chandu_srikakulam_sportsfan360_com" —
// for the user's own posts we only want to show the first segment, e.g. "chandu".
function firstNameOnly(username: string) {
  return username.split("_")[0] || username;
}

export default function MockPlayDiscussionRoom({ roomId, onBack, showBackButton = true, currentUsername, currentAvatarUrl }: Props) {
  const def = getMockRoomDefinition(roomId);
  const { feedItems, getItemState, getDisplayReactions, toggleReaction, addComment, deleteComment } =
    useMockRoomFeed(roomId, def?.raw ?? [], currentUsername, currentAvatarUrl);

  const meta = def?.meta;
  const campColors = meta?.campColors ?? { neu: "#F2B705" };
  const campLabels = meta?.campLabels ?? {};

  // Local, device-only UI state — doesn't touch the seeded mock data.
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [composerText, setComposerText] = useState("");
  const [shareCopied, setShareCopied] = useState(false);

  // The user's own top-level posts. These are tracked separately from the
  // seeded feed managed by useMockRoomFeed (which only knows about the
  // dummy raw data) and persisted to localStorage the same way reactions
  // and comments are elsewhere in this file: per-device only, seeded fresh
  // on a new device or cleared storage.
  const localPostsKey = localPostsStorageKey(roomId, currentUsername);
  const [localPosts, setLocalPosts] = useState<LocalPost[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = window.localStorage.getItem(localPostsKey);
      return raw ? (JSON.parse(raw) as LocalPost[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(localPostsKey, JSON.stringify(localPosts));
    } catch {
      /* storage unavailable — posts just won't survive a refresh */
    }
  }, [localPosts, localPostsKey]);

  const toggleLocalPostReaction = (postId: string, emoji: string) => {
    setLocalPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        const existing = p.reactions.find((r) => r.emoji === emoji);
        if (existing) {
          const nextCount = existing.active ? existing.count - 1 : existing.count + 1;
          const nextReactions = p.reactions
            .map((r) => (r.emoji === emoji ? { ...r, active: !r.active, count: nextCount } : r))
            .filter((r) => r.count > 0 || r.active);
          return { ...p, reactions: nextReactions };
        }
        return { ...p, reactions: [...p.reactions, { emoji, count: 1, active: true }] };
      })
    );
  };

  const addLocalPostComment = (postId: string, text: string) => {
    setLocalPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              comments: [
                ...p.comments,
                {
                  id: `c-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                  authorName: firstNameOnly(currentUsername),
                  authorAvatarUrl: currentAvatarUrl,
                  text,
                  createdAt: Date.now(),
                },
              ],
            }
          : p
      )
    );
  };

  const deleteLocalPostComment = (postId: string, commentId: string) => {
    setLocalPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, comments: p.comments.filter((c) => c.id !== commentId) } : p))
    );
  };

  const specialAccent: Record<string, { bg: string; border: string; tag: string; label: string }> = {
    analysis: { bg: "rgba(242,183,5,0.07)", border: "#F2B705", tag: "#F2B705", label: "DOLLY · ANALYSIS" },
    story: { bg: "rgba(177,140,255,0.07)", border: "#B18CFF", tag: "#B18CFF", label: "DOLLY · STORY ARC" },
    spicy: { bg: "rgba(255,122,26,0.09)", border: "#FF7A1A", tag: "#FF7A1A", label: "DOLLY · SPICY" },
  };

  // Mirrors what ROARApp does for the real DiscussionRoom full-screen
  // overlay: hide the app's global header + bottom nav chrome while this
  // room is open, so the mock room owns the whole screen the same way.
  useEffect(() => {
    document.body.classList.add("roar-room-active");
    return () => { document.body.classList.remove("roar-room-active"); };
  }, []);

  if (!def || !meta) {
    return (
      <div style={{ padding: 24, color: "#fff" }}>
        <p>This mock room isn't available.</p>
        <button type="button" onClick={onBack} style={{ color: "#e91e8c", background: "none", border: "none", cursor: "pointer" }}>← Back</button>
      </div>
    );
  }

  const handleBack = (e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); onBack(); };

  const shareRoomLink = async () => {
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title: meta.title, url: typeof window !== "undefined" ? window.location.href : "" });
        return;
      }
      if (typeof navigator !== "undefined" && navigator.clipboard && typeof window !== "undefined") {
        await navigator.clipboard.writeText(window.location.href);
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 1600);
      }
    } catch {
      /* user cancelled share sheet or clipboard unavailable — no-op */
    }
  };

  const handleComposerSend = () => {
    const text = composerText.trim();
    if (!text) return;
    const newPost: LocalPost = {
      id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: firstNameOnly(currentUsername),
      avatarUrl: currentAvatarUrl,
      text,
      time: formatNowTime(),
      reactions: [],
      comments: [],
    };
    setLocalPosts((prev) => [...prev, newPost]);
    setComposerText("");
  };

  return (
    <div className="flex flex-col w-full bg-[#0e0e14]" style={{ height: "100%" }}>
      <style dangerouslySetInnerHTML={{ __html: `#global-header-desktop,#global-header-tablet,#global-header-mobile,.roar-header-spacer{display:none!important}` }} />
      {/* Ticker / header */}
      {/* <div className="shrink-0 px-3 py-1 bg-black border-b border-[var(--border)] overflow-hidden">
        <div className="flex items-center gap-2 whitespace-nowrap">
          <span className="w-2 h-2 rounded-full bg-[#FF4438] flex-shrink-0" />
          <span className="text-[10px] font-mono text-white/50 truncate">
            <b className="text-white">MOCK REPLAY</b> · {meta.tickerText}
          </span>
        </div>
      </div> */}

      <div className="shrink-0 px-3 py-2 bg-[rgba(14,14,20,0.98)] border-b border-[var(--border)]">
        <div className="flex justify-between items-center gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {showBackButton && (
              <button type="button" onClick={handleBack} className="bg-transparent border-none cursor-pointer text-white flex items-center p-0 flex-shrink-0">
                <ChevronLeft size={20} />
              </button>
            )}
            <div className="text-left min-w-0 flex-1">
              <p className="font-display text-[12px] tracking-[0.02em] m-0 leading-tight text-white font-extrabold whitespace-normal">{meta.title}</p>
              {/* <span className="text-[9px] font-bold text-[#F2B705] uppercase tracking-wide">Mock Simulation · Internal Only</span> */}
            </div>
          </div>
          <div className="flex items-center gap-0.5 flex-shrink-0">
            <button
              type="button"
              onClick={() => setSoundEnabled((s) => !s)}
              className="flex-shrink-0 rounded-[8px] cursor-pointer text-[rgba(255,255,255,0.75)] flex items-center justify-center hover:bg-white/5 transition-colors"
              style={{ width: 28, height: 28 }}
              title={soundEnabled ? "Mute sounds" : "Unmute sounds"}
            >
              {soundEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
            </button>
            <button
              type="button"
              onClick={shareRoomLink}
              className="flex-shrink-0 rounded-[8px] cursor-pointer text-[rgba(255,255,255,0.75)] flex items-center justify-center hover:bg-white/5 transition-colors"
              style={{ width: 28, height: 28 }}
              title="Share room"
            >
              <Share2 size={13} />
            </button>
            {(meta.score || meta.scoreSubtitle) && (
              <div className="text-right pr-0.5 flex-shrink-0">
                {meta.score && <div className="font-display text-[16px] text-[var(--accent-yellow)] leading-none">{meta.score}</div>}
              </div>
            )}
          </div>
        </div>
        {shareCopied && <p className="text-[9px] text-emerald-400 mt-1 mb-0">Link copied!</p>}
      </div>

      {/* <div className="shrink-0 px-3 py-1 bg-[rgba(14,14,20,0.98)] border-b border-[var(--border)]">
        <ActiveFansStack count={meta.fanCount ?? 128} totalJoinCount={meta.totalJoinCount} />
      </div> */}

      {/* Feed */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-2 flex flex-col gap-0 min-h-0">
        {feedItems.map((item: MockFeedItem) => {
          if (item.kind === "divider") {
            return (
              <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 10, margin: "18px 0 8px" }}>
                <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
                <span style={{ fontFamily: "monospace", fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "#F2B705", whiteSpace: "nowrap" }}>
                  {item.label}
                </span>
                <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
              </div>
            );
          }

          if (item.kind === "special") {
            const accent = specialAccent[item.special];
            return (
              <div key={item.id} style={{ borderRadius: 12, padding: "12px 14px", border: "1px solid rgba(255,255,255,0.08)", borderLeft: `3px solid ${accent.border}`, background: accent.bg, marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                  {item.special === "analysis" ? <Brain size={10} color={accent.tag} /> : <History size={10} color={accent.tag} />}
                  <span style={{ fontFamily: "monospace", fontSize: 9, letterSpacing: "0.08em", textTransform: "uppercase", color: accent.tag }}>{accent.label} · {item.time}</span>
                </div>
                <h4 style={{ fontSize: 13, color: "#fff", margin: "0 0 6px", fontWeight: 700 }}>{item.title}</h4>
                {item.pts && (
                  <ul style={{ margin: "0 0 0 16px", padding: 0 }}>
                    {item.pts.map((p, i) => (
                      <li key={i} style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", marginBottom: 4 }}>{p}</li>
                    ))}
                  </ul>
                )}
                {item.text && <p style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", margin: 0 }}>{item.text}</p>}
                {item.poll && <PollBlock poll={item.poll} campColors={campColors} />}
              </div>
            );
          }

          // message
          const camp = item.camp;
          const avatarColor = campColors[camp] ?? campColors.neu;
          const tagLabel = item.bot ? "AI" : campLabels[camp] ?? "";
          const state = getItemState(item.id);
          const displayReactions = getDisplayReactions(item.id, item.seedReactions);

          return (
            <div
              key={item.id}
              style={{
                display: "flex", gap: 10, padding: "10px 12px", marginBottom: 8, borderRadius: 10,
                background: item.bot ? "#171D26" : "#12171F", border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <div style={{ flex: "0 0 32px", width: 32, height: 32, borderRadius: "50%", background: avatarColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#0A0D12" }}>
                {initialsOf(item.name)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{item.name}</span>
                  {tagLabel && (
                    <span style={{ fontFamily: "monospace", fontSize: 9.5, letterSpacing: "0.04em", padding: "1px 6px", borderRadius: 4, color: avatarColor, background: `${avatarColor}1a`, border: `1px solid ${avatarColor}4d` }}>
                      {tagLabel}
                    </span>
                  )}
                  <span style={{ fontFamily: "monospace", fontSize: 10.5, color: "rgba(255,255,255,0.4)", marginLeft: "auto" }}>{item.time}</span>
                </div>
                <p style={{ fontSize: 13.5, color: "#E7ECF2", margin: 0 }}>{item.text}</p>
                {item.poll && <PollBlock poll={item.poll} campColors={campColors} />}
                {item.slider && <SliderBlock slider={item.slider} />}

                <ReactionRow
                  reactions={displayReactions}
                  onToggle={(emoji) => toggleReaction(item.id, emoji)}
                  onPickNew={(emoji) => toggleReaction(item.id, emoji)}
                />
                <CommentSection
                  itemId={item.id}
                  comments={state.comments}
                  onAdd={(text) => addComment(item.id, text)}
                  onDelete={(commentId) => deleteComment(item.id, commentId)}
                  currentAvatarUrl={currentAvatarUrl}
                  accentColor="#e91e8c"
                />
              </div>
            </div>
          );
        })}

        {localPosts.map((post) => (
          <div
            key={post.id}
            style={{
              display: "flex", gap: 10, padding: "10px 12px", marginBottom: 8, borderRadius: 10,
              background: "#12171F", border: "1px solid rgba(233,30,140,0.25)",
            }}
          >
            <div style={{ flex: "0 0 32px", width: 32, height: 32, borderRadius: "50%", flexShrink: 0, overflow: "hidden", background: "linear-gradient(135deg,#e91e8c,#ff6b35)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff" }}>
              {post.avatarUrl ? (
                <img src={post.avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                initialsOf(post.name)
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2, flexWrap: "wrap" }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{post.name}</span>
                <span style={{ fontFamily: "monospace", fontSize: 9.5, letterSpacing: "0.04em", padding: "1px 6px", borderRadius: 4, color: "#e91e8c", background: "rgba(233,30,140,0.1)", border: "1px solid rgba(233,30,140,0.3)" }}>
                  YOU
                </span>
                <span style={{ fontFamily: "monospace", fontSize: 10.5, color: "rgba(255,255,255,0.4)", marginLeft: "auto" }}>{post.time}</span>
              </div>
              <p style={{ fontSize: 13.5, color: "#E7ECF2", margin: 0 }}>{post.text}</p>

              <ReactionRow
                reactions={post.reactions}
                onToggle={(emoji) => toggleLocalPostReaction(post.id, emoji)}
                onPickNew={(emoji) => toggleLocalPostReaction(post.id, emoji)}
              />
              <CommentSection
                itemId={post.id}
                comments={post.comments}
                onAdd={(text) => addLocalPostComment(post.id, text)}
                onDelete={(commentId) => deleteLocalPostComment(post.id, commentId)}
                currentAvatarUrl={currentAvatarUrl}
                accentColor="#e91e8c"
              />
            </div>
          </div>
        ))}

        <p style={{ textAlign: "center", fontSize: 10, color: "rgba(255,255,255,0.25)", margin: "16px 0" }}>
          SportsFan360 · ROAR mock match-room · illustrative simulation, not real user data
        </p>
      </div>

      {/* Bottom composer bar — visual parity with DiscussionRoom's input bar.
          Mock room has no backend, so sending just clears local input. */}
      <div className="shrink-0 px-2.5 mb-6 pt-1 pb-1 bg-[rgba(14,14,20,0.98)] border-t border-[var(--border)] flex flex-col gap-1">
        <div className="flex items-center w-full gap-0.5 ml-1">
          <button type="button" disabled className="bg-transparent border-none -ml-1.5 text-white/25 cursor-not-allowed flex items-center justify-center p-1 shrink-0">
            <ImageIcon size={16} />
          </button>
          <div className="flex-1 relative min-w-0">
            {composerText === "" && (
              <div className="absolute left-2.5 top-0 bottom-0 flex items-center pointer-events-none">
                <span className="text-xs font-medium truncate text-white/30">Say something…</span>
              </div>
            )}
            <input
              type="text"
              value={composerText}
              onChange={(e) => setComposerText(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleComposerSend(); } }}
              className="w-full h-8 rounded-[16px] bg-[var(--bg-secondary)] border border-[var(--border)] pl-2.5 pr-2.5 text-white text-xs outline-none"
            />
          </div>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={handleComposerSend}
            disabled={!composerText.trim()}
            className="w-6 h-6 rounded-full border-none -mr-1 text-white text-base font-bold flex items-center justify-center cursor-pointer shrink-0 bg-gradient-to-br from-[#e91e8c] to-[#ff6b35]"
            style={{ opacity: composerText.trim() ? 1 : 0.5 }}
          >
            ↑
          </motion.button>
        </div>
      </div>
    </div>
  );
}