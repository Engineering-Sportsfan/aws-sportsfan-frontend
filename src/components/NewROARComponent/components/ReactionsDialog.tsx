// // components/NewROARComponent/components/ReactionsDialog.tsx
// // LinkedIn-style modal: shows who reacted, filterable by reaction type.

// import { useState, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import axios from "axios";
// import AvatarWithBadge from "./AvatarWithBadge";
// import { REACTIONS, type Reaction } from "./ReactionPicker";
// import { X } from "lucide-react";

// interface Reactor {
//   username: string;
//   avatarUrl?: string;
//   badge?: string;
//   reaction: Reaction;
// }

// interface Props {
//   postId: string;
//   isOpen: boolean;
//   onClose: () => void;
//   onFanProfile?: (fan: any) => void;
// }

// export default function ReactionsDialog({ postId, isOpen, onClose, onFanProfile }: Props) {
//   const [reactors, setReactors] = useState<Reactor[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [filter, setFilter] = useState<Reaction | "all">("all");

//   useEffect(() => {
//     if (!isOpen || !postId) return;
//     setLoading(true);
//     setFilter("all");
//     axios.get(`/api/roar/posts/${postId}/reactions`)
//       .then(r => setReactors(r.data?.reactors ?? []))
//       .catch(() => setReactors([]))
//       .finally(() => setLoading(false));
//   }, [isOpen, postId]);

//   const filtered = filter === "all" ? reactors : reactors.filter(r => r.reaction === filter);

//   // Counts per reaction
//   const counts: Record<string, number> = { all: reactors.length };
//   reactors.forEach(r => { counts[r.reaction] = (counts[r.reaction] ?? 0) + 1; });

//   const tabs = [
//     { id: "all" as const, emoji: "All", label: "All" },
//     ...REACTIONS.filter(r => (counts[r.id] ?? 0) > 0),
//   ];

//   return (
//     <AnimatePresence>
//       {isOpen && (
//         <>
//           {/* Backdrop */}
//           <motion.div
//             key="backdrop"
//             initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
//             onClick={onClose}
//             style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.72)", zIndex: 300, backdropFilter: "blur(4px)" }}
//           />

//           {/* Sheet */}
//           <motion.div
//             key="sheet"
//             initial={{ opacity: 0, y: 40 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0, y: 40 }}
//             transition={{ type: "spring", stiffness: 380, damping: 32 }}
//             onClick={e => e.stopPropagation()}
//             style={{
//               position: "fixed", bottom: 0, left: 0, right: 0,
//               maxWidth: 480, margin: "0 auto",
//               background: "#0f0f18",
//               border: "1px solid rgba(255,255,255,0.1)",
//               borderBottom: "none",
//               borderRadius: "20px 20px 0 0",
//               zIndex: 301,
//               maxHeight: "72vh",
//               display: "flex", flexDirection: "column",
//               overflow: "hidden",
//             }}
//           >
//             {/* Handle */}
//             <div style={{ width: 36, height: 4, background: "rgba(255,255,255,0.15)", borderRadius: 2, margin: "10px auto 0" }} />

//             {/* Header */}
//             <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px 10px" }}>
//               <p style={{ fontSize: 15, fontWeight: 700, color: "#fff", margin: 0 }}>Reactions</p>
//               <button onClick={onClose} style={{ background: "rgba(255,255,255,0.07)", border: "none", borderRadius: "50%", width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#9494ad" }}>
//                 <X size={15} />
//               </button>
//             </div>

//             {/* Reaction filter tabs */}
//             {tabs.length > 1 && (
//               <div style={{ display: "flex", gap: 6, padding: "0 16px 12px", overflowX: "auto", scrollbarWidth: "none" }}>
//                 {tabs.map(tab => {
//                   const isActive = filter === tab.id;
//                   const cnt = counts[tab.id] ?? 0;
//                   return (
//                     <motion.button
//                       key={tab.id}
//                       whileTap={{ scale: 0.94 }}
//                       onClick={() => setFilter(tab.id as any)}
//                       style={{
//                         display: "flex", alignItems: "center", gap: 5,
//                         padding: "5px 12px", borderRadius: 999, flexShrink: 0,
//                         background: isActive ? "rgba(233,30,140,0.15)" : "rgba(255,255,255,0.05)",
//                         border: `1px solid ${isActive ? "rgba(233,30,140,0.4)" : "rgba(255,255,255,0.08)"}`,
//                         color: isActive ? "var(--accent-magenta, #e91e8c)" : "#9494ad",
//                         fontSize: 12, fontWeight: 700, cursor: "pointer",
//                       }}
//                     >
//                       {"emoji" in tab && tab.id !== "all" ? <span style={{ fontSize: 14 }}>{tab.emoji}</span> : null}
//                       <span>{tab.id === "all" ? "All" : tab.label}</span>
//                       <span style={{
//                         fontSize: 10, fontWeight: 800,
//                         background: isActive ? "rgba(233,30,140,0.2)" : "rgba(255,255,255,0.08)",
//                         borderRadius: 999, padding: "1px 6px",
//                       }}>{cnt}</span>
//                     </motion.button>
//                   );
//                 })}
//               </div>
//             )}

//             {/* Divider */}
//             <div style={{ height: 1, background: "rgba(255,255,255,0.07)", marginBottom: 4 }} />

//             {/* List */}
//             <div style={{ flex: 1, overflowY: "auto", padding: "8px 0 24px" }}>
//               {loading ? (
//                 <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "12px 18px" }}>
//                   {[1, 2, 3, 4].map(n => (
//                     <div key={n} style={{ display: "flex", gap: 10, alignItems: "center" }}>
//                       <div style={{ width: 38, height: 38, borderRadius: "50%", background: "rgba(255,255,255,0.07)", flexShrink: 0 }} />
//                       <div style={{ flex: 1, height: 13, borderRadius: 6, background: "rgba(255,255,255,0.06)" }} />
//                     </div>
//                   ))}
//                 </div>
//               ) : filtered.length === 0 ? (
//                 <p style={{ textAlign: "center", color: "#9494ad", fontSize: 13, padding: "32px 20px" }}>
//                   {reactors.length === 0 ? "No reactions yet" : "No reactions of this type"}
//                 </p>
//               ) : (
//                 <AnimatePresence initial={false}>
//                   {filtered.map((reactor, i) => (
//                     <motion.div
//                       key={`${reactor.username}-${reactor.reaction}`}
//                       initial={{ opacity: 0, x: -8 }}
//                       animate={{ opacity: 1, x: 0 }}
//                       transition={{ delay: i * 0.025 }}
//                       onClick={() => { onFanProfile?.({ username: reactor.username, avatarUrl: reactor.avatarUrl, badge: reactor.badge }); onClose(); }}
//                       style={{
//                         display: "flex", alignItems: "center", gap: 12,
//                         padding: "10px 18px", cursor: "pointer",
//                         transition: "background 0.15s",
//                       }}
//                       onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
//                       onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
//                     >
//                       {/* Avatar with reaction badge */}
//                       <div style={{ position: "relative", flexShrink: 0 }}>
//                         <AvatarWithBadge username={reactor.username} badge={reactor.badge ?? "RISING_FAN"} size="sm" avatarUrl={reactor.avatarUrl} />
//                         <span style={{
//                           position: "absolute", bottom: -2, right: -4,
//                           fontSize: 13, lineHeight: 1,
//                           background: "rgba(15,15,24,0.9)", borderRadius: "50%",
//                           padding: 1,
//                         }}>
//                           {REACTIONS.find(r => r.id === reactor.reaction)?.emoji ?? "❤️"}
//                         </span>
//                       </div>

//                       <div style={{ flex: 1, minWidth: 0 }}>
//                         <p style={{ fontSize: 13, fontWeight: 700, color: "#f5f5fa", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
//                           {reactor.username}
//                         </p>
//                       </div>

//                       <span style={{ fontSize: 18, flexShrink: 0 }}>
//                         {REACTIONS.find(r => r.id === reactor.reaction)?.emoji ?? "❤️"}
//                       </span>
//                     </motion.div>
//                   ))}
//                 </AnimatePresence>
//               )}
//             </div>
//           </motion.div>
//         </>
//       )}
//     </AnimatePresence>
//   );
// }





// components/NewROARComponent/components/ReactionsDialog.tsx
// LinkedIn-style modal: shows who reacted, filterable by reaction type.

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import AvatarWithBadge from "./AvatarWithBadge";
import { REACTIONS, type Reaction } from "./ReactionPicker";
import { X } from "lucide-react";

interface Reactor {
  userId: string;
  username: string;
  avatarUrl?: string;
  badge?: string;
  reaction: Reaction;
}

interface Props {
  postId: string;
  isOpen: boolean;
  onClose: () => void;
  onFanProfile?: (fan: any) => void;
  // NEW — when set, fetches reactions for a room message
  // (roarRooms/{roomId}/messages/{postId}) instead of a feed post.
  roomId?: string;
   msgId?: string;     
  commentId?: string;
}

export default function ReactionsDialog({ postId, isOpen, onClose, onFanProfile, roomId, msgId, commentId }: Props) {
  const [reactors, setReactors] = useState<Reactor[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<Reaction | "all">("all");

  // useEffect(() => {
  //   if (!isOpen || !postId) return;
  //   setLoading(true);
  //   setFilter("all");
  //   const url = `/api/roar/posts/${postId}/reactions${roomId ? `?roomId=${encodeURIComponent(roomId)}` : ""}`;
  //   axios.get(url)
  //     .then(r => setReactors(r.data?.reactors ?? []))
  //     .catch(() => setReactors([]))
  //     .finally(() => setLoading(false));
  // }, [isOpen, postId, roomId]);

  useEffect(() => {
    if (!isOpen || !postId) return;
    setLoading(true);
    setFilter("all");
    const url = commentId && roomId && msgId
      ? `/api/roar/rooms/${roomId}/messages/${msgId}/comments/${commentId}/reactions`
      : `/api/roar/posts/${postId}/reactions${roomId ? `?roomId=${encodeURIComponent(roomId)}` : ""}`;
    axios.get(url)
      .then(r => setReactors(r.data?.reactors ?? []))
      .catch(() => setReactors([]))
      .finally(() => setLoading(false));
  }, [isOpen, postId, roomId, msgId, commentId]);
  
  const filtered = filter === "all" ? reactors : reactors.filter(r => r.reaction === filter);

  // Counts per reaction
  const counts: Record<string, number> = { all: reactors.length };
  reactors.forEach(r => { counts[r.reaction] = (counts[r.reaction] ?? 0) + 1; });

  const tabs = [
    { id: "all" as const, emoji: "All", label: "All" },
    ...REACTIONS.filter(r => (counts[r.id] ?? 0) > 0),
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.72)", zIndex: 300, backdropFilter: "blur(4px)" }}
          />

          {/* Sheet */}
          <motion.div
            key="sheet"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            onClick={e => e.stopPropagation()}
            style={{
              position: "fixed", bottom: 0, left: 0, right: 0,
              maxWidth: 480, margin: "0 auto",
              background: "#0f0f18",
              border: "1px solid rgba(255,255,255,0.1)",
              borderBottom: "none",
              borderRadius: "20px 20px 0 0",
              zIndex: 301,
              maxHeight: "72vh",
              display: "flex", flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* Handle */}
            <div style={{ width: 36, height: 4, background: "rgba(255,255,255,0.15)", borderRadius: 2, margin: "10px auto 0" }} />

            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px 10px" }}>
              <p style={{ fontSize: 15, fontWeight: 700, color: "#fff", margin: 0 }}>Reactions</p>
              <button onClick={onClose} style={{ background: "rgba(255,255,255,0.07)", border: "none", borderRadius: "50%", width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#9494ad" }}>
                <X size={15} />
              </button>
            </div>

            {/* Reaction filter tabs */}
            {tabs.length > 1 && (
              <div style={{ display: "flex", gap: 6, padding: "0 16px 12px", overflowX: "auto", scrollbarWidth: "none" }}>
                {tabs.map(tab => {
                  const isActive = filter === tab.id;
                  const cnt = counts[tab.id] ?? 0;
                  return (
                    <motion.button
                      key={tab.id}
                      whileTap={{ scale: 0.94 }}
                      onClick={() => setFilter(tab.id as any)}
                      style={{
                        display: "flex", alignItems: "center", gap: 5,
                        padding: "5px 12px", borderRadius: 999, flexShrink: 0,
                        background: isActive ? "rgba(233,30,140,0.15)" : "rgba(255,255,255,0.05)",
                        border: `1px solid ${isActive ? "rgba(233,30,140,0.4)" : "rgba(255,255,255,0.08)"}`,
                        color: isActive ? "var(--accent-magenta, #e91e8c)" : "#9494ad",
                        fontSize: 12, fontWeight: 700, cursor: "pointer",
                      }}
                    >
                      {"emoji" in tab && tab.id !== "all" ? <span style={{ fontSize: 14 }}>{tab.emoji}</span> : null}
                      <span>{tab.id === "all" ? "All" : tab.label}</span>
                      <span style={{
                        fontSize: 10, fontWeight: 800,
                        background: isActive ? "rgba(233,30,140,0.2)" : "rgba(255,255,255,0.08)",
                        borderRadius: 999, padding: "1px 6px",
                      }}>{cnt}</span>
                    </motion.button>
                  );
                })}
              </div>
            )}

            {/* Divider */}
            <div style={{ height: 1, background: "rgba(255,255,255,0.07)", marginBottom: 4 }} />

            {/* List */}
            <div style={{ flex: 1, overflowY: "auto", padding: "8px 0 24px" }}>
              {loading ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "12px 18px" }}>
                  {[1, 2, 3, 4].map(n => (
                    <div key={n} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <div style={{ width: 38, height: 38, borderRadius: "50%", background: "rgba(255,255,255,0.07)", flexShrink: 0 }} />
                      <div style={{ flex: 1, height: 13, borderRadius: 6, background: "rgba(255,255,255,0.06)" }} />
                    </div>
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <p style={{ textAlign: "center", color: "#9494ad", fontSize: 13, padding: "32px 20px" }}>
                  {reactors.length === 0 ? "No reactions yet" : "No reactions of this type"}
                </p>
              ) : (
                <AnimatePresence initial={false}>
                  {filtered.map((reactor, i) => (
                    <motion.div
                      key={`${reactor.username}-${reactor.reaction}`}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.025 }}
                      // onClick={() => { onFanProfile?.({ username: reactor.username, avatarUrl: reactor.avatarUrl, badge: reactor.badge }); onClose(); }}
                      onClick={() => {
                        onFanProfile?.({
                          username: reactor.username,
                          avatarUrl: reactor.avatarUrl,
                          badge: reactor.badge,
                          uid: reactor.userId,
                          authorUid: reactor.userId,
                        });
                        onClose();
                      }}
                      style={{
                        display: "flex", alignItems: "center", gap: 12,
                        padding: "10px 18px", cursor: "pointer",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      {/* Avatar with reaction badge */}
                      <div style={{ position: "relative", flexShrink: 0 }}>
                        <AvatarWithBadge username={reactor.username} badge={reactor.badge ?? "RISING_FAN"} size="sm" avatarUrl={reactor.avatarUrl} />
                        <span style={{
                          position: "absolute", bottom: -2, right: -4,
                          fontSize: 13, lineHeight: 1,
                          background: "rgba(15,15,24,0.9)", borderRadius: "50%",
                          padding: 1,
                        }}>
                          {REACTIONS.find(r => r.id === reactor.reaction)?.emoji ?? "❤️"}
                        </span>
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 700, color: "#f5f5fa", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {reactor.username}
                        </p>
                      </div>

                      <span style={{ fontSize: 18, flexShrink: 0 }}>
                        {REACTIONS.find(r => r.id === reactor.reaction)?.emoji ?? "❤️"}
                      </span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}