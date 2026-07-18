"use client";

import { useState, useCallback } from "react";
import { GLOBAL_CSS } from "@/src/components/NewROARComponent/constants/styles";
import ProfileScreen from "@/src/components/NewROARComponent/screens/Profile";

export default function ROARProfilePage() {
  const [userBadge, setUserBadge] = useState("RISING_FAN");

  // Toast state (simple inline toast — no ROAR orchestrator needed here)
  const [toastMsg, setToastMsg] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3200);
    setTimeout(() => setToastMsg(""), 3700);
  }, []);

  return (
    <div
      className="roar-root"
      style={{
        minHeight: "calc(100vh - 60px)",
        background: "#050508",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: GLOBAL_CSS }} />

      {/* Ambient background — same as the ROAR component */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: 0,
          background:
            "radial-gradient(ellipse 90% 55% at 50% -15%,rgba(233,30,140,0.18),transparent 55%),radial-gradient(ellipse 70% 45% at 100% 80%,rgba(255,107,53,0.12),transparent 50%),radial-gradient(ellipse 50% 40% at 0% 60%,rgba(0,232,198,0.08),transparent 45%),#050508",
        }}
      />

      {/* Floating sparks */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          pointerEvents: "none",
          zIndex: 0,
        }}
      >
        {[
          { left: "12%", color: "var(--accent-magenta)", size: 3, duration: "14s", delay: "0s" },
          { left: "28%", color: "var(--accent-orange)", size: 4, duration: "18s", delay: "2s" },
          { left: "50%", color: "var(--teal)", size: 3, duration: "15s", delay: "5s" },
          { left: "72%", color: "var(--accent-magenta)", size: 4, duration: "20s", delay: "1s" },
          { left: "88%", color: "var(--accent-yellow)", size: 3, duration: "16s", delay: "7s" },
        ].map(({ left, color, size, duration, delay }) => (
          <div
            key={left}
            style={{
              position: "absolute",
              bottom: -10,
              left,
              width: size,
              height: size,
              borderRadius: "50%",
              background: color,
              animation: `roar-driftUp ${duration} linear infinite ${delay}`,
            }}
          />
        ))}
      </div>

      {/* ROAR watermark */}
      <div
        style={{
          position: "absolute",
          bottom: 40,
          right: 0,
          left: 0,
          textAlign: "right",
          paddingRight: 12,
          fontFamily: "'Bebas Neue',sans-serif",
          fontSize: 72,
          color: "white",
          opacity: 0.04,
          pointerEvents: "none",
          zIndex: 0,
          letterSpacing: "0.1em",
        }}
      >
        ROAR
      </div>

      {/* Inline Toast */}
      {toastVisible && toastMsg && (
        <div
          style={{
            position: "fixed",
            top: 80,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 200,
            padding: "12px 20px",
            borderRadius: 20,
            textAlign: "center",
            fontWeight: 700,
            fontSize: 14,
            background: "var(--accent-magenta)",
            color: "white",
            boxShadow: "0 0 28px rgba(233,30,140,0.5)",
            pointerEvents: "none",
          }}
        >
          {toastMsg}
        </div>
      )}

      {/* Profile screen content — same component as ROAR in-app profile */}
      <div style={{ position: "relative", zIndex: 1 }}>
        <ProfileScreen
          userBadge={userBadge}
          setUserBadge={setUserBadge}
          onCompose={() => {
            // Navigate back to ROAR for composing
            window.location.href = "/MainModules/ROAR";
          }}
          onToast={showToast}
          setOnboarded={() => { }}
          onNavigateTab={() => { }}
        />
      </div>
    </div>
  );
}
