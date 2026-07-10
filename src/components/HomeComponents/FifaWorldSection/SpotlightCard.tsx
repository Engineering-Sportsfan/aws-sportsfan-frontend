"use client";

function HeartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function CommentIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function RetweetIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="17 1 21 5 17 9" />
      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <polyline points="7 23 3 19 7 15" />
      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" y1="2" x2="12" y2="15" />
    </svg>
  );
}

export default function SpotlightCard() {
  return (
    <div className="flex flex-col justify-between bg-[#111111] border border-gray-800 rounded-xl p-4 w-full h-full min-h-[340px]">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-white font-bold text-lg">Spotlight at Six</h3>
        <span className="text-[#ff2a5f] text-sm font-medium cursor-pointer">See all</span>
      </div>

      {/* Banner */}
      <div
        className="relative rounded-xl flex-grow overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #e91e63 0%, #c2185b 40%, #9c27b0 100%)",
        }}
      >
        {/* Diamond dot pattern */}
        <div
          className="absolute inset-0 opacity-25 z-0"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.7) 1px, transparent 1px)",
            backgroundSize: "12px 12px",
          }}
        />

        {/* Ronaldo photo — right side */}
        <img
          src="/images/ronaldo-spotlight.jpg"
          alt="Cristiano Ronaldo"
          className="absolute right-0 bottom-0 h-full w-auto object-cover object-top z-10"
        />

        {/* Left-side gradient fade so text stays readable */}
        <div
          className="absolute inset-0 z-20"
          style={{
            background:
              "linear-gradient(to right, rgba(196,20,100,0.85) 0%, rgba(196,20,100,0.6) 50%, transparent 100%)",
          }}
        />

        {/* Text content */}
        <div className="absolute inset-0 z-30 flex flex-col justify-center p-5">
          <span className="inline-block bg-white/20 text-white text-[10px] font-bold px-2.5 py-1 rounded uppercase tracking-wider w-fit mb-3">
            Player in Spotlight
          </span>
          <h2 className="text-white text-3xl font-black uppercase leading-none tracking-tight mb-2">
            Cristiano
            <br />
            Ronaldo
          </h2>
          <p className="text-white/90 text-xs font-medium leading-relaxed">
            The hunger never fades.
            <br />
            The legend continues.
          </p>
        </div>
      </div>

      {/* Action bar */}
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
    </div>
  );
}