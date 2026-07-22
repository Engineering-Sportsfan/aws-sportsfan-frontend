

// // context/AIChatContext.tsx
// "use client";

// import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
// import { useAuth } from './AuthContext';

// interface Message {
//   id: string;
//   role: 'user' | 'assistant';
//   content: string;
// }

// interface AIChatContextType {
//   messages: Message[];
//   sessionId: string | null;
//   loading: boolean;
//   sending: boolean;
//   error: string | null;
//   sendMessage: (query: string) => Promise<void>;
//   loadRecentSession: () => Promise<void>;
//   clearChat: () => void;
// }

// const AIChatContext = createContext<AIChatContextType | undefined>(undefined);

// export function AIChatProvider({ children }: { children: React.ReactNode }) {
//   const { user, isAuthenticated } = useAuth();

//   const [messages, setMessages] = useState<Message[]>([]);
//   const [sessionId, setSessionId] = useState<string | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [sending, setSending] = useState(false);
//   // const [history, setHistory] = useState<AskAIHistorySession[]>([]);
// const [loadingHistory, setLoadingHistory] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const userId = user?.userId;

//   // Get auth headers
//   const getAuthHeaders = useCallback(() => {
//     return {
//       'Content-Type': 'application/json',
//       'X-User-Id': userId || '',
//       'X-User-Email': user?.email || '',
//     };
//   }, [userId, user?.email]);

// //   const loadHistory = useCallback(async () => { /* fetch /api/ask-ai/sessions, see above */ }, [...]);
// // const loadSession = useCallback(async (id: string) => { /* fetch /api/ask-ai/${id}, see above */ }, [...]);

//   // Load the most recent session
//   const loadRecentSession = useCallback(async () => {
//     if (!isAuthenticated || !userId) {
//       setMessages([]);
//       setSessionId(null);
//       return;
//     }

//     setLoading(true);
//     setError(null);

//     try {
//       const response = await fetch('/api/ask-ai', {
//         headers: getAuthHeaders(),
//       });

//       if (!response.ok) {
//         setError('Failed to load recent session');
//         console.warn('Failed to load recent session: Endpoint returned status ' + response.status);
//         setSessionId(null);
//         setMessages([]);
//         return;
//       }

//       const data = await response.json();

//       if (data.sessionId) {
//         setSessionId(data.sessionId);

//         // Sort messages by numeric ID (handles large DB IDs correctly)
//         const sorted = (data.messages || []).sort((a: Message, b: Message) => {
//           const numA = parseInt(a.id, 10);
//           const numB = parseInt(b.id, 10);
//           if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
//           return a.id > b.id ? 1 : -1;
//         });

//         // Deduplicate by role + content to avoid duplicates on reload
//         const seen = new Set<string>();
//         const deduped = sorted.filter((m: Message) => {
//           const key = `${m.role}:${m.content}`;
//           if (seen.has(key)) return false;
//           seen.add(key);
//           return true;
//         });

//         setMessages(deduped);
//       } else {
//         setSessionId(null);
//         setMessages([]);
//       }
//     } catch (err) {
//       setError(err instanceof Error ? err.message : 'Failed to load recent session');
//       console.error('Error loading recent session:', err);
//     } finally {
//       setLoading(false);
//     }
//   }, [isAuthenticated, userId, getAuthHeaders]);

//   // Send a message to the AI
//   const sendMessage = useCallback(async (query: string) => {
//     if (!isAuthenticated || !userId) {
//       setError('Please login to use AI Assistant');
//       return;
//     }

//     if (!query.trim()) return;

//     setSending(true);
//     setError(null);

//     // Add user message optimistically
//     const tempUserMessageId = `temp-user-${Date.now()}`;
//     const userMessage: Message = {
//       id: tempUserMessageId,
//       role: 'user',
//       content: query.trim(),
//     };

//     setMessages(prev => [...prev, userMessage]);

//     try {
//       const response = await fetch('/api/ask-ai', {
//         method: 'POST',
//         headers: getAuthHeaders(),
//         body: JSON.stringify({
//           query: query.trim(),
//           sessionId: sessionId || crypto.randomUUID(),
//           history: [...messages, userMessage].map(m => ({ role: m.role, content: m.content })),
//           userId,
//           userEmail: user?.email,
//           userName: user?.name,
//         }),
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.error || 'Failed to get response');
//       }

//       const data = await response.json();

//       // Replace temp user message ID with server ID if returned,
//       // so deduplication works correctly on next session reload
//       if (data.userMessageId) {
//         setMessages(prev =>
//           prev.map(m =>
//             m.id === tempUserMessageId ? { ...m, id: data.userMessageId } : m
//           )
//         );
//       }

//       // Add AI response using server ID to prevent duplicates on reload
//       const aiMessage: Message = {
//         id: data.messageId || `ai-${Date.now()}`,
//         role: 'assistant',
//         content: data.answer,
//       };

//       setMessages(prev => [...prev, aiMessage]);

//       // Update session ID if it was new
//       if (data.sessionId && !sessionId) {
//         setSessionId(data.sessionId);
//       }

//     } catch (err) {
//       setError(err instanceof Error ? err.message : 'Failed to send message');
//       // Remove the optimistic user message on error
//       setMessages(prev => prev.filter(m => m.id !== tempUserMessageId));
//       console.error('Error sending message:', err);
//     } finally {
//       setSending(false);
//     }
//   }, [isAuthenticated, userId, user?.email, user?.name, sessionId, messages, getAuthHeaders]);

//   // Clear current chat (just local, doesn't delete from server)
//   const clearChat = useCallback(() => {
//     setMessages([]);
//      setSessionId(null); 
//     setError(null);
//   }, []);

//   // Load recent session when user logs in
//   useEffect(() => {
//     if (isAuthenticated && userId) {
//       loadRecentSession();
//     } else {
//       setMessages([]);
//       setSessionId(null);
//     }
//   }, [isAuthenticated, userId, loadRecentSession]);

//   return (
//     <AIChatContext.Provider
//       value={{
//         messages,
//         sessionId,
//         loading,
//         sending,
//         error,
//         sendMessage,
//         loadRecentSession,
//         clearChat,
//       }}
//     >
//       {children}
//     </AIChatContext.Provider>
//   );
// }

// export function useAIChat() {
//   const context = useContext(AIChatContext);
//   if (context === undefined) {
//     throw new Error('useAIChat must be used within an AIChatProvider');
//   }
//   return context;
// }




// context/AskAIChatContext.tsx
"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export interface AskAIHistorySession {
  sessionId: string;
  title: string;
  subtitle: string;
  dateLabel: string;
}

interface AIChatContextType {
  messages: Message[];
  sessionId: string | null;
  loading: boolean;
  sending: boolean;
  error: string | null;
  sendMessage: (query: string) => Promise<void>;
  loadRecentSession: () => Promise<void>;
  clearChat: () => void;
  history: AskAIHistorySession[];
  loadingHistory: boolean;
  activeSessionId: string | null;
  loadHistory: () => Promise<void>;
  loadSession: (sessionId: string) => Promise<void>;
  startNewChat: () => void;
  renameSession: (sessionId: string, title: string) => Promise<boolean>;
  deleteSession: (sessionId: string) => Promise<boolean>;
}

const AIChatContext = createContext<AIChatContextType | undefined>(undefined);

export function AIChatProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();

  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [history, setHistory] = useState<AskAIHistorySession[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const userId = user?.userId;

  const getAuthHeaders = useCallback(() => {
    return {
      'Content-Type': 'application/json',
      'X-User-Id': userId || '',
      'X-User-Email': user?.email || '',
    };
  }, [userId, user?.email]);

  const loadHistory = useCallback(async () => {
    if (!isAuthenticated || !userId) {
      setHistory([]);
      return;
    }
    setLoadingHistory(true);
    try {
      const response = await fetch('/api/ask-ai/sessions', {
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        console.warn('[AskAI] Failed to load history: ' + response.status);
        setHistory([]);
        return;
      }
      const data = await response.json();
      setHistory(data.sessions || []);
    } catch (err) {
      console.error('[AskAI] Error loading history:', err);
      setHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  }, [isAuthenticated, userId, getAuthHeaders]);

  const loadSession = useCallback(async (id: string) => {
    if (!isAuthenticated || !userId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/ask-ai/${id}`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        setError('Failed to load conversation');
        return;
      }
      const data = await response.json();
      setMessages(data.messages || []);
      setSessionId(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load conversation');
      console.error('[AskAI] Error loading session:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, userId, getAuthHeaders]);

  // ── Rename a session — optimistic local update, rolled back on failure ──
  const renameSession = useCallback(async (id: string, title: string) => {
    if (!isAuthenticated || !userId) return false;
    const trimmed = title.trim();
    if (!trimmed) return false;

    const previous = history;
    setHistory(prev => prev.map(h => h.sessionId === id ? { ...h, title: trimmed } : h));

    try {
      const response = await fetch(`/api/ask-ai/${id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ title: trimmed }),
      });
      if (!response.ok) {
        setHistory(previous);
        return false;
      }
      return true;
    } catch (err) {
      console.error('[AskAI] Error renaming session:', err);
      setHistory(previous);
      return false;
    }
  }, [isAuthenticated, userId, getAuthHeaders, history]);

  // ── Delete a session — optimistic removal; clears active chat if it was open ──
  const deleteSession = useCallback(async (id: string) => {
    if (!isAuthenticated || !userId) return false;

    const previous = history;
    setHistory(prev => prev.filter(h => h.sessionId !== id));

    try {
      const response = await fetch(`/api/ask-ai/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        setHistory(previous);
        return false;
      }
      if (sessionId === id) {
        setMessages([]);
        setSessionId(null);
      }
      return true;
    } catch (err) {
      console.error('[AskAI] Error deleting session:', err);
      setHistory(previous);
      return false;
    }
  }, [isAuthenticated, userId, getAuthHeaders, history, sessionId]);

  const loadRecentSession = useCallback(async () => {
    if (!isAuthenticated || !userId) {
      setMessages([]);
      setSessionId(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ask-ai', {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        setError('Failed to load recent session');
        console.warn('Failed to load recent session: Endpoint returned status ' + response.status);
        setSessionId(null);
        setMessages([]);
        return;
      }

      const data = await response.json();

      if (data.sessionId) {
        setSessionId(data.sessionId);

        const sorted = (data.messages || []).sort((a: Message, b: Message) => {
          const numA = parseInt(a.id, 10);
          const numB = parseInt(b.id, 10);
          if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
          return a.id > b.id ? 1 : -1;
        });

        const seen = new Set<string>();
        const deduped = sorted.filter((m: Message) => {
          const key = `${m.role}:${m.content}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });

        setMessages(deduped);
      } else {
        setSessionId(null);
        setMessages([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load recent session');
      console.error('Error loading recent session:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, userId, getAuthHeaders]);

  const sendMessage = useCallback(async (query: string) => {
    if (!isAuthenticated || !userId) {
      setError('Please login to use AI Assistant');
      return;
    }
    if (!query.trim()) return;

    setSending(true);
    setError(null);

    const tempUserMessageId = `temp-user-${Date.now()}`;
    const userMessage: Message = {
      id: tempUserMessageId,
      role: 'user',
      content: query.trim(),
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await fetch('/api/ask-ai', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          query: query.trim(),
          sessionId: sessionId || crypto.randomUUID(),
          history: [...messages, userMessage].map(m => ({ role: m.role, content: m.content })),
          userId,
          userEmail: user?.email,
          userName: user?.name,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get response');
      }

      const data = await response.json();

      if (data.userMessageId) {
        setMessages(prev =>
          prev.map(m =>
            m.id === tempUserMessageId ? { ...m, id: data.userMessageId } : m
          )
        );
      }

      const aiMessage: Message = {
        id: data.messageId || `ai-${Date.now()}`,
        role: 'assistant',
        content: data.answer,
      };

      setMessages(prev => [...prev, aiMessage]);

      if (data.sessionId && !sessionId) {
        setSessionId(data.sessionId);
      }

      loadHistory();

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      setMessages(prev => prev.filter(m => m.id !== tempUserMessageId));
      console.error('Error sending message:', err);
    } finally {
      setSending(false);
    }
  }, [isAuthenticated, userId, user?.email, user?.name, sessionId, messages, getAuthHeaders, loadHistory]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setSessionId(null);
    setError(null);
  }, []);

  const startNewChat = useCallback(() => {
    setMessages([]);
    setSessionId(null);
    setError(null);
  }, []);

  useEffect(() => {
    if (isAuthenticated && userId) {
      loadRecentSession();
      loadHistory();
    } else {
      setMessages([]);
      setSessionId(null);
      setHistory([]);
    }
  }, [isAuthenticated, userId, loadRecentSession, loadHistory]);

  return (
    <AIChatContext.Provider
      value={{
        messages,
        sessionId,
        loading,
        sending,
        error,
        sendMessage,
        loadRecentSession,
        clearChat,
        history,
        loadingHistory,
        activeSessionId: sessionId,
        loadHistory,
        loadSession,
        startNewChat,
        renameSession,
        deleteSession,
      }}
    >
      {children}
    </AIChatContext.Provider>
  );
}

export function useAIChat() {
  const context = useContext(AIChatContext);
  if (context === undefined) {
    throw new Error('useAIChat must be used within an AIChatProvider');
  }
  return context;
}