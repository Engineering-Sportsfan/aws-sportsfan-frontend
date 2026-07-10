// components/ChatComponent/index.tsx — FIXED v4
// Fixes:
//   1. Context menu (edit/delete) now appears on left-click for ALL messages
//   2. Received message avatar/name now correctly shows the OTHER person's name
//   3. Premium dark theme — deep slate/charcoal base, rose-gold accents, not flat pink
"use client";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  ChevronLeft, Plus, X, MoreVertical, Mic, CheckCheck, Reply,
  Edit2, Trash2, Copy, Search, BadgeCheck, Loader2, AlertCircle,
  Phone, Video, Info, Smile, Paperclip, Send, ArrowDown, Star,
  BellOff, Shield, Flag, Image, FileText, Sticker, ThumbsUp,
  Heart, MicOff, PhoneOff, Camera, RotateCcw, Forward, Pin,
  EyeOff, Clock, Check, Bookmark, ChevronDown, Zap, MessageCircle,
  Circle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useChats, useMessages, useCreateChat, timeAgo } from "../../../hooks/useChat";
import { useAuth } from "@/context/AuthContext";
import { ChatAPI, resolveChatName, type Chat, type Message } from "../../../lib/chatApi";

// ─── Types ───────────────────────────────────────────────────────────────────
type ViewType = "list" | "chat_room";
type MessageStatus = "sending" | "sent" | "delivered" | "read" | "failed";
type TypingState = { userId: string; name: string; since: number };
type PickerUser = {
  userId?: string; user_id?: string; id?: string; email?: string;
  firstName?: string; lastName?: string; name?: string; avatar?: string;
};
type PinnedMessage = { id: string; content: string; senderId: string };
type VoiceNote = { duration: number; url?: string };

// ─── Theme ───────────────────────────────────────────────────────────────────
// Base:          #0a0c10  (deep navy-charcoal)
// Surface:       #111318  (card bg)
// Elevated:      #181c24  (modals, menus)
// Border:        rgba(220,160,120,0.12)  (rose-gold)
// Accent:        #c8705a  (rose-gold / burnt sienna)
// Accent light:  #e8967e
// Sent bubble:   linear rose-gold gradient
// Text muted:    #7a6a65

// ─── Reactions ───────────────────────────────────────────────────────────────
const REACTIONS = [
  { emoji: "❤️", label: "Love" }, { emoji: "😆", label: "Haha" },
  { emoji: "😮", label: "Wow" }, { emoji: "😢", label: "Sad" },
  { emoji: "😠", label: "Angry" }, { emoji: "👍", label: "Like" },
  { emoji: "🔥", label: "Fire" }, { emoji: "🎉", label: "Party" },
];
const QUICK_REPLIES = ["👍 Sounds good!", "On my way 🚗", "Can we talk later?", "Thanks! 🙌"];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatMsgTime(ts: number) {
  const d = new Date(ts);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return (
    d.toLocaleDateString([], { month: "short", day: "numeric" }) + " " +
    d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  );
}
function formatListTime(ts?: number) {
  if (!ts) return "";
  const d = new Date(ts);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);
  if (diffMin < 1) return "now";
  if (diffMin < 60) return `${diffMin}m`;
  if (diffHr < 24) return `${diffHr}h`;
  if (diffDay < 7) return `${diffDay}d`;
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}
function formatDuration(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
const Avatar = ({
  src, name, size = 44, online = false, typing = false, className = "",
}: {
  src?: string | null; name: string; size?: number;
  online?: boolean; typing?: boolean; className?: string;
}) => {
  const [err, setErr] = useState(false);
  const letter = (name || "?").charAt(0).toUpperCase();
  // Warm hue range: 10-40 (orange-rose), ensures rose-gold palette
  const hue = ([...name].reduce((a, c) => a + c.charCodeAt(0), 0) % 30) + 10;
  return (
    <div className={`relative flex-shrink-0 ${className}`} style={{ width: size, height: size }}>
      <div
        className="w-full h-full rounded-full overflow-hidden flex items-center justify-center font-bold text-white select-none"
        style={{
          background: src && !err
            ? undefined
            : `linear-gradient(145deg, hsl(${hue},65%,52%), hsl(${hue + 20},55%,35%))`,
          fontSize: size * 0.38,
          boxShadow: `0 0 0 1.5px rgba(200,112,90,0.25)`,
        }}
      >
        {src && !err
          ? <img src={src} alt={name} className="w-full h-full object-cover" onError={() => setErr(true)} />
          : letter}
      </div>
      {(online || typing) && (
        <span
          className={`absolute bottom-0 right-0 rounded-full border-2 border-[#0a0c10] transition-colors duration-300 ${typing ? "bg-amber-400" : "bg-emerald-400"
            }`}
          style={{ width: size * 0.28, height: size * 0.28 }}
        />
      )}
    </div>
  );
};

// ─── Read Ticks ───────────────────────────────────────────────────────────────
const Ticks = ({ status }: { status: MessageStatus }) => {
  if (status === "sending") return <Loader2 size={11} className="animate-spin text-white/40" />;
  if (status === "failed") return <AlertCircle size={11} className="text-rose-400" />;
  if (status === "sent") return <Check size={13} className="text-white/50" />;
  if (status === "delivered") return <CheckCheck size={13} className="text-white/50" />;
  return <CheckCheck size={13} className="text-[#e8967e]" />;
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const SkeletonRow = () => (
  <div className="flex items-center gap-3 px-4 py-3 animate-pulse">
    <div className="w-[56px] h-[56px] rounded-full bg-[#c8705a]/[0.08] flex-shrink-0" />
    <div className="flex-1 flex flex-col gap-2">
      <div className="h-[14px] bg-[#c8705a]/[0.07] rounded-full w-2/5" />
      <div className="h-[12px] bg-[#c8705a]/[0.04] rounded-full w-3/5" />
    </div>
    <div className="h-[10px] bg-white/[0.04] rounded-full w-8" />
  </div>
);

// ─── Date Divider ─────────────────────────────────────────────────────────────
const DateDivider = ({ label }: { label: string }) => (
  <div className="flex items-center justify-center my-4 gap-3">
    <div className="flex-1 h-px bg-[#c8705a]/[0.10]" />
    <span className="text-[10px] text-[#7a6a65] px-3 tracking-widest uppercase font-semibold">
      {label}
    </span>
    <div className="flex-1 h-px bg-[#c8705a]/[0.10]" />
  </div>
);

// ─── Typing Indicator ─────────────────────────────────────────────────────────
const TypingIndicator = ({ name }: { name: string }) => (
  <div className="flex items-end gap-2 mt-2 mb-1">
    <div className="w-7 flex-shrink-0" />
    <div className="bg-[#181c24] rounded-[20px] rounded-bl-[5px] px-4 py-3 flex items-center gap-1.5 border border-[#c8705a]/[0.12] shadow-sm">
      <span className="w-1.5 h-1.5 bg-[#c8705a]/70 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
      <span className="w-1.5 h-1.5 bg-[#c8705a]/70 rounded-full animate-bounce" style={{ animationDelay: "120ms" }} />
      <span className="w-1.5 h-1.5 bg-[#c8705a]/70 rounded-full animate-bounce" style={{ animationDelay: "240ms" }} />
    </div>
    <span className="text-[11px] text-[#7a6a65] mb-1">{name} is typing…</span>
  </div>
);

// ─── Voice Note Player ────────────────────────────────────────────────────────
const VoiceNotePlayer = ({ isMe, duration }: { isMe: boolean; duration: number }) => {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    if (!playing) return;
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { setPlaying(false); return 0; }
        return p + (100 / (duration * 10));
      });
    }, 100);
    return () => clearInterval(interval);
  }, [playing, duration]);
  const bars = Array.from({ length: 28 }, (_, i) => 4 + Math.abs(Math.sin(i * 0.8 + 1.2) * 20));
  return (
    <div className="flex items-center gap-3 min-w-[180px]">
      <button
        onClick={() => setPlaying(p => !p)}
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${isMe ? "bg-white/20 hover:bg-white/30" : "bg-[#c8705a]/20 hover:bg-[#c8705a]/30"
          }`}
      >
        {playing
          ? <div className="flex gap-0.5"><span className="w-1 h-3 bg-current rounded-sm" /><span className="w-1 h-3 bg-current rounded-sm" /></div>
          : <div className="w-0 h-0 border-y-[5px] border-y-transparent border-l-[9px] border-l-current ml-0.5" />}
      </button>
      <div className="flex items-center gap-[1.5px] flex-1">
        {bars.map((h, i) => (
          <div
            key={i}
            className="rounded-full flex-shrink-0 transition-all duration-150"
            style={{
              width: 2, height: h,
              background: i / bars.length <= progress / 100
                ? isMe ? "#fff" : "#c8705a"
                : isMe ? "rgba(255,255,255,0.3)" : "rgba(200,112,90,0.3)",
            }}
          />
        ))}
      </div>
      <span className={`text-[11px] flex-shrink-0 ${isMe ? "text-white/60" : "text-[#7a6a65]"}`}>
        {formatDuration(playing ? Math.round((progress / 100) * duration) : duration)}
      </span>
    </div>
  );
};

// ─── Reaction Display ─────────────────────────────────────────────────────────
const ReactionBadge = ({ reactions, isMe }: { reactions: Record<string, number>; isMe: boolean }) => {
  const total = Object.values(reactions).reduce((a, b) => a + b, 0);
  if (!total) return null;
  const topEmoji = Object.entries(reactions).sort((a, b) => b[1] - a[1])[0]?.[0];
  return (
    <div className={`absolute -bottom-3 flex items-center gap-0.5 bg-[#181c24] border border-[#c8705a]/[0.20] rounded-full px-1.5 py-0.5 shadow-lg cursor-pointer hover:scale-105 transition-transform ${isMe ? "left-2" : "right-2"}`}>
      <span className="text-[13px] leading-none">{topEmoji}</span>
      {total > 1 && <span className="text-[10px] text-[#c8705a]/80 font-semibold">{total}</span>}
    </div>
  );
};

// ─── Error Banner ─────────────────────────────────────────────────────────────
const Err = ({ msg, retry }: { msg: string; retry?: () => void }) => (
  <div className="flex items-center gap-2.5 bg-rose-950/30 border border-rose-500/20 text-rose-400 text-sm px-4 py-3 rounded-2xl mx-4 my-2">
    <AlertCircle size={15} className="flex-shrink-0" />
    <span className="flex-1 text-[13px]">{msg}</span>
    {retry && <button onClick={retry} className="text-rose-300 text-xs underline">Retry</button>}
  </div>
);

// ─── Modal Backdrop ───────────────────────────────────────────────────────────
const Modal = ({ children, onClose }: { children: React.ReactNode; onClose: () => void }) => (
  <div
    className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-[6px] p-4"
    onClick={e => { if (e.target === e.currentTarget) onClose(); }}
  >
    {children}
  </div>
);

// ─── User Picker Modal ────────────────────────────────────────────────────────
const UserPickerModal = ({
  open, onClose, onPickUser,
}: { open: boolean; onClose: () => void; onPickUser: (id: string, name: string) => void }) => {
  const [q, setQ] = useState("");
  const [users, setUsers] = useState<PickerUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!open) { setQ(""); return; }
    setLoading(true); setError(null);
    const ac = new AbortController();
    fetch("/api/users", { signal: ac.signal, credentials: "include" })
      .then(r => r.json())
      .then(j => setUsers(Array.isArray(j.users) ? j.users : []))
      .catch(e => { if (e.name !== "AbortError") setError("Failed to load users"); })
      .finally(() => setLoading(false));
    return () => ac.abort();
  }, [open]);
  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 80); }, [open]);
  if (!open) return null;
  const filtered = users.filter(u => {
    const n = `${u.firstName ?? u.name ?? ""} ${u.lastName ?? ""}`.toLowerCase();
    return n.includes(q.toLowerCase()) || (u.email ?? "").toLowerCase().includes(q.toLowerCase());
  });
  return (
    <Modal onClose={onClose}>
      <div className="bg-[#111318] w-full max-w-[420px] rounded-3xl overflow-hidden shadow-2xl border border-[#c8705a]/[0.18]" style={{ maxHeight: "80vh" }}>
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[#c8705a]/[0.08]">
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-[#c8705a]/[0.12] flex items-center justify-center hover:bg-[#c8705a]/[0.22] transition">
            <X size={16} />
          </button>
          <h3 className="font-bold text-[15px] text-white">New Message</h3>
        </div>
        <div className="px-4 pt-3 pb-2">
          <div className="flex items-center gap-2.5 bg-[#c8705a]/[0.06] rounded-full px-4 py-2.5 border border-[#c8705a]/[0.12] focus-within:border-[#c8705a]/40 transition-colors">
            <Search size={14} className="text-[#7a6a65]" />
            <input ref={inputRef} value={q} onChange={e => setQ(e.target.value)} placeholder="Search people…" className="flex-1 bg-transparent outline-none text-sm text-white placeholder-[#4a3a35]" />
            {q && <button onClick={() => setQ("")}><X size={13} className="text-[#4a3a35]" /></button>}
          </div>
        </div>
        <div className="overflow-y-auto [&::-webkit-scrollbar]:hidden" style={{ maxHeight: "55vh" }}>
          {loading && <div className="flex items-center justify-center gap-2.5 py-10 text-[#7a6a65] text-sm"><Loader2 size={16} className="animate-spin" /> Loading…</div>}
          {error && <div className="px-5 py-4 text-rose-400 text-sm text-center">{error}</div>}
          {!loading && !error && filtered.length === 0 && <div className="px-5 py-10 text-center text-[#4a3a35] text-sm">No people found</div>}
          {filtered.map((u, i) => {
            const id = u.userId ?? u.user_id ?? u.id ?? u.email ?? "";
            const displayName = (u.name?.trim()) || `${u.firstName ?? ""}${u.lastName ? " " + u.lastName : ""}`.trim() || id;
            return (
              <div key={`${id}-${i}`} onClick={() => onPickUser(id, displayName)} className="flex items-center gap-3.5 px-5 py-3 hover:bg-[#c8705a]/[0.05] cursor-pointer transition-colors active:bg-[#c8705a]/[0.10]">
                <Avatar src={u.avatar} name={displayName} size={44} />
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-semibold text-white truncate">{displayName}</div>
                  {u.email && <div className="text-[12px] text-[#7a6a65] truncate">{u.email}</div>}
                </div>
                <div className="w-5 h-5 rounded-full border-2 border-[#c8705a]/50 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#c8705a]/40" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
};

// ─── Chat Info Modal ──────────────────────────────────────────────────────────
const ChatInfoModal = ({ chat, displayName, onClose, onBlock, onReport, onMute, onClearHistory }: {
  chat: Chat; displayName: string; onClose: () => void;
  onBlock: () => void; onReport: () => void; onMute: () => void; onClearHistory: () => void;
}) => (
  <Modal onClose={onClose}>
    <div className="bg-[#111318] w-full max-w-[380px] rounded-3xl overflow-hidden shadow-2xl border border-[#c8705a]/[0.18]">
      <div className="flex flex-col items-center px-6 pt-7 pb-5 border-b border-[#c8705a]/[0.08]">
        <Avatar src={chat.avatarUrl} name={displayName} size={76} online={chat.isOnline} />
        <h3 className="mt-3 font-bold text-[18px] text-white flex items-center gap-1.5">
          {displayName}
          {chat.isVerified && <BadgeCheck size={16} className="text-[#e8967e]" />}
        </h3>
        {chat.isOnline
          ? <span className="text-[12px] text-emerald-400 mt-0.5 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />Active now</span>
          : chat.lastMessageAt
            ? <span className="text-[12px] text-[#7a6a65] mt-0.5">Last active {timeAgo(chat.lastMessageAt)}</span>
            : null}
        <div className="flex gap-4 mt-4">
          {[{ icon: <Phone size={18} />, label: "Audio" }, { icon: <Video size={18} />, label: "Video" }, { icon: <BellOff size={18} />, label: "Mute" }].map(a => (
            <button key={a.label} className="flex flex-col items-center gap-1.5 group">
              <div className="w-11 h-11 rounded-full bg-[#c8705a]/[0.12] flex items-center justify-center group-hover:bg-[#c8705a]/[0.22] transition text-[#c8705a]">{a.icon}</div>
              <span className="text-[10px] text-[#7a6a65]">{a.label}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="py-2">
        {[
          { icon: <Star size={17} />, label: "Mark as favourite", action: () => { }, color: "text-gray-300" },
          { icon: <EyeOff size={17} />, label: "Vanish mode", action: () => { }, color: "text-gray-300" },
          { icon: <Trash2 size={17} />, label: "Clear chat history", action: onClearHistory, color: "text-amber-400" },
          { icon: <Shield size={17} />, label: "Block user", action: onBlock, color: "text-rose-400" },
          { icon: <Flag size={17} />, label: "Report user", action: onReport, color: "text-rose-400" },
        ].map(row => (
          <button key={row.label} onClick={() => { row.action(); onClose(); }} className={`w-full flex items-center gap-4 px-6 py-3 hover:bg-[#c8705a]/[0.05] transition-colors ${row.color}`}>
            {row.icon}
            <span className="text-[14px] font-medium">{row.label}</span>
          </button>
        ))}
      </div>
      <div className="px-5 pb-5 pt-1">
        <button onClick={onClose} className="w-full py-3 rounded-2xl bg-[#c8705a]/[0.08] text-gray-300 text-[14px] font-semibold hover:bg-[#c8705a]/[0.15] transition">Cancel</button>
      </div>
    </div>
  </Modal>
);

// ─── Delete Modal ─────────────────────────────────────────────────────────────
const DeleteModal = ({ onConfirm, onCancel, forEveryone }: {
  onConfirm: (forEveryone: boolean) => void; onCancel: () => void; forEveryone: boolean;
}) => (
  <Modal onClose={onCancel}>
    <div className="bg-[#111318] w-full max-w-[340px] rounded-3xl overflow-hidden border border-[#c8705a]/[0.18] shadow-2xl">
      <div className="px-6 pt-6 pb-4 text-center">
        <div className="w-14 h-14 rounded-full bg-rose-500/10 flex items-center justify-center mx-auto mb-3">
          <Trash2 size={22} className="text-rose-400" />
        </div>
        <h3 className="font-bold text-[16px] text-white mb-1.5">Delete message?</h3>
        <p className="text-[13px] text-[#7a6a65] leading-relaxed">Choose who to delete this message for.</p>
      </div>
      <div className="flex flex-col border-t border-[#c8705a]/[0.08]">
        {forEveryone && (
          <button onClick={() => onConfirm(true)} className="py-4 text-[14px] font-semibold text-rose-400 hover:bg-rose-500/10 transition border-b border-[#c8705a]/[0.08]">
            Delete for Everyone
          </button>
        )}
        <button onClick={() => onConfirm(false)} className="py-4 text-[14px] font-semibold text-gray-300 hover:bg-[#c8705a]/[0.05] transition border-b border-[#c8705a]/[0.08]">
          Delete for Me
        </button>
        <button onClick={onCancel} className="py-4 text-[14px] text-[#7a6a65] hover:bg-[#c8705a]/[0.04] transition">Cancel</button>
      </div>
    </div>
  </Modal>
);

// ─── Forward Modal ────────────────────────────────────────────────────────────
const ForwardModal = ({ chats, onForward, onClose, currentUserId }: {
  chats: Chat[]; onForward: (chatId: string) => void; onClose: () => void; currentUserId: string;
}) => (
  <Modal onClose={onClose}>
    <div className="bg-[#111318] w-full max-w-[400px] rounded-3xl overflow-hidden border border-[#c8705a]/[0.18] shadow-2xl">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-[#c8705a]/[0.08]">
        <button onClick={onClose} className="w-8 h-8 rounded-full bg-[#c8705a]/[0.12] flex items-center justify-center hover:bg-[#c8705a]/[0.22] transition"><X size={16} /></button>
        <h3 className="font-bold text-[15px] text-white">Forward to…</h3>
      </div>
      <div className="overflow-y-auto max-h-[50vh] [&::-webkit-scrollbar]:hidden">
        {chats.map(chat => {
          const name = resolveChatName(chat, currentUserId);
          return (
            <div key={chat.id} onClick={() => onForward(chat.id)} className="flex items-center gap-3.5 px-5 py-3 hover:bg-[#c8705a]/[0.05] cursor-pointer transition-colors">
              <Avatar src={chat.avatarUrl} name={name} size={44} />
              <span className="text-[14px] font-medium text-white">{name}</span>
            </div>
          );
        })}
      </div>
    </div>
  </Modal>
);

// ─── Pinned Message Banner ────────────────────────────────────────────────────
const PinnedBanner = ({ msg, onDismiss, onJump }: { msg: PinnedMessage; onDismiss: () => void; onJump: () => void }) => (
  <div className="flex items-center gap-2 px-4 py-2.5 bg-[#c8705a]/[0.07] border-b border-[#c8705a]/[0.12] cursor-pointer" onClick={onJump}>
    <Pin size={12} className="text-[#c8705a] flex-shrink-0 rotate-45" />
    <div className="flex-1 min-w-0">
      <p className="text-[10px] text-[#c8705a] font-semibold uppercase tracking-wider">Pinned</p>
      <p className="text-[12px] text-gray-300 truncate">{msg.content}</p>
    </div>
    <button onClick={e => { e.stopPropagation(); onDismiss(); }} className="w-6 h-6 flex items-center justify-center hover:bg-[#c8705a]/[0.10] rounded-full transition">
      <X size={12} className="text-[#7a6a65]" />
    </button>
  </div>
);

// ─── Quick Replies ────────────────────────────────────────────────────────────
const QuickReplies = ({ onSelect }: { onSelect: (text: string) => void }) => (
  <div className="flex gap-2 px-3 py-2 overflow-x-auto [&::-webkit-scrollbar]:hidden">
    {QUICK_REPLIES.map(r => (
      <button key={r} onClick={() => onSelect(r)} className="flex-shrink-0 px-3.5 py-1.5 rounded-full bg-[#111318] border border-[#c8705a]/[0.18] text-[12px] text-gray-300 hover:bg-[#181c24] hover:border-[#c8705a]/35 transition-all">
        {r}
      </button>
    ))}
  </div>
);

// ─── Emoji Picker ─────────────────────────────────────────────────────────────
const EmojiPicker = ({ onSelect, onClose }: { onSelect: (e: string) => void; onClose: () => void }) => {
  const emojis = ["😀", "😂", "😍", "🥰", "😎", "🤔", "😴", "🥳", "🎉", "❤️", "🔥", "👍", "👏", "🙏", "💪", "🎯", "✨", "🌟", "💯", "🚀", "🎵", "💡", "🤝", "😊", "😢", "😮", "😡", "🤗", "😏", "🥺"];
  return (
    <div className="absolute bottom-full mb-2 right-0 w-[280px] bg-[#111318] border border-[#c8705a]/[0.18] rounded-2xl shadow-2xl p-3 z-50">
      <div className="grid grid-cols-8 gap-1.5">
        {emojis.map(e => (
          <button key={e} onClick={() => { onSelect(e); onClose(); }} className="text-[20px] flex items-center justify-center h-9 rounded-xl hover:bg-[#c8705a]/[0.10] transition">
            {e}
          </button>
        ))}
      </div>
    </div>
  );
};

// ─── Attachment Menu ──────────────────────────────────────────────────────────
const AttachmentMenu = ({ onClose, onSelect }: { onClose: () => void; onSelect: (type: string) => void }) => (
  <div className="absolute bottom-full mb-2 left-0 bg-[#111318] border border-[#c8705a]/[0.18] rounded-2xl shadow-2xl overflow-hidden z-50 w-[180px]">
    {[
      { icon: <Image size={16} />, label: "Photo / Video", type: "media" },
      { icon: <FileText size={16} />, label: "Document", type: "document" },
      { icon: <Camera size={16} />, label: "Camera", type: "camera" },
      { icon: <Sticker size={16} />, label: "Sticker", type: "sticker" },
    ].map(item => (
      <button key={item.type} onClick={() => { onSelect(item.type); onClose(); }} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#c8705a]/[0.07] transition text-gray-300 text-[13px]">
        <span className="text-[#c8705a]">{item.icon}</span>
        {item.label}
      </button>
    ))}
  </div>
);

// ─── Search in Chat ───────────────────────────────────────────────────────────
const SearchInChat = ({ messages, onJump, onClose }: {
  messages: Message[]; onJump: (id: string) => void; onClose: () => void;
}) => {
  const [q, setQ] = useState("");
  const results = q.trim() ? messages.filter(m => !m.deletedAt && m.content.toLowerCase().includes(q.toLowerCase())) : [];
  return (
    <div className="absolute inset-x-0 top-0 bg-[#0a0c10] border-b border-[#c8705a]/[0.10] z-40 px-3 py-2.5">
      <div className="flex items-center gap-2">
        <div className="flex-1 flex items-center gap-2 bg-[#111318] rounded-full px-3 py-2 border border-[#c8705a]/[0.14] focus-within:border-[#c8705a]/40 transition">
          <Search size={14} className="text-[#7a6a65]" />
          <input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="Search in conversation…" className="flex-1 bg-transparent outline-none text-sm text-white placeholder-[#4a3a35]" />
        </div>
        <button onClick={onClose} className="text-[#c8705a] text-sm font-semibold px-1">Done</button>
      </div>
      {results.length > 0 && (
        <div className="mt-2 max-h-[40vh] overflow-y-auto [&::-webkit-scrollbar]:hidden">
          {results.map(m => (
            <div key={m.id} onClick={() => { onJump(m.id); onClose(); }} className="flex items-center gap-2 px-2 py-2.5 hover:bg-[#c8705a]/[0.05] cursor-pointer rounded-xl transition">
              <MessageCircle size={13} className="text-[#c8705a] flex-shrink-0" />
              <p className="text-[13px] text-gray-300 truncate">{m.content}</p>
              <span className="text-[10px] text-[#4a3a35] ml-auto flex-shrink-0">{formatMsgTime(m.createdAt)}</span>
            </div>
          ))}
        </div>
      )}
      {q && results.length === 0 && <p className="text-[12px] text-[#4a3a35] text-center py-3">No results for "{q}"</p>}
    </div>
  );
};

// ─── Schedule Modal ───────────────────────────────────────────────────────────
const ScheduleModal = ({ text, onSchedule, onClose }: {
  text: string; onSchedule: (time: string) => void; onClose: () => void;
}) => {
  const [when, setWhen] = useState("");
  return (
    <Modal onClose={onClose}>
      <div className="bg-[#111318] w-full max-w-[340px] rounded-3xl overflow-hidden border border-[#c8705a]/[0.18] shadow-2xl p-6">
        <h3 className="font-bold text-[16px] text-white mb-2">Schedule Message</h3>
        <p className="text-[13px] text-[#7a6a65] mb-4 truncate">"{text.slice(0, 40)}{text.length > 40 ? "…" : ""}"</p>
        <input
          type="datetime-local" value={when} onChange={e => setWhen(e.target.value)}
          className="w-full bg-[#0a0c10] border border-[#c8705a]/[0.18] rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-[#c8705a]/40 mb-4"
        />
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-[#c8705a]/[0.08] text-gray-300 text-sm font-semibold hover:bg-[#c8705a]/[0.15] transition">Cancel</button>
          <button onClick={() => { if (when) { onSchedule(when); onClose(); } }} disabled={!when}
            className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold transition disabled:opacity-40"
            style={{ background: "linear-gradient(135deg, #c8705a, #a0503a)" }}>
            Schedule
          </button>
        </div>
      </div>
    </Modal>
  );
};

// ─── Toast ────────────────────────────────────────────────────────────────────
const Toast = ({ msg }: { msg: string }) => (
  <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] pointer-events-none">
    <div className="bg-[#111318]/95 backdrop-blur-md text-[13px] text-gray-200 px-5 py-2.5 rounded-full border border-[#c8705a]/[0.22] shadow-2xl whitespace-nowrap">
      {msg}
    </div>
  </div>
);

// ════════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════════════════════════
export default function ChatComponent() {
  const router = useRouter();
  const { user, authReady } = useAuth();
  const currentUserId = user?.userId ?? user?.uid ?? user?.email ?? "";
  const currentUserName = (user as any)?.firstName
    ? `${(user as any).firstName}${(user as any).lastName ? " " + (user as any).lastName : ""}`
    : (user as any)?.name ?? (user as any)?.displayName ?? user?.email ?? "Me";
  const currentUserAvatar = (user as any)?.avatar ?? (user as any)?.photoURL ?? null;
  const normalizeId = (id: string) => id.toLowerCase().replace(/[^a-zA-Z0-9]/g, "_");
  const normCurrentUserId = normalizeId(currentUserId);
  const isUserMe = (id: string) => {
    const nId = normalizeId(id);
    if (!normCurrentUserId) return false;
    return nId === normCurrentUserId || nId.endsWith(normCurrentUserId) || normCurrentUserId.endsWith(nId);
  };

  // ── Navigation ──────────────────────────────────────────────────────────────
  const [view, setView] = useState<ViewType>("list");
  const [activeChat, setActiveChat] = useState<Chat | null>(null);

  // ── Hooks ───────────────────────────────────────────────────────────────────
  const chatHook = useChats(undefined, authReady);
  const messageHook = useMessages(activeChat?.id ?? null, currentUserId, authReady);
  const createChatHook = useCreateChat();

  // ── List state ──────────────────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [dmCreating, setDmCreating] = useState(false);
  const [listFilter, setListFilter] = useState<"all" | "unread" | "muted">("all");

  // ── Chat room state ─────────────────────────────────────────────────────────
  const [msgInput, setMsgInput] = useState("");
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [editingMsg, setEditingMsg] = useState<Message | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // FIX 1: menuMsgId now tracks which message has its context menu open
  // The menu is toggled by left-click and ALWAYS shows for the message owner (edit+delete)
  // or just reply/forward/copy/delete-for-me for others' messages
  const [menuMsgId, setMenuMsgId] = useState<string | null>(null);
  const [reactionMsgId, setReactionMsgId] = useState<string | null>(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [showChatInfo, setShowChatInfo] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [showAttach, setShowAttach] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [pinnedMsg, setPinnedMsg] = useState<PinnedMessage | null>(null);
  const [forwardingMsg, setForwardingMsg] = useState<Message | null>(null);
  const [schedulingMsg, setSchedulingMsg] = useState<string | null>(null);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [msgReactions, setMsgReactions] = useState<Record<string, Record<string, number>>>({});
  const [starredIds, setStarredIds] = useState<Set<string>>(new Set());
  const [isRecording, setIsRecording] = useState(false);
  const [recordSec, setRecordSec] = useState(0);
  const [voiceNotes, setVoiceNotes] = useState<Record<string, VoiceNote>>({});

  // ── Refs ────────────────────────────────────────────────────────────────────
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const msgRefs = useRef<Record<string, HTMLDivElement>>({});
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const recordTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);

  // ── Effects ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 150;
    if (atBottom || messageHook.messages.length <= 1) el.scrollTop = el.scrollHeight;
  }, [messageHook.messages]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => setShowScrollBtn(el.scrollHeight - el.scrollTop - el.clientHeight > 250);
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, [view]);

  useEffect(() => {
    if (view === "chat_room") setTimeout(() => inputRef.current?.focus(), 120);
  }, [view]);

  useEffect(() => {
    if (activeChat?.id) chatHook.markChatAsRead(activeChat.id);
  }, [activeChat?.id]);

  // FIX 1: Global click handler closes context menu when clicking outside
  useEffect(() => {
    const handler = () => {
      setMenuMsgId(null);
      setReactionMsgId(null);
      setShowEmoji(false);
      setShowAttach(false);
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  useEffect(() => {
    if (!msgInput || !activeChat) return;
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      setIsTyping(true);
      setTimeout(() => setIsTyping(false), 2500);
    }, 3000);
    return () => { if (typingTimerRef.current) clearTimeout(typingTimerRef.current); };
  }, [msgInput, activeChat]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  }, []);

  // ── Voice Recording ─────────────────────────────────────────────────────────
  const startRecording = useCallback(() => {
    setIsRecording(true); setRecordSec(0);
    recordTimerRef.current = setInterval(() => setRecordSec(s => s + 1), 1000);
  }, []);
  const cancelRecording = useCallback(() => {
    setIsRecording(false); setRecordSec(0);
    if (recordTimerRef.current) clearInterval(recordTimerRef.current);
  }, []);
  const sendVoiceNote = useCallback(async () => {
    if (!activeChat || recordSec === 0) { cancelRecording(); return; }
    setIsRecording(false);
    if (recordTimerRef.current) clearInterval(recordTimerRef.current);
    const fakeId = `voice_${Date.now()}`;
    setVoiceNotes(v => ({ ...v, [fakeId]: { duration: recordSec } }));
    await messageHook.send(`🎤 Voice message (${formatDuration(recordSec)})`, undefined);
    setRecordSec(0);
    chatHook.refresh();
  }, [activeChat, recordSec, messageHook, chatHook, cancelRecording]);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const openChat = useCallback((chat: Chat) => {
    setActiveChat(chat);
    setMsgInput("");
    setReplyingTo(null);
    setEditingMsg(null);
    setMenuMsgId(null);
    setPinnedMsg(null);
    setShowSearch(false);
    chatHook.markChatAsRead(chat.id);
    setView("chat_room");
  }, [chatHook]);

  const handlePickUser = useCallback(async (userId: string, displayName: string) => {
    setShowPicker(false); setDmCreating(true);
    try {
      const res = await ChatAPI.createDM(userId, displayName);
      chatHook.prependChat(res.chat);
      openChat(res.chat);
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Failed to start chat");
    } finally { setDmCreating(false); }
  }, [chatHook, openChat, showToast]);

  const handleSend = useCallback(async () => {
    const text = msgInput.trim();
    if (!text || !activeChat) return;
    setMsgInput("");
    setShowQuickReplies(false);
    if (editingMsg) {
      await messageHook.editMessage(editingMsg.id, text);
      setEditingMsg(null);
      return;
    }
    await messageHook.send(text, replyingTo ? { replyToId: replyingTo.id } : undefined);
    setReplyingTo(null);
    chatHook.refresh();
    chatHook.markChatAsRead(activeChat.id);
    setTimeout(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, 60);
  }, [msgInput, activeChat, editingMsg, replyingTo, messageHook, chatHook]);

  const handleReact = useCallback((msgId: string, emoji: string) => {
    setMsgReactions(prev => {
      const existing = prev[msgId] ?? {};
      const count = existing[emoji] ?? 0;
      return { ...prev, [msgId]: { ...existing, [emoji]: count > 0 ? 0 : 1 } };
    });
    setMenuMsgId(null); setReactionMsgId(null);
    showToast(`Reacted ${emoji}`);
  }, [showToast]);

  const handlePin = useCallback((msg: Message) => {
    setPinnedMsg({ id: msg.id, content: msg.content, senderId: msg.senderId });
    setMenuMsgId(null);
    showToast("Message pinned");
  }, [showToast]);

  const handleStar = useCallback((msgId: string) => {
    setStarredIds(prev => {
      const next = new Set(prev);
      if (next.has(msgId)) { next.delete(msgId); showToast("Unstarred"); }
      else { next.add(msgId); showToast("⭐ Starred"); }
      return next;
    });
    setMenuMsgId(null);
  }, [showToast]);

  const confirmDelete = useCallback(async (forEveryone: boolean) => {
    if (!deletingId) return;
    const targetId = deletingId;
    setDeletingId(null);
    await messageHook.deleteMessage(targetId, forEveryone);
    showToast(forEveryone ? "Deleted for everyone" : "Deleted for you");
  }, [deletingId, messageHook, showToast]);

  const copyMessage = useCallback((text: string) => {
    navigator.clipboard.writeText(text).then(() => showToast("Copied to clipboard"));
  }, [showToast]);

  const jumpToMessage = useCallback((id: string) => {
    const el = msgRefs.current[id];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("!bg-[#c8705a]/10");
      setTimeout(() => el.classList.remove("!bg-[#c8705a]/10"), 1500);
    }
  }, []);

  const scrollToBottom = () => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    setShowScrollBtn(false);
  };

  // ── Filtered chats ──────────────────────────────────────────────────────────
  const dmChats = chatHook.chats.filter(c => c.type === "dm");
  const filteredChats = useMemo(() => {
    let chats = dmChats;
    if (listFilter === "unread") chats = chats.filter(c => c.unreadCount > 0);
    if (listFilter === "muted") chats = chats.filter(c => c.isMuted);
    if (search.trim()) chats = chats.filter(c => resolveChatName(c, currentUserId).toLowerCase().includes(search.toLowerCase()));
    return chats;
  }, [dmChats, listFilter, search, currentUserId]);

  // ── Auth guard ──────────────────────────────────────────────────────────────
  if (!authReady) {
    return (
      <div className="min-h-screen bg-[#0a0c10] flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-[#c8705a]" />
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // VIEW: CHAT ROOM
  // ══════════════════════════════════════════════════════════════════════════════
  if (view === "chat_room" && activeChat) {
    // FIX 2: displayName is the OTHER person's name (not the current user)
    const displayName = resolveChatName(activeChat, currentUserId);

    // Group messages by date
    const grouped: any[] = [];
    let lastDate = "";
    for (const msg of messageHook.messages) {
      const d = new Date(msg.createdAt);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      const label =
        d.toDateString() === today.toDateString() ? "Today"
          : d.toDateString() === yesterday.toDateString() ? "Yesterday"
            : d.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" });
      if (label !== lastDate) { lastDate = label; grouped.push({ type: "date", label }); }
      grouped.push({ type: "msg", msg });
    }

    return (
      <div
        className="min-h-screen text-white flex flex-col font-sans relative"
        style={{
          background: "linear-gradient(180deg, #0a0c10 0%, #0d0f14 100%)",
          fontFamily: "'SF Pro Display', 'Segoe UI', system-ui, sans-serif",
        }}
      >
        {/* ── Top bar ── */}
        <div className="flex items-center gap-2 px-3 py-2.5 backdrop-blur-xl border-b z-30 sticky top-0"
          style={{ background: "rgba(10,12,16,0.92)", borderColor: "rgba(200,112,90,0.10)" }}>
          <button
            onClick={() => { setView("list"); setActiveChat(null); }}
            className="w-9 h-9 rounded-full flex items-center justify-center transition active:scale-95"
            style={{ ["--hover-bg" as any]: "rgba(200,112,90,0.08)" }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(200,112,90,0.08)")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            <ChevronLeft size={22} className="text-gray-200" />
          </button>

          {/* FIX 2: Avatar and name show the OTHER person (displayName = resolveChatName with currentUserId) */}
          <button onClick={() => setShowChatInfo(true)} className="flex items-center gap-2.5 flex-1 min-w-0 text-left hover:opacity-80 transition">
            {/* Avatar always shows the chat partner's avatar, not current user's */}
            <Avatar src={activeChat.avatarUrl} name={displayName} size={38} online={activeChat.isOnline} typing={isTyping} />
            <div className="min-w-0">
              <div className="text-[15px] font-bold text-white truncate flex items-center gap-1">
                {displayName}
                {activeChat.isVerified && <BadgeCheck size={13} className="text-[#e8967e] flex-shrink-0" />}
              </div>
              <div className={`text-[11px] transition-colors ${isTyping ? "text-amber-400"
                : activeChat.isOnline ? "text-emerald-400"
                  : "text-[#7a6a65]"
                }`}>
                {isTyping ? "typing…" : activeChat.isOnline ? "Active now"
                  : activeChat.lastMessageAt ? `Active ${timeAgo(activeChat.lastMessageAt)} ago`
                    : "Offline"}
              </div>
            </div>
          </button>

          <div className="flex items-center gap-0.5 flex-shrink-0">
            {[
              // { icon: <Phone size={17}/>,  action: () => {} },
              // { icon: <Video size={17}/>,  action: () => {} },
              { icon: <Search size={17} />, action: () => setShowSearch(s => !s) },
              { icon: <Info size={17} />, action: () => setShowChatInfo(true) },
            ].map((btn, i) => (
              <button key={i} onClick={e => { e.stopPropagation(); btn.action(); }}
                className="w-9 h-9 rounded-full flex items-center justify-center transition active:scale-95 text-[#c8705a]"
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(200,112,90,0.08)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                {btn.icon}
              </button>
            ))}
          </div>
        </div>

        {/* ── Pinned message ── */}
        {pinnedMsg && <PinnedBanner msg={pinnedMsg} onDismiss={() => setPinnedMsg(null)} onJump={() => jumpToMessage(pinnedMsg.id)} />}

        {/* ── In-chat search ── */}
        {showSearch && (
          <div className="relative z-40">
            <SearchInChat messages={messageHook.messages} onJump={jumpToMessage} onClose={() => setShowSearch(false)} />
          </div>
        )}

        {/* ── Messages area ── */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-0 [&::-webkit-scrollbar]:hidden"
          onClick={() => { setMenuMsgId(null); setReactionMsgId(null); setShowEmoji(false); setShowAttach(false); }}
        >
          {messageHook.loading && messageHook.messages.length === 0 && (
            <div className="flex justify-center py-20"><Loader2 size={22} className="animate-spin text-[#c8705a]" /></div>
          )}
          {messageHook.error && <Err msg={messageHook.error} />}
          {!messageHook.loading && messageHook.messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 gap-5 select-none">
              <div className="relative">
                <Avatar src={activeChat.avatarUrl} name={displayName} size={80} online={activeChat.isOnline} />
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center shadow-lg"
                  style={{ background: "linear-gradient(135deg, #c8705a, #a0503a)" }}>
                  <MessageCircle size={13} className="text-white" />
                </div>
              </div>
              <div className="text-center">
                <p className="font-bold text-[17px] text-white">{displayName}</p>
                {activeChat.isVerified && (
                  <p className="text-[12px] text-[#e8967e] flex items-center justify-center gap-1 mt-0.5">
                    <BadgeCheck size={12} /> Verified account
                  </p>
                )}
                <p className="text-[13px] text-[#7a6a65] mt-2 max-w-[220px] leading-relaxed mx-auto">
                  Say hello! This is the start of your conversation with {displayName}.
                </p>
              </div>
              <button
                onClick={() => { setMsgInput("👋 Hey!"); setTimeout(() => inputRef.current?.focus(), 60); }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full border text-[13px] font-semibold transition"
                style={{ background: "rgba(200,112,90,0.10)", borderColor: "rgba(200,112,90,0.30)", color: "#c8705a" }}
              >
                <span className="text-[18px]">👋</span> Say Hello
              </button>
            </div>
          )}

          {/* Messages */}
          {grouped.map((item, idx) => {
            if (item.type === "date") return <DateDivider key={`date-${idx}`} label={item.label} />;

            const msg = item.msg as Message;
            const isMe = isUserMe(msg.senderId);
            const isDeleted = !!msg.deletedAt;
            const isOptimistic = msg.id.startsWith("optimistic_");
            const showMenu = menuMsgId === msg.id;
            const showReact = reactionMsgId === msg.id;
            const isStarred = starredIds.has(msg.id);
            const reactions = msgReactions[msg.id] ?? {};
            const hasReactions = Object.values(reactions).some(v => v > 0);

            const allMsgs = messageHook.messages;
            const msgIdx = allMsgs.indexOf(msg);
            const prev = allMsgs[msgIdx - 1];
            const next = allMsgs[msgIdx + 1];
            const isFirst = !prev || prev.senderId !== msg.senderId;
            const isLast = !next || next.senderId !== msg.senderId;

            const borderRadius = isMe
              ? `20px 20px ${isLast ? "5px" : "20px"} 20px`
              : `20px 20px 20px ${isLast ? "5px" : "20px"}`;

            const replyMsg = msg.replyToId ? allMsgs.find(m => m.id === msg.replyToId) : null;
            const isVoice = msg.content.startsWith("🎤 Voice message");

            const status: MessageStatus = isOptimistic ? "sending" : msg.isRead ? "read" : "delivered";

            // ── FIX 1: Context menu actions ─────────────────────────────────
            // ALWAYS build the menu. Edit and "Delete for Everyone" are gated on isMe.
            // This ensures left-click on ANY message shows the context menu.
            const menuActions = [
              {
                icon: <Reply size={14} />, label: "Reply", color: "text-gray-300",
                action: () => {
                  setReplyingTo(msg); setMenuMsgId(null);
                  setTimeout(() => inputRef.current?.focus(), 60);
                },
              },
              {
                icon: <Forward size={14} />, label: "Forward", color: "text-gray-300",
                action: () => { setForwardingMsg(msg); setMenuMsgId(null); },
              },
              {
                icon: <Copy size={14} />, label: "Copy", color: "text-gray-300",
                action: () => copyMessage(msg.content),
              },
              {
                icon: <Star size={14} />,
                label: isStarred ? "Unstar" : "Star",
                color: isStarred ? "text-amber-400" : "text-gray-300",
                action: () => handleStar(msg.id),
              },
              {
                icon: <Pin size={14} />, label: "Pin", color: "text-gray-300",
                action: () => handlePin(msg),
              },
              // Edit: only for own, non-deleted messages
              ...(isMe && !isDeleted ? [{
                icon: <Edit2 size={14} />, label: "Edit", color: "text-[#e8967e]",
                action: () => {
                  setEditingMsg(msg); setMsgInput(msg.content); setMenuMsgId(null);
                  setTimeout(() => inputRef.current?.focus(), 60);
                },
              }] : []),
              // Delete: always present; "for everyone" shown only if isMe
              {
                icon: <Trash2 size={14} />, label: "Delete", color: "text-rose-400",
                action: () => {
                  if (isMe) {
                    setDeletingId(msg.id);
                  } else {
                    messageHook.deleteMessage(msg.id, false);
                    showToast("Deleted for you");
                  }
                  setMenuMsgId(null);
                },
              },
            ];

            return (
              <div
                key={msg.id}
                ref={el => { if (el) msgRefs.current[msg.id] = el; }}
                className={`flex flex-col transition-colors duration-700 rounded-xl ${isMe ? "items-end" : "items-start"
                  } ${isFirst ? "mt-3" : "mt-[3px]"}`}
              >
                {/* Reply preview */}
                {replyMsg && !isDeleted && (
                  <div
                    onClick={() => jumpToMessage(replyMsg.id)}
                    className={`flex items-start gap-2 mb-1 max-w-[66%] px-3 py-2 rounded-xl border cursor-pointer hover:opacity-80 transition-opacity ${isMe ? "self-end" : "self-start"
                      }`}
                    style={{
                      background: isMe ? "rgba(200,112,90,0.08)" : "rgba(255,255,255,0.04)",
                      borderColor: isMe ? "rgba(200,112,90,0.18)" : "rgba(255,255,255,0.06)",
                    }}
                  >
                    <div className={`w-0.5 rounded-full self-stretch min-h-[18px] flex-shrink-0`}
                      style={{ background: isMe ? "#c8705a" : "#4a3a35" }} />
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold mb-0.5" style={{ color: isMe ? "#c8705a" : "#7a6a65" }}>
                        {/* FIX 2: Show "You" if reply is from current user, else show the OTHER person's name */}
                        {isUserMe(replyMsg.senderId) ? "You" : displayName}
                      </p>
                      <p className="text-[11px] text-[#4a3a35] truncate">{replyMsg.content.slice(0, 60)}</p>
                    </div>
                  </div>
                )}

                <div className={`relative flex items-end gap-1.5 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                  {/* Other person's avatar on the left */}
                  {!isMe && (
                    <div className="w-7 flex-shrink-0 mb-1">
                      {isLast ? (
                        <Avatar src={activeChat.avatarUrl} name={displayName} size={26} />
                      ) : null}
                    </div>
                  )}
                  {/* Current user's avatar on the right */}
                  {isMe && (
                    <div className="w-7 flex-shrink-0 mb-1">
                      {isLast ? (
                        <Avatar src={currentUserAvatar} name={currentUserName} size={26} />
                      ) : null}
                    </div>
                  )}

                  {/* Bubble */}
                  <div className={`relative group max-w-[280px] sm:max-w-[330px] ${hasReactions ? "mb-4" : ""}`}>
                    {/* Star indicator */}
                    {isStarred && !isDeleted && (
                      <div className={`absolute top-1 ${isMe ? "left-1" : "right-1"} z-10`}>
                        <Star size={8} className="text-amber-400 fill-amber-400" />
                      </div>
                    )}

                    {/* ── FIX 1: onClick toggles menu — works for both sent and received messages ── */}
                    <div
                      onContextMenu={(e) => {
                        e.preventDefault();
                        e.stopPropagation();

                        if (isDeleted) return;

                        setMenuMsgId(msg.id);
                        setReactionMsgId(null);
                      }}

                      onTouchStart={() => {
                        if (isDeleted) return;

                        longPressTimerRef.current = setTimeout(() => {
                          setMenuMsgId(msg.id);
                          setReactionMsgId(null);
                        }, 500);
                      }}

                      onTouchEnd={() => {
                        if (longPressTimerRef.current) {
                          clearTimeout(longPressTimerRef.current);
                        }
                      }}

                      onTouchMove={() => {
                        if (longPressTimerRef.current) {
                          clearTimeout(longPressTimerRef.current);
                        }
                      }}

                      onDoubleClick={e => {
                        e.stopPropagation();
                        if (isDeleted) return;
                        setReactionMsgId(msg.id);
                        setMenuMsgId(null);
                      }}
                      style={{
                        borderRadius,
                        background: isDeleted
                          ? "transparent"
                          : isMe
                            ? "linear-gradient(135deg, #c8705a 0%, #9a4e3a 100%)"
                            : "#181c24",
                        border: isDeleted
                          ? "1px solid rgba(200,112,90,0.12)"
                          : !isMe
                            ? "1px solid rgba(200,112,90,0.10)"
                            : "none",
                        boxShadow: isMe && !isDeleted
                          ? "0 4px 20px rgba(200,112,90,0.20)"
                          : "0 2px 8px rgba(0,0,0,0.3)",
                      }}
                      className={`
                        px-[14px] py-[9px] cursor-pointer select-none break-words text-[14.5px] leading-[1.5]
                        ${isOptimistic ? "opacity-70" : ""}
                        ${isDeleted ? "text-[#4a3a35] italic text-[13px] px-[14px] py-[8px]" : "text-white"}
                        transition-all duration-150 active:scale-[0.98]
                      `}
                    >
                      {isDeleted ? (
                        <span className="flex items-center gap-1.5">
                          <EyeOff size={12} className="text-[#7a6a65]" /> Message deleted
                        </span>
                      ) : isVoice ? (
                        <VoiceNotePlayer isMe={isMe} duration={parseInt(
                          msg.content.match(/\d+:\d+/)?.[0]?.split(":").reduce((a, b, i) =>
                            String(parseInt(a) * (i === 1 ? 60 : 1) + parseInt(b)), "0") ?? "10"
                        )} />
                      ) : (
                        <span>{msg.content}</span>
                      )}

                      {/* Time + ticks + edited */}
                      {!isDeleted && !isVoice && (
                        <span className={`inline-flex items-center gap-1 ml-2 float-right mt-[5px] text-[10px] leading-none ${isMe ? "text-white/50" : "text-[#4a3a35]"
                          }`}>
                          {msg.edited && (
                            <span className="text-[9px] opacity-70 italic">
                              edited
                            </span>
                          )}
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          {isMe && <Ticks status={status} />}
                        </span>
                      )}
                    </div>

                    {/* Reactions display */}
                    {hasReactions && !isDeleted && <ReactionBadge reactions={reactions} isMe={isMe} />}

                    {/* Reaction picker (double tap) */}
                    {showReact && !isDeleted && (
                      <div
                        onClick={e => e.stopPropagation()}
                        className={`absolute z-50 bottom-full mb-2 flex items-center gap-1 rounded-full px-2 py-2 shadow-2xl border ${isMe ? "right-0" : "left-0"}`}
                        style={{ background: "#111318", borderColor: "rgba(200,112,90,0.18)" }}
                      >
                        {REACTIONS.map(r => (
                          <button key={r.emoji} title={r.label} onClick={() => handleReact(msg.id, r.emoji)}
                            className="text-[22px] hover:scale-125 active:scale-110 transition-transform leading-none w-8 h-8 flex items-center justify-center rounded-full"
                            onMouseEnter={e => (e.currentTarget.style.background = "rgba(200,112,90,0.10)")}
                            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                          >
                            {r.emoji}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* ── FIX 1: Context menu — appears for ANY message on left-click ── */}
                    {/* Edit is shown only for own messages, Delete for Everyone only for own messages */}
                    {showMenu && !isDeleted && (
                      <div
                        onClick={e => e.stopPropagation()}
                        className={`absolute z-50 bottom-full mb-2 w-[192px] rounded-2xl shadow-2xl overflow-hidden border ${isMe ? "right-0" : "left-0"}`}
                        style={{ background: "#111318", borderColor: "rgba(200,112,90,0.18)" }}
                      >
                        {/* Quick reactions row */}
                        <div className="flex items-center justify-around px-2 py-2 border-b" style={{ background: "#0f1116", borderColor: "rgba(200,112,90,0.08)" }}>
                          {REACTIONS.slice(0, 6).map(r => (
                            <button key={r.emoji} onClick={() => handleReact(msg.id, r.emoji)}
                              className="text-[18px] hover:scale-125 transition-transform leading-none w-7 h-7 flex items-center justify-center rounded-full"
                              onMouseEnter={e => (e.currentTarget.style.background = "rgba(200,112,90,0.10)")}
                              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                            >
                              {r.emoji}
                            </button>
                          ))}
                        </div>
                        {/* Action rows */}
                        {menuActions.map(action => (
                          <button key={action.label} onClick={action.action}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-[13px] transition-colors ${action.color}`}
                            onMouseEnter={e => (e.currentTarget.style.background = "rgba(200,112,90,0.06)")}
                            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                          >
                            <span className="text-[#7a6a65]">{action.icon}</span>
                            {action.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Swipe-to-reply indicator */}
                  {!isDeleted && (
                    <button
                      onClick={() => { setReplyingTo(msg); setTimeout(() => inputRef.current?.focus(), 60); }}
                      className={`opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mb-1 ${isMe ? "mr-1" : "ml-1"}`}
                      style={{ background: "rgba(200,112,90,0.10)" }}
                    >
                      <Reply size={12} className="text-[#7a6a65]" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {/* Typing indicator */}
          {isTyping && <TypingIndicator name={displayName} />}
        </div>

        {/* Scroll to bottom */}
        {showScrollBtn && (
          <button onClick={scrollToBottom}
            className="fixed bottom-[96px] right-4 z-30 w-10 h-10 rounded-full border shadow-xl flex items-center justify-center transition-all active:scale-90"
            style={{ background: "#111318", borderColor: "rgba(200,112,90,0.22)" }}
          >
            <ArrowDown size={17} className="text-[#c8705a]" />
            {chatHook.chats.find(c => c.id === activeChat.id)?.unreadCount ? (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center text-white"
                style={{ background: "linear-gradient(135deg, #c8705a, #a0503a)" }}>
                {chatHook.chats.find(c => c.id === activeChat.id)?.unreadCount}
              </span>
            ) : null}
          </button>
        )}

        {/* ── Input area ── */}
        <div className="backdrop-blur-xl border-t  px-5 pb-5 pt-2 z-20"
          style={{ background: "rgba(10,12,16,0.94)", borderColor: "rgba(200,112,90,0.08)" }}>
          {/* Quick replies */}
          {showQuickReplies && !msgInput && (
            <QuickReplies onSelect={text => {
              setMsgInput(text); setShowQuickReplies(false);
              setTimeout(() => inputRef.current?.focus(), 60);
            }} />
          )}

          {/* Reply / Edit banner */}
          {(replyingTo || editingMsg) && (
            <div className="flex items-center gap-3 rounded-2xl px-4 py-2.5 mb-2 border"
              style={{ background: "#111318", borderColor: "rgba(200,112,90,0.18)" }}>
              <div className={`w-0.5 h-8 rounded-full flex-shrink-0`}
                style={{ background: editingMsg ? "#f59e0b" : "#c8705a" }} />
              <div className="flex-1 min-w-0">
                <p className={`text-[11px] font-bold`} style={{ color: editingMsg ? "#f59e0b" : "#c8705a" }}>
                  {editingMsg ? "Editing message" : `Reply to ${isUserMe(replyingTo?.senderId || "") ? "yourself" : displayName}`}
                </p>
                <p className="text-[12px] text-[#7a6a65] truncate">{editingMsg ? editingMsg.content : replyingTo?.content}</p>
              </div>
              <button
                onClick={() => { setReplyingTo(null); setEditingMsg(null); setMsgInput(""); }}
                className="w-7 h-7 rounded-full flex items-center justify-center transition flex-shrink-0"
                style={{ background: "rgba(200,112,90,0.10)" }}
              >
                <X size={13} style={{ color: "#c8705a" }} />
              </button>
            </div>
          )}

          {/* Voice recording UI */}
          {isRecording ? (
            <div className="flex items-center gap-3 rounded-2xl px-4 py-3 mb-2 border"
              style={{ background: "rgba(200,112,90,0.07)", borderColor: "rgba(200,112,90,0.20)" }}>
              <div className="w-2.5 h-2.5 rounded-full animate-pulse flex-shrink-0 bg-[#c8705a]" />
              <div className="flex-1">
                <p className="text-[13px] text-[#e8967e] font-semibold">Recording… {formatDuration(recordSec)}</p>
                <div className="flex gap-0.5 mt-1">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <div key={i} className="rounded-full animate-pulse"
                      style={{ width: 2, height: 4 + Math.random() * 12, background: "rgba(200,112,90,0.40)", animationDelay: `${i * 50}ms` }} />
                  ))}
                </div>
              </div>
              <button onClick={cancelRecording} className="w-8 h-8 rounded-full flex items-center justify-center transition"
                style={{ background: "rgba(200,112,90,0.10)" }}>
                <X size={14} className="text-[#c8705a]" />
              </button>
              <button onClick={sendVoiceNote} className="w-9 h-9 rounded-full flex items-center justify-center shadow-lg transition"
                style={{ background: "linear-gradient(135deg, #c8705a, #a0503a)" }}>
                <Send size={15} className="text-white" />
              </button>
            </div>
          ) : (
              <div className="flex items-end mb-[50px] lg:mb-0 sm:gap-2 w-full min-w-0">              {/* Attach */}
              <div className="relative">
                {/* <button onClick={e => { e.stopPropagation(); setShowAttach(s => !s); setShowEmoji(false); }}
                  className="w-10 h-10 rounded-full flex items-center justify-center transition flex-shrink-0 mb-0.5"
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(200,112,90,0.08)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <Plus size={20} className={`transition-transform duration-200 ${showAttach ? "rotate-45 text-rose-400" : "text-[#c8705a]"}`} />
                </button> */}
                {showAttach && (
                  <div onClick={e => e.stopPropagation()}>
                    <AttachmentMenu onClose={() => setShowAttach(false)} onSelect={type => showToast(`${type} attachment — coming soon`)} />
                  </div>
                )}
              </div>

              {/* Input */}
                <div className="flex-1  gap-2 min-w-0 flex items-end rounded-[24px] px-3 sm:px-4 py-2.5 border min-h-[46px]"

                  style={{ background: "#1c1d1fff", borderColor: "rgba(200,112,90,0.14)" }}
                onFocus={() => undefined}
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={msgInput}
                  onChange={e => setMsgInput(e.target.value)}
                  placeholder={editingMsg ? "Edit message…" : `Message ${displayName}…`}
                  className="flex-1 min-w-0 w-full h-10 bg-transparent outline-none text-[14px] text-white leading-10" onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  onFocus={() => setShowQuickReplies(!msgInput)}
                />
                {/* Emoji toggle */}
                <div className="relative">
                  <button onClick={e => { e.stopPropagation(); setShowEmoji(s => !s); setShowAttach(false); }}
                    className="flex-shrink-0 text-[#7a6a65] hover:text-[#e8967e] transition mb-0.5">
                    <Smile size={30} />
                  </button>
                  {showEmoji && (
                    <div onClick={e => e.stopPropagation()}>
                      <EmojiPicker onSelect={e => setMsgInput(i => i + e)} onClose={() => setShowEmoji(false)} />
                    </div>
                  )}
                </div>
              </div>

              {/* Send / Mic / Like */}
              {msgInput.trim() ? (
                <div className="flex gap-1.5 flex-shrink-0">
                  <button onClick={() => setSchedulingMsg(msgInput.trim())}
                    className="w-10 h-10 rounded-full flex items-center justify-center transition"
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(200,112,90,0.08)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    {/* <Clock size={17} className="text-[#7a6a65]" /> */}
                  </button>
                  <button onClick={handleSend} disabled={messageHook.sending}
                    className="w-10 h-10 rounded-full flex items-center justify-center active:scale-90 transition flex-shrink-0 disabled:opacity-50"
                    style={{ background: "linear-gradient(135deg, #c8705a, #9a4e3a)", boxShadow: "0 4px 16px rgba(200,112,90,0.30)" }}
                  >
                    {messageHook.sending
                      ? <Loader2 size={16} className="animate-spin text-white" />
                      : <Send size={15} className="text-white" style={{ transform: "translateX(1px)" }} />}
                  </button>
                </div>
              ) : (
                <div className="flex gap-1 flex-shrink-0">
                  {/* <button
                    onMouseDown={startRecording} onMouseUp={sendVoiceNote}
                    onTouchStart={startRecording} onTouchEnd={sendVoiceNote}
                    className="w-10 h-10 rounded-full flex items-center justify-center transition flex-shrink-0"
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(200,112,90,0.08)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    <Mic size={18} className="text-[#c8705a]" />
                  </button> */}
                  <button
                    onClick={() => {
                      setMsgInput("👍");
                      handleSend();
                    }}
                    className="w-10 h-10 mb-2 rounded-full flex items-center justify-center transition"
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(200,112,90,0.08)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    <span className="text-[28px] leading-none">
                      👍
                    </span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modals */}
        {showChatInfo && (
          <ChatInfoModal chat={activeChat} displayName={displayName} onClose={() => setShowChatInfo(false)}
            onBlock={() => showToast("User blocked")} onReport={() => showToast("Reported")}
            onMute={() => showToast("Notifications muted")} onClearHistory={() => showToast("Chat history cleared")} />
        )}
        {deletingId && (
          <DeleteModal onConfirm={confirmDelete} onCancel={() => setDeletingId(null)}
            forEveryone={isUserMe(messageHook.messages.find(m => m.id === deletingId)?.senderId || "")} />
        )}
        {forwardingMsg && (
          <ForwardModal chats={dmChats} currentUserId={currentUserId}
            onForward={() => { showToast("Message forwarded"); setForwardingMsg(null); }}
            onClose={() => setForwardingMsg(null)} />
        )}
        {schedulingMsg && (
          <ScheduleModal text={schedulingMsg}
            onSchedule={time => { showToast(`📅 Scheduled for ${new Date(time).toLocaleString()}`); setMsgInput(""); }}
            onClose={() => setSchedulingMsg(null)} />
        )}
        {toast && <Toast msg={toast} />}
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // VIEW: CHAT LIST
  // ══════════════════════════════════════════════════════════════════════════════
  return (
    <div
      className="min-h-screen text-white font-sans flex flex-col"
      style={{
        background: "#0a0c10",
        fontFamily: "'SF Pro Display', 'Segoe UI', system-ui, sans-serif",
      }}
    >
      {/* ── Header ── */}
      <div className="px-4 pt-4 pb-0 sticky top-0 z-20" style={{ background: "#0a0c10" }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()}
              className="w-9 h-9 rounded-full flex items-center justify-center transition"
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(200,112,90,0.08)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <ChevronLeft size={22} className="text-gray-200" />
            </button>
            <h1 className="text-[22px] font-bold text-white tracking-tight">Messages</h1>
          </div>
          <div className="flex items-center gap-2">
            {dmCreating && <Loader2 size={18} className="animate-spin text-[#c8705a]" />}
            <button onClick={() => setShowPicker(true)}
              className="w-9 h-9 rounded-full flex items-center justify-center transition active:scale-90 shadow-lg"
              style={{ background: "linear-gradient(135deg, #c8705a, #9a4e3a)", boxShadow: "0 4px 14px rgba(200,112,90,0.30)" }}
            >
              <Plus size={18} className="text-white" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2.5 rounded-2xl px-4 py-2.5 border mb-3 transition-colors"
          style={{ background: "#111318", borderColor: "rgba(200,112,90,0.12)" }}>
          <Search size={15} className="text-[#7a6a65] flex-shrink-0" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search conversations…"
            className="flex-1 bg-transparent outline-none text-[14px] text-white"
            style={{ caretColor: "#c8705a" }} />
          {search && <button onClick={() => setSearch("")}><X size={14} className="text-[#7a6a65]" /></button>}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-3">
          {(["all", "unread", "muted"] as const).map(f => (
            <button key={f} onClick={() => setListFilter(f)}
              className={`px-4 py-1.5 rounded-full text-[12px] font-semibold capitalize transition-all ${listFilter === f ? "text-white shadow-md" : "text-[#7a6a65] border hover:text-gray-300"
                }`}
              style={listFilter === f
                ? { background: "linear-gradient(135deg, #c8705a, #9a4e3a)", boxShadow: "0 2px 10px rgba(200,112,90,0.25)" }
                : { background: "#111318", borderColor: "rgba(200,112,90,0.14)" }
              }
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* ── Chat list ── */}
      <div ref={listRef} className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden">
        {chatHook.error && <Err msg={chatHook.error} retry={chatHook.refresh} />}
        {chatHook.loading && dmChats.length === 0 && (
          <>{[...Array(7)].map((_, i) => <SkeletonRow key={i} />)}</>
        )}
        {!chatHook.loading && dmChats.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 px-8 text-center gap-5 select-none">
            <div className="w-20 h-20 rounded-full border flex items-center justify-center"
              style={{ background: "rgba(200,112,90,0.08)", borderColor: "rgba(200,112,90,0.14)" }}>
              <MessageCircle size={30} className="text-[#c8705a]" />
            </div>
            <div>
              <p className="font-bold text-[17px] text-white mb-1.5">No conversations yet</p>
              <p className="text-[13px] text-[#7a6a65] leading-relaxed max-w-[220px] mx-auto">
                Start chatting — your messages will appear here.
              </p>
            </div>
            <button onClick={() => setShowPicker(true)}
              className="px-7 py-3 rounded-full text-white text-[14px] font-bold active:scale-95 transition shadow-xl"
              style={{ background: "linear-gradient(135deg, #c8705a, #9a4e3a)", boxShadow: "0 4px 20px rgba(200,112,90,0.30)" }}
            >
              Start a Conversation
            </button>
          </div>
        )}

        {filteredChats.map(chat => {
          const name = resolveChatName(chat, currentUserId);
          const hasUnread = chat.unreadCount > 0;
          return (
            <div key={chat.id} onClick={() => openChat(chat)}
              className="flex items-center gap-3.5 px-4 py-3 cursor-pointer transition-colors relative group"
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(200,112,90,0.04)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              onMouseDown={e => (e.currentTarget.style.background = "rgba(200,112,90,0.08)")}
              onMouseUp={e => (e.currentTarget.style.background = "rgba(200,112,90,0.04)")}
            >
              <Avatar src={chat.avatarUrl} name={name} size={56} online={chat.isOnline} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <h2 className={`text-[15px] truncate flex items-center gap-1.5 ${hasUnread ? "font-bold text-white" : "font-semibold text-[#aaa]"}`}>
                    {name}
                    {chat.isVerified && <BadgeCheck size={13} className="text-[#e8967e] flex-shrink-0" />}
                    {chat.isPinned && <Pin size={10} className="text-amber-400/70 flex-shrink-0 rotate-45" />}
                  </h2>
                  <div className="flex items-center gap-1.5 ml-2 flex-shrink-0">
                    {chat.isMuted && !hasUnread && <BellOff size={11} className="text-[#4a3a35]" />}
                    <span className={`text-[11px] ${hasUnread ? "text-[#c8705a] font-bold" : "text-[#4a3a35]"}`}>
                      {formatListTime(chat.lastMessageAt)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <p className={`text-[13px] truncate pr-2 ${hasUnread ? "text-[#9a8a85] font-medium" : "text-[#4a3a35]"}`}>
                    {chat.lastMessageContent || "Tap to start chatting"}
                  </p>
                  {hasUnread && (
                    <div className="text-white text-[10px] font-bold min-w-[19px] h-[19px] px-1.5 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: "linear-gradient(135deg, #c8705a, #9a4e3a)", boxShadow: "0 2px 6px rgba(200,112,90,0.35)" }}>
                      {chat.unreadCount > 99 ? "99+" : chat.unreadCount}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {chatHook.hasMore && (
          <button onClick={chatHook.loadMore} disabled={chatHook.loading}
            className="w-full flex items-center justify-center gap-2 py-4 text-[13px] text-[#4a3a35] hover:text-gray-300 transition">
            {chatHook.loading ? <Loader2 size={14} className="animate-spin" /> : "Load more"}
          </button>
        )}
        {!chatHook.loading && search && filteredChats.length === 0 && (
          <div className="px-4 py-12 text-center">
            <p className="text-[14px] text-[#4a3a35]">No results for "{search}"</p>
          </div>
        )}
      </div>

      <UserPickerModal open={showPicker} onClose={() => setShowPicker(false)} onPickUser={handlePickUser} />
      {toast && <Toast msg={toast} />}
    </div>
  );
}