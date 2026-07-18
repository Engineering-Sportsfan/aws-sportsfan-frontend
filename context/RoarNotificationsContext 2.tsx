// "use client";

// import React, { createContext, useContext, useState } from "react";

// export type RoarNotification = {
//   id: string;
//   type: string;
//   title: string;
//   subtitle: string;
//   time: string;
//   read: boolean;
//   fan: { username: string; badge: string } | null;
//   cta: string | null;
// };

// const INITIAL_NOTIFICATIONS: RoarNotification[] = [
//   { id: "n1", type: "PREDICTION_OK", title: "You called it! 🎯", subtitle: "Your prediction 'Kohli 80+' vs Australia was CORRECT. +50 rep points.", time: "2m", read: false, fan: { username: "StatsKing_99", badge: "ORACLE" }, cta: "See your accuracy" },
//   { id: "n2", type: "CHALLENGE", title: "StatsKing_99 challenged your take.", subtitle: "They said Rohit is more consistent than Kohli in tests. Reply now.", time: "8m", read: false, fan: { username: "StatsKing_99", badge: "ORACLE" }, cta: null },
//   { id: "n5", type: "BADGE", title: "Badge Unlocked: Bold Caller ⚡", subtitle: "You called 3 unexpected outcomes correctly. Rare badge earned.", time: "2h", read: false, fan: null, cta: null },
//   { id: "n6", type: "PREDICTION_FAIL", title: "Wrong call — but a bold one 💪", subtitle: "Your prediction 'Jadeja 4 wickets' was incorrect. It stays on profile.", time: "3h", read: true, fan: null, cta: null },
//   { id: "n7", type: "RIVAL", title: "Your rival won a debate.", subtitle: "Arjun_80s was right about Kohli vs AUS. Your score: 2 wins, 5 losses.", time: "5h", read: true, fan: { username: "Arjun_80s", badge: "OG_FAN" }, cta: "Challenge them" },
//   { id: "n8", type: "FAN_OF_WEEK", title: "Fan of the Week: Arjun_80s 🏆", subtitle: "82% accuracy this week. 47 correct predictions.", time: "1d", read: true, fan: { username: "Arjun_80s", badge: "OG_FAN" }, cta: null },
//   { id: "n9", type: "WEEKLY", title: "Monday Bold Call is live!", subtitle: "This week: Will India win the series vs AUS? 3,200 fans voted.", time: "1d", read: true, fan: null, cta: "Cast your call" },
// ];

// type RoarNotifContextType = {
//   roarNotifications: RoarNotification[];
//   setRoarNotifications: React.Dispatch<React.SetStateAction<RoarNotification[]>>;
//   markRoarRead: (id: string) => void;
//   markAllRoarRead: () => void;
//   roarUnreadCount: number;
// };

// const RoarNotifContext = createContext<RoarNotifContextType>({
//   roarNotifications: INITIAL_NOTIFICATIONS,
//   setRoarNotifications: () => {},
//   markRoarRead: () => {},
//   markAllRoarRead: () => {},
//   roarUnreadCount: 3,
// });

// export function RoarNotificationsProvider({ children }: { children: React.ReactNode }) {
//   const [roarNotifications, setRoarNotifications] = useState<RoarNotification[]>(INITIAL_NOTIFICATIONS);

//   const markRoarRead = (id: string) => {
//     setRoarNotifications((prev: RoarNotification[]) => prev.map((n: RoarNotification) => (n.id === id ? { ...n, read: true } : n)));
//   };

//   const markAllRoarRead = () => {
//     setRoarNotifications((prev: RoarNotification[]) => prev.map((n: RoarNotification) => ({ ...n, read: true })));
//   };

//   const roarUnreadCount = roarNotifications.filter((n: RoarNotification) => !n.read).length;

//   return (
//     <RoarNotifContext.Provider value={{ roarNotifications, setRoarNotifications, markRoarRead, markAllRoarRead, roarUnreadCount }}>
//       {children}
//     </RoarNotifContext.Provider>
//   );
// }

// export function useRoarNotifications() {
//   return useContext(RoarNotifContext);
// }

"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

// ─── Type ─────────────────────────────────────────────────────────────────────
// Mirrors the Notification type in NewROARComponent/types/index.ts
export type RoarNotification = {
  id: string;
  type: string;
  title: string;
  subtitle: string;
  time: string;
  read: boolean;
  fan: { username: string; badge: string } | null;
  cta: string | null;
};

type RoarNotifContextType = {
  roarNotifications: RoarNotification[];
  setRoarNotifications: React.Dispatch<React.SetStateAction<RoarNotification[]>>;
  markRoarRead: (id: string) => void;
  markAllRoarRead: () => void;
  roarUnreadCount: number;
};

// ─── Context ──────────────────────────────────────────────────────────────────
const RoarNotifContext = createContext<RoarNotifContextType | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────
export function RoarNotificationsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [roarNotifications, setRoarNotifications] = useState<RoarNotification[]>([]);

  const markRoarRead = useCallback((id: string) => {
    setRoarNotifications((prev: RoarNotification[]) =>
      prev.map((n: RoarNotification) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllRoarRead = useCallback(() => {
    setRoarNotifications((prev: RoarNotification[]) => 
      prev.map((n: RoarNotification) => ({ ...n, read: true }))
    );
  }, []);

  const roarUnreadCount = roarNotifications.filter((n: RoarNotification) => !n.read).length;

  return (
    <RoarNotifContext.Provider
      value={{
        roarNotifications,
        setRoarNotifications,
        markRoarRead,
        markAllRoarRead,
        roarUnreadCount,
      }}
    >
      {children}
    </RoarNotifContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useRoarNotifications() {
  const context = useContext(RoarNotifContext);
  if (context === undefined) {
    throw new Error('useRoarNotifications must be used within a RoarNotificationsProvider');
  }
  return context;
}