"use client";

import { useState, useEffect } from "react";
import { Poll } from "@/types/Polls";
import { useAuth } from "@/context/AuthContext";
import PollCard from "./PollCard";
import Link from "next/link";
import UpcomingPollCard from "./UpcomingPollCard";
import { ArrowLeft } from "lucide-react";

async function fetchActivePolls(): Promise<Poll[]> {
  const res = await fetch("/api/polls");
  if (!res.ok) return [];
  const json = await res.json();
  return json.data ?? [];
}

async function castVote(pollId: string, optionId: string, userId?: string): Promise<void> {
  const res = await fetch(`/api/polls/${pollId}/vote`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ optionId, userId }),
  });
  if (!res.ok) {
    const json = await res.json();
    throw new Error(json.error ?? "Vote failed");
  }
}

function PollSkeleton() {
  return (
    <div className="w-[260px] rounded-xl bg-[#1e1e2e] border border-white/10 overflow-hidden animate-pulse">
      <div className="px-4 pt-3 space-y-2">
        <div className="h-2.5 w-16 bg-white/10 rounded" />
        <div className="h-3.5 w-3/4 bg-white/10 rounded" />
      </div>
      <div className="px-3 pb-3 space-y-2">
        <div className="h-10 bg-white/10 rounded-lg" />
        <div className="h-10 bg-white/10 rounded-lg" />
      </div>
      <div className="h-7 bg-white/5" />
    </div>
  );
}

export default function PollsSection() {
  const { user } = useAuth();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    fetchActivePolls()
      .then(setPolls)
      .finally(() => setLoading(false));
  }, []);

  const activePolls = polls.filter((poll) => {
    const hasNotExpired = new Date(poll.endsAt).getTime() > Date.now();
    return poll.active && hasNotExpired;
  });

  if (!loading && polls.length === 0) return null;

  return (
    <section className="w-full">
      <div className="flex items-center justify-between gap-3 mt-2">
        <Link href="/MainModules/HomePage" className="inline-flex items-center gap-2 rounded-full  px-3 py-2 text-sm text-white/80 hover:bg-white/10">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
      </div>
      <div className="flex items-center gap-2 mb-3">
        <h1 className="text-[20px] text-white font-bold px-6">Polls &amp; Predictions</h1>

        {/* Three dots menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="w-8 h-8 rounded-full bg-[#1e1e22] flex items-center justify-center hover:bg-[#2a2a2e] transition"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="3" r="1.5" fill="#aaa" />
              <circle cx="8" cy="8" r="1.5" fill="#aaa" />
              <circle cx="8" cy="13" r="1.5" fill="#aaa" />
            </svg>
          </button>

          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-40 bg-[#1a1a1e] border border-white/10 rounded-lg shadow-xl z-50 overflow-hidden">
                <Link href="/MainModules/Prediction" className="block">
                  <button
                    onClick={() => setShowMenu(false)}
                    className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-[#2a2a2e] transition flex items-center gap-2"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M2 4h10M2 7h10M2 10h10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                      <circle cx="11" cy="7" r="2" stroke="currentColor" strokeWidth="1.2" />
                    </svg>
                    Poll History
                  </button>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 px-6 scrollbar-hide">
        {loading ? (
          <>
            <PollSkeleton />
            <PollSkeleton />
          </>
        ) : (
          <>
            {/* Show UpcomingPollCard only when no active polls exist */}
            {activePolls.length === 0 && (
              <div className="flex-shrink-0">
                <UpcomingPollCard />
              </div>
            )}

            {activePolls.map((poll) => (
              <div key={poll.id} className="flex-shrink-0">
                <PollCard
                  poll={poll}
                  onVote={castVote}
                  userId={user?.userId}
                />
              </div>
            ))}
          </>
        )}
      </div>
    </section>
  );
}