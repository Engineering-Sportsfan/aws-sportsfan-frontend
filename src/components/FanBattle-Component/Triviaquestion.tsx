// "use client";

// import Link from "next/link";
// import { useRouter, useSearchParams } from "next/navigation";
// import React, { useEffect, useState, useRef } from "react";
// import axios from "axios";
// import { useAuth } from "@/context/AuthContext";

// type AnswerState = "idle" | "correct" | "incorrect";

// interface QuizQuestion {
//   questionNumber: number;
//   question: string;
//   options: string[];
//   points: number;
//   quizId: string;
//   originalQuestionNumber: number;
// }

// interface FanBattleQuiz {
//   id: string;
//   level: string;
//   category: string;
//   questions: QuizQuestion[];
//   totalQuestions: number;
//   totalPoints: number;
// }

// interface SessionSummary {
//   id: string;
//   status: "in_progress" | "completed";
//   totalPointsEarned: number;
//   correctCount: number;
//   incorrectCount: number;
//   answeredCount: number;
//   totalQuestions: number;
//   completedAt: number | null;
// }

// interface RestoredAnswer {
//   quizId: string;
//   questionNumber: number;
//   selectedAnswer: string;
//   isCorrect: boolean;
//   pointsEarned: number;
//   correctAnswer?: string;
// }

// interface LevelResult {
//   totalPointsEarned: number;
//   correctCount: number;
//   incorrectCount: number;
//   answeredCount: number;
//   totalQuestions: number;
// }

// // ─── Option Button ─────────────────────────────────────────────────────────────

// interface OptionButtonProps {
//   label: string;
//   selected: boolean;
//   isCorrect: boolean;
//   answerState: AnswerState;
//   onSelect: () => void;
// }

// const OptionButton: React.FC<OptionButtonProps> = ({
//   label,
//   selected,
//   isCorrect,
//   answerState,
//   onSelect,
// }) => {
//   const isAnswered = answerState !== "idle";
//   const isSelectedCorrect = isAnswered && selected && isCorrect;
//   const isSelectedIncorrect = isAnswered && selected && !isCorrect;
//   const isUnselectedCorrect = isAnswered && !selected && isCorrect;

//   const getBorderAndBg = () => {
//     if (!isAnswered)
//       return "border border-[#2a2f3a] bg-[#151b26] hover:border-[#3a4150] hover:bg-[#1a2030] active:bg-[#1e2535]";
//     if (isSelectedCorrect) return "border border-[#00c853] bg-[#0d2b1a]";
//     if (isSelectedIncorrect) return "border border-[#e53935] bg-[#2b0d0d]";
//     if (isUnselectedCorrect) return "border border-[#00c853] bg-[#0a2016] opacity-80";
//     return "border border-[#2a2f3a] bg-[#151b26] opacity-60";
//   };

//   const getLabelColor = () => {
//     if (!isAnswered) return "text-white";
//     if (isSelectedCorrect) return "text-[#00e676]";
//     if (isSelectedIncorrect) return "text-[#ef5350]";
//     if (isUnselectedCorrect) return "text-[#00e676]";
//     return "text-[#6b7280]";
//   };

//   return (
//     <button
//       onClick={() => !isAnswered && onSelect()}
//       disabled={isAnswered}
//       className={`w-full flex items-center justify-between px-4 py-[14px] rounded-xl transition-all duration-200 ${getBorderAndBg()} cursor-pointer disabled:cursor-default`}
//     >
//       <span className={`text-[14px] sm:text-[15px] font-medium ${getLabelColor()}`}>
//         {label}
//       </span>
//       {isAnswered && (isSelectedCorrect || isSelectedIncorrect || isUnselectedCorrect) && (
//         <span className="flex-shrink-0 ml-2">
//           {(isSelectedCorrect || isUnselectedCorrect) && (
//             <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
//               <circle cx="12" cy="12" r="11" stroke="#00c853" strokeWidth="1.5" />
//               <path d="M7 12.5l3.5 3.5 6.5-7" stroke="#00c853" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
//             </svg>
//           )}
//           {isSelectedIncorrect && (
//             <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
//               <circle cx="12" cy="12" r="11" stroke="#e53935" strokeWidth="1.5" />
//               <path d="M8.5 8.5l7 7M15.5 8.5l-7 7" stroke="#e53935" strokeWidth="2" strokeLinecap="round" />
//             </svg>
//           )}
//         </span>
//       )}
//     </button>
//   );
// };

// // ─── Results Screen ────────────────────────────────────────────────────────────

// function ResultsScreen({ result, level }: { result: LevelResult; level: string }) {
//   const router = useRouter();
//   const pct =
//     result.totalQuestions > 0
//       ? Math.round((result.correctCount / result.totalQuestions) * 100)
//       : 0;

//   return (
//     <div className="w-full mt-20 max-w-sm sm:max-w-md mx-auto bg-[#0f1520] rounded-2xl overflow-hidden px-4 py-6">
//       <div className="text-center mb-6">
//         <div
//           className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3"
//           style={{ background: pct >= 60 ? "#0d2b1a" : "#2b0d0d" }}
//         >
//           {pct >= 60 ? (
//             <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
//               <path d="M5 13l4 4L19 7" stroke="#00c853" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
//             </svg>
//           ) : (
//             <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
//               <path d="M12 17c-2.76 0-5-2.24-5-5V5h10v7c0 2.76-2.24 5-5 5zM9 21h6v1H9z" />
//             </svg>
//           )}
//         </div>
//         <h2 className="text-white text-[22px] font-bold">
//           {pct >= 80 ? "Outstanding!" : pct >= 60 ? "Well done!" : "Keep practicing!"}
//         </h2>
//         <p className="text-[#9ca3af] text-[13px] mt-1 capitalize">{level} Level</p>
//       </div>

//       <div className="grid grid-cols-3 gap-3 mb-6">
//         {[
//           { label: "Points", value: result.totalPointsEarned, color: "#4caf82" },
//           { label: "Correct", value: result.correctCount, color: "#00c853" },
//           { label: "Score", value: `${pct}%`, color: pct >= 60 ? "#4caf82" : "#e53935" },
//         ].map(({ label, value, color }) => (
//           <div key={label} className="bg-[#1a1a1a] rounded-xl p-3 text-center border border-[#222222]">
//             <p className="text-[11px] text-[#666] uppercase tracking-wider mb-1">{label}</p>
//             <p className="font-bold text-[18px]" style={{ color }}>{value}</p>
//           </div>
//         ))}
//       </div>

//       <div className="bg-[#1a1a1a] border border-[#222222] rounded-xl p-4 mb-5">
//         {[
//           { label: "Questions answered", value: result.answeredCount },
//           { label: "Correct", value: result.correctCount },
//           { label: "Incorrect", value: result.incorrectCount },
//         ].map(({ label, value }, i, arr) => (
//           <div
//             key={label}
//             className={`flex justify-between py-2.5 ${i < arr.length - 1 ? "border-b border-[#252525]" : ""}`}
//           >
//             <span className="text-[#666] text-[13px]">{label}</span>
//             <span className="text-white text-[13px] font-medium">{value}</span>
//           </div>
//         ))}
//       </div>

//       <button
//         onClick={() => router.push("/MainModules/FanBattle")}
//         className="w-full py-3 rounded-2xl font-bold text-[14px] text-white bg-gradient-to-r from-[#e91e8c] to-[#ff6b35] hover:opacity-90 transition-opacity"
//       >
//         Back to Fan Battle
//       </button>
//     </div>
//   );
// }

// // ─── Already Played Screen ─────────────────────────────────────────────────────

// function AlreadyPlayedScreen({ level }: { level: string }) {
//   const router = useRouter();
//   return (
//     <div className="w-full mt-20 max-w-sm sm:max-w-md mx-auto bg-[#0f1520] rounded-2xl px-4 py-6 text-center">
//       <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 bg-[#1a1a2e] border border-[#2a2a4a]">
//         <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
//           <circle cx="12" cy="12" r="10" stroke="#9ca3af" strokeWidth="1.5" />
//           <path d="M12 7v5l3 3" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
//         </svg>
//       </div>
//       <h2 className="text-white text-[20px] font-bold">Already Played!</h2>
//       <p className="text-[#9ca3af] text-[13px] mt-1">
//         You have already completed all{" "}
//         <span className="capitalize">{level}</span> challenges.
//       </p>
//       <p className="text-[#555] text-[12px] mt-3 mb-6">
//         Each quiz can only be played once. Check back for new challenges!
//       </p>
//       <button
//         onClick={() => router.push("/MainModules/FanBattle")}
//         className="w-full py-3 rounded-2xl font-bold text-[14px] text-white bg-gradient-to-r from-[#e91e8c] to-[#ff6b35] hover:opacity-90 transition-opacity"
//       >
//         Back to Fan Battle
//       </button>
//     </div>
//   );
// }

// // ─── Loading Screen ────────────────────────────────────────────────────────────

// function LoadingScreen() {
//   return (
//     <div className="w-full mt-20 max-w-sm sm:max-w-md mx-auto bg-[#0f1520] rounded-2xl overflow-hidden animate-pulse">
//       <div className="px-4 pt-4 pb-3">
//         <div className="flex items-center gap-2 mb-3">
//           <div className="w-7 h-7 rounded-full bg-[#1e2535]" />
//           <div className="h-4 w-32 bg-[#1e2535] rounded" />
//         </div>
//         <div className="h-7 w-48 bg-[#1e2535] rounded mb-2" />
//         <div className="h-4 w-full bg-[#1e2535] rounded mb-3" />
//         <div className="h-1 w-full bg-[#1e2535] rounded" />
//       </div>
//       <div className="px-4 pt-2 pb-3 flex flex-col gap-2.5">
//         {[1, 2, 3, 4].map((i) => (
//           <div key={i} className="h-12 w-full bg-[#1e2535] rounded-xl" />
//         ))}
//       </div>
//     </div>
//   );
// }

// // ─── Restored Answer View (read-only, shows previous response) ─────────────────

// interface RestoredQuestionViewProps {
//   question: QuizQuestion;
//   restored: RestoredAnswer;
//   currentIndex: number;
//   totalQuestions: number;
//   levelResult: LevelResult;
//   levelLabel: string;
//   currentQuizCategory: string;
//   onNext: () => void;
// }

// function RestoredQuestionView({
//   question,
//   restored,
//   currentIndex,
//   totalQuestions,
//   levelResult,
//   levelLabel,
//   currentQuizCategory,
//   onNext,
// }: RestoredQuestionViewProps) {
//   const answerState: AnswerState = restored.isCorrect ? "correct" : "incorrect";

//   return (
//     <div className="w-full mt-20 max-w-sm sm:max-w-md mx-auto bg-[#0f1520] rounded-2xl overflow-hidden">
//       {/* Header */}
//       <div className="px-4 pt-4 pb-3 bg-[#0f1520]">
//         <div className="flex items-center gap-2 mb-3">
//           <Link href="/MainModules/FanBattle">
//             <button className="flex items-center justify-center w-7 h-7 rounded-full hover:bg-[#1e2535] transition-colors">
//               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
//                 <path d="M15 18l-6-6 6-6" />
//               </svg>
//             </button>
//           </Link>
//           <div>
//             <p className="text-white text-[13px] font-semibold leading-tight">
//               {currentQuizCategory} Challenge
//             </p>
//             <p className="text-[#6b7280] text-[11px] capitalize">{levelLabel} · Level</p>
//           </div>
//           <div className="ml-auto flex items-center gap-1.5 bg-[#1e2535] px-2.5 py-1 rounded-full">
//             <span className="text-[#4caf82] text-[11px] font-bold">{levelResult.totalPointsEarned}</span>
//             <span className="text-[#555] text-[9px]">pts</span>
//           </div>
//         </div>

//         <div className="flex items-center gap-1.5 mb-2">
//           <div className="bg-[#1e2535] px-2 py-0.5 rounded-full">
//             <span className="text-[#6b7280] text-[10px]">Previously answered</span>
//           </div>
//         </div>

//         <h2 className="text-white text-[22px] sm:text-[26px] font-bold leading-tight mb-1">
//           Question {currentIndex + 1} / {totalQuestions}
//         </h2>
//         <p className="text-[#9ca3af] text-[13px] sm:text-[14px] mb-3">{question.question}</p>

//         <div className="w-full h-[3px] bg-[#1e2535] rounded-full overflow-hidden">
//           <div
//             className="h-full bg-[#e91e8c] rounded-full transition-all duration-500"
//             style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
//           />
//         </div>
//       </div>

//       {/* Options — locked, showing previous selection */}
//       <div className="px-4 pt-2 pb-3 flex flex-col gap-2.5">
//         {question.options.map((opt) => (
//           <OptionButton
//             key={opt}
//             label={opt}
//             selected={opt === restored.selectedAnswer}
//             isCorrect={!!restored.correctAnswer && opt === restored.correctAnswer}
//             answerState={answerState}
//             onSelect={() => {}}
//           />
//         ))}
//       </div>

//       {/* Feedback Banner */}
//       <div
//         className={`mx-4 mb-3 px-4 py-3 rounded-xl flex items-start gap-2.5 ${
//           restored.isCorrect
//             ? "bg-[#0d2b1a] border border-[#1a4a2a]"
//             : "bg-[#2b0d0d] border border-[#4a1a1a]"
//         }`}
//       >
//         {restored.isCorrect ? (
//           <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="flex-shrink-0 mt-0.5">
//             <path d="M5 13l4 4L19 7" stroke="#00c853" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
//           </svg>
//         ) : (
//           <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="flex-shrink-0 mt-0.5">
//             <circle cx="12" cy="12" r="10" stroke="#e53935" strokeWidth="2" />
//             <path d="M8.5 8.5l7 7M15.5 8.5l-7 7" stroke="#e53935" strokeWidth="2" strokeLinecap="round" />
//           </svg>
//         )}
//         <div>
//           <p className={`text-[13px] font-bold mb-0.5 ${restored.isCorrect ? "text-[#00c853]" : "text-[#ef5350]"}`}>
//             {restored.isCorrect ? "Correct!" : "Incorrect"}
//           </p>
//           <p className="text-[#9ca3af] text-[12px] leading-relaxed">
//             {restored.isCorrect
//               ? `You answered "${restored.selectedAnswer}".`
//               : restored.correctAnswer
//               ? `You answered "${restored.selectedAnswer}". Correct answer: "${restored.correctAnswer}".`
//               : `You answered "${restored.selectedAnswer}".`}
//           </p>
//           <p className="text-[#555] text-[11px] mt-1">
//             {levelResult.correctCount}/{levelResult.answeredCount} correct · {levelResult.totalPointsEarned} pts
//           </p>
//         </div>
//       </div>

//       {/* Next Button */}
//       <div className="px-4 pb-5">
//         <button
//           onClick={onNext}
//           className="w-full flex items-center justify-center gap-2 py-[15px] rounded-2xl font-bold text-[15px] text-white bg-gradient-to-r from-[#e91e8c] to-[#ff6b35] hover:opacity-90 active:opacity-80 transition-opacity shadow-lg shadow-pink-900/30"
//         >
//           {currentIndex >= totalQuestions - 1 ? "See Results" : "Next Question"}
//           <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
//             <path d="M9 18l6-6-6-6" />
//           </svg>
//         </button>
//       </div>
//     </div>
//   );
// }

// // ─── Main Component ────────────────────────────────────────────────────────────

// const TriviaQuestion: React.FC = () => {
//   const searchParams = useSearchParams();

//   const levelParam = searchParams.get("level");
//   const quizIdParam = searchParams.get("quizId");

//   const { user, getUserName } = useAuth();
//   const userId = user?.userId ?? null;
//   const userName = getUserName?.() ?? "";
//   const userEmail = user?.email ?? "";

//   const [allQuestions, setAllQuestions] = useState<QuizQuestion[]>([]);
//   const [quizzes, setQuizzes] = useState<FanBattleQuiz[]>([]);
//   const [levelLabel, setLevelLabel] = useState("");
//   const [fetchError, setFetchError] = useState("");
//   const [loading, setLoading] = useState(true);

//   const quizSessionsRef = useRef<Record<string, string>>({});

//   const [sessionCheckLoading, setSessionCheckLoading] = useState(true);
//   const [allAlreadyPlayed, setAllAlreadyPlayed] = useState(false);

//   const [restoredAnswers, setRestoredAnswers] = useState<Record<string, RestoredAnswer>>({});

//   const [levelResult, setLevelResult] = useState<LevelResult>({
//     totalPointsEarned: 0,
//     correctCount: 0,
//     incorrectCount: 0,
//     answeredCount: 0,
//     totalQuestions: 0,
//   });

//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
//   const [answerState, setAnswerState] = useState<AnswerState>("idle");
//   const [correctAnswerText, setCorrectAnswerText] = useState<string | null>(null);
//   const [explanation, setExplanation] = useState("");
//   const [submitting, setSubmitting] = useState(false);
//   const [hasAnsweredCurrent, setHasAnsweredCurrent] = useState(false);
//   const isSubmittingRef = useRef(false);
//   const [showResults, setShowResults] = useState(false);
//   const [sessionsFetched, setSessionsFetched] = useState(false);

//   // Prevent back button mid-quiz
//   useEffect(() => {
//     if (answerState !== "idle") {
//       window.history.pushState(null, "", window.location.href);
//       const handlePopState = () =>
//         window.history.pushState(null, "", window.location.href);
//       window.addEventListener("popstate", handlePopState);
//       return () => window.removeEventListener("popstate", handlePopState);
//     }
//   }, [answerState]);

//   useEffect(() => {
//     return () => { isSubmittingRef.current = false; };
//   }, []);

//   // ── Fetch quizzes ──────────────────────────────────────────────────────────
//   useEffect(() => {
//     const load = async () => {
//       try {
//         let fetchedQuizzes: FanBattleQuiz[] = [];

//         if (levelParam) {
//           const res = await axios.get("/api/fanbattle/quiz", { params: { limit: "50" } });
//           const all: FanBattleQuiz[] = res.data.quizzes || [];
//           fetchedQuizzes = all.filter((q) => q.level === levelParam);
//           setLevelLabel(levelParam);
//         } else if (quizIdParam) {
//           const res = await axios.get(`/api/fanbattle/quiz/${quizIdParam}`);
//           fetchedQuizzes = [res.data.data];
//           setLevelLabel(res.data.data?.level ?? "");
//         } else {
//           setFetchError("No quiz or level selected. Please go back and pick a challenge.");
//           setLoading(false);
//           return;
//         }

//         if (!fetchedQuizzes.length) {
//           setFetchError("No questions found for this level.");
//           setLoading(false);
//           return;
//         }

//         const merged: QuizQuestion[] = [];
//         for (const quiz of fetchedQuizzes) {
//           for (const q of quiz.questions) {
//             merged.push({ ...q, quizId: quiz.id, originalQuestionNumber: q.questionNumber });
//           }
//         }

//         setQuizzes(fetchedQuizzes);
//         setAllQuestions(merged);
//         setLevelResult((prev) => ({ ...prev, totalQuestions: merged.length }));
//       } catch {
//         setFetchError("Failed to load questions. Please try again.");
//       } finally {
//         setLoading(false);
//       }
//     };
//     load();
//   }, [levelParam, quizIdParam]);

//   // ── Check sessions + fetch prior responses ─────────────────────────────────
//   useEffect(() => {
//     if (!userId || !quizzes.length || sessionsFetched) {
//       if (!userId && quizzes.length) setSessionCheckLoading(false);
//       return;
//     }

//     const checkSessions = async () => {
//       try {
//         let completedCount = 0;
//         let startIndex = 0;
//         let foundInProgress = false;
//         const accumulatedResult: Omit<LevelResult, "totalQuestions"> = {
//           totalPointsEarned: 0,
//           correctCount: 0,
//           incorrectCount: 0,
//           answeredCount: 0,
//         };
//         const restored: Record<string, RestoredAnswer> = {};

//         // Sort quizzes to maintain order
//         const sortedQuizzes = [...quizzes].sort((a, b) => {
//           const levelOrder = { beginner: 1, intermediate: 2, advanced: 3 };
//           return (levelOrder[a.level as keyof typeof levelOrder] || 0) - (levelOrder[b.level as keyof typeof levelOrder] || 0);
//         });

//         for (const quiz of sortedQuizzes) {
//           // 1. Check session status for each quiz
//           const sessionRes = await axios.get(`/api/fanbattle/session`, {
//             params: { quizId: quiz.id, userId },
//           });
//           const existing: SessionSummary | null = sessionRes.data?.data ?? null;

//           if (existing?.status === "completed") {
//             completedCount++;
//             const quizQuestions = quiz.questions.length;
//             accumulatedResult.answeredCount += quizQuestions;
//             accumulatedResult.correctCount += existing.correctCount;
//             accumulatedResult.incorrectCount += existing.incorrectCount;
//             accumulatedResult.totalPointsEarned += existing.totalPointsEarned;
//             startIndex += quizQuestions;
//           } else if (existing?.status === "in_progress") {
//             foundInProgress = true;
//             quizSessionsRef.current[quiz.id] = existing.id;
            
//             accumulatedResult.answeredCount += existing.answeredCount;
//             accumulatedResult.correctCount += existing.correctCount;
//             accumulatedResult.incorrectCount += existing.incorrectCount;
//             accumulatedResult.totalPointsEarned += existing.totalPointsEarned;
//             startIndex += existing.answeredCount;
//           }
          
//           // 2. Fetch all responses for this quiz to restore answers
//           try {
//             const respRes = await axios.get(`/api/fanbattle/response`, {
//               params: { quizId: quiz.id, userId },
//             });
//             const responses: Array<{
//               quizId: string;
//               questionNumber: number;
//               selectedAnswer: string;
//               isCorrect: boolean;
//               pointsEarned: number;
//               correctAnswer?: string;
//               answeredAt: number;
//             }> = respRes.data?.data ?? [];

//             // Keep the latest response per question
//             const latestPerQuestion: Record<number, typeof responses[0]> = {};
//             for (const r of responses) {
//               const existingResp = latestPerQuestion[r.questionNumber];
//               if (!existingResp || r.answeredAt > existingResp.answeredAt) {
//                 latestPerQuestion[r.questionNumber] = r;
//               }
//             }

//             for (const [qNum, r] of Object.entries(latestPerQuestion)) {
//               const key = `${quiz.id}:${qNum}`;
//               restored[key] = {
//                 quizId: quiz.id,
//                 questionNumber: Number(qNum),
//                 selectedAnswer: r.selectedAnswer,
//                 isCorrect: r.isCorrect,
//                 pointsEarned: r.pointsEarned,
//                 correctAnswer: r.correctAnswer,
//               };
//             }
//           } catch {
//             console.warn(`Could not fetch responses for quiz ${quiz.id}`);
//           }
//         }

//         setRestoredAnswers(restored);
//         setLevelResult((prev) => ({ ...prev, ...accumulatedResult }));

//         if (completedCount === quizzes.length) {
//           setAllAlreadyPlayed(true);
//         } else if (foundInProgress && startIndex > 0) {
//           setCurrentIndex(startIndex);
//         }
        
//         setSessionsFetched(true);
//       } catch {
//         console.warn("Session check failed, proceeding fresh.");
//         setSessionsFetched(true);
//       } finally {
//         setSessionCheckLoading(false);
//       }
//     };

//     checkSessions();
//   }, [userId, quizzes, sessionsFetched]);

//   // ── Submit answer ──────────────────────────────────────────────────────────
//   const handleSelect = async (answer: string) => {
//     if (answerState !== "idle" || submitting || hasAnsweredCurrent || !userId) return;
//     if (isSubmittingRef.current) return;
//     if (!allQuestions.length) return;

//     isSubmittingRef.current = true;
//     setHasAnsweredCurrent(true);
//     setSelectedAnswer(answer);
//     setSubmitting(true);

//     const currentQuestion = allQuestions[currentIndex];
//     const currentQuizId = currentQuestion.quizId;
//     const existingSessionId = quizSessionsRef.current[currentQuizId];

//     try {
//       const res = await axios.post("/api/fanbattle/response", {
//         quizId: currentQuizId,
//         questionNumber: currentQuestion.originalQuestionNumber,
//         selectedAnswer: answer,
//         userId,
//         userName,
//         userEmail,
//         ...(existingSessionId ? { sessionId: existingSessionId } : {}),
//       });

//       const { response, session: updatedSession } = res.data.data;

//       if (!existingSessionId) {
//         quizSessionsRef.current[currentQuizId] = updatedSession.id;
//       }

//       const isCorrect: boolean = response.isCorrect;
//       const rawCorrect: string = response.correctAnswer ?? "";
//       const matchedOption =
//         currentQuestion.options.find(
//           (o) => o === rawCorrect || o.toLowerCase() === rawCorrect.toLowerCase()
//         ) ?? rawCorrect;
//       const resolvedCorrect =
//         matchedOption && matchedOption.trim() !== ""
//           ? matchedOption
//           : isCorrect
//           ? answer
//           : "";

//       setAnswerState(isCorrect ? "correct" : "incorrect");
//       setCorrectAnswerText(resolvedCorrect);
//       setExplanation(
//         isCorrect
//           ? `Correct! The answer is "${answer}".`
//           : resolvedCorrect
//           ? `Incorrect. The correct answer is "${resolvedCorrect}".`
//           : "Incorrect."
//       );

//       const key = `${currentQuizId}:${currentQuestion.originalQuestionNumber}`;
//       setRestoredAnswers((prev) => ({
//         ...prev,
//         [key]: {
//           quizId: currentQuizId,
//           questionNumber: currentQuestion.originalQuestionNumber,
//           selectedAnswer: answer,
//           isCorrect,
//           pointsEarned: response.pointsEarned ?? 0,
//           correctAnswer: resolvedCorrect || undefined,
//         },
//       }));

//       setLevelResult((prev) => ({
//         ...prev,
//         totalPointsEarned: prev.totalPointsEarned + (response.pointsEarned ?? 0),
//         correctCount: prev.correctCount + (isCorrect ? 1 : 0),
//         incorrectCount: prev.incorrectCount + (isCorrect ? 0 : 1),
//         answeredCount: prev.answeredCount + 1,
//       }));
//     } catch (e) {
//       console.error("Submit error:", e);
//       setHasAnsweredCurrent(false);
//       setAnswerState("idle");
//       setExplanation("");
//       setSelectedAnswer(null);
//       setCorrectAnswerText(null);
//     } finally {
//       setSubmitting(false);
//       isSubmittingRef.current = false;
//     }
//   };

//   // ── Next question ──────────────────────────────────────────────────────────
//   const handleNext = () => {
//     if (currentIndex >= allQuestions.length - 1) {
//       setShowResults(true);
//       return;
//     }
//     setCurrentIndex((prev) => prev + 1);
//     setSelectedAnswer(null);
//     setAnswerState("idle");
//     setCorrectAnswerText(null);
//     setExplanation("");
//     setHasAnsweredCurrent(false);
//     isSubmittingRef.current = false;
//   };

//   // ── Guards ─────────────────────────────────────────────────────────────────
//   if (fetchError) {
//     return (
//       <div className="w-full mt-20 max-w-sm sm:max-w-md mx-auto bg-[#0f1520] rounded-2xl p-6 text-center">
//         <p className="text-[#ef5350] text-[14px] mb-4">{fetchError}</p>
//         <Link href="/MainModules/FanBattle">
//           <button className="text-[#9ca3af] text-[13px] underline">Go back</button>
//         </Link>
//       </div>
//     );
//   }

//   if (loading || sessionCheckLoading) return <LoadingScreen />;
//   if (allAlreadyPlayed) return <AlreadyPlayedScreen level={levelLabel} />;
//   if (showResults) return <ResultsScreen result={levelResult} level={levelLabel} />;

//   if (!allQuestions.length) {
//     return (
//       <div className="w-full mt-20 max-w-sm sm:max-w-md mx-auto bg-[#0f1520] rounded-2xl p-6 text-center">
//         <p className="text-[#9ca3af] text-[14px]">No questions available.</p>
//         <Link href="/MainModules/FanBattle">
//           <button className="text-[#9ca3af] text-[13px] underline mt-4">Go back</button>
//         </Link>
//       </div>
//     );
//   }

//   const currentQuestion = allQuestions[currentIndex];
//   const currentQuiz = quizzes.find((q) => q.id === currentQuestion?.quizId);
//   const progressPct = ((currentIndex + (answerState !== "idle" ? 1 : 0)) / allQuestions.length) * 100;

//   const restoredKey = `${currentQuestion?.quizId}:${currentQuestion?.originalQuestionNumber}`;
//   const restoredAnswer = currentQuestion ? restoredAnswers[restoredKey] : undefined;

//   // If this question was previously answered, show locked read-only view
//   if (restoredAnswer && answerState === "idle" && !hasAnsweredCurrent) {
//     return (
//       <RestoredQuestionView
//         question={currentQuestion}
//         restored={restoredAnswer}
//         currentIndex={currentIndex}
//         totalQuestions={allQuestions.length}
//         levelResult={levelResult}
//         levelLabel={levelLabel}
//         currentQuizCategory={currentQuiz?.category ?? "Trivia"}
//         onNext={handleNext}
//       />
//     );
//   }

//   return (
//     <div className="w-full mt-20 max-w-sm sm:max-w-md mx-auto bg-[#0f1520] rounded-2xl overflow-hidden">
//       {/* Header */}
//       <div className="px-4 pt-4 pb-3 bg-[#0f1520]">
//         <div className="flex items-center gap-2 mb-3">
//           <Link href="/MainModules/FanBattle">
//             <button className="flex items-center justify-center w-7 h-7 rounded-full hover:bg-[#1e2535] transition-colors">
//               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
//                 <path d="M15 18l-6-6 6-6" />
//               </svg>
//             </button>
//           </Link>
//           <div>
//             <p className="text-white text-[13px] font-semibold leading-tight">
//               {currentQuiz?.category ?? "Trivia"} Challenge
//             </p>
//             <p className="text-[#6b7280] text-[11px] capitalize">{levelLabel} · Level</p>
//           </div>
//           <div className="ml-auto flex items-center gap-1.5 bg-[#1e2535] px-2.5 py-1 rounded-full">
//             <span className="text-[#4caf82] text-[11px] font-bold">{levelResult.totalPointsEarned}</span>
//             <span className="text-[#555] text-[9px]">pts</span>
//           </div>
//         </div>

//         <h2 className="text-white text-[22px] sm:text-[26px] font-bold leading-tight mb-1">
//           Question {currentIndex + 1} / {allQuestions.length}
//         </h2>
//         <p className="text-[#9ca3af] text-[13px] sm:text-[14px] mb-3">
//           {currentQuestion.question}
//         </p>

//         <div className="w-full h-[3px] bg-[#1e2535] rounded-full overflow-hidden">
//           <div
//             className="h-full bg-[#e91e8c] rounded-full transition-all duration-500"
//             style={{ width: `${Math.max(progressPct, 2)}%` }}
//           />
//         </div>
//       </div>

//       {/* Options */}
//       <div className="px-4 pt-2 pb-3 flex flex-col gap-2.5">
//         {currentQuestion.options.map((opt) => (
//           <OptionButton
//             key={opt}
//             label={opt}
//             selected={selectedAnswer === opt}
//             isCorrect={!!correctAnswerText && opt === correctAnswerText}
//             answerState={answerState}
//             onSelect={() => handleSelect(opt)}
//           />
//         ))}
//       </div>

//       {submitting && (
//         <div className="px-4 pb-2">
//           <p className="text-[#6b7280] text-[12px] text-center animate-pulse">Checking answer…</p>
//         </div>
//       )}

//       {/* Feedback Banner */}
//       {answerState !== "idle" && (
//         <div
//           className={`mx-4 mb-3 px-4 py-3 rounded-xl flex items-start gap-2.5 transition-all duration-300 ${
//             answerState === "correct"
//               ? "bg-[#0d2b1a] border border-[#1a4a2a]"
//               : "bg-[#2b0d0d] border border-[#4a1a1a]"
//           }`}
//         >
//           {answerState === "correct" ? (
//             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="flex-shrink-0 mt-0.5">
//               <path d="M5 13l4 4L19 7" stroke="#00c853" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
//             </svg>
//           ) : (
//             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="flex-shrink-0 mt-0.5">
//               <circle cx="12" cy="12" r="10" stroke="#e53935" strokeWidth="2" />
//               <path d="M8.5 8.5l7 7M15.5 8.5l-7 7" stroke="#e53935" strokeWidth="2" strokeLinecap="round" />
//             </svg>
//           )}
//           <div>
//             <p className={`text-[13px] font-bold mb-0.5 ${answerState === "correct" ? "text-[#00c853]" : "text-[#ef5350]"}`}>
//               {answerState === "correct" ? "Correct!" : "Incorrect"}
//             </p>
//             <p className="text-[#9ca3af] text-[12px] leading-relaxed">{explanation}</p>
//             <p className="text-[#555] text-[11px] mt-1">
//               {levelResult.correctCount}/{levelResult.answeredCount} correct · {levelResult.totalPointsEarned} pts
//             </p>
//           </div>
//         </div>
//       )}

//       {/* Next Button */}
//       {answerState !== "idle" && (
//         <div className="px-4 pb-5">
//           <button
//             onClick={handleNext}
//             className="w-full flex items-center justify-center gap-2 py-[15px] rounded-2xl font-bold text-[15px] text-white bg-gradient-to-r from-[#e91e8c] to-[#ff6b35] hover:opacity-90 active:opacity-80 transition-opacity shadow-lg shadow-pink-900/30"
//           >
//             {currentIndex >= allQuestions.length - 1 ? "See Results" : "Next Question"}
//             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
//               <path d="M9 18l6-6-6-6" />
//             </svg>
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default TriviaQuestion;






"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { emitSxpActivityRefresh } from "@/lib/sxpEvents";

type AnswerState = "idle" | "correct" | "incorrect";

// ─── Level config ──────────────────────────────────────────────────────────────
const LEVEL_ORDER = ["easy", "medium", "difficult"] as const;
type Level = (typeof LEVEL_ORDER)[number];

const LEVEL_LABELS: Record<Level, string> = {
  easy: "Easy",
  medium: "Medium",
  difficult: "Difficult",
};

const NEXT_LEVEL: Record<Level, Level | null> = {
  easy: "medium",
  medium: "difficult",
  difficult: null,
};

// ─── Types ─────────────────────────────────────────────────────────────────────

interface QuizQuestion {
  questionNumber: number;
  question: string;
  options: string[];
  points: number;
  quizId: string;
  originalQuestionNumber: number;
}

interface FanBattleQuiz {
  id: string;
  level: string;
  category: string;
  questions: QuizQuestion[];
  totalQuestions: number;
  totalPoints: number;
}

interface SessionSummary {
  id: string;
  status: "in_progress" | "completed";
  totalPointsEarned: number;
  correctCount: number;
  incorrectCount: number;
  answeredCount: number;
  totalQuestions: number;
  completedAt: number | null;
}

interface RestoredAnswer {
  quizId: string;
  questionNumber: number;
  selectedAnswer: string;
  isCorrect: boolean;
  pointsEarned: number;
  correctAnswer?: string;
}

interface LevelResult {
  totalPointsEarned: number;
  correctCount: number;
  incorrectCount: number;
  answeredCount: number;
  totalQuestions: number;
}

// ─── Option Button ─────────────────────────────────────────────────────────────

interface OptionButtonProps {
  label: string;
  selected: boolean;
  isCorrect: boolean;
  answerState: AnswerState;
  onSelect: () => void;
}

const OptionButton: React.FC<OptionButtonProps> = ({
  label,
  selected,
  isCorrect,
  answerState,
  onSelect,
}) => {
  const isAnswered = answerState !== "idle";
  const isSelectedCorrect = isAnswered && selected && isCorrect;
  const isSelectedIncorrect = isAnswered && selected && !isCorrect;
  const isUnselectedCorrect = isAnswered && !selected && isCorrect;

  const getBorderAndBg = () => {
    if (!isAnswered)
      return "border border-[#2a2f3a] bg-[#151b26] hover:border-[#3a4150] hover:bg-[#1a2030] active:bg-[#1e2535]";
    if (isSelectedCorrect) return "border border-[#00c853] bg-[#0d2b1a]";
    if (isSelectedIncorrect) return "border border-[#e53935] bg-[#2b0d0d]";
    if (isUnselectedCorrect) return "border border-[#00c853] bg-[#0a2016] opacity-80";
    return "border border-[#2a2f3a] bg-[#151b26] opacity-60";
  };

  const getLabelColor = () => {
    if (!isAnswered) return "text-white";
    if (isSelectedCorrect) return "text-[#00e676]";
    if (isSelectedIncorrect) return "text-[#ef5350]";
    if (isUnselectedCorrect) return "text-[#00e676]";
    return "text-[#6b7280]";
  };

  return (
    <button
      onClick={() => !isAnswered && onSelect()}
      disabled={isAnswered}
      className={`w-full flex items-center justify-between px-4 py-[14px] rounded-xl transition-all duration-200 ${getBorderAndBg()} cursor-pointer disabled:cursor-default`}
    >
      <span className={`text-[14px] sm:text-[15px] font-medium ${getLabelColor()}`}>
        {label}
      </span>
      {isAnswered && (isSelectedCorrect || isSelectedIncorrect || isUnselectedCorrect) && (
        <span className="flex-shrink-0 ml-2">
          {(isSelectedCorrect || isUnselectedCorrect) && (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="11" stroke="#00c853" strokeWidth="1.5" />
              <path d="M7 12.5l3.5 3.5 6.5-7" stroke="#00c853" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
          {isSelectedIncorrect && (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="11" stroke="#e53935" strokeWidth="1.5" />
              <path d="M8.5 8.5l7 7M15.5 8.5l-7 7" stroke="#e53935" strokeWidth="2" strokeLinecap="round" />
            </svg>
          )}
        </span>
      )}
    </button>
  );
};

// ─── Level Complete Screen ─────────────────────────────────────────────────────

function LevelCompleteScreen({
  completedLevel,
  nextLevel,
  result,
  onContinue,
}: {
  completedLevel: Level;
  nextLevel: Level;
  result: LevelResult;
  onContinue: () => void;
}) {
  const pct =
    result.totalQuestions > 0
      ? Math.round((result.correctCount / result.totalQuestions) * 100)
      : 0;

  return (
    <div className="w-full mt-20 max-w-sm sm:max-w-md mx-auto bg-[#0f1520] rounded-2xl overflow-hidden px-4 py-6">
      {/* Celebration icon */}
      <div className="text-center mb-5">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 bg-gradient-to-br from-[#e91e8c22] to-[#ff6b3522] border border-[#e91e8c44]">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" fill="#e91e8c" />
          </svg>
        </div>
        <h2 className="text-white text-[22px] font-bold">Level Complete!</h2>
        <p className="text-[#9ca3af] text-[13px] mt-1">
          You finished the{" "}
          <span className="capitalize text-white font-semibold">
            {LEVEL_LABELS[completedLevel]}
          </span>{" "}
          level
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: "Points", value: result.totalPointsEarned, color: "#4caf82" },
          { label: "Correct", value: result.correctCount, color: "#00c853" },
          { label: "Score", value: `${pct}%`, color: pct >= 60 ? "#4caf82" : "#e53935" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-[#1a1a1a] rounded-xl p-3 text-center border border-[#222222]">
            <p className="text-[11px] text-[#666] uppercase tracking-wider mb-1">{label}</p>
            <p className="font-bold text-[18px]" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Next level teaser */}
      <div className="bg-[#1a1a2e] border border-[#2a2a4e] rounded-xl p-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#e91e8c] to-[#ff6b35] flex items-center justify-center flex-shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </div>
          <div>
            <p className="text-white text-[13px] font-bold">
              Next: {LEVEL_LABELS[nextLevel]} Level
            </p>
            <p className="text-[#6b7280] text-[11px] mt-0.5">
              Ready for a harder challenge?
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={onContinue}
        className="w-full py-3 rounded-2xl font-bold text-[14px] text-white bg-gradient-to-r from-[#e91e8c] to-[#ff6b35] hover:opacity-90 transition-opacity"
      >
        Continue to {LEVEL_LABELS[nextLevel]} Level →
      </button>
    </div>
  );
}

// ─── Locked Level Screen ───────────────────────────────────────────────────────

function LockedLevelScreen({
  requestedLevel,
  requiredLevel,
}: {
  requestedLevel: Level;
  requiredLevel: Level;
}) {
  const router = useRouter();

  return (
    <div className="w-full mt-20 max-w-sm sm:max-w-md mx-auto bg-[#0f1520] rounded-2xl px-4 py-6 text-center">
      <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 bg-[#1a1a2e] border border-[#2a2a4a]">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
          <rect x="5" y="11" width="14" height="10" rx="2" stroke="#9ca3af" strokeWidth="1.5" />
          <path d="M8 11V7a4 4 0 018 0v4" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
      <h2 className="text-white text-[20px] font-bold">Level Locked</h2>
      <p className="text-[#9ca3af] text-[13px] mt-2 leading-relaxed">
        You need to complete the{" "}
        <span className="text-white font-semibold capitalize">
          {LEVEL_LABELS[requiredLevel]}
        </span>{" "}
        level before unlocking{" "}
        <span className="text-white font-semibold capitalize">
          {LEVEL_LABELS[requestedLevel]}
        </span>
        .
      </p>
      <p className="text-[#555] text-[12px] mt-3 mb-6">
        Complete each level in order to unlock the next challenge.
      </p>

      {/* Level progression visual */}
      <div className="flex items-center justify-center gap-2 mb-6">
        {LEVEL_ORDER.map((lvl, i) => {
          const isRequired = lvl === requiredLevel;
          const isRequested = lvl === requestedLevel;
          const isPast =
            LEVEL_ORDER.indexOf(lvl) < LEVEL_ORDER.indexOf(requiredLevel);
          return (
            <React.Fragment key={lvl}>
              <div
                className={`flex flex-col items-center gap-1`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold border
                    ${isPast ? "bg-[#0d2b1a] border-[#00c853] text-[#00c853]" : ""}
                    ${isRequired ? "bg-[#1a1a2e] border-[#e91e8c] text-[#e91e8c]" : ""}
                    ${isRequested ? "bg-[#1a0a0a] border-[#555] text-[#555]" : ""}
                    ${!isPast && !isRequired && !isRequested ? "bg-[#111] border-[#333] text-[#444]" : ""}
                  `}
                >
                  {isPast ? "✓" : i + 1}
                </div>
                <span className={`text-[10px] ${isRequired ? "text-[#e91e8c]" : isPast ? "text-[#00c853]" : "text-[#444]"}`}>
                  {LEVEL_LABELS[lvl]}
                </span>
              </div>
              {i < LEVEL_ORDER.length - 1 && (
                <div className={`w-6 h-[2px] mb-4 rounded ${isPast ? "bg-[#00c853]" : "bg-[#222]"}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      <button
        onClick={() =>
          router.push(`/MainModules/FanBattle/TriviaQuestion?level=${requiredLevel}`)
        }
        className="w-full py-3 rounded-2xl font-bold text-[14px] text-white bg-gradient-to-r from-[#e91e8c] to-[#ff6b35] hover:opacity-90 transition-opacity mb-3"
      >
        Play {LEVEL_LABELS[requiredLevel]} Level
      </button>
      <button
        onClick={() => router.push("/MainModules/FanBattle")}
        className="w-full py-3 rounded-2xl font-bold text-[14px] text-[#6b7280] bg-[#1a1a1a] hover:bg-[#222] transition-colors"
      >
        Back to Fan Battle
      </button>
    </div>
  );
}

// ─── Results Screen ────────────────────────────────────────────────────────────

function ResultsScreen({ result, level }: { result: LevelResult; level: string }) {
  const router = useRouter();
  const nextLevel = NEXT_LEVEL[level as Level];
  const pct =
    result.totalQuestions > 0
      ? Math.round((result.correctCount / result.totalQuestions) * 100)
      : 0;

  return (
    <div className="w-full mt-20 pb-10 max-w-sm sm:max-w-md mx-auto bg-[#0f1520] rounded-2xl overflow-hidden px-4 py-6">
      <div className="text-center mb-6">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3"
          style={{ background: pct >= 60 ? "#0d2b1a" : "#2b0d0d" }}
        >
          {pct >= 60 ? (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path d="M5 13l4 4L19 7" stroke="#00c853" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
              <path d="M12 17c-2.76 0-5-2.24-5-5V5h10v7c0 2.76-2.24 5-5 5zM9 21h6v1H9z" />
            </svg>
          )}
        </div>
        <h2 className="text-white text-[22px] font-bold">
          {pct >= 80 ? "Outstanding!" : pct >= 60 ? "Well done!" : "Keep practicing!"}
        </h2>
        <p className="text-[#9ca3af] text-[13px] mt-1 capitalize">{level} Level Complete</p>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Points", value: result.totalPointsEarned, color: "#4caf82" },
          { label: "Correct", value: result.correctCount, color: "#00c853" },
          { label: "Score", value: `${pct}%`, color: pct >= 60 ? "#4caf82" : "#e53935" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-[#1a1a1a] rounded-xl p-3 text-center border border-[#222222]">
            <p className="text-[11px] text-[#666] uppercase tracking-wider mb-1">{label}</p>
            <p className="font-bold text-[18px]" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>

      <div className="bg-[#1a1a1a] border border-[#222222] rounded-xl p-4 mb-5">
        {[
          { label: "Questions answered", value: result.answeredCount },
          { label: "Correct", value: result.correctCount },
          { label: "Incorrect", value: result.incorrectCount },
        ].map(({ label, value }, i, arr) => (
          <div
            key={label}
            className={`flex justify-between py-2.5 ${i < arr.length - 1 ? "border-b border-[#252525]" : ""}`}
          >
            <span className="text-[#666] text-[13px]">{label}</span>
            <span className="text-white text-[13px] font-medium">{value}</span>
          </div>
        ))}
      </div>

      {nextLevel ? (
        <button
          onClick={() => router.push(`/MainModules/FanBattle/TriviaQuestion?level=${nextLevel}`)}
          className="w-full py-3 rounded-2xl font-bold text-[14px] text-white bg-gradient-to-r from-[#e91e8c] to-[#ff6b35] hover:opacity-90 transition-opacity mb-3"
        >
          Play Next Battle
        </button>
      ) : null}
      <button
        onClick={() => router.push("/MainModules/FanBattle")}
        className={`w-full py-3 rounded-2xl font-bold text-[14px] transition-all ${
          nextLevel 
            ? "text-[#6b7280] bg-[#1a1a1a] hover:bg-[#222]" 
            : "text-white bg-gradient-to-r from-[#e91e8c] to-[#ff6b35] hover:opacity-90"
        }`}
      >
        Back to Fan Battle
      </button>
    </div>
  );
}

// ─── Already Played Screen ─────────────────────────────────────────────────────

function AlreadyPlayedScreen({ level }: { level: string }) {
  const router = useRouter();
  const nextLevel = NEXT_LEVEL[level as Level];
  return (
    <div className="w-full mt-20 max-w-sm sm:max-w-md mx-auto bg-[#0f1520] rounded-2xl px-4 py-6 text-center">
      <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 bg-[#1a1a2e] border border-[#2a2a4a]">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="#9ca3af" strokeWidth="1.5" />
          <path d="M12 7v5l3 3" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <h2 className="text-white text-[20px] font-bold">Already Played!</h2>
      <p className="text-[#9ca3af] text-[13px] mt-1">
        You have already completed all{" "}
        <span className="capitalize">{level}</span> challenges.
      </p>
      <p className="text-[#555] text-[12px] mt-3 mb-6">
        Each quiz can only be played once. Check back for new challenges!
      </p>
      {nextLevel ? (
        <button
          onClick={() => router.push(`/MainModules/FanBattle/TriviaQuestion?level=${nextLevel}`)}
          className="w-full py-3 rounded-2xl font-bold text-[14px] text-white bg-gradient-to-r from-[#e91e8c] to-[#ff6b35] hover:opacity-90 transition-opacity mb-3"
        >
          Play Next Battle
        </button>
      ) : null}
      <button
        onClick={() => router.push("/MainModules/FanBattle")}
        className={`w-full py-3 rounded-2xl font-bold text-[14px] transition-all ${
          nextLevel 
            ? "text-[#6b7280] bg-[#1a1a1a] hover:bg-[#222]" 
            : "text-white bg-gradient-to-r from-[#e91e8c] to-[#ff6b35] hover:opacity-90"
        }`}
      >
        Back to Fan Battle
      </button>
    </div>
  );
}

// ─── Loading Screen ────────────────────────────────────────────────────────────

function LoadingScreen() {
  return (
    <div className="w-full mt-20 max-w-sm sm:max-w-md mx-auto bg-[#0f1520] rounded-2xl overflow-hidden animate-pulse">
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-full bg-[#1e2535]" />
          <div className="h-4 w-32 bg-[#1e2535] rounded" />
        </div>
        <div className="h-7 w-48 bg-[#1e2535] rounded mb-2" />
        <div className="h-4 w-full bg-[#1e2535] rounded mb-3" />
        <div className="h-1 w-full bg-[#1e2535] rounded" />
      </div>
      <div className="px-4 pt-2 pb-3 flex flex-col gap-2.5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-12 w-full bg-[#1e2535] rounded-xl" />
        ))}
      </div>
    </div>
  );
}

// ─── Restored Answer View ──────────────────────────────────────────────────────

interface RestoredQuestionViewProps {
  question: QuizQuestion;
  restored: RestoredAnswer;
  currentIndex: number;
  totalQuestions: number;
  levelResult: LevelResult;
  levelLabel: string;
  currentQuizCategory: string;
  onNext: () => void;
}

function RestoredQuestionView({
  question,
  restored,
  currentIndex,
  totalQuestions,
  levelResult,
  levelLabel,
  currentQuizCategory,
  onNext,
}: RestoredQuestionViewProps) {
  const answerState: AnswerState = restored.isCorrect ? "correct" : "incorrect";

  return (
    <div className="w-full mt-20 max-w-sm sm:max-w-md mx-auto bg-[#0f1520] rounded-2xl overflow-hidden">
      <div className="px-4 pt-4 pb-3 bg-[#0f1520]">
        <div className="flex items-center gap-2 mb-3">
          <Link href="/MainModules/FanBattle">
            <button className="flex items-center justify-center w-7 h-7 rounded-full hover:bg-[#1e2535] transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
          </Link>
          <div>
            <p className="text-white text-[13px] font-semibold leading-tight">
              {currentQuizCategory} Challenge
            </p>
            <p className="text-[#6b7280] text-[11px] capitalize">{levelLabel} · Level</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5 bg-[#1e2535] px-2.5 py-1 rounded-full">
            <span className="text-[#4caf82] text-[11px] font-bold">{levelResult.totalPointsEarned}</span>
            <span className="text-[#555] text-[9px]">pts</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 mb-2">
          <div className="bg-[#1e2535] px-2 py-0.5 rounded-full">
            <span className="text-[#6b7280] text-[10px]">Previously answered</span>
          </div>
        </div>

        <h2 className="text-white text-[22px] sm:text-[26px] font-bold leading-tight mb-1">
          Question {currentIndex + 1} / {totalQuestions}
        </h2>
        <p className="text-[#9ca3af] text-[13px] sm:text-[14px] mb-3">{question.question}</p>

        <div className="w-full h-[3px] bg-[#1e2535] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#e91e8c] rounded-full transition-all duration-500"
            style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      <div className="px-4 pt-2 pb-3 flex flex-col gap-2.5">
        {question.options.map((opt) => (
          <OptionButton
            key={opt}
            label={opt}
            selected={opt === restored.selectedAnswer}
            isCorrect={!!restored.correctAnswer && opt === restored.correctAnswer}
            answerState={answerState}
            onSelect={() => {}}
          />
        ))}
      </div>

      <div
        className={`mx-4 mb-3 px-4 py-3 rounded-xl flex items-start gap-2.5 ${
          restored.isCorrect
            ? "bg-[#0d2b1a] border border-[#1a4a2a]"
            : "bg-[#2b0d0d] border border-[#4a1a1a]"
        }`}
      >
        {restored.isCorrect ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="flex-shrink-0 mt-0.5">
            <path d="M5 13l4 4L19 7" stroke="#00c853" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="flex-shrink-0 mt-0.5">
            <circle cx="12" cy="12" r="10" stroke="#e53935" strokeWidth="2" />
            <path d="M8.5 8.5l7 7M15.5 8.5l-7 7" stroke="#e53935" strokeWidth="2" strokeLinecap="round" />
          </svg>
        )}
        <div>
          <p className={`text-[13px] font-bold mb-0.5 ${restored.isCorrect ? "text-[#00c853]" : "text-[#ef5350]"}`}>
            {restored.isCorrect ? "Correct!" : "Incorrect"}
          </p>
          <p className="text-[#9ca3af] text-[12px] leading-relaxed">
            {restored.isCorrect
              ? `You answered "${restored.selectedAnswer}".`
              : restored.correctAnswer
              ? `You answered "${restored.selectedAnswer}". Correct answer: "${restored.correctAnswer}".`
              : `You answered "${restored.selectedAnswer}".`}
          </p>
          <p className="text-[#555] text-[11px] mt-1">
            {levelResult.correctCount}/{levelResult.answeredCount} correct · {levelResult.totalPointsEarned} pts
          </p>
        </div>
      </div>

      <div className="px-4 pb-5">
        <button
          onClick={onNext}
          className="w-full flex items-center justify-center gap-2 py-[15px] rounded-2xl font-bold text-[15px] text-white bg-gradient-to-r from-[#e91e8c] to-[#ff6b35] hover:opacity-90 active:opacity-80 transition-opacity shadow-lg shadow-pink-900/30"
        >
          {currentIndex >= totalQuestions - 1 ? "See Results" : "Next Question"}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Returns the lowest level whose sessions are NOT all completed.
 * i.e. the first incomplete level in order.
 */
async function getFirstIncompleteLevel(
  userId: string,
  quizzesByLevel: Record<string, FanBattleQuiz[]>
): Promise<{ unlockedUpTo: Level; completedLevels: Set<Level> }> {
  const completedLevels = new Set<Level>();

  for (const level of LEVEL_ORDER) {
    const quizzes = quizzesByLevel[level] ?? [];
    if (!quizzes.length) continue;

    let allComplete = true;
    for (const quiz of quizzes) {
      const sessionRes = await axios.get(`/api/fanbattle/session`, {
        params: { quizId: quiz.id, userId },
      });
      const existing: SessionSummary | null = sessionRes.data?.data ?? null;
      if (existing?.status !== "completed") {
        allComplete = false;
        break;
      }
    }
    if (allComplete) {
      completedLevels.add(level);
    } else {
      break;
    }
  }

  // Unlocked up to = first incomplete, or last level if all done
  const firstIncomplete = LEVEL_ORDER.find((l) => !completedLevels.has(l)) ?? "difficult";
  return { unlockedUpTo: firstIncomplete, completedLevels };
}

// ─── Main Component ────────────────────────────────────────────────────────────

const TriviaQuestion: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const levelParam = searchParams.get("level") as Level | null;
  const quizIdParam = searchParams.get("quizId");

  const { user, getUserName } = useAuth();
  const userId = user?.userId ?? null;
  const userName = getUserName?.() ?? "";
  const userEmail = user?.email ?? "";

  // ── State ──────────────────────────────────────────────────────────────────
  const [allQuestions, setAllQuestions] = useState<QuizQuestion[]>([]);
  const [quizzes, setQuizzes] = useState<FanBattleQuiz[]>([]);
  const [allQuizzesByLevel, setAllQuizzesByLevel] = useState<Record<string, FanBattleQuiz[]>>({});
  const [levelLabel, setLevelLabel] = useState<Level>("easy");
  const [fetchError, setFetchError] = useState("");
  const [loading, setLoading] = useState(true);

  const quizSessionsRef = useRef<Record<string, string>>({});

  const [sessionCheckLoading, setSessionCheckLoading] = useState(true);
  const [allAlreadyPlayed, setAllAlreadyPlayed] = useState(false);

  // Level lock check
  const [lockCheckDone, setLockCheckDone] = useState(false);
  const [lockedInfo, setLockedInfo] = useState<{ requestedLevel: Level; requiredLevel: Level } | null>(null);

  const [restoredAnswers, setRestoredAnswers] = useState<Record<string, RestoredAnswer>>({});

  const [levelResult, setLevelResult] = useState<LevelResult>({
    totalPointsEarned: 0,
    correctCount: 0,
    incorrectCount: 0,
    answeredCount: 0,
    totalQuestions: 0,
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answerState, setAnswerState] = useState<AnswerState>("idle");
  const [correctAnswerText, setCorrectAnswerText] = useState<string | null>(null);
  const [explanation, setExplanation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [hasAnsweredCurrent, setHasAnsweredCurrent] = useState(false);
  const isSubmittingRef = useRef(false);

  const [showResults, setShowResults] = useState(false);
  const [showLevelComplete, setShowLevelComplete] = useState(false);
  const [sessionsFetched, setSessionsFetched] = useState(false);

  // Prevent back button mid-quiz
  useEffect(() => {
    if (answerState !== "idle") {
      window.history.pushState(null, "", window.location.href);
      const handlePopState = () =>
        window.history.pushState(null, "", window.location.href);
      window.addEventListener("popstate", handlePopState);
      return () => window.removeEventListener("popstate", handlePopState);
    }
  }, [answerState]);

  useEffect(() => {
    return () => { isSubmittingRef.current = false; };
  }, []);

  // ── Fetch ALL quizzes grouped by level (needed for lock check) ─────────────
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setFetchError("");
      setShowResults(false);
      setShowLevelComplete(false);
      setAllAlreadyPlayed(false);
      setSessionsFetched(false);
      setLockCheckDone(false);
      setLockedInfo(null);
      setCurrentIndex(0);
      setAnswerState("idle");
      setSelectedAnswer(null);
      setHasAnsweredCurrent(false);
      setLevelResult({
        totalPointsEarned: 0,
        correctCount: 0,
        incorrectCount: 0,
        answeredCount: 0,
        totalQuestions: 0,
      });
      setRestoredAnswers({});
      setQuizzes([]);
      setAllQuestions([]);

      try {
        // Always fetch all quizzes so we can check level completion
        const res = await axios.get("/api/fanbattle/quiz", { params: { limit: "50" } });
        const all: FanBattleQuiz[] = res.data.quizzes || [];

        // Group by level
        const byLevel: Record<string, FanBattleQuiz[]> = {};
        for (const q of all) {
          if (!byLevel[q.level]) byLevel[q.level] = [];
          byLevel[q.level].push(q);
        }
        setAllQuizzesByLevel(byLevel);

        // Determine which quizzes to actually play
        let targetLevel: Level = "easy";
        let fetchedQuizzes: FanBattleQuiz[] = [];

        if (quizIdParam) {
          const singleRes = await axios.get(`/api/fanbattle/quiz/${quizIdParam}`);
          fetchedQuizzes = [singleRes.data.data];
          targetLevel = (singleRes.data.data?.level ?? "easy") as Level;
        } else if (levelParam) {
          fetchedQuizzes = byLevel[levelParam] ?? [];
          targetLevel = levelParam as Level;
        } else {
          setFetchError("No quiz or level selected. Please go back and pick a challenge.");
          setLoading(false);
          return;
        }

        if (!fetchedQuizzes.length) {
          setFetchError("No questions found for this level.");
          setLoading(false);
          return;
        }

        setLevelLabel(targetLevel);
        setQuizzes(fetchedQuizzes);

        const merged: QuizQuestion[] = [];
        for (const quiz of fetchedQuizzes) {
          for (const q of quiz.questions) {
            merged.push({ ...q, quizId: quiz.id, originalQuestionNumber: q.questionNumber });
          }
        }
        setAllQuestions(merged);
        setLevelResult((prev) => ({ ...prev, totalQuestions: merged.length }));
      } catch {
        setFetchError("Failed to load questions. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [levelParam, quizIdParam]);

  // ── Lock check + session check ─────────────────────────────────────────────
  useEffect(() => {
    if (!userId || !quizzes.length || !Object.keys(allQuizzesByLevel).length || sessionsFetched) {
      if (!userId && quizzes.length) {
        setSessionCheckLoading(false);
        setLockCheckDone(true);
      }
      return;
    }

    const checkSessions = async () => {
      try {
        // ── 1. Lock check: only applies if going to intermediate or advanced ──
        const requestedLevel = levelLabel;
        const requestedIndex = LEVEL_ORDER.indexOf(requestedLevel);

        if (requestedIndex > 0) {
          // Must verify all prior levels are fully complete
          for (let i = 0; i < requestedIndex; i++) {
            const priorLevel = LEVEL_ORDER[i];
            const priorQuizzes = allQuizzesByLevel[priorLevel] ?? [];

            for (const quiz of priorQuizzes) {
              const sessionRes = await axios.get(`/api/fanbattle/session`, {
                params: { quizId: quiz.id, userId },
              });
              const existing: SessionSummary | null = sessionRes.data?.data ?? null;
              if (existing?.status !== "completed") {
                // Locked — find the lowest incomplete prior level to redirect to
                const requiredLevel = LEVEL_ORDER[i];
                setLockedInfo({ requestedLevel, requiredLevel });
                setLockCheckDone(true);
                setSessionCheckLoading(false);
                setSessionsFetched(true);
                return;
              }
            }
          }
        }

        setLockCheckDone(true);

        // ── 2. Normal session + restore check ─────────────────────────────────
        let completedCount = 0;
        let startIndex = 0;
        const accumulatedResult: Omit<LevelResult, "totalQuestions"> = {
          totalPointsEarned: 0,
          correctCount: 0,
          incorrectCount: 0,
          answeredCount: 0,
        };
        const restored: Record<string, RestoredAnswer> = {};

        const sortedQuizzes = [...quizzes].sort((a, b) => {
          const levelOrder = { easy: 1, medium: 2, difficult: 3 };
          return (
            (levelOrder[a.level as keyof typeof levelOrder] || 0) -
            (levelOrder[b.level as keyof typeof levelOrder] || 0)
          );
        });

        for (const quiz of sortedQuizzes) {
          const sessionRes = await axios.get(`/api/fanbattle/session`, {
            params: { quizId: quiz.id, userId },
          });
          const existing: SessionSummary | null = sessionRes.data?.data ?? null;

          if (existing?.status === "completed") {
            completedCount++;
            const quizQuestions = quiz.questions.length;
            accumulatedResult.answeredCount += quizQuestions;
            accumulatedResult.correctCount += existing.correctCount;
            accumulatedResult.incorrectCount += existing.incorrectCount;
            accumulatedResult.totalPointsEarned += existing.totalPointsEarned;
            startIndex += quizQuestions;
          } else if (existing?.status === "in_progress") {
            quizSessionsRef.current[quiz.id] = existing.id;
            accumulatedResult.answeredCount += existing.answeredCount;
            accumulatedResult.correctCount += existing.correctCount;
            accumulatedResult.incorrectCount += existing.incorrectCount;
            accumulatedResult.totalPointsEarned += existing.totalPointsEarned;
            startIndex += existing.answeredCount;
          }

          try {
            const respRes = await axios.get(`/api/fanbattle/response`, {
              params: { quizId: quiz.id, userId },
            });
            const responses: Array<{
              quizId: string;
              questionNumber: number;
              selectedAnswer: string;
              isCorrect: boolean;
              pointsEarned: number;
              correctAnswer?: string;
              answeredAt: number;
            }> = respRes.data?.data ?? [];

            const latestPerQuestion: Record<number, typeof responses[0]> = {};
            for (const r of responses) {
              const existingResp = latestPerQuestion[r.questionNumber];
              if (!existingResp || r.answeredAt > existingResp.answeredAt) {
                latestPerQuestion[r.questionNumber] = r;
              }
            }

            for (const [qNum, r] of Object.entries(latestPerQuestion)) {
              const key = `${quiz.id}:${qNum}`;
              restored[key] = {
                quizId: quiz.id,
                questionNumber: Number(qNum),
                selectedAnswer: r.selectedAnswer,
                isCorrect: r.isCorrect,
                pointsEarned: r.pointsEarned,
                correctAnswer: r.correctAnswer,
              };
            }
          } catch {
            console.warn(`Could not fetch responses for quiz ${quiz.id}`);
          }
        }

        setRestoredAnswers(restored);
        setLevelResult((prev) => ({ ...prev, ...accumulatedResult }));

        if (completedCount === quizzes.length) {
          setAllAlreadyPlayed(true);
        } else if (startIndex > 0) {
          setCurrentIndex(startIndex);
        }

        setSessionsFetched(true);
      } catch {
        console.warn("Session check failed, proceeding fresh.");
        setLockCheckDone(true);
        setSessionsFetched(true);
      } finally {
        setSessionCheckLoading(false);
      }
    };

    checkSessions();
  }, [userId, quizzes, allQuizzesByLevel, sessionsFetched, levelLabel]);

  // ── Submit answer ──────────────────────────────────────────────────────────
  const handleSelect = async (answer: string) => {
    if (answerState !== "idle" || submitting || hasAnsweredCurrent || !userId) return;
    if (isSubmittingRef.current) return;
    if (!allQuestions.length) return;

    isSubmittingRef.current = true;
    setHasAnsweredCurrent(true);
    setSelectedAnswer(answer);
    setSubmitting(true);

    const currentQuestion = allQuestions[currentIndex];
    const currentQuizId = currentQuestion.quizId;
    const existingSessionId = quizSessionsRef.current[currentQuizId];

    try {
      const res = await axios.post("/api/fanbattle/response", {
        quizId: currentQuizId,
        questionNumber: currentQuestion.originalQuestionNumber,
        selectedAnswer: answer,
        userId,
        userName,
        userEmail,
        ...(existingSessionId ? { sessionId: existingSessionId } : {}),
      });

      const { response, session: updatedSession } = res.data.data;

      if (!existingSessionId) {
        quizSessionsRef.current[currentQuizId] = updatedSession.id;
      }

      const isCorrect: boolean = response.isCorrect;
      const rawCorrect: string = response.correctAnswer ?? "";
      const matchedOption =
        currentQuestion.options.find(
          (o) => o === rawCorrect || o.toLowerCase() === rawCorrect.toLowerCase()
        ) ?? rawCorrect;
      const resolvedCorrect =
        matchedOption && matchedOption.trim() !== ""
          ? matchedOption
          : isCorrect
          ? answer
          : "";

      setAnswerState(isCorrect ? "correct" : "incorrect");
      setCorrectAnswerText(resolvedCorrect);
      setExplanation(
        isCorrect
          ? `Correct! The answer is "${answer}".`
          : resolvedCorrect
          ? `Incorrect. The correct answer is "${resolvedCorrect}".`
          : "Incorrect."
      );

      const key = `${currentQuizId}:${currentQuestion.originalQuestionNumber}`;
      setRestoredAnswers((prev) => ({
        ...prev,
        [key]: {
          quizId: currentQuizId,
          questionNumber: currentQuestion.originalQuestionNumber,
          selectedAnswer: answer,
          isCorrect,
          pointsEarned: response.pointsEarned ?? 0,
          correctAnswer: resolvedCorrect || undefined,
        },
      }));

      setLevelResult((prev) => ({
        ...prev,
        totalPointsEarned: prev.totalPointsEarned + (response.pointsEarned ?? 0),
        correctCount: prev.correctCount + (isCorrect ? 1 : 0),
        incorrectCount: prev.incorrectCount + (isCorrect ? 0 : 1),
        answeredCount: prev.answeredCount + 1,
      }));

      if ((response.pointsEarned ?? 0) > 0) {
        emitSxpActivityRefresh();
      }
    } catch (e) {
      console.error("Submit error:", e);
      setHasAnsweredCurrent(false);
      setAnswerState("idle");
      setExplanation("");
      setSelectedAnswer(null);
      setCorrectAnswerText(null);
    } finally {
      setSubmitting(false);
      isSubmittingRef.current = false;
    }
  };

  // ── Next question / level progression ─────────────────────────────────────
  const handleNext = () => {
    const isLastQuestion = currentIndex >= allQuestions.length - 1;

    if (isLastQuestion) {
      const nextLevel = NEXT_LEVEL[levelLabel];
      if (nextLevel) {
        // There's a next level — show level complete transition
        setShowLevelComplete(true);
      } else {
        // Final level done — show full results
        setShowResults(true);
      }
      return;
    }

    setCurrentIndex((prev) => prev + 1);
    setSelectedAnswer(null);
    setAnswerState("idle");
    setCorrectAnswerText(null);
    setExplanation("");
    setHasAnsweredCurrent(false);
    isSubmittingRef.current = false;
  };

  // When user taps "Continue to next level" from LevelCompleteScreen
  const handleContinueToNextLevel = () => {
    const nextLevel = NEXT_LEVEL[levelLabel];
    if (nextLevel) {
      router.push(`/MainModules/FanBattle/TriviaQuestion?level=${nextLevel}`);
    }
  };

  // ── Guards ─────────────────────────────────────────────────────────────────
  if (fetchError) {
    return (
      <div className="w-full mt-20 max-w-sm sm:max-w-md mx-auto bg-[#0f1520] rounded-2xl p-6 text-center">
        <p className="text-[#ef5350] text-[14px] mb-4">{fetchError}</p>
        <Link href="/MainModules/FanBattle">
          <button className="text-[#9ca3af] text-[13px] underline">Go back</button>
        </Link>
      </div>
    );
  }

  if (loading || sessionCheckLoading) return <LoadingScreen />;

  // Locked level screen
  if (lockCheckDone && lockedInfo) {
    return (
      <LockedLevelScreen
        requestedLevel={lockedInfo.requestedLevel}
        requiredLevel={lockedInfo.requiredLevel}
      />
    );
  }

  if (allAlreadyPlayed) return <AlreadyPlayedScreen level={levelLabel} />;

  // Level complete transition screen (before moving to next level)
  if (showLevelComplete) {
    const nextLevel = NEXT_LEVEL[levelLabel]!;
    return (
      <LevelCompleteScreen
        completedLevel={levelLabel}
        nextLevel={nextLevel}
        result={levelResult}
        onContinue={handleContinueToNextLevel}
      />
    );
  }

  if (showResults) return <ResultsScreen result={levelResult} level={levelLabel} />;

  if (!allQuestions.length) {
    return (
      <div className="w-full mt-20 max-w-sm sm:max-w-md mx-auto bg-[#0f1520] rounded-2xl p-6 text-center">
        <p className="text-[#9ca3af] text-[14px]">No questions available.</p>
        <Link href="/MainModules/FanBattle">
          <button className="text-[#9ca3af] text-[13px] underline mt-4">Go back</button>
        </Link>
      </div>
    );
  }

  const currentQuestion = allQuestions[currentIndex];
  const currentQuiz = quizzes.find((q) => q.id === currentQuestion?.quizId);
  const progressPct = ((currentIndex + (answerState !== "idle" ? 1 : 0)) / allQuestions.length) * 100;

  const restoredKey = `${currentQuestion?.quizId}:${currentQuestion?.originalQuestionNumber}`;
  const restoredAnswer = currentQuestion ? restoredAnswers[restoredKey] : undefined;

  if (restoredAnswer && answerState === "idle" && !hasAnsweredCurrent) {
    return (
      <RestoredQuestionView
        question={currentQuestion}
        restored={restoredAnswer}
        currentIndex={currentIndex}
        totalQuestions={allQuestions.length}
        levelResult={levelResult}
        levelLabel={levelLabel}
        currentQuizCategory={currentQuiz?.category ?? "Trivia"}
        onNext={handleNext}
      />
    );
  }

  return (
    <div className="w-full mt-20 mb-10 max-w-sm sm:max-w-md mx-auto bg-[#0f1520] rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 bg-[#0f1520]">
        <div className="flex items-center gap-2 mb-3">
          <Link href="/MainModules/FanBattle">
            <button className="flex items-center justify-center w-7 h-7 rounded-full hover:bg-[#1e2535] transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
          </Link>
          <div>
            <p className="text-white text-[13px] font-semibold leading-tight">
              {currentQuiz?.category ?? "Trivia"} Challenge
            </p>
            <p className="text-[#6b7280] text-[11px] capitalize">{levelLabel} · Level</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5 bg-[#1e2535] px-2.5 py-1 rounded-full">
            <span className="text-[#4caf82] text-[11px] font-bold">{levelResult.totalPointsEarned}</span>
            <span className="text-[#555] text-[9px]">pts</span>
          </div>
        </div>

        {/* Level progress indicator */}
        <div className="flex items-center gap-1.5 mb-2">
          {LEVEL_ORDER.map((lvl, i) => (
            <React.Fragment key={lvl}>
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  lvl === levelLabel
                    ? "bg-gradient-to-r from-[#e91e8c22] to-[#ff6b3522] text-[#e91e8c] border border-[#e91e8c44]"
                    : "text-[#444]"
                }`}
              >
                {LEVEL_LABELS[lvl]}
              </span>
              {i < LEVEL_ORDER.length - 1 && (
                <span className="text-[#333] text-[10px]">›</span>
              )}
            </React.Fragment>
          ))}
        </div>

        <h2 className="text-white text-[22px] sm:text-[26px] font-bold leading-tight mb-1">
          Question {currentIndex + 1} / {allQuestions.length}
        </h2>
        <p className="text-[#9ca3af] text-[13px] sm:text-[14px] mb-3">
          {currentQuestion.question}
        </p>

        <div className="w-full h-[3px] bg-[#1e2535] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#e91e8c] rounded-full transition-all duration-500"
            style={{ width: `${Math.max(progressPct, 2)}%` }}
          />
        </div>
      </div>

      {/* Options */}
      <div className="px-4 pt-2 pb-3 flex flex-col gap-2.5">
        {currentQuestion.options.map((opt) => (
          <OptionButton
            key={opt}
            label={opt}
            selected={selectedAnswer === opt}
            isCorrect={!!correctAnswerText && opt === correctAnswerText}
            answerState={answerState}
            onSelect={() => handleSelect(opt)}
          />
        ))}
      </div>

      {submitting && (
        <div className="px-4 pb-2">
          <p className="text-[#6b7280] text-[12px] text-center animate-pulse">Checking answer…</p>
        </div>
      )}

      {/* Feedback Banner */}
      {answerState !== "idle" && (
        <div
          className={`mx-4 mb-3 px-4 py-3 rounded-xl flex items-start gap-2.5 transition-all duration-300 ${
            answerState === "correct"
              ? "bg-[#0d2b1a] border border-[#1a4a2a]"
              : "bg-[#2b0d0d] border border-[#4a1a1a]"
          }`}
        >
          {answerState === "correct" ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="flex-shrink-0 mt-0.5">
              <path d="M5 13l4 4L19 7" stroke="#00c853" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="flex-shrink-0 mt-0.5">
              <circle cx="12" cy="12" r="10" stroke="#e53935" strokeWidth="2" />
              <path d="M8.5 8.5l7 7M15.5 8.5l-7 7" stroke="#e53935" strokeWidth="2" strokeLinecap="round" />
            </svg>
          )}
          <div>
            <p className={`text-[13px] font-bold mb-0.5 ${answerState === "correct" ? "text-[#00c853]" : "text-[#ef5350]"}`}>
              {answerState === "correct" ? "Correct!" : "Incorrect"}
            </p>
            <p className="text-[#9ca3af] text-[12px] leading-relaxed">{explanation}</p>
            <p className="text-[#555] text-[11px] mt-1">
              {levelResult.correctCount}/{levelResult.answeredCount} correct · {levelResult.totalPointsEarned} pts
            </p>
          </div>
        </div>
      )}

      {/* Next Button */}
      {answerState !== "idle" && (
        <div className="px-4 pb-5">
          <button
            onClick={handleNext}
            className="w-full flex items-center justify-center gap-2 py-[15px] rounded-2xl font-bold text-[15px] text-white bg-gradient-to-r from-[#e91e8c] to-[#ff6b35] hover:opacity-90 active:opacity-80 transition-opacity shadow-lg shadow-pink-900/30"
          >
            {currentIndex >= allQuestions.length - 1
              ? NEXT_LEVEL[levelLabel]
                ? `Complete ${LEVEL_LABELS[levelLabel]} Level`
                : "See Results"
              : "Next Question"}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default TriviaQuestion;
