"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

// ── Types ────────────────────────────────────────────────────────────────────
type Phase = "toss" | "playing" | "revealing" | "over";
type Difficulty = "easy" | "medium" | "hard";
type BallRecord = number | "W";

interface GameState {
  phase: Phase;
  diff: Difficulty;
  maxBalls: number;
  maxWkts: number;
  innings: number;
  userBatsInInnings1: boolean;
  userBatting: boolean;
  score: number;
  balls: number;
  wickets: number;
  ballRecord: BallRecord[];
  inn1Score: number;
  target: number;
  best: number;
  streak: number;
  cpuHistory: number[];
  userHistory: number[];
  msg: string;
  youEmoji: string;
  youNum: string | number;
  cpuEmoji: string;
  cpuNum: string | number;
  youResult: string;
  cpuResult: string;
  showInningsBreak: boolean;
  inningsBreakData: { emoji: string; score: number; sub: string; msg: string };
  showMatchOver: boolean;
  matchOverData: {
    result: string;
    color: string;
    score: number;
    sub: string;
    best: string;
    detail: string;
  };
  timerSecs: number;
  timerUrgent: boolean;
  timerWarning: boolean;
  showChaseBar: boolean;
  showHowTo: boolean;
  muted: boolean;
  showStreakBadge: boolean;
  streakText: string;
  youGlow: boolean;
  cpuGlow: boolean;
  youSlam: boolean;
  cpuSlam: boolean;
}

// ── Constants ────────────────────────────────────────────────────────────────
const TIMER_SECS = 5;
const ARC_FULL = 113.1;

const HAND_EMOJI: Record<number, string> = {
  0: "✊", 1: "☝️", 2: "✌️", 3: "🤟", 4: "🖖", 5: "🖐️", 6: "🤙",
};
const HAND_EMOJI_CPU: Record<number, string> = {
  0: "✊", 1: "☝️", 2: "✌️", 3: "🤟", 4: "🖖", 5: "✋", 6: "🤙",
};

const BTN_STYLES: Record<number, React.CSSProperties> = {
  1: { background: "#0e3d52", color: "#67e8f9", boxShadow: "0 4px 16px rgba(6,182,212,0.3)" },
  2: { background: "#5c2009", color: "#fdba74", boxShadow: "0 4px 16px rgba(234,88,12,0.3)" },
  3: { background: "#3b1578", color: "#c4b5fd", boxShadow: "0 4px 16px rgba(124,58,237,0.3)" },
  4: { background: "#172d6e", color: "#93c5fd", boxShadow: "0 4px 16px rgba(37,99,235,0.3)" },
  5: { background: "#0f3d22", color: "#86efac", boxShadow: "0 4px 16px rgba(22,163,74,0.3)" },
  6: { background: "linear-gradient(135deg,#5c0f24,#3b0415)", color: "#fda4af", boxShadow: "0 4px 16px rgba(239,68,68,0.35)", border: "1px solid rgba(232,24,90,0.5)" },
};

const BB_STYLES: Record<string | number, React.CSSProperties> = {
  W: { background: "rgba(232,24,90,0.25)", color: "#fb7185", borderColor: "#e8185a" },
  0: { background: "#1a1200", color: "#f59e0b", borderColor: "#f59e0b" },
  1: { background: "#0e3d52", color: "#67e8f9", borderColor: "#0891b2" },
  2: { background: "#5c2009", color: "#fdba74", borderColor: "#ea580c" },
  3: { background: "#3b1578", color: "#c4b5fd", borderColor: "#7c3aed" },
  4: { background: "#172d6e", color: "#93c5fd", borderColor: "#2563eb" },
  5: { background: "#0f3d22", color: "#86efac", borderColor: "#16a34a" },
  6: { background: "#5c0f24", color: "#fda4af", borderColor: "#e8185a" },
};

// ── Audio helpers ────────────────────────────────────────────────────────────
let AC: AudioContext | null = null;
function getAC(): AudioContext {
  if (!AC) AC = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  return AC;
}
function beep(f: number, t: OscillatorType, v: number, d: number, delay = 0, muted = false) {
  if (muted) return;
  try {
    const ac = getAC();
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.type = t;
    o.frequency.value = f;
    g.gain.setValueAtTime(v, ac.currentTime + delay);
    g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + delay + d);
    o.connect(g); g.connect(ac.destination);
    o.start(ac.currentTime + delay);
    o.stop(ac.currentTime + delay + d + 0.05);
  } catch {}
}
function sndReveal(m: boolean) { beep(600, "sine", 0.15, 0.1, 0, m); }
function sndOut(m: boolean) { beep(220, "sawtooth", 0.22, 0.3, 0, m); beep(160, "sawtooth", 0.18, 0.4, 0.12, m); }
function sndRun(r: number, m: boolean) {
  if (r === 6) { [523, 659, 784, 1047].forEach((f, i) => beep(f, "sine", 0.16, 0.15, i * 0.08, m)); }
  else if (r === 4) { beep(523, "sine", 0.16, 0.14, 0, m); beep(659, "sine", 0.13, 0.14, 0.11, m); }
  else { beep(300 + r * 40, "sine", 0.13, 0.1, 0, m); }
}
function sndWin(m: boolean) { [523, 659, 784, 1047, 1319].forEach((f, i) => beep(f, "sine", 0.16, 0.2, i * 0.1, m)); }
function sndLose(m: boolean) { [440, 370, 300, 250].forEach((f, i) => beep(f, "sawtooth", 0.13, 0.25, i * 0.13, m)); }
function sndTick(urgent: boolean, m: boolean) {
  if (m) return;
  try {
    const ac = getAC(), o = ac.createOscillator(), g = ac.createGain();
    o.type = "square";
    o.frequency.value = urgent ? 880 : 660;
    g.gain.setValueAtTime(urgent ? 0.06 : 0.04, ac.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.06);
    o.connect(g); g.connect(ac.destination);
    o.start(); o.stop(ac.currentTime + 0.07);
  } catch {}
}
function sndTimeout(m: boolean) {
  [400, 350, 280].forEach((f, i) => beep(f, "sawtooth", 0.14, 0.2, i * 0.15, m));
}

// ── Particles ────────────────────────────────────────────────────────────────
interface Particle { x: number; y: number; vx: number; vy: number; col: string; r: number; life: number; dec: number; }
let parts: Particle[] = [];
function spawnP(x: number, y: number, n: number, cols: string[], burst = false) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2;
    const sp = burst ? (2 + Math.random() * 8) : (1 + Math.random() * 3);
    parts.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - (burst ? 5 : 2), col: cols[Math.floor(Math.random() * cols.length)], r: 3 + Math.random() * 4, life: 1, dec: 0.016 + Math.random() * 0.025 });
  }
}

// ── CPU brain ────────────────────────────────────────────────────────────────
function cpuPick(diff: Difficulty, userHistory: number[]): number {
  if (diff === "easy") return Math.ceil(Math.random() * 6);
  const freq = [0, 0, 0, 0, 0, 0, 0];
  const pool = diff === "medium" ? userHistory.slice(-6) : userHistory.slice(-10);
  pool.forEach((n, i) => { freq[n] += (diff === "hard" ? i + 1 : 1); });
  let bestF = -1; let pick = Math.ceil(Math.random() * 6);
  for (let i = 1; i <= 6; i++) if (freq[i] > bestF) { bestF = freq[i]; pick = i; }
  const bias = diff === "medium" ? 0.45 : 0.65;
  return Math.random() < bias && pool.length >= 2 ? pick : Math.ceil(Math.random() * 6);
}

// ── Initial state ────────────────────────────────────────────────────────────
function initialState(): GameState {
  return {
    phase: "toss", diff: "medium", maxBalls: 12, maxWkts: 2,
    innings: 1, userBatsInInnings1: true, userBatting: true,
    score: 0, balls: 0, wickets: 0, ballRecord: [],
    inn1Score: 0, target: 0, best: 0, streak: 0,
    cpuHistory: [], userHistory: [],
    msg: "Pick a number to play!",
    youEmoji: "✊", youNum: "?", cpuEmoji: "✊", cpuNum: "?",
    youResult: "", cpuResult: "",
    showInningsBreak: false,
    inningsBreakData: { emoji: "🏏", score: 0, sub: "", msg: "" },
    showMatchOver: false,
    matchOverData: { result: "", color: "#fff", score: 0, sub: "", best: "", detail: "" },
    timerSecs: TIMER_SECS, timerUrgent: false, timerWarning: false,
    showChaseBar: false, showHowTo: false, muted: false,
    showStreakBadge: false, streakText: "",
    youGlow: false, cpuGlow: false, youSlam: false, cpuSlam: false,
  };
}

// ── Main Component ───────────────────────────────────────────────────────────
export default function HandCricket() {
  const router = useRouter();
  const [gs, setGs] = useState<GameState>(initialState());
  const gsRef = useRef<GameState>(gs);
  gsRef.current = gs;

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRemRef = useRef(TIMER_SECS);
  const pCanvasRef = useRef<HTMLCanvasElement>(null);
  const heroCanvasRef = useRef<HTMLCanvasElement>(null);
  const heroRafRef = useRef<number>(0);

  // Sync state helper
  const update = useCallback((fn: (s: GameState) => Partial<GameState>) => {
    setGs(prev => ({ ...prev, ...fn(prev) }));
  }, []);

  // ── Particle animation ───────────────────────────────────────────────────
  useEffect(() => {
    const canvas = pCanvasRef.current;
    if (!canvas) return;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);
    let raf: number;
    const tick = () => {
      const ctx = canvas.getContext("2d")!;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      parts = parts.filter(p => {
        p.x += p.vx; p.y += p.vy; p.vy += 0.15; p.life -= p.dec; p.vx *= 0.98;
        if (p.life <= 0) return false;
        ctx.globalAlpha = p.life; ctx.fillStyle = p.col;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
        return true;
      });
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { window.removeEventListener("resize", resize); cancelAnimationFrame(raf); };
  }, []);

  // ── Hero canvas animation ─────────────────────────────────────────────────
  useEffect(() => {
    if (gs.phase !== "toss") { cancelAnimationFrame(heroRafRef.current); return; }
    const c = heroCanvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    const seq = Object.values(HAND_EMOJI).slice(1);
    let youIdx = 0, cpuIdx = 3, lastSwitch = 0;
    const frame = (ts: number) => {
      ctx.clearRect(0, 0, 400, 100);
      if (ts - lastSwitch > 900) { youIdx = (youIdx + 1) % seq.length; cpuIdx = (cpuIdx + 2) % seq.length; lastSwitch = ts; }
      const scale = 0.85 + Math.sin(ts / 400) * 0.1;
      const scaleC = 0.85 + Math.cos(ts / 350) * 0.1;
      ctx.font = `${52 * scale}px serif`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.save(); ctx.translate(80, 48); ctx.scale(scale, scale); ctx.fillText(seq[youIdx], 0, 0); ctx.restore();
      ctx.fillStyle = "rgba(71,85,105,0.7)"; ctx.font = "bold 18px sans-serif"; ctx.textBaseline = "middle";
      ctx.fillText("VS", 200, 48);
      ctx.save(); ctx.translate(320, 48); ctx.scale(scaleC, scaleC);
      ctx.font = `${52 * scaleC}px serif`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(seq[cpuIdx], 0, 0); ctx.restore();
      ctx.fillStyle = "rgba(71,85,105,0.55)"; ctx.font = "10px sans-serif";
      ctx.textAlign = "center"; ctx.textBaseline = "bottom";
      ctx.fillText("SAME HAND = WICKET! 🏏", 200, 96);
      heroRafRef.current = requestAnimationFrame(frame);
    };
    heroRafRef.current = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(heroRafRef.current);
  }, [gs.phase]);

  const stopGameLoops = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    timerRemRef.current = TIMER_SECS;
    cancelAnimationFrame(heroRafRef.current);
  }, []);

  // ── Timer ────────────────────────────────────────────────────────────────
  const clearTimer = useCallback(() => {
    stopGameLoops();
    update(() => ({ timerSecs: TIMER_SECS, timerUrgent: false, timerWarning: false }));
  }, [stopGameLoops, update]);

  useEffect(() => {
    return () => {
      stopGameLoops();
    };
  }, [stopGameLoops]);

  const onTimeout = useCallback(() => {
    const s = gsRef.current;
    if (s.phase !== "playing") return;
    update(() => ({ phase: "revealing" }));

    const cpu = cpuPick(s.diff, s.userHistory);
    const newUserHistory = [...s.userHistory, 0];
    const newCpuHistory = [...s.cpuHistory, cpu];

    update(() => ({ youEmoji: "😴", youNum: "0", youGlow: false }));

    setTimeout(() => {
      const newBalls = s.balls + 1;
      const newBallRecord: BallRecord[] = [...s.ballRecord, 0];

      spawnP(window.innerWidth / 2, window.innerHeight * 0.4, 8, ["#f59e0b", "#fff"], false);

      const over = (newBalls >= s.maxBalls || s.wickets >= s.maxWkts);
      const chased = (s.innings === 2 && s.score >= s.target);

      update(() => ({
        cpuEmoji: HAND_EMOJI_CPU[cpu], cpuNum: cpu, cpuSlam: true,
        youResult: "TOO SLOW!", cpuResult: "",
        balls: newBalls, ballRecord: newBallRecord,
        userHistory: newUserHistory, cpuHistory: newCpuHistory,
        msg: `⏰ Time's up! 0 runs scored. CPU showed ${HAND_EMOJI_CPU[cpu]}. Stay sharp!`,
      }));
      sndTimeout(s.muted);

      setTimeout(() => {
        if (chased || over) {
          if (s.innings === 1) triggerEndInn1(s.score, newBalls, s.wickets, s.target || s.score + 1, s.userBatting, s.userBatsInInnings1, newBallRecord, newUserHistory, newCpuHistory, s.best, s.muted);
          else triggerEndMatch(s.userBatsInInnings1, s.score, s.inn1Score, s.target, s.best, s.muted);
        } else {
          update(() => ({
            phase: "playing", youEmoji: "✊", youNum: "?", cpuEmoji: "✊", cpuNum: "?",
            youResult: "", cpuResult: "", youGlow: true, cpuGlow: true, cpuSlam: false,
          }));
          startTimerFn();
        }
      }, 1400);
    }, 500);
  }, [update, clearTimer]); // eslint-disable-line react-hooks/exhaustive-deps

  const startTimerFn = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRemRef.current = TIMER_SECS;
    update(() => ({ timerSecs: TIMER_SECS, timerUrgent: false, timerWarning: false }));
    timerRef.current = setInterval(() => {
      timerRemRef.current -= 0.1;
      const rem = timerRemRef.current;
      const urgent = rem <= 1.5;
      const warning = rem > 1.5 && rem <= 3;
      update(() => ({ timerSecs: Math.max(0, rem), timerUrgent: urgent, timerWarning: warning }));
      if (urgent || warning) sndTick(urgent, gsRef.current.muted);
      if (rem <= 0) {
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = null;
        onTimeout();
      }
    }, 100);
  }, [update, onTimeout]);

  // ── End innings helpers ───────────────────────────────────────────────────
  const triggerEndInn1 = (
    score: number, balls: number, wickets: number, tgt: number,
    userBatting: boolean, userBatsInInnings1: boolean,
    ballRecord: BallRecord[], userHistory: number[], cpuHistory: number[],
    best: number, muted: boolean
  ) => {
    const target = score + 1;
    update(() => ({
      phase: "over", inn1Score: score, target,
      showInningsBreak: true,
      inningsBreakData: {
        emoji: userBatting ? "🏏" : "🎯",
        score,
        sub: `RUNS IN ${balls} BALL${balls !== 1 ? "S" : ""}`,
        msg: userBatting ? `CPU needs ${target} to win — time to bowl! 🎯` : `You need ${target} to win — time to bat! 🏏`,
      },
    }));
  };

  const triggerEndMatch = (
    userBatsInInnings1: boolean, score: number, inn1Score: number,
    target: number, best: number, muted: boolean
  ) => {
    const userInn = userBatsInInnings1 ? inn1Score : score;
    const cpuInn = userBatsInInnings1 ? score : inn1Score;
    const userWon = userInn > cpuInn;
    const isDraw = userInn === cpuInn;

    let result: string, color: string;
    if (isDraw) { result = "🤝 TIE!"; color = "#f59e0b"; }
    else if (userWon) { result = "YOU WIN! 🎉"; color = "#22c55e"; }
    else { result = "CPU WINS 😤"; color = "#ef4444"; }

    update(() => ({
      phase: "over",
      showMatchOver: true,
      matchOverData: {
        result, color, score: userInn, sub: "YOUR SCORE",
        best: best > 0 ? `⭐ PERSONAL BEST: ${best}` : "",
        detail: `You ${userInn}  ·  CPU ${cpuInn}  ·  Target was ${target}`,
      },
    }));

    if (userWon) { sndWin(muted); spawnP(window.innerWidth / 2, window.innerHeight / 2, 100, ["#e8185a", "#f59e0b", "#22c55e", "#fff", "#93c5fd"], true); }
    else if (isDraw) { spawnP(window.innerWidth / 2, window.innerHeight / 2, 45, ["#f59e0b", "#fff"], true); }
    else { sndLose(muted); }
  };

  // ── Game actions ──────────────────────────────────────────────────────────
  const startGame = useCallback((role: "bat" | "bowl") => {
    clearTimer();
    const s = gsRef.current;
    const userBatsInInnings1 = role === "bat";
    const userBatting = userBatsInInnings1;
    const newBest = s.best;
    update(() => ({
      phase: "playing", innings: 1, userBatsInInnings1, userBatting,
      score: 0, balls: 0, wickets: 0, ballRecord: [],
      inn1Score: 0, target: 0, streak: 0,
      cpuHistory: [], userHistory: [], parts: [],
      showChaseBar: false, showInningsBreak: false, showMatchOver: false,
      best: newBest,
      youEmoji: "✊", youNum: "?", cpuEmoji: "✊", cpuNum: "?",
      youResult: "", cpuResult: "", youGlow: true, cpuGlow: true,
      showStreakBadge: false, streakText: "",
      msg: userBatsInInnings1 ? "You bat first! Pick a hand 1–6. Same = OUT! ✊" : "You bowl first! Match CPU's hand for a wicket! ✊",
    }));
    setTimeout(() => startTimerFn(), 50);
  }, [clearTimer, update, startTimerFn]);

  const goToss = useCallback(() => {
    clearTimer();
    update(() => ({
      phase: "toss", showMatchOver: false, showInningsBreak: false,
      showChaseBar: false, showHowTo: false,
    }));
  }, [clearTimer, update]);

  const pickNum = useCallback((n: number) => {
    const s = gsRef.current;
    if (s.phase !== "playing") return;
    clearTimer();
    update(() => ({ phase: "revealing" }));

    const newUserHistory = [...s.userHistory, n];
    const cpu = cpuPick(s.diff, newUserHistory);
    const newCpuHistory = [...s.cpuHistory, cpu];

    update(() => ({
      youEmoji: HAND_EMOJI[n], youNum: n, youGlow: false, youSlam: true,
      cpuEmoji: "✊", cpuNum: "?",
      youResult: "", cpuResult: "",
      userHistory: newUserHistory, cpuHistory: newCpuHistory,
    }));

    setTimeout(() => {
      sndReveal(s.muted);
      const isOut = n === cpu;
      const newBalls = s.balls + 1;

      let newScore = s.score;
      let newWickets = s.wickets;
      let newStreak = s.streak;
      let newBest = s.best;
      const newBallRecord: BallRecord[] = [...s.ballRecord];
      let newMsg = "";
      let newYouResult = "";
      let newCpuResult = "";
      let newYouEmoji = HAND_EMOJI[n];
      let newCpuEmoji = HAND_EMOJI_CPU[cpu];

      if (isOut) {
        newWickets++;
        newBallRecord.push("W");
        newStreak = 0;
        newYouEmoji = s.userBatting ? "😱" : "🎉";
        newCpuEmoji = s.userBatting ? "🎉" : "😱";
        newYouResult = s.userBatting ? "OUT!" : "WICKET!";
        newCpuResult = s.userBatting ? "GOT EM!" : "OUT!";
        sndOut(s.muted);
        spawnP(window.innerWidth / 2, window.innerHeight * 0.4, 18, ["#e8185a", "#f472b6", "#fff"], true);
        newMsg = s.userBatting
          ? `OUT! Both showed ${HAND_EMOJI[n]} ${n}. ${newWickets < s.maxWkts ? "Keep going!" : "Innings over!"}`
          : `WICKET! Both showed ${HAND_EMOJI[n]} ${n}. ${newWickets < s.maxWkts ? "Bowl on!" : "Innings over!"}`;
      } else {
        const runs = s.userBatting ? n : cpu;
        newScore += runs;
        if (s.userBatting && newScore > s.best) newBest = newScore;
        newBallRecord.push(runs);
        if (s.userBatting) {
          newStreak++;
        } else {
          newStreak = 0;
        }
        newYouResult = s.userBatting ? `+${runs}` : "";
        newCpuResult = s.userBatting ? "" : `+${runs}`;
        sndRun(runs, s.muted);
        if (runs === 6) spawnP(window.innerWidth / 2, window.innerHeight * 0.38, 36, ["#e8185a", "#f59e0b", "#fff", "#fca5a5"], true);
        else if (runs === 4) spawnP(window.innerWidth / 2, window.innerHeight * 0.38, 22, ["#93c5fd", "#60a5fa", "#fff"], false);
        newMsg = s.userBatting
          ? (runs === 6 ? `SIX! 🏏 You ${HAND_EMOJI[n]} · CPU ${HAND_EMOJI_CPU[cpu]} — MAXIMUM!`
            : runs === 4 ? `FOUR! You ${HAND_EMOJI[n]} · CPU ${HAND_EMOJI_CPU[cpu]} — Cracking shot!`
              : `${runs} run${runs > 1 ? "s" : ""}! You ${HAND_EMOJI[n]} · CPU ${HAND_EMOJI_CPU[cpu]}`)
          : `CPU scores ${runs}! You ${HAND_EMOJI[n]} · CPU ${HAND_EMOJI_CPU[cpu]}. Bowl tight!`;
      }

      const showStreak = s.userBatting && newStreak >= 3 && !isOut;
      const over = (newBalls >= s.maxBalls || newWickets >= s.maxWkts);
      const chased = (s.innings === 2 && newScore >= s.target);

      update(() => ({
        cpuEmoji: newCpuEmoji, cpuNum: cpu, cpuSlam: true, youSlam: false,
        youEmoji: newYouEmoji,
        score: newScore, balls: newBalls, wickets: newWickets, streak: newStreak, best: newBest,
        ballRecord: newBallRecord,
        youResult: newYouResult, cpuResult: newCpuResult, msg: newMsg,
        showStreakBadge: showStreak, streakText: showStreak ? `🔥 ${newStreak} IN A ROW!` : "",
      }));

      setTimeout(() => {
        if (chased || over) {
          if (s.innings === 1) {
            triggerEndInn1(newScore, newBalls, newWickets, newScore + 1, s.userBatting, s.userBatsInInnings1, newBallRecord, newUserHistory, newCpuHistory, newBest, s.muted);
          } else {
            triggerEndMatch(s.userBatsInInnings1, newScore, s.inn1Score, s.target, newBest, s.muted);
          }
        } else {
          update(() => ({
            phase: "playing", youEmoji: "✊", youNum: "?", cpuEmoji: "✊", cpuNum: "?",
            youResult: "", cpuResult: "", youGlow: true, cpuGlow: true, cpuSlam: false,
          }));
          startTimerFn();
        }
      }, 1300);
    }, 600);
  }, [clearTimer, update, startTimerFn]);

  const startSecondInnings = useCallback(() => {
    const s = gsRef.current;
    update(() => ({
      showInningsBreak: false, innings: 2, userBatting: !s.userBatsInInnings1,
      score: 0, balls: 0, wickets: 0, ballRecord: [], streak: 0,
      cpuHistory: [], userHistory: [],
      showChaseBar: true,
      phase: "playing",
      youEmoji: "✊", youNum: "?", cpuEmoji: "✊", cpuNum: "?",
      youResult: "", cpuResult: "", youGlow: true, cpuGlow: true,
      showStreakBadge: false, streakText: "",
      msg: !s.userBatsInInnings1 ? `Chase ${s.target}! Pick big, avoid matches. Go! 🏏` : `Defend! CPU needs ${s.target}. Match their picks! 🎯`,
    }));
    setTimeout(() => startTimerFn(), 50);
  }, [update, startTimerFn]);

  const restartSameSetup = useCallback(() => {
    update(() => ({ showMatchOver: false }));
    startGame(gsRef.current.userBatsInInnings1 ? "bat" : "bowl");
  }, [update, startGame]);

  // ── Pill selector ─────────────────────────────────────────────────────────
  const setDiff = (d: Difficulty) => update(() => ({ diff: d }));
  const setFmt = (b: number, w: number) => update(() => ({ maxBalls: b, maxWkts: w }));

  // ── Derived display ───────────────────────────────────────────────────────
  const s = gs;
  const inningsBadge = `${s.innings === 1 ? "1ST" : "2ND"} INNINGS · ${s.userBatting ? "BAT" : "BOWL"}`;
  const timerArcOffset = ARC_FULL * (1 - Math.max(0, s.timerSecs / TIMER_SECS));
  const timerColor = s.timerUrgent ? "#ef4444" : s.timerWarning ? "#f59e0b" : "#22c55e";
  const chaseNeed = Math.max(0, s.target - s.score);
  const chaseLeft = s.maxBalls - s.balls;
  const chaseRR = chaseLeft > 0 ? (chaseNeed / chaseLeft * 6).toFixed(1) : "∞";
  const chaseFillPct = s.target ? Math.min(1, s.score / s.target) * 100 : 0;

  const pillStyle = (active: boolean): React.CSSProperties => ({
    flex: 1, padding: "10px 4px", borderRadius: 10, cursor: "pointer",
    textAlign: "center", fontFamily: "'Bebas Neue', sans-serif", fontSize: 15, letterSpacing: 1,
    lineHeight: 1.3, border: `1.5px solid ${active ? "#f5490a" : "#1e293b"}`,
    background: active ? "rgba(245,73,10,0.12)" : "#0d1324",
    color: active ? "#fb923c" : "#475569", transition: "all .18s",
  });

  const isPlaying = s.phase === "playing";
  const isRevealing = s.phase === "revealing";

  return (
    <div className="hand-cricket-container" style={{ background: "#060912", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", fontFamily: "'Rajdhani', sans-serif", color: "#f8fafc", overflowX: "hidden", userSelect: "none" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Rajdhani:wght@500;600;700&display=swap');
        .hand-cricket-container { box-sizing: border-box; }
        .hand-cricket-container * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
        @keyframes handSlam { 0%{transform:scale(0.2) rotate(-25deg)} 55%{transform:scale(1.25) rotate(5deg)} 80%{transform:scale(0.95)} 100%{transform:scale(1) rotate(0deg)} }
        @keyframes handWait { 0%{transform:translateY(0) scale(1)} 40%{transform:translateY(-6px) scale(1.05)} 100%{transform:translateY(0) scale(1)} }
        @keyframes youGlow { 0%,100%{box-shadow:0 0 8px rgba(232,24,90,.35)} 50%{box-shadow:0 0 22px rgba(232,24,90,.75),0 0 40px rgba(232,24,90,.25)} }
        @keyframes cpuGlow { 0%,100%{box-shadow:0 0 8px rgba(59,130,246,.35)} 50%{box-shadow:0 0 22px rgba(59,130,246,.75),0 0 40px rgba(59,130,246,.25)} }
        @keyframes bbPulse { from{box-shadow:0 0 4px rgba(232,24,90,.4)} to{box-shadow:0 0 16px rgba(232,24,90,.7)} }
        @keyframes timerShake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-2px)} 75%{transform:translateX(2px)} }
        @keyframes btnUrgent { 0%,100%{box-shadow:none} 50%{box-shadow:0 0 18px rgba(239,68,68,0.5)} }
        @keyframes modalIn { 0%{opacity:0;transform:scale(.92) translateY(12px)} 100%{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes floatUp { 0%{opacity:1;transform:translateX(-50%) translateY(0) scale(1)} 100%{opacity:0;transform:translateX(-50%) translateY(-70px) scale(1.3)} }
        .hand-cricket-container .you-glow { animation: youGlow 1.5s ease-in-out infinite !important; }
        .hand-cricket-container .cpu-glow { animation: cpuGlow 1.5s ease-in-out infinite !important; }
        .hand-cricket-container .you-slam .hand-emoji-inner { animation: handSlam .4s cubic-bezier(0.34,1.56,0.64,1) forwards; }
        .hand-cricket-container .cpu-slam .hand-emoji-inner { animation: handSlam .4s cubic-bezier(0.34,1.56,0.64,1) forwards; }
        .hand-cricket-container .num-btn:hover { transform: translateY(-4px); }
        .hand-cricket-container .num-btn:active { transform: scale(.86) !important; }
        .hand-cricket-container .num-btn:disabled { opacity: .25; cursor: not-allowed; }
        .hand-cricket-container .num-btn:hover .btn-emoji-inner { transform: scale(1.2) rotate(-8deg); }
        .hand-cricket-container .num-btn.urgent-flash { animation: btnUrgent .35s ease-in-out infinite; }
        .hand-cricket-container .pill-btn:hover { border-color: #f5490a !important; color: #f8fafc !important; background: rgba(245,73,10,0.08) !important; }
        .hand-cricket-container .tcard:hover { transform: translateY(-4px); }
        .hand-cricket-container .tcard:active { transform: scale(.97); }
        .hand-cricket-container .mo-btn:active { transform: scale(.95); }
        .hand-cricket-container .modal-card { animation: modalIn .28s cubic-bezier(0.34,1.10,0.64,1); }
      `}</style>

      {/* Particles Canvas */}
      <canvas ref={pCanvasRef} style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 300, width: "100%", height: "100%" }} />

      {/* ── Header ── */}
      <div style={{ width: "100%", maxWidth: 500, padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 10, borderBottom: "1px solid #1e2d45" }}>
        <button onClick={() => {
          stopGameLoops();
          const resetState = initialState();
          gsRef.current = resetState;
          setGs(resetState);
          router.push('/MainModules/Fantasy?tab=fantasy');
        }}
          style={{ background: "#0d1324", border: "1px solid #1e293b", color: "#94a3b8", borderRadius: 9, padding: "6px 10px", fontSize: 11, letterSpacing: 2, cursor: "pointer", transition: "transform 0.1s, opacity 0.1s", flexShrink: 0 }}
          onMouseDown={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.97)"; (e.currentTarget as HTMLButtonElement).style.opacity = "0.8"; }}
          onMouseUp={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = ""; (e.currentTarget as HTMLButtonElement).style.opacity = ""; }}
        >
          ← BACK
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, justifyContent: "center" }}>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 16, letterSpacing: 2, lineHeight: 1 }}>
            <span style={{ background: "linear-gradient(135deg,#e8185a,#f5490a,#f59e0b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>HAND CRICKET</span>
            <span style={{ display: "block", fontFamily: "'Rajdhani', sans-serif", fontSize: 9, letterSpacing: 3, color: "#94a3b8", fontWeight: 600, marginTop: 1 }}>SPORTSFAN360.COM</span>
          </div>
        </div>
        <button onClick={() => update(s => ({ showHowTo: !s.showHowTo }))}
          style={{ background: "#1a2236", border: "1px solid #2a3a55", color: "#cbd5e1", fontFamily: "'Rajdhani', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: 1, padding: "7px 12px", borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
          ✋ HOW TO PLAY
        </button>
      </div>

      {/* ════════════════════════════════════
          TOSS SCREEN
      ════════════════════════════════════ */}
      {s.phase === "toss" && (
        <div style={{ width: "100%", maxWidth: 500, display: "flex", flexDirection: "column", alignItems: "center", padding: "18px 16px 32px", gap: 18, zIndex: 1 }}>
          <div style={{ textAlign: "center", width: "100%" }}>
            <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 56, letterSpacing: 6, lineHeight: 1, background: "linear-gradient(135deg,#e8185a,#f5490a,#f59e0b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>HAND CRICKET</h1>
            <div style={{ fontSize: 13, color: "#94a3b8", letterSpacing: 3, fontWeight: 600, textTransform: "uppercase", marginTop: 5 }}>The Classic Finger Showdown</div>
          </div>

          <canvas ref={heroCanvasRef} width={400} height={100} style={{ display: "block", width: "100%", maxWidth: 320, height: 110 }} />

          <div style={{ fontSize: 11, color: "#94a3b8", letterSpacing: 4, fontWeight: 700, textTransform: "uppercase", width: "100%" }}>CHOOSE YOUR ROLE</div>

          <div style={{ display: "flex", gap: 12, width: "100%" }}>
            {[
              { role: "bat" as const, icon: "🏏", title: "BAT FIRST", desc: "Score big, then defend. Set the target for CPU to chase!", badge: "SET TARGET", borderColor: "rgba(232,24,90,0.45)", hoverBg: "rgba(232,24,90,0.07)", hoverShadow: "0 8px 32px rgba(232,24,90,0.18)", titleGrad: true, badgeBg: "rgba(232,24,90,0.2)", badgeColor: "#fb7185", badgeBorder: "rgba(232,24,90,0.35)" },
              { role: "bowl" as const, icon: "🎯", title: "BOWL FIRST", desc: "Restrict the CPU, then chase their total to win!", badge: "CHASE TARGET", borderColor: "rgba(59,130,246,0.45)", hoverBg: "rgba(59,130,246,0.07)", hoverShadow: "0 8px 32px rgba(59,130,246,0.18)", titleGrad: false, badgeBg: "rgba(59,130,246,0.2)", badgeColor: "#93c5fd", badgeBorder: "rgba(59,130,246,0.35)" },
            ].map(card => (
              <div key={card.role} className="tcard"
                onClick={() => startGame(card.role)}
                style={{ flex: 1, background: "#111827", border: `1.5px solid ${card.borderColor}`, borderRadius: 18, padding: "22px 14px", textAlign: "center", cursor: "pointer", transition: "all .2s", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 10, right: 10, fontSize: 8, letterSpacing: 1, fontWeight: 700, padding: "3px 8px", borderRadius: 5, background: card.badgeBg, color: card.badgeColor, border: `1px solid ${card.badgeBorder}` }}>{card.badge}</div>
                <div style={{ fontSize: 40, marginBottom: 10, lineHeight: 1 }}>{card.icon}</div>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, letterSpacing: 2, lineHeight: 1, marginBottom: 7, ...(card.titleGrad ? { background: "linear-gradient(135deg,#e8185a,#f5490a,#f59e0b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" } : { color: "#60a5fa" }) }}>{card.title}</div>
                <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.7, fontWeight: 600 }}>{card.desc}</div>
              </div>
            ))}
          </div>

          {/* Difficulty */}
          <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 9 }}>
            <div style={{ fontSize: 10, color: "#94a3b8", letterSpacing: 3, fontWeight: 700, textTransform: "uppercase" }}>CPU Difficulty</div>
            <div style={{ display: "flex", gap: 7 }}>
              {(["easy", "medium", "hard"] as Difficulty[]).map(d => (
                <button key={d} className="pill-btn" onClick={() => setDiff(d)} style={pillStyle(s.diff === d)}>
                  {d.toUpperCase()}
                  <span style={{ display: "block", fontFamily: "'Rajdhani', sans-serif", fontSize: 9, fontWeight: 600, letterSpacing: 1, color: s.diff === d ? "#fb923c" : "#64748b", marginTop: 3 }}>
                    {d === "easy" ? "Random CPU" : d === "medium" ? "Pattern CPU" : "Adaptive CPU"}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Format */}
          <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 9 }}>
            <div style={{ fontSize: 10, color: "#94a3b8", letterSpacing: 3, fontWeight: 700, textTransform: "uppercase" }}>Match Format</div>
            <div style={{ display: "flex", gap: 7 }}>
              {[{ b: 6, w: 1, label: "T6", sub: "6 balls · 1 wkt" }, { b: 12, w: 2, label: "T12", sub: "12 balls · 2 wkts" }, { b: 18, w: 3, label: "T18", sub: "18 balls · 3 wkts" }].map(f => (
                <button key={f.b} className="pill-btn" onClick={() => setFmt(f.b, f.w)} style={pillStyle(s.maxBalls === f.b)}>
                  {f.label}
                  <span style={{ display: "block", fontFamily: "'Rajdhani', sans-serif", fontSize: 9, fontWeight: 600, letterSpacing: 1, color: s.maxBalls === f.b ? "#fb923c" : "#64748b", marginTop: 3 }}>{f.sub}</span>
                </button>
              ))}
            </div>
          </div>

          <button onClick={() => update(() => ({ showHowTo: true }))}
            style={{ width: "100%", padding: 13, background: "#1a2236", border: "1.5px solid #2a3a55", borderRadius: 12, color: "#cbd5e1", fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: 2, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all .18s" }}>
            📖 HOW TO PLAY
          </button>

          <div style={{ fontSize: 10, color: "#64748b", letterSpacing: 2, textAlign: "center" }}>
            <a href="https://sportsfan360.com" target="_blank" rel="noreferrer" style={{ color: "#f5490a", textDecoration: "none", fontWeight: 700 }}>sportsfan360.com</a> — Hand Cricket v2
          </div>
        </div>
      )}

      {/* ════════════════════════════════════
          GAME SCREEN
      ════════════════════════════════════ */}
      {s.phase !== "toss" && (
        <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", zIndex: 1 }}>
          {/* Game Header */}
          <div style={{ width: "100%", maxWidth: 500, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 16px" }}>
            <div style={{
              fontSize: 10, fontWeight: 700, letterSpacing: 2, padding: "6px 14px", borderRadius: 8,
              ...(s.userBatting
                ? { background: "rgba(232,24,90,0.18)", color: "#fb7185", border: "1px solid rgba(232,24,90,0.4)" }
                : { background: "rgba(59,130,246,0.18)", color: "#93c5fd", border: "1px solid rgba(59,130,246,0.4)" })
            }}>{inningsBadge}</div>

            {/* Timer */}
            <div style={{ position: "relative", width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, animation: s.timerUrgent ? "timerShake .12s ease-in-out infinite" : "none" }}>
              <svg viewBox="0 0 44 44" width="44" height="44" style={{ position: "absolute", inset: 0 }}>
                <circle cx="22" cy="22" r="18" fill="none" stroke="#1e2d45" strokeWidth="3" />
                <circle cx="22" cy="22" r="18" fill="none" stroke={timerColor} strokeWidth="3"
                  strokeDasharray={ARC_FULL} strokeDashoffset={timerArcOffset}
                  strokeLinecap="round" transform="rotate(-90 22 22)" style={{ transition: "stroke .4s" }} />
              </svg>
              <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, lineHeight: 1, position: "relative", zIndex: 1, color: timerColor, transition: "color .3s" }}>
                {Math.max(0, Math.ceil(s.timerSecs))}
              </span>
            </div>
          </div>

          <div style={{ width: "100%", maxWidth: 500, height: 2, background: "linear-gradient(90deg,#e8185a,#f59e0b)", opacity: 0.5 }} />

          {/* Chase Bar */}
          {s.showChaseBar && (
            <div style={{ width: "calc(100% - 20px)", maxWidth: 480, background: "#111827", border: "1px solid #1e2d45", borderRadius: 10, padding: "10px 16px", margin: "8px 0 2px", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${chaseFillPct}%`, background: "linear-gradient(90deg,#1e3a8a,#3b82f6)", borderRadius: 10, transition: "width .5s", opacity: 0.4 }} />
              <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 14, letterSpacing: 1, color: "#93c5fd" }}>TARGET: {s.target}</div>
                <div style={{ fontSize: 12, color: "#7dd3fc", fontWeight: 700, letterSpacing: 1 }}>NEED {chaseNeed} FROM {chaseLeft}</div>
                <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>RR: {chaseRR}</div>
              </div>
            </div>
          )}

          {/* Scoreboard */}
          <div style={{ width: "100%", maxWidth: 500, display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 6, padding: "8px 10px 6px" }}>
            {[
              { v: s.score, l: "SCORE" },
              { v: `${s.balls}/${s.maxBalls}`, l: "BALLS" },
              { v: `${s.wickets}/${s.maxWkts}`, l: "WICKETS" },
              { v: s.innings === 1 ? s.best : s.target, l: s.innings === 1 ? "BEST" : "TARGET" },
            ].map((item, i) => (
              <div key={i} style={{ background: "#111827", border: "1px solid #1e2d45", borderRadius: 12, padding: "10px 4px 8px", textAlign: "center" }}>
                <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 30, letterSpacing: 1, display: "block", lineHeight: 1, color: "#f8fafc" }}>{item.v}</span>
                <span style={{ fontSize: 9, color: "#94a3b8", letterSpacing: 2, fontWeight: 700, marginTop: 2, display: "block" }}>{item.l}</span>
              </div>
            ))}
          </div>

          {/* Versus Row */}
          <div style={{ width: "calc(100% - 20px)", maxWidth: 480, display: "flex", alignItems: "stretch", border: "1px solid #1e2d45", borderRadius: 18, overflow: "hidden", background: "#111827", margin: "4px 0" }}>
            {/* YOU side */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "14px 8px 12px", background: "linear-gradient(135deg,rgba(232,24,90,0.08),transparent)" }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 3, marginBottom: 10, textTransform: "uppercase", color: "#fb7185" }}>YOU · {s.userBatting ? "BAT" : "BOWL"}</div>
              <div className={`${s.youGlow ? "you-glow" : ""} ${s.youSlam ? "you-slam" : ""}`}
                style={{ width: 100, height: 100, borderRadius: 22, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: "2px solid rgba(232,24,90,0.7)", background: "rgba(232,24,90,0.1)", gap: 4 }}>
                <span className="hand-emoji-inner" style={{ fontSize: 54, lineHeight: 1, display: "block", transformOrigin: "center bottom" }}>{s.youEmoji}</span>
                <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 12, letterSpacing: 2, fontWeight: 700, color: "#fb7185" }}>{s.youNum}</span>
              </div>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 15, letterSpacing: 2, marginTop: 8, minHeight: 20, color: "#fb7185" }}>{s.youResult}</div>
            </div>

            <div style={{ width: 1, background: "#2a3a55", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
              <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 11, color: "#94a3b8", writingMode: "vertical-rl", letterSpacing: 3, background: "#111827", padding: "10px 4px" }}>VS</span>
            </div>

            {/* CPU side */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "14px 8px 12px", background: "linear-gradient(225deg,rgba(59,130,246,0.08),transparent)" }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 3, marginBottom: 10, textTransform: "uppercase", color: "#7dd3fc" }}>CPU · {s.userBatting ? "BOWL" : "BAT"}</div>
              <div className={`${s.cpuGlow ? "cpu-glow" : ""} ${s.cpuSlam ? "cpu-slam" : ""}`}
                style={{ width: 100, height: 100, borderRadius: 22, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: "2px solid rgba(59,130,246,0.7)", background: "rgba(59,130,246,0.1)", gap: 4 }}>
                <span className="hand-emoji-inner" style={{ fontSize: 54, lineHeight: 1, display: "block", transformOrigin: "center bottom" }}>{s.cpuEmoji}</span>
                <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 12, letterSpacing: 2, fontWeight: 700, color: "#7dd3fc" }}>{s.cpuNum}</span>
              </div>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 15, letterSpacing: 2, marginTop: 8, minHeight: 20, color: "#7dd3fc" }}>{s.cpuResult}</div>
            </div>
          </div>

          {/* Streak Badge */}
          {s.showStreakBadge && (
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 14, letterSpacing: 1, background: "rgba(232,24,90,0.15)", border: "1px solid rgba(232,24,90,0.5)", color: "#fb7185", padding: "4px 14px", borderRadius: 8, margin: "3px auto" }}>
              {s.streakText}
            </div>
          )}

          {/* Number Buttons */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 8, padding: "8px 10px", width: "100%", maxWidth: 500 }}>
            {[1, 2, 3, 4, 5, 6].map(n => (
              <button key={n} className={`num-btn ${(s.timerUrgent && isPlaying) ? "urgent-flash" : ""}`}
                disabled={!isPlaying}
                onClick={() => pickNum(n)}
                style={{ aspectRatio: "1", border: "none", borderRadius: 13, cursor: "pointer", transition: "transform .12s, box-shadow .15s", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, padding: "4px 2px", ...BTN_STYLES[n] }}>
                <span className="btn-emoji-inner" style={{ fontSize: 24, lineHeight: 1, display: "block", transition: "transform .15s" }}>{HAND_EMOJI[n]}</span>
                <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 14, letterSpacing: 1, display: "block", lineHeight: 1 }}>{n}</span>
              </button>
            ))}
          </div>

          {/* Ball Tracker */}
          <div style={{ width: "100%", maxWidth: 500, padding: "6px 10px 4px", display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ fontSize: 9, color: "#94a3b8", letterSpacing: 2, fontWeight: 700, whiteSpace: "nowrap" }}>SCORECARD</div>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap", flex: 1 }}>
              {Array.from({ length: s.maxBalls }).map((_, i) => {
                const v = s.ballRecord[i];
                const isNow = i === s.ballRecord.length;
                const style: React.CSSProperties = {
                  width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 10, fontWeight: 700, fontFamily: "'Bebas Neue', sans-serif", transition: "all .25s",
                  ...(v !== undefined ? (BB_STYLES[v] || { background: "#111827", color: "#64748b", border: "1.5px solid #1e2d45" })
                    : isNow ? { background: "rgba(232,24,90,0.12)", border: "1.5px solid #f5490a", animation: "bbPulse .8s infinite alternate", color: "#f5490a" }
                      : { background: "#111827", color: "#64748b", border: "1.5px solid #1e2d45" }),
                };
                return (
                  <div key={i} style={style}>
                    {v !== undefined ? (v === "W" ? "W" : v === 0 ? "⏰" : v) : ""}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Message */}
          <div style={{ width: "100%", maxWidth: 500, padding: "5px 16px", textAlign: "center", minHeight: 28 }}>
            <div style={{ fontSize: 14, color: "#cbd5e1", letterSpacing: 0.3, fontWeight: 600, lineHeight: 1.5 }}>{s.msg}</div>
          </div>

          {/* Bottom Buttons */}
          <div style={{ display: "flex", gap: 8, padding: "6px 10px 8px", width: "100%", maxWidth: 500 }}>
            <button onClick={restartSameSetup} style={{ flex: 1, padding: "11px 0", border: "none", borderRadius: 11, background: "linear-gradient(90deg,#e8185a,#f59e0b)", color: "#fff", fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: 2, cursor: "pointer", transition: "opacity .1s" }}>↺ RESTART</button>
            <button onClick={goToss} style={{ flex: 1, padding: "11px 0", border: "1px solid #2a3a55", borderRadius: 11, background: "#1a2236", color: "#94a3b8", fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: 2, cursor: "pointer", transition: "opacity .1s" }}>⇄ NEW MATCH</button>
            <button onClick={() => update(s => ({ muted: !s.muted }))}
              style={{ flex: 1, padding: "11px 0", border: `1px solid ${s.muted ? "rgba(232,24,90,0.5)" : "#2a3a55"}`, borderRadius: 11, background: s.muted ? "#1f0810" : "#1a2236", color: s.muted ? "#fda4af" : "#94a3b8", fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: 2, cursor: "pointer" }}>
              {s.muted ? "🔇 MUTED" : "🔊 SOUND"}
            </button>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════
          HOW TO PLAY MODAL
      ════════════════════════════════════ */}
      {s.showHowTo && (
        <div style={{ display: "flex", position: "fixed", inset: 0, zIndex: 600, alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div onClick={() => update(() => ({ showHowTo: false }))} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.82)", backdropFilter: "blur(6px)" }} />
          <div className="modal-card" style={{ position: "relative", background: "#0c1120", borderRadius: 24, padding: "28px 24px 24px", width: "100%", maxWidth: 460, maxHeight: "90vh", overflowY: "auto", border: "1px solid #2a3a55", boxShadow: "0 0 60px rgba(0,0,0,.6)" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg,#e8185a,#f59e0b)", borderRadius: "24px 24px 0 0" }} />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
              <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, letterSpacing: 4, background: "linear-gradient(135deg,#e8185a,#f5490a,#f59e0b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>✋ HOW TO PLAY</h2>
              <button onClick={() => update(() => ({ showHowTo: false }))} style={{ background: "#1a2236", border: "1px solid #2a3a55", color: "#cbd5e1", width: 34, height: 34, borderRadius: "50%", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
            </div>
            {[
              { num: "☝️", title: "PICK A HAND (1–6)", body: "Each ball, you and CPU secretly pick a number 1–6 at the same time. Your chosen hand gesture reveals instantly!" },
              { num: "💥", title: "SAME HAND = WICKET!", body: "If both show the same number — the batting side loses a wicket. Every single ball is a mind-game!" },
              { num: "✅", title: "DIFFERENT = RUNS SCORED", body: "Different numbers? Batting side scores that many runs. Pick high for big runs — but the risk of a wicket goes up!" },
              { num: "🏏", title: "WHEN YOU'RE BATTING", body: "You score your number. Pick high to score fast. Avoid matching CPU — that's your wicket gone!" },
              { num: "🎯", title: "WHEN YOU'RE BOWLING", body: "CPU scores its number. Your job is to match CPU's pick to take a wicket. Read their pattern on Hard mode!" },
              { num: "🏆", title: "TWO INNINGS · MOST RUNS WINS", body: "You bat and bowl one innings each. After both innings, whoever scored more runs takes the match!" },
              { num: "🧠", title: "CPU DIFFICULTY", body: "Easy — pure random picks. Medium — tracks your favourite number. Hard — adaptive AI, weighs your last 8 picks." },
            ].map((rule, i, arr) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "13px 0", borderBottom: i < arr.length - 1 ? "1px solid #1e2d45" : "none" }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Bebas Neue', sans-serif", fontSize: 17, flexShrink: 0, background: "linear-gradient(135deg,#e8185a,#f5490a,#f59e0b)", color: "#fff" }}>{rule.num}</div>
                <div style={{ flex: 1, paddingTop: 2 }}>
                  <strong style={{ display: "block", fontFamily: "'Bebas Neue', sans-serif", fontSize: 16, letterSpacing: 1.5, color: "#f8fafc", marginBottom: 3 }}>{rule.title}</strong>
                  <span style={{ fontSize: 13, color: "#cbd5e1", lineHeight: 1.7, fontWeight: 500, display: "block" }}>{rule.body}</span>
                </div>
              </div>
            ))}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 18, padding: 16, background: "#111827", borderRadius: 12, border: "1px solid #1e2d45" }}>
              <div style={{ fontSize: 10, color: "#94a3b8", letterSpacing: 3, fontWeight: 700, textTransform: "uppercase", width: "100%", marginBottom: 4 }}>SCORECARD COLOUR GUIDE</div>
              {[1, 2, 3, 4, 5, 6].map(n => (
                <div key={n} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#cbd5e1", fontWeight: 600 }}>
                  <div style={{ width: 24, height: 24, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontFamily: "'Bebas Neue', sans-serif", flexShrink: 0, ...(BB_STYLES[n] as React.CSSProperties) }}>{n}</div>
                  {n} run{n > 1 ? "s" : ""} — {HAND_EMOJI[n]}
                </div>
              ))}
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#cbd5e1", fontWeight: 600 }}>
                <div style={{ width: 24, height: 24, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontFamily: "'Bebas Neue', sans-serif", flexShrink: 0, ...(BB_STYLES["W"] as React.CSSProperties) }}>W</div>
                Wicket!
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════
          INNINGS BREAK MODAL
      ════════════════════════════════════ */}
      {s.showInningsBreak && (
        <div style={{ display: "flex", position: "fixed", inset: 0, zIndex: 150, alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,.88)", backdropFilter: "blur(6px)", padding: 16 }}>
          <div className="modal-card" style={{ background: "#0c1120", borderRadius: 24, padding: "32px 36px", textAlign: "center", border: "1px solid #2a3a55", width: "100%", maxWidth: 340, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg,#e8185a,#f59e0b)" }} />
            <div style={{ fontSize: 48, marginBottom: 10, lineHeight: 1 }}>{s.inningsBreakData.emoji}</div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, letterSpacing: 4, background: "linear-gradient(135deg,#e8185a,#f5490a,#f59e0b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", marginBottom: 10 }}>INNINGS BREAK</div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 80, lineHeight: 1, color: "#f8fafc" }}>{s.inningsBreakData.score}</div>
            <div style={{ fontSize: 13, color: "#94a3b8", letterSpacing: 1, margin: "6px 0 4px", fontWeight: 600 }}>{s.inningsBreakData.sub}</div>
            <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: 0.5, marginBottom: 20, color: "#cbd5e1", lineHeight: 1.6 }}>{s.inningsBreakData.msg}</div>
            <button onClick={startSecondInnings} style={{ padding: "14px 36px", border: "none", borderRadius: 12, background: "linear-gradient(90deg,#e8185a,#f59e0b)", color: "#fff", fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 14, letterSpacing: 3, cursor: "pointer" }}>
              START 2ND INNINGS ▶
            </button>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════
          MATCH OVER MODAL
      ════════════════════════════════════ */}
      {s.showMatchOver && (
        <div style={{ display: "flex", position: "fixed", inset: 0, zIndex: 200, alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,.92)", backdropFilter: "blur(8px)", padding: 16 }}>
          <div className="modal-card" style={{ background: "#0c1120", borderRadius: 24, padding: "28px 32px", textAlign: "center", border: "1px solid #2a3a55", position: "relative", overflow: "hidden", width: "100%", maxWidth: 360 }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg,#e8185a,#f59e0b)" }} />
            <div style={{ fontSize: 10, letterSpacing: 4, color: "#94a3b8", fontWeight: 700, marginBottom: 5 }}>MATCH OVER · SPORTSFAN360.COM</div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 42, letterSpacing: 4, lineHeight: 1, marginBottom: 4, color: s.matchOverData.color }}>{s.matchOverData.result}</div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 80, lineHeight: 1, color: "#f8fafc" }}>{s.matchOverData.score}</div>
            <div style={{ fontSize: 13, color: "#94a3b8", letterSpacing: 1, marginTop: 3, fontWeight: 600 }}>{s.matchOverData.sub}</div>
            {s.matchOverData.best && (
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 17, letterSpacing: 1, marginTop: 12, background: "linear-gradient(135deg,#e8185a,#f5490a,#f59e0b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>{s.matchOverData.best}</div>
            )}
            <div style={{ fontSize: 13, color: "#cbd5e1", marginTop: 8, letterSpacing: 0.3, padding: "12px 14px", background: "rgba(255,255,255,0.04)", borderRadius: 10, border: "1px solid #1e2d45", fontWeight: 600, lineHeight: 1.7 }}>{s.matchOverData.detail}</div>
            <div style={{ display: "flex", gap: 10, marginTop: 20, justifyContent: "center" }}>
              <button className="mo-btn" onClick={restartSameSetup} style={{ padding: "12px 24px", border: "none", borderRadius: 11, background: "linear-gradient(90deg,#e8185a,#f59e0b)", color: "#fff", fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: 2, cursor: "pointer" }}>PLAY AGAIN</button>
              <button className="mo-btn" onClick={goToss} style={{ padding: "12px 24px", border: "1px solid #2a3a55", borderRadius: 11, background: "#1a2236", color: "#94a3b8", fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: 2, cursor: "pointer" }}>NEW MATCH</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ padding: 8, fontSize: 10, color: "#64748b", letterSpacing: 2, zIndex: 1, position: "relative", textAlign: "center" }}>
        <a href="https://sportsfan360.com" target="_blank" rel="noreferrer" style={{ textDecoration: "none", fontWeight: 700, background: "linear-gradient(90deg,#e8185a,#f59e0b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>sportsfan360.com</a>
      </div>
    </div>
  );
}