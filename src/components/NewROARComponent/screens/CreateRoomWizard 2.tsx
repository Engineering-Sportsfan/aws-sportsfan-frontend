// // src/components/NewROARComponent/screens/CreateRoomWizard.tsx

// import { useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import axios from "axios";
// import {
//   ArrowLeft,
//   Search,
//   Users,
//   Mail,
//   Link2,
//   Rocket,
// } from "lucide-react";

// const SPORTS = [
//   { label: "Cricket", emoji: "🏏" },
//   { label: "Football", emoji: "🌍" },
//   { label: "Tennis", emoji: "🎾" },
//   { label: "Kabaddi", emoji: "💪" },
//   { label: "Formula 1", emoji: "🏎️" },
//   { label: "Olympics", emoji: "🥉" },
//   { label: "Esports", emoji: "🎮" },
//   { label: "Basketball", emoji: "🏀" },
// ];

// const PRIVACY_OPTIONS = [
//   { value: "public", label: "Public" },
//   { value: "private", label: "Private" },
//   { value: "premium", label: "Premium" },
// ] as const;

// type Privacy = (typeof PRIVACY_OPTIONS)[number]["value"];

// const SHARE_ROWS = [
//   { key: "contacts", icon: Users, title: "Connect Contacts", subtitle: "Find friends from your contacts" },
//   { key: "email", icon: Mail, title: "Email Invite", subtitle: "Send invite via email" },
//   { key: "link", icon: Link2, title: "Share Invite Link", subtitle: "Copy or share your room link" },
// ];

// const TOTAL_STEPS = 5;

// interface CreatedRoom {
//   roomId: string;
//   name: string;
//   description?: string;
//   sport?: string;
// }

// interface Props {
//   onCancel: () => void;
//   onCreated: (room: CreatedRoom) => void;
//   onToast: (m: string) => void;
// }

// function buildRoomShareUrl(roomId: string) {
//   if (typeof window === "undefined") {
//     return `https://sportsfan-frontend.vercel.app/MainModules/ROAR?room=${roomId}`;
//   }
//   const url = new URL(`${window.location.origin}/MainModules/ROAR`);
//   url.searchParams.set("room", roomId);
//   return url.toString();
// }

// export default function CreateRoomWizard({ onCancel, onCreated, onToast }: Props) {
//   const [step, setStep] = useState(1);

//   const [name, setName] = useState("");
//   const [description, setDescription] = useState("");
//   const [sport, setSport] = useState<string | null>(null);
//   const [privacy, setPrivacy] = useState<Privacy>("public");

//   const [contactSearch, setContactSearch] = useState("");
//   const [copied, setCopied] = useState(false);

//   const [submitting, setSubmitting] = useState(false);
//   const [createdRoom, setCreatedRoom] = useState<CreatedRoom | null>(null);

//   const progressPct = (step / TOTAL_STEPS) * 100;

//   const goBack = () => {
//     if (step === 1) {
//       onCancel();
//       return;
//     }
//     setStep((s) => s - 1);
//   };

//   const goNext = () => {
//     if (step === 1 && !name.trim()) {
//       onToast("Give your room a name first.");
//       return;
//     }
//     setStep((s) => Math.min(s + 1, TOTAL_STEPS));
//   };

//   const handleCreate = async () => {
//     if (submitting) return;
//     setSubmitting(true);
//     try {
//       const res = await axios.post("/api/roar/rooms", {
//         name: name.trim(),
//         description: description.trim() || undefined,
//         sport: sport ?? undefined,
//         privacy,
//       });
//       if (res.data?.success) {
//         setCreatedRoom(res.data.room);
//         onCreated(res.data.room);
//         onToast("Room created!");
//       } else {
//         onToast("Couldn't create the room — try again.");
//       }
//     } catch (e) {
//       console.error("[CreateRoomWizard] create failed:", e);
//       onToast("Couldn't create the room — try again.");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const copyInviteLink = async (roomId: string) => {
//     const url = buildRoomShareUrl(roomId);
//     try {
//       await navigator.clipboard.writeText(url);
//       setCopied(true);
//       onToast("Invite link copied!");
//       setTimeout(() => setCopied(false), 1600);
//     } catch {
//       onToast("Couldn't copy the link.");
//     }
//   };

//   return (
//     <div className="absolute inset-0 flex flex-col overflow-hidden bg-[#0e0e14]">
//       {/* ── Header ── */}
//       <div className="shrink-0 px-4 pt-4 pb-3">
//         <div className="flex items-center justify-between">
//           <button
//             type="button"
//             onClick={goBack}
//             className="w-8 h-8 rounded-full bg-white/[0.06] border-none text-white/80 flex items-center justify-center cursor-pointer"
//           >
//             <ArrowLeft size={16} />
//           </button>

//           <div className="flex-1 text-center">
//             <p className="text-white text-[15px] font-extrabold leading-tight">Create Room</p>
//             <p className="text-white/40 text-[11px] font-medium leading-tight">
//               Step {step} of {TOTAL_STEPS}
//             </p>
//           </div>

//           <button
//             type="button"
//             onClick={onCancel}
//             className="text-white/50 text-[13px] font-semibold bg-transparent border-none cursor-pointer"
//           >
//             Cancel
//           </button>
//         </div>

//         <div className="mt-3 h-[2px] w-full rounded-full bg-white/10 overflow-hidden">
//           <motion.div
//             className="h-full rounded-full"
//             style={{ background: "linear-gradient(90deg,#E91E8C,#FF6B35)" }}
//             initial={false}
//             animate={{ width: `${progressPct}%` }}
//             transition={{ type: "spring", damping: 26, stiffness: 220 }}
//           />
//         </div>
//       </div>

//       {/* ── Step content ── */}
//       <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-50">
//         <AnimatePresence mode="wait">
//           <motion.div
//             key={step}
//             initial={{ opacity: 0, x: 12 }}
//             animate={{ opacity: 1, x: 0 }}
//             exit={{ opacity: 0, x: -12 }}
//             transition={{ duration: 0.18 }}
//           >
//             {step === 1 && (
//               <div className="flex flex-col gap-5">
//                 <div>
//                   <p className="text-white/50 text-[11px] font-bold uppercase tracking-wider mb-2">
//                     Room Name
//                   </p>
//                   <input
//                     value={name}
//                     onChange={(e) => setName(e.target.value)}
//                     placeholder="e.g. IPL Super Fans"
//                     className="w-full rounded-xl bg-[#16161c] border border-white/[0.08] text-white text-[14px] px-4 py-3.5 outline-none placeholder:text-white/30 focus:border-white/20"
//                   />
//                 </div>

//                 <div>
//                   <p className="text-white/50 text-[11px] font-bold uppercase tracking-wider mb-2">
//                     Description
//                   </p>
//                   <textarea
//                     value={description}
//                     onChange={(e) => setDescription(e.target.value)}
//                     placeholder="What's this room about?"
//                     rows={4}
//                     className="w-full resize-none rounded-xl bg-[#16161c] border border-white/[0.08] text-white text-[14px] px-4 py-3.5 outline-none placeholder:text-white/30 focus:border-white/20"
//                   />
//                 </div>

//                 <div>
//                   <p className="text-white/50 text-[11px] font-bold uppercase tracking-wider mb-2">
//                     Sport
//                   </p>
//                   <div className="grid grid-cols-2 gap-2.5">
//                     {SPORTS.map((s) => {
//                       const active = sport === s.label;
//                       return (
//                         <button
//                           key={s.label}
//                           type="button"
//                           onClick={() => setSport(active ? null : s.label)}
//                           className={[
//                             "rounded-xl border py-3.5 px-3 text-left text-[13px] font-bold flex items-center gap-1.5 transition-colors duration-150",
//                             active
//                               ? "border-[#E91E8C]/70 bg-[#E91E8C]/10 text-white"
//                               : "border-white/[0.08] bg-[#16161c] text-white/80",
//                           ].join(" ")}
//                         >
//                           <span>{s.label}</span>
//                           <span>{s.emoji}</span>
//                         </button>
//                       );
//                     })}
//                   </div>
//                 </div>

//                 <div>
//                   <p className="text-white/50 text-[11px] font-bold uppercase tracking-wider mb-2">
//                     Privacy
//                   </p>
//                   <div className="grid grid-cols-3 gap-2">
//                     {PRIVACY_OPTIONS.map((p) => {
//                       const active = privacy === p.value;
//                       return (
//                         <button
//                           key={p.value}
//                           type="button"
//                           onClick={() => setPrivacy(p.value)}
//                           className={[
//                             "rounded-xl border py-2.5 text-[12px] font-bold transition-colors duration-150",
//                             active
//                               ? "border-[#E91E8C]/70 bg-[#E91E8C]/10 text-[#ff5fa8]"
//                               : "border-white/[0.08] bg-[#16161c] text-white/60",
//                           ].join(" ")}
//                         >
//                           {p.label}
//                         </button>
//                       );
//                     })}
//                   </div>
//                 </div>
//               </div>
//             )}

//             {step === 2 && (
//               <div className="flex flex-col gap-4">
//                 <p className="text-white text-[16px] font-extrabold">Room Visuals</p>
//                 {[
//                   { title: "Room Cover", subtitle: "1280 × 720px recommended" },
//                   { title: "Room Icon", subtitle: "512 × 512px square" },
//                   { title: "Banner", subtitle: "Displayed at top of room" },
//                 ].map((v) => (
//                   <div
//                     key={v.title}
//                     className="flex items-center justify-between gap-3 rounded-xl border border-dashed border-white/15 bg-[#16161c] px-4 py-3.5"
//                   >
//                     <div className="flex items-center gap-3 min-w-0">
//                       <div className="w-9 h-9 rounded-lg bg-white/[0.06] shrink-0" />
//                       <div className="min-w-0">
//                         <p className="text-white text-[13px] font-bold truncate">{v.title}</p>
//                         <p className="text-white/40 text-[11px] truncate">{v.subtitle}</p>
//                       </div>
//                     </div>
//                     <button
//                       type="button"
//                       disabled
//                       className="shrink-0 rounded-full bg-white/[0.06] text-white/40 text-[12px] font-bold px-4 py-2 border-none cursor-not-allowed"
//                       title="Coming soon"
//                     >
//                       Upload
//                     </button>
//                   </div>
//                 ))}
//                 <p className="text-white/30 text-[11px] leading-snug">
//                   Uploads aren't available yet — you can skip this step and add visuals later.
//                 </p>
//               </div>
//             )}

//             {step === 3 && (
//               <div className="flex flex-col gap-4">
//                 <p className="text-white text-[16px] font-extrabold">Invite Members</p>

//                 <div className="flex items-center gap-2 rounded-xl bg-[#16161c] border border-white/[0.08] px-3.5 py-3">
//                   <Search size={15} className="text-white/40 shrink-0" />
//                   <input
//                     value={contactSearch}
//                     onChange={(e) => setContactSearch(e.target.value)}
//                     placeholder="Search by username…"
//                     className="flex-1 bg-transparent text-white text-[13px] outline-none placeholder:text-white/30"
//                   />
//                 </div>

//                 <div className="flex flex-col gap-2.5">
//                   {SHARE_ROWS.map((row) => {
//                     const Icon = row.icon;
//                     return (
//                       <button
//                         key={row.key}
//                         type="button"
//                         onClick={() => {
//                           if (row.key === "link" && createdRoom) {
//                             copyInviteLink(createdRoom.roomId);
//                           } else if (!createdRoom) {
//                             onToast("Finish creating the room first, then share the link.");
//                           }
//                         }}
//                         className="flex items-center gap-3 rounded-xl bg-[#16161c] border border-white/[0.08] px-4 py-3.5 text-left cursor-pointer"
//                       >
//                         <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center shrink-0">
//                           <Icon size={15} className="text-white/70" />
//                         </div>
//                         <div className="flex-1 min-w-0">
//                           <p className="text-white text-[13px] font-bold truncate">{row.title}</p>
//                           <p className="text-white/40 text-[11px] truncate">
//                             {row.key === "link" && copied ? "Copied!" : row.subtitle}
//                           </p>
//                         </div>
//                       </button>
//                     );
//                   })}
//                 </div>

//                 <p className="text-white/30 text-[11px] leading-snug">
//                   You'll get a shareable invite link once the room is created in the next step.
//                 </p>
//               </div>
//             )}

//             {step === 4 && (
//               <div className="flex flex-col gap-4">
//                 <p className="text-white text-[16px] font-extrabold">Room Rules</p>
//                 <p className="text-white/40 text-[12px] leading-snug">
//                   Optional — set a couple of ground rules for people joining {name.trim() || "your room"}.
//                 </p>
//                 <textarea
//                   placeholder="e.g. Keep it respectful. No spoilers before kickoff."
//                   rows={5}
//                   className="w-full resize-none rounded-xl bg-[#16161c] border border-white/[0.08] text-white text-[14px] px-4 py-3.5 outline-none placeholder:text-white/30 focus:border-white/20"
//                 />
//               </div>
//             )}

//             {step === 5 && (
//               <div className="flex flex-col gap-4">
//                 <p className="text-white text-[16px] font-extrabold">Preview &amp; Confirm</p>

//                 <div className="rounded-2xl overflow-hidden border border-white/[0.08] bg-[#16161c]">
//                   <div
//                     className="h-24 flex items-center justify-center text-3xl"
//                     style={{ background: "linear-gradient(135deg,#E91E8C,#FF6B35)" }}
//                   >
//                     🏏
//                   </div>
//                   <div className="p-4">
//                     <p className="text-white text-[15px] font-extrabold truncate">
//                       {name.trim() || "Unnamed Room"}
//                     </p>
//                     <p className="text-white/40 text-[12px] mt-0.5 truncate">
//                       {description.trim() || "No description"}
//                     </p>
//                     <span className="inline-block mt-2 text-[11px] font-bold text-[#60a5fa] bg-[#60a5fa]/15 rounded-md px-2 py-1">
//                       {PRIVACY_OPTIONS.find((p) => p.value === privacy)?.label}
//                     </span>
//                   </div>
//                 </div>

//                 <div className="rounded-xl bg-[#16161c] border border-white/[0.08] px-4 py-3.5">
//                   <p className="text-white/50 text-[11px] leading-relaxed">
//                     By creating this room you agree to SportsFan360 Community Guidelines.
//                   </p>
//                 </div>
//               </div>
//             )}
//           </motion.div>
//         </AnimatePresence>
//       </div>

//       {/* ── Footer CTA ── */}
//       <div className="shrink-0 px-4 pt-2 pb-6 bg-[#0e0e14]"
//         style={{ paddingBottom: 'env(safe-area-inset-bottom, 1.5rem)' }}>
//         {step < TOTAL_STEPS ? (
//           <motion.button
//             whileTap={{ scale: 0.97 }}
//             type="button"
//             onClick={goNext}
//             className="w-full py-3.5 rounded-full text-white text-[14px] font-bold border-none cursor-pointer"
//             style={{ background: "linear-gradient(135deg,#E91E8C,#FF6B35)" }}
//           >
//             Continue →
//           </motion.button>
//         ) : (
//           <motion.button
//             whileTap={{ scale: 0.97 }}
//             type="button"
//             disabled={submitting}
//             onClick={handleCreate}
//             className="w-full py-3.5 rounded-full text-white text-[14px] font-bold border-none cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
//             style={{ background: "linear-gradient(135deg,#E91E8C,#FF6B35)" }}
//           >
//             {submitting ? (
//               <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
//             ) : (
//               <Rocket size={15} />
//             )}
//             {submitting ? "Creating…" : "Create Room"}
//           </motion.button>
//         )}
//       </div>
//     </div>
//   );
// }




// src/components/NewROARComponent/screens/CreateRoomWizard.tsx

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
  ArrowLeft,
  Search,
  Users,
  Mail,
  Link2,
  Rocket,
} from "lucide-react";

const SPORTS = [
  { label: "Cricket", emoji: "🏏" },
  { label: "Football", emoji: "🌍" },
  { label: "Tennis", emoji: "🎾" },
  { label: "Kabaddi", emoji: "💪" },
  { label: "Formula 1", emoji: "🏎️" },
  { label: "Olympics", emoji: "🥉" },
  { label: "Esports", emoji: "🎮" },
  { label: "Basketball", emoji: "🏀" },
];

const PRIVACY_OPTIONS = [
  { value: "public", label: "Public" },
  { value: "private", label: "Private" },
  { value: "premium", label: "Premium" },
] as const;

type Privacy = (typeof PRIVACY_OPTIONS)[number]["value"];

const SHARE_ROWS = [
  { key: "contacts", icon: Users, title: "Connect Contacts", subtitle: "Find friends from your contacts" },
  { key: "email", icon: Mail, title: "Email Invite", subtitle: "Send invite via email" },
  { key: "link", icon: Link2, title: "Share Invite Link", subtitle: "Copy or share your room link" },
];

const TOTAL_STEPS = 5;

interface CreatedRoom {
  roomId: string;
  name: string;
  description?: string;
  sport?: string;
}

interface Props {
  onCancel: () => void;
  onCreated: (room: CreatedRoom) => void;
  onToast: (m: string) => void;
}

function buildRoomShareUrl(roomId: string) {
  if (typeof window === "undefined") {
    return `https://sportsfan-frontend.vercel.app/MainModules/ROAR?room=${roomId}`;
  }
  const url = new URL(`${window.location.origin}/MainModules/ROAR`);
  url.searchParams.set("room", roomId);
  return url.toString();
}

export default function CreateRoomWizard({ onCancel, onCreated, onToast }: Props) {
  const [step, setStep] = useState(1);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [sport, setSport] = useState<string | null>(null);
  const [privacy, setPrivacy] = useState<Privacy>("public");

  const [contactSearch, setContactSearch] = useState("");
  const [copied, setCopied] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [createdRoom, setCreatedRoom] = useState<CreatedRoom | null>(null);

  const progressPct = (step / TOTAL_STEPS) * 100;

  const goBack = () => {
    if (step === 1) {
      onCancel();
      return;
    }
    setStep((s) => s - 1);
  };

  const goNext = () => {
    if (step === 1 && !name.trim()) {
      onToast("Give your room a name first.");
      return;
    }
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  };

  const handleCreate = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const res = await axios.post("/api/roar/rooms", {
        name: name.trim(),
        description: description.trim() || undefined,
        sport: sport ?? undefined,
        privacy,
      });
      if (res.data?.success) {
        setCreatedRoom(res.data.room);
        onCreated(res.data.room);
        onToast("Room created!");
      } else {
        onToast("Couldn't create the room — try again.");
      }
    } catch (e) {
      console.error("[CreateRoomWizard] create failed:", e);
      onToast("Couldn't create the room — try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const copyInviteLink = async (roomId: string) => {
    const url = buildRoomShareUrl(roomId);
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      onToast("Invite link copied!");
      setTimeout(() => setCopied(false), 1600);
    } catch {
      onToast("Couldn't copy the link.");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col overflow-hidden bg-[#0e0e14]">
      {/* ── Header ── */}
      <div className="shrink-0 px-4 pt-25 pb-3">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={goBack}
            className="w-8 h-8 rounded-full bg-white/[0.06] border-none text-white/80 flex items-center justify-center cursor-pointer"
          >
            <ArrowLeft size={16} />
          </button>

          <div className="flex-1 text-center">
            <p className="text-white text-[15px] font-extrabold leading-tight">Create Room</p>
            <p className="text-white/40 text-[11px] font-medium leading-tight">
              Step {step} of {TOTAL_STEPS}
            </p>
          </div>

          <button
            type="button"
            onClick={onCancel}
            className="text-white/50 text-[13px] font-semibold bg-transparent border-none cursor-pointer"
          >
            Cancel
          </button>
        </div>

        <div className="mt-3 h-[2px] w-full rounded-full bg-white/10 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: "linear-gradient(90deg,#E91E8C,#FF6B35)" }}
            initial={false}
            animate={{ width: `${progressPct}%` }}
            transition={{ type: "spring", damping: 26, stiffness: 220 }}
          />
        </div>
      </div>

      {/* ── Step content ── */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.18 }}
          >
            {step === 1 && (
              <div className="flex flex-col gap-5">
                <div>
                  <p className="text-white/50 text-[11px] font-bold uppercase tracking-wider mb-2">
                    Room Name
                  </p>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. IPL Super Fans"
                    className="w-full rounded-xl bg-[#16161c] border border-white/[0.08] text-white text-[14px] px-4 py-3.5 outline-none placeholder:text-white/30 focus:border-white/20"
                  />
                </div>

                <div>
                  <p className="text-white/50 text-[11px] font-bold uppercase tracking-wider mb-2">
                    Description
                  </p>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What's this room about?"
                    rows={4}
                    className="w-full resize-none rounded-xl bg-[#16161c] border border-white/[0.08] text-white text-[14px] px-4 py-3.5 outline-none placeholder:text-white/30 focus:border-white/20"
                  />
                </div>

                <div>
                  <p className="text-white/50 text-[11px] font-bold uppercase tracking-wider mb-2">
                    Sport
                  </p>
                  <div className="grid grid-cols-2 gap-2.5">
                    {SPORTS.map((s) => {
                      const active = sport === s.label;
                      return (
                        <button
                          key={s.label}
                          type="button"
                          onClick={() => setSport(active ? null : s.label)}
                          className={[
                            "rounded-xl border py-3.5 px-3 text-left text-[13px] font-bold flex items-center gap-1.5 transition-colors duration-150",
                            active
                              ? "border-[#E91E8C]/70 bg-[#E91E8C]/10 text-white"
                              : "border-white/[0.08] bg-[#16161c] text-white/80",
                          ].join(" ")}
                        >
                          <span>{s.label}</span>
                          <span>{s.emoji}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <p className="text-white/50 text-[11px] font-bold uppercase tracking-wider mb-2">
                    Privacy
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {PRIVACY_OPTIONS.map((p) => {
                      const active = privacy === p.value;
                      return (
                        <button
                          key={p.value}
                          type="button"
                          onClick={() => setPrivacy(p.value)}
                          className={[
                            "rounded-xl border py-2.5 text-[12px] font-bold transition-colors duration-150",
                            active
                              ? "border-[#E91E8C]/70 bg-[#E91E8C]/10 text-[#ff5fa8]"
                              : "border-white/[0.08] bg-[#16161c] text-white/60",
                          ].join(" ")}
                        >
                          {p.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="flex flex-col gap-4">
                <p className="text-white text-[16px] font-extrabold">Room Visuals</p>
                {[
                  { title: "Room Cover", subtitle: "1280 × 720px recommended" },
                  { title: "Room Icon", subtitle: "512 × 512px square" },
                  { title: "Banner", subtitle: "Displayed at top of room" },
                ].map((v) => (
                  <div
                    key={v.title}
                    className="flex items-center justify-between gap-3 rounded-xl border border-dashed border-white/15 bg-[#16161c] px-4 py-3.5"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-white/[0.06] shrink-0" />
                      <div className="min-w-0">
                        <p className="text-white text-[13px] font-bold truncate">{v.title}</p>
                        <p className="text-white/40 text-[11px] truncate">{v.subtitle}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled
                      className="shrink-0 rounded-full bg-white/[0.06] text-white/40 text-[12px] font-bold px-4 py-2 border-none cursor-not-allowed"
                      title="Coming soon"
                    >
                      Upload
                    </button>
                  </div>
                ))}
                <p className="text-white/30 text-[11px] leading-snug">
                  Uploads aren't available yet — you can skip this step and add visuals later.
                </p>
              </div>
            )}

            {step === 3 && (
              <div className="flex flex-col gap-4">
                <p className="text-white text-[16px] font-extrabold">Invite Members</p>

                <div className="flex items-center gap-2 rounded-xl bg-[#16161c] border border-white/[0.08] px-3.5 py-3">
                  <Search size={15} className="text-white/40 shrink-0" />
                  <input
                    value={contactSearch}
                    onChange={(e) => setContactSearch(e.target.value)}
                    placeholder="Search by username…"
                    className="flex-1 bg-transparent text-white text-[13px] outline-none placeholder:text-white/30"
                  />
                </div>

                <div className="flex flex-col gap-2.5">
                  {SHARE_ROWS.map((row) => {
                    const Icon = row.icon;
                    return (
                      <button
                        key={row.key}
                        type="button"
                        onClick={() => {
                          if (row.key === "link" && createdRoom) {
                            copyInviteLink(createdRoom.roomId);
                          } else if (!createdRoom) {
                            onToast("Finish creating the room first, then share the link.");
                          }
                        }}
                        className="flex items-center gap-3 rounded-xl bg-[#16161c] border border-white/[0.08] px-4 py-3.5 text-left cursor-pointer"
                      >
                        <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center shrink-0">
                          <Icon size={15} className="text-white/70" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-[13px] font-bold truncate">{row.title}</p>
                          <p className="text-white/40 text-[11px] truncate">
                            {row.key === "link" && copied ? "Copied!" : row.subtitle}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <p className="text-white/30 text-[11px] leading-snug">
                  You'll get a shareable invite link once the room is created in the next step.
                </p>
              </div>
            )}

            {step === 4 && (
              <div className="flex flex-col gap-4">
                <p className="text-white text-[16px] font-extrabold">Room Rules</p>
                <p className="text-white/40 text-[12px] leading-snug">
                  Optional — set a couple of ground rules for people joining {name.trim() || "your room"}.
                </p>
                <textarea
                  placeholder="e.g. Keep it respectful. No spoilers before kickoff."
                  rows={5}
                  className="w-full resize-none rounded-xl bg-[#16161c] border border-white/[0.08] text-white text-[14px] px-4 py-3.5 outline-none placeholder:text-white/30 focus:border-white/20"
                />
              </div>
            )}

            {step === 5 && (
              <div className="flex flex-col gap-4">
                <p className="text-white text-[16px] font-extrabold">Preview &amp; Confirm</p>

                <div className="rounded-2xl overflow-hidden border border-white/[0.08] bg-[#16161c]">
                  <div
                    className="h-24 flex items-center justify-center text-3xl"
                    style={{ background: "linear-gradient(135deg,#E91E8C,#FF6B35)" }}
                  >
                    🏏
                  </div>
                  <div className="p-4">
                    <p className="text-white text-[15px] font-extrabold truncate">
                      {name.trim() || "Unnamed Room"}
                    </p>
                    <p className="text-white/40 text-[12px] mt-0.5 truncate">
                      {description.trim() || "No description"}
                    </p>
                    <span className="inline-block mt-2 text-[11px] font-bold text-[#60a5fa] bg-[#60a5fa]/15 rounded-md px-2 py-1">
                      {PRIVACY_OPTIONS.find((p) => p.value === privacy)?.label}
                    </span>
                  </div>
                </div>

                <div className="rounded-xl bg-[#16161c] border border-white/[0.08] px-4 py-3.5">
                  <p className="text-white/50 text-[11px] leading-relaxed">
                    By creating this room you agree to SportsFan360 Community Guidelines.
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* ── Footer CTA — scrolls with content ── */}
        <div className="pt-6 pb-15">
          {step < TOTAL_STEPS ? (
            <motion.button
              whileTap={{ scale: 0.97 }}
              type="button"
              onClick={goNext}
              className="w-full py-3.5 rounded-full text-white text-[14px] font-bold border-none cursor-pointer"
              style={{ background: "linear-gradient(135deg,#E91E8C,#FF6B35)" }}
            >
              Continue →
            </motion.button>
          ) : (
            <motion.button
              whileTap={{ scale: 0.97 }}
              type="button"
              disabled={submitting}
              onClick={handleCreate}
              className="w-full py-3.5 rounded-full text-white text-[14px] font-bold border-none cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
              style={{ background: "linear-gradient(135deg,#E91E8C,#FF6B35)" }}
            >
              {submitting ? (
                <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              ) : (
                <Rocket size={15} />
              )}
              {submitting ? "Creating…" : "Create Room"}
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}