"use client";

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


// MainModules/RoarPreference/page.tsx

// "use client"; (moved to line 1)

import { useEffect, useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

type ConfigItem = {
  id: string;
  label: string;
  order: number;
  active: boolean;
  tagline?: string;
  tag?: string;
  image?: string;
  subtitle?: string;
  description?: string;
  icon?: string;
  category?: string;
  title?: string;
  sportId?: string;
};

const CONFIG_API = "/api/roar/onboarding-config";

type LoadState = "loading" | "ready" | "error";
type SaveState = "idle" | "saving" | "saved" | "error";
type Tab = "sports" | "followEntities" | "engagement";

const DEFAULT_TABS: { key: Tab; heading: string; subheading: string }[] = [
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

  // Dynamic question & subtitle metadata loaded from admin config
  const [tabHeadings, setTabHeadings] = useState<Record<Tab, { heading: string; subheading: string }>>({
    sports: {
      heading: DEFAULT_TABS[0].heading,
      subheading: DEFAULT_TABS[0].subheading,
    },
    followEntities: {
      heading: DEFAULT_TABS[1].heading,
      subheading: DEFAULT_TABS[1].subheading,
    },
    engagement: {
      heading: DEFAULT_TABS[2].heading,
      subheading: DEFAULT_TABS[2].subheading,
    },
  });

  const [sportsOptions, setSportsOptions] = useState<ConfigItem[]>([]);
  const [followOptions, setFollowOptions] = useState<ConfigItem[]>([]);
  const [engagementOptions, setEngagementOptions] = useState<ConfigItem[]>([]);

  // "Don't see your favorite sports?" Dropdown config & user selection
  const [requestedSportsOptions, setRequestedSportsOptions] = useState<ConfigItem[]>([]);
  const [requestedSportsMeta, setRequestedSportsMeta] = useState({
    heading: "Don't see your favorite sports?",
    subheading: "Please select and we will work hard to get it to you soonest",
  });
  const [requestedSport, setRequestedSport] = useState<string>("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isDropdownOpen]);

  const toggleDropdown = () => {
    if (!isDropdownOpen && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      // If less than 240px below the element, open upward so it stays within the visible card/page
      setOpenUpward(spaceBelow < 240);
    }
    setIsDropdownOpen((prev) => !prev);
  };

  const [sports, setSports] = useState<string[]>([]);
  const [followEntities, setFollowEntities] = useState<string[]>([]);
  const [engagementPrefs, setEngagementPrefs] = useState<string[]>([]);

  const [initial, setInitial] = useState<{
    sports: string[];
    followEntities: string[];
    engagementPrefs: string[];
    requestedSport: string;
  }>({ sports: [], followEntities: [], engagementPrefs: [], requestedSport: "" });

  useEffect(() => {
    const load = async () => {
      try {
        const [configS, configF, configE, configReq, user] = await Promise.all([
          axios.get(`${CONFIG_API}?type=sports`),
          axios.get(`${CONFIG_API}?type=followEntities`),
          axios.get(`${CONFIG_API}?type=engagement`),
          axios.get(`${CONFIG_API}?type=requestedSports`),
          axios.get("/api/roar/onboarding"),
        ]);

        // Load items
        setSportsOptions(configS.data?.items ?? []);
        setFollowOptions(configF.data?.items ?? []);
        setEngagementOptions(configE.data?.items ?? []);
        setRequestedSportsOptions(configReq.data?.items ?? []);

        // Load dynamic questions and subheadings from backend config
        setTabHeadings({
          sports: {
            heading: configS.data?.question || DEFAULT_TABS[0].heading,
            subheading: configS.data?.subtitle ?? DEFAULT_TABS[0].subheading,
          },
          followEntities: {
            heading: configF.data?.question || DEFAULT_TABS[1].heading,
            subheading: configF.data?.subtitle ?? DEFAULT_TABS[1].subheading,
          },
          engagement: {
            heading: configE.data?.question || DEFAULT_TABS[2].heading,
            subheading: configE.data?.subtitle ?? DEFAULT_TABS[2].subheading,
          },
        });

        if (configReq.data?.question) {
          setRequestedSportsMeta({
            heading: configReq.data.question,
            subheading: configReq.data.subtitle ?? "Please select and we will work hard to get it to you soonest",
          });
        }

        const currentSports: string[] = user.data?.sports ?? [];
        const currentFollow: string[] = user.data?.followEntities ?? [];
        const currentEngagement: string[] = user.data?.engagementPrefs ?? [];
        const currentRequestedSport: string = user.data?.requestedSport || "";

        setSports(currentSports);
        setFollowEntities(currentFollow);
        setEngagementPrefs(currentEngagement);
        setRequestedSport(currentRequestedSport);
        setInitial({
          sports: currentSports,
          followEntities: currentFollow,
          engagementPrefs: currentEngagement,
          requestedSport: currentRequestedSport,
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
    !sameSet(engagementPrefs, initial.engagementPrefs) ||
    requestedSport !== initial.requestedSport;

  // Group follow entities by category or title
  const groupedFollow = useMemo(() => {
    return followOptions
      .filter((f) => !f.sportId || sports.includes(f.sportId))
      .reduce((acc: Record<string, ConfigItem[]>, item) => {
        const key = item.category || item.title || "Other";
        if (!acc[key]) acc[key] = [];
        acc[key].push(item);
        return acc;
      }, {});
  }, [followOptions, sports]);

  const activeIndex = DEFAULT_TABS.findIndex((t) => t.key === tab);
  const isLastStep = activeIndex === DEFAULT_TABS.length - 1;

  // Validation: Continue button is active ONLY when an option is selected for the current step
  const isCurrentStepValid = useMemo(() => {
    if (tab === "sports") {
      return sports.length > 0;
    }
    if (tab === "followEntities") {
      const hasAvailableOptions = Object.keys(groupedFollow).length > 0;
      return hasAvailableOptions ? (followEntities.length > 0 || !!requestedSport) : true;
    }
    if (tab === "engagement") {
      const hasAvailableOptions = engagementOptions.length > 0;
      return hasAvailableOptions ? engagementPrefs.length > 0 : true;
    }
    return false;
  }, [tab, sports, followEntities, engagementPrefs, groupedFollow, engagementOptions, requestedSport]);

  const canContinue = isCurrentStepValid;
  const canSave = sports.length > 0 && isCurrentStepValid;

  const handleContinue = () => {
    if (!canContinue || isLastStep) return;
    setTab(DEFAULT_TABS[activeIndex + 1].key);
  };

  const handleBack = () => {
    if (activeIndex === 0) return;
    setTab(DEFAULT_TABS[activeIndex - 1].key);
  };

  const handleSave = async () => {
    if (!canSave || saveState === "saving") return;

    // If no changes were made, immediately redirect
    if (!hasChanges) {
      router.push("/MainModules/HomePage");
      return;
    }

    setSaveState("saving");
    try {
      trackFanDNACompleted({
        tags: sports,
        sportStyle: "Active",
        notificationsEnabled: true
      });
      if (sports && sports.length > 0) {
        trackInterestFollowed("sports", sports.join(", "), sports.length);
      }
    } catch (e) {}
    try {
      const res = await axios.patch("/api/roar/onboarding", {
        sports,
        followEntities,
        engagementPrefs,
        requestedSport,
      });
      if (res.data?.success) {
        setInitial({ sports, followEntities, engagementPrefs, requestedSport });
        setSaveState("saved");
        setTimeout(() => router.push("/MainModules/HomePage"), 600);
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

  const currentHeading = tabHeadings[tab]?.heading || DEFAULT_TABS[activeIndex].heading;
  const currentSubheading = tabHeadings[tab]?.subheading || DEFAULT_TABS[activeIndex].subheading;

  return (
    <div className="px-6 pt-8 pb-36 max-w-[480px] mx-auto bg-black min-h-screen">
      {/* Step progress bar */}
      <div className="flex gap-2">
        {DEFAULT_TABS.map((t, i) => (
          <button
            key={t.key}
            type="button"
            onClick={() => {
              // Allow jumping to completed/earlier steps or next step if current step is valid
              if (i <= activeIndex || (i === activeIndex + 1 && isCurrentStepValid)) {
                setTab(t.key);
              }
            }}
            aria-label={`Go to ${tabHeadings[t.key]?.heading || t.heading}`}
            className={`h-1.5 flex-1 rounded-full overflow-hidden transition-all duration-300 border-none p-0 ${
              i <= activeIndex
                ? "bg-gradient-to-r from-pink-600 to-orange-500 cursor-pointer"
                : "bg-gray-800 cursor-default"
            }`}
          />
        ))}
      </div>

      <p className="text-[11px] tracking-[0.1em] uppercase text-gray-500 font-semibold mt-3">
        Step {activeIndex + 1} of {DEFAULT_TABS.length}
      </p>

      {activeIndex > 0 && (
        <button
          type="button"
          onClick={handleBack}
          className="flex items-center gap-1.5 mt-3 text-[13px] font-semibold text-gray-400 hover:text-white bg-transparent border-none cursor-pointer p-0 transition-colors"
        >
          <span aria-hidden="true">←</span> Back
        </button>
      )}

      {/* Dynamic Header & Subheader from Admin Config */}
      <h1 className="font-black text-[15px] leading-[1.1] uppercase text-white mt-2">
        {currentHeading}
      </h1>
      <p className="text-[13px] text-gray-400 mt-2">{currentSubheading}</p>

      {/* Sports Tab */}
      {tab === "sports" && (
        <div className="grid grid-cols-2 gap-2 mt-6">
          {sportsOptions.map((sp) => {
            const sel = sports.includes(sp.id);
            const tagText = sp.tagline || sp.tag || sp.subtitle;

            return (
              <motion.button
                key={sp.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => toggleSport(sp.id)}
                className={`flex gap-2.5 items-center px-3 py-2.5 rounded-2xl bg-gray-900/60 cursor-pointer text-left border-2 relative transition-all ${
                  sel ? "border-orange-400 shadow-sm shadow-orange-500/20" : "border-gray-800 hover:border-gray-700"
                }`}
              >
                {(sp.image || sp.icon) && (
                  <span className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center shrink-0 overflow-hidden">
                    {sp.image ? (
                      <img src={sp.image} alt={sp.label} className="w-5 h-5 object-contain" />
                    ) : (
                      <span className="text-sm">{sp.icon}</span>
                    )}
                  </span>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[13px] leading-tight text-white">
                    {sp.label}
                  </p>
                  {tagText && (
                    <p className="text-[10px] text-gray-400 mt-0.5 truncate">{tagText}</p>
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

      {/* Follow Entities Tab */}
      {tab === "followEntities" && (
        <div className="mt-6 space-y-5">
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
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 bg-gray-900/60 transition-all cursor-pointer ${
                        sel
                          ? "border-orange-400 shadow-sm shadow-orange-500/20"
                          : "border-gray-800 hover:border-gray-700"
                      }`}
                    >
                      {ent.image ? (
                        <img
                          src={ent.image}
                          alt={ent.label}
                          className="w-4 h-4 rounded-full object-cover shrink-0"
                        />
                      ) : ent.icon ? (
                        <span
                          className={`text-[10px] font-bold ${
                            sel ? "text-orange-400" : "text-gray-400"
                          }`}
                        >
                          {ent.icon}
                        </span>
                      ) : null}
                      <span className="text-[12px] font-semibold text-white">{ent.label}</span>
                      {ent.tag && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-400 font-medium">
                          {ent.tag}
                        </span>
                      )}
                      {sel && <span className="text-orange-400 font-bold text-[11px]">✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {Object.keys(groupedFollow).length === 0 && (
            <div className="py-6 text-center">
              <p className="text-gray-400 text-sm">
                {followOptions.length === 0
                  ? "No follow options configured yet."
                  : sports.length === 0
                  ? "Pick a sport first to see teams and athletes to follow."
                  : "No specific teams or athletes found for your selected sports. You can continue to the next step."}
              </p>
            </div>
          )}

          {/* SPREADSHEET DROPDOWN: "Don't see your favorite sports?" */}
          <div className="mt-8 p-4 rounded-2xl bg-gray-900/60 border-2 border-gray-800 space-y-2 relative">
            <div className="flex items-center gap-2">
              <span className="text-sm">🎯</span>
              <h3 className="font-bold text-[13px] text-white">
                {requestedSportsMeta.heading}
              </h3>
            </div>
            <p className="text-[11px] text-gray-400">
              {requestedSportsMeta.subheading}
            </p>
            <div className="relative pt-1" ref={dropdownRef}>
              <button
                type="button"
                onClick={toggleDropdown}
                className={`w-full h-11 px-3.5 flex items-center justify-between rounded-xl bg-gray-950 border text-left text-[13px] cursor-pointer transition-colors ${
                  isDropdownOpen
                    ? "border-orange-400 text-white"
                    : "border-gray-700 text-gray-200 hover:border-gray-600"
                }`}
              >
                <span className={requestedSport ? "text-white font-medium truncate pr-2" : "text-gray-400 truncate pr-2"}>
                  {requestedSport || "Select a sport to request…"}
                </span>
                <span className={`text-[10px] text-gray-400 shrink-0 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}>
                  ▼
                </span>
              </button>

              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: openUpward ? 6 : -6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: openUpward ? 6 : -6, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className={`absolute left-0 right-0 max-h-52 overflow-y-auto rounded-xl bg-gray-950 border border-gray-700 shadow-2xl z-50 py-1 divide-y divide-gray-800/60 ${
                      openUpward ? "bottom-full mb-2" : "top-full mt-2"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setRequestedSport("");
                        setIsDropdownOpen(false);
                      }}
                      className="w-full px-3.5 py-2.5 text-left text-[12px] text-gray-400 hover:text-white hover:bg-gray-900 transition-colors flex items-center justify-between cursor-pointer"
                    >
                      <span className="italic">Select a sport to request… (Clear)</span>
                      {!requestedSport && <span className="text-orange-400 font-bold text-xs">✓</span>}
                    </button>
                    {requestedSportsOptions.map((opt) => {
                      const isSelected = requestedSport === opt.label;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            setRequestedSport(opt.label);
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full px-3.5 py-2.5 text-left text-[13px] transition-colors flex items-center justify-between cursor-pointer ${
                            isSelected
                              ? "bg-orange-500/15 text-orange-400 font-semibold"
                              : "text-gray-200 hover:bg-gray-900 hover:text-white"
                          }`}
                        >
                          <span>{opt.label}</span>
                          {isSelected && <span className="text-orange-400 font-bold text-xs">✓</span>}
                        </button>
                      );
                    })}
                    {requestedSportsOptions.length === 0 && (
                      <div className="px-3.5 py-3 text-center text-xs text-gray-500">
                        No sports available to request.
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {requestedSport && (
              <div className="flex items-center justify-between pt-0.5 text-[11px] text-orange-400">
                <span className="flex items-center gap-1 truncate pr-2">
                  <span>✓</span> Selected to request: <span className="font-bold">{requestedSport}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setRequestedSport("")}
                  className="text-gray-400 hover:text-red-400 text-[10px] underline cursor-pointer bg-transparent border-none p-0 shrink-0"
                >
                  Clear
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Engagement Tab */}
      {tab === "engagement" && (
        <div className="flex flex-col gap-2 mt-6">
          {engagementOptions.map((opt) => {
            const sel = engagementPrefs.includes(opt.id);
            const sub = opt.subtitle || opt.description;

            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => toggleEngagement(opt.id)}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-2xl border-2 text-left bg-gray-900/60 transition-all cursor-pointer ${
                  sel
                    ? "border-orange-400 shadow-sm shadow-orange-500/20"
                    : "border-gray-800 hover:border-gray-700"
                }`}
              >
                <span className="w-9 h-9 rounded-xl bg-gray-800 flex items-center justify-center text-base shrink-0 overflow-hidden">
                  {opt.image ? (
                    <img src={opt.image} alt={opt.label} className="w-5 h-5 object-contain" />
                  ) : (
                    opt.icon || "⭐"
                  )}
                </span>
                <span className="flex-1 min-w-0">
                  <p className="font-bold text-white text-[13px] leading-tight">{opt.label}</p>
                  {sub && (
                    <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-2">{sub}</p>
                  )}
                </span>
                {sel && <span className="text-orange-400 font-bold text-[13px] shrink-0">✓</span>}
              </button>
            );
          })}

          {engagementOptions.length === 0 && (
            <div className="py-6 text-center">
              <p className="text-gray-400 text-sm">No engagement options configured yet.</p>
            </div>
          )}
        </div>
      )}

      {/* Continue or Save changes button */}
      {isLastStep ? (
        <motion.button
          whileTap={{ scale: canSave ? 0.97 : 1 }}
          onClick={handleSave}
          disabled={!canSave || saveState === "saving" || saveState === "saved"}
          className={`w-full mt-8 h-[52px] rounded-full text-base font-bold text-white border-none transition-all duration-200 ${
            canSave && saveState !== "saving"
              ? "opacity-100 bg-gradient-to-r from-pink-600 to-orange-500 cursor-pointer shadow-lg shadow-orange-500/20"
              : "opacity-40 bg-gradient-to-r from-pink-600 to-orange-500 cursor-not-allowed"
          }`}
        >
          {saveState === "saving" ? "Saving..." : saveState === "saved" ? "✓ Saved" : "Save changes"}
        </motion.button>
      ) : (
        <motion.button
          whileTap={{ scale: canContinue ? 0.97 : 1 }}
          onClick={handleContinue}
          disabled={!canContinue}
          className={`w-full mt-8 h-[52px] rounded-full text-base font-bold text-white border-none transition-all duration-200 ${
            canContinue
              ? "opacity-100 bg-gradient-to-r from-pink-600 to-orange-500 cursor-pointer shadow-lg shadow-orange-500/20"
              : "opacity-40 bg-gradient-to-r from-pink-600 to-orange-500 cursor-not-allowed"
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
