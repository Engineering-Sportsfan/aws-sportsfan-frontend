

// import { useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import axios from "axios";
// import AvatarWithBadge from "../components/AvatarWithBadge";
// import { TENURE_OPTIONS, TEAMS, HOT_TAKE_PREVIEWS, BADGE_DETAIL } from "../constants";

// interface Props {
//   onComplete: (prefs: any) => void;
// }

// const SLIDE = {
//   enter: (d: number) => ({ x: d > 0 ? 80 : -80, opacity: 0 }),
//   center: { x: 0, opacity: 1 },
//   exit: (d: number) => ({ x: d > 0 ? -80 : 80, opacity: 0 }),
// };

// export default function Onboarding({ onComplete }: Props) {
//   const [step, setStep] = useState(0);
//   const [dir, setDir] = useState(1);
//   const [sports, setSports] = useState<string[]>(["cricket"]);
//   const [teams, setTeams] = useState<string[]>(["India", "MI"]);
//   const [tenure, setTenure] = useState<string | null>(null);
//   const [firstVote, setFirstVote] = useState<string | null>(null);
//   const [showLive, setShowLive] = useState(false);

//   const selectedTenure = TENURE_OPTIONS.find((t) => t.id === tenure);

//   const go = (n: number) => {
//     setDir(n > step ? 1 : -1);
//     setStep(n);
//   };

//   const handleCompleteOnboarding = async () => {
//     try {
//       const contributionText =
//         firstVote === "agree" || firstVote === "disagree"
//           ? sports.includes("cricket")
//             ? "Virat Kohli in 2025 is better than Sachin Tendulkar ever was. Change my mind."
//             : "ISL is now world-class football. Change my mind."
//           : firstVote;

//       await axios.post("/api/roar/onboarding", {
//         sports,
//         teams,
//         tenure,
//         badge: selectedTenure?.badge || "RISING_FAN",
//         firstContribution: contributionText,
//       });

//       onComplete({
//         sports,
//         teams,
//         tenure,
//         badge: selectedTenure?.badge || "RISING_FAN",
//         firstContribution: contributionText,
//       });
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   return (
//     <div className="fixed inset-0 z-50 bg-[var(--bg-primary)] overflow-hidden flex flex-col">

//       {/* Progress dots */}
//       <div className="flex justify-center gap-2 pt-35 pb-4">
//         {[0, 1, 2, 3, 4].map((i) => (
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

//           {/* Step 0 — splash */}
//           {step === 0 && (
//             <motion.div
//               key="s0" custom={dir} variants={SLIDE}
//               initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}
//               className="flex flex-col items-center justify-center min-h-[75vh] px-8 text-center"
//             >
//               <h1 className="logotype text-[60px] leading-none tracking-[0.1em]">ROAR</h1>
//               <p className="text-[var(--text-secondary)] mt-4">Your sport. Your voice. Your reputation.</p>
//               <p className="text-[var(--text-muted)] text-[13px] mt-2">Where Indian fans build their legacy</p>
//               <motion.button
//                 whileTap={{ scale: 0.97 }}
//                 onClick={() => go(1)}
//                 className="btn-gradient btn-pulse mt-12 w-full max-w-[280px] h-[52px] rounded-full text-[18px] border-none cursor-pointer"
//                 style={{ fontFamily: "'Bebas Neue',sans-serif", letterSpacing: "0.1em" }}
//               >
//                 I'M A FAN →
//               </motion.button>
//             </motion.div>
//           )}

//           {/* Step 1 — sport + teams */}
//           {step === 1 && (
//             <motion.div
//               key="s1" custom={dir} variants={SLIDE}
//               initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}
//               className="px-6 pb-24 pt-6"
//             >
//               <h2 className="font-display text-[40px] leading-[1.1] mb-2">Claim your allegiance.</h2>
//               <p className="text-[13px] text-[var(--text-muted)] mb-5">This is how other fans will know you</p>

//               <div className="flex flex-col gap-3">
//                 {[
//                   { id: "cricket", emoji: "🏏", label: "Cricket", fans: "492M" },
//                   { id: "football", emoji: "⚽", label: "Football", fans: "138.7M" },
//                 ].map((sp) => {
//                   const sel = sports.includes(sp.id);
//                   return (
//                     <motion.button
//                       key={sp.id}
//                       whileTap={{ scale: 0.98 }}
//                       onClick={() => setSports((p) => p.includes(sp.id) ? p.filter((x) => x !== sp.id) : [...p, sp.id])}
//                       className={`flex gap-4 items-center px-5 py-4 rounded-3xl bg-[var(--bg-secondary)] cursor-pointer text-left border-2 ${sel ? "gradient-border border-transparent" : "border-[var(--border)]"}`}
//                     >
//                       <span className="text-[40px]">{sp.emoji}</span>
//                       <div>
//                         <p className="font-display text-[28px] leading-none">{sp.label}</p>
//                         <p className="text-[12px] text-[var(--text-muted)]">{sp.fans} fans on ROAR</p>
//                       </div>
//                     </motion.button>
//                   );
//                 })}
//               </div>

//               <p className="font-display text-[22px] mt-7 mb-3">Pick your teams</p>
//               <div className="grid grid-cols-4 gap-3">
//                 {TEAMS.map((t) => {
//                   const sel = teams.includes(t.id);
//                   return (
//                     <motion.button
//                       key={t.id}
//                       animate={{ scale: sel ? 1.08 : 1 }}
//                       onClick={() => setTeams((p) => p.includes(t.id) ? p.filter((x) => x !== t.id) : [...p, t.id])}
//                       className="flex flex-col items-center gap-1 bg-transparent border-none cursor-pointer rounded-full p-1"
//                       style={{ outline: sel ? `3px solid var(--accent-magenta)` : undefined }}
//                     >
//                       <span
//                         className="w-[52px] h-[52px] rounded-full flex items-center justify-center text-[22px]"
//                         style={{ background: `${t.color}44` }}
//                       >
//                         {t.emoji}
//                       </span>
//                       <span className="text-[10px] text-[var(--text-secondary)]">{t.label}</span>
//                     </motion.button>
//                   );
//                 })}
//               </div>

//               <motion.button
//                 whileTap={{ scale: 0.97 }}
//                 onClick={() => sports.length && go(2)}
//                 disabled={!sports.length}
//                 className={`btn-gradient w-full mt-7 h-[52px] rounded-full text-base border-none cursor-pointer transition-opacity ${sports.length ? "opacity-100" : "opacity-40"}`}
//               >
//                 THESE ARE MY TEAMS →
//               </motion.button>
//             </motion.div>
//           )}

//           {/* Step 2 — tenure */}
//           {step === 2 && (
//             <motion.div
//               key="s2" custom={dir} variants={SLIDE}
//               initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}
//               className="px-6 pb-18"
//             >
//               <h2 className="font-display text-[40px] leading-[1.1]">How long have you been a fan?</h2>
//               <p className="text-[13px] text-[var(--text-muted)] mt-2 mb-6">Your starter badge depends on this</p>

//               <div className="flex flex-col gap-3">
//                 {TENURE_OPTIONS.map((opt) => {
//                   const sel = tenure === opt.id;
//                   return (
//                     <motion.button
//                       key={opt.id}
//                       whileTap={{ scale: 0.98 }}
//                       onClick={() => setTenure(opt.id)}
//                       className="p-5 rounded-3xl bg-[var(--bg-secondary)] text-left cursor-pointer transition-colors border-2"
//                       style={{ borderColor: sel ? "var(--accent-magenta)" : "var(--border)" }}
//                     >
//                       <p className="font-bold text-[15px]">{opt.label}</p>
//                       <p className="text-[12px] text-[var(--text-secondary)] mt-0.5">{opt.sub}</p>
//                       <span className="inline-block mt-2.5 text-[12px] px-3 py-1 rounded-full bg-[var(--bg-tertiary)] text-[var(--accent-magenta)]">
//                         {opt.chip}
//                       </span>
//                       {sel && (
//                         <motion.div
//                           initial={{ opacity: 0, height: 0 }}
//                           animate={{ opacity: 1, height: "auto" }}
//                           className="mt-3.5 p-3 rounded-2xl"
//                           style={{ background: "rgba(233,30,140,0.08)", border: "1px solid rgba(233,30,140,0.2)" }}
//                         >
//                           <p className="text-[11px] text-[var(--accent-magenta)] font-bold tracking-[0.08em] uppercase mb-1.5">
//                             Your Starter Badge
//                           </p>
//                           <div className="flex items-center gap-2.5">
//                             <div
//                               className="w-11 h-11 flex items-center justify-center text-[20px]"
//                               style={{
//                                 clipPath: "polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)",
//                                 background: opt.id === "og"
//                                   ? "linear-gradient(135deg,#B87333,#CD7F32)"
//                                   : opt.id === "seasoned"
//                                   ? "linear-gradient(135deg,#8888A0,#666680)"
//                                   : "linear-gradient(135deg,#44445A,#6B6B8A)",
//                               }}
//                             >
//                               {opt.id === "og" ? "👑" : opt.id === "seasoned" ? "🏅" : "⭐"}
//                             </div>
//                             <div>
//                               <p className="font-bold text-[14px]">{opt.chip.replace(/[⭐🏅👑]/g, "").trim()}</p>
//                               <p className="text-[11px] text-[var(--text-muted)] mt-0.5">{BADGE_DETAIL[opt.badge]?.description}</p>
//                             </div>
//                           </div>
//                         </motion.div>
//                       )}
//                     </motion.button>
//                   );
//                 })}
//               </div>

//               <motion.button
//                 whileTap={{ scale: 0.97 }}
//                 onClick={() => tenure && go(3)}
//                 disabled={!tenure}
//                 className={`btn-gradient w-full mt-6 h-[52px] rounded-full text-base border-none cursor-pointer transition-opacity ${tenure ? "opacity-100" : "opacity-40"}`}
//               >
//                 CLAIM MY BADGE →
//               </motion.button>
//             </motion.div>
//           )}

//           {/* Step 3 — social proof */}
//           {step === 3 && (
//             <motion.div
//               key="s3" custom={dir} variants={SLIDE}
//               initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}
//               className="px-6 pb-18"
//             >
//               <h2 className="font-display text-[48px] leading-[1.1]">You're not alone.</h2>
//               <div className="grid grid-cols-3 gap-3 mt-7">
//                 {[
//                   { n: "492M", l: "Cricket fans" },
//                   { n: "138.7M", l: "Football fans" },
//                   { n: "1,247", l: "Debating now" },
//                 ].map((s) => (
//                   <div key={s.l} className="text-center">
//                     <p className="font-display text-[28px] text-white">{s.n}</p>
//                     <p className="text-[10px] text-[var(--text-muted)] mt-1">{s.l}</p>
//                   </div>
//                 ))}
//               </div>

//               <p className="text-[13px] text-[var(--text-secondary)] mt-7 mb-3">What fans are saying right now</p>
//               {HOT_TAKE_PREVIEWS.map((ht) => (
//                 <div key={ht.id} className="glass-card px-4 py-3 mb-2 opacity-90">
//                   <div className="flex gap-2 items-center mb-2">
//                     <AvatarWithBadge username={ht.fan.username} badge={ht.fan.badge} size="sm" />
//                     <span className="text-[12px] font-semibold">{ht.fan.username}</span>
//                   </div>
//                   <p className="text-[13px]">{ht.text}</p>
//                 </div>
//               ))}

//               <motion.button
//                 whileTap={{ scale: 0.97 }}
//                 onClick={() => go(4)}
//                 className="btn-gradient w-full mt-6 h-[52px] rounded-full text-base border-none cursor-pointer"
//               >
//                 ENTER ROAR →
//               </motion.button>
//             </motion.div>
//           )}

//           {/* Step 4 — first take */}
//           {step === 4 && (
//             <motion.div
//               key="s4" custom={dir} variants={SLIDE}
//               initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}
//               className="px-6 pb-20"
//             >
//               <h2 className="font-display text-[40px] leading-[1.1]">Before you go in —</h2>
//               <p className="text-[13px] text-[var(--text-muted)] mt-2">
//                 Drop one take. It takes 10 seconds. This is what ROAR is about.
//               </p>

//               <div className="glass-card p-5 mt-6">
//                 <p className="font-semibold text-[15px] leading-relaxed">
//                   {sports.includes("cricket")
//                     ? "Kohli in 2025 is better than Sachin ever was. Agree or disagree?"
//                     : "ISL is now world-class football. Agree or disagree?"}
//                 </p>
//               </div>

//               {!firstVote ? (
//                 <div className="flex gap-3 mt-6">
//                   {["agree", "disagree"].map((v) => (
//                     <motion.button
//                       key={v}
//                       whileTap={{ scale: 0.95 }}
//                       onClick={() => {
//                         setFirstVote(v);
//                         setTimeout(() => setShowLive(true), 400);
//                       }}
//                       className="flex-1 py-4 rounded-[20px] text-[18px] font-bold cursor-pointer bg-transparent border-2"
//                       style={{
//                         borderColor: v === "agree" ? "var(--accent-magenta)" : "var(--accent-orange)",
//                         color: v === "agree" ? "var(--accent-magenta)" : "var(--accent-orange)",
//                       }}
//                     >
//                       {v === "agree" ? "Agree 🔥" : "Disagree 💀"}
//                     </motion.button>
//                   ))}
//                 </div>
//               ) : (
//                 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 text-center">
//                   <p className="text-[var(--text-secondary)]">Your first take is live. 47 fans are about to see it.</p>
//                   {showLive && (
//                     <motion.button
//                       whileTap={{ scale: 0.97 }}
//                       initial={{ opacity: 0 }}
//                       animate={{ opacity: 1 }}
//                       onClick={handleCompleteOnboarding}
//                       className="btn-gradient w-full mt-6 h-[52px] rounded-full text-base border-none cursor-pointer"
//                     >
//                       LET'S GO →
//                     </motion.button>
//                   )}
//                 </motion.div>
//               )}
//             </motion.div>
//           )}

//         </AnimatePresence>
//       </div>
//     </div>
//   );
// }



//components/NewROARComponent/screens/Onboarding




import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import AvatarWithBadge from "../components/AvatarWithBadge";

interface Props {
  onComplete: (prefs: any) => void;
}

const SLIDE = {
  enter: (d: number) => ({ x: d > 0 ? 80 : -80, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (d: number) => ({ x: d > 0 ? -80 : 80, opacity: 0 }),
};

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

// TODO: placeholder badge — swap for real FIRST_ROAR entry in BADGE_CONFIG / BADGE_DETAIL once defined
const FIRST_ROAR_BADGE = {
  id: "FIRST_ROAR",
  name: "FIRST ROAR",
  icon: "🐯",
  gradient: "linear-gradient(135deg,#FF9800,#FF5722)",
  repPoints: 2,
};

export default function Onboarding({ onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [sports, setSports] = useState<string[]>(["cricket"]);
  const [firstVote, setFirstVote] = useState<string | null>(null);

  const go = (n: number) => {
    setDir(n > step ? 1 : -1);
    setStep(n);
  };

  const debatePrompt = sports.includes("football")
    ? "Mbapp\u00e9 is the most dangerous player in world football right now."
    : "Virat Kohli in 2025 is better than Sachin Tendulkar ever was.";

  const handleVote = (v: string) => {
    setFirstVote(v);
    setTimeout(() => go(3), 350);
  };

  const handleCompleteOnboarding = async () => {
    const payload = {
      sports,
      badge: "RISING_FAN",
      firstContribution: debatePrompt,
      firstVote,
      repPointsAwarded: FIRST_ROAR_BADGE.repPoints,
    };

    try {
      await axios.post("/api/roar/onboarding", payload);
    } catch (err) {
      console.error("Onboarding API error:", err);
    } finally {
      // ALWAYS call onComplete so the UI doesn't freeze!
      onComplete(payload);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[var(--bg-primary)] overflow-hidden flex flex-col">
      {/* Logo */}
      <div className="pt-10 pl-6">
        <h1 className="logotype text-[28px] leading-none tracking-[0.08em]">ROAR</h1>
      </div>

      {/* Progress dots */}
      <div className="flex justify-center gap-2 pt-6 pb-4">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-2 rounded-full transition-all duration-300"
            style={{
              width: i <= step ? 24 : 8,
              background: i <= step ? "var(--accent-magenta)" : "var(--border)",
            }}
          />
        ))}
      </div>

      <div
        className="flex-1 overflow-y-auto overflow-x-hidden relative"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <AnimatePresence mode="wait" custom={dir}>
          {/* Step 0 — sample profile card / value prop */}
          {step === 0 && (
            <motion.div
              key="s0"
              custom={dir}
              variants={SLIDE}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center justify-center min-h-[70vh] px-8 text-center"
            >
              <div className="glass-card w-full max-w-[320px] px-5 py-5 relative">
                <div className="flex items-center gap-3">
                  <AvatarWithBadge username="messi_90s" badge="OG_FAN" size="md" />
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[15px]">messi_90s</span>
                      <span
                        className="text-[11px] px-2.5 py-0.5 rounded-full font-semibold"
                        style={{
                          background: "linear-gradient(135deg,#7B61FF,#E91E8C)",
                          color: "#fff",
                        }}
                      >
                        OG Fan
                      </span>
                    </div>
                    <p className="text-[12px] text-[var(--text-muted)] mt-0.5">
                      Sports Oracle · Football
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 mt-4">
                  {[
                    { v: "71%", l: "Accuracy" },
                    { v: "67", l: "Predictions" },
                    { v: "412", l: "Rep pts" },
                    { v: "203", l: "Followers" },
                  ].map((s) => (
                    <div key={s.l} className="bg-[var(--bg-tertiary)] rounded-2xl py-2.5 text-center">
                      <p className="font-display text-[18px] leading-none">{s.v}</p>
                      <p className="text-[9px] text-[var(--text-muted)] mt-1">{s.l}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-4">
                  <div className="flex justify-between text-[11px] mb-1.5">
                    <span className="text-[var(--text-secondary)]">Rep Points</span>
                    <span className="text-[var(--accent-orange)]">412 points</span>
                  </div>
                  <div className="h-2 rounded-full bg-[var(--bg-tertiary)] overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: "62%", background: "linear-gradient(90deg,#FFB800,#FF5722)" }}
                    />
                  </div>
                </div>
              </div>

              <h2 className="font-display text-[34px] leading-[1.05] mt-10 uppercase">
                Build your true sportsfan identity
              </h2>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => go(1)}
                className="btn-gradient mt-10 w-full max-w-[280px] h-[52px] rounded-full text-[18px] border-none cursor-pointer"
                style={{ fontFamily: "'Bebas Neue',sans-serif", letterSpacing: "0.08em" }}
              >
                LET'S GO
              </motion.button>
            </motion.div>
          )}

          {/* Step 1 — sport selection */}
          {step === 1 && (
            <motion.div
              key="s1"
              custom={dir}
              variants={SLIDE}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="px-6 pb-24 pt-10 flex flex-col min-h-[75vh]"
            >
              <div className="flex flex-col gap-4">
                {SPORT_OPTIONS.map((sp) => {
                  const sel = sports.includes(sp.id);
                  return (
                    <motion.button
                      key={sp.id}
                      whileTap={{ scale: 0.98 }}
                      onClick={() =>
                        setSports((p) =>
                          p.includes(sp.id) ? p.filter((x) => x !== sp.id) : [...p, sp.id]
                        )
                      }
                      className={`flex gap-4 items-center px-5 py-4 rounded-3xl bg-[var(--bg-secondary)] cursor-pointer text-left border-2 ${
                        sel ? "gradient-border border-transparent" : "border-[var(--border)]"
                      }`}
                    >
                      <img
                        src={sp.image}
                        alt={sp.label}
                        className="w-[44px] h-[44px] object-contain shrink-0"
                      />
                      <div>
                        <p className="font-semibold text-[16px] leading-tight">{sp.label}</p>
                        <p className="text-[12px] text-[var(--text-muted)] mt-0.5">{sp.tagline}</p>
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              <div className="flex-1" />

              <h2 className="font-display text-[40px] leading-[1.05] mt-8 uppercase">
                What do you follow?
              </h2>
              <p className="text-[13px] text-[var(--text-muted)] mt-2">
                Select one or both. You can change this later.
              </p>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => sports.length && go(2)}
                disabled={!sports.length}
                className={`btn-gradient w-full mt-7 h-[52px] rounded-full text-base border-none cursor-pointer transition-opacity ${
                  sports.length ? "opacity-100" : "opacity-40"
                }`}
              >
                START ROARING!
              </motion.button>
            </motion.div>
          )}

          {/* Step 2 — pick a side (debate) */}
          {step === 2 && (
            <motion.div
              key="s2"
              custom={dir}
              variants={SLIDE}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="px-6 pb-20 pt-10 flex flex-col min-h-[75vh]"
            >
              <div className="glass-card px-4 py-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <AvatarWithBadge username="roar_bot" badge="ORACLE" size="sm" />
                    <div>
                      <p className="text-[13px] font-semibold leading-none">@roar_bot</p>
                      <p className="text-[10px] text-[var(--text-muted)] mt-1">12:32</p>
                    </div>
                  </div>
                  <span
                    className="text-[11px] px-2.5 py-1 rounded-full font-semibold"
                    style={{ background: "var(--bg-tertiary)", color: "var(--accent-orange)" }}
                  >
                    ⚡ Debate
                  </span>
                </div>

                <p className="text-[15px] leading-relaxed mb-4">{debatePrompt}</p>

                <div className="flex gap-3">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleVote("agree")}
                    className="flex-1 py-3 rounded-2xl text-[15px] font-semibold cursor-pointer bg-[var(--bg-tertiary)] border-none flex items-center justify-center gap-2"
                  >
                    Agree 👍
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleVote("disagree")}
                    className="flex-1 py-3 rounded-2xl text-[15px] font-semibold cursor-pointer bg-[var(--bg-tertiary)] border-none flex items-center justify-center gap-2"
                  >
                    Disagree 👎
                  </motion.button>
                </div>
              </div>

              <div className="flex-1" />

              <h2 className="font-display text-[40px] leading-[1.05] mt-8 uppercase">
                Pick a side
              </h2>
              <p className="text-[13px] text-[var(--text-muted)] mt-2">
                You'll earn Rep Points everytime you take part in debate.
              </p>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => firstVote && go(3)}
                disabled={!firstVote}
                className={`btn-gradient w-full mt-7 h-[52px] rounded-full text-base border-none cursor-pointer transition-opacity ${
                  firstVote ? "opacity-100" : "opacity-40"
                }`}
              >
                CONTINUE
              </motion.button>
            </motion.div>
          )}

          {/* Step 3 — badge reveal */}
          {step === 3 && (
            <motion.div
              key="s3"
              custom={dir}
              variants={SLIDE}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center justify-center min-h-[75vh] px-8 text-center"
            >
              <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 14 }}
                className="w-[140px] h-[140px] flex items-center justify-center text-[64px]"
                style={{
                  clipPath: "polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)",
                  background: FIRST_ROAR_BADGE.gradient,
                }}
              >
                {FIRST_ROAR_BADGE.icon}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-5 px-4 py-1.5 rounded-full text-[13px] font-bold"
                style={{ background: "rgba(255,87,34,0.15)", color: "var(--accent-orange)" }}
              >
                +{FIRST_ROAR_BADGE.repPoints} Rep Points
              </motion.div>

              <p className="text-[12px] tracking-[0.15em] uppercase text-[var(--accent-orange)] font-bold mt-7">
                Earned Badge
              </p>
              <h2 className="font-display text-[44px] leading-none uppercase mt-2">
                {FIRST_ROAR_BADGE.name}
              </h2>
              <p className="text-[13px] text-[var(--text-secondary)] mt-2">
                +{FIRST_ROAR_BADGE.repPoints} Rep Points added
              </p>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleCompleteOnboarding}
                className="btn-gradient mt-10 w-full max-w-[280px] h-[52px] rounded-full text-base border-none cursor-pointer"
              >
                CONTINUE
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}