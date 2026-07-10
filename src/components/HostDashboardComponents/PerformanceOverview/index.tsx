"use client";

import { useState } from "react";
import LogoutButton from "../../HomeComponents/LogoutButton";

const trendUp = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

const bellIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const searchIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const usersIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const earningsIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

const barChartIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

const eyeIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

interface StatCardProps {
  icon: React.ReactNode;
  iconBg: string;
  badge?: string;
  badgeColor?: string;
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
}

function StatCard({ icon, iconBg, badge, badgeColor, label, value, sub }: StatCardProps) {
  return (
    <div className="relative flex-1 min-w-[160px] bg-[#1a1a1a] rounded-2xl p-4 sm:p-5 flex flex-col gap-3 border border-white/5 hover:border-white/10 transition-colors duration-200 group overflow-hidden">
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl bg-gradient-to-br from-orange-500/5 to-transparent" />
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center ${iconBg}`}>
          {icon}
        </div>
        {badge && (
          <span className={`flex items-center gap-1 text-xs font-semibold ${badgeColor}`}>
            {trendUp}
            {badge}
          </span>
        )}
      </div>
      <div>
        <p className="text-[#888] text-xs sm:text-sm mb-1 font-medium">{label}</p>
        <div className="text-white text-xl sm:text-2xl lg:text-3xl font-bold leading-tight tracking-tight">
          {value}
        </div>
        {sub && <div className="mt-1">{sub}</div>}
      </div>
    </div>
  );
}

export default function PerformanceOverview() {
  const [period, setPeriod] = useState("This Month");

  return (
    <>
      {/* Top bar */}
      <header className="px-4 sm:px-6 lg:px-10 pt-6 pb-4 flex items-start justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">Dashboard</h1>
          <p className="text-[#888] text-sm mt-0.5">Welcome back, Pullela</p>
        </div>
        <div className="flex items-center gap-3 mt-1">
          <button className="relative p-2 rounded-xl bg-[#1a1a1a] border border-white/5 text-[#aaa] hover:text-white hover:border-white/15 transition-colors">
            {bellIcon}
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-[#0f0f0f]" />
          </button>
          <button className="p-2 rounded-xl bg-[#1a1a1a] border border-white/5 text-[#aaa] hover:text-white hover:border-white/15 transition-colors">
            {searchIcon}
          </button>
           <LogoutButton />
        </div>
      </header>

      {/* Main content */}
      <section className="px-4 sm:px-6 lg:px-10 pb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base sm:text-lg font-semibold text-white">Performance Overview</h2>
          <button
            onClick={() => setPeriod(period === "This Month" ? "This Week" : "This Month")}
            className="text-xs sm:text-sm text-[#aaa] hover:text-white transition-colors px-3 py-1.5 rounded-lg border border-white/5 hover:border-white/15 bg-[#1a1a1a]"
          >
            {period}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          <StatCard
            icon={<span className="text-orange-400">{usersIcon}</span>}
            iconBg="bg-orange-500/20"
            badge="+12%"
            badgeColor="text-emerald-400"
            label="Total Viewers"
            value="8,420"
          />
          <StatCard
            icon={<span className="text-orange-400">{earningsIcon}</span>}
            iconBg="bg-orange-500/20"
            badge="+8%"
            badgeColor="text-emerald-400"
            label="Total Earnings"
            value="₹72,036"
          />
          <StatCard
            icon={<span className="text-orange-400">{barChartIcon}</span>}
            iconBg="bg-orange-500/20"
            label="Performance Score"
            value={
              <span className="flex items-baseline gap-1">
                87
                <span className="text-base sm:text-lg font-normal text-[#666]">/100</span>
              </span>
            }
            sub={
              <div className="w-full h-1.5 bg-[#2a2a2a] rounded-full overflow-hidden mt-2">
                <div
                  className="h-full rounded-full"
                  style={{ width: "87%", background: "linear-gradient(90deg, #f97316 0%, #ec4899 100%)" }}
                />
              </div>
            }
          />
          <StatCard
            icon={<span className="text-orange-400">{eyeIcon}</span>}
            iconBg="bg-orange-500/20"
            label="Cards Issued"
            value="1,204"
            sub={<p className="text-[#666] text-xs mt-0.5">Across 47 rooms</p>}
          />
        </div>
      </section>
    </>
  );
}