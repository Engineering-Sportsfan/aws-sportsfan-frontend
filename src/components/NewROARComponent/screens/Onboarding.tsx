

// //components/NewROARComponent/screens/Onboarding




// import { useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import axios from "axios";
// import AvatarWithBadge from "../components/AvatarWithBadge";

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
//     image: "/images/cricketball.png",
//   },
//   {
//     id: "football",
//     label: "Football",
//     tagline: "Lives for goals and last-minute drama.",
//     image: "/images/football.png",
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




// components/NewROARComponent/screens/Onboarding.tsx

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

interface Props {
  onComplete: (prefs: any) => void;
}

type ConfigItem = {
  id: string;
  label: string;
  order: number;
  active: boolean;
  // sports
  tagline?: string;
  image?: string;
  // engagement
  subtitle?: string;
  icon?: string;
  // followEntities
  category?: string;
  sportId?: string;
};

const CONFIG_API = "/api/roar/onboarding-config";

const SLIDE = {
  enter: (d: number) => ({ x: d > 0 ? 80 : -80, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (d: number) => ({ x: d > 0 ? -80 : 80, opacity: 0 }),
};

export default function Onboarding({ onComplete }: Props) {
  const [step, setStep] = useState(1); // 1, 2, 3
  const [dir, setDir] = useState(1);

  const [sportsOptions, setSportsOptions] = useState<ConfigItem[]>([]);
  const [followOptions, setFollowOptions] = useState<ConfigItem[]>([]);
  const [engagementOptions, setEngagementOptions] = useState<ConfigItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [sports, setSports] = useState<string[]>([]);
  const [followEntities, setFollowEntities] = useState<string[]>([]);
  const [engagementPrefs, setEngagementPrefs] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [s, f, e] = await Promise.all([
          axios.get(`${CONFIG_API}?type=sports`),
          axios.get(`${CONFIG_API}?type=followEntities`),
          axios.get(`${CONFIG_API}?type=engagement`),
        ]);
        setSportsOptions(s.data.items ?? []);
        setFollowOptions(f.data.items ?? []);
        setEngagementOptions(e.data.items ?? []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const go = (n: number) => {
    setDir(n > step ? 1 : -1);
    setStep(n);
  };

  const toggleSport = (id: string) =>
    setSports((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const toggleFollow = (id: string) =>
    setFollowEntities((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const toggleEngagement = (id: string) =>
    setEngagementPrefs((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  // group followOptions by category, only for chosen sports
  const groupedFollow = followOptions
    .filter((f) => !f.sportId || sports.includes(f.sportId))
    .reduce((acc: Record<string, ConfigItem[]>, item) => {
      const key = item.category || "Other";
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});

  const handleComplete = async () => {
    setSubmitting(true);
    const payload = { sports, followEntities, engagementPrefs };
    try {
      await axios.post("/api/roar/onboarding", payload);
      onComplete(payload);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const canContinueStep1 = sports.length > 0;
  const canContinueStep2 = followEntities.length > 0;
  const canContinueStep3 = engagementPrefs.length > 0;

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-gray-700 border-t-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black overflow-hidden flex flex-col">
      {/* Progress bar — 3 segments */}
      <div className="flex gap-1.5 px-6 pt-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex-1 h-1 rounded-full bg-gray-800 overflow-hidden">
            <div
              className={`h-full rounded-full bg-gradient-to-r from-pink-600 via-pink-500 to-orange-400 transition-all duration-300 ${
                i <= step ? "w-full" : "w-0"
              }`}
            />
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between px-6 pt-4">
        <p className="text-[11px] tracking-[0.15em] uppercase text-gray-500 font-semibold">
          Step {step} of 3
        </p>
        {step > 1 && (
          <button
            type="button"
            onClick={() => go(step - 1)}
            className="flex items-center gap-1.5 text-[13px] font-semibold text-gray-400 bg-transparent border-none cursor-pointer p-0"
          >
            <span aria-hidden="true">←</span> Back
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden relative px-6 pb-8">
        <AnimatePresence mode="wait" custom={dir}>
          {/* STEP 1 — Which sports do you follow? */}
          {step === 1 && (
            <motion.div
              key="s1"
              custom={dir}
              variants={SLIDE}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25 }}
              className="flex flex-col min-h-full"
            >
              <h2 className="font-black text-[32px] leading-[1.05] text-white mt-4">
                Which sports do you follow?
              </h2>
              <p className="text-[14px] text-gray-400 mt-2">
                Pick as many as you like — we&apos;ll tailor your feed, rooms and predictions
                around these.
              </p>

              <div className="grid grid-cols-2 gap-2 mt-6">
                {sportsOptions.map((sp) => {
                  const sel = sports.includes(sp.id);
                  return (
                    <button
                      key={sp.id}
                      type="button"
                      onClick={() => toggleSport(sp.id)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-2xl border-2 text-left bg-gray-900/60 transition-colors ${
                        sel ? "border-orange-400" : "border-gray-800"
                      }`}
                    >
                      <span className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-base shrink-0">
                        {sp.image ? (
                          <img src={sp.image} alt={sp.label} className="w-5 h-5 object-contain" />
                        ) : (
                          "🏆"
                        )}
                      </span>
                      <span className="font-semibold text-white text-[13px] flex-1">
                        {sp.label}
                      </span>
                      {sel && (
                        <span className="text-orange-400 font-bold text-[12px] shrink-0">✓</span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="flex-1" />

              <button
                type="button"
                onClick={() => canContinueStep1 && go(2)}
                disabled={!canContinueStep1}
                className={`w-full mt-8 h-[52px] rounded-full text-[16px] font-bold text-white border-none cursor-pointer bg-gradient-to-r from-pink-600 to-orange-500 transition-opacity ${
                  canContinueStep1 ? "opacity-100" : "opacity-40"
                }`}
              >
                Continue
              </button>
            </motion.div>
          )}

          {/* STEP 2 — Who do you follow closely? */}
          {step === 2 && (
            <motion.div
              key="s2"
              custom={dir}
              variants={SLIDE}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25 }}
              className="flex flex-col min-h-full"
            >
              <h2 className="font-black text-[32px] leading-[1.05] text-white mt-4">
                Who do you follow closely?
              </h2>
              <p className="text-[14px] text-gray-400 mt-2">
                Based on what you picked — teams, franchises, and athletes across your sports.
              </p>

              <div className="mt-6 space-y-4">
                {Object.entries(groupedFollow).map(([category, entities]) => (
                  <div key={category}>
                    <p className="text-[10px] tracking-[0.1em] uppercase text-gray-500 font-semibold mb-2">
                      {category}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {entities.map((ent) => {
                        const sel = followEntities.includes(ent.id);
                        return (
                          <button
                            key={ent.id}
                            type="button"
                            onClick={() => toggleFollow(ent.id)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 bg-gray-900/60 transition-colors ${
                              sel ? "border-orange-400" : "border-gray-800"
                            }`}
                          >
                            {ent.icon && (
                              <span
                                className={`text-[10px] font-bold ${
                                  sel ? "text-orange-400" : "text-gray-500"
                                }`}
                              >
                                {ent.icon}
                              </span>
                            )}
                            <span className="text-[12px] font-semibold text-white">
                              {ent.label}
                            </span>
                            {sel && (
                              <span className="text-orange-400 font-bold text-[11px]">✓</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
                {Object.keys(groupedFollow).length === 0 && (
                  <p className="text-gray-500 text-sm">No options available for your sports.</p>
                )}
              </div>

              <div className="flex-1 mt-6" />

              <button
                type="button"
                onClick={() => canContinueStep2 && go(3)}
                disabled={!canContinueStep2}
                className={`w-full mt-8 h-[52px] rounded-full text-[16px] font-bold text-white border-none cursor-pointer bg-gradient-to-r from-pink-600 to-orange-500 transition-opacity ${
                  canContinueStep2 ? "opacity-100" : "opacity-40"
                }`}
              >
                Continue
              </button>
            </motion.div>
          )}

          {/* STEP 3 — How do you like to enjoy a match? */}
          {step === 3 && (
            <motion.div
              key="s3"
              custom={dir}
              variants={SLIDE}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25 }}
              className="flex flex-col min-h-full"
            >
              <h2 className="font-black text-[32px] leading-[1.05] text-white mt-4">
                How do you like to enjoy a match?
              </h2>
              <p className="text-[14px] text-gray-400 mt-2">
                Pick as many as you like. This shapes how your Rooms and feed are set up — you
                can always change it later.
              </p>

              <div className="flex flex-col gap-2 mt-6">
                {engagementOptions.map((opt) => {
                  const sel = engagementPrefs.includes(opt.id);
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => toggleEngagement(opt.id)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl border-2 text-left bg-gray-900/60 transition-colors ${
                        sel ? "border-orange-400" : "border-gray-800"
                      }`}
                    >
                      <span className="w-9 h-9 rounded-xl bg-gray-800 flex items-center justify-center text-base shrink-0">
                        {opt.icon || "⭐"}
                      </span>
                      <span className="flex-1">
                        <p className="font-bold text-white text-[13px] leading-tight">
                          {opt.label}
                        </p>
                        {opt.subtitle && (
                          <p className="text-[11px] text-gray-400 mt-0.5">{opt.subtitle}</p>
                        )}
                      </span>
                      {sel && (
                        <span className="text-orange-400 font-bold text-[13px] shrink-0">✓</span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="flex-1 mt-6" />

              <button
                type="button"
                onClick={() => canContinueStep3 && handleComplete()}
                disabled={!canContinueStep3 || submitting}
                className={`w-full mt-8 h-[52px] rounded-full text-[16px] font-bold text-white border-none cursor-pointer bg-gradient-to-r from-pink-600 to-orange-500 transition-opacity ${
                  canContinueStep3 && !submitting ? "opacity-100" : "opacity-40"
                }`}
              >
                {submitting ? "Saving..." : "Start Roaring!"}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}