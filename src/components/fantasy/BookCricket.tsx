"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// ── Types ────────────────────────────────────────────────────────────────────
type Phase = "cover" | "opening" | "idle" | "flipping" | "zooming" | "over";
type BallResult = number | "OUT";

interface Particle {
  x: number; y: number; vx: number; vy: number;
  life: number; ml: number; sz: number; col: string; rot: number;
}

interface ZoomData {
  bigNum: string; bigColor: string;
  label: string; labelColor: string;
  borderColor: string; pageInfo: string;
}

interface MatchOverData {
  score: number; scoreColor: string; sub: string; best: string;
}

interface GameState {
  phase: Phase;
  score: number; best: number; balls: number; wickets: number;
  ballRecord: BallResult[];
  msg: string;
  currentPage: number;
  pageNumVisible: boolean;
  showZoom: boolean; zoomData: ZoomData;
  showMatchOver: boolean; matchOverData: MatchOverData;
  showHowTo: boolean;
  // Book visual state
  coverVisible: boolean;
  bookTiltX: number; bookTiltY: number;
  pgChapter: string; pgTitle: string; pgFooter: number;
  pgLines: string[];
}

// ── Constants ────────────────────────────────────────────────────────────────
const MAX_BALLS = 12;
const MAX_WKTS = 3;
const DIGIT_MAP: Record<string, number | "OUT"> = {
  "0": "OUT", "1": 1, "2": 2, "3": 3, "4": 4,
  "5": 1, "6": 6, "7": 1, "8": 2, "9": 3,
};
const LOREM = ["the","and","of","to","in","a","that","it","he","was","for","on","are","as","with","his","they","be","at","one","have","this","from","or","had","by","but","not","what","all","were","we","when","your","can","said","there","use","an","each","which","she","do","how","their","if","will","up","about","out","many","then","them","these","so","some","her","would","make","like","into","him","has","two","more","very","after","words","called","just","where","most","know","get","through","back","much","go","good","new","write","our","me","man","too","any","day","same","right","look","think","also","around","another"];

function randomPage(): number {
  return Math.floor(Math.random() * 488) + 12;
}
function getScore(pg: number): number | "OUT" {
  return DIGIT_MAP[String(pg % 10)];
}
function makeLines(): string[] {
  const n = 13 + Math.floor(Math.random() * 4);
  return Array.from({ length: n }, (_, i) => {
    const wc = 5 + Math.floor(Math.random() * 7);
    let txt = Array.from({ length: wc }, () => LOREM[Math.floor(Math.random() * LOREM.length)]).join(" ") + " ";
    if (i === 0) txt = txt.charAt(0).toUpperCase() + txt.slice(1);
    return txt;
  });
}

// ── Audio ────────────────────────────────────────────────────────────────────
let _ac: AudioContext | null = null;
function getAC(): AudioContext {
  if (!_ac) _ac = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  return _ac;
}
function beep(f: number, type: OscillatorType, dur: number, vol: number, delay = 0) {
  try {
    const A = getAC(), o = A.createOscillator(), g = A.createGain();
    o.type = type; o.frequency.value = f;
    g.gain.setValueAtTime(0.001, A.currentTime + delay);
    g.gain.linearRampToValueAtTime(vol, A.currentTime + delay + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, A.currentTime + delay + dur);
    o.connect(g); g.connect(A.destination);
    o.start(A.currentTime + delay); o.stop(A.currentTime + delay + dur + 0.05);
  } catch {}
}
function sndPageFlip() {
  try {
    const A = getAC();
    const len = Math.ceil(A.sampleRate * 0.4);
    const buf = A.createBuffer(1, len, A.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      const env = Math.pow(Math.sin(Math.PI * i / len), 0.4) * Math.pow(1 - i / len, 0.6);
      d[i] = (Math.random() * 2 - 1) * 0.35 * env;
    }
    const src = A.createBufferSource(); src.buffer = buf;
    const bq = A.createBiquadFilter(); bq.type = "bandpass"; bq.frequency.value = 2600; bq.Q.value = 0.6;
    const bq2 = A.createBiquadFilter(); bq2.type = "highpass"; bq2.frequency.value = 800;
    const g = A.createGain(); g.gain.value = 0.55;
    src.connect(bq); bq.connect(bq2); bq2.connect(g); g.connect(A.destination); src.start();
    beep(900, "triangle", 0.05, 0.09, 0.28);
    beep(1400, "triangle", 0.03, 0.06, 0.31);
  } catch {}
}
function sndCoverOpen() { beep(350, "sine", 0.15, 0.12); beep(500, "sine", 0.1, 0.1, 0.12); }
function sndReveal() { beep(660, "sine", 0.08, 0.18); beep(990, "sine", 0.06, 0.14, 0.07); }
function sndSix() { [523, 659, 784, 1047, 1319].forEach((f, i) => beep(f, "square", 0.16, 0.08, i * 0.06)); }
function sndFour() { [440, 554, 659, 880].forEach((f, i) => beep(f, "sine", 0.2, 0.09, i * 0.07)); }
function sndOut() { [320, 280, 240, 200, 170].forEach((f, i) => beep(f, "triangle", 0.28, 0.1, i * 0.11)); }
function sndRun(r: number) { beep(r >= 3 ? 460 : 300, "sine", 0.12, 0.1); }
function sndWin() { [523, 659, 784, 1047].forEach((f, i) => beep(f, "sine", 0.2, 0.1, i * 0.1)); }

// ── Page curl geometry helpers ─────────────────────────────────────────────
interface FoldData { mx: number; my: number; fdx: number; fdy: number; fnx: number; fny: number; vx: number; vy: number; }
interface Pt { x: number; y: number; }

function calcFold(tx: number, ty: number, W: number, H: number): FoldData {
  const dx = tx - W, dy = ty - H;
  const dist = Math.sqrt(dx * dx + dy * dy) || 1;
  const vx = dx / dist, vy = dy / dist;
  const fdx = -vy, fdy = vx;
  const mx = (W + tx) / 2, my = (H + ty) / 2;
  const fnx = -vx, fny = -vy;
  return { mx, my, fdx, fdy, fnx, fny, vx, vy };
}
function foldEdges(fold: FoldData, W: number, H: number): Pt[] {
  const { mx, my, fdx, fdy } = fold; const E = 0.001;
  const pts: Pt[] = [];
  const add = (t: number) => {
    const x = mx + t * fdx, y = my + t * fdy;
    if (x >= -E && x <= W + E && y >= -E && y <= H + E)
      pts.push({ x: Math.max(0, Math.min(W, x)), y: Math.max(0, Math.min(H, y)) });
  };
  if (Math.abs(fdx) > E) { add(-mx / fdx); add((W - mx) / fdx); }
  if (Math.abs(fdy) > E) { add(-my / fdy); add((H - my) / fdy); }
  return pts
    .filter((p, i) => pts.findIndex(q => Math.abs(q.x - p.x) < 1 && Math.abs(q.y - p.y) < 1) === i)
    .slice(0, 2);
}
function reflPt(px: number, py: number, fold: FoldData): Pt {
  const { mx, my, fdx, fdy } = fold;
  const vx = px - mx, vy = py - my;
  const dot = vx * fdx + vy * fdy;
  return { x: 2 * (mx + dot * fdx) - px, y: 2 * (my + dot * fdy) - py };
}
function drawRuled(ctx: CanvasRenderingContext2D, W: number, H: number, col: string) {
  ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 0.7;
  for (let y = 12; y < H - 4; y += 11) { ctx.beginPath(); ctx.moveTo(8, y); ctx.lineTo(W - 8, y); ctx.stroke(); }
  ctx.restore();
}
function renderCurl(ctx: CanvasRenderingContext2D, W: number, H: number, tx: number, ty: number) {
  ctx.clearRect(0, 0, W, H);
  const FRONT = "#f5ead6", BACK = "#e8d8b8";
  const dist = Math.sqrt((tx - W) ** 2 + (ty - H) ** 2);
  if (dist < 3) { ctx.fillStyle = FRONT; ctx.fillRect(0, 0, W, H); drawRuled(ctx, W, H, "rgba(120,80,40,0.09)"); return; }
  const fold = calcFold(tx, ty, W, H);
  const ep = foldEdges(fold, W, H);
  if (ep.length < 2) { ctx.fillStyle = FRONT; ctx.fillRect(0, 0, W, H); drawRuled(ctx, W, H, "rgba(120,80,40,0.09)"); return; }
  ctx.fillStyle = FRONT; ctx.fillRect(0, 0, W, H);
  drawRuled(ctx, W, H, "rgba(120,80,40,0.09)");
  const shW = Math.min(34, dist * 0.22);
  const sg = ctx.createLinearGradient(ep[0].x, ep[0].y, ep[0].x + fold.vx * shW, ep[0].y + fold.vy * shW);
  sg.addColorStop(0, "rgba(0,0,0,0.26)"); sg.addColorStop(0.45, "rgba(0,0,0,0.09)"); sg.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = sg; ctx.fillRect(0, 0, W, H);
  const pageCorners: Pt[] = [{ x: 0, y: 0 }, { x: W, y: 0 }, { x: W, y: H }, { x: 0, y: H }];
  const { fnx, fny, mx, my } = fold;
  const reflected = pageCorners
    .filter(c => (c.x - mx) * fnx + (c.y - my) * fny > 0)
    .map(c => reflPt(c.x, c.y, fold));
  const poly: Pt[] = [...ep, ...reflected];
  const cx0 = poly.reduce((s, p) => s + p.x, 0) / poly.length;
  const cy0 = poly.reduce((s, p) => s + p.y, 0) / poly.length;
  poly.sort((a, b) => Math.atan2(a.y - cy0, a.x - cx0) - Math.atan2(b.y - cy0, b.x - cx0));
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(poly[0].x, poly[0].y);
  poly.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
  ctx.closePath(); ctx.clip();
  ctx.fillStyle = BACK; ctx.fill();
  drawRuled(ctx, W, H, "rgba(100,60,20,0.07)");
  const fg = ctx.createLinearGradient(ep[0].x, ep[0].y, ep[0].x + fold.fnx * 38, ep[0].y + fold.fny * 38);
  fg.addColorStop(0, "rgba(0,0,0,0.24)"); fg.addColorStop(0.55, "rgba(0,0,0,0.06)"); fg.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = fg; ctx.fillRect(0, 0, W, H);
  ctx.restore();
  ctx.beginPath(); ctx.moveTo(ep[0].x, ep[0].y); ctx.lineTo(ep[1].x, ep[1].y);
  ctx.strokeStyle = "rgba(255,225,170,0.65)"; ctx.lineWidth = 1.4; ctx.stroke();
}

// ── BB Styles ────────────────────────────────────────────────────────────────
function bbStyle(val: BallResult | undefined, isNow: boolean): React.CSSProperties {
  if (val === "OUT") return { background: "#1f0808", color: "#fca5a5", borderColor: "#dc2626" };
  if (val === 0)     return { background: "#140d06", color: "#2a1a0a", borderColor: "#1a0d06" };
  if (val === 1)     return { background: "#0c2233", color: "#67e8f9", borderColor: "#0891b2" };
  if (val === 2)     return { background: "#231505", color: "#fcd34d", borderColor: "#d97706" };
  if (val === 3)     return { background: "#180c33", color: "#c4b5fd", borderColor: "#7c3aed" };
  if (val === 4)     return { background: "#0a1533", color: "#93c5fd", borderColor: "#2563eb" };
  if (val === 6)     return { background: "#052e16", color: "#86efac", borderColor: "#16a34a" };
  if (isNow)         return { background: "#2a1500", borderColor: "#f59e0b", animation: "bbp .8s infinite alternate" };
  return { background: "#140d06", color: "#3d2c1e", borderColor: "#2a1a0a" };
}

// ── Initial state ─────────────────────────────────────────────────────────
function initState(): GameState {
  return {
    phase: "cover", score: 0, best: 0, balls: 0, wickets: 0, ballRecord: [],
    msg: "Tap the book to open it!",
    currentPage: 1, pageNumVisible: false,
    showZoom: false, zoomData: { bigNum: "—", bigColor: "#f5ead6", label: "—", labelColor: "#f59e0b", borderColor: "#f59e0b", pageInfo: "" },
    showMatchOver: false, matchOverData: { score: 0, scoreColor: "#f59e0b", sub: "", best: "" },
    showHowTo: false,
    coverVisible: true,
    bookTiltX: 12, bookTiltY: -10,
    pgChapter: "CHAPTER I", pgTitle: "BOOK CRICKET", pgFooter: 1,
    pgLines: makeLines(),
  };
}

// ── Main Component ────────────────────────────────────────────────────────
export default function BookCricket() {
  const [gs, setGs] = useState<GameState>(initState);
  const gsRef = useRef<GameState>(gs);
  gsRef.current = gs;

  const pCanvasRef   = useRef<HTMLCanvasElement>(null);
  const curlCanvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef     = useRef<HTMLDivElement>(null);
  const bookSceneRef = useRef<HTMLDivElement>(null);

  const partsRef   = useRef<Particle[]>([]);
  const phaseRef   = useRef<Phase>("cover");
  phaseRef.current = gs.phase;

  // Curl state refs (mutable, no re-render needed)
  const curlWRef   = useRef(0);
  const curlHRef   = useRef(0);
  const curlCornerRef = useRef({ x: 0, y: 0 });
  const idleRafRef = useRef<number>(0);
  const idleTRef   = useRef(0);

  // Tween refs (manual RAF tweens replacing GSAP)
  const tweenRafRef = useRef<number>(0);

  const update = useCallback((fn: (s: GameState) => Partial<GameState>) => {
    setGs(prev => ({ ...prev, ...fn(prev) }));
  }, []);

  // ── Particle canvas ────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = pCanvasRef.current;
    const stage  = stageRef.current;
    if (!canvas || !stage) return;
    const resize = () => { canvas.width = stage.offsetWidth; canvas.height = stage.offsetHeight; };
    resize();
    window.addEventListener("resize", resize);
    let raf: number;
    const tick = () => {
      const ctx = canvas.getContext("2d")!;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      partsRef.current.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.vy += 0.12; p.vx *= 0.97; p.life--;
        ctx.globalAlpha = Math.max(0, p.life / p.ml);
        ctx.fillStyle = p.col;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot + (1 - p.life / p.ml) * 6);
        ctx.fillRect(-p.sz / 2, -p.sz / 3, p.sz, p.sz * 0.6);
        ctx.restore(); ctx.globalAlpha = 1;
      });
      partsRef.current = partsRef.current.filter(p => p.life > 0);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { window.removeEventListener("resize", resize); cancelAnimationFrame(raf); };
  }, []);

  // ── Spawn helpers ──────────────────────────────────────────────────────
  const spawnParts = useCallback((x: number, y: number, n: number, cols: string[], big: boolean) => {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = big ? (3 + Math.random() * 11) : (1 + Math.random() * 5);
      partsRef.current.push({
        x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - (big ? 2.5 : 1.5),
        life: 55 + ~~(Math.random() * 55), ml: 110,
        sz: big ? (3 + Math.random() * 6) : (1 + Math.random() * 3),
        col: cols[~~(Math.random() * cols.length)], rot: Math.random() * Math.PI * 2,
      });
    }
  }, []);

  const spawnDust = useCallback((x: number, y: number) => {
    for (let i = 0; i < 14; i++) {
      partsRef.current.push({
        x: x + (Math.random() * 80 - 40), y,
        vx: (Math.random() - 0.5) * 1.5, vy: -(Math.random() * 1.5 + 0.3),
        life: 45 + ~~(Math.random() * 30), ml: 75,
        sz: 1 + Math.random() * 2,
        col: `rgba(${175 + ~~(Math.random() * 40)},${150 + ~~(Math.random() * 30)},${110 + ~~(Math.random() * 30)},0.7)`,
        rot: 0,
      });
    }
  }, []);

  // ── Idle float animation ────────────────────────────────────────────────
  const startIdleFloat = useCallback(() => {
    cancelAnimationFrame(idleRafRef.current);
    idleTRef.current = 0;
    const tick = (ts: number) => {
      if (idleTRef.current === 0) idleTRef.current = ts;
      const t = (ts - idleTRef.current) / 1000;
      const tiltX = 12 + Math.sin(t / 2.8) * 2;
      const tiltY = -10 + Math.sin(t / 2.3) * 2;
      update(() => ({ bookTiltX: tiltX, bookTiltY: tiltY }));
      idleRafRef.current = requestAnimationFrame(tick);
    };
    idleRafRef.current = requestAnimationFrame(tick);
  }, [update]);

  const stopIdleFloat = useCallback(() => {
    cancelAnimationFrame(idleRafRef.current);
  }, []);

  // ── Init curl canvas ────────────────────────────────────────────────────
  const initCurl = useCallback(() => {
    const bs = bookSceneRef.current;
    const cc = curlCanvasRef.current;
    if (!bs || !cc) return;
    curlWRef.current = bs.offsetWidth - 14 - 3;
    curlHRef.current = bs.offsetHeight - 3 - 3;
    cc.width  = curlWRef.current;
    cc.height = curlHRef.current;
  }, []);

  // ── Simple tween helper (replaces GSAP) ────────────────────────────────
  function easePowerIn(t: number) { return t * t * t; }
  function easeBackOut(t: number, overshoot = 1.55) {
    const c3 = overshoot + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + overshoot * Math.pow(t - 1, 2);
  }

  const tween = useCallback((
    from: number, to: number, duration: number,
    easeFn: (t: number) => number,
    onUpdate: (v: number) => void,
    onComplete?: () => void
  ) => {
    cancelAnimationFrame(tweenRafRef.current);
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const elapsed = (ts - start) / (duration * 1000);
      const t = Math.min(1, elapsed);
      onUpdate(from + (to - from) * easeFn(t));
      if (t < 1) { tweenRafRef.current = requestAnimationFrame(step); }
      else { onComplete?.(); }
    };
    tweenRafRef.current = requestAnimationFrame(step);
  }, []);

  // ── animFlip (replaces GSAP timeline) ─────────────────────────────────
  const animFlip = useCallback((targetPg: number, done: () => void) => {
    const pCanvas = pCanvasRef.current;
    const curlCanvas = curlCanvasRef.current;
    if (!curlCanvas || !pCanvas) return;

    stopIdleFloat();
    initCurl();
    const W = curlWRef.current, H = curlHRef.current;
    curlCornerRef.current = { x: W, y: H };
    curlCanvas.style.display = "block";
    update(() => ({ bookTiltX: 5, bookTiltY: -4 }));

    sndPageFlip();
    spawnDust(pCanvas.offsetWidth / 2 + 60, pCanvas.offsetHeight / 2 - 20);

    const ctx = curlCanvas.getContext("2d")!;

    // Phase 1: corner lifts to (W*0.36, H*0.06)
    const startX = W, startY = H;
    const midX = W * 0.36, midY = H * 0.06;
    const endX = -W * 0.40, endY = H * 0.60;

    let phase1Done = false;

    cancelAnimationFrame(tweenRafRef.current);
    let start1: number | null = null;
    const step1 = (ts: number) => {
      if (!start1) start1 = ts;
      const t = Math.min(1, (ts - start1) / 300);
      const et = easePowerIn(t);
      const cx = startX + (midX - startX) * et;
      const cy = startY + (midY - startY) * et;
      renderCurl(ctx, W, H, cx, cy);
      if (t < 1) { tweenRafRef.current = requestAnimationFrame(step1); }
      else if (!phase1Done) {
        phase1Done = true;
        // Update page content mid-flip
        update(() => ({
          currentPage: targetPg, pageNumVisible: false,
          pgLines: makeLines(),
          pgChapter: `CHAPTER ${~~(targetPg / 20) + 1}`,
          pgTitle: `BALL ${gsRef.current.balls + 1} OF ${MAX_BALLS}`,
          pgFooter: targetPg,
        }));
        // Phase 2: sweep to end
        let start2: number | null = null;
        const step2 = (ts2: number) => {
          if (!start2) start2 = ts2;
          const t2 = Math.min(1, (ts2 - start2) / 460);
          const et2 = easeBackOut(t2, 1.55);
          const cx2 = midX + (endX - midX) * et2;
          const cy2 = midY + (endY - midY) * et2;
          renderCurl(ctx, W, H, cx2, cy2);
          if (t2 < 1) { tweenRafRef.current = requestAnimationFrame(step2); }
          else {
            spawnDust(pCanvas.offsetWidth / 2 - 20, pCanvas.offsetHeight / 2 + 30);
            curlCanvas.style.display = "none";
            update(() => ({ bookTiltX: 12, bookTiltY: -10 }));
            setTimeout(startIdleFloat, 50);
            done();
          }
        };
        tweenRafRef.current = requestAnimationFrame(step2);
      }
    };
    tweenRafRef.current = requestAnimationFrame(step1);
  }, [stopIdleFloat, initCurl, update, spawnDust, startIdleFloat, tween]);

  // ── Zoom reveal ────────────────────────────────────────────────────────
  const zoomReveal = useCallback((pg: number, done: () => void) => {
    const runs = getScore(pg);
    const digit = pg % 10;
    update(() => ({ currentPage: pg, pageNumVisible: true }));

    setTimeout(() => {
      sndReveal();
      const pCanvas = pCanvasRef.current;
      const cx = pCanvas ? pCanvas.offsetWidth / 2 : 200;
      const cy = pCanvas ? pCanvas.offsetHeight / 2 : 150;

      let zoomData: ZoomData;
      if (runs === "OUT") {
        zoomData = { bigNum: "0", bigColor: "#ef4444", label: "OUT! WICKET!", labelColor: "#ef4444", borderColor: "#ef4444", pageInfo: `Page ${pg}   ·   Last digit: ${digit}` };
        setTimeout(sndOut, 120);
        spawnParts(cx, cy, 35, ["#ef4444", "#b91c1c", "#fca5a5", "#fff"], false);
      } else if (runs === 6) {
        zoomData = { bigNum: "6", bigColor: "#22c55e", label: "SIX! MAXIMUM!", labelColor: "#22c55e", borderColor: "#22c55e", pageInfo: `Page ${pg}   ·   Last digit: ${digit}` };
        setTimeout(sndSix, 120);
        spawnParts(cx, cy - 30, 80, ["#fbbf24", "#fde68a", "#fff", "#22c55e", "#86efac"], true);
        spawnParts(cx - 70, cy + 30, 40, ["#fbbf24", "#fff"], true);
        spawnParts(cx + 70, cy + 30, 40, ["#22c55e", "#fde68a"], true);
      } else if (runs === 4) {
        zoomData = { bigNum: "4", bigColor: "#60a5fa", label: "FOUR! BOUNDARY!", labelColor: "#60a5fa", borderColor: "#60a5fa", pageInfo: `Page ${pg}   ·   Last digit: ${digit}` };
        setTimeout(sndFour, 120);
        spawnParts(cx, cy, 50, ["#60a5fa", "#bfdbfe", "#fff", "#93c5fd"], false);
      } else {
        zoomData = { bigNum: String(runs), bigColor: "#f5ead6", label: `${runs} RUN${(runs as number) > 1 ? "S" : ""}`, labelColor: "#f59e0b", borderColor: "#f59e0b", pageInfo: `Page ${pg}   ·   Last digit: ${digit}` };
        setTimeout(() => sndRun(runs as number), 120);
        spawnParts(cx, cy, 18, ["#f5d5a0", "#fbbf24", "#fff"], false);
      }
      update(() => ({ showZoom: true, zoomData }));

      setTimeout(() => {
        update(() => ({ showZoom: false }));
        setTimeout(done, 280);
      }, 1700);
    }, 380);
  }, [update, spawnParts]);

  // ── resolveFlip ─────────────────────────────────────────────────────────
  const resolveFlip = useCallback((pg: number) => {
    const s = gsRef.current;
    const runs = getScore(pg);
    const newBalls = s.balls + 1;
    let newScore = s.score, newWickets = s.wickets, newBest = s.best;
    const newRecord = [...s.ballRecord];
    let newMsg = "";

    if (runs === "OUT") {
      newWickets++;
      newRecord.push("OUT");
      newMsg = `Page ${pg} → digit ${pg % 10} → WICKET! ${newWickets < MAX_WKTS ? "Keep batting!" : "ALL OUT!"}`;
    } else {
      newScore += runs;
      newRecord.push(runs);
      if (newScore > newBest) newBest = newScore;
      if (runs === 6) newMsg = `Page ${pg} → digit 6 → SIX! MAXIMUM! What a shot! 🏏`;
      else if (runs === 4) newMsg = `Page ${pg} → digit 4 → FOUR! Great boundary!`;
      else newMsg = `Page ${pg} → digit ${pg % 10} → ${runs} run${runs > 1 ? "s" : ""}!`;
    }

    if (newBalls >= MAX_BALLS || newWickets >= MAX_WKTS) {
      update(() => ({ score: newScore, balls: newBalls, wickets: newWickets, best: newBest, ballRecord: newRecord, msg: newMsg }));
      setTimeout(() => {
        const pCanvas = pCanvasRef.current;
        const cx = pCanvas ? pCanvas.offsetWidth / 2 : 200;
        const cy = pCanvas ? pCanvas.offsetHeight / 2 : 150;
        const sc = gsRef.current.score;
        spawnParts(cx, cy, 90, ["#f5d5a0", "#fbbf24", "#22c55e", "#60a5fa", "#fca5a5", "#fff"], true);
        spawnParts(cx - 80, cy - 50, 40, ["#fbbf24", "#f5d5a0"], true);
        spawnParts(cx + 80, cy - 50, 40, ["#22c55e", "#86efac"], true);
        sndWin();
        const scoreColor = sc >= 30 ? "#22c55e" : sc >= 15 ? "#f59e0b" : "#ef4444";
        update(() => ({
          phase: "over",
          showMatchOver: true,
          matchOverData: { score: sc, scoreColor, sub: `RUNS IN ${MAX_BALLS} BALLS`, best: `BEST: ${newBest}` },
          msg: `Match over! You scored ${sc} runs. Best: ${newBest}!`,
        }));
      }, 500);
    } else {
      update(() => ({ score: newScore, balls: newBalls, wickets: newWickets, best: newBest, ballRecord: newRecord, msg: newMsg, phase: "idle" }));
    }
  }, [update, spawnParts]);

  // ── doFlip ─────────────────────────────────────────────────────────────
  const doFlip = useCallback(() => {
    if (gsRef.current.phase !== "idle") return;
    update(() => ({ phase: "flipping" }));
    const pg = randomPage();
    animFlip(pg, () => {
      update(() => ({ phase: "zooming" }));
      zoomReveal(pg, () => resolveFlip(pg));
    });
  }, [update, animFlip, zoomReveal, resolveFlip]);

  // ── openBook ───────────────────────────────────────────────────────────
  const openBook = useCallback(() => {
    if (gsRef.current.phase !== "cover") return;
    update(() => ({ phase: "opening" }));
    stopIdleFloat();
    sndCoverOpen();
    update(() => ({ bookTiltX: 8, bookTiltY: -14 }));
    setTimeout(() => {
      update(() => ({ coverVisible: false, bookTiltX: 12, bookTiltY: -10 }));
    }, 450);
    setTimeout(() => {
      update(() => ({
        phase: "idle", pgLines: makeLines(),
        pgChapter: "CHAPTER I", pgTitle: `BALL 1 OF ${MAX_BALLS}`, pgFooter: 1,
        msg: "Book is open! Flip the page! 📖",
      }));
      startIdleFloat();
    }, 920);
  }, [update, stopIdleFloat, startIdleFloat]);

  // ── resetGame ──────────────────────────────────────────────────────────
  const resetGame = useCallback(() => {
    cancelAnimationFrame(tweenRafRef.current);
    stopIdleFloat();
    const curlCanvas = curlCanvasRef.current;
    if (curlCanvas) curlCanvas.style.display = "none";
    update(() => ({
      phase: "cover", score: 0, balls: 0, wickets: 0, ballRecord: [],
      msg: "Tap the book to open it!", coverVisible: true,
      pageNumVisible: false, showZoom: false, showMatchOver: false,
      bookTiltX: 12, bookTiltY: -10,
      pgLines: makeLines(), pgChapter: "CHAPTER I", pgTitle: "BOOK CRICKET", pgFooter: 1,
    }));
    setTimeout(startIdleFloat, 100);
  }, [update, stopIdleFloat, startIdleFloat]);

  // ── Start idle float on mount ──────────────────────────────────────────
  useEffect(() => {
    startIdleFloat();
    return () => stopIdleFloat();
  }, [startIdleFloat, stopIdleFloat]);

  // ── Drag curl ──────────────────────────────────────────────────────────
  useEffect(() => {
    const bsEl = bookSceneRef.current;
    const curlCanvas = curlCanvasRef.current;
    if (!bsEl || !curlCanvas) return;

    let dragOn = false;
    let dragPid = -1;
    let dragSX = 0, dragSY = 0;

    const onDown = (e: PointerEvent) => {
      if (phaseRef.current !== "idle") return;
      const r = bsEl.getBoundingClientRect();
      if ((e.clientX - r.left) / r.width < 0.30) return;
      e.preventDefault();
      initCurl();
      dragOn = true; dragPid = e.pointerId;
      dragSX = e.clientX; dragSY = e.clientY;
      curlCanvas.style.display = "block";
      curlCanvas.style.cursor = "grabbing";
      try { bsEl.setPointerCapture(e.pointerId); } catch {}
      const ctx = curlCanvas.getContext("2d")!;
      renderCurl(ctx, curlWRef.current, curlHRef.current, curlWRef.current, curlHRef.current);
    };

    const onMove = (e: PointerEvent) => {
      if (!dragOn || e.pointerId !== dragPid) return;
      e.preventDefault();
      const W = curlWRef.current, H = curlHRef.current;
      const dx = e.clientX - dragSX, dy = e.clientY - dragSY;
      const tx = Math.max(-W * 0.7, Math.min(W + 4, W + dx));
      const ty = Math.max(-20, Math.min(H + 30, H + dy * 0.5));
      const ctx = curlCanvas.getContext("2d")!;
      renderCurl(ctx, W, H, tx, ty);
    };

    const onUp = (e: PointerEvent) => {
      if (!dragOn || e.pointerId !== dragPid) return;
      e.preventDefault();
      dragOn = false;
      curlCanvas.style.cursor = "grab";
      const W = curlWRef.current, H = curlHRef.current;
      const pCanvas = pCanvasRef.current;
      const dx = e.clientX - dragSX, dy = e.clientY - dragSY;
      const tx = Math.max(-W * 0.7, Math.min(W, W + dx));
      const ty = Math.max(-20, Math.min(H + 30, H + dy * 0.5));

      if (dx < -48 && phaseRef.current === "idle") {
        // complete flip
        const pg = randomPage();
        setGs(prev => ({ ...prev, phase: "flipping" }));
        sndPageFlip();
        const ctx = curlCanvas.getContext("2d")!;
        stopIdleFloat();
        curlCornerRef.current = { x: tx, y: ty };
        let start: number | null = null;
        const sweepX = tx, sweepY = ty;
        const step = (ts: number) => {
          if (!start) start = ts;
          const t = Math.min(1, (ts - start) / 360);
          const et = easeBackOut(t, 1.4);
          const cx = sweepX + (-W * 0.42 - sweepX) * et;
          const cy = sweepY + (H * 0.58 - sweepY) * et;
          renderCurl(ctx, W, H, cx, cy);
          if (t < 1) { tweenRafRef.current = requestAnimationFrame(step); }
          else {
            curlCanvas.style.display = "none";
            if (pCanvas) spawnDust(pCanvas.offsetWidth / 2 - 20, pCanvas.offsetHeight / 2 + 30);
            setGs(prev => ({ ...prev, bookTiltX: 12, bookTiltY: -10 }));
            setTimeout(startIdleFloat, 50);
            setGs(prev => ({ ...prev, phase: "zooming" }));
            zoomReveal(pg, () => resolveFlip(pg));
          }
        };
        tweenRafRef.current = requestAnimationFrame(step);
      } else {
        // snap back
        curlCornerRef.current = { x: tx, y: ty };
        const ctx = curlCanvas.getContext("2d")!;
        let start: number | null = null;
        const snapX = tx, snapY = ty;
        const snap = (ts: number) => {
          if (!start) start = ts;
          const t = Math.min(1, (ts - start) / 220);
          const et = t * (2 - t);
          const cx = snapX + (W - snapX) * et;
          const cy = snapY + (H - snapY) * et;
          renderCurl(ctx, W, H, cx, cy);
          if (t < 1) { tweenRafRef.current = requestAnimationFrame(snap); }
          else { curlCanvas.style.display = "none"; }
        };
        tweenRafRef.current = requestAnimationFrame(snap);
      }
    };

    bsEl.addEventListener("pointerdown", onDown, { passive: false });
    bsEl.addEventListener("pointermove", onMove, { passive: false });
    bsEl.addEventListener("pointerup", onUp, { passive: false });
    bsEl.addEventListener("pointercancel", onUp, { passive: false });
    return () => {
      bsEl.removeEventListener("pointerdown", onDown);
      bsEl.removeEventListener("pointermove", onMove);
      bsEl.removeEventListener("pointerup", onUp);
      bsEl.removeEventListener("pointercancel", onUp);
    };
  }, [initCurl, stopIdleFloat, startIdleFloat, spawnDust, zoomReveal, resolveFlip]);

  const s = gs;
  const isDisabled = s.phase !== "idle";

  return (
    <div className="book-cricket-game" style={{ background: "#0a0705", minHeight: "calc(100vh - 72px)", maxHeight: "calc(100vh - 72px)", width: "100%", display: "flex", flexDirection: "column", alignItems: "center", fontFamily: "'Rajdhani', sans-serif", color: "#f5ead6", overflowX: "hidden", overflowY: "auto", overscrollBehavior: "contain", userSelect: "none", paddingBottom: 24 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Rajdhani:wght@500;600;700&family=Special+Elite&display=swap');
        .book-cricket-game, .book-cricket-game * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        .book-cricket-game * { margin: 0; padding: 0; user-select: none; }
        @keyframes pulse { 0%,100%{opacity:.5} 50%{opacity:1} }
        @keyframes bbp { from{box-shadow:0 0 4px rgba(245,158,11,.3)} to{box-shadow:0 0 14px rgba(245,158,11,.6)} }
        @keyframes ballBounce { 0%,100%{transform:translateY(0)} 45%{transform:translateY(-7px)} 55%{transform:translateY(-5px)} }
        @keyframes modalIn { 0%{opacity:0;transform:scale(.92) translateY(12px)} 100%{opacity:1;transform:scale(1) translateY(0)} }
        .book-scene { transform-style: preserve-3d; filter: drop-shadow(0 20px 40px rgba(0,0,0,0.8)); }
        .cv-ball { animation: ballBounce 1.8s ease-in-out infinite !important; }
        .flip-btn:not(:disabled):hover { filter: brightness(1.1); }
        .flip-btn:not(:disabled):active { transform: scale(0.97) !important; }
        .modal-in { animation: modalIn .28s cubic-bezier(0.34,1.10,0.64,1); }
      `}</style>

      {/* ── Header ── */}
      <div style={{ width: "100%", maxWidth: 500, padding: "8px 14px 4px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={() => window.history.back()}
            style={{ background: "none", border: "1px solid #3d2c1e", color: "#c4956a", fontFamily: "'Rajdhani',sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: 1, padding: "5px 12px", borderRadius: 7, cursor: "pointer", display: "flex", alignItems: "center", gap: 5, transition: "border-color .15s, color .15s" }}
          >
            ← BACK
          </button>
          <a href="https://sportsfan360.com" target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
            <img src="https://www.sportsfan360.com/assets/images/logo.png" alt="SportsFan360" style={{ height: 28, display: "block" }} />
          </a>
        </div>
        <a href="https://sportsfan360.com" target="_blank" rel="noreferrer" style={{ fontSize: 8, color: "#f59e0b", letterSpacing: 2, textDecoration: "none", fontWeight: 700, opacity: 0.8 }}>sportsfan360.com</a>
      </div>

      {/* ── Scoreboard ── */}
      <div style={{ width: "100%", maxWidth: 500, display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 5, padding: "0 10px 6px" }}>
        {[
          { v: s.score, l: "SCORE" },
          { v: `${s.balls}/${MAX_BALLS}`, l: "BALLS" },
          { v: `${s.wickets}/${MAX_WKTS}`, l: "WICKETS" },
          { v: s.best, l: "BEST" },
        ].map((item, i) => (
          <div key={i} style={{ background: "#140d06", border: "1px solid #2a1a0a", borderRadius: 8, padding: "6px 4px", textAlign: "center" }}>
            <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 24, color: "#f5ead6", display: "block", lineHeight: 1 }}>{item.v}</span>
            <span style={{ fontSize: 8, color: "#6b5a47", letterSpacing: 2, fontWeight: 700 }}>{item.l}</span>
          </div>
        ))}
      </div>

      {/* ── Stage ── */}
      <div ref={stageRef} style={{ width: "min(96vw,460px)", height: 360, position: "relative", display: "flex", alignItems: "center", justifyContent: "center", perspective: 1400 }}>
        <canvas ref={pCanvasRef} style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 40, width: "100%", height: "100%" }} />

        {/* Book Scene */}
        <div ref={bookSceneRef} className="book-scene"
          style={{ position: "relative", width: 320, height: 240, transform: `rotateX(${s.bookTiltX}deg) rotateY(${s.bookTiltY}deg)`, transition: "transform 0.1s linear", touchAction: "none" }}>
          {/* Back cover */}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(160deg,#2a0e04,#1a0803)", borderRadius: "3px 8px 8px 3px" }} />
          {/* Pages edge */}
          <div style={{ position: "absolute", top: 3, bottom: 3, left: 14, right: 3, background: "repeating-linear-gradient(90deg,#e8d8b8 0px,#f0e0c0 1px,#f5e8cc 2px,#ede0c4 3px)", borderRadius: "0 4px 4px 0", boxShadow: "inset -2px 0 4px rgba(0,0,0,0.1)" }} />

          {/* Open page */}
          <div style={{ position: "absolute", top: 3, bottom: 3, left: 14, right: 3, background: "#f5ead6", borderRadius: "0 4px 4px 0", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ padding: "8px 14px 4px", display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(0,0,0,0.07)" }}>
              <span style={{ fontFamily: "'Special Elite',serif", fontSize: 7, color: "#8b7050", letterSpacing: 2 }}>{s.pgChapter}</span>
              <span style={{ fontFamily: "'Special Elite',serif", fontSize: 7, color: "#8b7050", letterSpacing: 2 }}>{s.pgTitle}</span>
            </div>
            <div style={{ flex: 1, padding: "6px 14px", position: "relative", overflow: "hidden" }}>
              {s.pgLines.map((line, i) => (
                <div key={i} style={{ height: 9, margin: "3px 0", display: "flex", alignItems: "center" }}>
                  <span style={{ fontFamily: "'Special Elite',serif", fontSize: 7.5, color: "#9a7a5a", opacity: 0.35 + (i % 5) * 0.06, whiteSpace: "nowrap", overflow: "hidden", display: "block", width: "100%" }}>{line}</span>
                </div>
              ))}
              {/* Big page number */}
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
                <div style={{ fontFamily: "'Special Elite',serif", fontSize: 56, color: "#2a1800", opacity: s.pageNumVisible ? 1 : 0, transform: s.pageNumVisible ? "scale(1)" : "scale(0.5)", transition: "opacity 0.4s, transform 0.4s cubic-bezier(0.34,1.56,0.64,1)", lineHeight: 1, textAlign: "center" }}>
                  {s.currentPage}
                </div>
              </div>
            </div>
            <div style={{ padding: "4px 14px 8px", borderTop: "1px solid rgba(0,0,0,0.07)", textAlign: "center", fontFamily: "'Special Elite',serif", fontSize: 8, color: "#8b7050", letterSpacing: 1 }}>{s.pgFooter}</div>
          </div>

          {/* Spine */}
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 14, background: "linear-gradient(90deg,#3d1205,#6b2008,#3d1205)", borderRadius: "3px 0 0 3px", zIndex: 3, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 7, letterSpacing: 2, color: "rgba(245,213,160,0.4)", writingMode: "vertical-rl", transform: "rotate(180deg)", whiteSpace: "nowrap" }}>BOOK CRICKET</span>
          </div>

          {/* Front cover */}
          {s.coverVisible && (
            <div onClick={openBook}
              style={{ position: "absolute", inset: 0, background: "linear-gradient(150deg,#8b2c0a 0%,#5c1a06 50%,#3d1205 100%)", borderRadius: "3px 8px 8px 3px", cursor: "pointer", zIndex: 10, overflow: "hidden", transition: "box-shadow 0.3s" }}>
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg,rgba(255,255,255,0.12) 0%,transparent 55%)", pointerEvents: "none" }} />
              <div style={{ position: "absolute", top: 8, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
                <img src="https://www.sportsfan360.com/assets/images/logo.png" alt="" style={{ height: 26, filter: "brightness(0) invert(1) sepia(1) saturate(2) hue-rotate(5deg)", opacity: 0.92 }} />
              </div>
              <div style={{ position: "absolute", top: 28, left: 0, right: 0, textAlign: "center", fontFamily: "'Bebas Neue',sans-serif", fontSize: 28, letterSpacing: 3, color: "#f5d5a0", textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}>Book Cricket</div>
              <div style={{ position: "absolute", top: 63, left: 0, right: 0, textAlign: "center", fontFamily: "'Special Elite',serif", fontSize: 9, letterSpacing: 2, color: "#c4956a", opacity: 0.8 }}>The Original Classroom Game</div>
              <div style={{ position: "absolute", top: 86, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                <div className="cv-ball" style={{ width: 42, height: 42, borderRadius: "50%", background: "radial-gradient(circle at 35% 32%,#f8f4ec,#c8b49a,#a89070)", boxShadow: "inset -4px -4px 8px rgba(0,0,0,0.3),inset 2px 2px 4px rgba(255,255,255,0.3)", position: "relative" }} />
                <div style={{ fontFamily: "'Special Elite',serif", fontSize: 8, letterSpacing: 3, color: "#a07050", textAlign: "center", animation: "pulse 1.5s ease-in-out infinite" }}>✦ TAP TO OPEN ✦</div>
              </div>
              <div style={{ position: "absolute", bottom: 7, left: 0, right: 0, textAlign: "center", fontFamily: "'Rajdhani',sans-serif", fontSize: 9, letterSpacing: 2, color: "#f0b87a", fontWeight: 700 }}>sportsfan360.com</div>
            </div>
          )}

          {/* Canvas for page curl */}
          <canvas ref={curlCanvasRef} style={{ position: "absolute", top: 3, bottom: 3, left: 14, right: 3, borderRadius: "0 4px 4px 0", zIndex: 6, display: "none", cursor: "grab", touchAction: "none", willChange: "transform" }} />

          {/* Corner curl hint */}
          <svg viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" style={{ position: "absolute", bottom: 6, right: 6, width: 18, height: 18, pointerEvents: "none", zIndex: 7, opacity: s.phase === "idle" ? 0.9 : 0, transition: "opacity 0.4s" }}>
            <path d="M18,18 Q10,18 18,10 Z" fill="rgba(200,160,100,0.5)" />
            <path d="M18,18 Q10,18 18,10" fill="none" stroke="rgba(245,200,130,0.7)" strokeWidth="0.8" />
          </svg>
        </div>

        {/* Zoom overlay */}
        {s.showZoom && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, background: "rgba(5,3,2,0.75)", backdropFilter: "blur(2px)" }}>
            <div className="modal-in" style={{ background: "#0d0804", borderRadius: 20, padding: "20px 36px", textAlign: "center", border: `2px solid ${s.zoomData.borderColor}` }}>
              <div style={{ fontFamily: "'Special Elite',serif", fontSize: 96, lineHeight: 1, color: s.zoomData.bigColor }}>{s.zoomData.bigNum}</div>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 18, letterSpacing: 4, marginTop: 2, color: s.zoomData.labelColor }}>{s.zoomData.label}</div>
              <div style={{ fontFamily: "'Special Elite',serif", fontSize: 11, color: "#6b5a47", marginTop: 8, letterSpacing: 1 }}>{s.zoomData.pageInfo}</div>
            </div>
          </div>
        )}
      </div>

      {/* ── Ball tracker ── */}
      <div style={{ width: "100%", maxWidth: 500, padding: "5px 10px 3px", display: "flex", alignItems: "center", gap: 6 }}>
        <div style={{ fontSize: 9, color: "#6b5a47", letterSpacing: 2, fontWeight: 700, whiteSpace: "nowrap" }}>SCORECARD</div>
        <div style={{ display: "flex", gap: 3, flexWrap: "wrap", flex: 1 }}>
          {Array.from({ length: MAX_BALLS }).map((_, i) => {
            const v = s.ballRecord[i];
            const isNow = i === s.ballRecord.length && s.phase !== "over";
            const bStyle = bbStyle(v, isNow);
            return (
              <div key={i} style={{ width: 26, height: 26, borderRadius: "50%", border: "1.5px solid #2a1a0a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, fontFamily: "'Bebas Neue',sans-serif", transition: "all .25s", ...bStyle }}>
                {v !== undefined ? (v === "OUT" ? "W" : v) : (isNow ? "" : i + 1)}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Message ── */}
      <div style={{ width: "100%", maxWidth: 500, padding: "4px 12px", textAlign: "center", minHeight: 22 }}>
        <div style={{ fontSize: 13, color: "#c4956a", fontWeight: 600, fontFamily: "'Special Elite',serif", letterSpacing: 0.3 }}>{s.msg}</div>
      </div>

      {/* ── Flip button ── */}
      <button className="flip-btn" onClick={doFlip} disabled={isDisabled}
        style={{ width: "min(92vw,440px)", padding: 15, border: "none", borderRadius: 12, background: "linear-gradient(135deg,#7a2008,#c44010,#7a2008)", color: "#f5d5a0", fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, letterSpacing: 4, cursor: isDisabled ? "not-allowed" : "pointer", boxShadow: "0 4px 24px rgba(139,44,10,0.5)", marginTop: 6, opacity: isDisabled ? 0.35 : 1, transition: "all .2s" }}>
        📖  FLIP THE PAGE
      </button>

      {/* ── Bottom buttons ── */}
      <div style={{ display: "flex", gap: 6, padding: "6px 10px", width: "100%", maxWidth: 500 }}>
        <button onClick={resetGame} style={{ flex: 1, padding: 9, border: "none", borderRadius: 9, background: "#22c55e", color: "#fff", fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: 2, cursor: "pointer" }}>↺ NEW MATCH</button>
        <button onClick={() => update(s => ({ showHowTo: !s.showHowTo }))} style={{ flex: 1, padding: 9, border: "1px solid #2a1a0a", borderRadius: 9, background: "#140d06", color: "#6b5a47", fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: 2, cursor: "pointer" }}>? HOW TO PLAY</button>
      </div>

      {/* ── How to play ── */}
      {s.showHowTo && (
        <div style={{ width: "min(92vw,440px)", background: "#0d0804", border: "1px solid #2a1a0a", borderRadius: 12, padding: "14px 16px", fontSize: 12, lineHeight: 1.9, color: "#c4956a", marginTop: 4 }}>
          <div style={{ fontFamily: "'Bebas Neue',sans-serif", color: "#f59e0b", fontSize: 16, letterSpacing: 2, marginBottom: 6 }}>HOW TO PLAY</div>
          <ul style={{ paddingLeft: 14, color: "#c4956a", fontSize: 12, lineHeight: 2 }}>
            <li>Tap <strong style={{ color: "#f5ead6" }}>FLIP THE PAGE</strong> — book spins to a random page.</li>
            <li>The <strong style={{ color: "#f5ead6" }}>last digit</strong> of that page number = your runs.</li>
            <li>Last digit <strong style={{ color: "#dc2626" }}>0</strong> = WICKET — you&apos;re out!</li>
            <li>Last digit <strong style={{ color: "#22c55e" }}>6</strong> = SIX! Maximum celebration!</li>
            <li>5 = 1 run · 7 = 1 run · 8 = 2 runs · 9 = 3 runs</li>
            <li>12 balls per innings · 3 wickets max</li>
          </ul>
          <div style={{ marginTop: 8, fontSize: 10, color: "#6b5a47", fontFamily: "'Special Elite',serif" }}>Example: Page 47 → last digit 7 → 1 run. Page 136 → last digit 6 → SIX!</div>
        </div>
      )}

      {/* ── Match Over ── */}
      {s.showMatchOver && (
        <div style={{ width: "min(92vw,440px)", background: "#0d0804", border: "2px solid #f59e0b", borderRadius: 20, padding: 24, textAlign: "center", marginTop: 8 }} className="modal-in">
          <div style={{ fontSize: 9, letterSpacing: 4, color: "#6b5a47", fontWeight: 700 }}>MATCH OVER</div>
          <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 72, lineHeight: 1, color: s.matchOverData.scoreColor }}>{s.matchOverData.score}</div>
          <div style={{ fontSize: 12, color: "#6b5a47", letterSpacing: 1, marginTop: 2 }}>{s.matchOverData.sub}</div>
          <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 20, color: "#f59e0b", marginTop: 6, letterSpacing: 1 }}>{s.matchOverData.best}</div>
          <button onClick={resetGame} style={{ marginTop: 16, padding: "10px 28px", border: "none", borderRadius: 10, background: "linear-gradient(135deg,#7a2008,#c44010)", color: "#f5d5a0", fontFamily: "'Bebas Neue',sans-serif", fontSize: 18, letterSpacing: 3, cursor: "pointer" }}>PLAY AGAIN</button>
        </div>
      )}



      <div style={{ fontSize: 9, color: "#8b6540", letterSpacing: 2, marginTop: 12 }}>
        <a href="https://sportsfan360.com" target="_blank" rel="noreferrer" style={{ color: "#f59e0b", textDecoration: "none", fontWeight: 700 }}>sportsfan360.com</a> — Book Cricket PRO
      </div>
    </div>
  );
}