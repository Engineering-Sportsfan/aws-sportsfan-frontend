// components/PlayerProfile-Component/PlayerProfileActions/index.tsx

"use client";

import React, { useEffect, useRef, useState, useCallback, MouseEvent as RMouseEvent, TouchEvent as RTouchEvent } from "react";
import { signIn } from "next-auth/react";
import { useAuth } from "@/context/AuthContext";
import { Player } from "@/types/player";

/* Inlined AvatarMaker component (originally src/components/PlayerProfile-Component/AvatarMaker.tsx) */

const TEAMS = [
  { id: "csk", abbr: "CSK", name: "Chennai Super Kings", jersey: "/images/Jersey_Channai_Super_Kings.png", primary: "#F9CD05", accent: "#1A3A5C", gradient: "linear-gradient(135deg,#F9CD05,#c98e00)" },
  { id: "dc", abbr: "DC", name: "Delhi Capitals", jersey: "/images/Jersey_Delhi_Capitals.png", primary: "#1A5DB5", accent: "#EF1B23", gradient: "linear-gradient(135deg,#1A5DB5,#0d3278)" },
  { id: "gt", abbr: "GT", name: "Gujarat Titans", jersey: "/images/Jersey_Gujrat_Titans.png", primary: "#1C2B6E", accent: "#D4AF37", gradient: "linear-gradient(135deg,#1C2B6E,#0f1840)" },
  { id: "kkr", abbr: "KKR", name: "Kolkata Knight Riders", jersey: "/images/Jersey_Kolkata_Knight_Riders.png", primary: "#3A225D", accent: "#D4AF37", gradient: "linear-gradient(135deg,#3A225D,#1a0a2e)" },
  { id: "lsg", abbr: "LSG", name: "Lucknow Super Giants", jersey: "/images/Jersey_Lucknow_Super_Giants.png", primary: "#A72B2A", accent: "#002147", gradient: "linear-gradient(135deg,#A72B2A,#6b0b0b)" },
  { id: "mi", abbr: "MI", name: "Mumbai Indians", jersey: "/images/Jersey_Mumbai_Indians.png", primary: "#1B47A0", accent: "#D4AF37", gradient: "linear-gradient(135deg,#1B47A0,#0c2660)" },
  { id: "pbks", abbr: "PBKS", name: "Punjab Kings", jersey: "/images/Jersey_Punjab_Kings.png", primary: "#D01B27", accent: "#1F3C8E", gradient: "linear-gradient(135deg,#D01B27,#870c11)" },
  { id: "rr", abbr: "RR", name: "Rajasthan Royals", jersey: "/images/Jersey_Rajasthan_Royals.png", primary: "#E91E8C", accent: "#254AA5", gradient: "linear-gradient(135deg,#254AA5,#a8176b)" },
  { id: "rcb", abbr: "RCB", name: "Royal Challengers Bengaluru", jersey: "/images/Jersey_Royal_Challengers_Banglore.png", primary: "#CC0000", accent: "#D4AF37", gradient: "linear-gradient(135deg,#CC0000,#6b0000)" },
  { id: "srh", abbr: "SRH", name: "Sunrisers Hyderabad", jersey: "/images/Jersey_Sunrisers_Hydrabad.png", primary: "#E8510B", accent: "#1A1A1A", gradient: "linear-gradient(135deg,#E8510B,#8c2800)" },
] as const;

type Team = (typeof TEAMS)[number];
type Step = "team" | "photo" | "adjust";

interface AvatarMakerProps {
  onClose: () => void;
  initialTeamName?: string;
}

interface Overlay {
  x: number;
  y: number;
  radius: number;
}

type FaceBox = { x: number; y: number; width: number; height: number };

const FACEAPI_SRC = "https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js";
const MODELS_URL = "https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/weights";
const CW = 460;
const CH = 600;
const JERSEY_Y = 108;
const JERSEY_H = CH - JERSEY_Y;
const FACE_DEF: Overlay = { x: CW / 2, y: 58, radius: 54 };
const MAX_PX = 1200;

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    faceapi: any;
  }
}

function resolveTeamFromName(name?: string) {
  const normalized = (name || "").trim().toLowerCase();
  if (normalized.includes("chennai")) return TEAMS[0];
  if (normalized.includes("delhi")) return TEAMS[1];
  if (normalized.includes("gujarat")) return TEAMS[2];
  if (normalized.includes("kolkata")) return TEAMS[3];
  if (normalized.includes("lucknow")) return TEAMS[4];
  if (normalized.includes("mumbai")) return TEAMS[5];
  if (normalized.includes("punjab")) return TEAMS[6];
  if (normalized.includes("royal") || normalized.includes("rcb")) return TEAMS[8];
  if (normalized.includes("rajasthan")) return TEAMS[7];
  if (normalized.includes("hyderabad")) return TEAMS[9];
  return TEAMS[5];
}

function StepBar({ step, team }: { step: Step; team: Team }) {
  const steps = [
    { id: "team" as Step, label: "Pick Team", icon: "🏆" },
    { id: "photo" as Step, label: "Your Photo", icon: "📸" },
    { id: "adjust" as Step, label: "Fine-tune", icon: "✨" },
  ];
  const current = steps.findIndex((item) => item.id === step);

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 36, flexWrap: "wrap" }}>
      {steps.map((item, index) => {
        const done = index < current;
        const active = index === current;

        return (
          <React.Fragment key={item.id}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 7 }}>
              <div style={{
                width: 42,
                height: 42,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: done ? 13 : 16,
                background: (done || active) ? team.primary : "rgba(255,255,255,0.05)",
                color: (done || active) ? "#fff" : "#333",
                border: `2px solid ${(done || active) ? team.primary : "rgba(255,255,255,0.09)"}`,
                boxShadow: active ? `0 0 0 5px ${team.primary}28, 0 0 18px ${team.primary}44` : "none",
                transition: "all 0.3s ease",
              }}>
                {done ? "✓" : item.icon}
              </div>
              <span style={{
                fontSize: 11,
                fontFamily: "'DM Sans',sans-serif",
                letterSpacing: "0.06em",
                color: active ? team.primary : done ? "#666" : "#333",
                fontWeight: active ? 600 : 400,
              }}>
                {item.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div style={{ width: 52, height: 1.5, margin: "-14px 4px 0", background: index < current ? team.primary : "rgba(255,255,255,0.07)", transition: "background 0.3s" }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function AvatarMaker({ onClose, initialTeamName }: AvatarMakerProps) {
  const [step, setStep] = React.useState<Step>("team");
  const [team, setTeam] = React.useState<Team>(() => resolveTeamFromName(initialTeamName));
  const [faceCvs, setFaceCvs] = React.useState<HTMLCanvasElement | null>(null);
  const [pos, setPos] = React.useState<Overlay>(FACE_DEF);
  const [modelsOk, setModelsOk] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [camOn, setCamOn] = React.useState(false);
  const [videoReady, setVideoReady] = React.useState(false);
  const [stream, setStream] = React.useState<MediaStream | null>(null);
  const [camDenied, setCamDenied] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  const mainCvs = React.useRef<HTMLCanvasElement>(null);
  const fileIn = React.useRef<HTMLInputElement>(null);
  const videoEl = React.useRef<HTMLVideoElement>(null);
  const isDrag = React.useRef(false);
  const isRes = React.useRef(false);
  const dRef = React.useRef({ sx: 0, sy: 0, ox: 0, oy: 0 });
  const rRef = React.useRef({ sx: 0, or: 0 });

  React.useEffect(() => {
    if (window.faceapi) {
      setModelsOk(true);
      return;
    }

    if (document.getElementById("faceapi-js")) return;

    const script = document.createElement("script");
    script.id = "faceapi-js";
    script.src = FACEAPI_SRC;
    script.onload = async () => {
      try {
        await window.faceapi.nets.tinyFaceDetector.loadFromUri(MODELS_URL);
        setModelsOk(true);
      } catch {
        setModelsOk(false);
      }
    };
    document.head.appendChild(script);
  }, []);

  React.useEffect(() => {
    if (camOn && videoEl.current && stream) {
      videoEl.current.srcObject = stream;
      void videoEl.current.play().catch(() => {});
    }
  }, [camOn, stream]);

  React.useEffect(() => {
    return () => {
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, [stream]);

  React.useEffect(() => {
    const canvas = mainCvs.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, CW, CH);

    const bg = ctx.createLinearGradient(0, 0, CW, CH);
    bg.addColorStop(0, `${team.primary}14`);
    bg.addColorStop(1, `${team.accent}08`);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, CW, CH);

    const jerseyImage = new Image();
    jerseyImage.crossOrigin = "anonymous";
    jerseyImage.src = team.jersey;
    jerseyImage.onload = () => {
      ctx.drawImage(jerseyImage, 0, JERSEY_Y, CW, JERSEY_H);
      paintFace(ctx);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [team, faceCvs, pos]);

  const paintFace = (ctx: CanvasRenderingContext2D) => {
    if (!faceCvs) return;

    const { x, y, radius } = pos;
    const ry = radius * 1.22;

    ctx.save();
    ctx.beginPath();
    ctx.ellipse(x, y, radius, ry, 0, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(faceCvs, x - radius, y - ry, radius * 2, ry * 2);
    ctx.restore();

    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.55)";
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.ellipse(x, y, radius + 1, ry + 1, 0, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255,255,255,0.12)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();

    const hx = x + radius * 0.72;
    const hy = y + ry + 2;
    ctx.beginPath();
    ctx.arc(hx, hy, 9, 0, Math.PI * 2);
    ctx.fillStyle = team.primary;
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = "#fff";
    ctx.font = "bold 9px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("↔", hx, hy);
  };

  const tryFaceApi = useCallback(async (img: HTMLImageElement) => {
    if (!modelsOk || !window.faceapi) return null;

    try {
      const detectionPromise = window.faceapi.detectAllFaces(
        img,
        new window.faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.35 }),
      );
      const timeoutPromise = new Promise<null>((resolve) => {
        window.setTimeout(() => resolve(null), 1200);
      });

      const detections = await Promise.race([detectionPromise, timeoutPromise]);
      if (Array.isArray(detections) && detections.length > 0) {
        return detections[0].box as FaceBox;
      }
    } catch {
      // fall back to smart crop immediately
    }

    return null;
  }, [modelsOk]);

  const readExifOrientation = (buffer: ArrayBuffer): number => {
    try {
      const view = new DataView(buffer);
      if (view.getUint16(0, false) !== 0xffd8) return 1;

      let offset = 2;
      while (offset < view.byteLength) {
        const marker = view.getUint16(offset, false);
        offset += 2;
        if (marker === 0xffe1) {
          if (view.getUint32(offset + 2, false) !== 0x45786966) break;
          const littleEndian = view.getUint16(offset + 8, false) === 0x4949;
          const tags = view.getUint16(offset + 14, littleEndian);
          for (let index = 0; index < tags; index += 1) {
            if (view.getUint16(offset + 16 + index * 12, littleEndian) === 0x0112) {
              return view.getUint16(offset + 16 + index * 12 + 8, littleEndian);
            }
          }
          break;
        }
        offset += view.getUint16(offset, false);
      }
    } catch {
      // ignore malformed EXIF data
    }
    return 1;
  };

  const applyExif = (ctx: CanvasRenderingContext2D, orientation: number, width: number, height: number) => {
    switch (orientation) {
      case 2:
        ctx.transform(-1, 0, 0, 1, width, 0);
        break;
      case 3:
        ctx.transform(-1, 0, 0, -1, width, height);
        break;
      case 4:
        ctx.transform(1, 0, 0, -1, 0, height);
        break;
      case 5:
        ctx.transform(0, 1, 1, 0, 0, 0);
        break;
      case 6:
        ctx.transform(0, 1, -1, 0, height, 0);
        break;
      case 7:
        ctx.transform(0, -1, -1, 0, height, width);
        break;
      case 8:
        ctx.transform(0, -1, 1, 0, 0, width);
        break;
      default:
        break;
    }
  };

  const normalizeFile = (file: File): Promise<HTMLImageElement> => {
    return new Promise((resolve) => {
      const fallback = () => {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
          URL.revokeObjectURL(url);
          resolve(img);
        };
        img.onerror = () => {
          URL.revokeObjectURL(url);
          resolve(img);
        };
        img.src = url;
      };

      try {
        const reader = new FileReader();
        reader.onerror = fallback;
        reader.onload = (event) => {
          try {
            const buffer = event.target?.result as ArrayBuffer;
            const orientation = readExifOrientation(buffer);
            const url = URL.createObjectURL(file);
            const src = new Image();

            src.onerror = fallback;
            src.onload = () => {
              URL.revokeObjectURL(url);

              const maxSide = Math.max(src.naturalWidth, src.naturalHeight);
              const scale = maxSide > MAX_PX ? MAX_PX / maxSide : 1;
              const width = src.naturalWidth * scale;
              const height = src.naturalHeight * scale;
              const swap = orientation >= 5;

              const canvas = document.createElement("canvas");
              canvas.width = swap ? height : width;
              canvas.height = swap ? width : height;
              const ctx = canvas.getContext("2d");
              if (!ctx) {
                resolve(src);
                return;
              }

              ctx.save();
              applyExif(ctx, orientation, canvas.width, canvas.height);
              ctx.drawImage(src, 0, 0, width, height);
              ctx.restore();

              const output = new Image();
              output.onload = () => resolve(output);
              output.onerror = fallback;
              output.src = canvas.toDataURL("image/jpeg", 0.92);
            };
            src.src = url;
          } catch {
            fallback();
          }
        };
        reader.readAsArrayBuffer(file);
      } catch {
        fallback();
      }
    });
  };

  const buildFaceMask = useCallback((img: HTMLImageElement, box?: FaceBox) => {
    let sx: number;
    let sy: number;
    let sw: number;
    let sh: number;

    if (box) {
      const px = box.width * 0.44;
      const pt = box.height * 0.72;
      const pb = box.height * 0.3;
      sx = Math.max(0, box.x - px);
      sy = Math.max(0, box.y - pt);
      sw = Math.min(img.width - sx, box.width + px * 2);
      sh = Math.min(img.height - sy, box.height + pt + pb);
    } else {
      const dim = Math.min(img.width, img.height);
      sw = dim * 0.62;
      sh = sw * 1.25;
      sx = img.width * 0.5 - sw * 0.5;
      sy = img.height * 0.03;
      if (sx + sw > img.width) sw = img.width - sx;
      if (sy + sh > img.height) sh = img.height - sy;
    }

    const cropW = Math.max(1, Math.round(sw));
    const cropH = Math.max(1, Math.round(sh));
    const crop = document.createElement("canvas");
    crop.width = cropW;
    crop.height = cropH;
    const cropCtx = crop.getContext("2d");
    if (!cropCtx) return;
    cropCtx.drawImage(img, sx, sy, sw, sh, 0, 0, cropW, cropH);

    const out = document.createElement("canvas");
    out.width = cropW;
    out.height = cropH;
    const ctx = out.getContext("2d");
    if (!ctx) return;

    const cx = cropW * 0.5;
    const cy = cropH * 0.45;
    const rx = cropW * 0.44;
    const ry = cropH * 0.48;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(1, ry / rx);
    const grad = ctx.createRadialGradient(0, 0, rx * 0.56, 0, 0, rx * 1.06);
    grad.addColorStop(0, "rgba(0,0,0,1)");
    grad.addColorStop(0.76, "rgba(0,0,0,1)");
    grad.addColorStop(0.9, "rgba(0,0,0,0.55)");
    grad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, rx * 1.12, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.globalCompositeOperation = "source-in";
    ctx.drawImage(crop, 0, 0);

    setFaceCvs(out);
    setPos(FACE_DEF);
    setStep("adjust");
  }, []);

  const processImage = useCallback(async (img: HTMLImageElement) => {
    setLoading(true);
    try {
      const box = await tryFaceApi(img);
      buildFaceMask(img, box ?? undefined);
    } catch {
      buildFaceMask(img);
    } finally {
      setLoading(false);
    }
  }, [buildFaceMask, tryFaceApi]);

  const handleFile = useCallback(async (file: File) => {
    setCamDenied(false);
    setLoading(true);
    const img = await normalizeFile(file);
    await processImage(img);
  }, [processImage]);

  const startCam = useCallback(async () => {
    setCamDenied(false);
    setVideoReady(false);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 960 } },
      });
      setStream(mediaStream);
      setCamOn(true);
    } catch {
      setCamDenied(true);
    }
  }, []);

  const capture = useCallback(() => {
    const waitForVideoReady = async (video: HTMLVideoElement) => {
      if (video.videoWidth > 0 && video.videoHeight > 0) {
        return true;
      }

      return await new Promise<boolean>((resolve) => {
        const startedAt = Date.now();
        const tick = () => {
          if (video.videoWidth > 0 && video.videoHeight > 0) {
            resolve(true);
            return;
          }

          if (Date.now() - startedAt > 1800) {
            resolve(false);
            return;
          }

          window.requestAnimationFrame(tick);
        };

        tick();
      });
    };

    const video = videoEl.current;
    if (!video) return;

    void (async () => {
      const ready = await waitForVideoReady(video);
      if (!ready) return;

      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(video, 0, 0);

      stream?.getTracks().forEach((track) => track.stop());
      setStream(null);
      setCamOn(false);
      setVideoReady(false);

      const img = new Image();
      img.onload = () => processImage(img);
      img.src = canvas.toDataURL("image/jpeg", 0.92);
    })();
  }, [processImage, stream]);

  const stopCam = useCallback(() => {
    stream?.getTracks().forEach((track) => track.stop());
    setStream(null);
    setCamOn(false);
    setVideoReady(false);
  }, [stream]);

  const xy = (e: RMouseEvent<HTMLCanvasElement> | RTouchEvent<HTMLCanvasElement>) => {
    const rect = mainCvs.current!.getBoundingClientRect();
    const source = "touches" in e ? e.touches[0] : e;
    return {
      mx: (source.clientX - rect.left) * (CW / rect.width),
      my: (source.clientY - rect.top) * (CH / rect.height),
    };
  };

  const onDown = (e: RMouseEvent<HTMLCanvasElement> | RTouchEvent<HTMLCanvasElement>) => {
    if (!faceCvs) return;
    const { mx, my } = xy(e);
    const { x, y, radius } = pos;
    const ry = radius * 1.22;
    const hx = x + radius * 0.72;
    const hy = y + ry + 2;
    if (Math.hypot(mx - hx, my - hy) < 15) {
      isRes.current = true;
      rRef.current = { sx: mx, or: radius };
    } else if (Math.hypot(mx - x, my - y) < radius * 1.4) {
      isDrag.current = true;
      dRef.current = { sx: mx, sy: my, ox: x, oy: y };
    }
  };

  const onMove = (e: RMouseEvent<HTMLCanvasElement> | RTouchEvent<HTMLCanvasElement>) => {
    if (!isDrag.current && !isRes.current) return;
    e.preventDefault();
    const { mx, my } = xy(e);

    if (isDrag.current) {
      setPos((current) => ({
        ...current,
        x: Math.max(current.radius + 2, Math.min(CW - current.radius - 2, dRef.current.ox + mx - dRef.current.sx)),
        y: Math.max(current.radius + 2, Math.min(CH - current.radius - 2, dRef.current.oy + my - dRef.current.sy)),
      }));
      return;
    }

    setPos((current) => ({
      ...current,
      radius: Math.max(28, Math.min(135, rRef.current.or + mx - rRef.current.sx)),
    }));
  };

  const onUp = () => {
    isDrag.current = false;
    isRes.current = false;
  };

  const download = () => {
    const link = document.createElement("a");
    link.href = mainCvs.current!.toDataURL("image/png");
    link.download = `${team.abbr}_IPL_Avatar.png`;
    link.click();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const cursor = isDrag.current ? "grabbing" : isRes.current ? "nwse-resize" : faceCvs ? "grab" : "default";

  return (
    <div style={S.root}>
      <div style={S.backdrop} onClick={onClose} />

      <div style={S.shell} role="dialog" aria-modal="true" aria-label="Make My Avatar dialog">
        <button type="button" onClick={onClose} style={S.closeButton} aria-label="Close avatar maker">
          Close
        </button>

        <div style={{ ...S.glow, background: `radial-gradient(ellipse at 50% 0%,${team.primary}22 0%,transparent 62%)` }} />

      <header style={S.header}>
        <p style={S.eyebrow}>TATA IPL · OFFICIAL JERSEY</p>
        <h1 style={{ ...S.title, background: `linear-gradient(130deg,#fff 38%,${team.primary})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Make My Avatar
        </h1>
        <p style={S.tagline}>Wear the jersey. Own the moment.</p>
      </header>

      <StepBar step={step} team={team} />

      {step === "team" && (
        <div style={S.page}>
          <h2 style={S.h2}>Select Your Team</h2>
          <div style={S.grid}>
            {TEAMS.map((item) => (
              <button
                key={item.id}
                type="button"
                style={{ ...S.card, border: `1.5px solid ${item.primary}40`, background: `linear-gradient(160deg,${item.primary}10,${item.accent}08)` }}
                onMouseEnter={(event) => {
                  const el = event.currentTarget;
                  el.style.transform = "translateY(-5px) scale(1.03)";
                  el.style.borderColor = item.primary;
                  el.style.boxShadow = `0 12px 36px ${item.primary}28`;
                }}
                onMouseLeave={(event) => {
                  const el = event.currentTarget;
                  el.style.transform = "none";
                  el.style.borderColor = `${item.primary}40`;
                  el.style.boxShadow = "none";
                }}
                onClick={() => {
                  setTeam(item as Team);
                  setFaceCvs(null);
                  setStep("photo");
                }}
              >
                <div style={{ ...S.jBox, background: `linear-gradient(180deg,${item.primary}1a,transparent)` }}>
                  <img src={item.jersey} alt={item.name} style={S.jImg} />
                </div>
                <div style={S.cardFoot}>
                  <span style={{ ...S.abbr, color: item.primary }}>{item.abbr}</span>
                  <span style={S.tname}>{item.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === "photo" && (
        <div style={{ ...S.page, maxWidth: 520, margin: "0 auto" }}>
          <h2 style={S.h2}>Add Your Photo</h2>
          <p style={S.sub}>Any clear photo works - camera or upload</p>

          {camDenied && (
            <div style={S.banner}>
              <span>⚠️</span>
              <span style={{ flex: 1 }}>Camera access denied. Please allow it in your browser or use photo upload below.</span>
              <button type="button" onClick={() => setCamDenied(false)} style={S.bannerClose}>✕</button>
            </div>
          )}

          {!camOn && !loading && (
            <>
              <div style={S.row2}>
                <button type="button" style={{ ...S.bigBtn, background: team.gradient }} onClick={startCam}>
                  <span style={S.btnIcon}>📷</span>
                  <span style={S.btnLabel}>Open Camera</span>
                  <span style={S.btnHint}>Best quality · selfie mode</span>
                </button>
                <button
                  type="button"
                  style={{ ...S.bigBtn, background: "rgba(255,255,255,0.04)", border: `1.5px solid ${team.primary}50` }}
                  onClick={() => fileIn.current?.click()}
                >
                  <span style={S.btnIcon}>🖼️</span>
                  <span style={S.btnLabel}>Upload Photo</span>
                  <span style={S.btnHint}>JPG · PNG · WEBP</span>
                </button>
                <input
                  ref={fileIn}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) {
                      void handleFile(file);
                      event.target.value = "";
                    }
                  }}
                />
              </div>

              <div style={S.tips}>
                {["Face clearly visible", "Front-facing, no tilt", "Even lighting", "Glasses optional - any photo works"].map((tip) => (
                  <div key={tip} style={S.tip}>
                    <span style={{ color: team.primary, fontWeight: 700, marginRight: 7 }}>✓</span>
                    {tip}
                  </div>
                ))}
              </div>
            </>
          )}

          {loading && (
            <div style={S.spinRow}>
              <div style={{ ...S.spin, borderTopColor: team.primary }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>Processing photo...</div>
                <div style={{ color: "#555", fontSize: 12, marginTop: 3, fontFamily: "'DM Sans',sans-serif" }}>
                  {modelsOk ? "Running face detection" : "Auto-cropping your photo"}
                </div>
                <div style={{ color: "#444", fontSize: 11, marginTop: 2, fontFamily: "'DM Sans',sans-serif" }}>
                  If no face is found, a smart center-crop is applied automatically.
                </div>
              </div>
            </div>
          )}

          {camOn && (
            <div>
              <div style={S.camBox}>
              <video
                ref={videoEl}
                autoPlay
                playsInline
                muted
                onLoadedMetadata={() => setVideoReady(true)}
                onCanPlay={() => setVideoReady(true)}
                style={{ ...S.video, border: `2px solid ${team.primary}55` }}
              />
              <div style={S.overlay}>
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
                  <defs>
                    <mask id="hole">
                      <rect width="100" height="100" fill="white" />
                      <ellipse cx="50" cy="43" rx="25" ry="33" fill="black" />
                    </mask>
                  </defs>
                  <rect width="100" height="100" fill="rgba(0,0,0,0.50)" mask="url(#hole)" />
                  <ellipse cx="50" cy="43" rx="25" ry="33" fill="none" stroke="white" strokeWidth="0.55" strokeDasharray="3.5 2" opacity="0.9" />
                  <ellipse cx="50" cy="43" rx="25" ry="33" fill="none" stroke={team.primary} strokeWidth="0.35" opacity="0.75" />
                </svg>
                {([['top', 'left'], ['top', 'right'], ['bottom', 'left'], ['bottom', 'right']] as const).map(([vertical, horizontal]) => (
                  <div
                    key={`${vertical}-${horizontal}`}
                    style={{
                      position: "absolute",
                      width: 16,
                      height: 16,
                      [vertical]: 8,
                      [horizontal]: 8,
                      borderTop: vertical === "top" ? `2px solid ${team.primary}` : "none",
                      borderBottom: vertical === "bottom" ? `2px solid ${team.primary}` : "none",
                      borderLeft: horizontal === "left" ? `2px solid ${team.primary}` : "none",
                      borderRight: horizontal === "right" ? `2px solid ${team.primary}` : "none",
                    }}
                  />
                ))}
                <div style={S.guideLabel}>Align face in the oval</div>
              </div>
              </div>

              <div style={S.captureRow}>
                <button type="button" onClick={capture} style={{ ...S.btnP, background: `linear-gradient(135deg,${team.primary},${team.accent})`, flex: 1, opacity: videoReady ? 1 : 0.7 }}>
                  📸 &nbsp;Capture
                </button>
                <button type="button" onClick={stopCam} style={S.btnS}>✕</button>
              </div>
            </div>
          )}

          <button type="button" onClick={() => setStep("team")} style={S.back}>← Back to teams</button>
        </div>
      )}

      {step === "adjust" && (
        <div style={S.adjustRow}>
          <div style={{ flex: "1 1 300px", maxWidth: 478 }}>
            <div style={{ ...S.badge, background: `linear-gradient(135deg,${team.primary},${team.accent})` }}>
              {team.abbr} Jersey
            </div>
            <div style={{ borderRadius: 18, overflow: "hidden" }}>
              <canvas
                ref={mainCvs}
                width={CW}
                height={CH}
                style={{ ...S.canvas, cursor, boxShadow: `0 0 0 1.5px ${team.primary}40, 0 28px 70px rgba(0,0,0,0.7)` }}
                onMouseDown={onDown}
                onMouseMove={onMove}
                onMouseUp={onUp}
                onMouseLeave={onUp}
                onTouchStart={onDown}
                onTouchMove={onMove}
                onTouchEnd={onUp}
              />
            </div>
            <p style={S.cvsTip}>
              <b style={{ color: team.primary }}>Drag</b> face above collar &nbsp;·&nbsp;
              <b style={{ color: team.primary }}>↔</b> handle to resize
            </p>
          </div>

          <div style={S.controls}>
            <div style={{ ...S.tBadge, background: `linear-gradient(135deg,${team.primary},${team.accent})` }}>
              <span style={{ fontSize: 24, fontWeight: 900, letterSpacing: "0.06em" }}>{team.abbr}</span>
              <span style={{ fontSize: 11, opacity: 0.8, marginTop: 2 }}>{team.name}</span>
            </div>

            <button
              type="button"
              onClick={download}
              style={{
                ...S.btnP,
                fontSize: 15,
                fontWeight: 800,
                padding: "15px",
                letterSpacing: "0.03em",
                background: saved ? "linear-gradient(135deg,#16a34a,#15803d)" : `linear-gradient(135deg,${team.primary},${team.accent})`,
                transition: "background 0.4s",
              }}
            >
              {saved ? "Saved!" : "Download Avatar"}
            </button>

            <div style={S.divider} />

            <button type="button" onClick={() => { setFaceCvs(null); setLoading(false); setStep("photo"); }} style={{ ...S.btnO, borderColor: team.primary, color: team.primary }}>
              📷 &nbsp;Retake Photo
            </button>
            <button type="button" onClick={() => { setFaceCvs(null); setLoading(false); setStep("team"); }} style={{ ...S.btnO, borderColor: "#222", color: "#555" }}>
              🔄 &nbsp;Change Team
            </button>

            <div style={S.hintsBox}>
              <p style={{ ...S.hintsH, color: team.primary }}>Tips</p>
              <ul style={S.hintsList}>
                <li>Drag face just above the collar</li>
                <li>Use the ↔ handle to resize</li>
                <li>Front-lit photos blend best</li>
                <li>Works with uploaded phone photos too</li>
              </ul>
            </div>
          </div>
        </div>
      )}

        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800;900&family=DM+Sans:wght@300;400;500&display=swap');
          @keyframes spin { to { transform: rotate(360deg); } }
          @keyframes fadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
          * { box-sizing: border-box; }
        `}</style>
      </div>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  root: { position: "fixed", inset: 0, zIndex: 80, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "96px 16px 24px", fontFamily: "'Syne','Segoe UI',sans-serif", color: "#fff", overflowY: "auto", overflowX: "hidden" },
  backdrop: { position: "absolute", inset: 0, background: "rgba(8,10,15,0.78)", backdropFilter: "blur(10px)" },
  shell: { position: "relative", width: "100%", maxWidth: 820, maxHeight: "calc(100dvh - 120px)", overflowY: "auto", borderRadius: 24, background: "linear-gradient(180deg, #11131a 0%, #080A0F 100%)", border: "1px solid rgba(255,255,255,0.10)", boxShadow: "0 24px 70px rgba(0,0,0,0.72)", padding: "14px 14px 28px" },
  glow: { position: "absolute", top: 0, left: 0, right: 0, height: 460, pointerEvents: "none", transition: "background 0.6s" },
  closeButton: { position: "sticky", top: 0, marginLeft: "auto", display: "block", padding: "10px 14px", borderRadius: 9999, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.06)", color: "#fff", cursor: "pointer", zIndex: 1, backdropFilter: "blur(10px)" },
  header: { textAlign: "center", marginBottom: 28, position: "relative", animation: "fadeUp 0.5s ease both" },
  eyebrow: { fontFamily: "'DM Sans',sans-serif", fontSize: 11, letterSpacing: "0.22em", color: "#444", margin: "0 0 12px", textTransform: "uppercase" },
  title: { fontWeight: 900, fontSize: "clamp(30px,7vw,52px)", margin: 0, letterSpacing: "-0.02em", lineHeight: 1, backgroundClip: "text" },
  tagline: { fontFamily: "'DM Sans',sans-serif", color: "#444", margin: "12px 0 0", fontSize: 13, letterSpacing: "0.07em", textTransform: "uppercase" },
  page: { maxWidth: 760, margin: "0 auto", animation: "fadeUp 0.4s ease both" },
  h2: { textAlign: "center", fontWeight: 800, fontSize: "clamp(18px,3vw,24px)", letterSpacing: "-0.01em", marginBottom: 6 },
  sub: { textAlign: "center", fontFamily: "'DM Sans',sans-serif", color: "#555", margin: "0 0 24px", letterSpacing: "0.04em", fontSize: 13 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(138px,1fr))", gap: 12 },
  card: { borderRadius: 14, padding: 0, cursor: "pointer", transition: "transform 0.2s,box-shadow 0.2s,border-color 0.2s", overflow: "hidden", textAlign: "left" },
  jBox: { width: "100%", height: 118, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", borderRadius: "14px 14px 0 0" },
  jImg: { height: 106, objectFit: "contain", filter: "drop-shadow(0 6px 14px rgba(0,0,0,0.55))" },
  cardFoot: { padding: "8px 12px 12px", display: "flex", flexDirection: "column", gap: 2 },
  abbr: { fontWeight: 900, fontSize: 14, letterSpacing: "0.06em" },
  tname: { fontSize: 10, color: "#444", fontFamily: "'DM Sans',sans-serif", lineHeight: 1.4 },
  banner: { display: "flex", alignItems: "flex-start", gap: 12, background: "rgba(234,179,8,0.1)", border: "1px solid rgba(234,179,8,0.35)", color: "#fde68a", padding: "12px 16px", borderRadius: 12, marginBottom: 18, fontSize: 13, fontFamily: "'DM Sans',sans-serif" },
  bannerClose: { background: "none", border: "none", color: "#fde68a", cursor: "pointer", fontSize: 16, flexShrink: 0, padding: 0 },
  row2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 18 },
  bigBtn: { borderRadius: 16, padding: "26px 16px", border: "1px solid transparent", cursor: "pointer", color: "#fff", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, fontFamily: "'Syne',sans-serif", transition: "opacity 0.15s" },
  btnIcon: { fontSize: 30 },
  btnLabel: { fontWeight: 700, fontSize: 14 },
  btnHint: { fontSize: 11, opacity: 0.6, fontFamily: "'DM Sans',sans-serif" },
  tips: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 },
  tip: { display: "flex", alignItems: "flex-start", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.055)", borderRadius: 9, padding: "9px 12px", fontSize: 12, fontFamily: "'DM Sans',sans-serif", color: "#777", lineHeight: 1.45 },
  spinRow: { display: "flex", alignItems: "center", gap: 18, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "20px 22px", marginBottom: 12 },
  spin: { width: 32, height: 32, flexShrink: 0, border: "3px solid rgba(255,255,255,0.08)", borderRadius: "50%", animation: "spin 0.75s linear infinite" },
  camBox: { position: "relative", borderRadius: 16, overflow: "hidden", marginBottom: 18 },
  video: { width: "100%", display: "block", borderRadius: 16 },
  overlay: { position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" },
  guideLabel: { position: "absolute", bottom: "13%", left: "50%", transform: "translateX(-50%)", color: "rgba(255,255,255,0.88)", fontSize: 12, fontFamily: "'DM Sans',sans-serif", letterSpacing: "0.06em", whiteSpace: "nowrap", background: "rgba(0,0,0,0.45)", padding: "4px 14px", borderRadius: 20, backdropFilter: "blur(4px)" },
  captureRow: { display: "flex", gap: 10, marginTop: 14, clear: "both" },
  adjustRow: { display: "flex", gap: 20, alignItems: "flex-start", justifyContent: "center", flexWrap: "wrap", maxWidth: 760, margin: "0 auto", animation: "fadeUp 0.4s ease both" },
  badge: { display: "inline-flex", alignItems: "center", color: "#fff", fontWeight: 800, fontSize: 10, letterSpacing: "0.14em", padding: "5px 14px", borderRadius: 20, marginBottom: 12, textTransform: "uppercase" },
  canvas: { width: "100%", height: "auto", display: "block", borderRadius: 18, userSelect: "none", WebkitUserSelect: "none", touchAction: "none" },
  cvsTip: { textAlign: "center", fontSize: 12, color: "#444", fontFamily: "'DM Sans',sans-serif", marginTop: 12, lineHeight: 1.6 },
  controls: { flex: "0 0 210px", display: "flex", flexDirection: "column", gap: 12, paddingTop: 32 },
  tBadge: { display: "flex", flexDirection: "column", alignItems: "center", padding: "20px 16px", borderRadius: 14, color: "#fff", gap: 4, letterSpacing: "0.04em" },
  divider: { height: 1, background: "rgba(255,255,255,0.06)", margin: "2px 0" },
  hintsBox: { background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.055)", borderRadius: 12, padding: "14px 16px", marginTop: 4 },
  hintsH: { fontWeight: 700, fontSize: 13, margin: "0 0 10px" },
  hintsList: { margin: 0, paddingLeft: 18, color: "#555", fontSize: 12, lineHeight: 2.1, fontFamily: "'DM Sans',sans-serif" },
  btnP: { display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "13px 18px", borderRadius: 12, border: "none", color: "#fff", cursor: "pointer", fontWeight: 700, fontSize: 14, width: "100%", fontFamily: "'Syne',sans-serif" },
  btnS: { display: "flex", alignItems: "center", justifyContent: "center", padding: "13px 16px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.06)", color: "#aaa", cursor: "pointer", fontSize: 14 },
  btnO: { display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "11px 18px", borderRadius: 12, border: "1.5px solid", background: "transparent", cursor: "pointer", fontWeight: 600, fontSize: 13, width: "100%", fontFamily: "'Syne',sans-serif" },
  back: { display: "block", margin: "22px auto 0", background: "none", border: "none", color: "#444", cursor: "pointer", fontSize: 13, fontFamily: "'DM Sans',sans-serif" },
};

interface Props {
  player: Player;
  playerId?: string;
}

type ActivityItem = {
  id: string;
  title: string;
  detail: string;
  time: string;
};

type FollowingItem = {
  id?: string | number | null;
  followingplayername?: string | null;
};

type FollowingListResponse = {
  following?: FollowingItem[];
};

type ResponseMessageBody = Record<string, unknown> | string | null | undefined;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeString(value: unknown): string {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function SectionLabel({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-[3px] h-5 bg-[#e91e8c] rounded-sm shrink-0" />
      <span className="text-base md:text-lg font-bold text-white">{text}</span>
    </div>
  );
}

type FaceBounds = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export default function PlayerProfileActions({ player, playerId }: Props) {
  const [showAvatarMaker, setShowAvatarMaker] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [captureError, setCaptureError] = useState<string | null>(null);
  const [capturedAvatar, setCapturedAvatar] = useState<string | null>(null);
  const [isTakingPhoto, setIsTakingPhoto] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  // overlay for manual face adjustment (normalized coords)
  const [overlayCenter, setOverlayCenter] = useState<{ x: number; y: number }>({ x: 0.5, y: 0.33 });
  const [overlaySize, setOverlaySize] = useState<number>(0.38); // fraction of min dimension
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef<{ active: boolean; startX: number; startY: number; startCenter?: { x: number; y: number } }>({ active: false, startX: 0, startY: 0 });
  // Micro-nudge controls for final placement
  // removed micro-nudge sliders; freehand manipulation on jersey will be used instead

  // Editable face on jersey preview
  const [editingFaceUrl, setEditingFaceUrl] = useState<string | null>(null);
  const [editingBaseSize, setEditingBaseSize] = useState<number>(420);
  const [editTransform, setEditTransform] = useState({ x: 0, y: 150, scale: 1, rotation: 0 });
  const faceElRef = useRef<HTMLImageElement | null>(null);
  const handleRef = useRef<HTMLDivElement | null>(null);
  const manipRef = useRef<{ mode: 'move' | 'handle' | null; startX: number; startY: number; startTransform?: any }>({ mode: null, startX: 0, startY: 0 });
  const editContainerRef = useRef<HTMLDivElement | null>(null);

  const prepareEditableFace = async (faceDataUrl: string) => {
    const faceImage = new Image();
    faceImage.src = faceDataUrl;
    await new Promise((r) => (faceImage.onload = r));

    const faceBounds = await detectFaceBounds(faceImage);
    const maskCanvas = await runSelfieSegmentation(faceImage);
    const baseSize = 420;
    const cut = buildFaceCutout(faceImage, faceBounds, maskCanvas, baseSize);
    const url = cut.toDataURL('image/png');
    setEditingBaseSize(baseSize);
    setEditingFaceUrl(url);
    setShowAvatarMaker(true);
    // default: small and placed at top of jersey
    const defaultScale = 0.32;
    const defaultX = Math.round(1200 / 2 - (baseSize * defaultScale) / 2);
    const defaultY = 54; // slightly lower so the jersey sits better in frame
    setEditTransform({ x: defaultX, y: defaultY, scale: defaultScale, rotation: 0 });
  };

  const finalizeCompose = async () => {
    if (!editingFaceUrl) return null;
    const jerseyImg = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = jerseySrc;
    });

    const faceImg = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = editingFaceUrl;
    });

    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 1600;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(jerseyImg, 0, 0, canvas.width, canvas.height);

    const finalSize = Math.round(editingBaseSize * editTransform.scale);
    const centerX = editTransform.x + finalSize / 2;
    const centerY = editTransform.y + finalSize / 2;
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate((editTransform.rotation * Math.PI) / 180);
    ctx.drawImage(faceImg, -finalSize / 2, -finalSize / 2, finalSize, finalSize);
    ctx.restore();

    const data = canvas.toDataURL('image/png');
    setCapturedAvatar(data);
    return data;
  };

  // Direct manipulation handlers: pointermove/up to update editTransform while dragging or using handle
  useEffect(() => {
    const onPointerMove = (e: PointerEvent) => {
      if (!manipRef.current.mode) return;
      const rect = editContainerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const canvasPx = 1200;
      const containerW = rect.width || 1;
      const canvasToClient = containerW / canvasPx;
      const clientToCanvas = canvasPx / containerW;

      const dxClient = e.clientX - manipRef.current.startX;
      const dyClient = e.clientY - manipRef.current.startY;

      if (manipRef.current.mode === 'move') {
        const start = manipRef.current.startTransform || { x: 0, y: 0 };
        const nx = start.x + dxClient * clientToCanvas;
        const ny = start.y + dyClient * clientToCanvas;
        setEditTransform((t) => ({ ...t, x: nx, y: ny }));
        return;
      }

      if (manipRef.current.mode === 'handle') {
        const start = manipRef.current.startTransform || { x: 0, y: 0, scale: 1, rotation: 0 };
        // center of face in client coords
        const finalSizeStart = start.scale * editingBaseSize;
        const centerClientX = rect.left + (start.x + finalSizeStart / 2) * canvasToClient;
        const centerClientY = rect.top + (start.y + finalSizeStart / 2) * canvasToClient;

        const vx0 = manipRef.current.startX - centerClientX;
        const vy0 = manipRef.current.startY - centerClientY;
        const vx1 = e.clientX - centerClientX;
        const vy1 = e.clientY - centerClientY;

        const dist0 = Math.hypot(vx0, vy0) || 1;
        const dist1 = Math.hypot(vx1, vy1) || 1;
        const scaleRatio = dist1 / dist0;

        const angle0 = Math.atan2(vy0, vx0);
        const angle1 = Math.atan2(vy1, vx1);
        const deltaAngle = angle1 - angle0;

        const newScale = Math.max(0.4, Math.min(3, start.scale * scaleRatio));
        const newRotation = start.rotation + (deltaAngle * 180) / Math.PI;

        setEditTransform((t) => ({ ...t, scale: newScale, rotation: newRotation }));
      }
    };

    const onPointerUp = () => {
      manipRef.current.mode = null;
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
  }, [editingBaseSize]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const captureInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const storageKey = `player-profile-actions:${playerId || player.name.toLowerCase().replace(/\s+/g, "-")}`;

  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [isWatching, setIsWatching] = useState(false);
  const [activityItems, setActivityItems] = useState<ActivityItem[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showUnfollowConfirm, setShowUnfollowConfirm] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [copied, setCopied] = useState(false);
  const previousMediaCount = useRef(player.media.length);

  const jerseyAssetMap: Record<string, string> = {
    csk: "/images/Jersey_Channai_Super_Kings.png",
    dc: "/images/Jersey_Delhi_Capitals.png",
    gt: "/images/Jersey_Gujrat_Titans.png",
    kkr: "/images/Jersey_Kolkata_Knight_Riders.png",
    lsg: "/images/Jersey_Lucknow_Super_Giants.png",
    mi: "/images/Jersey_Mumbai_Indians.png",
    pbks: "/images/Jersey_Punjab_Kings.png",
    rcb: "/images/Jersey_Royal_Challengers_Banglore.png",
    rr: "/images/Jersey_Rajasthan_Royals.png",
    srh: "/images/Jersey_Sunrisers_Hydrabad.png",
  };

  const teamName = player.team.trim().toLowerCase();
  const jerseySrc =
    teamName.includes("chennai") ? jerseyAssetMap.csk :
    teamName.includes("delhi") ? jerseyAssetMap.dc :
    teamName.includes("gujarat") ? jerseyAssetMap.gt :
    teamName.includes("kolkata") ? jerseyAssetMap.kkr :
    teamName.includes("lucknow") ? jerseyAssetMap.lsg :
    teamName.includes("mumbai") ? jerseyAssetMap.mi :
    teamName.includes("punjab") ? jerseyAssetMap.pbks :
    teamName.includes("royal") || teamName.includes("rcb") ? jerseyAssetMap.rcb :
    teamName.includes("rajasthan") ? jerseyAssetMap.rr :
    teamName.includes("hyderabad") ? jerseyAssetMap.srh :
    "/images/Jersey_Mumbai_Indians.png";

  // Per-team alignment adjustments: dx (px), dy (px), scale (multiplier)
  const jerseyAlignmentMap: Record<string, { dx?: number; dy?: number; scale?: number }> = {
    csk: { dx: 0, dy: -18, scale: 1.02 },
    dc: { dx: 0, dy: -12, scale: 1.01 },
    gt: { dx: 0, dy: -8, scale: 1.01 },
    kkr: { dx: 0, dy: -16, scale: 1.02 },
    lsg: { dx: 0, dy: -10, scale: 1.0 },
    mi: { dx: 0, dy: -28, scale: 1.03 },
    pbks: { dx: 0, dy: -6, scale: 1.0 },
    rcb: { dx: 0, dy: -20, scale: 1.02 },
    rr: { dx: 0, dy: -26, scale: 1.04 },
    srh: { dx: 0, dy: -14, scale: 1.0 },
  };

  const resolveTeamKey = (name: string) => {
    if (name.includes("chennai")) return "csk";
    if (name.includes("delhi")) return "dc";
    if (name.includes("gujarat")) return "gt";
    if (name.includes("kolkata")) return "kkr";
    if (name.includes("lucknow")) return "lsg";
    if (name.includes("mumbai")) return "mi";
    if (name.includes("punjab")) return "pbks";
    if (name.includes("royal") || name.includes("rcb")) return "rcb";
    if (name.includes("rajasthan")) return "rr";
    if (name.includes("hyderabad")) return "srh";
    return "mi";
  };

  const careerStatItems = [
    { value: player.stats.runs, label: "RUNS" },
    { value: player.stats.sr, label: "SR" },
    { value: player.stats.avg, label: "AVG" },
  ];

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const stored = window.localStorage.getItem(storageKey);
      if (!stored) return;

      const parsed = JSON.parse(stored) as { following?: boolean; watching?: boolean };
      setIsFollowing(Boolean(parsed.following));
      setIsWatching(Boolean(parsed.watching));
    } catch (error) {
      console.error("Failed to restore player actions state", error);
    }
  }, [storageKey]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(storageKey, JSON.stringify({ following: isFollowing, watching: isWatching }));
  }, [isFollowing, isWatching, storageKey]);

  useEffect(() => {
    if (!isWatching) {
      previousMediaCount.current = player.media.length;
      setActivityItems([]);
      return;
    }

    const nextItems = player.media.slice(0, 3).map((item, index) => ({
      id: `${item.title}-${index}`,
      title: item.title,
      detail: `${player.name} uploaded a new clip`,
      time: item.time,
    }));

    setActivityItems(nextItems);

    if (player.media.length > previousMediaCount.current && previousMediaCount.current > 0) {
      setToastMessage(`${player.name} has new uploads ready for you`);
    }

    previousMediaCount.current = player.media.length;
  }, [isWatching, player.media, player.name]);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = window.setTimeout(() => setToastMessage(null), 2500);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  useEffect(() => {
    if (!showAvatarMaker) return;

    let cancelled = false;

    const startCamera = async () => {
      setCaptureError(null);
      setCameraReady(false);

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => undefined);
        }
        setCameraReady(true);
      } catch (error: any) {
        setCaptureError(error?.message || "Camera access failed. Use the fallback upload option.");
      }
    };

    startCamera();

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, [showAvatarMaker]);

  // Handle overlay dragging
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!draggingRef.current.active) return;
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect || !draggingRef.current.startCenter) return;
      const dx = e.clientX - draggingRef.current.startX;
      const dy = e.clientY - draggingRef.current.startY;
      const nx = draggingRef.current.startCenter.x + dx / rect.width;
      const ny = draggingRef.current.startCenter.y + dy / rect.height;
      setOverlayCenter({ x: Math.min(0.95, Math.max(0.05, nx)), y: Math.min(0.95, Math.max(0.05, ny)) });
    };

    const onUp = () => {
      draggingRef.current.active = false;
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, []);

  const closeAvatarMaker = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setShowAvatarMaker(false);
    setCaptureError(null);
    setCameraReady(false);
    setCapturedAvatar(null);
    setIsTakingPhoto(false);
  };

  const detectFaceBounds = async (sourceImage: HTMLImageElement): Promise<FaceBounds | null> => {
    if (typeof window === "undefined") return null;

    const FaceDetectorCtor = (window as Window & {
      FaceDetector?: new (options?: { fastMode?: boolean; maxDetectedFaces?: number }) => {
        detect: (source: HTMLImageElement) => Promise<Array<{ boundingBox: DOMRectReadOnly }>>;
      };
    }).FaceDetector;

    if (!FaceDetectorCtor) return null;

    try {
      const detector = new FaceDetectorCtor({ fastMode: true, maxDetectedFaces: 1 });
      const faces = await detector.detect(sourceImage);
      const firstFace = faces[0];

      if (!firstFace?.boundingBox) return null;

      const { x, y, width, height } = firstFace.boundingBox;
      return { x, y, width, height };
    } catch {
      return null;
    }
  };

  // Load MediaPipe SelfieSegmentation from CDN when needed and run segmentation
  const ensureSelfieSegmentationLoaded = async () => {
    if (typeof window === "undefined") return false;
    if ((window as any).SelfieSegmentation) return true;

    await new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/selfie_segmentation.js";
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load SelfieSegmentation script"));
      document.head.appendChild(script);
    }).catch(() => false);

    return Boolean((window as any).SelfieSegmentation);
  };

  const runSelfieSegmentation = async (imageEl: HTMLImageElement): Promise<HTMLCanvasElement | null> => {
    try {
      const ok = await ensureSelfieSegmentationLoaded();
      if (!ok) return null;

      const SelfieSegmentationCtor = (window as any).SelfieSegmentation;
      if (!SelfieSegmentationCtor) return null;

      const seg = new SelfieSegmentationCtor({ locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}` });
      seg.setOptions({ modelSelection: 1 });

      const result: any = await new Promise((resolve) => {
        seg.onResults((res: any) => resolve(res));
        // send expects an HTMLImageElement or HTMLVideoElement
        seg.send({ image: imageEl });
      });

      const mask = result?.segmentationMask as HTMLCanvasElement | undefined | null;
      if (!mask) return null;

      // Resize mask to our face cutout size (900x900)
      const resized = document.createElement("canvas");
      resized.width = 900;
      resized.height = 900;
      const rctx = resized.getContext("2d");
      if (rctx) rctx.drawImage(mask, 0, 0, resized.width, resized.height);
      return resized;
    } catch (e) {
      return null;
    }
  };

  // Load MediaPipe FaceMesh from CDN and run to get landmarks
  const ensureFaceMeshLoaded = async () => {
    if (typeof window === "undefined") return false;
    if ((window as any).FaceMesh) return true;

    await new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js";
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load FaceMesh script"));
      document.head.appendChild(script);
    }).catch(() => false);

    return Boolean((window as any).FaceMesh);
  };

  const runFaceMesh = async (imageEl: HTMLImageElement): Promise<Array<{ x: number; y: number; z?: number }> | null> => {
    try {
      const ok = await ensureFaceMeshLoaded();
      if (!ok) return null;

      const FaceMeshCtor = (window as any).FaceMesh;
      if (!FaceMeshCtor) return null;

      const fm = new FaceMeshCtor({ locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}` });
      fm.setOptions({ maxNumFaces: 1, refineLandmarks: false });

      const result: any = await new Promise((resolve) => {
        fm.onResults((res: any) => resolve(res));
        fm.send({ image: imageEl });
      });

      const landmarks = result?.multiFaceLandmarks?.[0] ?? null;
      if (!landmarks) return null;

      // landmarks are normalized; convert to pixel coords using image size
      const w = imageEl.width || imageEl.naturalWidth;
      const h = imageEl.height || imageEl.naturalHeight;
      return landmarks.map((lm: any) => ({ x: lm.x * w, y: lm.y * h, z: lm.z }));
    } catch {
      return null;
    }
  };

  const buildFaceCutout = (sourceImage: HTMLImageElement, _faceBounds: FaceBounds | null, maskCanvas?: HTMLCanvasElement | null, targetSize = 460) => {
    const faceCanvas = document.createElement("canvas");
    faceCanvas.width = targetSize;
    faceCanvas.height = targetSize;
    const faceContext = faceCanvas.getContext("2d");

    if (!faceContext) throw new Error("Unable to build face cutout");

    const sw = sourceImage.width;
    const sh = sourceImage.height;
    if (!sw || !sh) return faceCanvas;

    // center-crop source to square and draw to fill target canvas
    if (sw / sh > 1) {
      const crop = sh;
      const sx = Math.round((sw - crop) / 2);
      faceContext.drawImage(sourceImage, sx, 0, crop, crop, 0, 0, targetSize, targetSize);
    } else {
      const crop = sw;
      const sy = Math.round((sh - crop) / 2);
      faceContext.drawImage(sourceImage, 0, sy, crop, crop, 0, 0, targetSize, targetSize);
    }

    if (maskCanvas) {
      faceContext.globalCompositeOperation = "destination-in";
      faceContext.drawImage(maskCanvas, 0, 0, maskCanvas.width, maskCanvas.height, 0, 0, targetSize, targetSize);
      faceContext.globalCompositeOperation = "source-over";

      // no stroke: keep edges natural
      return faceCanvas;
    }

    const mask = document.createElement("canvas");
    mask.width = targetSize;
    mask.height = targetSize;
    const mctx = mask.getContext("2d");
    if (!mctx) return faceCanvas;
    mctx.clearRect(0, 0, targetSize, targetSize);
    mctx.fillStyle = "#fff";
    mctx.beginPath();
    mctx.ellipse(targetSize / 2, targetSize / 2, targetSize * 0.48, targetSize * 0.52, 0, 0, Math.PI * 2);
    mctx.closePath();
    mctx.fill();

    if (typeof mctx.filter !== "undefined") {
      mctx.filter = "blur(10px)";
      const blurred = document.createElement("canvas");
      blurred.width = targetSize;
      blurred.height = targetSize;
      const bctx = blurred.getContext("2d");
      if (bctx) {
        bctx.clearRect(0, 0, targetSize, targetSize);
        bctx.filter = "blur(10px)";
        bctx.drawImage(mask, 0, 0);
      }
      faceContext.globalCompositeOperation = "destination-in";
      faceContext.drawImage(blurred, 0, 0);
      faceContext.globalCompositeOperation = "source-over";
    } else {
      faceContext.globalCompositeOperation = "destination-in";
      faceContext.drawImage(mask, 0, 0);
      faceContext.globalCompositeOperation = "source-over";
    }

    // no stroke: keep edges natural

    return faceCanvas;
  };

  const composeAvatar = async (faceDataUrl: string) => {
    const jerseyImage = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.crossOrigin = "anonymous";
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = jerseySrc;
    });

    const faceImage = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = faceDataUrl;
    });
    const faceBounds = await detectFaceBounds(faceImage);
    const maskCanvas = await runSelfieSegmentation(faceImage);

    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 1600;
    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Unable to create avatar canvas");
    }

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(jerseyImage, 0, 0, canvas.width, canvas.height);

    // Increase face size and position it; use FaceMesh landmarks to auto-align if available
    const faceSize = 460;
    const faceCutout = buildFaceCutout(faceImage, faceBounds, maskCanvas, faceSize);
    const teamKey = resolveTeamKey(teamName);
    const align = jerseyAlignmentMap[teamKey] || { dx: 0, dy: 0, scale: 1 };

    // Try landmarks for rotation/scale
    let finalSize = Math.round(faceSize * (align.scale || 1));
    let angle = 0;
    let noseVerticalAdjust = 0;
    try {
      const landmarks = await runFaceMesh(faceImage);
      if (landmarks && landmarks.length > 0) {
        // common indices: 33 = left eye outer, 263 = right eye outer, 1 = nose tip, 152 = chin
        const left = landmarks[33];
        const right = landmarks[263];
        const nose = landmarks[1] || landmarks[4] || null;
        const chin = landmarks[152] || null;
        const sw = faceImage.width || faceImage.naturalWidth;
        const sh = faceImage.height || faceImage.naturalHeight;
        const minDim = Math.min(sw, sh) || 1;

        if (left && right) {
          const dx = right.x - left.x;
          const dy = right.y - left.y;
          const eyeDist = Math.hypot(dx, dy);
          const eyeDistNorm = eyeDist / minDim;
          const desiredEyeRatio = 0.46; // desired fraction of face width occupied by eyes
          const scaleMultiplier = (desiredEyeRatio / (eyeDistNorm || 0.001)) * (align.scale || 1);
          finalSize = Math.round(faceSize * scaleMultiplier);
          angle = Math.atan2(dy, dx);
        }

        // Compute nose position relative to the square crop used by buildFaceCutout
        if (nose) {
          const sw = faceImage.width || faceImage.naturalWidth;
          const sh = faceImage.height || faceImage.naturalHeight;
          let relX = nose.x / sw;
          let relY = nose.y / sh;

          // replicate center-crop logic from buildFaceCutout
          if (sw / sh > 1) {
            // source wider
            const crop = sh;
            const offsetX = Math.round((sw - crop) / 2);
            relX = (nose.x - offsetX) / crop;
            relY = nose.y / crop;
          } else {
            const crop = sw;
            const offsetY = Math.round((sh - crop) / 2);
            relX = nose.x / crop;
            relY = (nose.y - offsetY) / crop;
          }

          // nose position in the faceCutout (which is faceSize square)
          const ty = relY * faceSize;
          // nose position in the final drawn image after scaling
          const noseYInFinal = ty * (finalSize / faceSize);
          const desiredNoseRatio = 0.36; // desired nose Y fraction within face
          const desiredNoseInFinal = desiredNoseRatio * finalSize;
          const deltaY = desiredNoseInFinal - noseYInFinal;

          // apply vertical shift so nose aligns with desired position (move image up by deltaY)
          // later we subtract deltaY from faceY
          // store adjustment in a variable
          noseVerticalAdjust = Math.round(deltaY);
        }
      }
    } catch {
      // ignore and fallback to defaults
    }

    const faceX = Math.round((canvas.width - finalSize) / 2 + (align.dx || 0));
    // move higher by default and apply team dy; also apply nose-based adjustment if available
    const baseY = Math.round(120 + (align.dy || 0) - Math.round((finalSize - faceSize) / 6));
    const faceY = typeof noseVerticalAdjust !== 'undefined' ? baseY - noseVerticalAdjust : baseY;

    // Instead of finalizing here, return the face cutout so it can be edited on the jersey preview
    const faceCutoutDataUrl = faceCutout.toDataURL("image/png");
    return faceCutoutDataUrl;

    // No outline: keep pasted face natural

    return canvas.toDataURL("image/png");
  };

  const takePhoto = async () => {
    const video = videoRef.current;
    if (!video || !cameraReady) {
      setCaptureError("Camera is not ready yet.");
      return;
    }

    setIsTakingPhoto(true);
    setCaptureError(null);

    try {
      const cropped = cropFromVideoOverlay();
      if (!cropped) throw new Error("Failed to capture");
      const faceCutoutUrl = await composeAvatar(cropped);
      // show editable face on jersey preview (default small, top)
      setEditingFaceUrl(faceCutoutUrl);
      setShowAvatarMaker(true);
      setEditingBaseSize(420);
      const defaultScale = 0.32;
      setEditTransform({ x: Math.round(1200 / 2 - (420 * defaultScale) / 2), y: 54, scale: defaultScale, rotation: 0 });
      setToastMessage(`Adjust face on jersey then Download`);
    } catch (error: any) {
      setCaptureError(error?.message || "Failed to create avatar");
    } finally {
      setIsTakingPhoto(false);
    }
  };

  const choosePhotoFromDevice = () => {
    captureInputRef.current?.click();
  };

  const handleDevicePhoto = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsTakingPhoto(true);
    setCaptureError(null);

    try {
      const imageDataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ""));
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Instead of immediately composing, let user adjust overlay on the uploaded image
      setPreviewImageUrl(imageDataUrl);
    } catch (error: any) {
      setCaptureError(error?.message || "Failed to load image");
    } finally {
      setIsTakingPhoto(false);
      event.target.value = "";
    }
  };

  const cropFromVideoOverlay = (): string | null => {
    const video = videoRef.current;
    if (!video) return null;

    const vw = video.videoWidth;
    const vh = video.videoHeight;
    if (!vw || !vh) return null;

    // overlayCenter, overlaySize are normalized relative to container; map to source pixels
    const minDim = Math.min(vw, vh);
    const cropW = overlaySize * minDim;
    const cropH = overlaySize * minDim;
    const sx = Math.max(0, Math.round(overlayCenter.x * vw - cropW / 2));
    const sy = Math.max(0, Math.round(overlayCenter.y * vh - cropH / 2));
    const sW = Math.min(vw - sx, Math.round(cropW));
    const sH = Math.min(vh - sy, Math.round(cropH));

    const canvas = document.createElement("canvas");
    canvas.width = sW;
    canvas.height = sH;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(video, sx, sy, sW, sH, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/png");
  };

  const applyCropToPreview = async () => {
    if (!previewImageUrl) return;

    const img = new Image();
    img.src = previewImageUrl;
    await new Promise((r) => (img.onload = r));

    const iw = img.width;
    const ih = img.height;
    const minDim = Math.min(iw, ih);
    const cropW = overlaySize * minDim;
    const cropH = overlaySize * minDim;
    const sx = Math.max(0, Math.round(overlayCenter.x * iw - cropW / 2));
    const sy = Math.max(0, Math.round(overlayCenter.y * ih - cropH / 2));
    const sW = Math.min(iw - sx, Math.round(cropW));
    const sH = Math.min(ih - sy, Math.round(cropH));

    const canvas = document.createElement("canvas");
    canvas.width = sW;
    canvas.height = sH;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(img, sx, sy, sW, sH, 0, 0, canvas.width, canvas.height);
    const croppedDataUrl = canvas.toDataURL("image/png");

    // Compose using cropped data URL (we still run segmentation inside composeAvatar)
    const faceCutoutUrl = await composeAvatar(croppedDataUrl);
    setEditingFaceUrl(faceCutoutUrl);
    setEditingBaseSize(420);
    const defaultScale = 0.32;
    setEditTransform({ x: Math.round(1200 / 2 - (420 * defaultScale) / 2), y: 54, scale: defaultScale, rotation: 0 });
    setShowAvatarMaker(true);
    setToastMessage(`Adjust face on jersey then Download`);
    setPreviewImageUrl(null);
  };

  const downloadCapturedAvatar = () => {
    if (!capturedAvatar || typeof window === "undefined") return;

    const link = document.createElement("a");
    const safeName = player.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    link.href = capturedAvatar;
    link.download = `${safeName || "player"}-jersey-avatar.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setToastMessage("Avatar download started");
  };

  const relatedInsights = player.insights.slice(0, 3);
  const relatedStrengths = player.strengths.slice(0, 4);

  const { user } = useAuth();

  function formatResponseMessage(body: ResponseMessageBody, defaultMsg: string, status?: number) {
    if (!body) return `${defaultMsg}${status ? ` (${status})` : ""}`;
    if (typeof body === "string") {
      const text = body.trim();
      return text ? text : `${defaultMsg}${status ? ` (${status})` : ""}`;
    }
    if (isRecord(body)) {
      if (body.error) return String(body.error);
      if (body.message) return String(body.message);
      try {
        const s = JSON.stringify(body);
        return s === '{}' ? `${defaultMsg}${status ? ` (${status})` : ""}` : s;
      } catch {
        return `${defaultMsg}${status ? ` (${status})` : ""}`;
      }
    }
    return `${defaultMsg}${status ? ` (${status})` : ""}`;
  }

  useEffect(() => {
    if (!user?.email || !player?.name) return;

    const uid = user.userId || user.email;

    (async () => {
      setIsFollowLoading(true);
      try {
        const res = await fetch(`/api/following?userId=${encodeURIComponent(uid)}`, {
          credentials: 'include',
        });
        if (!res.ok) return;
        const data = (await res.json().catch(() => null)) as FollowingListResponse | null;
        const list = Array.isArray(data?.following) ? data.following : [];
        const match = list.find((item) => normalizeString(item.followingplayername) === normalizeString(player.name));
        if (match) {
          setIsFollowing(true);
        } else {
          setIsFollowing(false);
        }
      } catch {
        // ignore
      } finally {
        setIsFollowLoading(false);
      }
    })();
  }, [user?.email, user?.userId, player?.name]);

  const handleFollowClick = async () => {
    if (isFollowing) {
      setShowUnfollowConfirm(true);
      return;
    }

    if (!user?.email) {
      setToastMessage("Please sign in to follow players");
      return;
    }

    setIsFollowLoading(true);
    setIsFollowing(true);
    try {
      const payload = {
        userId: user.userId || user.email,
        userEmail: user.email,
        followingplayername: player.name,
      };

      // debug: log request details
      try {
        console.debug('FOLLOW REQ', { url: '/api/following', method: 'POST', payload });
      } catch {}

      const res = await fetch("/api/following", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      let body: ResponseMessageBody = null;
      try {
        body = await res.json();
      } catch {
        try {
          body = await res.text();
        } catch {
          body = null;
        }
      }
      try {
        console.debug('FOLLOW RES', { status: res.status, body });
      } catch {}

      if (res.status === 201) {
        setToastMessage(`Following ${player.name}`);
      } else if (res.status === 401 || res.status === 403) {
        setToastMessage("Please sign in to follow players");
        setIsFollowing(false);
        signIn();
        return;
      } else if (res.status === 409) {
        setToastMessage(formatResponseMessage(body, "Already following", res.status));
        setIsFollowing(true);
      } else {
        setToastMessage(formatResponseMessage(body, "Failed to follow player", res.status));
        setIsFollowing(false);
      }
    } catch {
      setToastMessage("Failed to follow player");
      setIsFollowing(false);
    } finally {
      setIsFollowLoading(false);
    }
  };

  const confirmUnfollow = async () => {
    if (!user?.email) {
      setToastMessage("Please sign in to unfollow players");
      setShowUnfollowConfirm(false);
      return;
    }

    setShowUnfollowConfirm(false);
    setIsFollowLoading(true);
    setIsFollowing(false);

    const uid = user.userId || user.email;

    try {
      const reqBody = { userId: uid, followingplayername: player.name };
      try { console.debug('UNFOLLOW REQ', { url: '/api/following', method: 'DELETE', body: reqBody }); } catch {}

      let res = await fetch("/api/following", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify(reqBody),
      });

      let body: ResponseMessageBody = null;
      try {
        body = await res.json();
      } catch {
        try { body = await res.text(); } catch { body = null; }
      }
      try { console.debug('UNFOLLOW RES', { status: res.status, body }); } catch {}

      // Fallbacks for 405 Method Not Allowed
      if (res.status === 405) {
        // 1) Try DELETE with query params
        const q = `/api/following?userId=${encodeURIComponent(uid)}&followingplayername=${encodeURIComponent(player.name)}`;
        try { console.debug('UNFOLLOW FALLBACK 1', { q }); } catch {}
        res = await fetch(q, { method: 'DELETE', credentials: 'include' });
        try { body = await res.json().catch(() => res.text().catch(() => null)); } catch { body = null; }
        try { console.debug('UNFOLLOW FALLBACK 1 RES', { status: res.status, body }); } catch {}
      }

      if (res.status === 405) {
        // 2) Try POST to an 'unfollow' action endpoint (some backends prefer POST)
        const unfollowUrl = process.env.NEXT_PUBLIC_FOLLOWING_API_URL ? new URL('/unfollow', process.env.NEXT_PUBLIC_FOLLOWING_API_URL).pathname : '/api/following/unfollow';
        try { console.debug('UNFOLLOW FALLBACK 2', { url: unfollowUrl }); } catch {}
        res = await fetch(unfollowUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(reqBody) });
        try { body = await res.json().catch(() => res.text().catch(() => null)); } catch { body = null; }
        try { console.debug('UNFOLLOW FALLBACK 2 RES', { status: res.status, body }); } catch {}
      }

      if (res.status === 200 || res.status === 204) {
        setToastMessage(`Unfollowed ${player.name}`);
      } else if (res.status === 401 || res.status === 403) {
        setToastMessage("Please sign in to unfollow players");
        setIsFollowing(true);
        signIn();
        return;
      } else {
        setToastMessage(formatResponseMessage(body, `Failed to unfollow`, res.status));
        setIsFollowing(true);
      }
    } catch {
      setToastMessage("Failed to unfollow");
      setIsFollowing(true);
    } finally {
      setIsFollowLoading(false);
    }
  };

  const cancelUnfollow = () => setShowUnfollowConfirm(false);

  const toggleWatch = () => setIsWatching((c) => !c);

  const openShareDialog = () => {
    setShowShareDialog(true);
    setCopied(false);
  };

  const closeShareDialog = () => {
    setShowShareDialog(false);
    setCopied(false);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      try {
        const input = document.createElement("textarea");
        input.value = text;
        input.style.position = "fixed";
        input.style.opacity = "0";
        document.body.appendChild(input);
        input.focus();
        input.select();
        const ok = document.execCommand("copy");
        document.body.removeChild(input);
        return ok;
      } catch {
        return false;
      }
    }
  };

  const buildPlayerShareUrl = () => {
    if (typeof window === "undefined") return "";
    return window.location.href;
  };

  const buildPlayerShareText = () => {
    const previewLink = buildPlayerShareUrl();
    return [
      `Check out ${player.name}'s profile`,
      previewLink ? `View profile: ${previewLink}` : "",
    ].filter(Boolean).join("\n");
  };

  const handleShareToWhatsApp = () => {
    const shareText = buildPlayerShareText();
    const whatsappAppUrl = `whatsapp://send?text=${encodeURIComponent(shareText)}`;
    const whatsappWebFallbackUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;

    const opened = window.open(whatsappAppUrl, "_self");
    if (!opened) {
      window.location.href = whatsappWebFallbackUrl;
    }
  };

  const handleShareToThreads = () => {
    const shareText = buildPlayerShareText();
    window.open(`https://www.threads.net/intent/post?text=${encodeURIComponent(shareText)}`, "_blank", "noopener,noreferrer");
  };

  const handleShareToInstagram = async () => {
    const shareText = buildPlayerShareText();
    await copyToClipboard(shareText);
    setCopied(true);
    window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
    setTimeout(() => setCopied(false), 1600);
  };

  const handleShareToLinkedIn = () => {
    const shareUrl = buildPlayerShareUrl();
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, "_blank", "noopener,noreferrer");
  };

  const handleShareToX = () => {
    const shareText = buildPlayerShareText();
    window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}`, "_blank", "noopener,noreferrer");
  };

  const handleCopyLink = async () => {
    const ok = await copyToClipboard(buildPlayerShareText());
    if (!ok) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const shareButtons = (size: string) => (
    <>
      {[
        { handler: handleShareToWhatsApp, src: "/images/share_whatsapp.png", alt: "WhatsApp" },
        { handler: handleShareToThreads, src: "/images/share_thread.png", alt: "Threads" },
        { handler: handleShareToInstagram, src: "/images/share_insta.png", alt: "Instagram" },
        { handler: handleShareToLinkedIn, src: "/images/Share_linkedin.png", alt: "LinkedIn" },
        { handler: handleShareToX, src: "/images/Share_X.png", alt: "X" },
        { handler: handleCopyLink, src: "/images/share_copy_link.png", alt: "Copy" },
      ].map(({ handler, src, alt }) => (
        <button
          key={alt}
          onClick={handler}
          className={`${size} shrink-0 rounded-full overflow-hidden bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center`}
          aria-label={`Share on ${alt}`}
        >
          <img src={src} alt={alt} className="w-full h-full object-cover rounded-full" />
        </button>
      ))}
    </>
  );

  return (
    <div className="flex flex-col gap-4 px-4 md:px-6 pt-4 pb-4">
      {toastMessage && (
        <div className="rounded-2xl border border-[#e91e8c]/30 bg-[#24111c] px-4 py-3 text-sm font-medium text-white">
          {toastMessage}
        </div>
      )}

      {showUnfollowConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={cancelUnfollow} />
          <div className="relative w-[90%] max-w-md bg-[#111] border border-[#2a2a2a] rounded-xl p-6 z-10">
            <p className="text-white text-lg font-bold">Unfollow {player.name}?</p>
            <p className="text-sm text-[#b5b5b5] mt-2">Are you sure you want to unfollow {player.name}?</p>
            <div className="mt-4 flex gap-3 justify-end">
              <button onClick={cancelUnfollow} className="px-4 py-2 rounded-full bg-transparent border border-[#3a3a3a] text-white">Cancel</button>
              <button onClick={confirmUnfollow} className="px-4 py-2 rounded-full bg-gradient-to-r from-[#e91e8c] to-[#ff5722] text-white font-bold">Unfollow</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 md:gap-3">
        <button
          onClick={handleFollowClick}
          disabled={isFollowLoading}
          className={`flex flex-1 items-center justify-center gap-2 h-[46px] md:h-[52px] rounded-full text-white text-[14px] md:text-base font-bold tracking-wide border-0 cursor-pointer hover:opacity-90 transition-opacity bg-gradient-to-r from-[#e91e8c] to-[#ff5722] ${isFollowLoading ? "opacity-70 pointer-events-none" : ""}`}
        >
          {isFollowLoading ? (
            <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" strokeOpacity="0.2" fill="none" />
              <path d="M22 12a10 10 0 0 1-10 10" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" />
            </svg>
          ) : (
            <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <line x1="19" y1="8" x2="19" y2="14" />
              <line x1="22" y1="11" x2="16" y2="11" />
            </svg>
          )}
          {isFollowing ? "Following" : "Follow"}
        </button>

        <button
          onClick={toggleWatch}
          className={`flex flex-1 items-center justify-center gap-2 h-[46px] md:h-[52px] rounded-full text-[14px] md:text-base font-bold cursor-pointer transition-colors ${
            isWatching
              ? "bg-[#e91e8c]/15 border border-[#e91e8c] text-white"
              : "bg-transparent border border-[#e91e8c] text-[#e91e8c] hover:bg-[#e91e8c]/10"
          }`}
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          {isWatching ? "Watching" : "Watch Me"}
        </button>

        <button onClick={openShareDialog} className="flex items-center justify-center w-[46px] h-[46px] md:w-[52px] md:h-[52px] rounded-full bg-transparent border border-[#e91e8c] text-[#e91e8c] cursor-pointer shrink-0 hover:bg-[#e91e8c]/10 transition-colors" aria-label="Share player profile">
          <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
        </button>
      </div>

      {showShareDialog && (
        <>
          <button type="button" className="fixed inset-0 z-40 bg-black/70 lg:hidden" onClick={closeShareDialog} />
          <div className="fixed bottom-16 inset-x-4 z-50 mx-auto w-full max-w-[280px] rounded-2xl border border-white/10 bg-[#1a1a1e] p-3 shadow-2xl lg:hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-white text-sm font-semibold">Share</p>
              <button onClick={closeShareDialog} className="text-gray-400 hover:text-white" aria-label="Close share dialog">
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
              </button>
            </div>
            <div className="flex flex-row flex-nowrap items-center gap-1.5 mb-2 overflow-x-auto">{shareButtons("w-8 h-8")}</div>
            {copied && <p className="text-xs text-emerald-400">Copied to clipboard</p>}
          </div>
          <div className="hidden lg:flex fixed inset-0 z-50 items-center justify-center bg-black/60" onClick={closeShareDialog}>
            <div className="bg-[#1a1a1e] rounded-2xl border border-white/10 p-4 w-[300px] shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-white text-sm font-semibold">Share Player Profile</p>
                <button onClick={closeShareDialog} className="text-gray-400 hover:text-white" aria-label="Close share dialog">
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                </button>
              </div>
              <div className="rounded-xl border border-white/10 bg-[#111114] p-3 mb-3">
                <p className="text-white text-sm font-semibold line-clamp-2">{player.name}</p>
                <p className="text-white/45 text-[11px] mt-2 line-clamp-2 break-all">{buildPlayerShareUrl()}</p>
              </div>
              <div className="flex flex-row flex-nowrap items-center gap-2 mb-2">{shareButtons("w-9 h-9")}</div>
              {copied && <p className="text-xs text-emerald-400">Copied to clipboard</p>}
            </div>
          </div>
        </>
      )}

      {(!isFollowing && !isWatching) && (
        <div className="grid gap-4">
          {isFollowing && (
            <div className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-4 md:p-5">
              <SectionLabel text={`Related to ${player.name}`} />
              <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-white/80">
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">{player.team}</span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">{player.battingStyle}</span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">{player.bowlingStyle}</span>
              </div>

              {relatedStrengths.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-[#777] mb-2">Top strengths</p>
                  <div className="flex flex-wrap gap-2">
                    {relatedStrengths.map((strength) => (
                      <span key={strength} className="rounded-full bg-[#242424] px-3 py-1 text-sm text-white">
                        {strength}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {relatedInsights.length > 0 && (
                <div className="mt-4 space-y-3">
                  {relatedInsights.map((insight) => (
                    <div key={insight.title} className="rounded-xl bg-[#242424] p-3">
                      <p className="text-sm font-bold text-white">{insight.title}</p>
                      {!isFollowing && (
                        <p className="mt-1 text-sm text-[#b5b5b5]">{insight.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {isWatching && (
            <div className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-4 md:p-5">
              <SectionLabel text="Watch Me notifications" />
              <p className="mt-2 text-sm text-[#a7a7a7]">You’ll get updates whenever new clips or highlights are uploaded for this player.</p>

              <div className="mt-4 space-y-3">
                {activityItems.length > 0 ? (
                  activityItems.map((item) => (
                    <div key={item.id} className="rounded-xl bg-[#242424] p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-bold text-white">{item.title}</p>
                          <p className="mt-1 text-sm text-[#b5b5b5]">{item.detail}</p>
                        </div>
                        <span className="shrink-0 rounded-full border border-[#e91e8c]/30 bg-[#e91e8c]/10 px-2.5 py-1 text-[11px] font-semibold text-[#ffb7dd]">{item.time}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-xl bg-[#242424] p-3 text-sm text-[#b5b5b5]">No uploads yet. New player content will appear here automatically.</div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      <button className="flex w-full items-center justify-center gap-2 h-12 md:h-[52px] rounded-full bg-transparent border border-[#e91e8c] text-[#e91e8c] text-[13px] md:text-sm font-bold cursor-pointer hover:bg-[#e91e8c]/10 transition-colors">
        <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        Add to Playlist
      </button>

      <button
        type="button"
        onClick={() => {
          if (capturedAvatar) {
            // if we already have a generated avatar, open editor and show editable face
            setEditingFaceUrl(capturedAvatar);
            setEditingBaseSize(460);
            const defaultScale = 0.32;
            setEditTransform({ x: Math.round(1200 / 2 - (420 * defaultScale) / 2), y: 54, scale: defaultScale, rotation: 0 });
          }
          setShowAvatarMaker(true);
        }}
        className="flex w-full items-center justify-center gap-2 h-12 md:h-[52px] rounded-full bg-transparent border border-[#e91e8c] text-[#e91e8c] text-[13px] md:text-sm font-bold cursor-pointer hover:bg-[#e91e8c]/10 transition-colors"
      >
        <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.57a1 1 0 0 0 .99.84H7v10a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V10h3.15a1 1 0 0 0 .99-.84l.58-3.57a2 2 0 0 0-1.34-2.23z" />
        </svg>
        Make My Avatar in This Jersey
      </button>

      {showAvatarMaker && <AvatarMaker onClose={closeAvatarMaker} initialTeamName={player.team} />}

      <div className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-4 md:p-5">
        <SectionLabel text="Career Stats  (2021 - Present)" />
        <div className="grid grid-cols-3 gap-3 mt-3">
          {careerStatItems.map((s) => (
            <div key={s.label} className="flex flex-col items-center justify-center py-3.5 md:py-5 rounded-xl bg-[#242424]">
              <span className="text-[22px] md:text-[28px] font-extrabold text-white leading-none">{s.value}</span>
              <span className="text-[11px] md:text-xs text-[#777777] mt-1 tracking-wider">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-4 md:p-5">
        <SectionLabel text="Player Overview" />
        <div className="grid grid-cols-2 gap-3 mt-3">
          <div className="flex flex-col justify-center p-3.5 md:p-4 rounded-xl bg-[#242424] min-h-[70px] md:min-h-[84px]">
            <span className="text-[20px] md:text-[24px] font-extrabold text-white leading-tight">{player.overview.debut}</span>
            <span className="text-[11px] md:text-xs text-[#777777] mt-1">IPL Debut</span>
          </div>

          <div className="flex flex-col justify-center p-3.5 md:p-4 rounded-xl bg-[#242424] min-h-[70px] md:min-h-[84px]">
            <span className="text-[20px] md:text-[24px] font-extrabold text-[#e91e8c] leading-tight">{player.overview.specialization}</span>
            <span className="text-[11px] md:text-xs text-[#777777] mt-1">Specialization</span>
          </div>

          <div className="flex flex-col justify-center p-3.5 md:p-4 rounded-xl bg-[#242424] min-h-[70px] md:min-h-[84px]">
            <span className="text-[15px] md:text-[18px] font-extrabold text-white leading-tight">{player.overview.dob}</span>
            <span className="text-[11px] md:text-xs text-[#777777] mt-1">Date of Birth</span>
          </div>

          <div className="flex flex-col justify-center p-3.5 md:p-4 rounded-xl bg-[#242424] min-h-[70px] md:min-h-[84px]">
            <span className="text-[22px] md:text-[28px] font-extrabold text-[#ff9800] leading-tight">{player.overview.matches}</span>
            <span className="text-[11px] md:text-xs text-[#777777] mt-1">Matches</span>
          </div>
        </div>
      </div>
    </div>
  );
}
