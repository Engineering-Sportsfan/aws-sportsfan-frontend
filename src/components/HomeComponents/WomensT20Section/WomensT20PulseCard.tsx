"use client";

function HeartIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function CommentIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function RetweetIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="17 1 21 5 17 9" />
      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <polyline points="7 23 3 19 7 15" />
      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" y1="2" x2="12" y2="15" />
    </svg>
  );
}

function ActionBar() {
  return (
    <div className="flex items-center justify-between text-gray-500 mt-4 px-1">
      <div className="flex gap-5">
        <button className="flex items-center gap-1.5 hover:text-[#ff2a5f] transition-colors">
          <HeartIcon />
          <span className="text-xs">276</span>
        </button>

        <button className="flex items-center gap-1.5 hover:text-white transition-colors">
          <CommentIcon />
          <span className="text-xs">43</span>
        </button>

        <button className="flex items-center gap-1.5 hover:text-green-500 transition-colors">
          <RetweetIcon />
          <span className="text-xs">31</span>
        </button>
      </div>

      <button className="flex items-center gap-1.5 hover:text-white transition-colors">
        <ShareIcon />
        <span className="text-xs">Share</span>
      </button>
    </div>
  );
}

export default function WomensT20PulseCard() {
  return (
    <div className="flex flex-col bg-[#111111] border border-gray-800 rounded-xl p-4 w-full h-full min-h-[400px]">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-white font-bold text-lg">Womens T20 Pulse</h3>

        <span className="text-[#ff2a5f] text-sm font-medium cursor-pointer">
          See all
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 flex-grow">
        <div className="relative col-span-2 rounded-xl overflow-hidden min-h-[280px] bg-[#111111]">
          <img
            src="/images/Harmanpreet.jpg"
            alt="Harmanpreet Kaur T20"
            className="absolute inset-0 w-full h-full object-cover object-top"
          />

          {/* Dark overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent z-[1]" />

          {/* Badge */}
          <span className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded z-20">
            BREAKING
          </span>

          {/* Content */}
          <div className="absolute bottom-4 left-4 z-20">
            <h4
              className="text-white text-[22px] font-black uppercase leading-tight"
              style={{
                textShadow: "0px 2px 6px rgba(0,0,0,1)",
              }}
            >
              HARMANPREET BREAKS
              <br />
              4000 T20I RUNS
            </h4>

            <p
              className="text-white/85 text-[12px] mt-1"
              style={{
                textShadow: "0px 1px 4px rgba(0,0,0,1)",
              }}
            >
              Third woman globally to hit the milestone
            </p>
          </div>
        </div>
      </div>

      <ActionBar />
    </div>
  );
}
