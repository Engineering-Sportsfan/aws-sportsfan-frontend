// // // //chandu's code


// // components/NewROARComponent/components/ComposeModal.tsx

// import { useState, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { createPortal } from "react-dom";
// import { COMPOSE_OPTIONS, UPCOMING_MATCHES } from "../constants";
// import type { ComposePayload } from "../types";
// import axios from "axios";

// interface Props {
//   open: boolean;
//   onClose: () => void;
//   onPost: (p: ComposePayload) => void;
//   initialType: string | null;
//   onOpenQuiz?: () => void; // NEW — handed off from index.tsx
// }

// const MEMORY_GIFS = [
//   { id: "phew",        label: "Phew!",        path: "/gifs/memory/sweatingflowers.gif" },
//   { id: "angry",       label: "Angry",        path: "/gifs/memory/angryoffice.gif" },
//   { id: "wow",         label: "WOW!",         path: "/gifs/memory/formula1.gif" },
//   { id: "frustrated",  label: "Frustrated",   path: "/gifs/memory/frustratedhead.gif" },
//   { id: "happy",       label: "Happy",        path: "/gifs/memory/happychrispratt.gif" },
//   { id: "called-it",   label: "I Told You!",  path: "/gifs/memory/jimmyfallon.gif" },
//   { id: "hype",        label: "Hype",         path: "/gifs/memory/joerogan.gif" },
//   { id: "loser",       label: "L",            path: "/gifs/memory/lloser.gif" },
//   { id: "no-way",      label: "No Way",       path: "/gifs/memory/nowaywow.gif" },
//   { id: "pray",        label: "Pray",         path: "/gifs/memory/praygameshow.gif" },
//   { id: "sad",         label: "Heartbreak",   path: "/gifs/memory/sadinlove.gif" },
// ];

// const SF360_TAGS = [
//   "Scenes", "Called It", "Game Breaking", "Survived",
//   "Loading...", "This is ours", "Excuse me", "Pain", "Investigate this",
// ];

// export default function ComposeModal({ open, onClose, onPost, initialType, onOpenQuiz }: Props) {
//   const [selected, setSelected] = useState<string | null>(null);
//   const [text, setText] = useState("");
//   const [sideA, setSideA] = useState("");
//   const [sideB, setSideB] = useState("");
//   const [memCtx, setMemCtx] = useState("");
//   const [dbMatches, setDbMatches] = useState<string[]>([]);
//   const [match, setMatch] = useState("None / General");
//   const [confidence, setConf] = useState(7);
//   const [audience, setAud] = useState("Everyone");
//   const [sport, setSport] = useState<string>("");
//   const [postText, setPostText] = useState("");
//   const [mediaFiles, setMediaFiles] = useState<File[]>([]);
//   const [domReady, setDomReady] = useState(false);
//   const [selectedGif, setSelectedGif] = useState<string | null>(null);
//   const [selectedTag, setSelectedTag] = useState<string | null>(null);

//   useEffect(() => { setDomReady(true); }, []);

//   useEffect(() => {
//     const fetchMatches = async () => {
//       try {
//         const res = await axios.get("/api/watch-along/matches");
//         if (res.data?.success && Array.isArray(res.data.matches)) {
//           const formatted = res.data.matches.map((m: any) => {
//             const t1 = m.team1?.name || "Team 1";
//             const t2 = m.team2?.name || "Team 2";
//             const tourney = m.tournament || "";
//             return tourney ? `${t1} vs ${t2} · ${tourney}` : `${t1} vs ${t2}`;
//           });
//           setDbMatches(formatted);
//         }
//       } catch (err) {
//         console.error("Failed to fetch matches for compose:", err);
//       }
//     };
//     fetchMatches();
//   }, []);

//   const matchesList = dbMatches.length > 0 ? ["None / General", ...dbMatches] : ["None / General", ...UPCOMING_MATCHES];
//   const filteredMatches = matchesList.filter((m) => {
//     if (m === "None / General") return true;
//     return sport === "football"
//       ? (m.toLowerCase().includes("isl") || m.toLowerCase().includes("fc") || m.toLowerCase().includes("fifa") || m.toLowerCase().includes("worldcup"))
//       : !(m.toLowerCase().includes("isl") || m.toLowerCase().includes("fc") || m.toLowerCase().includes("fifa") || m.toLowerCase().includes("worldcup"));
//   });

//   useEffect(() => {
//     if (filteredMatches.length > 0 && !filteredMatches.includes(match)) {
//       setMatch(filteredMatches[0]);
//     }
//   }, [sport, dbMatches, match]);

//   useEffect(() => {
//     if (open && initialType) {
//       // If quiz was requested directly (e.g. from RADIAL_OPTS), hand off immediately
//       if (initialType === "quiz") {
//         if (onOpenQuiz) {
//           onClose();
//           onOpenQuiz();
//           return;
//         }
//       }
//       setSelected(initialType);
//     }
//     if (!open) reset();
//   }, [open, initialType]);

//   const reset = () => {
//     setSelected(null);
//     setText("");
//     setSideA("");
//     setSideB("");
//     setMemCtx("");
//     setSport("");
//     setPostText("");
//     setMediaFiles([]);
//     setMatch("None / General");
//     setSelectedGif(null);   // ADD
//     setSelectedTag(null);
//   };

//   const canPost =
//     (selected === "hot_take" && text.trim()) ||
//     (selected === "prediction" && text.trim()) ||
//     // (selected === "debate" && sideA.trim() && sideB.trim()) ||
//     (selected === "debate" && text.trim() && sideA.trim() && sideB.trim()) ||
//     (selected === "raw_reactions" && text.trim()) ||
//     (selected === "post" && (postText.trim() || mediaFiles.length > 0));

//   const handlePost = () => {
//     onPost({
//       type: selected!,
//       text: selected === "post" ? postText : text,
//       sideA,
//       sideB,
//       match,
//       confidence,
//       audience,
//       memCtx,
//       sport,
//       mediaFiles: selected === "post" ? mediaFiles : [],
//       gifUrl: selectedGif ? MEMORY_GIFS.find(g => g.id === selectedGif)?.path : undefined,  // ADD
//       sf360Tag: selectedTag ?? undefined,  // ADD
//     });
//     onClose();
//   };

//   const inputStyle: React.CSSProperties = {
//     width: "100%",
//     padding: "14px",
//     borderRadius: 16,
//     background: "rgba(0,0,0,0.4)",
//     border: "1px solid var(--border)",
//     resize: "none" as const,
//     outline: "none",
//     color: "var(--text-primary)",
//     fontSize: 16,
//     boxSizing: "border-box",
//   };

//   const modalContent = (
//     <div className="roar-root">
//       <AnimatePresence>
//         {open && (
//           <>
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0 }}
//               onClick={onClose}
//               style={{
//                 position: "fixed", inset: 0, zIndex: 10060,
//                 background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
//               }}
//             />
//             <motion.div
//               initial={{ y: "100%" }}
//               animate={{ y: 0 }}
//               exit={{ y: "100%" }}
//               transition={{ type: "spring", damping: 28, stiffness: 300 }}
//               style={{
//                 position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 10070,
//                 background: "var(--bg-glass)", backdropFilter: "blur(20px)",
//                 borderRadius: "32px 32px 0 0",
//                 border: "1px solid rgba(255,255,255,0.08)",
//               }}
//             >
//               <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 4px" }}>
//                 <div style={{ width: 40, height: 4, borderRadius: 2, background: "var(--border)" }} />
//               </div>
//               <div className="mobile-padding-bottom" style={{ padding: "0 20px 40px", maxHeight: "75vh", overflowY: "auto" }}>
//                 {/* Header */}
//                 <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
//                   <h2 className="font-display" style={{ fontSize: 28, letterSpacing: "0.04em", textTransform: "uppercase", margin: 0 }}>
//                     {selected === "hot_take" && "Create Hot Take"}
//                     {selected === "prediction" && "Create Prediction"}
//                     {selected === "debate" && "Create Debate"}
//                     {selected === "raw_reactions" && "Create Raw Reactions"}
//                     {selected === "post" && "Create Post"}
//                     {!selected && "Create"}
//                   </h2>
//                   <button
//                     onClick={onClose}
//                     style={{
//                       width: 32, height: 32, borderRadius: "50%",
//                       background: "rgba(255,255,255,0.08)",
//                       border: "1px solid var(--border)",
//                       color: "var(--text-secondary)",
//                       fontSize: 16, cursor: "pointer",
//                       display: "flex", alignItems: "center", justifyContent: "center",
//                       flexShrink: 0,
//                     }}
//                     aria-label="Close"
//                   >
//                     ✕
//                   </button>
//                 </div>

//                 {!selected ? (
//                   <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
//                     {COMPOSE_OPTIONS.map((opt) => (
//                       <motion.button
//                         key={opt.id}
//                         whileTap={{ scale: 0.98 }}
//                         onClick={() => {
//                           // Quiz: close this modal and open the dedicated quiz modal
//                           if (opt.id === "quiz") {
//                             onClose();
//                             if (onOpenQuiz) onOpenQuiz();
//                             return;
//                           }
//                           setSelected(opt.id);
//                         }}
//                         style={{
//                           padding: "16px", borderRadius: 20,
//                           background: "var(--bg-tertiary)", border: "1px solid var(--border)",
//                           textAlign: "left", cursor: "pointer", width: "100%",
//                         }}
//                       >
//                         <span style={{ fontSize: 28 }}>{opt.emoji}</span>
//                         <p className="font-display" style={{ fontSize: 18, marginTop: 8 }}>{opt.title}</p>
//                         <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>{opt.desc}</p>
//                       </motion.button>
//                     ))}
//                   </div>
//                 ) : (
//                   <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
//                     {/* Hot Take / Memory */}
//                     {/* {(selected === "hot_take" || selected === "memory") && (
//                       <>
//                         <textarea
//                           value={text}
//                           onChange={(e) => setText(e.target.value)}
//                           rows={4}
//                           placeholder={selected === "hot_take" ? "What's your boldest take?" : "Your memory or flashback moment..."}
//                           style={inputStyle}
//                         />
//                       </>
//                     )} */}
//                     {selected === "hot_take" && (
//                       <textarea
//                         value={text}
//                         onChange={(e) => setText(e.target.value)}
//                         rows={4}
//                         placeholder="What's your boldest take?"
//                         style={inputStyle}
//                       />
//                     )}

//                     {selected === "raw_reactions" && (
//                       <>
//                         <textarea
//                           value={text}
//                           onChange={(e) => setText(e.target.value)}
//                           rows={3}
//                           placeholder="Your memory or flashback moment..."
//                           style={inputStyle}
//                         />

//                         <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginTop: 14, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>
//                           Add a reaction GIF
//                         </label>
//                         <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
//                           {MEMORY_GIFS.map((gif) => {
//                             const active = selectedGif === gif.id;
//                             return (
//                               <div
//                                 key={gif.id}
//                                 onClick={() => setSelectedGif(active ? null : gif.id)}
//                                 style={{
//                                   aspectRatio: "1", borderRadius: 10, overflow: "hidden", cursor: "pointer",
//                                   border: `2px solid ${active ? "var(--accent-magenta)" : "rgba(255,255,255,0.08)"}`,
//                                   position: "relative", background: "rgba(0,0,0,0.3)",
//                                 }}
//                               >
//                                 <img src={gif.path} alt={gif.label} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
//                                 {active && (
//                                   <div style={{ position: "absolute", top: 3, right: 3, width: 14, height: 14, borderRadius: "50%", background: "var(--accent-magenta)", display: "flex", alignItems: "center", justifyContent: "center" }}>
//                                     <span style={{ fontSize: 8, color: "#fff" }}>✓</span>
//                                   </div>
//                                 )}
//                               </div>
//                             );
//                           })}
//                         </div>

//                         <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginTop: 14, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>
//                           SF360 Tag
//                         </label>
//                         <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
//                           {SF360_TAGS.map((tag) => {
//                             const active = selectedTag === tag;
//                             return (
//                               <button
//                                 key={tag}
//                                 type="button"
//                                 onClick={() => setSelectedTag(active ? null : tag)}
//                                 style={{
//                                   padding: "7px 13px", borderRadius: 999, fontSize: 12, fontWeight: 600, cursor: "pointer",
//                                   border: `1.5px solid ${active ? "var(--accent-magenta)" : "rgba(255,255,255,0.15)"}`,
//                                   background: active ? "rgba(233,30,140,0.15)" : "transparent",
//                                   color: active ? "var(--accent-magenta)" : "rgba(255,255,255,0.6)",
//                                 }}
//                               >
//                                 {tag}
//                               </button>
//                             );
//                           })}
//                         </div>
//                       </>
//                     )}

//                     {/* Prediction */}
//                     {selected === "prediction" && (
//                       <>
//                         <textarea
//                           value={text}
//                           onChange={(e) => setText(e.target.value)}
//                           rows={3}
//                           placeholder="Your prediction..."
//                           style={{ ...inputStyle, fontStyle: "italic" }}
//                         />
//                       </>
//                     )}

//                     {/* Debate */}
//                     {/* {selected === "debate" && (
//                       <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
//                         <input value={sideA} onChange={(e) => setSideA(e.target.value)} placeholder="Create a debate"
//                           style={{ ...inputStyle, borderRadius: 14 }} />
//                       </div>
//                     )} */}
//                     {/* Debate */}
//                     {selected === "debate" && (
//                       <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
//                         <label style={{ fontSize: 11, color: "var(--text-muted)" }}>Debate Question *</label>
//                         <input
//                           value={text}
//                           onChange={(e) => setText(e.target.value)}
//                           placeholder="e.g., Sachin vs Kohli — who's the GOAT?"
//                           style={{ ...inputStyle, borderRadius: 14 }}
//                         />
//                         <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
//                           <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
//                             <label style={{ fontSize: 11, color: "var(--text-muted)" }}>Side A *</label>
//                             <input
//                               value={sideA}
//                               onChange={(e) => setSideA(e.target.value)}
//                               placeholder="e.g., Sachin"
//                               style={{ ...inputStyle, borderRadius: 14 }}
//                             />
//                           </div>
//                           <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
//                             <label style={{ fontSize: 11, color: "var(--text-muted)" }}>Side B *</label>
//                             <input
//                               value={sideB}
//                               onChange={(e) => setSideB(e.target.value)}
//                               placeholder="e.g., Kohli"
//                               style={{ ...inputStyle, borderRadius: 14 }}
//                             />
//                           </div>
//                         </div>
//                         <label style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>Context / Description</label>
//                         <textarea
//                           value={memCtx}
//                           onChange={(e) => setMemCtx(e.target.value)}
//                           rows={3}
//                           placeholder="Add background, stats, or reasoning (optional)"
//                           style={{ ...inputStyle, borderRadius: 14 }}
//                         />
//                       </div>
//                     )}

//                     {/* Post (media) */}
//                     {selected === "post" && (
//                       <>
//                         <textarea
//                           value={postText}
//                           onChange={(e) => setPostText(e.target.value)}
//                           rows={4}
//                           placeholder="Share anything with your fellow fans..."
//                           style={inputStyle}
//                         />
//                         <div
//                           style={{
//                             marginTop: 12, border: "2px dashed rgba(233,30,140,0.35)",
//                             borderRadius: 16, padding: "20px", textAlign: "center",
//                             cursor: "pointer", background: "rgba(233,30,140,0.04)",
//                           }}
//                           onClick={() => document.getElementById("roar-media-upload")?.click()}
//                         >
//                           <input
//                             id="roar-media-upload" type="file" accept="image/*,video/*,.gif"
//                             multiple style={{ display: "none" }}
//                             onChange={(e) => setMediaFiles(Array.from(e.target.files || []))}
//                           />
//                           {mediaFiles.length === 0 ? (
//                             <>
//                               <p style={{ fontSize: 28, marginBottom: 8 }}>🖼️</p>
//                               <p style={{ fontSize: 13, color: "var(--accent-magenta)", fontWeight: 700 }}>
//                                 Tap to add Photo / Video / GIF
//                               </p>
//                               <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
//                                 Supports JPG, PNG, GIF, MP4
//                               </p>
//                             </>
//                           ) : (
//                             <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
//                               {mediaFiles.map((file, i) => (
//                                 <div key={i} style={{
//                                   padding: "6px 12px", borderRadius: 999,
//                                   background: "rgba(233,30,140,0.15)", border: "1px solid rgba(233,30,140,0.3)",
//                                   fontSize: 12, color: "var(--accent-magenta)",
//                                   display: "flex", alignItems: "center", gap: 6,
//                                 }}>
//                                   {file.type.startsWith("video") ? "🎥" : "🖼️"} {file.name.slice(0, 20)}
//                                   <button
//                                     onClick={(e) => {
//                                       e.stopPropagation();
//                                       setMediaFiles((prev) => prev.filter((_, idx) => idx !== i));
//                                     }}
//                                     style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 12, padding: 0 }}
//                                   >✕</button>
//                                 </div>
//                               ))}
//                               <p style={{ width: "100%", fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
//                                 Tap to add more
//                               </p>
//                             </div>
//                           )}
//                         </div>
//                       </>
//                     )}

//                     {/* Sport selector */}
//                     {(selected === "hot_take" || selected === "prediction" || selected === "debate" || selected === "memory" || selected === "post") && (
//                       <>
//                         <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginTop: 16, marginBottom: 4 }}>Sport</label>
//                         <div style={{ display: "flex", gap: 8, marginTop: 4, marginBottom: 12 }}>
//                           {[
//                             { id: "cricket", label: "🏏 Cricket", activeColor: "var(--accent-magenta)", activeBg: "rgba(233,30,140,0.15)", activeBorder: "var(--accent-magenta)" },
//                             { id: "football", label: "⚽ Football", activeColor: "#3b82f6", activeBg: "rgba(59,130,246,0.15)", activeBorder: "#3b82f6" },
//                           ].map((sp) => {
//                             const isActive = sport === sp.id;
//                             return (
//                               <button
//                                 key={sp.id}
//                                 type="button"
//                                 onClick={() => setSport(sp.id)}
//                                 style={{
//                                   flex: 1, padding: "8px", borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: "pointer",
//                                   border: `1px solid ${isActive ? sp.activeBorder : "var(--border)"}`,
//                                   background: isActive ? sp.activeBg : "transparent",
//                                   color: isActive ? sp.activeColor : "var(--text-secondary)",
//                                 }}
//                               >
//                                 {sp.label}
//                               </button>
//                             );
//                           })}
//                         </div>
//                       </>
//                     )}

//                     <motion.button
//                       whileTap={{ scale: 0.97 }}
//                       disabled={!canPost}
//                       onClick={handlePost}
//                       className="btn-gradient"
//                       style={{ width: "100%", padding: "14px", borderRadius: 999, fontSize: 16, border: "none", cursor: "pointer", opacity: canPost ? 1 : 0.4 }}
//                     >
//                       POST TO ROAR
//                     </motion.button>
//                   </motion.div>
//                 )}
//               </div>
//             </motion.div>
//           </>
//         )}
//       </AnimatePresence>
//     </div>
//   );

//   if (!domReady) return null;
//   return createPortal(modalContent, document.body);
// }







// components/NewROARComponent/components/ComposeModal.tsx

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { COMPOSE_OPTIONS, UPCOMING_MATCHES } from "../constants";
import type { ComposePayload } from "../types";
import axios from "axios";
import AvatarWithBadge from "./AvatarWithBadge";
import { User } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  onPost: (p: ComposePayload) => void;
  initialType: string | null;
  onOpenQuiz?: () => void;
  constrainedToParent?: boolean;
}

interface MentionUser {
  userId: string;
  username: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  avatarUrl?: string;
  email?: string;
}

const MEMORY_GIFS = [
  { id: "phew", label: "Phew!", path: "/gifs/memory/sweatingflowers.gif" },
  { id: "angry", label: "Angry", path: "/gifs/memory/angryoffice.gif" },
  { id: "wow", label: "WOW!", path: "/gifs/memory/formula1.gif" },
  { id: "frustrated", label: "Frustrated", path: "/gifs/memory/frustratedhead.gif" },
  { id: "happy", label: "Happy", path: "/gifs/memory/happychrispratt.gif" },
  { id: "called-it", label: "I Told You!", path: "/gifs/memory/jimmyfallon.gif" },
  { id: "hype", label: "Hype", path: "/gifs/memory/joerogan.gif" },
  { id: "loser", label: "L", path: "/gifs/memory/lloser.gif" },
  { id: "no-way", label: "No Way", path: "/gifs/memory/nowaywow.gif" },
  { id: "pray", label: "Pray", path: "/gifs/memory/praygameshow.gif" },
  { id: "sad", label: "Heartbreak", path: "/gifs/memory/sadinlove.gif" },
];

const SF360_TAGS = [
  "Scenes", "Called It", "Game Breaking", "Survived",
  "Loading...", "This is ours", "Excuse me", "Pain", "Investigate this",
];

// ── Mention hook — reusable across any text field ─────────────────────────────
function useMention(allUsers: MentionUser[]) {
  const [mentionUsers, setMentionUsers] = useState<MentionUser[]>([]);
  const [showMentionPopup, setShowMention] = useState(false);
  const [mentionIndex, setMentionIndex] = useState(0);
  // Track which field is active so only one popup shows at a time
  const [activeField, setActiveField] = useState<string | null>(null);

  const handleChange = useCallback(
    (value: string, cursorPos: number, fieldId: string) => {
      const before = value.slice(0, cursorPos);
      const atIdx = before.lastIndexOf("@");
      if (atIdx !== -1) {
        const afterAt = before.slice(atIdx + 1);
        if (!afterAt.includes(" ")) {
          const filtered =
            afterAt.trim() === ""
              ? allUsers.slice(0, 8)
              : allUsers
                .filter((u) =>
                  `${u.username || ""} ${u.firstName || ""} ${u.lastName || ""} ${u.email || ""}`
                    .toLowerCase()
                    .includes(afterAt.toLowerCase()),
                )
                .slice(0, 8);
          setMentionUsers(filtered);
          setShowMention(filtered.length > 0);
          setMentionIndex(0);
          setActiveField(fieldId);
          return;
        }
      }
      if (activeField === fieldId) {
        setShowMention(false);
        setMentionUsers([]);
        setActiveField(null);
      }
    },
    [allUsers, activeField],
  );

  const insertMention = useCallback(
    (
      user: MentionUser,
      value: string,
      cursorPos: number,
      setValue: (v: string) => void,
      inputRef: React.RefObject<HTMLTextAreaElement | HTMLInputElement>,
    ) => {
      const dn =
        user.username ||
        user.name ||
        `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
        user.email?.split("@")[0] ||
        "user";
      const mention = `@${dn} `;
      const before = value.slice(0, cursorPos);
      const atIdx = before.lastIndexOf("@");
      const next = `${value.slice(0, atIdx)}${mention}${value.slice(cursorPos)}`;
      setValue(next);
      setShowMention(false);
      setMentionUsers([]);
      setActiveField(null);
      setTimeout(() => {
        if (inputRef.current) {
          const pos = atIdx + mention.length;
          inputRef.current.focus();
          inputRef.current.setSelectionRange(pos, pos);
        }
      }, 10);
    },
    [],
  );

  const handleKeyDown = useCallback(
    (
      e: React.KeyboardEvent,
      onEnter: () => void,
      user: MentionUser | undefined,
      insertFn: (u: MentionUser) => void,
    ) => {
      if (showMentionPopup && mentionUsers.length > 0) {
        if (e.key === "ArrowDown") { e.preventDefault(); setMentionIndex((p) => (p + 1) % mentionUsers.length); }
        else if (e.key === "ArrowUp") { e.preventDefault(); setMentionIndex((p) => (p - 1 + mentionUsers.length) % mentionUsers.length); }
        else if (e.key === "Enter" || e.key === "Tab") { e.preventDefault(); if (user) insertFn(user); }
        else if (e.key === "Escape") { setShowMention(false); setMentionUsers([]); }
        return;
      }
      if (e.key === "Enter" && !e.shiftKey) {
        // let textareas use default newline behaviour; caller can pass noop
        onEnter();
      }
    },
    [showMentionPopup, mentionUsers],
  );

  const dismiss = useCallback(() => { setShowMention(false); setMentionUsers([]); setActiveField(null); }, []);

  return {
    mentionUsers,
    showMentionPopup,
    mentionIndex,
    activeField,
    handleChange,
    insertMention,
    handleKeyDown,
    dismiss,
    setMentionIndex,
  };
}

// ── Mention popup UI ──────────────────────────────────────────────────────────
interface MentionPopupProps {
  users: MentionUser[];
  activeIndex: number;
  onSelect: (u: MentionUser) => void;
  onHover: (idx: number) => void;
}

function MentionPopup({ users, activeIndex, onSelect, onHover }: MentionPopupProps) {
  const [position, setPosition] = useState<"top" | "bottom">("top");
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (popupRef.current) {
      const rect = popupRef.current.getBoundingClientRect();
      const spaceAbove = rect.top;
      const spaceBelow = window.innerHeight - rect.bottom;
      setPosition(spaceAbove > spaceBelow ? "top" : "bottom");
    }
  }, [users]);

  if (users.length === 0) return null;
  return (
    <div
      ref={popupRef}
      style={{
        position: "absolute",
        [position === "top" ? "bottom" : "top"]: "calc(100% + 6px)",
        left: 0,
        right: 0,
        background: "#181c24",
        border: "1px solid rgba(233,30,140,0.2)",
        borderRadius: 16,
        overflow: "hidden",
        zIndex: 10090,
        boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
        maxHeight: 320,
        overflowY: "auto",
      }}
    >
      {users.map((user, idx) => {
        const dn =
          user.username ||
          user.name ||
          `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
          user.email?.split("@")[0] ||
          "user";
        const isActive = idx === activeIndex;
        return (
          <button
            key={user.userId || user.username}
            type="button"
            onClick={() => onSelect(user)}
            onMouseEnter={() => onHover(idx)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 14px",
              width: "100%",
              background: isActive ? "rgba(233,30,140,0.12)" : "transparent",
              border: "none",
              cursor: "pointer",
              transition: "background 0.12s",
              textAlign: "left",
            }}
          >
            <AvatarWithBadge username={dn} badge="RISING_FAN" size="sm" avatarUrl={user.avatarUrl} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontWeight: 600, fontSize: 13, color: "#fff", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{dn}</p>
              {user.email && (
                <p style={{ fontSize: 10, color: "#7a6a65", margin: 0 }}>{user.email}</p>
              )}
            </div>
            <User size={13} color="var(--accent-magenta, #E91E8C)" />
          </button>
        );
      })}
    </div>
  );
}

// ── Main ComposeModal ─────────────────────────────────────────────────────────

export default function ComposeModal({ open, onClose, onPost, initialType, onOpenQuiz, constrainedToParent }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [sideA, setSideA] = useState("");
  const [sideB, setSideB] = useState("");
  const [memCtx, setMemCtx] = useState("");
  const [dbMatches, setDbMatches] = useState<string[]>([]);
  const [match, setMatch] = useState("None / General");
  const [confidence, setConf] = useState(7);
  const [audience, setAud] = useState("Everyone");
  const [sport, setSport] = useState<string>("");
  const [postText, setPostText] = useState("");
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [domReady, setDomReady] = useState(false);
  const [selectedGif, setSelectedGif] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [predictionCloseMinutes, setPredictionCloseMinutes] = useState(2);
  const [predictionOptions, setPredictionOptions] = useState<string[]>(["", ""]);

  // Cursor tracking per field (needed to correctly splice mention text)
  const [textCursor, setTextCursor] = useState(0);
  const [postTextCursor, setPostCursor] = useState(0);
  const [memCtxCursor, setMemCtxCursor] = useState(0);

  // Refs for each focusable text field
  const textRef = useRef<HTMLTextAreaElement>(null);
  const postRef = useRef<HTMLTextAreaElement>(null);
  const memCtxRef = useRef<HTMLTextAreaElement>(null);

  // All users for mention lookup
  const [allUsers, setAllUsers] = useState<MentionUser[]>([]);

  const mention = useMention(allUsers);

  // ── Fetch users once ──────────────────────────────────────────────────────
  useEffect(() => {
    axios
      .get("/api/users", { withCredentials: true })
      .then((res) => {
        if (!res.data?.users) return;
        const seen = new Set<string>();
        const cleaned: MentionUser[] = res.data.users
          .filter((u: any) => {
            const n =
              u.username ||
              u.name ||
              `${u.firstName || ""} ${u.lastName || ""}`.trim();
            return !n.includes("_") && !(u.email || "").split("@")[0].includes("_");
          })
          .map((u: any) => ({
            userId: u.userId || u.id,
            username: u.username,
            firstName: u.firstName,
            lastName: u.lastName,
            name: u.name,
            avatarUrl: u.avatarUrl || u.avatar,
            email: u.email,
          }))
          .filter((u: MentionUser) => {
            const key = u.userId || u.username;
            if (!key || seen.has(key)) return false;
            const dn =
              u.username ||
              u.name ||
              `${u.firstName || ""} ${u.lastName || ""}`.trim();
            if (dn.includes("_")) return false;
            seen.add(key);
            return true;
          });
        setAllUsers(cleaned);
      })
      .catch(() => { });
  }, []);

  // ── Fetch matches ─────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const res = await axios.get("/api/watch-along/matches");
        if (res.data?.success && Array.isArray(res.data.matches)) {
          const formatted = res.data.matches.map((m: any) => {
            const t1 = m.team1?.name || "Team 1";
            const t2 = m.team2?.name || "Team 2";
            const tourney = m.tournament || "";
            return tourney ? `${t1} vs ${t2} · ${tourney}` : `${t1} vs ${t2}`;
          });
          setDbMatches(formatted);
        }
      } catch (err) {
        console.error("Failed to fetch matches for compose:", err);
      }
    };
    fetchMatches();
  }, []);

  const matchesList = dbMatches.length > 0
    ? ["None / General", ...dbMatches]
    : ["None / General", ...UPCOMING_MATCHES];

  const filteredMatches = matchesList.filter((m) => {
    if (m === "None / General") return true;
    return sport === "football"
      ? m.toLowerCase().includes("isl") || m.toLowerCase().includes("fc") || m.toLowerCase().includes("fifa") || m.toLowerCase().includes("worldcup")
      : !(m.toLowerCase().includes("isl") || m.toLowerCase().includes("fc") || m.toLowerCase().includes("fifa") || m.toLowerCase().includes("worldcup"));
  });

  useEffect(() => {
    if (filteredMatches.length > 0 && !filteredMatches.includes(match)) {
      setMatch(filteredMatches[0]);
    }
  }, [sport, dbMatches, match]);

  useEffect(() => {
    setDomReady(true);
  }, []);

  useEffect(() => {
    if (open && initialType) {
      if (initialType === "quiz") {
        if (onOpenQuiz) { onClose(); onOpenQuiz(); return; }
      }
      setSelected(initialType);
    }
    if (!open) reset();
  }, [open, initialType]);

  const reset = () => {
    setSelected(null);
    setText("");
    setSideA("");
    setSideB("");
    setMemCtx("");
    setSport("");
    setPostText("");
    setMediaFiles([]);
    setMatch("None / General");
    setSelectedGif(null);
    setSelectedTag(null);
    setPredictionCloseMinutes(2);
    setPredictionOptions(["", ""]);
    mention.dismiss();
  };

  const filledPredictionOptions = predictionOptions.map((option) => option.trim()).filter(Boolean);
  const canPost =
    (selected === "hot_take" && text.trim()) ||
    (selected === "prediction" && text.trim() && filledPredictionOptions.length >= 2) ||
    (selected === "debate" && text.trim() && sideA.trim() && sideB.trim()) ||
    (selected === "raw_reactions" && text.trim()) ||
    (selected === "post" && (postText.trim() || mediaFiles.length > 0));

  const handlePost = () => {
    const cleanPredictionOptions = predictionOptions.map((option) => option.trim()).filter(Boolean);
    onPost({
      type: selected!,
      text: selected === "post" ? postText : text,
      sideA: selected === "prediction" ? cleanPredictionOptions[0] ?? "" : sideA,
      sideB: selected === "prediction" ? cleanPredictionOptions[1] ?? "" : sideB,
      predictionOptions: selected === "prediction" ? cleanPredictionOptions : undefined,
      match,
      confidence,
      audience,
      memCtx,
      sport,
      mediaFiles: selected === "post" ? mediaFiles : [],
      gifUrl: selectedGif ? MEMORY_GIFS.find((g) => g.id === selectedGif)?.path : undefined,
      sf360Tag: selectedTag ?? undefined,
      ...(selected === "prediction" && {
        closeAfterMinutes: predictionCloseMinutes,
        closesAt: Date.now() + predictionCloseMinutes * 60 * 1000,
      }),
    });
    onClose();
  };

  // ── Per-field mention helpers ─────────────────────────────────────────────

  // "text" field (hot_take, prediction, raw_reactions, debate question)
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    const cur = e.target.selectionStart || 0;
    setText(val);
    setTextCursor(cur);
    mention.handleChange(val, cur, "text");
  };
  const insertIntoText = (user: MentionUser) =>
    mention.insertMention(user, text, textCursor, setText, textRef as React.RefObject<HTMLTextAreaElement>);

  // "postText" field
  const handlePostTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    const cur = e.target.selectionStart || 0;
    setPostText(val);
    setPostCursor(cur);
    mention.handleChange(val, cur, "postText");
  };
  const insertIntoPostText = (user: MentionUser) =>
    mention.insertMention(user, postText, postTextCursor, setPostText, postRef as React.RefObject<HTMLTextAreaElement>);

  // "memCtx" field (debate context)
  const handleMemCtxChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    const cur = e.target.selectionStart || 0;
    setMemCtx(val);
    setMemCtxCursor(cur);
    mention.handleChange(val, cur, "memCtx");
  };
  const insertIntoMemCtx = (user: MentionUser) =>
    mention.insertMention(user, memCtx, memCtxCursor, setMemCtx, memCtxRef as React.RefObject<HTMLTextAreaElement>);

  // Dispatcher: route popup selection to the correct field
  const handleMentionSelect = (user: MentionUser) => {
    if (mention.activeField === "text") insertIntoText(user);
    else if (mention.activeField === "postText") insertIntoPostText(user);
    else if (mention.activeField === "memCtx") insertIntoMemCtx(user);
  };

  // ── Styles ────────────────────────────────────────────────────────────────
  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "14px",
    borderRadius: 16,
    background: "rgba(0,0,0,0.4)",
    border: "1px solid var(--border)",
    resize: "none" as const,
    outline: "none",
    color: "var(--text-primary)",
    fontSize: 16,
    boxSizing: "border-box",
  };

  const mentionHintStyle: React.CSSProperties = {
    fontSize: 10,
    color: "rgba(233,30,140,0.6)",
    marginTop: 6,
    marginBottom: 0,
    letterSpacing: "0.03em",
  };

  // ── Portal content ────────────────────────────────────────────────────────
  const modalContent = (
    <div className="roar-root">
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              style={{
                position: constrainedToParent ? "absolute" : "fixed", inset: 0, zIndex: 10060,
                background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
              }}
            />

            {/* Sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              style={{
                position: constrainedToParent ? "absolute" : "fixed", bottom: 0, left: 0, right: 0, zIndex: 10070,
                background: "var(--bg-glass)",
                backdropFilter: "blur(20px)",
                borderRadius: "32px 32px 0 0",
                border: "1px solid rgba(255,255,255,0.08)",
                maxHeight: "85vh",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Drag handle */}
              {/* <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 4px" }}> */}
              <div style={{ flexShrink: 0, display: "flex", justifyContent: "center", padding: "12px 0 4px" }}>
                <div style={{ width: 40, height: 4, borderRadius: 2, background: "var(--border)" }} />
              </div>

              {/* <div className="mobile-padding-bottom" style={{ padding: "0 20px 40px", maxHeight: selected === "prediction" ? "none" : "75vh", overflowY: "auto" }}> */}
              {/* <div className="mobile-padding-bottom" style={{ padding: "0 20px 40px", maxHeight: "75vh", overflowY: "auto" }} > */}
              <div className="mobile-padding-bottom" style={{ flex: 1, overflowY: "auto", padding: "0 20px 40px", minHeight: 0 }}>
                {/* Header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <h2 className="font-display" style={{ fontSize: 28, letterSpacing: "0.04em", textTransform: "uppercase", margin: 0 }}>
                    {selected === "hot_take" && "Create Hot Take"}
                    {selected === "prediction" && "Create Prediction"}
                    {selected === "debate" && "Create Debate"}
                    {selected === "raw_reactions" && "Create Raw Reactions"}
                    {selected === "post" && "Create Post"}
                    {!selected && "Create"}
                  </h2>
                  <button
                    onClick={onClose}
                    style={{
                      width: 32, height: 32, borderRadius: "50%",
                      background: "rgba(255,255,255,0.08)",
                      border: "1px solid var(--border)",
                      color: "var(--text-secondary)",
                      fontSize: 16, cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                    }}
                    aria-label="Close"
                  >
                    ✕
                  </button>
                </div>

                {/* ── Type picker ── */}
                {!selected ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {COMPOSE_OPTIONS.map((opt) => (
                      <motion.button
                        key={opt.id}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          if (opt.id === "quiz") { onClose(); if (onOpenQuiz) onOpenQuiz(); return; }
                          setSelected(opt.id);
                        }}
                        style={{
                          padding: "16px", borderRadius: 20,
                          background: "var(--bg-tertiary)", border: "1px solid var(--border)",
                          textAlign: "left", cursor: "pointer", width: "100%",
                        }}
                      >
                        <span style={{ fontSize: 28 }}>{opt.emoji}</span>
                        <p className="font-display" style={{ fontSize: 18, marginTop: 8 }}>{opt.title}</p>
                        <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>{opt.desc}</p>
                      </motion.button>
                    ))}
                  </div>

                ) : (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>

                    {/* ── HOT TAKE ── */}
                    {selected === "hot_take" && (
                      <div style={{ position: "relative" }}>
                        <textarea
                          ref={textRef}
                          value={text}
                          onChange={handleTextChange}
                          onKeyDown={(e) =>
                            mention.handleKeyDown(
                              e,
                              () => { }, // textarea — allow natural newline
                              mention.mentionUsers[mention.mentionIndex],
                              insertIntoText,
                            )
                          }
                          rows={4}
                          placeholder="What's your boldest take?"
                          style={inputStyle}
                        />
                        <p style={mentionHintStyle}>Type @ to mention a fan</p>
                        {mention.showMentionPopup && mention.activeField === "text" && (
                          <MentionPopup
                            users={mention.mentionUsers}
                            activeIndex={mention.mentionIndex}
                            onSelect={handleMentionSelect}
                            onHover={mention.setMentionIndex}
                          />
                        )}
                      </div>
                    )}

                    {/* ── RAW REACTIONS ── */}
                    {selected === "raw_reactions" && (
                      <>
                        <div style={{ position: "relative" }}>
                          <textarea
                            ref={textRef}
                            value={text}
                            onChange={handleTextChange}
                            onKeyDown={(e) =>
                              mention.handleKeyDown(
                                e,
                                () => { },
                                mention.mentionUsers[mention.mentionIndex],
                                insertIntoText,
                              )
                            }
                            rows={3}
                            placeholder="Your raw reaction… Type @ to mention someone"
                            style={inputStyle}
                          />
                          <p style={mentionHintStyle}>Type @ to mention a fan</p>
                          {mention.showMentionPopup && mention.activeField === "text" && (
                            <MentionPopup
                              users={mention.mentionUsers}
                              activeIndex={mention.mentionIndex}
                              onSelect={handleMentionSelect}
                              onHover={mention.setMentionIndex}
                            />
                          )}
                        </div>

                        {/* GIF picker */}
                        <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginTop: 14, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                          Add a reaction GIF
                        </label>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
                          {MEMORY_GIFS.map((gif) => {
                            const active = selectedGif === gif.id;
                            return (
                              <div
                                key={gif.id}
                                onClick={() => setSelectedGif(active ? null : gif.id)}
                                style={{
                                  aspectRatio: "1", borderRadius: 10, overflow: "hidden", cursor: "pointer",
                                  border: `2px solid ${active ? "var(--accent-magenta)" : "rgba(255,255,255,0.08)"}`,
                                  position: "relative", background: "rgba(0,0,0,0.3)",
                                }}
                              >
                                <img src={gif.path} alt={gif.label} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                                {active && (
                                  <div style={{ position: "absolute", top: 3, right: 3, width: 14, height: 14, borderRadius: "50%", background: "var(--accent-magenta)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <span style={{ fontSize: 8, color: "#fff" }}>✓</span>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* SF360 tag */}
                        <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginTop: 14, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                          SF360 Tag
                        </label>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                          {SF360_TAGS.map((tag) => {
                            const active = selectedTag === tag;
                            return (
                              <button
                                key={tag}
                                type="button"
                                onClick={() => setSelectedTag(active ? null : tag)}
                                style={{
                                  padding: "7px 13px", borderRadius: 999, fontSize: 12, fontWeight: 600, cursor: "pointer",
                                  border: `1.5px solid ${active ? "var(--accent-magenta)" : "rgba(255,255,255,0.15)"}`,
                                  background: active ? "rgba(233,30,140,0.15)" : "transparent",
                                  color: active ? "var(--accent-magenta)" : "rgba(255,255,255,0.6)",
                                }}
                              >
                                {tag}
                              </button>
                            );
                          })}
                        </div>
                      </>
                    )}

                    {/* ── PREDICTION ── */}
                    {selected === "prediction" && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                        {/* <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <img src="/images/prediction-clock.png" alt="" style={{ width: 40, height: 48, objectFit: "contain", flexShrink: 0 }} />
                          <div>
                            <h2 style={{ margin: 0, color: "#fff", fontSize: 21, lineHeight: 1.05, fontWeight: 700 }}>Predict</h2>
                            <p style={{ margin: "6px 0 0", color: "#9b9b9b", fontSize: 14, lineHeight: 1.2 }}>Let other fans enter their predictions</p>
                          </div>
                        </div> */}
                        <div style={{ borderRadius: 16, background: "#2b2b2b", padding: "16px 12px 20px" }}>
                          {/* <input
                            value={text}
                            maxLength={80}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Who will win today"
                            style={{ width: "100%", border: "none", outline: "none", background: "transparent", color: "#fff", fontSize: 16, fontWeight: 500, padding: 0, marginBottom: 14 }}
                          /> */}
                          <label className="block text-[11px] font-bold text-[#9a9a9a] uppercase tracking-widest mb-2">
                            Your prediction *
                          </label>
                          <input
                            value={text}
                            maxLength={80}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="e.g. Who will win today?"
                            className="w-full bg-transparent border-0 border-b border-[#575757] outline-none text-white text-base font-medium pb-2.5 mb-[18px] caret-[#e91e8c] placeholder:text-[#555]"
                          />
                          {predictionOptions.map((option, index) => (
                            <div key={index} style={{ height: 48, borderRadius: 999, background: "#171717", display: "flex", alignItems: "center", padding: "0 12px 0 15px", marginBottom: 8 }}>
                              <input
                                value={option}
                                maxLength={25}
                                onChange={(e) => setPredictionOptions((prev) => prev.map((item, itemIndex) => itemIndex === index ? e.target.value : item))}
                                placeholder={`Option ${index + 1}`}
                                style={{ flex: 1, minWidth: 0, border: "none", outline: "none", background: "transparent", color: "#fff", fontSize: 16, fontWeight: 500 }}
                              />
                              <span style={{ color: "#6f6f6f", fontSize: 14 }}>{option.length}/25</span>
                              {predictionOptions.length > 2 && (
                                <button
                                  type="button"
                                  aria-label="Remove option"
                                  onClick={() => setPredictionOptions(prev => prev.filter((_, i) => i !== index))}
                                  style={{ background: "none", border: "none", cursor: "pointer", color: "#6f6f6f", fontSize: 16, padding: "0 0 0 8px", flexShrink: 0, lineHeight: 1 }}
                                >
                                  ✕
                                </button>
                              )}
                            </div>
                          ))}
                          <button
                            type="button"
                            aria-label="Add option"
                            disabled={predictionOptions.length >= 6}
                            onClick={() => setPredictionOptions((prev) => prev.length >= 6 ? prev : [...prev, ""])}
                            style={{ display: "inline-flex", alignItems: "center", gap: 6, height: 35, padding: "0 11px", marginTop: 12, borderRadius: 999, border: "1px solid #9a9a9a", background: "transparent", color: "#fff", fontSize: 14, cursor: predictionOptions.length >= 6 ? "not-allowed" : "pointer", opacity: predictionOptions.length >= 6 ? 0.45 : 1 }}
                          >
                            Option
                            <span style={{ width: 16, height: 16, borderRadius: "50%", border: "1px solid #fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 13, lineHeight: 1 }}>+</span>
                          </button>
                          <div style={{ height: 1, background: "#575757", margin: "20px 0 10px" }} />
                          <label style={{ display: "block", color: "#777", fontSize: 15, fontWeight: 600, marginBottom: 10 }}>Set duration</label>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                            {/* {[
                              { label: "2min", value: 2 },
                              { label: "1:30hr", value: 90 },
                              { label: "Custom", value: 0 },
                            ].map((duration) => {
                              const active = duration.value === 0 ? predictionCloseMinutes !== 2 && predictionCloseMinutes !== 90 : predictionCloseMinutes === duration.value;
                              return (
                                <button
                                  key={duration.label}
                                  type="button"
                                  onClick={() => setPredictionCloseMinutes(duration.value === 0 ? 60 : duration.value)}
                                  style={{ height: 30, padding: "0 12px", borderRadius: 999, border: "none", background: active ? "#0f0f0f" : "#171717", color: active ? "#fff" : "#696969", fontSize: 14, fontWeight: 600, cursor: "pointer" }}
                                >
                                  {duration.label}
                                </button>
                              );
                            })}
                          </div>
                          {predictionCloseMinutes !== 2 && predictionCloseMinutes !== 90 && (
                            <input
                              type="number"
                              min={1}
                              max={10080}
                              value={predictionCloseMinutes}
                              onChange={(e) => setPredictionCloseMinutes(Math.max(1, Math.min(10080, Number(e.target.value) || 1)))}
                              aria-label="Custom close time in minutes"
                              style={{ width: "100%", marginTop: 10, border: "none", outline: "none", borderRadius: 999, background: "#171717", color: "#fff", fontSize: 14, padding: "10px 14px" }}
                            />
                          )} */}


                            {[
                              { label: "20 mins", value: 20 },
                              { label: "30 mins", value: 30 },
                              { label: "1 hr", value: 60 },
                              { label: "1:30 hr", value: 90 },
                              { label: "2 hr", value: 120 },
                            ].map((duration) => {
                              const active = predictionCloseMinutes === duration.value;
                              return (
                                <button
                                  key={duration.label}
                                  type="button"
                                  onClick={() => setPredictionCloseMinutes(duration.value)}
                                  style={{ height: 30, padding: "0 12px", borderRadius: 999, border: "none", background: active ? "#0f0f0f" : "#171717", color: active ? "#fff" : "#696969", fontSize: 14, fontWeight: 600, cursor: "pointer" }}
                                >
                                  {duration.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                    )}
                    {false && selected === "prediction" && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        <div style={{ position: "relative" }}>
                          <textarea
                            ref={textRef}
                            value={text}
                            onChange={handleTextChange}
                            onKeyDown={(e) =>
                              mention.handleKeyDown(
                                e,
                                () => { },
                                mention.mentionUsers[mention.mentionIndex],
                                insertIntoText,
                              )
                            }
                            rows={3}
                            placeholder="Your prediction…"
                            style={{ ...inputStyle, fontStyle: "italic" }}
                          />
                          <p style={mentionHintStyle}>Type @ to mention a fan</p>
                          {mention.showMentionPopup && mention.activeField === "text" && (
                            <MentionPopup
                              users={mention.mentionUsers}
                              activeIndex={mention.mentionIndex}
                              onSelect={handleMentionSelect}
                              onHover={mention.setMentionIndex}
                            />
                          )}
                        </div>
                        <div>
                          <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 7, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                            Voting closes after
                          </label>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 8 }}>
                            {[15, 30, 60, 1440].map((minutes) => {
                              const active = predictionCloseMinutes === minutes;
                              return (
                                <button
                                  key={minutes}
                                  type="button"
                                  onClick={() => setPredictionCloseMinutes(minutes)}
                                  style={{
                                    padding: "9px 8px",
                                    borderRadius: 12,
                                    border: `1px solid ${active ? "var(--accent-orange)" : "var(--border)"}`,
                                    background: active ? "rgba(255,107,53,0.15)" : "rgba(255,255,255,0.03)",
                                    color: active ? "var(--accent-orange)" : "var(--text-secondary)",
                                    fontSize: 12,
                                    fontWeight: 800,
                                    cursor: "pointer",
                                  }}
                                >
                                  {minutes === 1440 ? "24h" : `${minutes}m`}
                                </button>
                              );
                            })}
                          </div>
                          <input
                            type="number"
                            min={1}
                            max={10080}
                            value={predictionCloseMinutes}
                            onChange={(e) => setPredictionCloseMinutes(Math.max(1, Math.min(10080, Number(e.target.value) || 1)))}
                            style={{ ...inputStyle, borderRadius: 12, marginTop: 8, padding: "10px 12px", fontSize: 13 }}
                            aria-label="Custom close time in minutes"
                          />
                        </div>
                      </div>
                    )}

                    {/* ── DEBATE ── */}
                    {selected === "debate" && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {/* Debate question */}
                        <label style={{ fontSize: 11, color: "var(--text-muted)" }}>Debate Question *</label>
                        <div style={{ position: "relative" }}>
                          <input
                            value={text}
                            onChange={(e) => {
                              const val = e.target.value;
                              const cur = e.target.selectionStart || 0;
                              setText(val);
                              setTextCursor(cur);
                              mention.handleChange(val, cur, "text");
                            }}
                            onKeyDown={(e) =>
                              mention.handleKeyDown(
                                e,
                                () => { },
                                mention.mentionUsers[mention.mentionIndex],
                                insertIntoText,
                              )
                            }
                            placeholder="e.g., Sachin vs Kohli — who's the GOAT? Type @ to mention"
                            style={{ ...inputStyle, borderRadius: 14 }}
                          />
                          {mention.showMentionPopup && mention.activeField === "text" && (
                            <MentionPopup
                              users={mention.mentionUsers}
                              activeIndex={mention.mentionIndex}
                              onSelect={handleMentionSelect}
                              onHover={mention.setMentionIndex}
                            />
                          )}
                        </div>

                        {/* Side A / B */}
                        <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                            <label style={{ fontSize: 11, color: "var(--text-muted)" }}>Side A *</label>
                            <input
                              value={sideA}
                              onChange={(e) => setSideA(e.target.value)}
                              placeholder="e.g., Sachin"
                              style={{ ...inputStyle, borderRadius: 14 }}
                            />
                          </div>
                          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                            <label style={{ fontSize: 11, color: "var(--text-muted)" }}>Side B *</label>
                            <input
                              value={sideB}
                              onChange={(e) => setSideB(e.target.value)}
                              placeholder="e.g., Kohli"
                              style={{ ...inputStyle, borderRadius: 14 }}
                            />
                          </div>
                        </div>

                        {/* Context / Description — mentionable */}
                        <label style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>Context / Description</label>
                        <div style={{ position: "relative" }}>
                          <textarea
                            ref={memCtxRef}
                            value={memCtx}
                            onChange={handleMemCtxChange}
                            onKeyDown={(e) =>
                              mention.handleKeyDown(
                                e,
                                () => { },
                                mention.mentionUsers[mention.mentionIndex],
                                insertIntoMemCtx,
                              )
                            }
                            rows={3}
                            placeholder="Add background, stats, or reasoning…"
                            style={{ ...inputStyle, borderRadius: 14 }}
                          />
                          <p style={mentionHintStyle}>Type @ to mention a fan</p>
                          {mention.showMentionPopup && mention.activeField === "memCtx" && (
                            <MentionPopup
                              users={mention.mentionUsers}
                              activeIndex={mention.mentionIndex}
                              onSelect={handleMentionSelect}
                              onHover={mention.setMentionIndex}
                            />
                          )}
                        </div>
                      </div>
                    )}

                    {/* ── POST (media) ── */}
                    {selected === "post" && (
                      <>
                        <div style={{ position: "relative" }}>
                          <textarea
                            ref={postRef}
                            value={postText}
                            onChange={handlePostTextChange}
                            onKeyDown={(e) =>
                              mention.handleKeyDown(
                                e,
                                () => { },
                                mention.mentionUsers[mention.mentionIndex],
                                insertIntoPostText,
                              )
                            }
                            rows={4}
                            placeholder="Share anything with your fellow fans…"
                            style={inputStyle}
                          />
                          <p style={mentionHintStyle}>Type @ to mention a fan</p>
                          {mention.showMentionPopup && mention.activeField === "postText" && (
                            <MentionPopup
                              users={mention.mentionUsers}
                              activeIndex={mention.mentionIndex}
                              onSelect={handleMentionSelect}
                              onHover={mention.setMentionIndex}
                            />
                          )}
                        </div>

                        {/* Media upload */}
                        <div
                          style={{
                            marginTop: 12, border: "2px dashed rgba(233,30,140,0.35)",
                            borderRadius: 16, padding: "20px", textAlign: "center",
                            cursor: "pointer", background: "rgba(233,30,140,0.04)",
                          }}
                          onClick={() => document.getElementById("roar-media-upload")?.click()}
                        >
                          <input
                            id="roar-media-upload" type="file" accept="image/*,video/*,.gif"
                            multiple style={{ display: "none" }}
                            onChange={(e) => setMediaFiles(Array.from(e.target.files || []))}
                          />
                          {mediaFiles.length === 0 ? (
                            <>
                              <p style={{ fontSize: 28, marginBottom: 8 }}>🖼️</p>
                              <p style={{ fontSize: 13, color: "var(--accent-magenta)", fontWeight: 700 }}>
                                Tap to add Photo / Video / GIF
                              </p>
                              <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
                                Supports JPG, PNG, GIF, MP4
                              </p>
                            </>
                          ) : (
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
                              {mediaFiles.map((file, i) => (
                                <div key={i} style={{
                                  padding: "6px 12px", borderRadius: 999,
                                  background: "rgba(233,30,140,0.15)", border: "1px solid rgba(233,30,140,0.3)",
                                  fontSize: 12, color: "var(--accent-magenta)",
                                  display: "flex", alignItems: "center", gap: 6,
                                }}>
                                  {file.type.startsWith("video") ? "🎥" : "🖼️"} {file.name.slice(0, 20)}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setMediaFiles((prev) => prev.filter((_, idx) => idx !== i));
                                    }}
                                    style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 12, padding: 0 }}
                                  >✕</button>
                                </div>
                              ))}
                              <p style={{ width: "100%", fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
                                Tap to add more
                              </p>
                            </div>
                          )}
                        </div>
                      </>
                    )}

                    {/* ── Sport selector ── */}
                    {(selected === "hot_take" || selected === "debate" || selected === "memory" || selected === "post") && (
                      <>
                        <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginTop: 16, marginBottom: 4 }}>Sport</label>
                        <div style={{ display: "flex", gap: 8, marginTop: 4, marginBottom: 12 }}>
                          {[
                            { id: "cricket", label: "🏏 Cricket", activeColor: "var(--accent-magenta)", activeBg: "rgba(233,30,140,0.15)", activeBorder: "var(--accent-magenta)" },
                            { id: "football", label: "⚽ Football", activeColor: "#3b82f6", activeBg: "rgba(59,130,246,0.15)", activeBorder: "#3b82f6" },
                          ].map((sp) => {
                            const isActive = sport === sp.id;
                            return (
                              <button
                                key={sp.id}
                                type="button"
                                onClick={() => setSport(sp.id)}
                                style={{
                                  flex: 1, padding: "8px", borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: "pointer",
                                  border: `1px solid ${isActive ? sp.activeBorder : "var(--border)"}`,
                                  background: isActive ? sp.activeBg : "transparent",
                                  color: isActive ? sp.activeColor : "var(--text-secondary)",
                                }}
                              >
                                {sp.label}
                              </button>
                            );
                          })}
                        </div>
                      </>
                    )}

                    {/* ── Post button ── */}
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      disabled={!canPost}
                      onClick={handlePost}
                      className="btn-gradient"
                      // style={{ width: "100%", padding: selected === "prediction" ? "18px" : "14px", borderRadius: 999, fontSize: 16, border: "none", cursor: "pointer", opacity: canPost ? 1 : 0.4, marginTop: selected === "prediction" ? 0 : undefined, textTransform: selected === "prediction" ? "none" : undefined }}
                      style={{ width: "100%", padding: "14px", borderRadius: 999, fontSize: 16, border: "none", cursor: "pointer", opacity: canPost ? 1 : 0.4, marginTop: 16, marginBottom: 16 }}
                    >
                      POST TO ROAR
                    </motion.button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );

  if (!domReady) return null;
  if (constrainedToParent) return modalContent;
  return createPortal(modalContent, document.body);
}
