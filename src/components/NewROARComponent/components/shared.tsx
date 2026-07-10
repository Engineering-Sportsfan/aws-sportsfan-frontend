// import { motion, AnimatePresence } from "framer-motion";
// import { NAV_TABS, RADIAL_OPTS } from "../constants";
// import AvatarWithBadge from "./AvatarWithBadge";
// import { CURRENT_USER } from "../constants";

// /* ─── SPLIT BAR ─────────────────────────────────────────────────────────── */

// export function SplitBar({ left }: { left: number }) {
//   return (
//     <div
//       style={{
//         position: "relative",
//         height: 12,
//         borderRadius: 999,
//         overflow: "hidden",
//         background: "var(--bg-tertiary)",
//       }}
//     >
//       <motion.div
//         initial={{ width: 0 }}
//         animate={{ width: `${left}%` }}
//         transition={{ duration: 0.55, ease: "easeOut" }}
//         style={{ position: "absolute", inset: "0 auto 0 0", background: "var(--accent-magenta)" }}
//       />
//       <motion.div
//         initial={{ width: 0 }}
//         animate={{ width: `${100 - left}%` }}
//         transition={{ duration: 0.55, ease: "easeOut" }}
//         style={{ position: "absolute", inset: "0 0 0 auto", background: "var(--accent-orange)" }}
//       />
//       <div
//         style={{
//           position: "absolute",
//           inset: 0,
//           display: "flex",
//           justifyContent: "space-between",
//           alignItems: "center",
//           padding: "0 8px",
//           fontSize: 10,
//           fontWeight: 700,
//           color: "white",
//           pointerEvents: "none",
//           zIndex: 1,
//         }}
//       >
//         <span>{left}%</span>
//         <span>{100 - left}%</span>
//       </div>
//     </div>
//   );
// }

// /* ─── TOAST ──────────────────────────────────────────────────────────────── */

// export function Toast({ message, visible }: { message: string; visible: boolean }) {
//   return (
//     <AnimatePresence>
//       {visible && message && (
//         <motion.div
//           initial={{ y: -80, opacity: 0 }}
//           animate={{ y: 0, opacity: 1 }}
//           exit={{ y: -80, opacity: 0 }}
//           transition={{ type: "spring", stiffness: 400, damping: 28 }}
//           style={{
//             position: "absolute",
//             top: 16,
//             left: 12,
//             right: 12,
//             zIndex: 200,
//             padding: "12px 20px",
//             borderRadius: 20,
//             textAlign: "center",
//             fontWeight: 700,
//             fontSize: 14,
//             background: "var(--accent-magenta)",
//             color: "white",
//             boxShadow: "0 0 28px rgba(233,30,140,0.5)",
//             pointerEvents: "none",
//           }}
//         >
//           {message}
//         </motion.div>
//       )}
//     </AnimatePresence>
//   );
// }

// /* ─── BOTTOM NAV ─────────────────────────────────────────────────────────── */

// interface BottomNavProps {
//   activeTab: string;
//   onTabChange: (t: string) => void;
//   unreadCount: number;
//   matchLive: boolean;
//   badgeNearUnlock: boolean;
//   userBadge: string;
//   onQuickCompose: (type: string) => void;
// }

// export function BottomNav({
//   activeTab,
//   onTabChange,
//   unreadCount,
//   matchLive,
//   badgeNearUnlock,
//   userBadge,
//   onQuickCompose,
// }: BottomNavProps) {
//   return (
//     <div
//       style={{
//         position: "fixed",
//         bottom: 24,
//         left: "50%",
//         transform: "translateX(-50%)",
//         width: "100%",
//         maxWidth: 420,
//         zIndex: 50,
//         pointerEvents: "none",
//         background: "transparent",
//       }}
//     >
//       <div
//         className="pill-nav-dock"
//         style={{
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "space-around",
//           width: "calc(100% - 24px)",
//           margin: "0 auto",
//           pointerEvents: "auto",
//         }}
//       >
//         {NAV_TABS.map((tab) => {
//           if (tab.id === "compose") return null;
//           const isActive = activeTab === tab.id;
//           return (
//             <motion.button
//               key={tab.id}
//               onClick={() => onTabChange(tab.id)}
//               animate={{ scale: isActive ? [1, 1.15, 1] : 1 }}
//               transition={{ duration: 0.25 }}
//               style={{
//                 position: "relative",
//                 display: "flex",
//                 flexDirection: "column",
//                 alignItems: "center",
//                 gap: 2,
//                 padding: "8px 12px",
//                 borderRadius: 999,
//                 minWidth: 52,
//                 background: isActive ? "white" : "transparent",
//                 border: "none",
//                 cursor: "pointer",
//               }}
//             >
//               <span style={{ fontSize: 18, position: "relative" }}>
//                 {tab.icon}
//                 {tab.id === "discuss" && matchLive && (
//                   <span
//                     className="live-pulse"
//                     style={{
//                       position: "absolute", top: -2, right: -2,
//                       width: 8, height: 8, borderRadius: "50%",
//                       background: "var(--wrong-red)", display: "block",
//                     }}
//                   />
//                 )}
//                 {tab.id === "profile" && badgeNearUnlock && (
//                   <span
//                     style={{
//                       position: "absolute", top: -2, right: -2,
//                       width: 8, height: 8, borderRadius: "50%",
//                       background: "var(--gold)", display: "block",
//                     }}
//                   />
//                 )}
//                 {tab.id === "alerts" && unreadCount > 0 && (
//                   <span
//                     style={{
//                       position: "absolute", top: -6, right: -8,
//                       minWidth: 15, height: 15, borderRadius: 999,
//                       background: "var(--accent-magenta)", fontSize: 9,
//                       display: "flex", alignItems: "center", justifyContent: "center",
//                       color: "white", fontWeight: 700,
//                     }}
//                   >
//                     {unreadCount}
//                   </span>
//                 )}
//               </span>
//               <span
//                 style={{
//                   fontSize: 9,
//                   fontWeight: 700,
//                   color: isActive ? "#0A0A0F" : "var(--text-secondary)",
//                 }}
//               >
//                 {tab.label}
//               </span>
//             </motion.button>
//           );
//         })}
//       </div>
//     </div>
//   );
// }

// /* ─── FILTER PILL STRIP ─────────────────────────────────────────────────── */
// // Reusable horizontal filter tab strip used across multiple screens

// export function FilterPills({
//   options,
//   active,
//   onChange,
// }: {
//   options: string[];
//   active: string;
//   onChange: (v: string) => void;
// }) {
//   return (
//     <div
//       className="flex justify-start items-center gap-2 overflow-x-auto rounded-2xl border border-white/5 bg-[#1a1a1a]/80 p-1.5 shadow-xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
//       style={{ WebkitOverflowScrolling: "touch" }}
//     >
//       {options.map((f) => {
//         const isActive = active === f;
//         return (
//           <motion.button
//             key={f}
//             whileTap={{ scale: 0.95 }}
//             onClick={() => onChange(f)}
//             className="relative flex min-w-max items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-bold tracking-wide transition-all duration-300 text-center whitespace-nowrap shrink-0"
//             style={{
//               border: "none",
//               cursor: "pointer",
//               color: isActive ? "white" : "rgba(255,255,255,0.4)",
//               background: isActive ? "linear-gradient(90deg, #e91e8c, #ff6b35)" : "transparent",
//               boxShadow: isActive ? "0 4px 14px rgba(233,30,140,0.35)" : "none",
//             }}
//           >
//             {f}
//           </motion.button>
//         );
//       })}
//     </div>
//   );
// }



//components/NewROARComponent/components/shared.tsx

import { motion, AnimatePresence } from "framer-motion";
import { NAV_TABS, RADIAL_OPTS } from "../constants";
import AvatarWithBadge from "./AvatarWithBadge";
import { CURRENT_USER } from "../constants";

/* ─── SPLIT BAR ─────────────────────────────────────────────────────────── */

export function SplitBar({ left }: { left: number }) {
  return (
    <div
      style={{
        position: "relative",
        height: 12,
        borderRadius: 999,
        overflow: "hidden",
        background: "var(--bg-tertiary)",
      }}
    >
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${left}%` }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        style={{ position: "absolute", inset: "0 auto 0 0", background: "var(--accent-magenta)" }}
      />
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${100 - left}%` }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        style={{ position: "absolute", inset: "0 0 0 auto", background: "var(--accent-orange)" }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0 8px",
          fontSize: 10,
          fontWeight: 700,
          color: "white",
          pointerEvents: "none",
          zIndex: 1,
        }}
      >
        <span>{left}%</span>
        <span>{100 - left}%</span>
      </div>
    </div>
  );
}

/* ─── TOAST ──────────────────────────────────────────────────────────────── */

export function Toast({ message, visible }: { message: string; visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && message && (
        <motion.div
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 28 }}
          style={{
            position: "absolute",
            top: 16,
            left: 12,
            right: 12,
            zIndex: 200,
            padding: "12px 20px",
            borderRadius: 20,
            textAlign: "center",
            fontWeight: 700,
            fontSize: 14,
            background: "var(--accent-magenta)",
            color: "white",
            boxShadow: "0 0 28px rgba(233,30,140,0.5)",
            pointerEvents: "none",
          }}
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─── BOTTOM NAV ─────────────────────────────────────────────────────────── */

interface BottomNavProps {
  activeTab: string;
  onTabChange: (t: string) => void;
  unreadCount: number;
  matchLive: boolean;
  badgeNearUnlock: boolean;
  userBadge: string;
  onQuickCompose: (type: string) => void;
}

export function BottomNav({
  activeTab,
  onTabChange,
  unreadCount,
  matchLive,
  badgeNearUnlock,
  userBadge,
  onQuickCompose,
}: BottomNavProps) {
  return (
    // roar-bottom-nav class lets PostDetailsOverlay measure how much of
    // .roar-inner this fixed nav overlaps, so it can set its own bottom
    // offset correctly and leave the nav visible beneath the overlay.
    <div
      className="roar-bottom-nav"
      style={{
        position: "fixed",
        bottom: 24,
        left: "50%",
        transform: "translateX(-50%)",
        width: "100%",
        maxWidth: 420,
        zIndex: 50,
        pointerEvents: "none",
        background: "transparent",
      }}
    >
      <div
        className="pill-nav-dock"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-around",
          width: "calc(100% - 24px)",
          margin: "0 auto",
          pointerEvents: "auto",
        }}
      >
        {NAV_TABS.map((tab) => {
          if (tab.id === "compose") return null;
          const isActive = activeTab === tab.id;
          return (
            <motion.button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              animate={{ scale: isActive ? [1, 1.15, 1] : 1 }}
              transition={{ duration: 0.25 }}
              style={{
                position: "relative",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
                padding: "8px 12px",
                borderRadius: 999,
                minWidth: 52,
                background: isActive ? "white" : "transparent",
                border: "none",
                cursor: "pointer",
              }}
            >
              <span style={{ fontSize: 18, position: "relative" }}>
                {tab.icon}
                {tab.id === "discuss" && matchLive && (
                  <span
                    className="live-pulse"
                    style={{
                      position: "absolute", top: -2, right: -2,
                      width: 8, height: 8, borderRadius: "50%",
                      background: "var(--wrong-red)", display: "block",
                    }}
                  />
                )}
                {tab.id === "profile" && badgeNearUnlock && (
                  <span
                    style={{
                      position: "absolute", top: -2, right: -2,
                      width: 8, height: 8, borderRadius: "50%",
                      background: "var(--gold)", display: "block",
                    }}
                  />
                )}
                {tab.id === "alerts" && unreadCount > 0 && (
                  <span
                    style={{
                      position: "absolute", top: -6, right: -8,
                      minWidth: 15, height: 15, borderRadius: 999,
                      background: "var(--accent-magenta)", fontSize: 9,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "white", fontWeight: 700,
                    }}
                  >
                    {unreadCount}
                  </span>
                )}
              </span>
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  color: isActive ? "#0A0A0F" : "var(--text-secondary)",
                }}
              >
                {tab.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

/* ─── FILTER PILL STRIP ─────────────────────────────────────────────────── */

export function FilterPills({
  options,
  active,
  onChange,
}: {
  options: string[];
  active: string;
  onChange: (v: string) => void;
}) {
  return (
    <div
      className="flex justify-start items-center gap-2 overflow-x-auto rounded-2xl border border-white/5 bg-[#1a1a1a]/80 p-1.5 shadow-xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      {options.map((f) => {
        const isActive = active === f;
        return (
          <motion.button
            key={f}
            whileTap={{ scale: 0.95 }}
            onClick={() => onChange(f)}
            className="relative flex min-w-max items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-bold tracking-wide transition-all duration-300 text-center whitespace-nowrap shrink-0"
            style={{
              border: "none",
              cursor: "pointer",
              color: isActive ? "white" : "rgba(255,255,255,0.4)",
              background: isActive ? "linear-gradient(90deg, #e91e8c, #ff6b35)" : "transparent",
              boxShadow: isActive ? "0 4px 14px rgba(233,30,140,0.35)" : "none",
            }}
          >
            {f}
          </motion.button>
        );
      })}
    </div>
  );
}