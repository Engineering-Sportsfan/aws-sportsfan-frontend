




// "use client";

// import { useState, useRef, useEffect, useCallback } from "react";
// import { useSearchParams } from "next/navigation";

// type Message =
//   | { role: "user"; content: string }
//   | { role: "assistant"; content: string }
//   | { role: "error"; type: "generic" | "network" };

// const SUGGESTED_QUESTIONS = [
//   "Who won the first IPL?",
//   "Which player has won the most Orange Cap awards in IPL history?",
//   "Which team has won the highest number of IPL titles (tied at 5 each)?",
// ];

// export default function AskAI() {
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [input, setInput] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [open, setOpen] = useState(true);
//   const bottomRef = useRef<HTMLDivElement>(null);
//   const inputRef = useRef<HTMLInputElement>(null);
//   const searchParams = useSearchParams();
//   const hasAutoSent = useRef(false);

//   useEffect(() => {
//     bottomRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages, loading]);

//   const sendMessage = useCallback(async (text: string) => {
//     const trimmed = text.trim();
//     if (!trimmed || loading) return;

//     const userMsg: Message = { role: "user", content: trimmed };
//     setMessages((prev) => [...prev, userMsg]);
//     setInput("");
//     setLoading(true);

//     const history = [...messages, userMsg]
//       .filter((m) => m.role === "user" || m.role === "assistant")
//       .map((m) => ({
//         role: m.role as "user" | "assistant",
//         content: (m as { content: string }).content,
//       }));

//     try {
//       const response = await fetch("https://api.anthropic.com/v1/messages", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           model: "claude-sonnet-4-20250514",
//           max_tokens: 1000,
//           system:
//             "You are Dolly, an AI cricket companion. You answer questions about cricket — IPL, international cricket, players, stats, history, and more. Be concise, engaging, and accurate. Format responses clearly with bullet points where appropriate.",
//           messages: history,
//         }),
//       });

//       if (!response.ok) throw new Error("api_error");

//       const data = await response.json();
//       const replyText = data.content
//         .filter((b: { type: string }) => b.type === "text")
//         .map((b: { text: string }) => b.text)
//         .join("\n");

//       setMessages((prev) => [...prev, { role: "assistant", content: replyText }]);
//     } catch (err: unknown) {
//       const isNetwork = err instanceof TypeError && err.message.includes("fetch");
//       setMessages((prev) => [
//         ...prev,
//         { role: "error", type: isNetwork ? "network" : "generic" },
//       ]);
//     } finally {
//       setLoading(false);
//     }
//   }, [loading, messages]);

//   useEffect(() => {
//     if (hasAutoSent.current) return;
//     const q = searchParams.get("q");
//     if (q?.trim()) {
//       hasAutoSent.current = true;
//       sendMessage(q.trim());
//     }
//   }, [searchParams, sendMessage]);

//   if (!open) return null;

//   const isEmpty = messages.length === 0;

//   return (
//     <div className="askai-root w-full min-h-screen text-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>
//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');

//         .askai-root * { box-sizing: border-box; }

//         .askai-root ::-webkit-scrollbar { width: 4px; }
//         .askai-root ::-webkit-scrollbar-track { background: transparent; }
//         .askai-root ::-webkit-scrollbar-thumb { background: #333; border-radius: 2px; }

//         @keyframes fadeUp {
//           from { opacity: 0; transform: translateY(10px); }
//           to   { opacity: 1; transform: translateY(0); }
//         }
//         @keyframes spin { to { transform: rotate(360deg); } }
//         @keyframes pulse {
//           0%, 100% { opacity: 0.4; transform: scale(1); }
//           50%       { opacity: 1;   transform: scale(1.15); }
//         }

//         .askai-root .msg-anim { animation: fadeUp 0.25s ease both; }

//         .askai-root .suggestion-btn {
//           display: flex; align-items: center; gap: 8px;
//           background: none; border: none; cursor: pointer;
//           color: #ccc; font-size: 14px; font-family: inherit;
//           text-align: left; padding: 4px 0;
//           transition: color 0.15s;
//         }
//         .askai-root .suggestion-btn:hover { color: #fff; }

//         .askai-root .send-btn {
//           width: 40px; height: 40px; border-radius: 50%; border: none; cursor: pointer;
//           background: linear-gradient(135deg, #ff4d4d, #ff8c42);
//           display: flex; align-items: center; justify-content: center;
//           flex-shrink: 0; transition: opacity 0.15s, transform 0.15s;
//         }
//         .askai-root .send-btn:hover { opacity: 0.9; transform: scale(1.05); }
//         .askai-root .send-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

//         .askai-root .input-box {
//           flex: 1; background: none; border: none; outline: none;
//           color: #fff; font-size: 16px; font-family: inherit;
//         }
//         .askai-root .input-box::placeholder { color: #555; }

//         .askai-root .error-bubble {
//           display: flex; align-items: flex-start; gap: 10px;
//           background: rgba(180, 30, 30, 0.18);
//           border: 1px solid rgba(220, 60, 60, 0.3);
//           border-radius: 12px; padding: 14px 16px;
//           font-size: 14px; color: #f8a8a8; max-width: 500px;
//         }

//         .askai-root .network-error-banner {
//           background: #1a1a1a; border: 1px solid #2a2a2a;
//           border-radius: 12px; padding: 14px 18px;
//           display: flex; align-items: flex-start; gap: 12px;
//           max-width: 380px; align-self: center;
//           font-size: 14px;
//         }

//         .askai-root .dot-loader span {
//           display: inline-block; width: 7px; height: 7px; border-radius: 50%;
//           background: #ff6a3d; margin: 0 2px;
//           animation: pulse 1.2s ease-in-out infinite;
//         }
//         .askai-root .dot-loader span:nth-child(2) { animation-delay: 0.2s; }
//         .askai-root .dot-loader span:nth-child(3) { animation-delay: 0.4s; }
//       `}</style>

//       {/* ── Main content area ── */}
//       <div style={{ minHeight: "calc(100vh - 104px)", width: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 24px" }}>
//         {isEmpty ? (
//           /* ── Welcome screen ── */
//           <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 40, width: "100%" }}>
//             <h1 style={{ fontSize: 32, fontWeight: 600, letterSpacing: "-0.5px", textAlign: "center" }}>
//               Your AI companion for everything cricket
//             </h1>

//             <div style={{ width: "100%", maxWidth: 580, background: "#1c1c1c", border: "1px solid #2a2a2a", borderRadius: 16, padding: "14px 16px", display: "flex", alignItems: "center", gap: 10 }}>
//               <input
//                 ref={inputRef}
//                 className="input-box"
//                 maxLength={100}
//                 placeholder="Ask anything"
//                 value={input}
//                 onChange={(e) => setInput(e.target.value)}
//                 onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
//               />
//               <button style={{ background: "none", border: "none", cursor: "pointer", color: "#666", display: "flex" }}>
//                 <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
//                   <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3zm7 10a1 1 0 0 0-2 0 5 5 0 0 1-10 0 1 1 0 0 0-2 0 7 7 0 0 0 6 6.93V20H9a1 1 0 0 0 0 2h6a1 1 0 0 0 0-2h-2v-2.07A7 7 0 0 0 19 11z" />
//                 </svg>
//               </button>
//               <button
//                 className="send-btn"
//                 disabled={!input.trim() || loading}
//                 onClick={() => sendMessage(input)}
//               >
//                 <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
//                   <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
//                 </svg>
//               </button>
//             </div>

//             <div style={{ width: "100%", maxWidth: 580, marginTop: 12 }}>
//               <div style={{ marginLeft: 16 }}>
//                 {SUGGESTED_QUESTIONS.map((q) => (
//                   <div key={q} style={{ display: "flex", alignItems: "center", gap: 10, color: "#cfcfcf", fontSize: 14, padding: "6px 0" }}>
//                     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
//                       <circle cx="11" cy="11" r="6" />
//                       <line x1="21" y1="21" x2="16.65" y2="16.65" />
//                     </svg>
//                     <button
//                       onClick={() => sendMessage(q)}
//                       style={{ background: "transparent", border: "none", color: "inherit", textAlign: "left", padding: 0, cursor: "pointer" }}
//                     >
//                       {q}
//                     </button>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         ) : (
//           /* ── Chat messages ── */
//           <div style={{ display: "flex", flexDirection: "column", gap: 24, paddingTop: 48, paddingBottom: 24, maxWidth: 680, width: "100%", alignSelf: "center" }}>
//             {messages.map((msg, i) => {
//               if (msg.role === "user") {
//                 return (
//                   <div key={i} className="msg-anim" style={{ display: "flex", justifyContent: "flex-end" }}>
//                     <div style={{ background: "#1e1e1e", borderRadius: "16px 16px 4px 16px", padding: "10px 16px", fontSize: 15, maxWidth: "70%", color: "#eee" }}>
//                       {msg.content}
//                     </div>
//                   </div>
//                 );
//               }

//               if (msg.role === "assistant") {
//                 return (
//                   <div key={i} className="msg-anim" style={{ fontSize: 15, lineHeight: 1.7, color: "#ddd" }}>
//                     {msg.content.split("\n").map((line, li) => {
//                       const bullet = line.match(/^[•\-\*] (.+)/);
//                       if (bullet) {
//                         return (
//                           <div key={li} style={{ display: "flex", gap: 8, marginTop: 4 }}>
//                             <span style={{ color: "#ff6a3d", marginTop: 2 }}>•</span>
//                             <span>{bullet[1]}</span>
//                           </div>
//                         );
//                       }
//                       if (line.startsWith("##")) {
//                         return <p key={li} style={{ fontWeight: 600, color: "#fff", marginTop: 12, marginBottom: 4 }}>{line.replace(/^#+\s*/, "")}</p>;
//                       }
//                       if (line.trim() === "") return <div key={li} style={{ height: 8 }} />;
//                       return <p key={li}>{line}</p>;
//                     })}
//                   </div>
//                 );
//               }

//               if (msg.role === "error") {
//                 if (msg.type === "network") {
//                   return (
//                     <div key={i} className="msg-anim network-error-banner">
//                       <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#ff4d4d,#ff8c42)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
//                         <span style={{ fontSize: 14 }}>!</span>
//                       </div>
//                       <div>
//                         <div style={{ fontWeight: 600, marginBottom: 2 }}>Network error</div>
//                         <div style={{ color: "#888", fontSize: 13 }}>Please check your internet connection.</div>
//                       </div>
//                     </div>
//                   );
//                 }
//                 return (
//                   <div key={i} className="msg-anim error-bubble">
//                     <div style={{ width: 22, height: 22, borderRadius: "50%", background: "linear-gradient(135deg,#ff4d4d,#ff8c42)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 12 }}>
//                       !
//                     </div>
//                     <span>Something went wrong. If this issue persists please report it through our help centre.</span>
//                   </div>
//                 );
//               }

//               return null;
//             })}

//             {loading && (
//               <div className="dot-loader">
//                 <span /><span /><span />
//               </div>
//             )}

//             <div ref={bottomRef} />
//           </div>
//         )}
//       </div>

//       {/* ── Bottom input (chat mode) ── */}
//       {!isEmpty && (
//         <div style={{ padding: "16px 24px 24px", flexShrink: 0 }}>
//           <div style={{ maxWidth: 680, margin: "0 auto", background: "#1c1c1c", border: "1px solid #2a2a2a", borderRadius: 16, padding: "14px 16px", display: "flex", alignItems: "center", gap: 10 }}>
//             <input
//               ref={inputRef}
//               className="input-box"
//               maxLength={100}
//               placeholder="Ask anything"
//               value={input}
//               onChange={(e) => setInput(e.target.value)}
//               onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
//               disabled={loading}
//             />
//             <button style={{ background: "none", border: "none", cursor: "pointer", color: "#666", display: "flex" }}>
//               <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
//                 <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3zm7 10a1 1 0 0 0-2 0 5 5 0 0 1-10 0 1 1 0 0 0-2 0 7 7 0 0 0 6 6.93V20H9a1 1 0 0 0 0 2h6a1 1 0 0 0 0-2h-2v-2.07A7 7 0 0 0 19 11z" />
//               </svg>
//             </button>
//             <button
//               className="send-btn"
//               disabled={!input.trim() || loading}
//               onClick={() => sendMessage(input)}
//             >
//               <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
//                 <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
//               </svg>
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }









"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { usePostHog } from "posthog-js/react";

type Message =
  | { role: "user"; content: string }
  | { role: "assistant"; content: string }
  | { role: "error"; type: "generic" | "network" };

const SUGGESTED_QUESTIONS = [
  "Who won the first IPL?",
  "Which player has won the most Orange Cap awards in IPL history?",
  "Which team has won the highest number of IPL titles (tied at 5 each)?",
];

export default function AskAI() {
  const phog = usePostHog();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchParams = useSearchParams();
  const hasAutoSent = useRef(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    if (phog) {
      phog.capture("ask_dolly_query", { query: trimmed });
    }

    const userMsg: Message = { role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    const history = [...messages, userMsg]
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({
        role: m.role as "user" | "assistant",
        content: (m as { content: string }).content,
      }));

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system:
            "You are Dolly, an AI cricket companion. You answer questions about cricket — IPL, international cricket, players, stats, history, and more. Be concise, engaging, and accurate. Format responses clearly with bullet points where appropriate.",
          messages: history,
        }),
      });

      if (!response.ok) throw new Error("api_error");

      const data = await response.json();
      const replyText = data.content
        .filter((b: { type: string }) => b.type === "text")
        .map((b: { text: string }) => b.text)
        .join("\n");

      setMessages((prev) => [...prev, { role: "assistant", content: replyText }]);
    } catch (err: unknown) {
      const isNetwork = err instanceof TypeError && err.message.includes("fetch");
      setMessages((prev) => [
        ...prev,
        { role: "error", type: isNetwork ? "network" : "generic" },
      ]);
    } finally {
      setLoading(false);
    }
  }, [loading, messages]);

  useEffect(() => {
    if (hasAutoSent.current) return;
    const q = searchParams.get("q");
    if (q?.trim()) {
      hasAutoSent.current = true;
      sendMessage(q.trim());
    }
  }, [searchParams, sendMessage]);

  if (!open) return null;

  const isEmpty = messages.length === 0;

  return (
    <div className="askai-root w-full min-h-screen text-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');

        .askai-root * { box-sizing: border-box; }

        .askai-root ::-webkit-scrollbar { width: 4px; }
        .askai-root ::-webkit-scrollbar-track { background: transparent; }
        .askai-root ::-webkit-scrollbar-thumb { background: #333; border-radius: 2px; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50%       { opacity: 1;   transform: scale(1.15); }
        }

        .askai-root .msg-anim { animation: fadeUp 0.25s ease both; }

        .askai-root .suggestion-btn {
          display: flex; align-items: center; gap: 8px;
          background: none; border: none; cursor: pointer;
          color: #ccc; font-size: 14px; font-family: inherit;
          text-align: left; padding: 4px 0;
          transition: color 0.15s;
        }
        .askai-root .suggestion-btn:hover { color: #fff; }

        .askai-root .send-btn {
          width: 40px; height: 40px; border-radius: 50%; border: none; cursor: pointer;
          background: linear-gradient(135deg, #ff4d4d, #ff8c42);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; transition: opacity 0.15s, transform 0.15s;
        }
        .askai-root .send-btn:hover { opacity: 0.9; transform: scale(1.05); }
        .askai-root .send-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

        .askai-root .input-box {
          flex: 1; background: none; border: none; outline: none;
          color: #fff; font-size: 16px; font-family: inherit;
        }
        .askai-root .input-box::placeholder { color: #555; }

        .askai-root .error-bubble {
          display: flex; align-items: flex-start; gap: 10px;
          background: rgba(180, 30, 30, 0.18);
          border: 1px solid rgba(220, 60, 60, 0.3);
          border-radius: 12px; padding: 14px 16px;
          font-size: 14px; color: #f8a8a8; max-width: 500px;
        }

        .askai-root .network-error-banner {
          background: #1a1a1a; border: 1px solid #2a2a2a;
          border-radius: 12px; padding: 14px 18px;
          display: flex; align-items: flex-start; gap: 12px;
          max-width: 380px; align-self: center;
          font-size: 14px;
        }

        .askai-root .dot-loader span {
          display: inline-block; width: 7px; height: 7px; border-radius: 50%;
          background: #ff6a3d; margin: 0 2px;
          animation: pulse 1.2s ease-in-out infinite;
        }
        .askai-root .dot-loader span:nth-child(2) { animation-delay: 0.2s; }
        .askai-root .dot-loader span:nth-child(3) { animation-delay: 0.4s; }
      `}</style>

      {/* ── Main content area ── */}
      <div style={{ minHeight: "calc(100vh - 104px)", width: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 24px" }}>
        {isEmpty ? (
          /* ── Welcome screen ── */
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 40, width: "100%" }}>
            <h1 style={{ fontSize: 32, fontWeight: 600, letterSpacing: "-0.5px", textAlign: "center" }}>
              Your AI companion for everything cricket
            </h1>

            <div style={{ width: "100%", maxWidth: 580, background: "#1c1c1c", border: "1px solid #2a2a2a", borderRadius: 16, padding: "14px 16px", display: "flex", alignItems: "center", gap: 10 }}>
              <input
                ref={inputRef}
                className="input-box"
                maxLength={100}
                placeholder="Ask anything"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
              />
              <button style={{ background: "none", border: "none", cursor: "pointer", color: "#666", display: "flex" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3zm7 10a1 1 0 0 0-2 0 5 5 0 0 1-10 0 1 1 0 0 0-2 0 7 7 0 0 0 6 6.93V20H9a1 1 0 0 0 0 2h6a1 1 0 0 0 0-2h-2v-2.07A7 7 0 0 0 19 11z" />
                </svg>
              </button>
              <button
                className="send-btn"
                disabled={!input.trim() || loading}
                onClick={() => sendMessage(input)}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                  <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
                </svg>
              </button>
            </div>

            <div style={{ width: "100%", maxWidth: 580, marginTop: 12 }}>
              <div style={{ marginLeft: 16 }}>
                {SUGGESTED_QUESTIONS.map((q) => (
                  <div key={q} style={{ display: "flex", alignItems: "center", gap: 10, color: "#cfcfcf", fontSize: 14, padding: "6px 0" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                      <circle cx="11" cy="11" r="6" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <button
                      onClick={() => sendMessage(q)}
                      style={{ background: "transparent", border: "none", color: "inherit", textAlign: "left", padding: 0, cursor: "pointer" }}
                    >
                      {q}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* ── Chat messages ── */
          <div style={{ display: "flex", flexDirection: "column", gap: 24, paddingTop: 48, paddingBottom: 24, maxWidth: 680, width: "100%", alignSelf: "center" }}>
            {messages.map((msg, i) => {
              if (msg.role === "user") {
                return (
                  <div key={i} className="msg-anim" style={{ display: "flex", justifyContent: "flex-end" }}>
                    <div style={{ background: "#1e1e1e", borderRadius: "16px 16px 4px 16px", padding: "10px 16px", fontSize: 15, maxWidth: "70%", color: "#eee" }}>
                      {msg.content}
                    </div>
                  </div>
                );
              }

              if (msg.role === "assistant") {
                return (
                  <div key={i} className="msg-anim" style={{ fontSize: 15, lineHeight: 1.7, color: "#ddd" }}>
                    {msg.content.split("\n").map((line, li) => {
                      const bullet = line.match(/^[•\-\*] (.+)/);
                      if (bullet) {
                        return (
                          <div key={li} style={{ display: "flex", gap: 8, marginTop: 4 }}>
                            <span style={{ color: "#ff6a3d", marginTop: 2 }}>•</span>
                            <span>{bullet[1]}</span>
                          </div>
                        );
                      }
                      if (line.startsWith("##")) {
                        return <p key={li} style={{ fontWeight: 600, color: "#fff", marginTop: 12, marginBottom: 4 }}>{line.replace(/^#+\s*/, "")}</p>;
                      }
                      if (line.trim() === "") return <div key={li} style={{ height: 8 }} />;
                      return <p key={li}>{line}</p>;
                    })}
                  </div>
                );
              }

              if (msg.role === "error") {
                if (msg.type === "network") {
                  return (
                    <div key={i} className="msg-anim network-error-banner">
                      <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#ff4d4d,#ff8c42)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <span style={{ fontSize: 14 }}>!</span>
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, marginBottom: 2 }}>Network error</div>
                        <div style={{ color: "#888", fontSize: 13 }}>Please check your internet connection.</div>
                      </div>
                    </div>
                  );
                }
                return (
                  <div key={i} className="msg-anim error-bubble">
                    <div style={{ width: 22, height: 22, borderRadius: "50%", background: "linear-gradient(135deg,#ff4d4d,#ff8c42)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 12 }}>
                      !
                    </div>
                    <span>Something went wrong. If this issue persists please report it through our help centre.</span>
                  </div>
                );
              }

              return null;
            })}

            {loading && (
              <div className="dot-loader">
                <span /><span /><span />
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* ── Bottom input (chat mode) ── */}
      {!isEmpty && (
        <div style={{ padding: "16px 24px 24px", flexShrink: 0 }}>
          <div style={{ maxWidth: 680, margin: "0 auto", background: "#1c1c1c", border: "1px solid #2a2a2a", borderRadius: 16, padding: "14px 16px", display: "flex", alignItems: "center", gap: 10 }}>
            <input
              ref={inputRef}
              className="input-box"
              maxLength={100}
              placeholder="Ask anything"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
              disabled={loading}
            />
            <button style={{ background: "none", border: "none", cursor: "pointer", color: "#666", display: "flex" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3zm7 10a1 1 0 0 0-2 0 5 5 0 0 1-10 0 1 1 0 0 0-2 0 7 7 0 0 0 6 6.93V20H9a1 1 0 0 0 0 2h6a1 1 0 0 0 0-2h-2v-2.07A7 7 0 0 0 19 11z" />
              </svg>
            </button>
            <button
              className="send-btn"
              disabled={!input.trim() || loading}
              onClick={() => sendMessage(input)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}