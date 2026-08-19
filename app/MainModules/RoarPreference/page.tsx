
// 'use client';

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import { motion } from "framer-motion";
// import axios from "axios";

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

// type LoadState = "loading" | "ready" | "error";
// type SaveState = "idle" | "saving" | "saved" | "error";

// export default function RoarPreferencesPage() {
//   const router = useRouter();
//   const [loadState, setLoadState] = useState<LoadState>("loading");
//   const [saveState, setSaveState] = useState<SaveState>("idle");
//   const [sports, setSports] = useState<string[]>([]);
//   const [initialSports, setInitialSports] = useState<string[]>([]);

//   useEffect(() => {
//     const loadPreferences = async () => {
//       try {
//         const res = await axios.get("/api/roar/onboarding");
//         const currentSports: string[] = res.data?.sports ?? [];
//         setSports(currentSports);
//         setInitialSports(currentSports);
//         setLoadState("ready");
//       } catch (err) {
//         console.error(err);
//         setLoadState("error");
//       }
//     };
//     loadPreferences();
//   }, []);

//   const toggleSport = (id: string) => {
//     setSports((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
//   };

//   const hasChanges =
//     sports.length !== initialSports.length || sports.some((s) => !initialSports.includes(s));

//   const handleSave = async () => {
//     if (!sports.length || !hasChanges) return;
//     setSaveState("saving");
//     try {
//       const res = await axios.patch("/api/roar/onboarding", { sports });
//       if (res.data?.success) {
//         setInitialSports(sports);
//         setSaveState("saved");
//         setTimeout(() => router.push("/MainModules/ROAR"), 600);
//       } else {
//         setSaveState("error");
//       }
//     } catch (err) {
//       console.error(err);
//       setSaveState("error");
//     }
//   };

//   if (loadState === "loading") {
//     return (
//       <div className="min-h-[60vh] flex items-center justify-center">
//         <div
//           style={{
//             width: 32,
//             height: 32,
//             border: "3px solid rgba(255,255,255,0.1)",
//             borderTop: "3px solid var(--accent-magenta)",
//             borderRadius: "50%",
//             animation: "roar-spin 1s linear infinite",
//           }}
//         />
//         <style dangerouslySetInnerHTML={{ __html: `@keyframes roar-spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}` }} />
//       </div>
//     );
//   }

//   if (loadState === "error") {
//     return (
//       <div className="min-h-[60vh] flex items-center justify-center px-6 text-center">
//         <p className="text-[14px] text-[var(--text-muted)]">
//           Couldn't load your preferences. Please try again in a moment.
//         </p>
//       </div>
//     );
//   }

//   return (
//     <div className="px-6 pt-8 pb-28 max-w-[480px] mx-auto">
//       <h1 className="font-display text-[32px] leading-[1.05] uppercase">Sports preferences</h1>
//       <p className="text-[13px] text-[var(--text-muted)] mt-2">
//         Choose the sports you want to follow. This updates what shows up in your feed.
//       </p>

//       <div className="flex flex-col gap-4 mt-7">
//         {SPORT_OPTIONS.map((sp) => {
//           const sel = sports.includes(sp.id);
//           return (
//             <motion.button
//               key={sp.id}
//               whileTap={{ scale: 0.98 }}
//               onClick={() => toggleSport(sp.id)}
//               className={`flex gap-4 items-center px-5 py-4 rounded-3xl bg-[var(--bg-secondary)] cursor-pointer text-left border-2 ${
//                 sel ? "gradient-border border-transparent" : "border-[var(--border)]"
//               }`}
//             >
//               <img src={sp.image} alt={sp.label} className="w-[44px] h-[44px] object-contain shrink-0" />
//               <div className="flex-1">
//                 <p className="font-semibold text-[16px] leading-tight">{sp.label}</p>
//                 <p className="text-[12px] text-[var(--text-muted)] mt-0.5">{sp.tagline}</p>
//               </div>
//               <div
//                 className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0"
//                 style={{
//                   borderColor: sel ? "var(--accent-magenta)" : "var(--border)",
//                   background: sel ? "var(--accent-magenta)" : "transparent",
//                 }}
//               >
//                 {sel && <span className="text-white text-[12px] leading-none">✓</span>}
//               </div>
//             </motion.button>
//           );
//         })}
//       </div>

//      <motion.button
//   whileTap={{ scale: 0.97 }}
//   onClick={handleSave}
//   disabled={!sports.length || !hasChanges || saveState === "saving" || saveState === "saved"}
//   className={`w-full mt-8 h-[52px] rounded-full text-base border-none cursor-pointer transition-all duration-200 ${
//     saveState === "saved" ? "" : "btn-gradient"
//   }`}
//   style={{
//     opacity: !sports.length || !hasChanges || saveState === "saving" ? 0.4 : 1,
//     ...(saveState === "saved" 
//       ? { 
//           background: "linear-gradient(135deg, #e91e8c, #ff6b35)", 
//           color: "#fff",
//           boxShadow: "0 4px 20px rgba(233,30,140,0.4)"
//         } 
//       : {}
//     ),
//     // Always ensure pink accent even when not saved
//     background: saveState === "saved" 
//       ? "linear-gradient(135deg, #e91e8c, #ff6b35)" 
//       : "linear-gradient(135deg, #e91e8c, #ff6b35)",
//     color: "#fff",
//     fontWeight: 700,
//     letterSpacing: "0.5px",
//   }}
// >
//   {saveState === "saving" ? "Saving..." : saveState === "saved" ? "✓ Saved" : "Save changes"}
// </motion.button>

//       {saveState === "error" && (
//         <p className="text-[12px] text-center mt-3" style={{ color: "var(--accent-orange)" }}>
//           Couldn't save your changes. Please try again.
//         </p>
//       )}
//     </div>
//   );
// }




// MainModules\RoarPreference\page.tsx

'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import axios from "axios";

type ConfigItem = {
  id: string;
  label: string;
  order: number;
  active: boolean;
  tagline?: string;
  image?: string;
  subtitle?: string;
  icon?: string;
  category?: string;
  sportId?: string;
};

const CONFIG_API = "/api/roar/onboarding-config";

type LoadState = "loading" | "ready" | "error";
type SaveState = "idle" | "saving" | "saved" | "error";
type Tab = "sports" | "followEntities" | "engagement";

const TABS: { key: Tab; heading: string; subheading: string }[] = [
  {
    key: "sports",
    heading: "Which sports do you follow?",
    subheading: "Pick as many as you like — we'll tailor your feed, rooms and predictions around these.",
  },
  {
    key: "followEntities",
    heading: "Who do you follow closely?",
    subheading: "Based on what you picked — Indian teams, IPL/ISL franchises, and athletes across global events.",
  },
  {
    key: "engagement",
    heading: "How do you like to enjoy a match?",
    subheading: "Pick as many as you like. This shapes how your Rooms and feed are set up — you can always change it later.",
  },
];

export default function RoarPreferencesPage() {
  const router = useRouter();
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [tab, setTab] = useState<Tab>("sports");

  const [sportsOptions, setSportsOptions] = useState<ConfigItem[]>([]);
  const [followOptions, setFollowOptions] = useState<ConfigItem[]>([]);
  const [engagementOptions, setEngagementOptions] = useState<ConfigItem[]>([]);

  const [sports, setSports] = useState<string[]>([]);
  const [followEntities, setFollowEntities] = useState<string[]>([]);
  const [engagementPrefs, setEngagementPrefs] = useState<string[]>([]);

  const [initial, setInitial] = useState<{
    sports: string[];
    followEntities: string[];
    engagementPrefs: string[];
  }>({ sports: [], followEntities: [], engagementPrefs: [] });

  useEffect(() => {
    const load = async () => {
      try {
        const [configS, configF, configE, user] = await Promise.all([
          axios.get(`${CONFIG_API}?type=sports`),
          axios.get(`${CONFIG_API}?type=followEntities`),
          axios.get(`${CONFIG_API}?type=engagement`),
          axios.get("/api/roar/onboarding"),
        ]);
        setSportsOptions(configS.data.items ?? []);
        setFollowOptions(configF.data.items ?? []);
        setEngagementOptions(configE.data.items ?? []);

        const currentSports: string[] = user.data?.sports ?? [];
        const currentFollow: string[] = user.data?.followEntities ?? [];
        const currentEngagement: string[] = user.data?.engagementPrefs ?? [];

        setSports(currentSports);
        setFollowEntities(currentFollow);
        setEngagementPrefs(currentEngagement);
        setInitial({
          sports: currentSports,
          followEntities: currentFollow,
          engagementPrefs: currentEngagement,
        });
        setLoadState("ready");
      } catch (err) {
        console.error(err);
        setLoadState("error");
      }
    };
    load();
  }, []);

  const toggleSport = (id: string) =>
    setSports((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const toggleFollow = (id: string) =>
    setFollowEntities((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const toggleEngagement = (id: string) =>
    setEngagementPrefs((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const sameSet = (a: string[], b: string[]) =>
    a.length === b.length && a.every((x) => b.includes(x));

  const hasChanges =
    !sameSet(sports, initial.sports) ||
    !sameSet(followEntities, initial.followEntities) ||
    !sameSet(engagementPrefs, initial.engagementPrefs);

  const canSave = sports.length > 0 && hasChanges;

  const groupedFollow = followOptions
    .filter((f) => !f.sportId || sports.includes(f.sportId))
    .reduce((acc: Record<string, ConfigItem[]>, item) => {
      const key = item.category || "Other";
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});

  const handleSave = async () => {
    if (!canSave) return;
    setSaveState("saving");
    try {
      const res = await axios.patch("/api/roar/onboarding", {
        sports,
        followEntities,
        engagementPrefs,
      });
      if (res.data?.success) {
        setInitial({ sports, followEntities, engagementPrefs });
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
      <div className="min-h-[60vh] flex items-center justify-center bg-black">
        <div className="w-8 h-8 rounded-full border-2 border-gray-700 border-t-orange-500 animate-spin" />
      </div>
    );
  }

  if (loadState === "error") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-6 text-center bg-black">
        <p className="text-[14px] text-gray-400">
          Couldn&apos;t load your preferences. Please try again in a moment.
        </p>
      </div>
    );
  }

  const activeIndex = TABS.findIndex((t) => t.key === tab);
  const active = TABS[activeIndex];
  const isLastStep = activeIndex === TABS.length - 1;
  const canContinue = tab !== "sports" || sports.length > 0;

  const handleContinue = () => {
    if (!canContinue || isLastStep) return;
    setTab(TABS[activeIndex + 1].key);
  };

  const handleBack = () => {
    if (activeIndex === 0) return;
    setTab(TABS[activeIndex - 1].key);
  };

  return (
    <div className="px-6 pt-8 pb-28 max-w-[480px] mx-auto bg-black min-h-screen">
      {/* Step progress bar — same visual language as Onboarding.tsx */}
      <div className="flex gap-2">
        {TABS.map((t, i) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            aria-label={`Go to ${t.heading}`}
            className={`h-1.5 flex-1 rounded-full overflow-hidden bg-gray-800 cursor-pointer border-none p-0 ${i <= activeIndex ? "bg-gradient-to-r from-pink-600 to-orange-500" : "bg-gray-800"
              }`}
          />
        ))}
      </div>
      <p className="text-[11px] tracking-[0.1em] uppercase text-gray-500 font-semibold mt-3">
        Step {activeIndex + 1} of {TABS.length}
      </p>

      {activeIndex > 0 && (
        <button
          type="button"
          onClick={handleBack}
          className="flex items-center gap-1.5 mt-3 text-[13px] font-semibold text-gray-400 bg-transparent border-none cursor-pointer p-0"
        >
          <span aria-hidden="true">←</span> Back
        </button>
      )}

      <h1 className="font-black text-[15px] leading-[1.05] uppercase text-white mt-2">
        {active.heading}
      </h1>
      <p className="text-[13px] text-gray-400 mt-2">{active.subheading}</p>

      {/* Sports tab */}
      {tab === "sports" && (
        <div className="grid grid-cols-2 gap-2 mt-6">
          {sportsOptions.map((sp) => {
            const sel = sports.includes(sp.id);
            return (
              <motion.button
                key={sp.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => toggleSport(sp.id)}
                className={`flex gap-2 items-center px-3 py-2.5 rounded-2xl bg-gray-900/60 cursor-pointer text-left border-2 relative ${sel ? "border-orange-400" : "border-gray-800"
                  }`}
              >
                <span className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-base shrink-0">
                  {sp.image ? (
                    <img src={sp.image} alt={sp.label} className="w-5 h-5 object-contain" />
                  ) : (
                    "🏆"
                  )}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[13px] leading-tight text-white">
                    {sp.label}
                  </p>
                  {sp.tagline && (
                    <p className="text-[10px] text-gray-400 mt-0.5">{sp.tagline}</p>
                  )}
                </div>
                {sel && (
                  <span className="text-orange-400 font-bold text-[12px] shrink-0">✓</span>
                )}
              </motion.button>
            );
          })}
        </div>
      )}

      {/* Follow entities tab */}
      {tab === "followEntities" && (
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
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 bg-gray-900/60 transition-colors ${sel ? "border-orange-400" : "border-gray-800"
                        }`}
                    >
                      {ent.icon && (
                        <span
                          className={`text-[10px] font-bold ${sel ? "text-orange-400" : "text-gray-500"
                            }`}
                        >
                          {ent.icon}
                        </span>
                      )}
                      <span className="text-[12px] font-semibold text-white">{ent.label}</span>
                      {sel && <span className="text-orange-400 font-bold text-[11px]">✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          {Object.keys(groupedFollow).length === 0 && (
            <p className="text-gray-500 text-sm">
              {followOptions.length === 0
                ? "No follow options are configured yet — add some in the admin panel."
                : sports.length === 0
                  ? "Pick a sport first to see who you can follow."
                  : `No follow options match the sports you picked (${followOptions.length} total configured, ${followOptions.filter((f) => f.sportId).length} tagged with a sportId). Check that each entity's sportId matches one of your selected sport IDs: ${sports.join(", ")}.`}
            </p>
          )}
        </div>
      )}

      {/* Engagement tab */}
      {tab === "engagement" && (
        <div className="flex flex-col gap-2 mt-6">
          {engagementOptions.map((opt) => {
            const sel = engagementPrefs.includes(opt.id);
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => toggleEngagement(opt.id)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl border-2 text-left bg-gray-900/60 transition-colors ${sel ? "border-orange-400" : "border-gray-800"
                  }`}
              >
                <span className="w-9 h-9 rounded-xl bg-gray-800 flex items-center justify-center text-base shrink-0">
                  {opt.icon || "⭐"}
                </span>
                <span className="flex-1">
                  <p className="font-bold text-white text-[13px] leading-tight">{opt.label}</p>
                  {opt.subtitle && (
                    <p className="text-[11px] text-gray-400 mt-0.5">{opt.subtitle}</p>
                  )}
                </span>
                {sel && <span className="text-orange-400 font-bold text-[13px] shrink-0">✓</span>}
              </button>
            );
          })}
        </div>
      )}

      {isLastStep ? (
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleSave}
          disabled={!canSave || saveState === "saving" || saveState === "saved"}
          className={`w-full mt-8 h-[52px] rounded-full text-base font-bold text-white border-none cursor-pointer bg-gradient-to-r from-pink-600 to-orange-500 transition-opacity ${canSave && saveState !== "saving" ? "opacity-100" : "opacity-40"
            }`}
        >
          {saveState === "saving" ? "Saving..." : saveState === "saved" ? "✓ Saved" : "Save changes"}
        </motion.button>
      ) : (
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleContinue}
          disabled={!canContinue}
          className={`w-full mt-8 h-[52px] rounded-full text-base font-bold text-white border-none cursor-pointer bg-gradient-to-r from-pink-600 to-orange-500 transition-opacity ${canContinue ? "opacity-100" : "opacity-40"
            }`}
        >
          Continue
        </motion.button>
      )}

      {saveState === "error" && (
        <p className="text-[12px] text-center mt-3 text-orange-400">
          Couldn&apos;t save your changes. Please try again.
        </p>
      )}
    </div>
  );
}