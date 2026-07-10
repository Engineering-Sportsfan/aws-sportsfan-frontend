"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { CSSProperties } from "react";

// ── CONSTANTS ──────────────────────────────────────────────────────────────
const S = 460, CX = S / 2, CY = S / 2;
const FIELD_R = 214, BAT_LEN = 74, BAT_W = 12, BALL_R = 11, HIT_ZONE = 65;

type Difficulty = "easy" | "medium" | "hard";

const DIFF_SPEED: Record<Difficulty, { min: number; rng: number }> = {
  easy: { min: 3.2, rng: 1.4 },
  medium: { min: 4.5, rng: 2 },
  hard: { min: 6.2, rng: 2.5 },
};
const ZONE_DATA = [
  { run: 6 as number | "W", col: "#166534", lab: "6" },
  { run: 4 as number | "W", col: "#1d4ed8", lab: "4" },
  { run: 3 as number | "W", col: "#6d28d9", lab: "3" },
  { run: 2 as number | "W", col: "#92400e", lab: "2" },
  { run: 1 as number | "W", col: "#0e7490", lab: "1" },
  { run: "W" as number | "W", col: "#991b1b", lab: "W" },
];

function shuffleZones() {
  const idx = [0, 1, 2, 3, 4, 5];
  for (let i = 5; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  return {
    runs: idx.map((i) => ZONE_DATA[i].run),
    cols: idx.map((i) => ZONE_DATA[i].col),
    labs: idx.map((i) => ZONE_DATA[i].lab),
  };
}

function generateTarget(maxBalls: number, maxWkts: number): number {
  const weights: { v: number | "W"; w: number }[] = [
    { v: 0, w: 22 }, { v: 1, w: 20 }, { v: 2, w: 18 },
    { v: 3, w: 14 }, { v: 4, w: 12 }, { v: 6, w: 8 }, { v: "W", w: 6 },
  ];
  let total = 0, wkts = 0;
  for (let b = 0; b < maxBalls; b++) {
    if (wkts >= maxWkts) break;
    const roll = Math.random() * 100;
    let cum = 0;
    for (const { v, w } of weights) {
      cum += w;
      if (roll < cum) { if (v === "W") wkts++; else total += v as number; break; }
    }
  }
  const minT = Math.ceil(maxBalls * 1.5), maxT = Math.ceil(maxBalls * 5);
  return Math.max(minT, Math.min(maxT, total + 1));
}

// ── AUDIO ──────────────────────────────────────────────────────────────────
let AC: AudioContext | null = null;
function getAC(): AudioContext {
  if (!AC) AC = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  return AC;
}
function beep(f: number, type: OscillatorType, dur: number, vol: number, delay = 0): void {
  try {
    const A = getAC(), o = A.createOscillator(), g = A.createGain();
      o.type = type; o.frequency.setValueAtTime(f, A.currentTime);
    g.gain.setValueAtTime(0.001, A.currentTime + delay);
    g.gain.linearRampToValueAtTime(vol, A.currentTime + delay + 0.012);
    g.gain.exponentialRampToValueAtTime(0.001, A.currentTime + delay + dur);
    o.connect(g); g.connect(A.destination);
    o.start(A.currentTime + delay); o.stop(A.currentTime + delay + dur + 0.05);
  } catch (_e) { }
}
function crowdRoar(vol: number, dur: number): void {
  try {
    const A = getAC(), len = Math.ceil(A.sampleRate * dur);
    const buf = A.createBuffer(2, len, A.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      for (let i = 0; i < len; i++) {
        const env = Math.min(i / (A.sampleRate * 0.18), 1) * Math.pow(1 - i / len, 0.3);
        d[i] = (Math.random() * 2 - 1) * env;
      }
    }
    const src = A.createBufferSource(); src.buffer = buf;
    const bq = A.createBiquadFilter(); bq.type = "bandpass"; bq.frequency.value = 700; bq.Q.value = 0.4;
    const bq2 = A.createBiquadFilter(); bq2.type = "lowpass"; bq2.frequency.value = 2200;
    const g = A.createGain(); g.gain.value = vol;
    src.connect(bq); bq.connect(bq2); bq2.connect(g); g.connect(A.destination); src.start();
  } catch (_e) { }
}
const audio = {
  tick: () => beep(660, "sine", 0.1, 0.15),
  go: () => { beep(880, "sine", 0.06, 0.2); beep(1100, "sine", 0.1, 0.18, 0.07); },
  hit: () => {
    try {
      const A = getAC();
      const buf = A.createBuffer(1, A.sampleRate * 0.12, A.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 3);
      const src = A.createBufferSource(); src.buffer = buf;
      const g = A.createGain(); g.gain.value = 0.55;
      src.connect(g); g.connect(A.destination); src.start();
      const o = A.createOscillator(), g2 = A.createGain();
      o.type = "sine"; o.frequency.setValueAtTime(180, A.currentTime);
      o.frequency.exponentialRampToValueAtTime(55, A.currentTime + 0.12);
      g2.gain.setValueAtTime(0.4, A.currentTime);
      g2.gain.exponentialRampToValueAtTime(0.001, A.currentTime + 0.18);
      o.connect(g2); g2.connect(A.destination); o.start(); o.stop(A.currentTime + 0.2);
    } catch (_e) { }
  },
  miss: () => {
    beep(140, "sawtooth", 0.25, 0.1);
    try {
      const A = getAC();
      const buf = A.createBuffer(1, A.sampleRate * 0.6, A.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) {
        const env = Math.sin(Math.PI * i / d.length);
        d[i] = (Math.random() * 2 - 1) * 0.12 * env;
      }
      const src = A.createBufferSource(); src.buffer = buf;
      const bq = A.createBiquadFilter(); bq.type = "lowpass"; bq.frequency.value = 320;
      const g = A.createGain(); g.gain.value = 0.45;
      src.connect(bq); bq.connect(g); g.connect(A.destination); src.start();
    } catch (_e) { }
  },
  wkt: () => {
    [310, 265, 225, 185, 150].forEach((f, i) => beep(f, "triangle", 0.28, 0.11, i * 0.11));
    try {
      const A = getAC();
      const buf = A.createBuffer(1, A.sampleRate * 0.22, A.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 1.5) * 0.9;
      const src = A.createBufferSource(); src.buffer = buf;
      const bq = A.createBiquadFilter(); bq.type = "bandpass"; bq.frequency.value = 900; bq.Q.value = 0.5;
      const g = A.createGain(); g.gain.value = 0.7;
      src.connect(bq); bq.connect(g); g.connect(A.destination); src.start();
      crowdRoar(0.3, 1.2);
    } catch (_e) { }
  },
  four: () => { [440, 554, 659, 880].forEach((f, i) => beep(f, "sine", 0.22, 0.1, i * 0.07)); crowdRoar(0.55, 1.4); },
  six: () => {
    [523, 659, 784, 1047, 1319].forEach((f, i) => beep(f, "square", 0.15, 0.08, i * 0.06));
    [660, 880, 1100].forEach((f, i) => beep(f, "sine", 0.25, 0.07, 0.38 + i * 0.07));
    crowdRoar(0.85, 2.5);
  },
  run: (r: number) => { beep(r >= 3 ? 490 : 330, "sine", 0.14, 0.1); if (r >= 3) crowdRoar(0.25, 0.8); },
  win: () => { [523, 659, 784, 1047, 784, 1047, 1319, 1568].forEach((f, i) => beep(f, "sine", 0.2, 0.12, i * 0.1)); crowdRoar(1.0, 3.5); },
  lose: () => { [400, 350, 300, 250, 200].forEach((f, i) => beep(f, "triangle", 0.3, 0.1, i * 0.15)); crowdRoar(0.2, 1.2); },
};

// ── TYPES ──────────────────────────────────────────────────────────────────
interface BallObj {
  x: number; y: number; vx: number; vy: number; spin: number;
  trail: { x: number; y: number }[]; active: boolean;
}
interface HitBall extends BallObj { zone: number; settled: boolean; }
interface ImpactRing { x: number; y: number; r: number; t: number; }
interface Particle {
  x: number; y: number; vx: number; vy: number;
  life: number; ml: number; sz: number; col: string;
  rot: number; shape: "rect" | "circle";
}
interface GameState {
  mode: string; diff: Difficulty;
  maxBalls: number; maxWkts: number;
  target: number; score: number; best: number;
  balls: number; wickets: number;
  phase: string; ballRecord: (number | "W")[]; matchWon: boolean;
  streak: number; pressurePct: number;
  batAngle: number; batAngVel: number; batFlash: number;
  ball: BallObj; hb: HitBall;
  impactRings: ImpactRing[]; parts: Particle[];
  flash: { t: number; col: string };
  zoneRuns: (number | "W")[]; zoneCols: string[]; zoneLabs: string[];
  crowdWaveTimer: number; crowdWave: number;
  popTimer: number; popData: unknown;
  cdText: string; cdVisible: boolean;
  matchOverData: unknown;
  muted: boolean;
}
interface PopData { text: string; label: string; col: string; big: boolean; }
interface MatchOverData { lbl: string; big: number; sub: string; extra: string; win: boolean | null; }
interface PillColors { border: string; bg: string; color: string; }
interface FmtState { balls: number; wkts: number; }

// ── TOSS SCREEN ─────────────────────────────────────────────────────────────
function TossScreen({ onSelectMode, router }: { onSelectMode: (m: string, d: Difficulty, fmt: FmtState) => void; router: ReturnType<typeof useRouter> }) {
  const [diff, setDiff] = useState<Difficulty>("easy");
  const [fmt, setFmt] = useState<FmtState>({ balls: 5, wkts: 2 });

  const pillStyle = (active: boolean, ac: PillColors): CSSProperties => ({
    flex: 1, padding: "8px 4px", border: `1.5px solid ${active ? ac.border : "#1e293b"}`,
    borderRadius: 8, background: active ? ac.bg : "#0d1324",
    textAlign: "center" as const, cursor: "pointer",
    fontFamily: "'Bebas Neue',sans-serif", fontSize: 15, letterSpacing: 1,
    color: active ? ac.color : "#64748b", transition: "all 0.18s", lineHeight: 1.3,
  });

  return (
    <div style={{ width: "100%", maxWidth: 500, display: "flex", flexDirection: "column", alignItems: "center", padding: "20px 16px", gap: 14 }}>
      <div style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: -10 }}>
        <button onClick={() => router.push('/MainModules/Fantasy?tab=fantasy')} style={{ background: "#0d1324", border: "1px solid #1e293b", color: "#94a3b8", borderRadius: 9, padding: "6px 10px", fontSize: 11, letterSpacing: 2, cursor: "pointer", transition: "transform 0.1s, opacity 0.1s" }} onMouseDown={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.97)"; (e.currentTarget as HTMLButtonElement).style.opacity = "0.8"; }} onMouseUp={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = ""; (e.currentTarget as HTMLButtonElement).style.opacity = ""; }}>← BACK</button>
        <div />
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, paddingTop: 4 }}>
        <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 36, letterSpacing: 4, color: "#22c55e", textAlign: "center", lineHeight: 1 }}>
          Circle Cricket
          <small style={{ display: "block", fontSize: 11, fontFamily: "'Rajdhani',sans-serif", letterSpacing: 4, color: "#475569", fontWeight: 500 }}>PRO EDITION</small>
        </div>
      </div>
      <div style={{ fontSize: 13, color: "#475569", letterSpacing: 2, fontWeight: 700, textTransform: "uppercase" }}>Choose Your Mode</div>

      <div style={{ display: "flex", gap: 12, width: "100%" }}>
        {[
          { m: "bat", icon: "🏏", title: "BAT", desc: "Score as many runs as possible in 12 balls. Set the target.", badge: "1ST INNINGS", borderCol: "#d97706", hoverBg: "#1c1108", titleCol: "#f59e0b", badgeBg: "#78350f", badgeCol: "#fcd34d" },
          { m: "chase", icon: "🎯", title: "CHASE", desc: "Chase a realistic target. Beat the score to WIN the match!", badge: "2ND INNINGS", borderCol: "#3b82f6", hoverBg: "#080e1c", titleCol: "#60a5fa", badgeBg: "#1e3a8a", badgeCol: "#93c5fd" },
        ].map(({ m, icon, title, desc, badge, borderCol, titleCol, badgeBg, badgeCol }) => (
          <div key={m} onClick={() => onSelectMode(m, diff, fmt)}
            style={{ flex: 1, background: "#0d1324", border: `2px solid ${borderCol}`, borderRadius: 16, padding: "20px 12px", textAlign: "center", cursor: "pointer", position: "relative", overflow: "hidden", transition: "all 0.2s" }}
            onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)"}
            onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"}>
            <div style={{ position: "absolute", top: 10, right: 10, fontSize: 8, letterSpacing: 1, fontWeight: 700, padding: "3px 7px", borderRadius: 4, background: badgeBg, color: badgeCol }}>{badge}</div>
            <div style={{ fontSize: 44, marginBottom: 10 }}>{icon}</div>
            <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 26, letterSpacing: 2, color: titleCol, lineHeight: 1, marginBottom: 6 }}>{title}</div>
            <div style={{ fontSize: 11, color: "#94a3b8", lineHeight: 1.6, fontWeight: 500 }}>{desc}</div>
          </div>
        ))}
      </div>

      {/* Difficulty */}
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ fontSize: 9, color: "#64748b", letterSpacing: 3, fontWeight: 700, textTransform: "uppercase" }}>Difficulty</div>
        <div style={{ display: "flex", gap: 6 }}>
          {[
            { id: "easy" as Difficulty, label: "EASY", sub: "Slow ball", ac: { border: "#22c55e", bg: "#052e16", color: "#86efac" } },
            { id: "medium" as Difficulty, label: "MEDIUM", sub: "Real pace", ac: { border: "#f59e0b", bg: "#1c1108", color: "#fcd34d" } },
            { id: "hard" as Difficulty, label: "HARD", sub: "Fast & furious", ac: { border: "#ef4444", bg: "#1f0808", color: "#fca5a5" } },
          ].map(({ id, label, sub, ac }) => (
            <button key={id} onClick={() => setDiff(id)} style={pillStyle(diff === id, ac)}>
              {label}<br /><span style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 8, fontWeight: 600, letterSpacing: 1, opacity: 0.7, display: "block", marginTop: 2 }}>{sub}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Format */}
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ fontSize: 9, color: "#64748b", letterSpacing: 3, fontWeight: 700, textTransform: "uppercase" }}>Format</div>
        <div style={{ display: "flex", gap: 6 }}>
          {[
            { b: 5, w: 2, label: "T5", sub: "5 balls · 2 wkts" },
            { b: 10, w: 2, label: "T10", sub: "10 balls · 2 wkts" },
            { b: 20, w: 3, label: "T20", sub: "20 balls · 3 wkts" },
          ].map(({ b, w, label, sub }) => (
            <button key={b} onClick={() => setFmt({ balls: b, wkts: w })}
              style={pillStyle(fmt.balls === b, { border: "#8b5cf6", bg: "#1e1040", color: "#c4b5fd" })}>
              {label}<br /><span style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 8, fontWeight: 600, letterSpacing: 1, opacity: 0.7, display: "block", marginTop: 2 }}>{sub}</span>
            </button>
          ))}
        </div>
      </div>

      <div style={{ fontSize: 11, color: "#64748b", letterSpacing: 1, textAlign: "center", lineHeight: 1.7 }}>Choose mode, then pick difficulty &amp; format</div>
      <div style={{ fontSize: 9, color: "#475569", letterSpacing: 2 }}>Circle Cricket PRO</div>
    </div>
  );
}

// ── MAIN GAME ──────────────────────────────────────────────────────────────
export default function CircleCricketPro() {
  const router = useRouter();
  const [screen, setScreen] = useState<string>("toss");
  const [mode, setMode] = useState<string>("bat");
  const [diff, setDiff] = useState<Difficulty>("easy");
  const [maxBalls, setMaxBalls] = useState<number>(5);
  const [maxWkts, setMaxWkts] = useState<number>(2);
  const [muted, setMuted] = useState<boolean>(false);
  const [showHow, setShowHow] = useState<boolean>(false);

  const [uiScore, setUiScore] = useState<number>(0);
  const [uiBalls, setUiBalls] = useState<number>(0);
  const [uiWkts, setUiWkts] = useState<number>(0);
  const [uiBest, setUiBest] = useState<number>(0);
  const [uiTarget, setUiTarget] = useState<number>(0);
  const [uiMsg, setUiMsg] = useState<string>("Loading...");
  const [uiBallRecord, setUiBallRecord] = useState<(number | "W")[]>([]);
  const [uiPhase, setUiPhase] = useState<string>("toss");
  const [uiCountdown, setUiCountdown] = useState<string>("");
  const [uiPop, setUiPop] = useState<PopData | null>(null);
  const [uiMatchOver, setUiMatchOver] = useState<MatchOverData | null>(null);
  const [uiStreak, setUiStreak] = useState<number>(0);
  const [uiPressure, setUiPressure] = useState<number>(0.5);
  const [uiChaseFill, setUiChaseFill] = useState<number>(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<GameState | null>(null);

  const syncUI = useCallback(() => {
    const g = gameRef.current;
    if (!g) return;
    setUiScore(g.score);
    setUiBalls(g.balls);
    setUiWkts(g.wickets);
    setUiBest(g.best);
    setUiTarget(g.target);
    setUiBallRecord([...g.ballRecord]);
    setUiPhase(g.phase);
    setUiStreak(g.streak);
    setUiPressure(g.pressurePct);
    if (g.mode === "chase" && g.target > 0) {
      setUiChaseFill(Math.min(100, (g.score / g.target) * 100));
    }
  }, []);

  const initGame = useCallback((newMode: string, newDiff: Difficulty, fmt: FmtState) => {
    const target = newMode === "chase" ? generateTarget(fmt.balls, fmt.wkts) : 0;
    const zones = shuffleZones();
    gameRef.current = {
      mode: newMode, diff: newDiff,
      maxBalls: fmt.balls, maxWkts: fmt.wkts,
      target, score: 0, best: 0, balls: 0, wickets: 0,
      phase: "countdown", ballRecord: [], matchWon: false,
      streak: 0, pressurePct: 0.5,
      batAngle: -Math.PI / 2, batAngVel: 0, batFlash: 0,
      ball: { x: CX, y: -20, vx: 0, vy: 0, spin: 0, trail: [], active: false },
      hb: { x: 0, y: 0, vx: 0, vy: 0, spin: 0, trail: [], active: false, zone: -1, settled: false },
      impactRings: [], parts: [],
      flash: { t: 0, col: "rgba(255,255,255,0.2)" },
      zoneRuns: zones.runs, zoneCols: zones.cols, zoneLabs: zones.labs,
      crowdWaveTimer: 0, crowdWave: 0,
      popTimer: 0, popData: null,
      cdText: "", cdVisible: false,
      matchOverData: null,
      muted: false,
    };
    setMode(newMode); setDiff(newDiff);
    setMaxBalls(fmt.balls); setMaxWkts(fmt.wkts);
    setUiTarget(target); setUiMatchOver(null); setUiPop(null);
  }, []);

  const handleSelectMode = useCallback((m: string, d: Difficulty, fmt: FmtState) => {
    initGame(m, d, fmt);
    setScreen("game");
  }, [initGame]);

  const runCountdown = useCallback(() => {
    const g = gameRef.current;
    if (!g) return;
    g.phase = "countdown";
    g.parts = []; g.flash.t = 0; g.impactRings = [];
    g.ball.active = false; g.hb.active = false; g.batFlash = 0;
    setUiMatchOver(null); setUiPhase("countdown");

    let c = 3;
    setUiCountdown(String(c));
    if (!g.muted) audio.tick();

    const iv = setInterval(() => {
      c--;
      if (c > 0) { setUiCountdown(String(c)); if (!g.muted) audio.tick(); }
      else if (c === 0) { setUiCountdown("GO!"); if (!g.muted) audio.go(); }
      else {
        clearInterval(iv);
        setUiCountdown("");
        setTimeout(() => bowlBall(), 250);
      }
    }, 800);
  }, []); // eslint-disable-line

  const bowlBall = useCallback(() => {
    const g = gameRef.current;
    if (!g) return;
    const zones = shuffleZones();
    g.zoneRuns = zones.runs; g.zoneCols = zones.cols; g.zoneLabs = zones.labs;
    g.phase = "live"; g.batFlash = 0;
    g.ball.trail = []; g.hb.active = false;
    g.ball.x = CX + (Math.random() * 44 - 22);
    g.ball.y = -BALL_R;
    const dx = CX - g.ball.x, dy = CY - g.ball.y, d = Math.sqrt(dx * dx + dy * dy);
    const sp = DIFF_SPEED[g.diff];
    const spd = sp.min + Math.random() * sp.rng;
    g.ball.vx = dx / d * spd + (Math.random() - 0.5) * 0.55;
    g.ball.vy = dy / d * spd;
    g.ball.spin = 0; g.ball.active = true;
    setUiPhase("live");
    if (g.mode === "chase") {
      const need = g.target - g.score, left = g.maxBalls - g.balls;
      setUiMsg(`Need ${need} from ${left} balls — swing your bat!`);
    } else {
      setUiMsg("Move your bat to intercept the ball!");
    }
    syncUI();
  }, [syncUI]);

  const showPop = useCallback((text: string, label: string, col: string, big: boolean) => {
    setUiPop({ text, label, col, big });
    setTimeout(() => setUiPop(null), 1550);
  }, []);

  const burst = useCallback((g: GameState, x: number, y: number, n: number, cols: string[], big: boolean) => {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = big ? (4 + Math.random() * 13) : (1.5 + Math.random() * 7);
      g.parts.push({
        x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - (big ? 3 : 1.8),
        life: 60 + ~~(Math.random() * 55), ml: 115,
        sz: big ? (3 + Math.random() * 7) : (1.5 + Math.random() * 4),
        col: cols[~~(Math.random() * cols.length)],
        rot: Math.random() * Math.PI * 2,
        shape: Math.random() < 0.55 ? "rect" : "circle",
      });
    }
  }, []);

  const endGame = useCallback((won: boolean | null) => {
    const g = gameRef.current;
    if (!g) return;
    g.phase = "over"; g.matchWon = !!won;
    let lbl: string, big: number, sub: string, extra: string, win: boolean | null;

    if (g.mode === "chase") {
      if (won) {
        lbl = "🏆 CONGRATULATIONS!"; big = g.score; sub = "YOU CHASED THE TARGET!";
        extra = `WON BY ${g.maxBalls - g.balls} BALLS REMAINING`; win = true;
        burst(g, CX, CY, 140, ["#22c55e", "#fbbf24", "#60a5fa", "#f472b6", "#a78bfa", "#fff", "#fb923c"], true);
        burst(g, CX - 100, CY - 80, 70, ["#fbbf24", "#fde68a", "#fff"], true);
        burst(g, CX + 100, CY - 80, 70, ["#22c55e", "#86efac", "#fff"], true);
        if (!g.muted) audio.win();
        g.crowdWaveTimer = 180;
        setUiMsg(`🏆 CONGRATULATIONS! You chased down ${g.target} — MATCH WON!`);
      } else {
        const short = g.target - g.score;
        lbl = "MATCH LOST"; big = g.score; sub = `TARGET WAS ${g.target} RUNS`;
        extra = `LOST BY ${short} RUN${short > 1 ? "S" : ""}`; win = false;
        burst(g, CX, CY, 40, ["#ef4444", "#b91c1c", "#fca5a5"], false);
        if (!g.muted) audio.lose();
        setUiMsg(`You needed ${g.target} — fell ${short} run${short > 1 ? "s" : ""} short. Try again!`);
      }
    } else {
      lbl = "MATCH OVER"; big = g.score; sub = `RUNS IN ${g.maxBalls} BALLS`;
      extra = `BEST: ${g.best}`; win = null;
      burst(g, CX, CY, 100, ["#22c55e", "#fbbf24", "#60a5fa", "#f472b6", "#a78bfa", "#fff"], true);
      burst(g, CX - 90, CY - 70, 50, ["#fbbf24", "#fff"], true);
      burst(g, CX + 90, CY - 70, 50, ["#60a5fa", "#fff"], true);
      setUiMsg(`You scored ${g.score} runs. Best: ${g.best}. Tap RESTART!`);
    }

    setUiMatchOver({ lbl, big, sub, extra, win });
    setUiPhase("over");
    syncUI();
  }, [burst, syncUI]);

  const resolveLanding = useCallback((zone: number) => {
    const g = gameRef.current;
    if (!g) return;
    const runs = g.zoneRuns[zone];
    g.balls++;

    if (runs === "W") {
      g.streak = 0;
      g.wickets++; g.ballRecord.push("W");
      burst(g, g.hb.x, g.hb.y, 45, ["#ef4444", "#b91c1c", "#fca5a5", "#fff"], false);
      g.flash.col = "rgba(220,38,38,0.42)"; g.flash.t = 32;
      if (!g.muted) audio.wkt();
      g.crowdWaveTimer = 180;
      showPop("OUT!", "WICKET", "#ef4444", true);
      setUiMsg(`WICKET! OUT! ${g.wickets < g.maxWkts ? "Keep going!" : "All out!"}`);
    } else {
      const runsNum = runs as number;
      g.streak++;
      g.score += runsNum; g.ballRecord.push(runsNum);
      if (g.mode === "chase" && g.score >= g.target) {
        g.hb.active = false; g.phase = "pause";
        syncUI();
        setTimeout(() => endGame(true), 500);
        return;
      }
      if (runsNum === 6) {
        burst(g, g.hb.x, g.hb.y, 90, ["#fbbf24", "#fde68a", "#fff", "#f59e0b"], true);
        burst(g, CX, CY - 90, 40, ["#fbbf24", "#fff"], true);
        g.flash.col = "rgba(251,191,36,0.48)"; g.flash.t = 38;
        if (!g.muted) audio.six();
        g.crowdWaveTimer = 180;
        const hotMsg = g.streak >= 4 ? " 🔥 ON FIRE!" : g.streak >= 3 ? " 🔥 HOT STREAK!" : "";
        showPop("SIX!", "MAXIMUM  +6", "#fbbf24", true);
        setUiMsg("SIX! MAXIMUM! What a shot!" + hotMsg);
      } else if (runsNum === 4) {
        burst(g, g.hb.x, g.hb.y, 55, ["#60a5fa", "#bfdbfe", "#fff", "#3b82f6"], false);
        g.flash.col = "rgba(59,130,246,0.36)"; g.flash.t = 24;
        if (!g.muted) audio.four();
        g.crowdWaveTimer = 180;
        showPop("FOUR!", "BOUNDARY  +4", "#60a5fa", true);
        setUiMsg("FOUR! Great boundary!");
      } else {
        burst(g, g.hb.x, g.hb.y, 18, ["#86efac", "#4ade80", "#fff"], false);
        if (!g.muted) audio.run(runsNum);
        showPop("+" + runsNum, "RUN" + (runsNum > 1 ? "S" : ""), "#22c55e", false);
        setUiMsg(`${runsNum} run${runsNum > 1 ? "s" : ""} — good shot!`);
      }
      if (g.mode === "bat" && g.score > g.best) {
        g.best = g.score;
        burst(g, CX, CY, 60, ["#22c55e", "#86efac", "#bbf7d0", "#fff", "#fbbf24"], true);
        setTimeout(() => setUiMsg("NEW BEST: " + g.best + "!"), 700);
      }
    }

    g.hb.active = false; g.phase = "pause";

    if (g.mode === "chase" && g.balls > 0) {
      const need = Math.max(0, g.target - g.score);
      const left = Math.max(1, g.maxBalls - g.balls);
      g.pressurePct = Math.min(1, (need / left) / 4);
    }

    syncUI();
    if (g.balls >= g.maxBalls || g.wickets >= g.maxWkts) {
      setTimeout(() => endGame(false), 1200); return;
    }
    setTimeout(() => bowlBall(), 1700);
  }, [burst, showPop, syncUI, endGame, bowlBall]);

  const autoMiss = useCallback(() => {
    const g = gameRef.current;
    if (!g || g.phase !== "live") return;
    g.phase = "pause"; g.ball.active = false;
    g.streak = 0;
    g.balls++; g.ballRecord.push(0);
    if (!g.muted) audio.miss();
    g.flash.col = "rgba(239,68,68,0.15)"; g.flash.t = 10;
    showPop("MISS", "• 0 RUNS", "#ef4444", false);
    setUiMsg("Missed! 0 runs — dot ball.");
    syncUI();
    if (g.balls >= g.maxBalls || g.wickets >= g.maxWkts) { setTimeout(() => endGame(false), 800); return; }
    setTimeout(() => bowlBall(), 1300);
  }, [showPop, syncUI, endGame, bowlBall]);

  // ── CANVAS DRAW LOOP ──────────────────────────────────────────────────────
  useEffect(() => {
    if (screen !== "game") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    let rafId: number;

    function drawBall(x: number, y: number, spin: number, r: number, tint?: string) {
      ctx.save(); ctx.translate(x, y); ctx.rotate(spin);
      ctx.beginPath(); ctx.arc(2, 3, r, 0, Math.PI * 2); ctx.fillStyle = "rgba(0,0,0,0.38)"; ctx.fill();
      ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fillStyle = tint || "#f0ede6"; ctx.fill();
      ctx.strokeStyle = "#991b1b"; ctx.lineWidth = 1.8;
      ctx.beginPath(); ctx.moveTo(-r + 2, 0); ctx.bezierCurveTo(-r * 0.3, -r * 0.75, r * 0.3, -r * 0.75, r - 2, 0); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-r + 2, 0); ctx.bezierCurveTo(-r * 0.3, r * 0.75, r * 0.3, r * 0.75, r - 2, 0); ctx.stroke();
      ctx.beginPath(); ctx.arc(-r * 0.28, -r * 0.28, r * 0.2, 0, Math.PI * 2); ctx.fillStyle = "rgba(255,255,255,0.28)"; ctx.fill();
      ctx.restore();
    }

    function drawTrail(trail: { x: number; y: number }[], r: number, rgb: string) {
      trail.forEach((t, i) => {
        const a = (i / trail.length) * 0.42;
        ctx.beginPath(); ctx.arc(t.x, t.y, r * (0.2 + 0.8 * i / trail.length), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb},${a.toFixed(2)})`; ctx.fill();
      });
    }

    function drawBat(g: GameState) {
      const speed = Math.abs(g.batAngVel);
      ctx.save(); ctx.translate(CX, CY); ctx.rotate(g.batAngle);
      if (speed > 0.05) { ctx.shadowColor = `rgba(34,197,94,${Math.min(speed * 6, 1) * 0.5})`; ctx.shadowBlur = 10 * Math.min(speed * 6, 1); }
      ctx.strokeStyle = "#3b1a08"; ctx.lineWidth = 7; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(-BAT_LEN / 2 - 20, 0); ctx.lineTo(-BAT_LEN / 2, 0); ctx.stroke();
      ctx.strokeStyle = "#78350f"; ctx.lineWidth = 5; ctx.setLineDash([5, 4]);
      ctx.beginPath(); ctx.moveTo(-BAT_LEN / 2 - 18, 0); ctx.lineTo(-BAT_LEN / 2, 0); ctx.stroke(); ctx.setLineDash([]);
      const halfL = BAT_LEN / 2, halfW = BAT_W / 2, rad = halfW;
      const bg = ctx.createLinearGradient(0, -halfW, 0, halfW);
      bg.addColorStop(0, "#fef3c7"); bg.addColorStop(0.35, "#fbbf24"); bg.addColorStop(1, "#b45309");
      ctx.fillStyle = bg;
      ctx.beginPath(); ctx.moveTo(-halfL + rad, -halfW); ctx.lineTo(halfL - rad, -halfW);
      ctx.arcTo(halfL, -halfW, halfL, 0, rad); ctx.arcTo(halfL, halfW, halfL - rad, halfW, rad);
      ctx.lineTo(-halfL + rad, halfW); ctx.arcTo(-halfL, halfW, -halfL, 0, rad);
      ctx.arcTo(-halfL, -halfW, -halfL + rad, -halfW, rad); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = "rgba(120,53,15,0.5)"; ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.moveTo(-halfL + rad, -halfW); ctx.lineTo(halfL - rad, -halfW); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-halfL + rad, halfW); ctx.lineTo(halfL - rad, halfW); ctx.stroke();
      ctx.strokeStyle = "rgba(120,53,15,0.15)"; ctx.lineWidth = 0.7;
      for (let gg = -halfW + 2; gg < halfW; gg += 2.5) { ctx.beginPath(); ctx.moveTo(-halfL + 4, gg); ctx.lineTo(halfL - 3, gg); ctx.stroke(); }
      if (g.batFlash > 0) {
        ctx.fillStyle = `rgba(255,255,255,${(g.batFlash * 0.5).toFixed(2)})`;
        ctx.beginPath(); ctx.moveTo(-halfL + rad, -halfW); ctx.lineTo(halfL - rad, -halfW);
        ctx.arcTo(halfL, -halfW, halfL, 0, rad); ctx.arcTo(halfL, halfW, halfL - rad, halfW, rad);
        ctx.lineTo(-halfL + rad, halfW); ctx.arcTo(-halfL, halfW, -halfL, 0, rad);
        ctx.arcTo(-halfL, -halfW, -halfL + rad, -halfW, rad); ctx.closePath(); ctx.fill();
      }
      ctx.shadowBlur = 0; ctx.restore();
    }

    function drawStadium(g: GameState) {
      const sky = ctx.createRadialGradient(CX, CY, FIELD_R + 20, CX, CY, S * 0.85);
      sky.addColorStop(0, "#0c1a0c"); sky.addColorStop(0.5, "#050d1a"); sky.addColorStop(1, "#020608");
      ctx.fillStyle = sky; ctx.fillRect(0, 0, S, S);
      const towers = [{ x: 30, y: 30 }, { x: S - 30, y: 30 }, { x: 30, y: S - 30 }, { x: S - 30, y: S - 30 }];
      towers.forEach(t => {
        ctx.strokeStyle = "#334155"; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(t.x, t.y + 40); ctx.lineTo(t.x, t.y); ctx.stroke();
        ctx.fillStyle = "#1e293b"; ctx.fillRect(t.x - 10, t.y - 6, 20, 10);
        const flicker = 0.7 + 0.3 * Math.sin(Date.now() / 180 + t.x);
        const beamGrad = ctx.createRadialGradient(t.x, t.y, 0, t.x, t.y, S * 0.7);
        beamGrad.addColorStop(0, `rgba(255,248,200,${(0.18 * flicker).toFixed(3)})`);
        beamGrad.addColorStop(0.4, `rgba(200,230,255,${(0.06 * flicker).toFixed(3)})`);
        beamGrad.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = beamGrad; ctx.beginPath(); ctx.arc(t.x, t.y, S * 0.7, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(t.x, t.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,252,210,${flicker.toFixed(2)})`; ctx.fill();
        ctx.beginPath(); ctx.arc(t.x, t.y, 7, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,248,180,${(0.3 * flicker).toFixed(2)})`; ctx.fill();
      });
      ctx.beginPath(); ctx.arc(CX, CY, S * 0.5, 0, Math.PI * 2); ctx.fillStyle = "#0a1020"; ctx.fill();
      const tierCols = ["#0f1a2e", "#0d1828", "#0b1522"];
      [S * 0.49, S * 0.46, S * 0.43].forEach((r, ti) => {
        ctx.beginPath(); ctx.arc(CX, CY, r, 0, Math.PI * 2); ctx.fillStyle = tierCols[ti]; ctx.fill();
        ctx.beginPath(); ctx.arc(CX, CY, r - 2, 0, Math.PI * 2); ctx.strokeStyle = "rgba(255,255,255,0.04)"; ctx.lineWidth = 1; ctx.stroke();
      });
      for (let i = 0; i < 120; i++) {
        const ang = (i / 120) * Math.PI * 2;
        const r = FIELD_R + 18 + (i % 3) * 10;
        const bx = CX + Math.cos(ang) * r, by = CY + Math.sin(ang) * r;
        let waveOff = 0;
        if (g.crowdWaveTimer > 0) {
          const wavePhase = ((ang / (Math.PI * 2)) + g.crowdWave) % 1;
          waveOff = -Math.max(0, Math.sin(wavePhase * Math.PI * 2)) * 8;
        }
        const teamColors = ["#1e3a5f", "#2d1b4e", "#1a3a1a", "#4a1a1a", "#2a2a1a", "#0a2040"];
        ctx.fillStyle = teamColors[i % teamColors.length];
        ctx.beginPath(); ctx.ellipse(bx, by + waveOff + 4, 4, 6, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(bx, by + waveOff - 1, 4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${120 + i % 80},${80 + i % 60},${60 + i % 40},0.9)`; ctx.fill();
        if (g.crowdWaveTimer > 0) {
          const wp = ((ang / (Math.PI * 2)) + g.crowdWave) % 1;
          if (wp > 0.3 && wp < 0.55) {
            ctx.strokeStyle = "rgba(200,200,200,0.5)"; ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.moveTo(bx - 4, by + waveOff); ctx.lineTo(bx - 8, by + waveOff - 10); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(bx + 4, by + waveOff); ctx.lineTo(bx + 8, by + waveOff - 10); ctx.stroke();
          }
        }
      }
      if (g.crowdWaveTimer > 100) {
        const alpha = Math.min((g.crowdWaveTimer - 100) / 80, 1) * 0.6;
        for (let i = 0; i < 30; i++) {
          const ang = (i / 30) * Math.PI * 2 + (g.crowdWave * Math.PI * 4);
          const r = FIELD_R + 22 + (i % 4) * 8;
          const bx = CX + Math.cos(ang) * r, by = CY + Math.sin(ang) * r;
          ctx.beginPath(); ctx.arc(bx, by, 2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,255,200,${(alpha * (0.5 + 0.5 * Math.sin(Date.now() / 60 + i))).toFixed(2)})`; ctx.fill();
        }
      }
      ctx.fillStyle = "rgba(10,20,40,0.85)";
      ctx.beginPath(); ctx.roundRect(CX - 55, 5, 110, 22, 4); ctx.fill();
      ctx.font = "700 9px Rajdhani,Arial"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillStyle = "#fbbf24"; ctx.fillText("CIRCLE CRICKET PRO", CX, 16);
    }

    function drawField(g: GameState) {
      for (let i = 0; i < 6; i++) {
        const a1 = i * Math.PI * 2 / 6 - Math.PI / 2, a2 = (i + 1) * Math.PI * 2 / 6 - Math.PI / 2;
        ctx.beginPath(); ctx.moveTo(CX, CY); ctx.arc(CX, CY, FIELD_R, a1, a2); ctx.closePath();
        ctx.fillStyle = g.zoneCols[i]; ctx.fill();
        ctx.strokeStyle = "rgba(0,0,0,0.3)"; ctx.lineWidth = 1.5; ctx.stroke();
      }
      for (let i = 0; i < 6; i++) {
        const a = i * Math.PI * 2 / 6 - Math.PI / 2;
        ctx.beginPath(); ctx.moveTo(CX + Math.cos(a) * (HIT_ZONE + 6), CY + Math.sin(a) * (HIT_ZONE + 6));
        ctx.lineTo(CX + Math.cos(a) * FIELD_R, CY + Math.sin(a) * FIELD_R);
        ctx.strokeStyle = "rgba(255,255,255,0.1)"; ctx.lineWidth = 1; ctx.stroke();
      }
      [85, 145, 188].forEach(r => {
        ctx.beginPath(); ctx.arc(CX, CY, r, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(255,255,255,0.05)"; ctx.lineWidth = 1; ctx.stroke();
      });
      ctx.fillStyle = "rgba(255,255,255,0.025)"; ctx.fillRect(CX - 20, CY - FIELD_R, 40, FIELD_R * 2);
      for (let i = 0; i < 6; i++) {
        const mid = (i + 0.5) * Math.PI * 2 / 6 - Math.PI / 2;
        const tx = CX + Math.cos(mid) * 160, ty = CY + Math.sin(mid) * 160;
        ctx.save(); ctx.translate(tx, ty);
        ctx.beginPath(); ctx.arc(0, 0, 22, 0, Math.PI * 2); ctx.fillStyle = "rgba(0,0,0,0.55)"; ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,0.15)"; ctx.lineWidth = 1; ctx.stroke();
        ctx.font = "900 30px Bebas Neue,Arial"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.shadowColor = "rgba(0,0,0,0.9)"; ctx.shadowBlur = 6;
        ctx.fillStyle = "#ffffff";
        ctx.fillText(String(g.zoneLabs[i]), 0, g.zoneLabs[i] === "W" ? -5 : 0);
        if (g.zoneLabs[i] === "W") {
          ctx.font = "800 8px Rajdhani,Arial"; ctx.shadowBlur = 4; ctx.fillStyle = "#fca5a5";
          ctx.fillText("WICKET", 0, 10);
        }
        ctx.shadowBlur = 0; ctx.restore();
      }
    }

    function drawCenter(g: GameState) {
      ctx.beginPath(); ctx.arc(CX, CY, HIT_ZONE + 12, 0, Math.PI * 2); ctx.fillStyle = "rgba(0,0,0,0.6)"; ctx.fill();
      if (g.phase === "live") {
        const p = 0.28 + 0.32 * Math.sin(Date.now() / 130);
        ctx.beginPath(); ctx.arc(CX, CY, HIT_ZONE + 7, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(34,197,94,${p.toFixed(2)})`; ctx.lineWidth = 2.5; ctx.stroke();
      }
      ctx.beginPath(); ctx.arc(CX, CY, HIT_ZONE, 0, Math.PI * 2); ctx.fillStyle = "#081408"; ctx.fill();
      ctx.strokeStyle = g.phase === "live" ? "#22c55e" : "#1e293b"; ctx.lineWidth = 2; ctx.stroke();
      ctx.strokeStyle = "rgba(255,255,255,0.06)"; ctx.lineWidth = 1;
      for (let y = CY - HIT_ZONE + 8; y < CY + HIT_ZONE; y += 8) {
        const hw = Math.sqrt(Math.max(0, HIT_ZONE * HIT_ZONE - (y - CY) * (y - CY)));
        ctx.beginPath(); ctx.moveTo(CX - hw + 2, y); ctx.lineTo(CX + hw - 2, y); ctx.stroke();
      }
      ctx.strokeStyle = "rgba(255,255,255,0.4)"; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(CX - 35, CY + 20); ctx.lineTo(CX + 35, CY + 20); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(CX - 35, CY - 20); ctx.lineTo(CX + 35, CY - 20); ctx.stroke();
      const sy = CY + 22;
      [-7, 0, 7].forEach(ox => {
        ctx.fillStyle = "#fef9c3"; ctx.fillRect(CX + ox - 1.5, sy - 16, 3, 16);
        if (ox < 7) { ctx.fillStyle = "#fef9c3"; ctx.fillRect(CX + ox + 1.5, sy - 16, 4, 1.5); }
      });
      if (g.mode === "chase" && g.phase !== "over") {
        const need = Math.max(0, g.target - g.score);
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.shadowColor = "rgba(0,0,0,0.8)"; ctx.shadowBlur = 4;
        ctx.font = "800 10px Rajdhani,Arial"; ctx.fillStyle = "#93c5fd";
        ctx.fillText("NEED " + need, CX, CY - 28);
        ctx.shadowBlur = 0;
      }
    }

    function loop() {
      const g = gameRef.current;
      if (!g) { rafId = requestAnimationFrame(loop); return; }

      // ── UPDATE ──
      if (g.phase === "live" && g.ball.active) {
        g.ball.trail.push({ x: g.ball.x, y: g.ball.y });
        if (g.ball.trail.length > 22) g.ball.trail.shift();
        g.ball.x += g.ball.vx; g.ball.y += g.ball.vy; g.ball.spin += 0.22;
        const bx = g.ball.x - CX, by = g.ball.y - CY;
        const c = Math.cos(-g.batAngle), ss = Math.sin(-g.batAngle);
        const lx = bx * c - by * ss, ly = bx * ss + by * c;
        const hit = Math.abs(lx) <= BAT_LEN / 2 && Math.abs(ly) <= (BAT_W / 2 + BALL_R + 1);
        if (hit) {
          g.phase = "flying"; g.ball.active = false;
          if (!g.muted) audio.hit();
          g.batFlash = 1.0;
          g.impactRings.push({ x: g.ball.x, y: g.ball.y, r: 8, t: 1.0 });
          g.flash.col = "rgba(255,255,255,0.2)"; g.flash.t = 7;
          for (let i = 0; i < 18; i++) {
            const a = Math.random() * Math.PI * 2, sp = 1.5 + Math.random() * 7;
            const cols = ["#fff", "#fef08a", "#fbbf24"];
            g.parts.push({ x: g.ball.x, y: g.ball.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 1.8, life: 60 + ~~(Math.random() * 55), ml: 115, sz: 1.5 + Math.random() * 4, col: cols[~~(Math.random() * cols.length)], rot: Math.random() * Math.PI * 2, shape: Math.random() < 0.55 ? "rect" : "circle" });
          }
          const zone = Math.floor(Math.random() * g.zoneRuns.length);
          const outAng = (zone + 0.5) * (Math.PI * 2 / 6) - Math.PI / 2 + (Math.random() - 0.5) * 0.5;
          const spd = 12 + Math.random() * 3.5 + Math.min(Math.abs(g.batAngVel) * 1.5, 2);
          g.hb.x = g.ball.x; g.hb.y = g.ball.y;
          g.hb.vx = Math.cos(outAng) * spd; g.hb.vy = Math.sin(outAng) * spd;
          g.hb.spin = g.batAngVel * 0.6; g.hb.trail = []; g.hb.active = true;
          g.hb.zone = zone; g.hb.settled = false;
        } else {
          if (g.ball.y > CY + HIT_ZONE + 24) autoMiss();
          else if (g.ball.x < -25 || g.ball.x > S + 25 || g.ball.y > S + 25) autoMiss();
        }
      }
      if (g.phase === "flying" && g.hb.active && !g.hb.settled) {
        g.hb.trail.push({ x: g.hb.x, y: g.hb.y });
        if (g.hb.trail.length > 22) g.hb.trail.shift();
        g.hb.x += g.hb.vx; g.hb.y += g.hb.vy;
        g.hb.vx *= 0.982; g.hb.vy *= 0.982; g.hb.spin += 0.38;
        if (Math.hypot(g.hb.x - CX, g.hb.y - CY) >= FIELD_R - BALL_R) {
          g.hb.settled = true; resolveLanding(g.hb.zone);
        }
      }
      if (g.batFlash > 0) g.batFlash = Math.max(0, g.batFlash - 0.06);
      g.batAngVel *= 0.78;
      g.impactRings.forEach(r => { r.r += 3; r.t -= 0.06; });
      g.impactRings = g.impactRings.filter(r => r.t > 0);
      if (g.flash.t > 0) g.flash.t--;
      g.parts.forEach(p => { p.x += p.vx; p.y += p.vy; p.vy += 0.13; p.vx *= 0.968; p.life--; });
      g.parts = g.parts.filter(p => p.life > 0);
      if (g.crowdWaveTimer > 0) { g.crowdWaveTimer--; g.crowdWave = (g.crowdWave + 0.004) % 1; }

      // ── DRAW ──
      ctx.clearRect(0, 0, S, S);
      drawStadium(g);
      ctx.save(); ctx.beginPath(); ctx.arc(CX, CY, FIELD_R, 0, Math.PI * 2); ctx.clip();
      drawField(g);
      if (g.flash.t > 0) { ctx.fillStyle = g.flash.col; ctx.fillRect(0, 0, S, S); }
      ctx.restore();
      ctx.beginPath(); ctx.arc(CX, CY, FIELD_R + 6, 0, Math.PI * 2); ctx.strokeStyle = "rgba(34,197,94,0.12)"; ctx.lineWidth = 10; ctx.stroke();
      ctx.beginPath(); ctx.arc(CX, CY, FIELD_R + 2, 0, Math.PI * 2); ctx.strokeStyle = "#22c55e"; ctx.lineWidth = 4; ctx.stroke();
      ctx.save(); ctx.beginPath(); ctx.arc(CX, CY, HIT_ZONE + 14, 0, Math.PI * 2); ctx.clip(); drawCenter(g); ctx.restore();
      if (g.phase !== "over") drawBat(g);
      if (g.ball.active && g.phase === "live") { drawTrail(g.ball.trail, BALL_R, "255,230,180"); drawBall(g.ball.x, g.ball.y, g.ball.spin, BALL_R); }
      if (g.hb.active && g.phase === "flying" && !g.hb.settled) { drawTrail(g.hb.trail, BALL_R, "255,210,80"); drawBall(g.hb.x, g.hb.y, g.hb.spin, BALL_R, "#fffbf0"); }
      g.impactRings.forEach(ring => {
        ctx.beginPath(); ctx.arc(ring.x, ring.y, ring.r, 0, Math.PI * 2); ctx.strokeStyle = `rgba(251,191,36,${ring.t.toFixed(2)})`; ctx.lineWidth = 2.5; ctx.stroke();
        ctx.beginPath(); ctx.arc(ring.x, ring.y, ring.r * 1.5, 0, Math.PI * 2); ctx.strokeStyle = `rgba(255,255,255,${(ring.t * 0.4).toFixed(2)})`; ctx.lineWidth = 1.5; ctx.stroke();
      });
      g.parts.forEach(p => {
        ctx.globalAlpha = Math.max(0, p.life / p.ml); ctx.fillStyle = p.col;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot + (1 - p.life / p.ml) * 7);
        if (p.shape === "circle") { ctx.beginPath(); ctx.arc(0, 0, p.sz / 2, 0, Math.PI * 2); ctx.fill(); }
        else ctx.fillRect(-p.sz / 2, -p.sz / 3, p.sz, p.sz * 0.6);
        ctx.restore(); ctx.globalAlpha = 1;
      });
      if (g.phase === "live" && g.ball.active && g.ball.y < CY - 90) {
        ctx.shadowColor = "rgba(0,0,0,0.8)"; ctx.shadowBlur = 4;
        ctx.fillStyle = "#94a3b8"; ctx.font = "700 9px Rajdhani,Arial";
        ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("▼ BOWLER", CX, 18);
        ctx.shadowBlur = 0;
      }

      rafId = requestAnimationFrame(loop);
    }

    loop();
    return () => cancelAnimationFrame(rafId);
  }, [screen, autoMiss, resolveLanding]);

  useEffect(() => {
    if (screen === "game" && gameRef.current) {
      runCountdown();
    }
  }, [screen]); // eslint-disable-line

  const wrapRef = useRef<HTMLDivElement>(null);
  const handlePointer = useCallback((clientX: number, clientY: number) => {
    const g = gameRef.current;
    if (!g || !wrapRef.current) return;
    const r = wrapRef.current.getBoundingClientRect();
    const sc = S / r.width;
    const px = (clientX - r.left) * sc, py = (clientY - r.top) * sc;
    const dx = px - CX, dy = py - CY;
    if (Math.hypot(dx, dy) < 12) return;
    const newAng = Math.atan2(dy, dx);
    let da = newAng - g.batAngle;
    while (da > Math.PI) da -= Math.PI * 2;
    while (da < -Math.PI) da += Math.PI * 2;
    g.batAngVel = da; g.batAngle = newAng;
  }, []);

  const resetGame = useCallback(() => {
    const g = gameRef.current;
    if (!g) return;
    g.score = 0; g.balls = 0; g.wickets = 0; g.ballRecord = []; g.matchWon = false;
    g.streak = 0; g.pressurePct = 0.5;
    g.parts = []; g.flash.t = 0; g.batFlash = 0; g.impactRings = [];
    g.ball.active = false; g.hb.active = false;
    if (g.mode === "chase") {
      g.target = generateTarget(g.maxBalls, g.maxWkts);
      setUiTarget(g.target);
    }
    setUiMatchOver(null); setUiPop(null);
    syncUI();
    runCountdown();
  }, [syncUI, runCountdown]);

  // ── RENDER ─────────────────────────────────────────────────────────────────
  const styles: Record<string, CSSProperties> = {
    root: { background: "#05080f", minHeight: "100vh", fontFamily: "'Rajdhani',sans-serif", color: "#f1f5f9", display: "flex", flexDirection: "column", alignItems: "center", overflowX: "hidden" },
    sc: { background: "#0d1324", border: "1px solid #1e293b", borderRadius: 8, padding: "6px 4px", textAlign: "center" },
    scV: { fontFamily: "'Bebas Neue',sans-serif", fontSize: 24, letterSpacing: 1, display: "block", lineHeight: 1 },
    scL: { fontSize: 8, color: "#94a3b8", letterSpacing: 2, fontWeight: 700 },
  };

  const bbClass = (rec: (number | "W")[], idx: number, balls: number, phase: string, maxBalls: number) => {
    if (idx < rec.length) {
      const r = rec[idx];
      if (r === "W") return { bg: "#7f1d1d", color: "#fca5a5", border: "#dc2626", txt: "W" };
      if (r === 0) return { bg: "#0d1324", color: "#334155", border: "#0f172a", txt: "•" };
      const cols: Record<number, { bg: string; color: string; border: string }> = {
        1: { bg: "#164e63", color: "#67e8f9", border: "#0891b2" },
        2: { bg: "#78350f", color: "#fcd34d", border: "#d97706" },
        3: { bg: "#4c1d95", color: "#c4b5fd", border: "#7c3aed" },
        4: { bg: "#1e3a8a", color: "#93c5fd", border: "#2563eb" },
        6: { bg: "#14532d", color: "#86efac", border: "#16a34a" },
      };
      return { ...(cols[r as number] || cols[1]), txt: String(r) };
    }
    const isNow = idx === balls && phase !== "over";
    return { bg: isNow ? "#052e16" : "#0d1324", color: "#64748b", border: isNow ? "#22c55e" : "#1e293b", txt: String(idx + 1), isNow };
  };

  const streakMsgs = ["🔥 ON FIRE!", "⚡ UNSTOPPABLE!", "🚀 BLAZING!", "👑 LEGENDARY!"];
  const streakMsg = uiStreak >= 6 ? streakMsgs[3] : uiStreak >= 5 ? streakMsgs[2] : uiStreak >= 4 ? streakMsgs[1] : streakMsgs[0];
  const pressureLbl = uiPressure < 0.3 ? "LOW PRESSURE" : uiPressure < 0.6 ? "BUILDING" : "HIGH PRESSURE";

  return (
    <div style={styles.root}>
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Rajdhani:wght@500;700&display=swap" rel="stylesheet" />

      {screen === "toss" && <TossScreen onSelectMode={handleSelectMode} router={router} />}

      {screen === "game" && (
        <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ width: "100%", maxWidth: 500, display: "flex", justifyContent: "space-between", alignItems: "flex-end", padding: "8px 14px 4px", gap: 8 }}>
            <button onClick={() => router.push('/MainModules/Fantasy?tab=fantasy')} style={{ background: "#0d1324", border: "1px solid #1e293b", color: "#94a3b8", borderRadius: 9, padding: "6px 10px", fontSize: 11, letterSpacing: 2, cursor: "pointer", transition: "transform 0.1s, opacity 0.1s", minWidth: "50px" }} onMouseDown={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.97)"; (e.currentTarget as HTMLButtonElement).style.opacity = "0.8"; }} onMouseUp={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = ""; (e.currentTarget as HTMLButtonElement).style.opacity = ""; }}>← BACK</button>
            <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, letterSpacing: 3, color: "#22c55e", lineHeight: 1 }}>
              Circle Cricket<small style={{ display: "block", fontFamily: "'Rajdhani',sans-serif", fontSize: 8, color: "#64748b", letterSpacing: 3, fontWeight: 500 }}>PRO EDITION</small>
            </div>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, padding: "3px 9px", borderRadius: 5, background: mode === "chase" ? "#1e3a8a" : "#78350f", color: mode === "chase" ? "#93c5fd" : "#fcd34d" }}>
              {mode === "chase" ? "CHASE" : "BAT"} · {diff === "easy" ? "EASY" : diff === "hard" ? "HARD" : "MED"} · T{maxBalls}
            </div>
          </div>

          {mode === "chase" && (
            <div style={{ width: "calc(100% - 20px)", maxWidth: 480, background: "#0d1324", border: "1px solid #1e293b", borderRadius: 10, padding: "8px 14px", margin: "0 10px 4px", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: uiChaseFill + "%", background: "linear-gradient(90deg,#1e3a8a,#3b82f6)", borderRadius: 10, transition: "width 0.5s", opacity: 0.35 }} />
              <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 13, letterSpacing: 1, color: "#93c5fd" }}>TARGET: {uiTarget}</div>
                <div style={{ fontSize: 11, color: "#60a5fa", fontWeight: 700, letterSpacing: 1 }}>NEED {Math.max(0, uiTarget - uiScore)} FROM {Math.max(0, maxBalls - uiBalls)}</div>
                <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600 }}>RR: {maxBalls - uiBalls > 0 ? (Math.max(0, uiTarget - uiScore) / ((maxBalls - uiBalls) / 6)).toFixed(1) : "—"}</div>
              </div>
            </div>
          )}

          <div style={{ width: "100%", maxWidth: 500, display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 5, padding: "0 10px 5px" }}>
            {[
              { v: uiScore, l: "SCORE" },
              { v: `${uiBalls}/${maxBalls}`, l: "BALLS" },
              { v: `${uiWkts}/${maxWkts}`, l: "WICKETS" },
              { v: mode === "bat" ? uiBest : uiTarget, l: mode === "bat" ? "BEST" : "TARGET" },
            ].map(({ v, l }) => (
              <div key={l} style={styles.sc}><span style={styles.scV}>{v}</span><span style={styles.scL}>{l}</span></div>
            ))}
          </div>

          <div ref={wrapRef} style={{ position: "relative", width: "min(96vw,460px)", height: "min(96vw,460px)", touchAction: "none", userSelect: "none" }}
            onMouseMove={e => handlePointer(e.clientX, e.clientY)}
            onTouchStart={e => { e.preventDefault(); handlePointer(e.touches[0].clientX, e.touches[0].clientY); }}
            onTouchMove={e => { e.preventDefault(); handlePointer(e.touches[0].clientX, e.touches[0].clientY); }}
            onMouseLeave={() => { if (gameRef.current) gameRef.current.batAngVel *= 0.5; }}>
            <canvas ref={canvasRef} width={460} height={460} style={{ width: "100%", height: "100%", display: "block", touchAction: "none" }} />

            {uiCountdown && (
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none", zIndex: 20 }}>
                <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 110, letterSpacing: 2, color: uiCountdown === "GO!" ? "#22c55e" : "#fff", lineHeight: 1, textShadow: "0 0 60px rgba(34,197,94,0.7)" }}>{uiCountdown}</div>
                <div style={{ fontSize: 11, letterSpacing: 4, color: "#475569", marginTop: -4, fontWeight: 700 }}>GET READY</div>
              </div>
            )}

            {uiPop && (
              <div style={{ position: "absolute", top: "16%", left: "50%", transform: "translateX(-50%)", pointerEvents: "none", zIndex: 15, textAlign: "center", animation: "popIn 0.13s ease" }}>
                <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: uiPop.big ? 52 : 46, letterSpacing: 2, color: uiPop.col, lineHeight: 1 }}>{uiPop.text}</div>
                <div style={{ fontSize: 10, letterSpacing: 3, fontWeight: 700, color: uiPop.col, marginTop: 2 }}>{uiPop.label}</div>
              </div>
            )}

            {uiMatchOver && (
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 25, background: "rgba(5,8,15,0.8)" }}>
                <div style={{ background: "#0d1324", borderRadius: 20, padding: "22px 30px", textAlign: "center", minWidth: 240, border: `2px solid ${uiMatchOver.win === true ? "#22c55e" : uiMatchOver.win === false ? "#ef4444" : "#22c55e"}` }}>
                  <div style={{ fontSize: 9, letterSpacing: 4, color: uiMatchOver.win === true ? "#22c55e" : uiMatchOver.win === false ? "#ef4444" : "#94a3b8", fontWeight: 700 }}>{uiMatchOver.lbl}</div>
                  <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 72, lineHeight: 1, color: uiMatchOver.win === true ? "#22c55e" : uiMatchOver.win === false ? "#ef4444" : "#22c55e" }}>{uiMatchOver.big}</div>
                  <div style={{ fontSize: 12, color: "#94a3b8", letterSpacing: 1, marginTop: 2 }}>{uiMatchOver.sub}</div>
                  <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 18, marginTop: 8, letterSpacing: 1, color: uiMatchOver.win === false ? "#94a3b8" : "#f59e0b" }}>{uiMatchOver.extra}</div>
                </div>
              </div>
            )}

            {uiStreak >= 3 && (
              <div style={{ position: "absolute", top: "12%", right: "4%", fontFamily: "'Bebas Neue',sans-serif", fontSize: 13, letterSpacing: 1, background: "rgba(251,191,36,0.15)", border: "1px solid #f59e0b", color: "#fbbf24", padding: "3px 8px", borderRadius: 6, pointerEvents: "none", zIndex: 14 }}>
                {streakMsg} {uiStreak} IN A ROW
              </div>
            )}
          </div>

          <div style={{ width: "100%", maxWidth: 500, padding: "5px 10px 3px", display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ fontSize: 9, color: "#94a3b8", letterSpacing: 2, fontWeight: 700, whiteSpace: "nowrap" }}>SCORECARD</div>
            <div style={{ display: "flex", gap: 3, flexWrap: "wrap", flex: 1 }}>
              {Array.from({ length: maxBalls }, (_, i) => {
                const s = bbClass(uiBallRecord, i, uiBalls, uiPhase, maxBalls);
                return (
                  <div key={i} style={{ width: 26, height: 26, borderRadius: "50%", border: `1.5px solid ${s.border}`, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: s.color, fontFamily: "'Bebas Neue',sans-serif", boxShadow: s.isNow ? "0 0 10px rgba(34,197,94,0.5)" : "none", transition: "all 0.25s" }}>
                    {s.txt}
                  </div>
                );
              })}
            </div>
          </div>

          {mode === "chase" && (
            <div style={{ width: "100%", maxWidth: 500, padding: "0 10px 3px" }}>
              <div style={{ height: 4, borderRadius: 2, background: "linear-gradient(90deg,#22c55e,#f59e0b,#ef4444)", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: -2, width: 8, height: 8, borderRadius: "50%", background: "#fff", border: "1.5px solid #0d1324", left: `${uiPressure * 100}%`, transform: "translateX(-50%)", transition: "left 0.4s" }} />
              </div>
              <div style={{ fontSize: 8, color: "#64748b", letterSpacing: 2, textAlign: "right", marginTop: 2, fontWeight: 700 }}>{pressureLbl}</div>
            </div>
          )}

          <div style={{ width: "100%", maxWidth: 500, padding: "3px 12px", textAlign: "center", minHeight: 20 }}>
            <div style={{ fontSize: 12, color: "#cbd5e1", letterSpacing: 0.4, fontWeight: 600 }}>{uiMsg}</div>
          </div>

          <div style={{ display: "flex", gap: 6, padding: "5px 10px", width: "100%", maxWidth: 500 }}>
            {[
              { label: "↺ RESTART", bg: "#22c55e", color: "#fff", border: "none", onClick: resetGame },
              { label: "⇄ TOSS", bg: "#0d1324", color: "#94a3b8", border: "1px solid #1e293b", onClick: () => setScreen("toss") },
              { label: muted ? "🔇 MUTED" : "🔊 SOUND", bg: muted ? "#1f0808" : "#0d1324", color: muted ? "#fca5a5" : "#94a3b8", border: muted ? "1px solid #ef4444" : "1px solid #1e293b", onClick: () => { setMuted((m: boolean) => !m); if (gameRef.current) gameRef.current.muted = !muted; } },
              { label: "? HELP", bg: "#0d1324", color: "#94a3b8", border: "1px solid #1e293b", onClick: () => setShowHow((h: boolean) => !h) },
            ].map(({ label, bg, color, border, onClick }) => (
              <button key={label} onClick={onClick} style={{ flex: 1, padding: "9px 0", border, borderRadius: 9, fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: 2, cursor: "pointer", background: bg, color, transition: "transform 0.1s, opacity 0.1s" }}
                onMouseDown={e => { e.currentTarget.style.transform = "scale(0.97)"; e.currentTarget.style.opacity = "0.8"; }}
                onMouseUp={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.opacity = ""; }}>
                {label}
              </button>
            ))}
          </div>

          {showHow && (
            <div style={{ width: "100%", maxWidth: 500, background: "#0d1324", border: "1px solid #1e293b", borderRadius: 12, padding: "12px 16px", margin: "0 0 6px", fontSize: 11, lineHeight: 1.9, color: "#cbd5e1" }}>
              <h3 style={{ fontFamily: "'Bebas Neue',sans-serif", color: "#22c55e", fontSize: 16, letterSpacing: 2, marginBottom: 5 }}>HOW TO PLAY</h3>
              <ul style={{ paddingLeft: 14 }}>
                <li><strong style={{ color: "#22c55e" }}>Move mouse / drag finger</strong> to swing the bat.</li>
                <li>Ball bowls from top — intercept with your bat blade.</li>
                <li>Ball touches bat = automatic HIT → flies to a random zone.</li>
                <li>Ball passes bat = miss, 0 runs.</li>
                <li><strong style={{ color: "#ef4444" }}>W zone</strong> = WICKET, you&apos;re out!</li>
                <li><strong style={{ color: "#60a5fa" }}>CHASE mode:</strong> Beat the target to WIN!</li>
              </ul>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 6 }}>
                {[["#16a34a", "6"], ["#2563eb", "4"], ["#7c3aed", "3"], ["#d97706", "2"], ["#0891b2", "1"], ["#dc2626", "W"]].map(([bg, lbl]) => (
                  <div key={lbl} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 700, color: "#cbd5e1" }}>
                    <div style={{ width: 11, height: 11, borderRadius: 3, background: bg }} />{lbl}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ padding: 6, fontSize: 9, color: "#475569", letterSpacing: 2 }}>Circle Cricket PRO</div>
        </div>
      )}
    </div>
  );
}