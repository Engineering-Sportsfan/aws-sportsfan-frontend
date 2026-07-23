
// // app/ask-ai/page.tsx
// 'use client'

// import React, { useState, useRef, useEffect } from 'react'
// import { useSearchParams } from 'next/navigation'
// import { useAIChat } from '@/context/AskAIChatContext'
// import { useAuth } from '@/context/AuthContext'
// import Link from 'next/link'

// const SUGGESTIONS = [
//   "Who won the 2024 Women's T20 World Cup?",
//   "Which team has won the most Women's T20 World Cup titles?",
//   "Who is the leading run-scorer in Women's T20 World Cup history?",
//   "Who has taken the most wickets in Women's T20 World Cup?",
//   "Which country hosted the 2023 Women's T20 World Cup?",
//   "Who won the Player of the Tournament in WT20WC 2024?",
//   "Has India ever won the Women's T20 World Cup?",
//   "Compare Australia vs England in Women's T20 World Cup",
//   "Youngest player to win Women's T20 World Cup",
//   "Best bowling figures in Women's T20 World Cup history",
// ]

// const pickSuggestions = () =>
//   [...SUGGESTIONS].sort(() => Math.random() - 0.5).slice(0, 4)

// // Map any raw error to a friendly message
// const getFriendlyError = (error: string | null): string => {
//   if (!error) return 'Something went wrong. Please try again.'

//   const lower = error.toLowerCase()

//   if (lower.includes('network') || lower.includes('fetch') || lower.includes('failed to fetch'))
//     return 'Network issue. Please check your connection and try again.'

//   if (lower.includes('timeout') || lower.includes('timed out'))
//     return 'The request took too long. Please try again.'

//   if (lower.includes('401') || lower.includes('unauthorized') || lower.includes('unauthenticated'))
//     return 'Your session has expired. Please log in again.'

//   if (lower.includes('403') || lower.includes('forbidden'))
//     return "You don't have permission to do that."

//   if (lower.includes('429') || lower.includes('too many requests') || lower.includes('rate limit'))
//     return "You're sending messages too fast. Please wait a moment and try again."

//   if (lower.includes('500') || lower.includes('internal server') || lower.includes('server error'))
//     return 'Our servers are having trouble. Please try again in a bit.'

//   if (lower.includes('503') || lower.includes('service unavailable'))
//     return 'The service is temporarily unavailable. Please try again shortly.'

//   if (lower.includes('login') || lower.includes('please login'))
//     return 'Please log in to use the AI Assistant.'

//   return 'Something went wrong. Please try again.'
// }

// // ── Web Speech API Type Declarations ─────────────────────────────────────────
// interface SpeechRecognitionEvent extends Event {
//   resultIndex: number;
//   results: SpeechRecognitionResultList;
// }

// interface SpeechRecognitionResultList {
//   length: number;
//   item(index: number): SpeechRecognitionResult;
//   [index: number]: SpeechRecognitionResult;
// }

// interface SpeechRecognitionResult {
//   isFinal: boolean;
//   length: number;
//   item(index: number): SpeechRecognitionAlternative;
//   [index: number]: SpeechRecognitionAlternative;
// }

// interface SpeechRecognitionAlternative {
//   transcript: string;
//   confidence: number;
// }

// interface SpeechRecognition extends EventTarget {
//   lang: string;
//   continuous: boolean;
//   interimResults: boolean;
//   onstart: (event: Event) => void;
//   onresult: (event: SpeechRecognitionEvent) => void;
//   onend: (event: Event) => void;
//   onerror: (event: Event) => void;
//   start: () => void;
//   stop: () => void;
// }

// interface SpeechRecognitionConstructor {
//   new (): SpeechRecognition;
// }

// declare global {
//   interface Window {
//     webkitSpeechRecognition: SpeechRecognitionConstructor;
//   }
// }

// export default function AskAI() {
//   const { isAuthenticated, loading: authLoading } = useAuth()
//   const {
//     messages,
//     loading: aiLoading,
//     sending,
//     error: aiError,
//     sendMessage,
//     clearChat,
//   } = useAIChat()

//   const [question, setQuestion] = useState('')
//   const [suggestions, setSuggestions] = useState(pickSuggestions)
//   const [audioEnabled, setAudioEnabled] = useState(false)
//   const [listening, setListening] = useState(false)
//   const [showLoginPrompt, setShowLoginPrompt] = useState(false)

//   const messagesRef = useRef<HTMLDivElement>(null)
//   const inputRef = useRef<HTMLInputElement>(null)
//   const searchParams = useSearchParams()
//   const hasAutoSent = useRef(false)

//   const isVoiceSupported = typeof window !== 'undefined' && 'webkitSpeechRecognition' in window
//   const hasMessages = messages.length > 0

//   const friendlyError = getFriendlyError(aiError)

//   // Auto-scroll
//   useEffect(() => {
//     if (messagesRef.current) {
//       messagesRef.current.scrollTop = messagesRef.current.scrollHeight
//     }
//   }, [messages, sending])

//   // Send query
//   const askAI = async (q: string = question) => {
//     if (!q.trim() || sending) return

//     if (!isAuthenticated) {
//       setShowLoginPrompt(true)
//       setTimeout(() => setShowLoginPrompt(false), 3000)
//       return
//     }

//     await sendMessage(q)
//     setQuestion('')
//   }

//   // Auto-send from URL param — waits for auth to be ready
//   useEffect(() => {
//     if (hasAutoSent.current) return
//     if (authLoading || aiLoading || !isAuthenticated) return
//     const q = searchParams.get('q')
//     if (q?.trim()) {
//       hasAutoSent.current = true
//       askAI(q.trim())
//     }
//   // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [isAuthenticated, authLoading, aiLoading])

//   // Voice input
//   const startVoice = () => {
//     if (!isVoiceSupported) return

//     const SpeechRecognitionAPI = window.webkitSpeechRecognition
//     const recognition = new SpeechRecognitionAPI()

//     recognition.lang = 'en-IN'
//     recognition.continuous = true
//     recognition.interimResults = true

//     let finalTranscript = ''

//     recognition.onstart = () => setListening(true)

//     recognition.onresult = (e: SpeechRecognitionEvent) => {
//       let interim = ''
//       for (let i = e.resultIndex; i < e.results.length; i++) {
//         const t = e.results[i][0].transcript
//         if (e.results[i].isFinal) {
//           finalTranscript += t
//         } else {
//           interim += t
//         }
//       }
//       setQuestion(finalTranscript + interim)
//     }

//     recognition.onend = () => {
//       setListening(false)
//       if (finalTranscript.trim()) askAI(finalTranscript)
//     }

//     recognition.onerror = () => setListening(false)

//     recognition.start()
//     setTimeout(() => recognition.stop(), 8000)
//   }

//   // Render message
//   const renderMessage = (m: typeof messages[0], i: number) => {
//     const lines = m.content.split('\n').filter(l => l.trim() !== '')

//     const parseBold = (text: string) => {
//       const parts = text.split(/\*\*(.*?)\*\*/g)
//       return parts.map((part, idx) =>
//         idx % 2 === 1 ? <strong key={idx}>{part}</strong> : part
//       )
//     }

//     const parseListItems = (text: string) => {
//       const bulletPoints = text.split(/\n- /)
//       if (bulletPoints.length > 1) {
//         return (
//           <ul className="my-1 pl-5 list-disc">
//             {bulletPoints.map((point, idx) => {
//               if (idx === 0 && !point.startsWith('-')) return null
//               const cleanPoint = point.replace(/^-/, '').trim()
//               return <li key={idx} className="my-0.5">{parseBold(cleanPoint)}</li>
//             }).filter(Boolean)}
//           </ul>
//         )
//       }
//       return parseBold(text)
//     }

//     return (
//       <div
//         key={m.id || i}
//         className={`flex items-end gap-2 mb-3 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
//       >
//         {m.role === 'assistant' && (
//           <div className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center bg-gradient-to-br from-orange-500 to-pink-500">
//             <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
//               <circle cx="12" cy="12" r="10" fill="url(#grad)" />
//               <text x="12" y="16" textAnchor="middle" fontSize="10" fill="white">AI</text>
//               <defs>
//                 <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
//                   <stop offset="0%" stopColor="#f97316" />
//                   <stop offset="100%" stopColor="#ec4899" />
//                 </linearGradient>
//               </defs>
//             </svg>
//           </div>
//         )}
//         <div
//           className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
//             m.role === 'user'
//               ? 'bg-gradient-to-br from-orange-500 to-pink-500 text-white rounded-br-sm'
//               : 'bg-white/10 text-white/90 rounded-bl-sm'
//           }`}
//         >
//           {lines.map((line, j) => {
//             const isNote = line.startsWith('📊') || line.startsWith('Note:')
//             const isNumbered = /^\d+\./.test(line)
//             const isHeading = line.startsWith('#') || line.startsWith('##')
//             return (
//               <div
//                 key={j}
//                 className={`my-0.5 leading-relaxed ${
//                   isNote ? 'text-[11px] opacity-60' :
//                   isHeading ? 'text-base font-bold' :
//                   isNumbered ? 'text-[13px] font-mono' :
//                   'text-[14px]'
//                 }`}
//               >
//                 {parseListItems(line)}
//               </div>
//             )
//           })}
//         </div>
//       </div>
//     )
//   }

//   if (authLoading || aiLoading) {
//     return (
//       <div className="flex flex-col items-center justify-center h-full w-full bg-black">
//         <div className="w-10 h-10 rounded-full border-[3px] border-orange-500/20 border-t-orange-500 animate-spin" />
//         <p className="text-[#888] mt-4 text-sm">Loading...</p>
//       </div>
//     )
//   }

//   return (
//     <div className="flex flex-col w-full bg-black text-white overflow-hidden relative" style={{ height: 'calc(100dvh - 64px)' }}>

//       {/* Login prompt overlay */}
//       {showLoginPrompt && (
//         <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-500 to-pink-500 text-white px-6 py-3 rounded-full text-sm font-medium flex items-center gap-2.5 z-50 shadow-lg shadow-black/30 animate-[slideUp_0.3s_ease]">
//           <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//             <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
//             <circle cx="12" cy="7" r="4" />
//           </svg>
//           Please login to use AI Assistant
//         </div>
//       )}

//       {/* Landing state */}
//       {!hasMessages && (
//         <div className="flex flex-col items-center justify-center flex-1 px-6 pb-8">
//           <div className="mb-5">
//             <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="url(#heroGrad)" strokeWidth="1.5">
//               <circle cx="12" cy="12" r="10" />
//               <path d="M12 16v-4M12 8h.01" />
//               <defs>
//                 <linearGradient id="heroGrad" x1="0" y1="0" x2="1" y2="1">
//                   <stop offset="0%" stopColor="#f97316" />
//                   <stop offset="100%" stopColor="#ec4899" />
//                 </linearGradient>
//               </defs>
//             </svg>
//           </div>
//           <p className="text-sm text-white/50 text-center">
//             Ask anything about IPL, T20, players, matches, stats and more
//           </p>
//         </div>
//       )}

//        {/* Header bar */}
// <style>{`
//   .askai-bar {
//     left: 0;
//   }
//   @media (min-width: 1024px) {
//     .askai-bar {
//       left: var(--sidebar-width, 84px);
//     }
//   }
// `}</style>

// {/* Header bar */}
// <div
//   className="askai-bar"
//   style={{
//     position: "fixed",
//     top: 0,
//     right: 0,
//     zIndex: 200,
//     display: "flex",
//     alignItems: "center",
//     gap: 10,
//     padding: "14px 16px 12px",
//     background: "rgba(0,0,0,0.95)",
//     backdropFilter: "blur(20px)",
//     borderBottom: "1px solid rgba(255,255,255,0.06)",
//     transition: "left 0.3s ease-out",
//   }}
// >
//   <Link href="/MainModules/ROAR" style={{
//     display: "flex",
//     alignItems: "center",
//     gap: 10,
//     textDecoration: "none",
//     color: "white"
//   }}>
//     <button
//       style={{
//         background: "none",
//         border: "none",
//         cursor: "pointer",
//         color: "white",
//         padding: "4px 2px",
//         display: "flex",
//         alignItems: "center"
//       }}
//     >
//       <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
//         <path d="M15 18l-6-6 6-6" />
//       </svg>
//     </button>
//     <h3 style={{
//       color: "white",
//       margin: 0,
//       fontSize: 17,
//       fontWeight: 700,
//       letterSpacing: "0.01em"
//     }}>
//       Ask AI
//     </h3>
//   </Link>
// </div>
// <div style={{ height: 56, flexShrink: 0 }} />

//       {/* Conversation area */}
//       {hasMessages && (
//         <div ref={messagesRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-1 w-full [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
//           {messages.map((m, i) => renderMessage(m, i))}

//           {sending && (
//             <div className="flex items-end gap-2 mb-3">
//               <div className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center bg-gradient-to-br from-orange-500 to-pink-500">
//                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
//                   <circle cx="12" cy="12" r="10" fill="url(#grad2)" />
//                   <text x="12" y="16" textAnchor="middle" fontSize="10" fill="white">AI</text>
//                   <defs>
//                     <linearGradient id="grad2" x1="0" y1="0" x2="1" y2="1">
//                       <stop offset="0%" stopColor="#f97316" />
//                       <stop offset="100%" stopColor="#ec4899" />
//                     </linearGradient>
//                   </defs>
//                 </svg>
//               </div>
//               <div className="bg-white/10 px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-1.5">
//                 <span className="w-1.5 h-1.5 rounded-full bg-white/50 animate-bounce [animation-delay:0ms]" />
//                 <span className="w-1.5 h-1.5 rounded-full bg-white/50 animate-bounce [animation-delay:150ms]" />
//                 <span className="w-1.5 h-1.5 rounded-full bg-white/50 animate-bounce [animation-delay:300ms]" />
//               </div>
//             </div>
//           )}

//           {/* Friendly error message */}
//           {aiError && (
//             <div className="flex items-start gap-2.5 text-[13px] bg-white/5 border border-white/10 rounded-2xl px-4 py-3 mx-0 my-2">
//               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" className="flex-shrink-0 mt-0.5">
//                 <circle cx="12" cy="12" r="10" />
//                 <line x1="12" y1="8" x2="12" y2="12" />
//                 <line x1="12" y1="16" x2="12.01" y2="16" />
//               </svg>
//               <div className="flex flex-col gap-0.5">
//                 <span className="text-white/80">{friendlyError}</span>
//                 <span className="text-white/30 text-[11px]">If this keeps happening, try refreshing the page.</span>
//               </div>
//             </div>
//           )}
//         </div>
//       )}

//       {/* Input area */}
//       <div className="px-4 pb-1 pt-2 flex flex-col gap-3">

//         {/* Input bar */}
//         <div className="flex items-center gap-2 bg-white/10 rounded-2xl px-3 py-2 border border-white/10">
//           <input
//             ref={inputRef}
//             value={question}
//             placeholder={listening ? 'Listening...' : (isAuthenticated ? 'Ask anything about cricket...' : 'Login to use AI Assistant')}
//             onChange={e => setQuestion(e.target.value)}
//             onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) askAI() }}
//             disabled={!isAuthenticated || sending}
//             maxLength={100}
//             className="flex-1 bg-transparent text-white text-sm placeholder-white/30 outline-none disabled:opacity-40"
//           />

//           {/* Send */}
//           <button
//             onClick={() => askAI()}
//             title="Send"
//             disabled={!isAuthenticated || !question.trim() || sending}
//             className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
//           >
//             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
//               <line x1="5" y1="12" x2="19" y2="12"/>
//               <polyline points="12 5 19 12 12 19"/>
//             </svg>
//           </button>
//         </div>

//         {/* Suggestions — only on landing */}
//         {!hasMessages && isAuthenticated && (
//           <div className="flex flex-wrap gap-2 justify-center">
//             {suggestions.map((s, i) => (
//               <button
//                 key={i}
//                 onClick={() => askAI(s)}
//                 className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white/80 text-xs transition-colors"
//               >
//                 <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 opacity-45">
//                   <circle cx="11" cy="11" r="8"/>
//                   <line x1="21" y1="21" x2="16.65" y2="16.65"/>
//                 </svg>
//                 {s}
//               </button>
//             ))}
//             <button
//               onClick={() => setSuggestions(pickSuggestions())}
//               title="Refresh suggestions"
//               className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/40 hover:text-white/70 transition-colors"
//             >
//               <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                 <polyline points="23 4 23 10 17 10"/>
//                 <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
//               </svg>
//             </button>
//           </div>
//         )}

//         {/* Login message for landing state */}
//         {!hasMessages && !isAuthenticated && (
//           <div className="flex items-center justify-center gap-2.5 bg-white/5 rounded-2xl py-8 px-5 mt-2 text-white/40 text-sm">
//             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//               <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
//               <circle cx="12" cy="7" r="4" />
//             </svg>
//             Sign in to ask questions and get AI-powered cricket insights
//           </div>
//         )}

//         {/* Clear chat button */}
//         {hasMessages && (
//           <button
//             onClick={clearChat}
//             className="flex items-center gap-1.5 self-center text-white/30 hover:text-white/60 text-xs transition-colors py-1"
//           >
//             <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//               <polyline points="3 6 5 6 21 6" />
//               <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
//             </svg>
//             Clear chat
//           </button>
//         )}

//       </div>
//     </div>
//   )
// }







// app/ask-ai/page.tsx
'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAIChat, type AskAIHistorySession } from '@/context/AskAIChatContext'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'
import { ChevronLeft, History as HistoryIcon, Loader2, MoreVertical, Pencil, Trash2, Check, X as XIcon } from 'lucide-react'

const SUGGESTIONS = [
  "Who won the 2024 Women's T20 World Cup?",
  "Which team has won the most Women's T20 World Cup titles?",
  "Who is the leading run-scorer in Women's T20 World Cup history?",
  "Who has taken the most wickets in Women's T20 World Cup?",
  "Which country hosted the 2023 Women's T20 World Cup?",
  "Who won the Player of the Tournament in WT20WC 2024?",
  "Has India ever won the Women's T20 World Cup?",
  "Compare Australia vs England in Women's T20 World Cup",
  "Youngest player to win Women's T20 World Cup",
  "Best bowling figures in Women's T20 World Cup history",
]

const pickSuggestions = () =>
  [...SUGGESTIONS].sort(() => Math.random() - 0.5).slice(0, 4)

const getFriendlyError = (error: string | null): string => {
  if (!error) return 'Something went wrong. Please try again.'
  const lower = error.toLowerCase()
  if (lower.includes('network') || lower.includes('fetch') || lower.includes('failed to fetch'))
    return 'Network issue. Please check your connection and try again.'
  if (lower.includes('timeout') || lower.includes('timed out'))
    return 'The request took too long. Please try again.'
  if (lower.includes('401') || lower.includes('unauthorized') || lower.includes('unauthenticated'))
    return 'Your session has expired. Please log in again.'
  if (lower.includes('403') || lower.includes('forbidden'))
    return "You don't have permission to do that."
  if (lower.includes('429') || lower.includes('too many requests') || lower.includes('rate limit'))
    return "You're sending messages too fast. Please wait a moment and try again."
  if (lower.includes('500') || lower.includes('internal server') || lower.includes('server error'))
    return 'Our servers are having trouble. Please try again in a bit.'
  if (lower.includes('503') || lower.includes('service unavailable'))
    return 'The service is temporarily unavailable. Please try again shortly.'
  if (lower.includes('login') || lower.includes('please login'))
    return 'Please log in to use the AI Assistant.'
  return 'Something went wrong. Please try again.'
}

// ── Web Speech API Type Declarations ─────────────────────────────────────────
interface SpeechRecognitionEvent extends Event {
  resultIndex: number
  results: SpeechRecognitionResultList
}
interface SpeechRecognitionResultList {
  length: number
  item(index: number): SpeechRecognitionResult
  [index: number]: SpeechRecognitionResult
}
interface SpeechRecognitionResult {
  isFinal: boolean
  length: number
  item(index: number): SpeechRecognitionAlternative
  [index: number]: SpeechRecognitionAlternative
}
interface SpeechRecognitionAlternative {
  transcript: string
  confidence: number
}
interface SpeechRecognition extends EventTarget {
  lang: string
  continuous: boolean
  interimResults: boolean
  onstart: (event: Event) => void
  onresult: (event: SpeechRecognitionEvent) => void
  onend: (event: Event) => void
  onerror: (event: Event) => void
  start: () => void
  stop: () => void
}
interface SpeechRecognitionConstructor {
  new (): SpeechRecognition
}
declare global {
  interface Window {
    webkitSpeechRecognition: SpeechRecognitionConstructor
  }
}

export default function AskAI() {
  const { isAuthenticated, loading: authLoading } = useAuth()
  const {
    messages,
    loading: aiLoading,
    sending,
    error: aiError,
    sendMessage,
    clearChat,
    history,
    loadingHistory,
    activeSessionId,
    loadSession,
    startNewChat,
    renameSession,
    deleteSession,
  } = useAIChat()

  const [question, setQuestion] = useState('')
  const [suggestions, setSuggestions] = useState(pickSuggestions)
  const [listening, setListening] = useState(false)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const [view, setView] = useState<'chat' | 'history'>('chat')

  // ── History row menu state ──
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const renameInputRef = useRef<HTMLInputElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const messagesRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const searchParams = useSearchParams()
  const hasAutoSent = useRef(false)

  const isVoiceSupported = typeof window !== 'undefined' && 'webkitSpeechRecognition' in window
  const hasMessages = messages.length > 0

  const friendlyError = getFriendlyError(aiError)

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight
    }
  }, [messages, sending])

  // ── Close the open row-menu on outside click ──
  useEffect(() => {
    if (!openMenuId) return
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [openMenuId])

  useEffect(() => {
    if (renamingId && renameInputRef.current) {
      renameInputRef.current.focus()
      renameInputRef.current.select()
    }
  }, [renamingId])

  const askAI = async (q: string = question) => {
    if (!q.trim() || sending) return
    if (!isAuthenticated) {
      setShowLoginPrompt(true)
      setTimeout(() => setShowLoginPrompt(false), 3000)
      return
    }
    await sendMessage(q)
    setQuestion('')
  }

  useEffect(() => {
    if (hasAutoSent.current) return
    if (authLoading || aiLoading || !isAuthenticated) return
    const q = searchParams.get('q')
    if (q?.trim()) {
      hasAutoSent.current = true
      askAI(q.trim())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, authLoading, aiLoading])

  const startVoice = () => {
    if (!isVoiceSupported) return
    const SpeechRecognitionAPI = window.webkitSpeechRecognition
    const recognition = new SpeechRecognitionAPI()
    recognition.lang = 'en-IN'
    recognition.continuous = true
    recognition.interimResults = true
    let finalTranscript = ''
    recognition.onstart = () => setListening(true)
    recognition.onresult = (e: SpeechRecognitionEvent) => {
      let interim = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript
        if (e.results[i].isFinal) finalTranscript += t
        else interim += t
      }
      setQuestion(finalTranscript + interim)
    }
    recognition.onend = () => {
      setListening(false)
      if (finalTranscript.trim()) askAI(finalTranscript)
    }
    recognition.onerror = () => setListening(false)
    recognition.start()
    setTimeout(() => recognition.stop(), 8000)
  }

  const handleSelectSession = async (session: AskAIHistorySession) => {
    if (renamingId || deletingId) return // don't navigate while editing a row
    await loadSession?.(session.sessionId)
    setView('chat')
  }

  const handleNewChat = () => {
    startNewChat ? startNewChat() : clearChat()
    setQuestion('')
    setView('chat')
    setTimeout(() => inputRef.current?.focus(), 150)
  }

  // ── Row menu actions ──
  const openRenameFor = (session: AskAIHistorySession) => {
    setOpenMenuId(null)
    setRenamingId(session.sessionId)
    setRenameValue(session.title)
  }

  const cancelRename = () => {
    setRenamingId(null)
    setRenameValue('')
  }

  const confirmRename = async (sessionId: string) => {
    const trimmed = renameValue.trim()
    if (!trimmed) return
    setBusyId(sessionId)
    await renameSession?.(sessionId, trimmed)
    setBusyId(null)
    setRenamingId(null)
    setRenameValue('')
  }

  const confirmDelete = async (sessionId: string) => {
    setBusyId(sessionId)
    await deleteSession?.(sessionId)
    setBusyId(null)
    setDeletingId(null)
  }

  const renderMessage = (m: typeof messages[0], i: number) => {
    const lines = m.content.split('\n').filter((l: string) => l.trim() !== '')
    const parseBold = (text: string) => {
      const parts = text.split(/\*\*(.*?)\*\*/g)
      return parts.map((part, idx) => (idx % 2 === 1 ? <strong key={idx}>{part}</strong> : part))
    }
    const parseListItems = (text: string) => {
      const bulletPoints = text.split(/\n- /)
      if (bulletPoints.length > 1) {
        return (
          <ul className="my-1 pl-5 list-disc">
            {bulletPoints
              .map((point, idx) => {
                if (idx === 0 && !point.startsWith('-')) return null
                const cleanPoint = point.replace(/^-/, '').trim()
                return (
                  <li key={idx} className="my-0.5">
                    {parseBold(cleanPoint)}
                  </li>
                )
              })
              .filter(Boolean)}
          </ul>
        )
      }
      return parseBold(text)
    }

    return (
      <div
        key={m.id || i}
        className={`flex items-end gap-2 mb-3 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
      >
        {m.role === 'assistant' && (
          <div className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center bg-gradient-to-br from-orange-500 to-pink-500">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" fill="url(#grad)" />
              <text x="12" y="16" textAnchor="middle" fontSize="10" fill="white">AI</text>
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#f97316" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        )}
        <div
          className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
            m.role === 'user'
              ? 'bg-gradient-to-br from-orange-500 to-pink-500 text-white rounded-br-sm'
              : 'bg-white/10 text-white/90 rounded-bl-sm'
          }`}
        >
          {lines.map((line: string, j: number) => {
            const isNote = line.startsWith('📊') || line.startsWith('Note:')
            const isNumbered = /^\d+\./.test(line)
            const isHeading = line.startsWith('#') || line.startsWith('##')
            return (
              <div
                key={j}
                className={`my-0.5 leading-relaxed ${
                  isNote
                    ? 'text-[11px] opacity-60'
                    : isHeading
                    ? 'text-base font-bold'
                    : isNumbered
                    ? 'text-[13px] font-mono'
                    : 'text-[14px]'
                }`}
              >
                {parseListItems(line)}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  if (authLoading || aiLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full bg-black">
        <div className="w-10 h-10 rounded-full border-[3px] border-orange-500/20 border-t-orange-500 animate-spin" />
        <p className="text-[#888] mt-4 text-sm">Loading...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col w-full bg-black text-white overflow-hidden relative" style={{ height: 'calc(100dvh - 64px)' }}>
      {showLoginPrompt && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-500 to-pink-500 text-white px-6 py-3 rounded-full text-sm font-medium flex items-center gap-2.5 z-50 shadow-lg shadow-black/30 animate-[slideUp_0.3s_ease]">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          Please login to use AI Assistant
        </div>
      )}

      <style>{`
        .askai-bar { left: 0; }
        @media (min-width: 1024px) {
          .askai-bar { left: var(--sidebar-width, 84px); }
        }
      `}</style>

      {/* Header bar */}
      <div
        className="askai-bar"
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          zIndex: 200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
          padding: '14px 16px 12px',
          background: 'rgba(0,0,0,0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          transition: 'left 0.3s ease-out',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {view === 'history' ? (
            <button
              onClick={() => setView('chat')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'white', padding: '4px 2px', display: 'flex', alignItems: 'center' }}
            >
              <ChevronLeft size={22} />
            </button>
          ) : (
            <Link href="/MainModules/ROAR" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: 'white' }}>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'white', padding: '4px 2px', display: 'flex', alignItems: 'center' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
            </Link>
          )}
          <h3 style={{ color: 'white', margin: 0, fontSize: 17, fontWeight: 700, letterSpacing: '0.01em' }}>
            {view === 'history' ? 'Chat History' : 'Ask Dolly'}
          </h3>
        </div>

        {view === 'chat' && isAuthenticated && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button
              onClick={handleNewChat}
              title="New chat"
              className="text-xs font-bold text-orange-400 hover:text-orange-300 transition-colors"
              style={{ background: 'rgba(249,115,22,0.12)', border: '1px solid rgba(249,115,22,0.35)', borderRadius: 999, padding: '6px 12px', cursor: 'pointer' }}
            >
              ✏️ New
            </button>
            <button
              onClick={() => setView('history')}
              title="Chat history"
              className="w-8 h-8 rounded-full flex items-center justify-center bg-white/[0.06] border-none cursor-pointer text-white/60 shrink-0"
            >
              <HistoryIcon size={16} />
            </button>
          </div>
        )}
      </div>
      <div style={{ height: 56, flexShrink: 0 }} />

      {view === 'history' ? (
        /* ── History view ── */
        <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3">
          <button
            type="button"
            onClick={handleNewChat}
            className="w-full flex items-center gap-2.5 bg-transparent border-none cursor-pointer py-2.5 px-1.5 rounded-[10px] mb-2"
          >
            <div className="w-[34px] h-[34px] rounded-[10px] bg-orange-500/15 border border-orange-500/40 flex items-center justify-center shrink-0">
              <span className="text-[15px]">✏️</span>
            </div>
            <span className="text-sm font-bold text-orange-400">New Chat</span>
          </button>

          {loadingHistory ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 size={20} className="text-orange-400 animate-spin" />
            </div>
          ) : history.length === 0 ? (
            <p className="text-center text-[12.5px] text-white/35 italic py-8">No conversations yet.</p>
          ) : (
            history.map((h: AskAIHistorySession) => {
              const isActive = h.sessionId === activeSessionId
              const isRenaming = renamingId === h.sessionId
              const isDeleting = deletingId === h.sessionId
              const isBusy = busyId === h.sessionId

              // ── Delete confirm row ──
              if (isDeleting) {
                return (
                  <div
                    key={h.sessionId}
                    className="w-full flex items-center gap-2.5 p-2.5 rounded-xl mb-1.5 border border-red-500/30 bg-red-500/[0.06]"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="m-0 text-[12.5px] text-white/80">
                        Delete <span className="font-bold">"{h.title}"</span>? This can't be undone.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDeletingId(null)}
                      disabled={isBusy}
                      className="w-7 h-7 rounded-full flex items-center justify-center bg-white/[0.06] border-none cursor-pointer text-white/60 shrink-0 disabled:opacity-40"
                    >
                      <XIcon size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => confirmDelete(h.sessionId)}
                      disabled={isBusy}
                      className="text-[11px] font-bold text-red-400 hover:text-red-300 bg-red-500/15 border border-red-500/35 rounded-full px-3 py-1.5 shrink-0 disabled:opacity-40"
                    >
                      {isBusy ? <Loader2 size={12} className="animate-spin" /> : 'Delete'}
                    </button>
                  </div>
                )
              }

              return (
                <div
                  key={h.sessionId}
                  className={`relative w-full flex items-center gap-2.5 p-2.5 rounded-xl mb-1.5 border ${
                    isActive ? 'bg-orange-500/[0.12] border-orange-500/40' : 'bg-transparent border-transparent hover:bg-white/[0.04]'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => handleSelectSession(h)}
                    disabled={isRenaming}
                    className="flex-1 min-w-0 flex items-center gap-2.5 bg-transparent border-none cursor-pointer text-left p-0 disabled:cursor-default"
                  >
                    <div className="flex-1 min-w-0">
                      {isRenaming ? (
                        <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                          <input
                            ref={renameInputRef}
                            value={renameValue}
                            onChange={e => setRenameValue(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') confirmRename(h.sessionId)
                              if (e.key === 'Escape') cancelRename()
                            }}
                            maxLength={60}
                            disabled={isBusy}
                            className="flex-1 min-w-0 bg-white/10 border border-orange-500/40 rounded-lg px-2 py-1 text-[13px] text-white outline-none disabled:opacity-50"
                          />
                          <button
                            type="button"
                            onClick={() => confirmRename(h.sessionId)}
                            disabled={isBusy || !renameValue.trim()}
                            className="w-6 h-6 rounded-full flex items-center justify-center bg-orange-500/20 border-none cursor-pointer text-orange-400 shrink-0 disabled:opacity-40"
                          >
                            {isBusy ? <Loader2 size={12} className="animate-spin" /> : <Check size={13} />}
                          </button>
                          <button
                            type="button"
                            onClick={cancelRename}
                            disabled={isBusy}
                            className="w-6 h-6 rounded-full flex items-center justify-center bg-white/[0.06] border-none cursor-pointer text-white/50 shrink-0 disabled:opacity-40"
                          >
                            <XIcon size={12} />
                          </button>
                        </div>
                      ) : (
                        <>
                          <p className="m-0 text-[13.5px] font-bold text-white truncate">{h.title}</p>
                          <p className="mt-0.5 mb-0 text-[11.5px] text-white/45 overflow-hidden text-ellipsis whitespace-nowrap">{h.subtitle}</p>
                        </>
                      )}
                    </div>
                  </button>

                  {!isRenaming && (
                    <>
                      <span className="text-[10.5px] text-white/30 shrink-0">{h.dateLabel}</span>
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation()
                          setOpenMenuId(openMenuId === h.sessionId ? null : h.sessionId)
                        }}
                        title="More options"
                        className="w-7 h-7 rounded-full flex items-center justify-center bg-transparent hover:bg-white/[0.08] border-none cursor-pointer text-white/45 shrink-0"
                      >
                        <MoreVertical size={15} />
                      </button>
                    </>
                  )}

                  {openMenuId === h.sessionId && (
                    <div
                      ref={menuRef}
                      className="absolute right-2 top-11 z-10 min-w-[140px] bg-[#161616] border border-white/10 rounded-xl shadow-lg shadow-black/40 overflow-hidden"
                    >
                      <button
                        type="button"
                        onClick={() => openRenameFor(h)}
                        className="w-full flex items-center gap-2 px-3.5 py-2.5 bg-transparent border-none cursor-pointer text-left text-[12.5px] text-white/85 hover:bg-white/[0.06]"
                      >
                        <Pencil size={13} />
                        Rename
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setOpenMenuId(null)
                          setDeletingId(h.sessionId)
                        }}
                        className="w-full flex items-center gap-2 px-3.5 py-2.5 bg-transparent border-none cursor-pointer text-left text-[12.5px] text-red-400 hover:bg-red-500/[0.08]"
                      >
                        <Trash2 size={13} />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      ) : (
        <>
          {/* Landing state */}
          {!hasMessages && (
            <div className="flex flex-col items-center justify-center flex-1 px-6 pb-8">
              {/* <div className="mb-5">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="url(#heroGrad)" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4M12 8h.01" />
                  <defs>
                    <linearGradient id="heroGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#f97316" />
                      <stop offset="100%" stopColor="#ec4899" />
                    </linearGradient>
                  </defs>
                </svg>
              </div> */}
              <p className="text-sm text-white/50 text-center">
                Ask anything about IPL, T20, players, matches, stats and more
              </p>
            </div>
          )}

          {/* Conversation area */}
          {hasMessages && (
            <div ref={messagesRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-1 w-full [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
              {messages.map((m, i) => renderMessage(m, i))}

              {sending && (
                <div className="flex items-end gap-2 mb-3">
                  <div className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center bg-gradient-to-br from-orange-500 to-pink-500">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" fill="url(#grad2)" />
                      <text x="12" y="16" textAnchor="middle" fontSize="10" fill="white">AI</text>
                      <defs>
                        <linearGradient id="grad2" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="#f97316" />
                          <stop offset="100%" stopColor="#ec4899" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                  <div className="bg-white/10 px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-white/50 animate-bounce [animation-delay:0ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-white/50 animate-bounce [animation-delay:150ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-white/50 animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              )}

              {aiError && (
                <div className="flex items-start gap-2.5 text-[13px] bg-white/5 border border-white/10 rounded-2xl px-4 py-3 mx-0 my-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" className="flex-shrink-0 mt-0.5">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-white/80">{friendlyError}</span>
                    <span className="text-white/30 text-[11px]">If this keeps happening, try refreshing the page.</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Input area */}
          <div className="px-4 pb-1 pt-2 flex flex-col gap-3">
            <div className="flex items-center gap-2 bg-white/10 rounded-2xl px-3 py-2 border border-white/10">
              <input
                ref={inputRef}
                value={question}
                placeholder={listening ? 'Listening...' : isAuthenticated ? 'Ask anything about cricket...' : 'Login to use AI Assistant'}
                onChange={e => setQuestion(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) askAI() }}
                disabled={!isAuthenticated || sending}
                maxLength={100}
                className="flex-1 bg-transparent text-white text-sm placeholder-white/30 outline-none disabled:opacity-40"
              />
              <button
                onClick={() => askAI()}
                title="Send"
                disabled={!isAuthenticated || !question.trim() || sending}
                className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            </div>

            {!hasMessages && isAuthenticated && (
              <div className="flex flex-wrap gap-2 justify-center">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => askAI(s)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white/80 text-xs transition-colors"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 opacity-45">
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    {s}
                  </button>
                ))}
                <button
                  onClick={() => setSuggestions(pickSuggestions())}
                  title="Refresh suggestions"
                  className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/40 hover:text-white/70 transition-colors"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="23 4 23 10 17 10" />
                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                  </svg>
                </button>
              </div>
            )}

            {!hasMessages && !isAuthenticated && (
              <div className="flex items-center justify-center gap-2.5 bg-white/5 rounded-2xl py-8 px-5 mt-2 text-white/40 text-sm">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                Sign in to ask questions and get AI-powered cricket insights
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}