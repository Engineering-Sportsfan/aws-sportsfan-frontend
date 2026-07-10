"use client";

import React, { useEffect, useRef } from "react";
import LogoutButton from "@/src/components/HomeComponents/LogoutButton";
import { Search } from "lucide-react";
import { useGlobalSearch } from "@/context/GlobalSearchContext";
import Link from "next/link";

type Props = { leftOffset?: number };

export default function StickyHeader({ leftOffset = 0 }: Props) {
  const { searchQuery, setSearchQuery } = useGlobalSearch();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [computedLeft, setComputedLeft] = React.useState<number>(0);

  useEffect(() => {
    // ensure input value is in sync when component mounts
    if (inputRef.current && typeof searchQuery === "string") {
      inputRef.current.value = searchQuery;
    }
  }, [searchQuery]);

  // Apply left offset only on large screens to avoid mobile blank space
  useEffect(() => {
    function updateLeft() {
      if (typeof window === "undefined") return;
      const isLarge = window.matchMedia && window.matchMedia("(min-width: 1024px)").matches;
      setComputedLeft(isLarge ? leftOffset : 0);
    }

    updateLeft();
    window.addEventListener("resize", updateLeft);
    return () => window.removeEventListener("resize", updateLeft);
  }, [leftOffset]);

  return (
    <div className="fixed top-0 right-0 z-50 bg-black border-b border-pink-500/20" style={{ left: computedLeft }}>
      <div className="w-full px-4 lg:px-6 py-2">
        {/* Mobile: title + logout on top, search below */}
        <div className="flex items-center justify-between lg:hidden">
          <Link href="/MainModules/HomePage">
            <h1 className="text-lg font-semibold cursor-pointer hover:text-pink-500">SportsFan360</h1>
          </Link>
          <LogoutButton />
        </div>

        {/* Mobile search (full width) */}
        <div className="mt-2 lg:hidden">
          <div className="flex items-center gap-2 bg-[#0d1117] px-3 py-2 rounded-full border border-pink-500/20 w-full">
            <Search size={16} className="text-pink-500 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              defaultValue={searchQuery ?? ""}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search players, teams, jersey numbers..."
              className="bg-transparent outline-none text-sm w-full text-white placeholder:text-gray-500"
            />
          </div>
        </div>

        {/* Desktop: single row with search and logout */}
        <div className="hidden lg:flex items-center justify-between">
          <div className="flex items-center gap-3 w-full max-w-3xl">
            <div className="flex items-center gap-2 bg-[#0d1117] px-3 py-2 rounded-full border border-pink-500/20 w-full">
              <Search size={16} className="text-pink-500 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                defaultValue={searchQuery ?? ""}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search players, teams, jersey numbers..."
                className="bg-transparent outline-none text-sm w-full text-white placeholder:text-gray-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 ml-4">
            <LogoutButton />
          </div>
        </div>
      </div>
    </div>
  );
}
