// // components/NewROARComponent/components/ReactionPicker.tsx
// // Hover over the like button → floating reaction bar with 5 options.
// // Selecting one fires onReact(reaction). Clicking the active reaction removes it.

// import { useState, useRef, useEffect, useCallback } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { Heart } from "lucide-react";
// import { usePostHog } from "posthog-js/react";

// export type Reaction = "heart" | "fire" | "laugh" | "sad" | "thumb";

// export const REACTIONS: { id: Reaction; emoji: string; label: string }[] = [
//   { id: "heart", emoji: "❤️", label: "Love" },
//   { id: "fire",  emoji: "🔥", label: "Fire" },
//   { id: "laugh", emoji: "😂", label: "Haha" },
//   { id: "sad",   emoji: "😢", label: "Sad"  },
//   { id: "thumb", emoji: "👍", label: "Like" },
// ];

// export function reactionEmoji(r: Reaction | null | undefined): string {
//   if (!r) return "♡";
//   return REACTIONS.find((x) => x.id === r)?.emoji ?? "❤️";
// }

// interface Props {
//   currentReaction: Reaction | null;
//   count: number;
//   onReact: (r: Reaction | null) => void;
//   disabled?: boolean;
//   postId?: string;
//   roomId?: string;
//   roomName?: string;
// }

// export default function ReactionPicker({ currentReaction, count, onReact, disabled, postId, roomId, roomName }: Props) {
//   const phog = usePostHog();
//   const [open, setOpen] = useState(false);
//   const [hovered, setHovered] = useState<Reaction | null>(null);
//   const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
//   const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
//   const containerRef = useRef<HTMLDivElement>(null);
//   const isTouchDevice = () => window.matchMedia("(hover: none)").matches;


//   const scheduleOpen = useCallback(() => {
//     if (closeTimer.current) { clearTimeout(closeTimer.current); closeTimer.current = null; }
//     hoverTimer.current = setTimeout(() => {
//       setOpen(true);
//       if (phog) {
//         phog.capture("open_reaction", { post_id: postId, room_id: roomId, room_name: roomName || "" });
//       }
//     }, 280);
//   }, [phog, postId, roomId, roomName]);

//   const scheduleClose = useCallback(() => {
//     if (hoverTimer.current) { clearTimeout(hoverTimer.current); hoverTimer.current = null; }
//     closeTimer.current = setTimeout(() => { setOpen(false); setHovered(null); }, 350);
//   }, []);

//   const cancelClose = useCallback(() => {
//     if (closeTimer.current) { clearTimeout(closeTimer.current); closeTimer.current = null; }
//   }, []);

//   useEffect(() => () => {
//     if (hoverTimer.current) clearTimeout(hoverTimer.current);
//     if (closeTimer.current) clearTimeout(closeTimer.current);
//   }, []);

//   // const handleMainClick = (e: React.MouseEvent) => {
//   //   e.stopPropagation();
//   //   if (open) { setOpen(false); return; }
//   //   if (disabled) return;
//   //   if (currentReaction) { onReact(null); } // toggle off
//   //   else { onReact("heart"); } // default quick-tap = heart
//   // };

//   const handleMainClick = (e: React.MouseEvent) => {
//     e.stopPropagation();
//     if (disabled) return;

//     if (isTouchDevice()) {
//       // Mobile: first tap opens picker, picker selection reacts,
//       // tapping active reaction undoes it
//       if (open) {
//         setOpen(false);
//         return;
//       }
//       if (currentReaction) {
//         // Already reacted — undo on tap
//         onReact(null);
//         return;
//       }
//       // No reaction yet — open picker
//       setOpen(true);
//       return;
//     }

//     // Desktop fallback (shouldn't normally reach here since hover handles it)
//     if (open) { setOpen(false); return; }
//     if (currentReaction) { onReact(null); }
//     else { onReact("heart"); }
//   };

//   const handleReactSelect = (e: React.MouseEvent, r: Reaction) => {
//     e.stopPropagation();
//     onReact(currentReaction === r ? null : r);
//     setOpen(false);
//     setHovered(null);
//   };

//   const active = currentReaction !== null;
//   const displayEmoji = reactionEmoji(currentReaction);

//   return (
//     <div
//       ref={containerRef}
//       style={{ position: "relative", display: "inline-flex", alignItems: "center" }}
//       onMouseEnter={scheduleOpen}
//       onMouseLeave={scheduleClose}
//     >
//       {/* ── Reaction popover ── */}
//       <AnimatePresence>
//         {open && (
//           <motion.div
//             key="picker"
//             initial={{ opacity: 0, y: 6, scale: 0.85 }}
//             animate={{ opacity: 1, y: 0, scale: 1 }}
//             exit={{ opacity: 0, y: 6, scale: 0.85 }}
//             transition={{ duration: 0.18, ease: [0.34, 1.56, 0.64, 1] }}
//             onMouseEnter={cancelClose}
//             onMouseLeave={scheduleClose}
//             onClick={(e) => e.stopPropagation()}
//             style={{
//               position: "absolute",
//               bottom: "calc(100% + 10px)",
//               left: "50%",
//               transform: "translateX(-50%)",
//               display: "flex",
//               gap: 4,
//               padding: "8px 10px",
//               borderRadius: 999,
//               background: "rgba(22,22,32,0.97)",
//               border: "1px solid rgba(255,255,255,0.12)",
//               boxShadow: "0 8px 32px rgba(0,0,0,0.55), 0 1px 0 rgba(255,255,255,0.06) inset",
//               backdropFilter: "blur(16px)",
//               WebkitBackdropFilter: "blur(16px)",
//               zIndex: 200,
//               whiteSpace: "nowrap",
//             }}
//           >
//             {/* Arrow */}
//             <div style={{
//               position: "absolute", bottom: -5, left: "50%", transform: "translateX(-50%)",
//               width: 10, height: 10, background: "rgba(22,22,32,0.97)",
//               border: "1px solid rgba(255,255,255,0.12)", borderTop: "none", borderLeft: "none",
//               rotate: "45deg",
//             }} />

//             {REACTIONS.map((r, idx) => {
//               const isActive = currentReaction === r.id;
//               const isHov = hovered === r.id;
//               return (
//                 <motion.button
//                   key={r.id}
//                   initial={{ opacity: 0, y: 8, scale: 0.6 }}
//                   animate={{ opacity: 1, y: 0, scale: 1 }}
//                   transition={{ delay: idx * 0.03, type: "spring", stiffness: 400, damping: 20 }}
//                   whileHover={{ scale: 1.35, y: -4 }}
//                   whileTap={{ scale: 0.9 }}
//                   onHoverStart={() => setHovered(r.id)}
//                   onHoverEnd={() => setHovered(null)}
//                   onClick={(e) => handleReactSelect(e, r.id)}
//                   title={r.label}
//                   style={{
//                     background: isActive ? "rgba(233,30,140,0.18)" : "none",
//                     border: isActive ? "1px solid rgba(233,30,140,0.35)" : "1px solid transparent",
//                     borderRadius: "50%",
//                     width: 38, height: 38,
//                     display: "flex", alignItems: "center", justifyContent: "center",
//                     cursor: "pointer",
//                     fontSize: isHov ? 24 : 20,
//                     transition: "font-size 0.12s, background 0.15s",
//                     flexShrink: 0,
//                     position: "relative",
//                   }}
//                 >
//                   {r.emoji}
//                   {/* Label tooltip */}
//                   <AnimatePresence>
//                     {isHov && (
//                       <motion.span
//                         initial={{ opacity: 0, y: 4, scale: 0.8 }}
//                         animate={{ opacity: 1, y: 0, scale: 1 }}
//                         exit={{ opacity: 0 }}
//                         style={{
//                           position: "absolute", bottom: "calc(100% + 6px)",
//                           left: "50%", transform: "translateX(-50%)",
//                           fontSize: 10, fontWeight: 700, color: "#fff",
//                           background: "rgba(0,0,0,0.75)", borderRadius: 6,
//                           padding: "2px 6px", whiteSpace: "nowrap", pointerEvents: "none",
//                         }}
//                       >
//                         {r.label}
//                       </motion.span>
//                     )}
//                   </AnimatePresence>
//                 </motion.button>
//               );
//             })}
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* ── Main button ── */}
//       <motion.button
//         whileTap={{ scale: 0.88 }}
//         onClick={handleMainClick}
//         style={{
//           display: "flex", alignItems: "center", gap: 6,
//           background: "none", border: "none", cursor: disabled ? "default" : "pointer",
//           color: active ? "#ff4a7d" : "#9494ad",
//           fontSize: 13, fontWeight: 600,
//           padding: "2px 0",
//           userSelect: "none",
//         }}
//       >
//         <motion.span
//           key={displayEmoji}
//           initial={{ scale: 1.5, rotate: -10 }}
//           animate={{ scale: 1, rotate: 0 }}
//           transition={{ type: "spring", stiffness: 400, damping: 18 }}
//           style={{ fontSize: 16, lineHeight: 1, display: "inline-block" }}
//         >
//           {active ? displayEmoji : <Heart size={18} strokeWidth={2} />}
//         </motion.span>
//         <span>{count > 0 ? count : ""}</span>
//       </motion.button>
//     </div>
//   );
// }





// // components/NewROARComponent/components/ReactionPicker.tsx
// // Hover/tap the like button → floating reaction bar with 5 options.
// // Selecting one fires onReact(reaction). Clicking the active reaction removes it.
// // Popover auto-clamps to stay inside the nearest scrollable/clipping ancestor
// // so it never gets cut off near screen or container edges (e.g. comments list).
// //
// // IMPORTANT: positioning uses plain pixel `left`, never `transform`, because
// // Framer Motion's `motion.div` writes its own `transform` for the scale/y
// // entrance animation — any manual transform we set gets silently clobbered
// // the moment the animation starts.

// import { useState, useRef, useEffect, useLayoutEffect, useCallback } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { Heart } from "lucide-react";
// import { usePostHog } from "posthog-js/react";

// export type Reaction = "heart" | "fire" | "laugh" | "sad" | "thumb";

// export const REACTIONS: { id: Reaction; emoji: string; label: string }[] = [
//   { id: "heart", emoji: "❤️", label: "Love" },
//   { id: "fire",  emoji: "🔥", label: "Fire" },
//   { id: "laugh", emoji: "😂", label: "Haha" },
//   { id: "sad",   emoji: "😢", label: "Sad"  },
//   { id: "thumb", emoji: "👍", label: "Like" },
// ];

// export function reactionEmoji(r: Reaction | null | undefined): string {
//   if (!r) return "♡";
//   return REACTIONS.find((x) => x.id === r)?.emoji ?? "❤️";
// }

// interface Props {
//   currentReaction: Reaction | null;
//   count: number;
//   onReact: (r: Reaction | null) => void;
//   disabled?: boolean;
//   postId?: string;
//   roomId?: string;
//   roomName?: string;
// }

// // Finds the nearest ancestor that actually clips content (overflow
// // hidden/auto/scroll on the x axis). Falls back to the window width.
// function getClippingRect(el: HTMLElement | null): { left: number; right: number } {
//   let node = el?.parentElement ?? null;
//   while (node) {
//     const style = window.getComputedStyle(node);
//     const clipsX = /(hidden|auto|scroll)/.test(style.overflowX);
//     if (clipsX) {
//       const r = node.getBoundingClientRect();
//       return { left: r.left, right: r.right };
//     }
//     node = node.parentElement;
//   }
//   return { left: 0, right: window.innerWidth };
// }

// export default function ReactionPicker({ currentReaction, count, onReact, disabled, postId, roomId, roomName }: Props) {
//   const phog = usePostHog();
//   const [open, setOpen] = useState(false);
//   const [hovered, setHovered] = useState<Reaction | null>(null);
//   const [leftPx, setLeftPx] = useState<number | null>(null);
//   const [arrowLeftPx, setArrowLeftPx] = useState<number | null>(null);
//   const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
//   const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
//   const containerRef = useRef<HTMLDivElement>(null);
//   const isTouchDevice = () => window.matchMedia("(hover: none)").matches;
//   const isSmallScreen = () => window.innerWidth < 420;

//   const scheduleOpen = useCallback(() => {
//     if (isTouchDevice()) return; // touch uses tap-to-open in handleMainClick, not hover
//     if (closeTimer.current) { clearTimeout(closeTimer.current); closeTimer.current = null; }
//     hoverTimer.current = setTimeout(() => {
//       setLeftPx(null);
//       setArrowLeftPx(null);
//       setOpen(true);
//       if (phog) {
//         phog.capture("open_reaction", { post_id: postId, room_id: roomId, room_name: roomName || "" });
//       }
//     }, 280);
//   }, [phog, postId, roomId, roomName]);

//   const scheduleClose = useCallback(() => {
//     if (isTouchDevice()) return; // touch closes only via outside-tap or emoji select (see effect below)
//     if (hoverTimer.current) { clearTimeout(hoverTimer.current); hoverTimer.current = null; }
//     closeTimer.current = setTimeout(() => { setOpen(false); setHovered(null); }, 350);
//   }, []);

//   const cancelClose = useCallback(() => {
//     if (closeTimer.current) { clearTimeout(closeTimer.current); closeTimer.current = null; }
//   }, []);

//   useEffect(() => () => {
//     if (hoverTimer.current) clearTimeout(hoverTimer.current);
//     if (closeTimer.current) clearTimeout(closeTimer.current);
//   }, []);

//   // Touch devices: mobile browsers often synthesize a `mouseleave` right
//   // after `touchend`, which was triggering scheduleClose() and silently
//   // closing the picker a few hundred ms after it opened — even though the
//   // user never tapped away. scheduleClose() is now a no-op on touch (see
//   // above), and instead we close ONLY when the user taps outside the
//   // picker, or selects an emoji (handled in handleReactSelect).
//   useEffect(() => {
//     if (!open || !isTouchDevice()) return;
//     const handleOutside = (e: MouseEvent | TouchEvent) => {
//       if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
//         setOpen(false);
//         setHovered(null);
//       }
//     };
//     // Defer attaching the listener so the very tap that opened the picker
//     // doesn't also register as the "outside tap" that closes it.
//     const id = setTimeout(() => {
//       document.addEventListener("touchstart", handleOutside, true);
//       document.addEventListener("click", handleOutside, true);
//     }, 0);
//     return () => {
//       clearTimeout(id);
//       document.removeEventListener("touchstart", handleOutside, true);
//       document.removeEventListener("click", handleOutside, true);
//     };
//   }, [open]);

//   // Compute the popover's real width ANALYTICALLY (padding + 5 buttons +
//   // gaps) rather than measuring the animated DOM node. Framer Motion's
//   // initial scale (0.85) makes getBoundingClientRect() return a shrunk,
//   // wrong-sized rect at the exact moment this effect would otherwise run.
//   //
//   // Positioning is done with plain pixel `left` (relative to the popover's
//   // own offset parent, which is `containerRef`), never `transform` —
//   // Framer Motion owns `transform` for its scale/y entrance animation and
//   // will silently overwrite any manual transform we set.
//   useLayoutEffect(() => {
//     if (!open || !containerRef.current) return;
//     const PADDING = 8;

//     const small = isSmallScreen();
//     const btnSize = small ? 32 : 38;
//     const gap = small ? 2 : 4;
//     const padX = small ? 6 : 10;
//     const popoverWidth = padX * 2 + btnSize * 5 + gap * 4;

//     const btnRect = containerRef.current.getBoundingClientRect();
//     const btnCenter = btnRect.left + btnRect.width / 2;

//     // Desired popover left/right in VIEWPORT coordinates, centered on the button
//     let desiredLeft = btnCenter - popoverWidth / 2;
//     const desiredRight = desiredLeft + popoverWidth;

//     const clip = getClippingRect(containerRef.current);

//     if (desiredLeft < clip.left + PADDING) {
//       desiredLeft = clip.left + PADDING;
//     } else if (desiredRight > clip.right - PADDING) {
//       desiredLeft = (clip.right - PADDING) - popoverWidth;
//     }

//     // Convert back to a position relative to containerRef (the popover's
//     // positioned ancestor), since `left` on an absolutely positioned child
//     // is relative to its own offset parent, not the viewport.
//     const relativeLeft = desiredLeft - btnRect.left;
//     setLeftPx(relativeLeft);

//     // Arrow should still point at the button's horizontal center,
//     // relative to the popover's own left edge.
//     setArrowLeftPx(btnCenter - desiredLeft);
//   }, [open]);

//   const handleMainClick = (e: React.MouseEvent) => {
//     e.stopPropagation();
//     if (disabled) return;

//     if (isTouchDevice()) {
//       // Mobile: first tap opens picker, picker selection reacts,
//       // tapping active reaction undoes it
//       if (open) {
//         setOpen(false);
//         return;
//       }
//       if (currentReaction) {
//         // Already reacted — undo on tap
//         onReact(null);
//         return;
//       }
//       // No reaction yet — open picker
//       setLeftPx(null);
//       setArrowLeftPx(null);
//       setOpen(true);
//       return;
//     }

//     // Desktop fallback (shouldn't normally reach here since hover handles it)
//     if (open) { setOpen(false); return; }
//     if (currentReaction) { onReact(null); }
//     else { onReact("heart"); }
//   };

//   const handleReactSelect = (e: React.MouseEvent, r: Reaction) => {
//     e.stopPropagation();
//     onReact(currentReaction === r ? null : r);
//     setOpen(false);
//     setHovered(null);
//   };

//   const active = currentReaction !== null;
//   const displayEmoji = reactionEmoji(currentReaction);
//   const small = isSmallScreen();
//   const btnSize = small ? 32 : 38;
//   const btnFont = small ? 17 : 20;
//   const btnFontHover = small ? 20 : 24;
//   const gap = small ? 2 : 4;
//   const padX = small ? 6 : 10;
//   const padY = small ? 6 : 8;

//   return (
//     <div
//       ref={containerRef}
//       style={{ position: "relative", display: "inline-flex", alignItems: "center" }}
//       onMouseEnter={scheduleOpen}
//       onMouseLeave={scheduleClose}
//     >
//       {/* ── Reaction popover ── */}
//       <AnimatePresence>
//         {open && (
//           <motion.div
//             key="picker"
//             initial={{ opacity: 0, y: 6, scale: 0.85 }}
//             animate={{ opacity: 1, y: 0, scale: 1 }}
//             exit={{ opacity: 0, y: 6, scale: 0.85 }}
//             transition={{ duration: 0.18, ease: [0.34, 1.56, 0.64, 1] }}
//             onMouseEnter={cancelClose}
//             onMouseLeave={scheduleClose}
//             onClick={(e) => e.stopPropagation()}
//             style={{
//               position: "absolute",
//               bottom: "calc(100% + 10px)",
//               left: leftPx ?? "50%",
//               // No manual transform here — Framer Motion owns `transform`
//               // for the scale/y entrance animation and will overwrite it.
//               display: "flex",
//               gap,
//               padding: `${padY}px ${padX}px`,
//               borderRadius: 999,
//               background: "rgba(22,22,32,0.97)",
//               border: "1px solid rgba(255,255,255,0.12)",
//               boxShadow: "0 8px 32px rgba(0,0,0,0.55), 0 1px 0 rgba(255,255,255,0.06) inset",
//               backdropFilter: "blur(16px)",
//               WebkitBackdropFilter: "blur(16px)",
//               zIndex: 200,
//               whiteSpace: "nowrap",
//               maxWidth: "calc(100vw - 16px)", // hard safety net
//               visibility: leftPx === null ? "hidden" : "visible", // avoid flash at wrong position on first frame
//             }}
//           >
//             {/* Arrow — points at the actual button regardless of shift */}
//             <div style={{
//               position: "absolute", bottom: -5,
//               left: arrowLeftPx ?? "50%",
//               marginLeft: -5, // center the 10px arrow on its left position
//               width: 10, height: 10, background: "rgba(22,22,32,0.97)",
//               border: "1px solid rgba(255,255,255,0.12)", borderTop: "none", borderLeft: "none",
//               rotate: "45deg",
//             }} />

//             {REACTIONS.map((r, idx) => {
//               const isActive = currentReaction === r.id;
//               const isHov = hovered === r.id;
//               return (
//                 <motion.button
//                   key={r.id}
//                   initial={{ opacity: 0, y: 8, scale: 0.6 }}
//                   animate={{ opacity: 1, y: 0, scale: 1 }}
//                   transition={{ delay: idx * 0.03, type: "spring", stiffness: 400, damping: 20 }}
//                   whileHover={{ scale: 1.35, y: -4 }}
//                   whileTap={{ scale: 0.9 }}
//                   onHoverStart={() => setHovered(r.id)}
//                   onHoverEnd={() => setHovered(null)}
//                   onClick={(e) => handleReactSelect(e, r.id)}
//                   title={r.label}
//                   style={{
//                     background: isActive ? "rgba(233,30,140,0.18)" : "none",
//                     border: isActive ? "1px solid rgba(233,30,140,0.35)" : "1px solid transparent",
//                     borderRadius: "50%",
//                     width: btnSize, height: btnSize,
//                     display: "flex", alignItems: "center", justifyContent: "center",
//                     cursor: "pointer",
//                     fontSize: isHov ? btnFontHover : btnFont,
//                     transition: "font-size 0.12s, background 0.15s",
//                     flexShrink: 0,
//                     position: "relative",
//                   }}
//                 >
//                   {r.emoji}
//                   {/* Label tooltip */}
//                   <AnimatePresence>
//                     {isHov && (
//                       <motion.span
//                         initial={{ opacity: 0, y: 4, scale: 0.8 }}
//                         animate={{ opacity: 1, y: 0, scale: 1 }}
//                         exit={{ opacity: 0 }}
//                         style={{
//                           position: "absolute", bottom: "calc(100% + 6px)",
//                           left: "50%", transform: "translateX(-50%)",
//                           fontSize: 10, fontWeight: 700, color: "#fff",
//                           background: "rgba(0,0,0,0.75)", borderRadius: 6,
//                           padding: "2px 6px", whiteSpace: "nowrap", pointerEvents: "none",
//                         }}
//                       >
//                         {r.label}
//                       </motion.span>
//                     )}
//                   </AnimatePresence>
//                 </motion.button>
//               );
//             })}
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* ── Main button ── */}
//       <motion.button
//         whileTap={{ scale: 0.88 }}
//         onClick={handleMainClick}
//         style={{
//           display: "flex", alignItems: "center", gap: 6,
//           background: "none", border: "none", cursor: disabled ? "default" : "pointer",
//           color: active ? "#ff4a7d" : "#9494ad",
//           fontSize: 10, fontWeight: 600,
//           padding: "2px 0",
//           userSelect: "none",
//         }}
//       >
//         <motion.span
//           key={displayEmoji}
//           initial={{ scale: 1.5, rotate: -10 }}
//           animate={{ scale: 1, rotate: 0 }}
//           transition={{ type: "spring", stiffness: 400, damping: 18 }}
//           style={{ fontSize: 12, lineHeight: 1, display: "inline-block" }}
//         >
//           {active ? displayEmoji : <Heart size={12} strokeWidth={2} />}
//         </motion.span>
//         <span>{count > 0 ? count : ""}</span>
//       </motion.button>
//     </div>
//   );
// }




// components/NewROARComponent/components/ReactionPicker.tsx
// Hover/tap the like button → floating reaction bar with 5 options.
// Selecting one fires onReact(reaction). Clicking the active reaction removes it.
// Popover auto-clamps to stay inside the nearest scrollable/clipping ancestor
// so it never gets cut off near screen or container edges (e.g. comments list).
//
// IMPORTANT: positioning uses plain pixel `left`, never `transform`, because
// Framer Motion's `motion.div` writes its own `transform` for the scale/y
// entrance animation — any manual transform we set gets silently clobbered
// the moment the animation starts.

import { useState, useRef, useEffect, useLayoutEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart } from "lucide-react";
import { usePostHog } from "posthog-js/react";

export type Reaction = "heart" | "fire" | "laugh" | "sad" | "thumb";

export const REACTIONS: { id: Reaction; emoji: string; label: string }[] = [
  { id: "heart", emoji: "❤️", label: "Love" },
  { id: "fire",  emoji: "🔥", label: "Fire" },
  { id: "laugh", emoji: "😂", label: "Haha" },
  { id: "sad",   emoji: "😢", label: "Sad"  },
  { id: "thumb", emoji: "👍", label: "Like" },
];

export function reactionEmoji(r: Reaction | null | undefined): string {
  if (!r) return "♡";
  return REACTIONS.find((x) => x.id === r)?.emoji ?? "❤️";
}

interface Props {
  currentReaction: Reaction | null;
  count: number;
  onReact: (r: Reaction | null) => void;
  disabled?: boolean;
  postId?: string;
  roomId?: string;
  roomName?: string;
}

// Finds the nearest ancestor that actually clips content (overflow
// hidden/auto/scroll on the x axis). Falls back to the window width.
function getClippingRect(el: HTMLElement | null): { left: number; right: number } {
  let node = el?.parentElement ?? null;
  while (node) {
    const style = window.getComputedStyle(node);
    const clipsX = /(hidden|auto|scroll)/.test(style.overflowX);
    if (clipsX) {
      const r = node.getBoundingClientRect();
      return { left: r.left, right: r.right };
    }
    node = node.parentElement;
  }
  return { left: 0, right: window.innerWidth };
}

export default function ReactionPicker({ currentReaction, count, onReact, disabled, postId, roomId, roomName }: Props) {
  const phog = usePostHog();
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState<Reaction | null>(null);
  const [leftPx, setLeftPx] = useState<number | null>(null);
  const [arrowLeftPx, setArrowLeftPx] = useState<number | null>(null);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isTouchDevice = () => window.matchMedia("(hover: none)").matches;
  const isSmallScreen = () => window.innerWidth < 420;

  const scheduleOpen = useCallback(() => {
    if (isTouchDevice()) return; // touch uses tap-to-open in handleMainClick, not hover
    if (closeTimer.current) { clearTimeout(closeTimer.current); closeTimer.current = null; }
    hoverTimer.current = setTimeout(() => {
      setLeftPx(null);
      setArrowLeftPx(null);
      setOpen(true);
      if (phog) {
        phog.capture("open_reaction", { post_id: postId, room_id: roomId, room_name: roomName || "" });
      }
    }, 280);
  }, [phog, postId, roomId, roomName]);

  const scheduleClose = useCallback(() => {
    if (isTouchDevice()) return; // touch closes only via outside-tap or emoji select (see effect below)
    if (hoverTimer.current) { clearTimeout(hoverTimer.current); hoverTimer.current = null; }
    closeTimer.current = setTimeout(() => { setOpen(false); setHovered(null); }, 350);
  }, []);

  const cancelClose = useCallback(() => {
    if (closeTimer.current) { clearTimeout(closeTimer.current); closeTimer.current = null; }
  }, []);

  useEffect(() => () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }, []);

  // Touch devices: mobile browsers often synthesize a `mouseleave` right
  // after `touchend`, which was triggering scheduleClose() and silently
  // closing the picker a few hundred ms after it opened — even though the
  // user never tapped away. scheduleClose() is now a no-op on touch (see
  // above), and instead we close ONLY when the user taps outside the
  // picker, or selects an emoji (handled in handleReactSelect).
  useEffect(() => {
    if (!open || !isTouchDevice()) return;
    const handleOutside = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setHovered(null);
      }
    };
    // Defer attaching the listener so the very tap that opened the picker
    // doesn't also register as the "outside tap" that closes it.
    const id = setTimeout(() => {
      document.addEventListener("touchstart", handleOutside, true);
      document.addEventListener("click", handleOutside, true);
    }, 0);
    return () => {
      clearTimeout(id);
      document.removeEventListener("touchstart", handleOutside, true);
      document.removeEventListener("click", handleOutside, true);
    };
  }, [open]);

  // Compute the popover's real width ANALYTICALLY (padding + 5 buttons +
  // gaps) rather than measuring the animated DOM node. Framer Motion's
  // initial scale (0.85) makes getBoundingClientRect() return a shrunk,
  // wrong-sized rect at the exact moment this effect would otherwise run.
  //
  // Positioning is done with plain pixel `left` (relative to the popover's
  // own offset parent, which is `containerRef`), never `transform` —
  // Framer Motion owns `transform` for its scale/y entrance animation and
  // will silently overwrite any manual transform we set.
  useLayoutEffect(() => {
    if (!open || !containerRef.current) return;
    const PADDING = 8;

    const small = isSmallScreen();
    const btnSize = small ? 32 : 38;
    const gap = small ? 2 : 4;
    const padX = small ? 6 : 10;
    const popoverWidth = padX * 2 + btnSize * 5 + gap * 4;

    const btnRect = containerRef.current.getBoundingClientRect();
    const btnCenter = btnRect.left + btnRect.width / 2;

    // Desired popover left/right in VIEWPORT coordinates, centered on the button
    let desiredLeft = btnCenter - popoverWidth / 2;
    const desiredRight = desiredLeft + popoverWidth;

    const clip = getClippingRect(containerRef.current);

    if (desiredLeft < clip.left + PADDING) {
      desiredLeft = clip.left + PADDING;
    } else if (desiredRight > clip.right - PADDING) {
      desiredLeft = (clip.right - PADDING) - popoverWidth;
    }

    // Convert back to a position relative to containerRef (the popover's
    // positioned ancestor), since `left` on an absolutely positioned child
    // is relative to its own offset parent, not the viewport.
    const relativeLeft = desiredLeft - btnRect.left;
    setLeftPx(relativeLeft);

    // Arrow should still point at the button's horizontal center,
    // relative to the popover's own left edge.
    setArrowLeftPx(btnCenter - desiredLeft);
  }, [open]);

  const handleMainClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;

    if (isTouchDevice()) {
      // Mobile: first tap opens picker, picker selection reacts,
      // tapping active reaction undoes it
      if (open) {
        setOpen(false);
        return;
      }
      if (currentReaction) {
        // Already reacted — undo on tap
        onReact(null);
        return;
      }
      // No reaction yet — open picker
      setLeftPx(null);
      setArrowLeftPx(null);
      setOpen(true);
      return;
    }

    // Desktop: click now opens the picker immediately instead of instantly
    // reacting with "heart" — removes dependency on the 280ms hover delay.
    if (open) { setOpen(false); return; }
    if (currentReaction) { onReact(null); return; }

    setLeftPx(null);
    setArrowLeftPx(null);
    setOpen(true);
  };

  const handleReactSelect = (e: React.MouseEvent, r: Reaction) => {
    e.stopPropagation();
    onReact(currentReaction === r ? null : r);
    setOpen(false);
    setHovered(null);
  };

  const active = currentReaction !== null;
  const displayEmoji = reactionEmoji(currentReaction);
  const small = isSmallScreen();
  const btnSize = small ? 32 : 38;
  const btnFont = small ? 17 : 20;
  const btnFontHover = small ? 20 : 24;
  const gap = small ? 2 : 4;
  const padX = small ? 6 : 10;
  const padY = small ? 6 : 8;

  return (
    <div
      ref={containerRef}
      style={{ position: "relative", display: "inline-flex", alignItems: "center" }}
      onMouseEnter={scheduleOpen}
      onMouseLeave={scheduleClose}
    >
      {/* ── Reaction popover ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="picker"
            initial={{ opacity: 0, y: 6, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.85 }}
            transition={{ duration: 0.18, ease: [0.34, 1.56, 0.64, 1] }}
            onMouseEnter={cancelClose}
            onMouseLeave={scheduleClose}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "absolute",
              bottom: "calc(100% + 10px)",
              left: leftPx ?? "50%",
              // No manual transform here — Framer Motion owns `transform`
              // for the scale/y entrance animation and will overwrite it.
              display: "flex",
              gap,
              padding: `${padY}px ${padX}px`,
              borderRadius: 999,
              background: "rgba(22,22,32,0.97)",
              border: "1px solid rgba(255,255,255,0.12)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.55), 0 1px 0 rgba(255,255,255,0.06) inset",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              zIndex: 200,
              whiteSpace: "nowrap",
              maxWidth: "calc(100vw - 16px)", // hard safety net
              visibility: leftPx === null ? "hidden" : "visible", // avoid flash at wrong position on first frame
            }}
          >
            {/* Arrow — points at the actual button regardless of shift */}
            <div style={{
              position: "absolute", bottom: -5,
              left: arrowLeftPx ?? "50%",
              marginLeft: -5, // center the 10px arrow on its left position
              width: 10, height: 10, background: "rgba(22,22,32,0.97)",
              border: "1px solid rgba(255,255,255,0.12)", borderTop: "none", borderLeft: "none",
              rotate: "45deg",
            }} />

            {REACTIONS.map((r, idx) => {
              const isActive = currentReaction === r.id;
              const isHov = hovered === r.id;
              return (
                <motion.button
                  key={r.id}
                  initial={{ opacity: 0, y: 8, scale: 0.6 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: idx * 0.03, type: "spring", stiffness: 400, damping: 20 }}
                  whileHover={{ scale: 1.35, y: -4 }}
                  whileTap={{ scale: 0.9 }}
                  onHoverStart={() => setHovered(r.id)}
                  onHoverEnd={() => setHovered(null)}
                  onClick={(e) => handleReactSelect(e, r.id)}
                  title={r.label}
                  style={{
                    background: isActive ? "rgba(233,30,140,0.18)" : "none",
                    border: isActive ? "1px solid rgba(233,30,140,0.35)" : "1px solid transparent",
                    borderRadius: "50%",
                    width: btnSize, height: btnSize,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer",
                    fontSize: isHov ? btnFontHover : btnFont,
                    transition: "font-size 0.12s, background 0.15s",
                    flexShrink: 0,
                    position: "relative",
                  }}
                >
                  {r.emoji}
                  {/* Label tooltip */}
                  <AnimatePresence>
                    {isHov && (
                      <motion.span
                        initial={{ opacity: 0, y: 4, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                          position: "absolute", bottom: "calc(100% + 6px)",
                          left: "50%", transform: "translateX(-50%)",
                          fontSize: 10, fontWeight: 700, color: "#fff",
                          background: "rgba(0,0,0,0.75)", borderRadius: 6,
                          padding: "2px 6px", whiteSpace: "nowrap", pointerEvents: "none",
                        }}
                      >
                        {r.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main button ── */}
      <motion.button
        whileTap={{ scale: 0.88 }}
        onClick={handleMainClick}
        style={{
          display: "flex", alignItems: "center", gap: 6,
          background: "none", border: "none", cursor: disabled ? "default" : "pointer",
          color: active ? "#ff4a7d" : "#9494ad",
          fontSize: 10, fontWeight: 600,
          padding: "2px 0",
          userSelect: "none",
        }}
      >
        <motion.span
          key={displayEmoji}
          initial={{ scale: 1.5, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 18 }}
          style={{ fontSize: 12, lineHeight: 1, display: "inline-block" }}
        >
          {active ? displayEmoji : <Heart size={12} strokeWidth={2} />}
        </motion.span>
        <span>{count > 0 ? count : ""}</span>
      </motion.button>
    </div>
  );
}