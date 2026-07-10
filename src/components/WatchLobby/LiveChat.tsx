// // components/watch-along/LiveChat.tsx
// "use client";

// import { useState, useEffect, useRef } from "react";
// import { useWatchAlong } from "@/context/WatchAlongContext";

// interface LiveChatProps {
//   matchId: string;
// }

// export default function LiveChat({ matchId }: LiveChatProps) {
//   const [message, setMessage] = useState("");
//   const [sending, setSending] = useState(false);
//   const [isInitialLoad, setIsInitialLoad] = useState(true);
//   const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

//   const [userName] = useState(() => {
//     const stored = localStorage.getItem("watchalong_user_name");
//     if (stored) return stored;
//     const name = `Fan_${Math.floor(Math.random() * 1000)}`;
//     localStorage.setItem("watchalong_user_name", name);
//     return name;
//   });

//   const messagesEndRef = useRef<HTMLDivElement>(null);

//   const {
//     chats,
//     fetchChats,
//     sendChatMessage,
//     loading
//   } = useWatchAlong();

//   // Fetch chats on mount only
//   useEffect(() => {
//     if (matchId) {
//       fetchChats(matchId, 100).finally(() => {
//         setIsInitialLoad(false);
//       });
//     }
//   }, [matchId, fetchChats]);

//   // Poll for new messages every 5 seconds (without showing loading state)
//   useEffect(() => {
//     if (!matchId) return;

//     let isMounted = true;
//     const interval = setInterval(async () => {
//       if (isMounted && !isInitialLoad) {
//         await fetchChats(matchId, 100);
//       }
//     }, 5000);

//     return () => {
//       isMounted = false;
//       clearInterval(interval);
//     };
//   }, [matchId, fetchChats, isInitialLoad]);

//   // Scroll to bottom when new messages arrive
//   useEffect(() => {
//     if (chats.length > 0) {
//       messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//     }
//   }, [chats]);

//   // Toast auto-dismiss
//   useEffect(() => {
//     if (toastMessage) {
//       const timer = setTimeout(() => setToastMessage(null), 3000);
//       return () => clearTimeout(timer);
//     }
//   }, [toastMessage]);

//   const handleSend = async () => {
//     if (!message.trim()) return;
//     if (sending) return;

//     setSending(true);
//     try {
//       const result = await sendChatMessage(matchId, userName, message, "text-pink-400");
//       if (result) {
//         setMessage("");
//         setToastMessage({ text: "Message sent!", type: "success" });
//         // Refresh chats immediately after sending
//         await fetchChats(matchId, 100);
//       }
//     } catch (error) {
//       console.error("Failed to send message:", error);
//       setToastMessage({ text: "Failed to send message", type: "error" });
//     } finally {
//       setSending(false);
//     }
//   };

//   const formatTime = (timestamp: number) => {
//     const date = new Date(timestamp);
//     return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
//   };

//   // Show loading only on initial load
//   if (loading && isInitialLoad) {
//     return (
//       <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-3">
//         <div className="flex items-center justify-center py-12">
//           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <>
//       {/* Toast Message */}
//       {toastMessage && (
//         <div className={`fixed top-24 right-4 z-50 p-3 rounded-lg shadow-lg min-w-[250px] max-w-[350px] animate-slide-in ${
//           toastMessage.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
//         }`}>
//           <p className="text-sm text-center">{toastMessage.text}</p>
//         </div>
//       )}

//       {/* Scrollable messages */}
//       <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-3">
//         <div className="flex items-center gap-2 mb-3">
//           <span className="text-sm font-bold">💬 Live Chat</span>
//           <span className="text-sm text-gray-500">{chats.length} messages</span>
//         </div>

//         <div className="flex flex-col gap-3">
//           {chats.length === 0 && !isInitialLoad ? (
//             <div className="text-center py-8 text-gray-500 text-sm">
//               No messages yet. Be the first to chat!
//             </div>
//           ) : (
//             chats.map((msg) => (
//               <div key={msg.id}>
//                 <div className="flex items-baseline gap-1.5">
//                   <span className={`text-[13px] font-bold ${msg.color}`}>{msg.user}</span>
//                   <span className="text-[10px] text-gray-600">{formatTime(msg.createdAt)}</span>
//                 </div>
//                 <p className="text-[13px] text-gray-300 mt-0.5 break-words">{msg.text}</p>
//               </div>
//             ))
//           )}
//           <div ref={messagesEndRef} />
//         </div>
//       </div>

//       {/* Input */}
//       <div className="flex items-center gap-2.5 px-4 sm:px-6 py-3 border-t border-[#222]">
//         <input
//           type="text"
//           value={message}
//           onChange={(e) => setMessage(e.target.value)}
//           onKeyDown={(e) => e.key === "Enter" && handleSend()}
//           placeholder="Type message..."
//           disabled={sending}
//           className="flex-1 bg-[#1a1a1a] border border-[#333] rounded-full px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-pink-500 transition-colors disabled:opacity-50"
//         />
//         <button
//           onClick={handleSend}
//           disabled={sending || !message.trim()}
//           className="bg-pink-600 hover:bg-pink-700 active:scale-95 text-white font-semibold text-sm px-5 py-2.5 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed"
//         >
//           {sending ? "Sending..." : "Send"}
//         </button>
//       </div>

//       <style jsx>{`
//         @keyframes slideIn {
//           from { transform: translateX(100%); opacity: 0; }
//           to { transform: translateX(0); opacity: 1; }
//         }
//         .animate-slide-in { animation: slideIn 0.3s ease-out; }
//       `}</style>
//     </>
//   );
// }















// components/watch-along/LiveChat.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useWatchAlong } from "@/context/WatchAlongContext";
import { useSession } from "next-auth/react";
import { useAuth } from "@/context/AuthContext";
import { Trash2 } from "lucide-react";

interface LiveChatProps {
    matchId: string;
    userRole: string;
}

export default function LiveChat({ matchId, userRole }: LiveChatProps) {
    const [message, setMessage] = useState("");
    const [sending, setSending] = useState(false);
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    // Get user session from NextAuth
    const { data: session, status } = useSession();
    const { user: authUser } = useAuth();

    const [userName, setUserName] = useState<string>("Anonymous");

    useEffect(() => {
        const isUserLoggedIn = status === "authenticated" || !!authUser;
        const name = authUser?.name || session?.user?.name;

        // If user is logged in, use their name
        if (isUserLoggedIn && name) {
            setUserName(name);
            return;
        }

        // Fallback to localStorage for custom JWT users
        const stored = localStorage.getItem("watchalong_user_name");
        if (stored) {
            setUserName(stored);
            return;
        }

        // Generate a random guest name only if absolutely nothing else exists
        const nameFallback = `Guest_${Math.floor(Math.random() * 1000)}`;
        localStorage.setItem("watchalong_user_name", nameFallback);
        setUserName(nameFallback);
    }, [status, session, authUser]);

    // Also get user ID for tracking (optional)
    const [userId] = useState(() => {
        if (authUser?.email) return authUser.email;
        if (status === "authenticated" && session?.user?.email) {
            return session.user.email;
        }
        const stored = localStorage.getItem("watchalong_user_id");
        if (stored) return stored;
        const newId = `guest_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem("watchalong_user_id", newId);
        return newId;
    });

    const chatContainerRef = useRef<HTMLDivElement>(null);

    const {
        chats,
        fetchChats,
        sendChatMessage,
        deleteChatMessage,
        loading
    } = useWatchAlong();

    // Fetch chats on mount only
    useEffect(() => {
        if (matchId) {
            fetchChats(matchId, 100).finally(() => {
                setIsInitialLoad(false);
            });
        }
    }, [matchId, fetchChats]);

    // Filter out system reactions from chats
    const visibleChats = chats.filter(msg => !msg.text?.startsWith('[SYSTEM_REACTION]:'));

    // Scroll to bottom when new messages arrive
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [visibleChats]);

    const handleSend = async () => {
        if (!message.trim()) return;
        if (sending) return;

        setSending(true);
        try {
            // Use authenticated user's name, or fallback to stored name
            const result = await sendChatMessage(matchId, userName, message, "text-pink-400");
            if (result) {
                setMessage("");
                // NOTE: sendChatMessage already appends the new message to state
                // via setChats — no need to re-fetch from Firestore
            }
        } catch (error) {
            console.error("Failed to send message:", error);
        } finally {
            setSending(false);
        }
    };

    const formatTime = (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    // Show loading only on initial load
    if (loading && isInitialLoad) {
        return (
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-3">
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full min-h-0 bg-[#0e0e10]">
            {/* Scrollable messages */}
            <div ref={chatContainerRef} className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 min-h-0">
                <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm font-bold">💬 Live Chat</span>
                    <span className="text-sm text-gray-500">{visibleChats.length} messages</span>
                    {status === "authenticated" && (
                        <span className="text-xs text-green-500 ml-2">● Logged in as {session?.user?.name?.split(' ')[0]}</span>
                    )}
                </div>

                <div className="flex flex-col gap-3">
                    {visibleChats.length === 0 && !isInitialLoad ? (
                        <div className="text-center py-8 text-gray-500 text-sm">
                            No messages yet. Be the first to chat!
                        </div>
                    ) : (
                        visibleChats.map((msg) => (
                            <div key={msg.id} className="group flex flex-col">
                                <div className="flex items-center justify-between w-full">
                                    <div className="flex items-baseline gap-1.5 flex-1">
                                        <span className={`text-[13px] font-bold ${msg.color}`}>
                                            {msg.user}
                                            {status === "authenticated" && session?.user?.name === msg.user && (
                                                <span className="text-[10px] text-blue-400 ml-1">(You)</span>
                                            )}
                                        </span>
                                        <span className="text-[10px] text-gray-600">{formatTime(msg.createdAt)}</span>
                                    </div>
                                    {(userRole === 'Host' || userRole === 'Moderator') && (
                                        <button 
                                            onClick={async () => {
                                                await deleteChatMessage(matchId, msg.id);
                                                // deleteChatMessage already removes from local state via setChats filter
                                            }}
                                            className="text-gray-600 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100 ml-2"
                                            title="Delete Message"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    )}
                                </div>
                                <p className="text-[13px] text-gray-300 mt-0.5 break-words">{msg.text}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Input */}
            <div className="flex items-center gap-2.5 px-4 sm:px-6 py-3 border-t border-[#222] bg-[#121214] shrink-0">
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder="Type message..."
                    disabled={sending}
                    className="flex-1 bg-[#1a1a1a] border border-[#333] rounded-full px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-pink-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                    onClick={handleSend}
                    disabled={sending || !message.trim()}
                    className="bg-pink-600 hover:bg-pink-700 active:scale-95 text-white font-semibold text-sm px-3 py-2.5 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                >
                    {sending ? "Sending..." : "Send"}
                </button>
            </div>

            <style jsx>{`
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                .animate-slide-in { animation: slideIn 0.3s ease-out; }
            `}</style>
        </div>
    );
}