"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

interface GreetingsProps {
  userName?: string;
  className?: string;
  showWave?: boolean;
}

export function getGreetingByTime(date: Date = new Date()): string {
  const hour = date.getHours();
  if (hour >= 4 && hour < 12) {
    return "Good morning";
  } else if (hour >= 12 && hour < 17) {
    return "Good afternoon";
  } else {
    return "Good evening";
  }
}

export default function Greetings({
  userName: propUserName,
  className = "",
  showWave = true,
}: GreetingsProps) {
  const { user, getUserDisplayName, loading: authLoading, authReady } = useAuth();
  const [greeting, setGreeting] = useState<string>("Good morning");
  const [resolvedName, setResolvedName] = useState<string>("");

  // Time-based greeting & user profile name resolution
  useEffect(() => {
    setGreeting(getGreetingByTime());

    if (propUserName && propUserName.trim()) {
      setResolvedName(propUserName.trim());
      return;
    }

    // While authentication is loading, do NOT flash any dummy name
    if (authLoading || (authReady === false)) {
      return;
    }

    if (user?.name) {
      setResolvedName(user.name.split(" ")[0]);
    } else if (typeof getUserDisplayName === "function") {
      const displayName = getUserDisplayName();
      if (
        displayName &&
        !displayName.toLowerCase().startsWith("fan_") &&
        !displayName.toLowerCase().startsWith("guest") &&
        displayName.toLowerCase() !== "fan"
      ) {
        setResolvedName(displayName.split(" ")[0]);
      } else {
        setResolvedName("");
      }
    } else {
      setResolvedName("");
    }
  }, [propUserName, user, getUserDisplayName, authLoading, authReady]);

  return (
    <div className={`flex items-start justify-between w-full ${className}`.trim()}>
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <h1 className="text-[20px] sm:text-[23px] font-black tracking-tight text-white leading-tight">
            {greeting}{resolvedName ? `, ${resolvedName}` : ""}
          </h1>
          {showWave && (
            <span className="text-[20px] sm:text-[22px] inline-block hover:scale-125 transition-transform cursor-default">
              👋
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
