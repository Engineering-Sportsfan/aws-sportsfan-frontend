// components/NewROARComponent/components/CreateFlashQuizModal.tsx
// Flash Quiz compose modal — matches reference design with ROAR dark theme

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  onPost: (payload: any) => void;
}

const DEFAULT_TIMER = 15;
const DEFAULT_POINTS = 100;

const inputBase: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 12,
  background: "rgba(0,0,0,0.45)",
  border: "1px solid rgba(255,255,255,0.1)",
  outline: "none",
  color: "#F5F5FA",
  fontSize: 14,
  fontFamily: "'DM Sans', sans-serif",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: "0.08em",
  color: "#9494AD",
  marginBottom: 6,
  display: "block",
  textTransform: "uppercase" as const,
};

export default function CreateFlashQuizModal({ open, onClose, onPost }: Props) {
  const [domReady, setDomReady] = useState(false);
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctOption, setCorrectOption] = useState<"A" | "B" | "C" | "D">("A");
  const [timer, setTimer] = useState(DEFAULT_TIMER);
  const [points, setPoints] = useState(DEFAULT_POINTS);

  useEffect(() => { setDomReady(true); }, []);

  useEffect(() => {
    if (!open) {
      setQuestion("");
      setOptions(["", "", "", ""]);
      setCorrectOption("A");
      setTimer(DEFAULT_TIMER);
      setPoints(DEFAULT_POINTS);
    }
  }, [open]);

  const optionLabels = ["A", "B", "C", "D"] as const;

  const updateOption = (idx: number, val: string) => {
    setOptions((prev) => {
      const next = [...prev];
      next[idx] = val;
      return next;
    });
  };

  const canLaunch =
    question.trim().length > 0 &&
    options[0].trim().length > 0 &&
    options[1].trim().length > 0;

  const handleLaunch = () => {
    onPost({
      type: "quiz",
      text: question.trim(),
      quizQuestion: question.trim(),
      quizOptions: options.map((o, i) => ({ label: optionLabels[i], text: o.trim() })).filter((o) => o.text),
      quizCorrectOption: correctOption,
      quizTimer: timer,
      quizPoints: points,
      sport: "cricket",
    });
    onClose();
  };

  const correctIdx = optionLabels.indexOf(correctOption);

  const content = (
    <div className="roar-root">
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              style={{
                position: "fixed", inset: 0, zIndex: 10060,
                background: "rgba(0,0,0,0.65)",
                backdropFilter: "blur(4px)",
              }}
            />

            {/* Sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              style={{
                position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 10070,
                background: "#111116",
                borderRadius: "28px 28px 0 0",
                border: "1px solid rgba(255,255,255,0.08)",
                boxShadow: "0 -8px 48px rgba(0,0,0,0.7)",
              }}
            >
              {/* Drag handle */}
              <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 0" }}>
                <div style={{ width: 40, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.15)" }} />
              </div>

              <div
                style={{
                  padding: "16px 20px 70px",
                  maxHeight: "82vh",
                  overflowY: "auto",
                  overscrollBehavior: "contain",
                }}
              >
                {/* Header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: 10,
                      background: "linear-gradient(135deg,rgba(233,30,140,0.25),rgba(255,107,53,0.15))",
                      border: "1px solid rgba(233,30,140,0.35)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 18,
                    }}>
                      🧠
                    </div>
                    <span style={{
                      fontFamily: "'Bebas Neue', sans-serif",
                      fontSize: 22,
                      letterSpacing: "0.06em",
                      color: "#F5F5FA",
                    }}>
                      CREATE FLASH QUIZ
                    </span>
                  </div>
                  <button
                    onClick={onClose}
                    style={{
                      width: 30, height: 30, borderRadius: "50%",
                      background: "rgba(255,255,255,0.07)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "#9494AD",
                      cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <X size={14} />
                  </button>
                </div>

                {/* Quiz Question */}
                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>Quiz Question</label>
                  <input
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="e.g. Which team scored the highest in IPL 2024?"
                    style={inputBase}
                    maxLength={200}
                  />
                </div>

                {/* Options 2×2 grid */}
                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>Options</label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {optionLabels.map((label, idx) => (
                      <div key={label} style={{ position: "relative" }}>
                        <input
                          value={options[idx]}
                          onChange={(e) => updateOption(idx, e.target.value)}
                          placeholder={`Option ${label}`}
                          style={{
                            ...inputBase,
                            paddingLeft: 36,
                            border: correctOption === label
                              ? "1px solid rgba(233,30,140,0.6)"
                              : "1px solid rgba(255,255,255,0.1)",
                            background: correctOption === label
                              ? "rgba(233,30,140,0.08)"
                              : "rgba(0,0,0,0.45)",
                          }}
                          maxLength={80}
                        />
                        <span style={{
                          position: "absolute",
                          left: 11,
                          top: "50%",
                          transform: "translateY(-50%)",
                          fontSize: 11,
                          fontWeight: 700,
                          color: correctOption === label ? "#E91E8C" : "#4A4A62",
                          fontFamily: "'Bebas Neue', sans-serif",
                          letterSpacing: "0.04em",
                        }}>
                          {label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Correct Option + Timer + Points row */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 24 }}>
                  {/* Correct Option */}
                  <div>
                   <label className="text-[11px] font-bold whitespace-nowrap tracking-widest text-[#9494AD] uppercase mb-1.5 block">Correct Option</label>
                    <div style={{ position: "relative" }}>
                      <select
                        value={correctOption}
                        onChange={(e) => setCorrectOption(e.target.value as typeof correctOption)}
                        style={{
                          ...inputBase,
                          paddingRight: 32,
                          appearance: "none",
                          cursor: "pointer",
                          fontWeight: 700,
                          color: "#E91E8C",
                        }}
                      >
                        {optionLabels.map((l) => (
                          <option key={l} value={l} style={{ background: "#111116", color: "#F5F5FA" }}>
                            {l}
                          </option>
                        ))}
                      </select>
                      {/* custom chevron */}
                      <span style={{
                        position: "absolute", right: 10, top: "50%",
                        transform: "translateY(-50%)",
                        fontSize: 10, color: "#9494AD", pointerEvents: "none",
                      }}>▼</span>
                    </div>
                  </div>

                  {/* Timer */}
                  {/* <div>
                    <label style={labelStyle}>Timer (sec)</label>
                    <input
                      type="number"
                      value={timer}
                      onChange={(e) => setTimer(Math.max(5, Math.min(120, Number(e.target.value))))}
                      min={5}
                      max={120}
                      style={{ ...inputBase, fontWeight: 700 }}
                    />
                  </div> */}

                  {/* Points — display only, backend always awards 2 */}
                  {/* <div>
                    <label style={labelStyle}>Points</label>
                    <input
                      type="number"
                      value={points}
                      onChange={(e) => setPoints(Math.max(10, Math.min(1000, Number(e.target.value))))}
                      min={10}
                      max={1000}
                      style={{ ...inputBase, fontWeight: 700 }}
                    />
                  </div> */}
                </div>

                {/* Preview of correct answer */}
                {options[correctIdx]?.trim() && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      marginBottom: 16,
                      padding: "10px 14px",
                      borderRadius: 12,
                      background: "rgba(0,232,198,0.07)",
                      border: "1px solid rgba(0,232,198,0.2)",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <span style={{ fontSize: 14 }}>✅</span>
                    <span style={{ fontSize: 12, color: "#00E8C6", fontWeight: 600 }}>
                      Correct: <span style={{ color: "#F5F5FA" }}>{options[correctIdx]}</span>
                    </span>
                  </motion.div>
                )}

                {/* Launch button */}
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  disabled={!canLaunch}
                  onClick={handleLaunch}
                  style={{
                    width: "100%",
                    padding: "15px",
                    borderRadius: 999,
                    fontSize: 15,
                    fontWeight: 700,
                    fontFamily: "'Bebas Neue', sans-serif",
                    letterSpacing: "0.08em",
                    border: "none",
                    cursor: canLaunch ? "pointer" : "not-allowed",
                    background: canLaunch
                      ? "linear-gradient(135deg,#E91E8C,#FF6B35)"
                      : "rgba(255,255,255,0.07)",
                    color: canLaunch ? "white" : "#4A4A62",
                    transition: "all 0.2s",
                    boxShadow: canLaunch ? "0 0 28px rgba(233,30,140,0.4)" : "none",
                  }}
                >
                  Launch Flash Quiz
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );

  if (!domReady) return null;
  return createPortal(content, document.body);
}