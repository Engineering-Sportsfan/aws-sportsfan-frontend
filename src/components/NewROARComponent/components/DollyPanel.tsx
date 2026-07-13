// "use client";

// import React, { useEffect, useRef, useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { ChevronLeft, History as HistoryIcon, X, Lock, Send, Loader2 } from "lucide-react";

// export interface DollyReply {
//     id: string;
//     question: string;
//     answer: string;
//     createdAt: number;
// }

// export interface DollyHistorySession {
//     roomId: string;         // the room this Dolly thread belongs to
//     title: string;           // e.g. "IND vs PAK"
//     subtitle: string;        // e.g. last question asked, or "Bumrah's already taken 2 early wickets in …"
//     dateLabel: string;       // e.g. "Today" / "Mar 15, 2025"
//     isLive?: boolean;
//     sport?: string;
// }

// interface DollyPanelProps {
//     isOpen: boolean;
//     onOpen: () => void;
//     onClose: () => void;

//     // The room whose thread is currently displayed in the chat view
//     // (this is the room the messages/question box act on right now).
//     activeRoomId?: string;
//     activeRoomName?: string;

//     question: string;
//     setQuestion: (v: string) => void;
//     asking: boolean;
//     onAsk: () => void;

//     replies: DollyReply[];
//     loadingReplies?: boolean;

//     // Every room that has a Dolly thread — current live room included.
//     // Sort however you like; isLive rooms get a highlighted style automatically.
//     history: DollyHistorySession[];
//     loadingHistory?: boolean;

//     // Called when the user taps a session in history — parent should fetch
//     // that room's replies and update `replies` (+ activeRoomId/activeRoomName).
//     onSelectHistorySession: (session: DollyHistorySession) => void;

//     // Called when the user taps "New Chat" — parent should reset to the
//     // live room's thread (or start a fresh one).
//     onNewChat?: () => void;
// }

// export default function DollyPanel({
//     isOpen, onOpen, onClose,
//     activeRoomId, activeRoomName,
//     question, setQuestion, asking, onAsk,
//     replies, loadingReplies = false,
//     history,
//     loadingHistory = false,
//     onSelectHistorySession,
//     onNewChat,
// }: DollyPanelProps) {
//     const [view, setView] = useState<"chat" | "history">("chat");
//     const inputRef = useRef<HTMLInputElement>(null);
//     const bodyRef = useRef<HTMLDivElement>(null);

//     useEffect(() => {
//         if (isOpen && view === "chat" && !loadingReplies) {
//             setTimeout(() => inputRef.current?.focus(), 350);
//         }
//     }, [isOpen, view, loadingReplies]);

//     useEffect(() => {
//         if (isOpen && view === "chat" && bodyRef.current) {
//             bodyRef.current.scrollTo({ top: bodyRef.current.scrollHeight, behavior: "smooth" });
//         }
//     }, [replies, isOpen, view]);

//     useEffect(() => {
//         if (isOpen) setView("chat");
//     }, [isOpen]);

//     const handleSend = () => {
//         if (!question.trim() || asking) return;
//         onAsk();
//     };

//     const SPORT_EMOJI: Record<string, string> = {
//         cricket: "🏏",
//         football: "⚽",
//         general: "🎮",
//     };

//     return (
//         <>
//             {/* ── Vertical trigger tab · right side, middle ── */}
//             <AnimatePresence>
//                 {!isOpen && (
//                     <motion.button
//                         type="button"
//                         onClick={onOpen}
//                         initial={{ opacity: 0, x: 12 }}
//                         animate={{ opacity: 1, x: 0 }}
//                         exit={{ opacity: 0, x: 12 }}
//                         transition={{ duration: 0.2 }}
//                         className="fixed right-0 top-1/2 -translate-y-1/2 z-[55] flex flex-col items-center gap-2 py-2 px-1 rounded-l-2xl rounded-r-none bg-gradient-to-b from-blue-900 to-slate-800 border border-r-0 border-blue-500/50 shadow-[-4px_4px_20px_rgba(59,130,246,0.35)] cursor-pointer"
//                     >
//                         <div className="w-[24px] h-[24px] rounded-full overflow-hidden border-2 border-white/85 shrink-0">
//                             <img
//                                 src="/images/dollyavatar.png"
//                                 alt="Ask Dolly"
//                                 className="w-full h-full object-cover"
//                             />
//                         </div>
//                         <span
//                             className="text-[8px] font-extrabold tracking-[0.08em] text-blue-300 uppercase"
//                             style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
//                         >
//                             Ask Dolly
//                         </span>
//                     </motion.button>
//                 )}
//             </AnimatePresence>

//             {/* ── Backdrop + sliding panel ── */}
//             <AnimatePresence>
//                 {isOpen && (
//                     <>
//                         <motion.div
//                             key="dolly-backdrop"
//                             initial={{ opacity: 0 }}
//                             animate={{ opacity: 1 }}
//                             exit={{ opacity: 0 }}
//                             transition={{ duration: 0.2 }}
//                             onClick={onClose}
//                             className="fixed inset-0 z-[70] bg-black/55"
//                         />
//                         <motion.div
//                             key="dolly-panel"
//                             initial={{ x: "100%" }}
//                             animate={{ x: 0 }}
//                             exit={{ x: "100%" }}
//                             transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
//                             className="fixed inset-y-0 right-0 left-8 sm:left-16 z-[71] flex flex-col bg-[#0b0e17] min-h-0 border-l border-blue-500/25 rounded-l-2xl overflow-hidden shadow-[-12px_0_40px_rgba(0,0,0,0.5)]"
//                             style={{ height: "100dvh" }}
//                             onClick={e => e.stopPropagation()}
//                         >
//                             {view === "chat" ? (
//                                 <>
//                                     {/* Header */}
//                                     <div className="flex items-center gap-2.5 px-3.5 py-3.5 border-b border-white/[0.08] shrink-0">
//                                         <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 border border-blue-500/40">
//                                             <img src="/images/dollyavatar.png" alt="" className="w-full h-full object-cover" />
//                                         </div>
//                                         <div className="flex-1 min-w-0">
//                                             <div className="flex items-center gap-1.5 flex-wrap">
//                                                 <span className="font-extrabold text-[15px] text-white">Dolly</span>
//                                                 <span className="text-[9px] font-extrabold text-blue-400 bg-blue-500/15 border border-blue-500/35 rounded-md px-1.5 py-px">AI</span>
//                                                 {activeRoomName && (
//                                                     <span className="text-[9.5px] font-bold text-white/55 bg-white/[0.06] border border-white/10 rounded-md px-1.5 py-px truncate max-w-[120px]">
//                                                         {activeRoomName}
//                                                     </span>
//                                                 )}
//                                             </div>
//                                             <div className="flex items-center gap-1 mt-0.5">
//                                                 <Lock size={10} className="text-white/40" />
//                                                 <span className="text-[10.5px] text-white/40">Private · only you see this</span>
//                                             </div>
//                                         </div>
//                                         <button
//                                             type="button"
//                                             onClick={() => setView("history")}
//                                             title="Chat history"
//                                             className="w-8 h-8 rounded-full flex items-center justify-center bg-white/[0.06] border-none cursor-pointer text-white/60 shrink-0"
//                                         >
//                                             <HistoryIcon size={16} />
//                                         </button>
//                                         <button
//                                             type="button"
//                                             onClick={onClose}
//                                             className="w-8 h-8 rounded-full flex items-center justify-center bg-white/[0.06] border-none cursor-pointer text-white/60 shrink-0"
//                                         >
//                                             <X size={16} />
//                                         </button>
//                                     </div>

//                                     {/* Body */}
//                                     <div ref={bodyRef} className="flex-1 overflow-y-auto p-3.5 min-h-0 flex flex-col gap-3">
//                                         {loadingReplies ? (
//                                             <div className="flex-1 flex items-center justify-center py-10">
//                                                 <Loader2 size={22} className="text-blue-400 animate-spin" />
//                                             </div>
//                                         ) : (
//                                             <>
//                                                 {/* Greeting bubble */}
//                                                 <div className="flex gap-2 items-start">
//                                                     <div className="w-[26px] h-[26px] rounded-full overflow-hidden shrink-0">
//                                                         <img src="/images/dollyavatar.png" alt="" className="w-full h-full object-cover" />
//                                                     </div>
//                                                     <div className="bg-blue-500/[0.14] border border-blue-500/30 rounded-tl-[4px] rounded-tr-2xl rounded-bl-2xl rounded-br-2xl px-3 py-2.5 max-w-[82%]">
//                                                         <p className="m-0 text-[13px] leading-relaxed text-white">
//                                                             Hey! I'm Dolly 🐬 Your AI analyst for this match. Ask anything about {activeRoomName || "the match"}!
//                                                         </p>
//                                                     </div>
//                                                 </div>

//                                                 {replies.map((r) => (
//                                                     <React.Fragment key={r.id}>
//                                                         {/* user question, right aligned */}
//                                                         <div className="flex justify-end">
//                                                             <div className="bg-white/[0.08] rounded-tl-2xl rounded-tr-[4px] rounded-bl-2xl rounded-br-2xl px-3 py-2.5 max-w-[82%]">
//                                                                 <p className="m-0 text-[13px] leading-relaxed text-white">{r.question}</p>
//                                                             </div>
//                                                         </div>
//                                                         {/* dolly answer, left aligned */}
//                                                         <div className="flex gap-2 items-start">
//                                                             <div className="w-[26px] h-[26px] rounded-full overflow-hidden shrink-0">
//                                                                 <img src="/images/dollyavatar.png" alt="" className="w-full h-full object-cover" />
//                                                             </div>
//                                                             <div className="bg-blue-500/[0.14] border border-blue-500/30 rounded-tl-[4px] rounded-tr-2xl rounded-bl-2xl rounded-br-2xl px-3 py-2.5 max-w-[82%]">
//                                                                 {r.answer ? (
//                                                                     <p className="m-0 text-[13px] leading-relaxed text-white">{r.answer}</p>
//                                                                 ) : (
//                                                                     <span className="text-xs text-white/45 italic">thinking…</span>
//                                                                 )}
//                                                             </div>
//                                                         </div>
//                                                     </React.Fragment>
//                                                 ))}
//                                             </>
//                                         )}
//                                     </div>

//                                     {/* Footer input */}
//                                     <div className="px-3 py-2.5 border-t border-white/[0.08] shrink-0">
//                                         <div className="flex items-center gap-2 bg-white/5 border border-blue-500/30 rounded-full py-1.5 pl-3.5 pr-1.5">
//                                             <input
//                                                 ref={inputRef}
//                                                 type="text"
//                                                 value={question}
//                                                 onChange={e => setQuestion(e.target.value)}
//                                                 onKeyDown={e => { if (e.key === "Enter") handleSend(); }}
//                                                 placeholder="Ask about the match…"
//                                                 disabled={asking || loadingReplies}
//                                                 className="flex-1 bg-transparent border-none outline-none text-white text-[13.5px] disabled:opacity-50"
//                                             />
//                                             <motion.button
//                                                 whileTap={{ scale: 0.9 }}
//                                                 type="button"
//                                                 onClick={handleSend}
//                                                 disabled={!question.trim() || asking || loadingReplies}
//                                                 className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center border-none ${question.trim() && !loadingReplies ? "cursor-pointer bg-gradient-to-br from-blue-500 to-blue-900" : "cursor-default bg-white/[0.08]"}`}
//                                             >
//                                                 <Send size={14} className={question.trim() && !loadingReplies ? "text-white" : "text-white/30"} />
//                                             </motion.button>
//                                         </div>
//                                     </div>
//                                 </>
//                             ) : (
//                                 /* ── History view ── */
//                                 <>
//                                     <div className="flex items-center gap-2.5 px-3.5 py-3.5 border-b border-white/[0.08] shrink-0">
//                                         <button
//                                             type="button"
//                                             onClick={() => setView("chat")}
//                                             className="bg-transparent border-none cursor-pointer text-white/70 flex items-center p-0"
//                                         >
//                                             <ChevronLeft size={22} />
//                                         </button>
//                                         <span className="flex-1 font-extrabold text-[15px] text-white">Chat History</span>
//                                         <button
//                                             type="button"
//                                             onClick={onClose}
//                                             className="w-8 h-8 rounded-full flex items-center justify-center bg-white/[0.06] border-none cursor-pointer text-white/60 shrink-0"
//                                         >
//                                             <X size={16} />
//                                         </button>
//                                     </div>

//                                     <div className="flex-1 overflow-y-auto min-h-0 px-3 py-2.5">
//                                         <button
//                                             type="button"
//                                             onClick={() => { onNewChat?.(); setView("chat"); }}
//                                             className="w-full flex items-center gap-2.5 bg-transparent border-none cursor-pointer py-2.5 px-1.5 rounded-[10px] mb-2"
//                                         >
//                                             <div className="w-[34px] h-[34px] rounded-[10px] bg-blue-500/15 border border-blue-500/40 flex items-center justify-center shrink-0">
//                                                 <span className="text-[15px]">✏️</span>
//                                             </div>
//                                             <span className="text-sm font-bold text-blue-400">New Chat</span>
//                                         </button>

//                                         {loadingHistory ? (
//                                             <div className="flex items-center justify-center py-10">
//                                                 <Loader2 size={20} className="text-blue-400 animate-spin" />
//                                             </div>
//                                         ) : history.length === 0 ? (
//                                             <p className="text-center text-[12.5px] text-white/35 italic py-8">
//                                                 No Dolly conversations yet.
//                                             </p>
//                                         ) : (
//                                             history.map(h => {
//                                                 const isActive = h.roomId === activeRoomId;
//                                                 return (
//                                                     <button
//                                                         key={h.roomId}
//                                                         type="button"
//                                                         onClick={() => { onSelectHistorySession(h); setView("chat"); }}
//                                                         className={`w-full flex items-center gap-2.5 cursor-pointer p-2.5 rounded-xl mb-1.5 text-left border ${isActive
//                                                                 ? "bg-blue-500/[0.12] border-blue-500/40"
//                                                                 : h.isLive
//                                                                     ? "bg-pink-500/[0.08] border-pink-500/20"
//                                                                     : "bg-transparent border-transparent hover:bg-white/[0.04]"
//                                                             }`}
//                                                     >
//                                                         <div className={`w-[34px] h-[34px] rounded-[10px] overflow-hidden shrink-0 flex items-center justify-center ${h.isLive ? "bg-gradient-to-br from-pink-600 to-orange-500" : "bg-white/[0.06]"
//                                                             }`}>
//                                                             {!h.isLive && <span className="text-[15px]">{SPORT_EMOJI[h.sport ?? "general"] ?? "🎮"}</span>}
//                                                         </div>
//                                                         <div className="flex-1 min-w-0">
//                                                             <p className="m-0 text-[13.5px] font-bold text-white truncate">{h.title}</p>
//                                                             <p className="mt-0.5 mb-0 text-[11.5px] text-white/45 overflow-hidden text-ellipsis whitespace-nowrap">
//                                                                 {h.isLive ? "Today · Live now" : h.subtitle}
//                                                             </p>
//                                                         </div>
//                                                         {h.isLive ? (
//                                                             <span className="w-[7px] h-[7px] rounded-full bg-green-500 shrink-0" />
//                                                         ) : (
//                                                             <span className="text-[10.5px] text-white/30 shrink-0">{h.dateLabel}</span>
//                                                         )}
//                                                     </button>
//                                                 );
//                                             })
//                                         )}
//                                     </div>
//                                 </>
//                             )}
//                         </motion.div>
//                     </>
//                 )}
//             </AnimatePresence>
//         </>
//     );
// }




"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, History as HistoryIcon, X, Lock, Send, Loader2 } from "lucide-react";

export interface DollyReply {
    id: string;
    question: string;
    answer: string;
    createdAt: number;
}

export interface DollyHistorySession {
    roomId: string;         // the room this Dolly thread belongs to
    title: string;           // e.g. "IND vs PAK"
    subtitle: string;        // e.g. last question asked, or "Bumrah's already taken 2 early wickets in …"
    dateLabel: string;       // e.g. "Today" / "Mar 15, 2025"
    isLive?: boolean;
    sport?: string;
}

interface DollyPanelProps {
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;

    // The room whose thread is currently displayed in the chat view
    // (this is the room the messages/question box act on right now).
    activeRoomId?: string;
    activeRoomName?: string;

    question: string;
    setQuestion: (v: string) => void;
    asking: boolean;
    onAsk: () => void;

    replies: DollyReply[];
    loadingReplies?: boolean;

    // Every room that has a Dolly thread — current live room included.
    // Sort however you like; isLive rooms get a highlighted style automatically.
    history: DollyHistorySession[];
    loadingHistory?: boolean;

    // Called when the user taps a session in history — parent should fetch
    // that room's replies and update `replies` (+ activeRoomId/activeRoomName).
    onSelectHistorySession: (session: DollyHistorySession) => void;

    // Called when the user taps "New Chat" — parent should reset to the
    // live room's thread (or start a fresh one).
    onNewChat?: () => void;
    constrainedToParent?: boolean;
}

export default function DollyPanel({
    isOpen, onOpen, onClose,
    activeRoomId, activeRoomName,
    question, setQuestion, asking, onAsk,
    replies, loadingReplies = false,
    history,
    loadingHistory = false,
    onSelectHistorySession,
    onNewChat,
    constrainedToParent = false,
}: DollyPanelProps) {
    const [view, setView] = useState<"chat" | "history">("chat");
    const inputRef = useRef<HTMLInputElement>(null);
    const bodyRef = useRef<HTMLDivElement>(null);

    // ── Track the visual viewport so the panel shrinks (instead of scrolling
    // off-screen) when the mobile keyboard opens. `position: fixed` is
    // anchored to the layout viewport, which does NOT shrink when the
    // keyboard shows up — only the visual viewport does. Without this, the
    // browser scrolls the page to keep the focused input visible, dragging
    // the whole panel (header included) upward and out of view.
    const [viewportHeight, setViewportHeight] = useState<number | null>(null);

    useEffect(() => {
        if (typeof window === "undefined" || !window.visualViewport) return;

        const vv = window.visualViewport;

        const handleViewportChange = () => {
            setViewportHeight(vv.height);
            // Keep the page pinned at the top so the fixed panel's `top: 0`
            // actually lines up with the visible area above the keyboard.
            window.scrollTo(0, 0);
        };

        vv.addEventListener("resize", handleViewportChange);
        vv.addEventListener("scroll", handleViewportChange);
        handleViewportChange();

        return () => {
            vv.removeEventListener("resize", handleViewportChange);
            vv.removeEventListener("scroll", handleViewportChange);
        };
    }, []);

    useEffect(() => {
        if (isOpen && view === "chat" && !loadingReplies) {
            setTimeout(() => inputRef.current?.focus(), 350);
        }
    }, [isOpen, view, loadingReplies]);

    useEffect(() => {
        if (isOpen && view === "chat" && bodyRef.current) {
            bodyRef.current.scrollTo({ top: bodyRef.current.scrollHeight, behavior: "smooth" });
        }
    }, [replies, isOpen, view]);

    useEffect(() => {
        if (isOpen) setView("chat");
    }, [isOpen]);

    const handleSend = () => {
        if (!question.trim() || asking) return;
        onAsk();
    };

    const SPORT_EMOJI: Record<string, string> = {
        cricket: "🏏",
        football: "⚽",
        general: "🎮",
    };

    return (
        <>
            {/* ── Vertical trigger tab · right side, middle ── */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        type="button"
                        onClick={onOpen}
                        initial={{ opacity: 0, x: 12 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 12 }}
                        transition={{ duration: 0.2 }}
                        className={`${constrainedToParent ? "absolute" : "fixed"} right-0 top-1/2 -translate-y-1/2 z-[55] flex flex-col items-center gap-2 py-2 px-1 rounded-l-2xl rounded-r-none bg-gradient-to-b from-blue-900 to-slate-800 border border-r-0 border-blue-500/50 shadow-[-4px_4px_20px_rgba(59,130,246,0.35)] cursor-pointer`}
                    >
                        <div className="w-[24px] h-[24px] rounded-full overflow-hidden border-2 border-white/85 shrink-0">
                            <img
                                src="/images/dollyavatar.png"
                                alt="Ask Dolly"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <span
                            className="text-[8px] font-extrabold tracking-[0.08em] text-blue-300 uppercase"
                            style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
                        >
                            Ask Dolly
                        </span>
                    </motion.button>
                )}
            </AnimatePresence>

            {/* ── Backdrop + sliding panel ── */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            key="dolly-backdrop"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            onClick={onClose}
                            className={`${constrainedToParent ? "absolute" : "fixed"} inset-0 z-[70] bg-black/55`}
                        />
                        <motion.div
                            key="dolly-panel"
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
                            className={`${constrainedToParent ? "absolute" : "fixed"} right-0 left-8 sm:left-16 z-[71] flex flex-col min-h-0 bg-[#0b0e17] border-l border-blue-500/25 rounded-l-2xl overflow-hidden shadow-[-12px_0_40px_rgba(0,0,0,0.5)]`}
                            style={constrainedToParent ? { top: 0, bottom: 0, height: "100%" } : { top: 0, height: viewportHeight ?? "100dvh" }}
                            onClick={e => e.stopPropagation()}
                        >
                            {view === "chat" ? (
                                <>
                                    {/* Header */}
                                    <div className="flex items-center gap-2.5 px-3.5 py-3.5 border-b border-white/[0.08] shrink-0">
                                        <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 border border-blue-500/40">
                                            <img src="/images/dollyavatar.png" alt="" className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                <span className="font-extrabold text-[15px] text-white">Dolly</span>
                                                <span className="text-[9px] font-extrabold text-blue-400 bg-blue-500/15 border border-blue-500/35 rounded-md px-1.5 py-px">AI</span>
                                                {activeRoomName && (
                                                    <span className="text-[9.5px] font-bold text-white/55 bg-white/[0.06] border border-white/10 rounded-md px-1.5 py-px truncate max-w-[120px]">
                                                        {activeRoomName}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1 mt-0.5">
                                                <Lock size={10} className="text-white/40" />
                                                <span className="text-[10.5px] text-white/40">Private · only you see this</span>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setView("history")}
                                            title="Chat history"
                                            className="w-8 h-8 rounded-full flex items-center justify-center bg-white/[0.06] border-none cursor-pointer text-white/60 shrink-0"
                                        >
                                            <HistoryIcon size={16} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={onClose}
                                            className="w-8 h-8 rounded-full flex items-center justify-center bg-white/[0.06] border-none cursor-pointer text-white/60 shrink-0"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>

                                    {/* Body */}
                                    <div ref={bodyRef} className="flex-1 min-h-0 overflow-y-auto p-3.5 flex flex-col gap-3">
                                        {loadingReplies ? (
                                            <div className="flex-1 flex items-center justify-center py-10">
                                                <Loader2 size={22} className="text-blue-400 animate-spin" />
                                            </div>
                                        ) : (
                                            <>
                                                {/* Greeting bubble */}
                                                <div className="flex gap-2 items-start">
                                                    <div className="w-[26px] h-[26px] rounded-full overflow-hidden shrink-0">
                                                        <img src="/images/dollyavatar.png" alt="" className="w-full h-full object-cover" />
                                                    </div>
                                                    <div className="bg-blue-500/[0.14] border border-blue-500/30 rounded-tl-[4px] rounded-tr-2xl rounded-bl-2xl rounded-br-2xl px-3 py-2.5 max-w-[82%]">
                                                        <p className="m-0 text-[13px] leading-relaxed text-white">
                                                            Hey! I'm Dolly 🐬 Your AI analyst for this match. Ask anything about {activeRoomName || "the match"}!
                                                        </p>
                                                    </div>
                                                </div>

                                                {replies.map((r) => (
                                                    <React.Fragment key={r.id}>
                                                        {/* user question, right aligned */}
                                                        <div className="flex justify-end">
                                                            <div className="bg-white/[0.08] rounded-tl-2xl rounded-tr-[4px] rounded-bl-2xl rounded-br-2xl px-3 py-2.5 max-w-[82%]">
                                                                <p className="m-0 text-[13px] leading-relaxed text-white">{r.question}</p>
                                                            </div>
                                                        </div>
                                                        {/* dolly answer, left aligned */}
                                                        <div className="flex gap-2 items-start">
                                                            <div className="w-[26px] h-[26px] rounded-full overflow-hidden shrink-0">
                                                                <img src="/images/dollyavatar.png" alt="" className="w-full h-full object-cover" />
                                                            </div>
                                                            <div className="bg-blue-500/[0.14] border border-blue-500/30 rounded-tl-[4px] rounded-tr-2xl rounded-bl-2xl rounded-br-2xl px-3 py-2.5 max-w-[82%]">
                                                                {r.answer ? (
                                                                    <p className="m-0 text-[13px] leading-relaxed text-white">{r.answer}</p>
                                                                ) : (
                                                                    <span className="text-xs text-white/45 italic">thinking…</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </React.Fragment>
                                                ))}
                                            </>
                                        )}
                                    </div>

                                    {/* Footer input */}
                                    <div className="px-3 py-2.5 border-t border-white/[0.08] shrink-0">
                                        <div className="flex items-center gap-2 bg-white/5 border border-blue-500/30 rounded-full py-1.5 pl-3.5 pr-1.5">
                                            <input
                                                ref={inputRef}
                                                type="text"
                                                value={question}
                                                onChange={e => setQuestion(e.target.value)}
                                                onKeyDown={e => { if (e.key === "Enter") handleSend(); }}
                                                placeholder="Ask about the match…"
                                                disabled={asking || loadingReplies}
                                                className="flex-1 bg-transparent border-none outline-none text-white text-[13.5px] disabled:opacity-50"
                                            />
                                            <motion.button
                                                whileTap={{ scale: 0.9 }}
                                                type="button"
                                                onClick={handleSend}
                                                disabled={!question.trim() || asking || loadingReplies}
                                                className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center border-none ${question.trim() && !loadingReplies ? "cursor-pointer bg-gradient-to-br from-blue-500 to-blue-900" : "cursor-default bg-white/[0.08]"}`}
                                            >
                                                <Send size={14} className={question.trim() && !loadingReplies ? "text-white" : "text-white/30"} />
                                            </motion.button>
                                         
                                        </div>
                                    </div>
                                       <p className="text-[8px] text-gray-300 mb-2 ml-4">Ask Dolly loves sports but isn't always right. Double-check important information.</p>
                                </>
                            ) : (
                                /* ── History view ── */
                                <>
                                    <div className="flex items-center gap-2.5 px-3.5 py-3.5 border-b border-white/[0.08] shrink-0">
                                        <button
                                            type="button"
                                            onClick={() => setView("chat")}
                                            className="bg-transparent border-none cursor-pointer text-white/70 flex items-center p-0"
                                        >
                                            <ChevronLeft size={22} />
                                        </button>
                                        <span className="flex-1 font-extrabold text-[15px] text-white">Chat History</span>
                                        <button
                                            type="button"
                                            onClick={onClose}
                                            className="w-8 h-8 rounded-full flex items-center justify-center bg-white/[0.06] border-none cursor-pointer text-white/60 shrink-0"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>

                                    <div className="flex-1 min-h-0 overflow-y-auto px-3 py-2.5">
                                        <button
                                            type="button"
                                            onClick={() => { onNewChat?.(); setView("chat"); }}
                                            className="w-full flex items-center gap-2.5 bg-transparent border-none cursor-pointer py-2.5 px-1.5 rounded-[10px] mb-2"
                                        >
                                            <div className="w-[34px] h-[34px] rounded-[10px] bg-blue-500/15 border border-blue-500/40 flex items-center justify-center shrink-0">
                                                <span className="text-[15px]">✏️</span>
                                            </div>
                                            <span className="text-sm font-bold text-blue-400">New Chat</span>
                                        </button>

                                        {loadingHistory ? (
                                            <div className="flex items-center justify-center py-10">
                                                <Loader2 size={20} className="text-blue-400 animate-spin" />
                                            </div>
                                        ) : history.length === 0 ? (
                                            <p className="text-center text-[12.5px] text-white/35 italic py-8">
                                                No Dolly conversations yet.
                                            </p>
                                        ) : (
                                            history.map(h => {
                                                const isActive = h.roomId === activeRoomId;
                                                return (
                                                    <button
                                                        key={h.roomId}
                                                        type="button"
                                                        onClick={() => { onSelectHistorySession(h); setView("chat"); }}
                                                        className={`w-full flex items-center gap-2.5 cursor-pointer p-2.5 rounded-xl mb-1.5 text-left border ${isActive
                                                                ? "bg-blue-500/[0.12] border-blue-500/40"
                                                                : h.isLive
                                                                    ? "bg-pink-500/[0.08] border-pink-500/20"
                                                                    : "bg-transparent border-transparent hover:bg-white/[0.04]"
                                                            }`}
                                                    >
                                                        <div className={`w-[34px] h-[34px] rounded-[10px] overflow-hidden shrink-0 flex items-center justify-center ${h.isLive ? "bg-gradient-to-br from-pink-600 to-orange-500" : "bg-white/[0.06]"
                                                            }`}>
                                                            {!h.isLive && <span className="text-[15px]">{SPORT_EMOJI[h.sport ?? "general"] ?? "🎮"}</span>}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="m-0 text-[13.5px] font-bold text-white truncate">{h.title}</p>
                                                            <p className="mt-0.5 mb-0 text-[11.5px] text-white/45 overflow-hidden text-ellipsis whitespace-nowrap">
                                                                {h.isLive ? "Today · Live now" : h.subtitle}
                                                            </p>
                                                        </div>
                                                        {h.isLive ? (
                                                            <span className="w-[7px] h-[7px] rounded-full bg-green-500 shrink-0" />
                                                        ) : (
                                                            <span className="text-[10.5px] text-white/30 shrink-0">{h.dateLabel}</span>
                                                        )}
                                                    </button>
                                                );
                                            })
                                        )}
                                    </div>
                                </>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}