
// //MainModules/RoarPreference/page.tsx

// 'use client';


// import { useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import axios from "axios";
// import AvatarWithBadge from "../../../src/components/NewROARComponent/components/AvatarWithBadge";

// interface Props {
//   onComplete: (prefs: any) => void;
// }

// const SLIDE = {
//   enter: (d: number) => ({ x: d > 0 ? 80 : -80, opacity: 0 }),
//   center: { x: 0, opacity: 1 },
//   exit: (d: number) => ({ x: d > 0 ? -80 : 80, opacity: 0 }),
// };

// // TODO: replace placeholder image paths once final assets land
// const SPORT_OPTIONS = [
//   {
//     id: "cricket",
//     label: "Cricket",
//     tagline: "Lives for sixes and controversies.",
//     image: "/assets/onboarding/cricket-ball.png",
//   },
//   {
//     id: "football",
//     label: "Football",
//     tagline: "Lives for goals and last-minute drama.",
//     image: "/assets/onboarding/football.png",
//   },
// ];

// // TODO: placeholder badge — swap for real FIRST_ROAR entry in BADGE_CONFIG / BADGE_DETAIL once defined
// const FIRST_ROAR_BADGE = {
//   id: "FIRST_ROAR",
//   name: "FIRST ROAR",
//   icon: "🐯",
//   gradient: "linear-gradient(135deg,#FF9800,#FF5722)",
//   repPoints: 2,
// };

// export default function Onboarding({ onComplete }: Props) {
//   const [step, setStep] = useState(0);
//   const [dir, setDir] = useState(1);
//   const [sports, setSports] = useState<string[]>(["cricket"]);
//   const [firstVote, setFirstVote] = useState<string | null>(null);

//   const go = (n: number) => {
//     setDir(n > step ? 1 : -1);
//     setStep(n);
//   };

//   const debatePrompt = sports.includes("football")
//     ? "Mbapp\u00e9 is the most dangerous player in world football right now."
//     : "Virat Kohli in 2025 is better than Sachin Tendulkar ever was.";

//   const handleVote = (v: string) => {
//     setFirstVote(v);
//     setTimeout(() => go(3), 350);
//   };

//   const handleCompleteOnboarding = async () => {
//     try {
//       await axios.post("/api/roar/onboarding", {
//         sports,
//         badge: "RISING_FAN",
//         firstContribution: debatePrompt,
//         firstVote,
//         repPointsAwarded: FIRST_ROAR_BADGE.repPoints,
//       });

//       onComplete({
//         sports,
//         badge: "RISING_FAN",
//         firstContribution: debatePrompt,
//         firstVote,
//         repPointsAwarded: FIRST_ROAR_BADGE.repPoints,
//       });
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   return (
//     <div className="fixed inset-0 z-50 bg-[var(--bg-primary)] overflow-hidden flex flex-col">
//       {/* Logo */}
//       <div className="pt-10 pl-6">
//         <h1 className="logotype text-[28px] leading-none tracking-[0.08em]">ROAR</h1>
//       </div>

//       {/* Progress dots */}
//       <div className="flex justify-center gap-2 pt-6 pb-4">
//         {[0, 1, 2, 3].map((i) => (
//           <div
//             key={i}
//             className="h-2 rounded-full transition-all duration-300"
//             style={{
//               width: i <= step ? 24 : 8,
//               background: i <= step ? "var(--accent-magenta)" : "var(--border)",
//             }}
//           />
//         ))}
//       </div>

//       <div
//         className="flex-1 overflow-y-auto overflow-x-hidden relative"
//         style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
//       >
//         <AnimatePresence mode="wait" custom={dir}>
//           {/* Step 0 — sample profile card / value prop */}
//           {step === 0 && (
//             <motion.div
//               key="s0"
//               custom={dir}
//               variants={SLIDE}
//               initial="enter"
//               animate="center"
//               exit="exit"
//               transition={{ duration: 0.3 }}
//               className="flex flex-col items-center justify-center min-h-[70vh] px-8 text-center"
//             >
//               <div className="glass-card w-full max-w-[320px] px-5 py-5 relative">
//                 <div className="flex items-center gap-3">
//                   <AvatarWithBadge username="messi_90s" badge="OG_FAN" size="md" />
//                   <div className="text-left">
//                     <div className="flex items-center gap-2">
//                       <span className="font-semibold text-[15px]">messi_90s</span>
//                       <span
//                         className="text-[11px] px-2.5 py-0.5 rounded-full font-semibold"
//                         style={{
//                           background: "linear-gradient(135deg,#7B61FF,#E91E8C)",
//                           color: "#fff",
//                         }}
//                       >
//                         OG Fan
//                       </span>
//                     </div>
//                     <p className="text-[12px] text-[var(--text-muted)] mt-0.5">
//                       Sports Oracle · Football
//                     </p>
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-4 gap-2 mt-4">
//                   {[
//                     { v: "71%", l: "Accuracy" },
//                     { v: "67", l: "Predictions" },
//                     { v: "412", l: "Rep pts" },
//                     { v: "203", l: "Followers" },
//                   ].map((s) => (
//                     <div key={s.l} className="bg-[var(--bg-tertiary)] rounded-2xl py-2.5 text-center">
//                       <p className="font-display text-[18px] leading-none">{s.v}</p>
//                       <p className="text-[9px] text-[var(--text-muted)] mt-1">{s.l}</p>
//                     </div>
//                   ))}
//                 </div>

//                 <div className="mt-4">
//                   <div className="flex justify-between text-[11px] mb-1.5">
//                     <span className="text-[var(--text-secondary)]">Rep Points</span>
//                     <span className="text-[var(--accent-orange)]">412 points</span>
//                   </div>
//                   <div className="h-2 rounded-full bg-[var(--bg-tertiary)] overflow-hidden">
//                     <div
//                       className="h-full rounded-full"
//                       style={{ width: "62%", background: "linear-gradient(90deg,#FFB800,#FF5722)" }}
//                     />
//                   </div>
//                 </div>
//               </div>

//               <h2 className="font-display text-[34px] leading-[1.05] mt-10 uppercase">
//                 Build your true sportsfan identity
//               </h2>

//               <motion.button
//                 whileTap={{ scale: 0.97 }}
//                 onClick={() => go(1)}
//                 className="btn-gradient mt-10 w-full max-w-[280px] h-[52px] rounded-full text-[18px] border-none cursor-pointer"
//                 style={{ fontFamily: "'Bebas Neue',sans-serif", letterSpacing: "0.08em" }}
//               >
//                 LET'S GO
//               </motion.button>
//             </motion.div>
//           )}

//           {/* Step 1 — sport selection */}
//           {step === 1 && (
//             <motion.div
//               key="s1"
//               custom={dir}
//               variants={SLIDE}
//               initial="enter"
//               animate="center"
//               exit="exit"
//               transition={{ duration: 0.3 }}
//               className="px-6 pb-24 pt-10 flex flex-col min-h-[75vh]"
//             >
//               <div className="flex flex-col gap-4">
//                 {SPORT_OPTIONS.map((sp) => {
//                   const sel = sports.includes(sp.id);
//                   return (
//                     <motion.button
//                       key={sp.id}
//                       whileTap={{ scale: 0.98 }}
//                       onClick={() =>
//                         setSports((p) =>
//                           p.includes(sp.id) ? p.filter((x) => x !== sp.id) : [...p, sp.id]
//                         )
//                       }
//                       className={`flex gap-4 items-center px-5 py-4 rounded-3xl bg-[var(--bg-secondary)] cursor-pointer text-left border-2 ${
//                         sel ? "gradient-border border-transparent" : "border-[var(--border)]"
//                       }`}
//                     >
//                       <img
//                         src={sp.image}
//                         alt={sp.label}
//                         className="w-[44px] h-[44px] object-contain shrink-0"
//                       />
//                       <div>
//                         <p className="font-semibold text-[16px] leading-tight">{sp.label}</p>
//                         <p className="text-[12px] text-[var(--text-muted)] mt-0.5">{sp.tagline}</p>
//                       </div>
//                     </motion.button>
//                   );
//                 })}
//               </div>

//               <div className="flex-1" />

//               <h2 className="font-display text-[40px] leading-[1.05] mt-8 uppercase">
//                 What do you follow?
//               </h2>
//               <p className="text-[13px] text-[var(--text-muted)] mt-2">
//                 Select one or both. You can change this later.
//               </p>

//               <motion.button
//                 whileTap={{ scale: 0.97 }}
//                 onClick={() => sports.length && go(2)}
//                 disabled={!sports.length}
//                 className={`btn-gradient w-full mt-7 h-[52px] rounded-full text-base border-none cursor-pointer transition-opacity ${
//                   sports.length ? "opacity-100" : "opacity-40"
//                 }`}
//               >
//                 START ROARING!
//               </motion.button>
//             </motion.div>
//           )}

//           {/* Step 2 — pick a side (debate) */}
//           {step === 2 && (
//             <motion.div
//               key="s2"
//               custom={dir}
//               variants={SLIDE}
//               initial="enter"
//               animate="center"
//               exit="exit"
//               transition={{ duration: 0.3 }}
//               className="px-6 pb-20 pt-10 flex flex-col min-h-[75vh]"
//             >
//               <div className="glass-card px-4 py-4">
//                 <div className="flex items-center justify-between mb-3">
//                   <div className="flex items-center gap-2">
//                     <AvatarWithBadge username="roar_bot" badge="ORACLE" size="sm" />
//                     <div>
//                       <p className="text-[13px] font-semibold leading-none">@roar_bot</p>
//                       <p className="text-[10px] text-[var(--text-muted)] mt-1">12:32</p>
//                     </div>
//                   </div>
//                   <span
//                     className="text-[11px] px-2.5 py-1 rounded-full font-semibold"
//                     style={{ background: "var(--bg-tertiary)", color: "var(--accent-orange)" }}
//                   >
//                     ⚡ Debate
//                   </span>
//                 </div>

//                 <p className="text-[15px] leading-relaxed mb-4">{debatePrompt}</p>

//                 <div className="flex gap-3">
//                   <motion.button
//                     whileTap={{ scale: 0.95 }}
//                     onClick={() => handleVote("agree")}
//                     className="flex-1 py-3 rounded-2xl text-[15px] font-semibold cursor-pointer bg-[var(--bg-tertiary)] border-none flex items-center justify-center gap-2"
//                   >
//                     Agree 👍
//                   </motion.button>
//                   <motion.button
//                     whileTap={{ scale: 0.95 }}
//                     onClick={() => handleVote("disagree")}
//                     className="flex-1 py-3 rounded-2xl text-[15px] font-semibold cursor-pointer bg-[var(--bg-tertiary)] border-none flex items-center justify-center gap-2"
//                   >
//                     Disagree 👎
//                   </motion.button>
//                 </div>
//               </div>

//               <div className="flex-1" />

//               <h2 className="font-display text-[40px] leading-[1.05] mt-8 uppercase">
//                 Pick a side
//               </h2>
//               <p className="text-[13px] text-[var(--text-muted)] mt-2">
//                 You'll earn Rep Points everytime you take part in debate.
//               </p>

//               <motion.button
//                 whileTap={{ scale: 0.97 }}
//                 onClick={() => firstVote && go(3)}
//                 disabled={!firstVote}
//                 className={`btn-gradient w-full mt-7 h-[52px] rounded-full text-base border-none cursor-pointer transition-opacity ${
//                   firstVote ? "opacity-100" : "opacity-40"
//                 }`}
//               >
//                 CONTINUE
//               </motion.button>
//             </motion.div>
//           )}

//           {/* Step 3 — badge reveal */}
//           {step === 3 && (
//             <motion.div
//               key="s3"
//               custom={dir}
//               variants={SLIDE}
//               initial="enter"
//               animate="center"
//               exit="exit"
//               transition={{ duration: 0.3 }}
//               className="flex flex-col items-center justify-center min-h-[75vh] px-8 text-center"
//             >
//               <motion.div
//                 initial={{ scale: 0.6, opacity: 0 }}
//                 animate={{ scale: 1, opacity: 1 }}
//                 transition={{ type: "spring", stiffness: 200, damping: 14 }}
//                 className="w-[140px] h-[140px] flex items-center justify-center text-[64px]"
//                 style={{
//                   clipPath: "polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)",
//                   background: FIRST_ROAR_BADGE.gradient,
//                 }}
//               >
//                 {FIRST_ROAR_BADGE.icon}
//               </motion.div>

//               <motion.div
//                 initial={{ opacity: 0, y: 10 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: 0.2 }}
//                 className="mt-5 px-4 py-1.5 rounded-full text-[13px] font-bold"
//                 style={{ background: "rgba(255,87,34,0.15)", color: "var(--accent-orange)" }}
//               >
//                 +{FIRST_ROAR_BADGE.repPoints} Rep Points
//               </motion.div>

//               <p className="text-[12px] tracking-[0.15em] uppercase text-[var(--accent-orange)] font-bold mt-7">
//                 Earned Badge
//               </p>
//               <h2 className="font-display text-[44px] leading-none uppercase mt-2">
//                 {FIRST_ROAR_BADGE.name}
//               </h2>
//               <p className="text-[13px] text-[var(--text-secondary)] mt-2">
//                 +{FIRST_ROAR_BADGE.repPoints} Rep Points added
//               </p>

//               <motion.button
//                 whileTap={{ scale: 0.97 }}
//                 onClick={handleCompleteOnboarding}
//                 className="btn-gradient mt-10 w-full max-w-[280px] h-[52px] rounded-full text-base border-none cursor-pointer"
//               >
//                 CONTINUE
//               </motion.button>
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </div>
//     </div>
//   );
// }


'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import axios from "axios";

// TODO: replace placeholder image paths once final assets land
const SPORT_OPTIONS = [
  {
    id: "cricket",
    label: "Cricket",
    tagline: "Lives for sixes and controversies.",
    image: "/images/cricketball.png",
  },
  {
    id: "football",
    label: "Football",
    tagline: "Lives for goals and last-minute drama.",
    image: "/images/football.png",
  },
];

type LoadState = "loading" | "ready" | "error";
type SaveState = "idle" | "saving" | "saved" | "error";

export default function RoarPreferencesPage() {
  const router = useRouter();
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [sports, setSports] = useState<string[]>([]);
  const [initialSports, setInitialSports] = useState<string[]>([]);

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const res = await axios.get("/api/roar/onboarding");
        const currentSports: string[] = res.data?.sports ?? [];
        setSports(currentSports);
        setInitialSports(currentSports);
        setLoadState("ready");
      } catch (err) {
        console.error(err);
        setLoadState("error");
      }
    };
    loadPreferences();
  }, []);

  const toggleSport = (id: string) => {
    setSports((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const hasChanges =
    sports.length !== initialSports.length || sports.some((s) => !initialSports.includes(s));

  const handleSave = async () => {
    if (!sports.length || !hasChanges) return;
    setSaveState("saving");
    try {
      const res = await axios.patch("/api/roar/onboarding", { sports });
      if (res.data?.success) {
        setInitialSports(sports);
        setSaveState("saved");
        setTimeout(() => router.push("/MainModules/ROAR"), 600);
      } else {
        setSaveState("error");
      }
    } catch (err) {
      console.error(err);
      setSaveState("error");
    }
  };

  if (loadState === "loading") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div
          style={{
            width: 32,
            height: 32,
            border: "3px solid rgba(255,255,255,0.1)",
            borderTop: "3px solid var(--accent-magenta)",
            borderRadius: "50%",
            animation: "roar-spin 1s linear infinite",
          }}
        />
        <style dangerouslySetInnerHTML={{ __html: `@keyframes roar-spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}` }} />
      </div>
    );
  }

  if (loadState === "error") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-6 text-center">
        <p className="text-[14px] text-[var(--text-muted)]">
          Couldn't load your preferences. Please try again in a moment.
        </p>
      </div>
    );
  }

  return (
    <div className="px-6 pt-8 pb-28 max-w-[480px] mx-auto">
      <h1 className="font-display text-[32px] leading-[1.05] uppercase">Sports preferences</h1>
      <p className="text-[13px] text-[var(--text-muted)] mt-2">
        Choose the sports you want to follow. This updates what shows up in your feed.
      </p>

      <div className="flex flex-col gap-4 mt-7">
        {SPORT_OPTIONS.map((sp) => {
          const sel = sports.includes(sp.id);
          return (
            <motion.button
              key={sp.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => toggleSport(sp.id)}
              className={`flex gap-4 items-center px-5 py-4 rounded-3xl bg-[var(--bg-secondary)] cursor-pointer text-left border-2 ${
                sel ? "gradient-border border-transparent" : "border-[var(--border)]"
              }`}
            >
              <img src={sp.image} alt={sp.label} className="w-[44px] h-[44px] object-contain shrink-0" />
              <div className="flex-1">
                <p className="font-semibold text-[16px] leading-tight">{sp.label}</p>
                <p className="text-[12px] text-[var(--text-muted)] mt-0.5">{sp.tagline}</p>
              </div>
              <div
                className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0"
                style={{
                  borderColor: sel ? "var(--accent-magenta)" : "var(--border)",
                  background: sel ? "var(--accent-magenta)" : "transparent",
                }}
              >
                {sel && <span className="text-white text-[12px] leading-none">✓</span>}
              </div>
            </motion.button>
          );
        })}
      </div>

     <motion.button
  whileTap={{ scale: 0.97 }}
  onClick={handleSave}
  disabled={!sports.length || !hasChanges || saveState === "saving" || saveState === "saved"}
  className={`w-full mt-8 h-[52px] rounded-full text-base border-none cursor-pointer transition-all duration-200 ${
    saveState === "saved" ? "" : "btn-gradient"
  }`}
  style={{
    opacity: !sports.length || !hasChanges || saveState === "saving" ? 0.4 : 1,
    ...(saveState === "saved" 
      ? { 
          background: "linear-gradient(135deg, #e91e8c, #ff6b35)", 
          color: "#fff",
          boxShadow: "0 4px 20px rgba(233,30,140,0.4)"
        } 
      : {}
    ),
    // Always ensure pink accent even when not saved
    background: saveState === "saved" 
      ? "linear-gradient(135deg, #e91e8c, #ff6b35)" 
      : "linear-gradient(135deg, #e91e8c, #ff6b35)",
    color: "#fff",
    fontWeight: 700,
    letterSpacing: "0.5px",
  }}
>
  {saveState === "saving" ? "Saving..." : saveState === "saved" ? "✓ Saved" : "Save changes"}
</motion.button>

      {saveState === "error" && (
        <p className="text-[12px] text-center mt-3" style={{ color: "var(--accent-orange)" }}>
          Couldn't save your changes. Please try again.
        </p>
      )}
    </div>
  );
}