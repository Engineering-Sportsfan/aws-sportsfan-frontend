


// // components/NewROARComponent/components/VotersDialog.tsx


// "use client";

// import { useState, useEffect, useCallback } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import axios from "axios";
// import AvatarWithBadge from "./AvatarWithBadge";
// import { X, Users, Loader2 } from "lucide-react";

// // ── Types ────────────────────────────────────────────────────────────────────

// interface Voter {
//   uid: string;
//   username: string;
//   avatarUrl?: string;
// }

// interface VoteOption {
//   key: string;
//   label: string;
//   voters: Voter[];
// }

// interface VotersData {
//   // Legacy fields kept for back-compat, no longer read directly by the UI
//   sideA?: string;
//   sideB?: string;
//   options: VoteOption[];
//   totalVotes: number;
// }

// interface VotersDialogProps {
//   postId: string;
//   roomId?: string; // when present, fetches from the room-scoped voters route
//   isOpen: boolean;
//   onClose: () => void;
//   // "debate" collapses the per-side tabs/split-bar into one flat list of
//   // every voter regardless of side — debates just need "who voted," not a
//   // side breakdown in the UI. Omit (or pass "prediction") to keep the
//   // existing tabbed/split-bar behavior for N-option predictions.
//   mode?: "debate" | "prediction";
// }

// // A small fixed palette cycled across options so any option count gets a
// // distinct, consistent color without per-post configuration.
// const OPTION_COLORS = ["#e91e8c", "#60a5fa", "#fbbf24", "#22c55e", "#c084fc", "#f97316"];
// const colorFor = (idx: number) => OPTION_COLORS[idx % OPTION_COLORS.length];

// // ── VotersDialog ─────────────────────────────────────────────────────────────

// export default function VotersDialog({ postId, roomId, isOpen, onClose, mode = "prediction" }: VotersDialogProps) {
//   const [data, setData] = useState<VotersData | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [activeKey, setActiveKey] = useState<string | null>(null);

//   const isFlat = mode === "debate";

//   const fetchVoters = useCallback(async () => {
//     if (!postId) return;
//     setLoading(true);
//     setError(null);
//     try {
//       const url = roomId
//         ? `/api/roar/rooms/${roomId}/messages/${postId}/voters`
//         : `/api/roar/posts/${postId}/voters`;
//       const res = await axios.get(url);
//       if (res.data?.success) {
//         // Back-compat: older room-less responses may only send
//         // sideA/sideB/voters.agree/disagree — normalize into options[].
//         const options: VoteOption[] = Array.isArray(res.data.options)
//           ? res.data.options
//           : [
//               { key: "agree", label: res.data.sideA ?? "Side A", voters: res.data.voters?.agree ?? [] },
//               { key: "disagree", label: res.data.sideB ?? "Side B", voters: res.data.voters?.disagree ?? [] },
//             ];
//         const totalVotes = res.data.totalVotes ?? options.reduce((sum, o) => sum + o.voters.length, 0);
//         setData({ sideA: res.data.sideA, sideB: res.data.sideB, options, totalVotes });
//         // Default to the option with the most votes
//         const top = [...options].sort((a, b) => b.voters.length - a.voters.length)[0];
//         setActiveKey(top?.key ?? options[0]?.key ?? null);
//       } else {
//         setError("Failed to load voters");
//       }
//     } catch (err: any) {
//       setError(err?.response?.data?.error ?? "Failed to load voters");
//     } finally {
//       setLoading(false);
//     }
//   }, [postId, roomId]);

//   useEffect(() => {
//     if (isOpen) fetchVoters();
//     else {
//       // Reset on close so next open starts fresh
//       setData(null);
//       setError(null);
//       setActiveKey(null);
//     }
//   }, [isOpen, fetchVoters]);

//   const options = data?.options ?? [];
//   const activeIndex = options.findIndex((o) => o.key === activeKey);
//   const activeOption = activeIndex >= 0 ? options[activeIndex] : undefined;
//   const totalVotes = data?.totalVotes ?? 0;

//   // Flat (debate) mode: merge every option's voters into one list, dedupe
//   // by uid (shouldn't normally collide across sides, but a voter switching
//   // sides mid-thread could otherwise appear twice), sorted alphabetically
//   // so the list is stable across re-fetches rather than "most recent side
//   // first."
//   const flatVoters: Voter[] = isFlat
//     ? Array.from(
//         new Map(
//           options.flatMap((o) => o.voters).map((v) => [v.uid, v])
//         ).values()
//       ).sort((a, b) => a.username.localeCompare(b.username))
//     : [];

//   const activeVoters = isFlat ? flatVoters : (activeOption?.voters ?? []);
//   const activeColor = activeIndex >= 0 ? colorFor(activeIndex) : OPTION_COLORS[0];

//   return (
//     <AnimatePresence>
//       {isOpen && (
//         <>
//           {/* Backdrop */}
//           <motion.div
//             key="vd-backdrop"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             transition={{ duration: 0.2 }}
//             onClick={onClose}
//             style={{
//               position: "fixed", inset: 0, zIndex: 60,
//               background: "rgba(0,0,0,0.72)",
//               backdropFilter: "blur(4px)",
//               WebkitBackdropFilter: "blur(4px)",
//             }}
//           />

//           {/* Panel */}
//           <motion.div
//             key="vd-panel"
//             initial={{ opacity: 0, y: 40, scale: 0.97 }}
//             animate={{ opacity: 1, y: 0, scale: 1 }}
//             exit={{ opacity: 0, y: 30, scale: 0.97 }}
//             transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
//             onClick={(e) => e.stopPropagation()}
//             style={{
//               position: "fixed",
//               bottom: 0, left: 0, right: 0,
//               zIndex: 61,
//               maxWidth: 480,
//               margin: "0 auto",
//               background: "linear-gradient(160deg, #16161e 0%, #1a1a26 100%)",
//               borderRadius: "24px 24px 0 0",
//               border: "1px solid rgba(255,255,255,0.08)",
//               borderBottom: "none",
//               boxShadow: "0 -8px 40px rgba(0,0,0,0.6)",
//               overflow: "hidden",
//               maxHeight: "75vh",
//               display: "flex",
//               flexDirection: "column",
//             }}
//           >
//             {/* Drag pill */}
//             <div style={{ display: "flex", justifyContent: "center", paddingTop: 10, paddingBottom: 4 }}>
//               <div style={{ width: 36, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.15)" }} />
//             </div>

//             {/* Header */}
//             <div style={{
//               display: "flex", alignItems: "center", justifyContent: "space-between",
//               padding: "10px 18px 14px",
//               borderBottom: "1px solid rgba(255,255,255,0.07)",
//             }}>
//               <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
//                 <Users size={16} color="var(--accent-magenta, #e91e8c)" />
//                 <span style={{ fontWeight: 800, fontSize: 15, color: "#fff" }}>Who Voted</span>
//                 {totalVotes > 0 && (
//                   <span style={{
//                     fontSize: 11, fontWeight: 700, padding: "2px 8px",
//                     borderRadius: 999,
//                     background: "rgba(233,30,140,0.12)",
//                     color: "var(--accent-magenta, #e91e8c)",
//                     border: "1px solid rgba(233,30,140,0.25)",
//                   }}>
//                     {totalVotes} vote{totalVotes !== 1 ? "s" : ""}
//                   </span>
//                 )}
//               </div>
//               <button
//                 type="button"
//                 onClick={onClose}
//                 style={{
//                   background: "rgba(255,255,255,0.06)",
//                   border: "1px solid rgba(255,255,255,0.1)",
//                   borderRadius: "50%",
//                   width: 30, height: 30,
//                   display: "flex", alignItems: "center", justifyContent: "center",
//                   cursor: "pointer", color: "rgba(255,255,255,0.6)",
//                 }}
//               >
//                 <X size={14} />
//               </button>
//             </div>

//             {/* Split bar — proportional segments per option. Skipped in flat
//                 (debate) mode — there's nothing to split, it's one list. */}
//             {!isFlat && data && totalVotes > 0 && (
//               <div style={{ padding: "12px 18px 0" }}>
//                 <div style={{
//                   display: "flex", borderRadius: 999, overflow: "hidden",
//                   height: 7, background: "rgba(255,255,255,0.06)",
//                 }}>
//                   {options.map((opt, idx) => {
//                     const pct = totalVotes > 0 ? (opt.voters.length / totalVotes) * 100 : 0;
//                     if (pct === 0) return null;
//                     return (
//                       <motion.div
//                         key={opt.key}
//                         initial={{ width: 0 }}
//                         animate={{ width: `${pct}%` }}
//                         transition={{ duration: 0.5, ease: "easeOut" }}
//                         style={{ background: colorFor(idx), height: "100%" }}
//                       />
//                     );
//                   })}
//                 </div>
//                 <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5, flexWrap: "wrap", gap: 4 }}>
//                   {options.map((opt, idx) => {
//                     const pct = totalVotes > 0 ? Math.round((opt.voters.length / totalVotes) * 100) : 0;
//                     return (
//                       <span key={opt.key} style={{ fontSize: 11, fontWeight: 700, color: colorFor(idx) }}>
//                         {pct}%
//                       </span>
//                     );
//                   })}
//                 </div>
//               </div>
//             )}

//             {/* Tab switcher — wraps to a second row when there are more than
//                 a couple options, so N-option predictions stay usable.
//                 Skipped in flat (debate) mode. */}
//             {!isFlat && data && options.length > 0 && (
//               <div style={{ display: "flex", gap: 8, padding: "10px 18px 0", flexWrap: "wrap" }}>
//                 {options.map((opt, idx) => {
//                   const isActive = activeKey === opt.key;
//                   const color = colorFor(idx);
//                   return (
//                     <motion.button
//                       key={opt.key}
//                       whileTap={{ scale: 0.96 }}
//                       onClick={() => setActiveKey(opt.key)}
//                       style={{
//                         flex: options.length <= 2 ? 1 : "1 1 calc(50% - 4px)",
//                         minWidth: options.length <= 2 ? undefined : 100,
//                         padding: "9px 12px",
//                         borderRadius: 12,
//                         border: `1.5px solid ${isActive ? color : "rgba(255,255,255,0.08)"}`,
//                         background: isActive ? `${color}26` : "rgba(255,255,255,0.03)",
//                         color: isActive ? color : "rgba(255,255,255,0.45)",
//                         fontWeight: 700, fontSize: 12,
//                         cursor: "pointer",
//                         transition: "all 0.18s",
//                         display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
//                       }}
//                     >
//                       <span style={{
//                         overflow: "hidden", textOverflow: "ellipsis",
//                         whiteSpace: "nowrap", maxWidth: "100%",
//                       }}>
//                         {opt.label}
//                       </span>
//                       <span style={{
//                         fontSize: 16, fontWeight: 800,
//                         color: isActive ? color : "rgba(255,255,255,0.5)",
//                         fontFamily: "'Bebas Neue', sans-serif",
//                         letterSpacing: "0.03em",
//                       }}>
//                         {opt.voters.length}
//                       </span>
//                     </motion.button>
//                   );
//                 })}
//               </div>
//             )}

//             {/* Voter list */}
//             <div style={{ flex: 1, overflowY: "auto", padding: "12px 18px 24px" }}>

//               {/* Loading */}
//               {loading && (
//                 <div style={{
//                   display: "flex", flexDirection: "column", alignItems: "center",
//                   justifyContent: "center", gap: 12, padding: "40px 0",
//                 }}>
//                   <Loader2 size={24} color="var(--accent-magenta, #e91e8c)"
//                     style={{ animation: "spin 1s linear infinite" }} />
//                   <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>
//                     Loading voters…
//                   </span>
//                   <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
//                 </div>
//               )}

//               {/* Error */}
//               {!loading && error && (
//                 <div style={{
//                   textAlign: "center", padding: "40px 0",
//                   color: "#f87171", fontSize: 13, fontWeight: 600,
//                 }}>
//                   {error}
//                 </div>
//               )}

//               {/* Empty state */}
//               {!loading && !error && data && activeVoters.length === 0 && (
//                 <div style={{
//                   textAlign: "center", padding: "40px 0",
//                   color: "rgba(255,255,255,0.3)", fontSize: 13, fontWeight: 500,
//                 }}>
//                   {isFlat ? "No votes yet" : `No votes for ${activeOption?.label ?? "this option"} yet`}
//                 </div>
//               )}

//               {/* Rows */}
//               {!loading && !error && activeVoters.length > 0 && (
//                 <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
//                   <AnimatePresence mode="wait">
//                     <motion.div
//                       key={isFlat ? "flat" : activeKey}
//                       initial={{ opacity: 0, x: 12 }}
//                       animate={{ opacity: 1, x: 0 }}
//                       exit={{ opacity: 0, x: -12 }}
//                       transition={{ duration: 0.18 }}
//                       style={{ display: "flex", flexDirection: "column", gap: 4 }}
//                     >
//                       {activeVoters.map((voter, idx) => (
//                         <motion.div
//                           key={voter.uid}
//                           initial={{ opacity: 0, y: 8 }}
//                           animate={{ opacity: 1, y: 0 }}
//                           transition={{ delay: idx * 0.03, duration: 0.16 }}
//                           style={{
//                             display: "flex", alignItems: "center", gap: 10,
//                             padding: "9px 10px",
//                             borderRadius: 12,
//                             background: "rgba(255,255,255,0.03)",
//                             border: "1px solid rgba(255,255,255,0.05)",
//                           }}
//                         >
//                           <AvatarWithBadge
//                             username={voter.username}
//                             badge="RISING_FAN"
//                             size="sm"
//                             avatarUrl={voter.avatarUrl}
//                           />
//                           <div style={{ flex: 1, minWidth: 0 }}>
//                             <p style={{
//                               fontWeight: 700, fontSize: 13, color: "#F5F5FA",
//                               overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
//                             }}>
//                               {voter.username}
//                             </p>
//                           </div>
//                           {/* Side/option badge only makes sense when grouped —
//                               omitted entirely in flat (debate) mode per "just
//                               show the username list." */}
//                           {!isFlat && (
//                             <span style={{
//                               fontSize: 10, fontWeight: 800,
//                               padding: "2px 8px", borderRadius: 999,
//                               background: `${activeColor}1F`,
//                               color: activeColor,
//                               border: `1px solid ${activeColor}40`,
//                               whiteSpace: "nowrap",
//                               flexShrink: 0,
//                               maxWidth: 120,
//                               overflow: "hidden",
//                               textOverflow: "ellipsis",
//                             }}>
//                               {activeOption?.label}
//                             </span>
//                           )}
//                         </motion.div>
//                       ))}
//                     </motion.div>
//                   </AnimatePresence>
//                 </div>
//               )}
//             </div>
//           </motion.div>
//         </>
//       )}
//     </AnimatePresence>
//   );
// }




// components/NewROARComponent/components/VotersDialog.tsx
//
// Dialog that shows who voted for each option on a debate or prediction
// post. Visible to everyone in the room. Opens from a "View Votes" button
// on the card. Works for 2-option (debate) and N-option (prediction) posts
// via the generic `options[]` array returned by the voters API.
//
// Both modes now render a single flat list of voters (no tabs, no split
// bar) — each row shows the username plus a small badge for the option
// that fan picked, so "who voted for what" is visible at a glance.

"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import AvatarWithBadge from "./AvatarWithBadge";
import { X, Users, Loader2 } from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────

interface Voter {
  uid: string;
  username: string;
  avatarUrl?: string;
}

interface VoteOption {
  key: string;
  label: string;
  voters: Voter[];
}

interface VotersData {
  // Legacy fields kept for back-compat, no longer read directly by the UI
  sideA?: string;
  sideB?: string;
  options: VoteOption[];
  totalVotes: number;
}

interface VotersDialogProps {
  postId: string;
  roomId?: string; // when present, fetches from the room-scoped voters route
  isOpen: boolean;
  onClose: () => void;
  // Kept for back-compat with existing callers; no longer changes the
  // layout (both modes render the same flat "username + option badge"
  // list), but is still passed through in case future modes need it.
  mode?: "debate" | "prediction";
}

// A small fixed palette cycled across options so any option count gets a
// distinct, consistent color without per-post configuration.
const OPTION_COLORS = ["#e91e8c", "#60a5fa", "#fbbf24", "#22c55e", "#c084fc", "#f97316"];
const colorFor = (idx: number) => OPTION_COLORS[idx % OPTION_COLORS.length];

// A voter merged with which option they picked + that option's color,
// used for the unified flat list rendering (both debate and prediction).
interface FlatVoterRow extends Voter {
  optionLabel: string;
  optionColor: string;
}

// ── VotersDialog ─────────────────────────────────────────────────────────────

export default function VotersDialog({ postId, roomId, isOpen, onClose, mode = "prediction" }: VotersDialogProps) {
  const [data, setData] = useState<VotersData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVoters = useCallback(async () => {
    if (!postId) return;
    setLoading(true);
    setError(null);
    try {
      const url = roomId
        ? `/api/roar/rooms/${roomId}/messages/${postId}/voters`
        : `/api/roar/posts/${postId}/voters`;
      const res = await axios.get(url);
      if (res.data?.success) {
        // Back-compat: older room-less responses may only send
        // sideA/sideB/voters.agree/disagree — normalize into options[].
        const options: VoteOption[] = Array.isArray(res.data.options)
          ? res.data.options
          : [
              { key: "agree", label: res.data.sideA ?? "Side A", voters: res.data.voters?.agree ?? [] },
              { key: "disagree", label: res.data.sideB ?? "Side B", voters: res.data.voters?.disagree ?? [] },
            ];
        const totalVotes = res.data.totalVotes ?? options.reduce((sum, o) => sum + o.voters.length, 0);
        setData({ sideA: res.data.sideA, sideB: res.data.sideB, options, totalVotes });
      } else {
        setError("Failed to load voters");
      }
    } catch (err: any) {
      setError(err?.response?.data?.error ?? "Failed to load voters");
    } finally {
      setLoading(false);
    }
  }, [postId, roomId]);

  useEffect(() => {
    if (isOpen) fetchVoters();
    else {
      // Reset on close so next open starts fresh
      setData(null);
      setError(null);
    }
  }, [isOpen, fetchVoters]);

  const options = data?.options ?? [];
  const totalVotes = data?.totalVotes ?? 0;

  // Unified flat list: every voter across every option, each tagged with
  // the option (label + color) they picked. Deduped by uid (a voter
  // shouldn't appear under two options, but just in case) and sorted
  // alphabetically by username so the list is stable across re-fetches.
  const flatVoters: FlatVoterRow[] = Array.from(
    new Map(
      options.flatMap((opt, idx) =>
        opt.voters.map((v) => [
          v.uid,
          { ...v, optionLabel: opt.label, optionColor: colorFor(idx) } as FlatVoterRow,
        ])
      )
    ).values()
  ).sort((a, b) => a.username.localeCompare(b.username));

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="vd-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{
              position: "fixed", inset: 0, zIndex: 60,
              background: "rgba(0,0,0,0.72)",
              backdropFilter: "blur(4px)",
              WebkitBackdropFilter: "blur(4px)",
            }}
          />

          {/* Panel */}
          <motion.div
            key="vd-panel"
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.97 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "fixed",
              bottom: 0, left: 0, right: 0,
              zIndex: 61,
              maxWidth: 480,
              margin: "0 auto",
              background: "linear-gradient(160deg, #16161e 0%, #1a1a26 100%)",
              borderRadius: "24px 24px 0 0",
              border: "1px solid rgba(255,255,255,0.08)",
              borderBottom: "none",
              boxShadow: "0 -8px 40px rgba(0,0,0,0.6)",
              overflow: "hidden",
              maxHeight: "75vh",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Drag pill */}
            <div style={{ display: "flex", justifyContent: "center", paddingTop: 10, paddingBottom: 4 }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.15)" }} />
            </div>

            {/* Header */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "10px 18px 14px",
              borderBottom: "1px solid rgba(255,255,255,0.07)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Users size={16} color="var(--accent-magenta, #e91e8c)" />
                <span style={{ fontWeight: 800, fontSize: 15, color: "#fff" }}>Who Voted</span>
                {totalVotes > 0 && (
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: "2px 8px",
                    borderRadius: 999,
                    background: "rgba(233,30,140,0.12)",
                    color: "var(--accent-magenta, #e91e8c)",
                    border: "1px solid rgba(233,30,140,0.25)",
                  }}>
                    {totalVotes} vote{totalVotes !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "50%",
                  width: 30, height: 30,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", color: "rgba(255,255,255,0.6)",
                }}
              >
                <X size={14} />
              </button>
            </div>

            {/* Voter list — single flat list, each row shows the option
                the fan picked as a badge next to their name. */}
            <div style={{ flex: 1, overflowY: "auto", padding: "12px 18px 24px" }}>

              {/* Loading */}
              {loading && (
                <div style={{
                  display: "flex", flexDirection: "column", alignItems: "center",
                  justifyContent: "center", gap: 12, padding: "40px 0",
                }}>
                  <Loader2 size={24} color="var(--accent-magenta, #e91e8c)"
                    style={{ animation: "spin 1s linear infinite" }} />
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>
                    Loading voters…
                  </span>
                  <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
              )}

              {/* Error */}
              {!loading && error && (
                <div style={{
                  textAlign: "center", padding: "40px 0",
                  color: "#f87171", fontSize: 13, fontWeight: 600,
                }}>
                  {error}
                </div>
              )}

              {/* Empty state */}
              {!loading && !error && data && flatVoters.length === 0 && (
                <div style={{
                  textAlign: "center", padding: "40px 0",
                  color: "rgba(255,255,255,0.3)", fontSize: 13, fontWeight: 500,
                }}>
                  No votes yet
                </div>
              )}

              {/* Rows */}
              {!loading && !error && flatVoters.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {flatVoters.map((voter, idx) => (
                    <motion.div
                      key={voter.uid}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03, duration: 0.16 }}
                      style={{
                        display: "flex", alignItems: "center", gap: 10,
                        padding: "9px 10px",
                        borderRadius: 12,
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.05)",
                      }}
                    >
                      <AvatarWithBadge
                        username={voter.username}
                        badge="RISING_FAN"
                        size="sm"
                        avatarUrl={voter.avatarUrl}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{
                          fontWeight: 700, fontSize: 13, color: "#F5F5FA",
                          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        }}>
                          {voter.username}
                        </p>
                      </div>
                      {/* Option they voted for, shown next to the username */}
                      <span style={{
                        fontSize: 10, fontWeight: 800,
                        padding: "2px 8px", borderRadius: 999,
                        background: `${voter.optionColor}1F`,
                        color: voter.optionColor,
                        border: `1px solid ${voter.optionColor}40`,
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                        maxWidth: 140,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}>
                        {voter.optionLabel}
                      </span>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}