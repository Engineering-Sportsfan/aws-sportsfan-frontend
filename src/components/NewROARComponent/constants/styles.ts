export const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap');

.roar-root {
  --bg-primary:#050508;
  --bg-secondary:#0E0E14;
  --bg-tertiary:#16161F;
  --bg-glass:rgba(22,22,31,0.72);
  --accent-magenta:#E91E8C;
  --accent-orange:#FF6B35;
  --accent-yellow:#FFCC00;
  --accent-gradient:linear-gradient(135deg,#E91E8C,#FF6B35);
  --text-primary:#F5F5FA;
  --text-secondary:#9494AD;
  --text-muted:#4A4A62;
  --border:#252538;
  --border-glow:rgba(233,30,140,0.35);
  --live-green:#00E676;
  --gold:#FFB800;
  --correct-green:#00C853;
  --wrong-red:#F44336;
  --pending-amber:#FF9800;
  --teal:#00E8C6;

  position: relative;
  width: 100%;
  height: 100%;
  min-height: 600px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-family: 'DM Sans', sans-serif;
  overflow: hidden;
  box-sizing: border-box;
}

@media (min-width: 481px) {
  .roar-root {
    display: flex;
    justify-content: center;
    align-items: stretch;
    background: var(--bg-primary);
  }
  .roar-inner {
    width: 100%;
    height: 100%;
    min-height: 600px;
    position: relative;
    overflow: hidden;
    background: var(--bg-primary);
    display: flex;
    flex-direction: column;
  }
}

@media (max-width: 768px) {
  .roar-root.roar-room-active {
    position: fixed;
    top: 0;
    right: 0;
    height: 100%; 
    bottom: 0px;
    left: 0;
    z-index: 9999;
    width: 100vw;
    // height: calc(100dvh - 60px);
    // min-height: calc(100dvh - 60px);
    height: 100dvh;
    min-height: 100dvh;
  }
  .roar-root.roar-room-active .roar-inner {
    height: calc(100dvh - 60px);
    min-height: calc(100dvh - 60px);
  }
  .roar-inner {
    width: 100%;
    position: relative;
    height: 100%;
    overflow: hidden;
    background: var(--bg-primary);
  }

  .roar-root .mobile-padding-bottom {
    padding-bottom: calc(env(safe-area-inset-bottom, 24px) + 80px) !important;
  }

 .roar-root .screen-scroll {
  padding-top: 4px;
  padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 100px) !important;
}
  .roar-overlay-open .screen-scroll {
  overflow: hidden !important;
}

}

.roar-inner::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  opacity: 0.12;
  background-image: radial-gradient(circle, #ffffff1f 1px, transparent 1px);
  background-size: 18px 18px;
}

.roar-inner::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  opacity: 0.08;
  mix-blend-mode: overlay;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.35'/%3E%3C/svg%3E");
}

.roar-root * {
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
}
  .roar-root {
  touch-action: pan-y;
}
  
.roar-root *::-webkit-scrollbar { width:0; height:0; }
.roar-root textarea,
.roar-root input,
.roar-root select { -webkit-appearance:none; }

.roar-root .font-display { font-family:'Bebas Neue',sans-serif; }
.roar-root .logotype {
  font-family:'Bebas Neue',sans-serif;
  background: var(--accent-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 0.08em;
}
.roar-root .btn-gradient {
  background: var(--accent-gradient);
  color: white;
  font-weight: 700;
  font-family: 'Bebas Neue', sans-serif;
  letter-spacing: 0.06em;
  transition: transform 0.2s, box-shadow 0.2s;
}
.roar-root .btn-gradient:active { transform: scale(0.98); }
.roar-root .btn-gradient:hover { box-shadow: 0 0 28px rgba(233,30,140,0.45); }
.roar-root .glass-card {
  background: var(--bg-glass);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 28px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.04);
}
.roar-root .pill-nav-dock {
  padding: 6px 8px;
  border-radius: 999px;
  background: rgba(14,14,20,0.88);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255,255,255,0.06);
  box-shadow: 0 8px 32px rgba(0,0,0,0.6);
}
.roar-root .live-pulse { animation: roar-livePulse 2s ease-in-out infinite; }
@keyframes roar-livePulse {
  0%,100% { opacity:1; transform:scale(1); }
  50% { opacity:0.5; transform:scale(0.85); }
}
@keyframes roar-driftUp {
  0% { opacity: 0; transform: translateY(0) scale(1); }
  10% { opacity: 0.3; }
  90% { opacity: 0.15; }
  100% { opacity: 0; transform: translateY(-100vh) scale(0.8); }
}
.roar-root .oracle-ring-animate {
  animation: roar-oracleShimmer 3s linear infinite;
  transform-origin: center;
}
@keyframes roar-oracleShimmer {
  0%   { stroke-dashoffset:0;   transform:rotate(0deg); }
  100% { stroke-dashoffset:-80; transform:rotate(360deg); }
}
.roar-root .room-energy-bar {
  height: 3px;
  background: var(--accent-gradient);
  animation: roar-energyPulse 1.5s ease-in-out infinite;
}
.roar-root .room-energy-fast { animation-duration: 0.6s; }
@keyframes roar-energyPulse {
  0%,100% { opacity:0.6; transform:scaleX(0.95); }
  50%     { opacity:1;   transform:scaleX(1); }
}
.roar-root .btn-pulse { animation: roar-btnPulse 2.5s ease-in-out infinite; }
@keyframes roar-btnPulse {
  0%,100% { transform:scale(1); }
  50%     { transform:scale(1.02); }
}
.roar-root .screen-scroll {
  height: 100%;
  min-height: 0;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  scroll-behavior: smooth;
  padding-top: 4px;
  padding-bottom: 32px;
}
 
.roar-root .bottom-nav {
  position: relative;
  z-index: 10;
  flex-shrink: 0;
}

.roar-root .gradient-border {
  position: relative;
  background: var(--bg-secondary);
  border-radius: 28px;
}
.roar-root .gradient-border::before {
  content: '';
  position: absolute;
  inset: 0;
  padding: 2px;
  border-radius: inherit;
  background: var(--accent-gradient);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
}
.roar-root .glow-magenta-sm { box-shadow: 0 0 14px rgba(233,30,140,0.4); }
.roar-root .pill-frame {
  border-radius: 999px;
  padding: 6px;
  background: linear-gradient(180deg,rgba(255,255,255,0.12),rgba(255,255,255,0.02));
  border: 1px solid rgba(255,255,255,0.1);
  box-shadow: 0 12px 40px rgba(0,0,0,0.5);
}
.roar-root .roar-fixed-portal {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 50;
}
.roar-root .roar-fixed-portal > * {
  pointer-events: auto;
}
`;
