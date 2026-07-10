"use client";

import React from "react";

// ─── Icons ────────────────────────────────────────────────────────────────────
const BarChartIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="13" width="4" height="7" rx="1" fill="url(#barGradient)"/>
    <rect x="10" y="7" width="4" height="13" rx="1" fill="url(#barGradient)"/>
    <rect x="16" y="10" width="4" height="10" rx="1" fill="url(#barGradient)"/>
    <defs>
      <linearGradient id="barGradient" x1="5" y1="8" x2="5" y2="20" gradientUnits="userSpaceOnUse">
        <stop stopColor="#ff57a0"/>
        <stop offset="1" stopColor="#7a57ff"/>
      </linearGradient>
    </defs>
  </svg>
);

const LightbulbIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ff57a0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1.3.5 2.6 1.5 3.5.8.8 1.3 1.5 1.5 2.5"/>
    <path d="M9 18h6"/>
    <path d="M10 22h4"/>
  </svg>
);

const RocketIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ff57a0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
    <path d="m12 15-3-3a22 22 0 0 1 3.84-10.39L13 2l1.6 1.6C16.82 4.14 18.9 4 21 4c0 2.1-.14 4.18.4 6.4L23 12l-3.39.16A22 22 0 0 1 12 15z"/>
    <path d="m9 11 4 4"/>
  </svg>
);

// ─── Component ────────────────────────────────────────────────────────────────
export default function UpcomingPollCard() {
  return (
    <div className="relative w-[260px] h-[340px] rounded-xl border border-[#2a2a3e] bg-[#0b0c16] overflow-hidden flex flex-col items-center p-4">
      
      {/* Background Glows & Dots Pattern */}
      <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-[#7a57ff]/20 to-transparent opacity-60 pointer-events-none" />
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none" 
        style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '16px 16px' }} 
      />
      
      {/* Wave SVG Accents (Abstract approximations of the corners) */}
      <div className="absolute top-0 right-0 w-24 h-24 opacity-30 pointer-events-none">
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,0 C50,0 50,50 100,50 L100,0 Z" fill="url(#waveGrad)" />
          <defs>
            <linearGradient id="waveGrad" x1="0" y1="0" x2="100" y2="100">
              <stop stopColor="#ff57a0"/>
              <stop offset="1" stopColor="#7a57ff"/>
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Central Icon */}
      <div className="relative z-10 w-16 h-16 mt-4 rounded-full bg-[#121026] border-2 border-[#5b45b0] shadow-[0_0_25px_rgba(122,87,255,0.4)] flex items-center justify-center mb-5">
        <BarChartIcon />
        {/* Floating Particles */}
        <div className="absolute -top-1 -left-3 text-[#ff57a0] text-sm">+</div>
        <div className="absolute top-2 -right-4 text-[#7a57ff] text-xs">o</div>
        <div className="absolute -bottom-2 -right-2 text-[#ff57a0] text-sm">+</div>
      </div>

      {/* Text Content */}
      <p className="relative z-10 text-white text-[13px] font-semibold text-center mb-1.5">
        Next poll will be out <span className="text-[#ff57a0]">soon!</span>
      </p>
      
      <h2 className="relative z-10 text-[28px] font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#ff57a0] via-[#c665e6] to-[#7a57ff] mb-6 text-center leading-none">
        COMING SOON
      </h2>

      {/* Info Section */}
      <div className="relative z-10 flex items-start gap-2.5 mb-6 px-1">
        <div className="mt-0.5"><LightbulbIcon /></div>
        <p className="text-[11px] text-gray-300 leading-relaxed">
          Something exciting is on the way.<br/>
          More <span className="text-[#ff57a0]">innovations</span>. More <span className="text-[#ff57a0]">engagement</span>. More <span className="text-[#ff57a0]">fun</span>.
        </p>
      </div>

      {/* Bottom Rocket Pill */}
      <div className="relative z-10 w-full border border-[#ff57a0]/40 rounded-full py-2.5 px-3 bg-gradient-to-r from-[#ff57a0]/10 to-[#7a57ff]/10 flex items-center justify-center gap-2 backdrop-blur-sm mt-auto mb-2">
        <RocketIcon />
        <p className="text-[10px] text-gray-300 text-center font-medium">
          Better polls. Better experience.<br/> Only on <span className="text-[#ff57a0] font-bold">SportsFan360</span>.
        </p>
      </div>

    </div>
  );
}
