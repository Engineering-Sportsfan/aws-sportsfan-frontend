import { api } from "@/services/api";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  messages: ChatMessage[];
}

/**
 * AI Chat service — Ask AI conversations.
 */
export const chatService = {
  /** Create a new chat session */
  createSession: () => api.post<ChatSession>("/chat/sessions"),

  /** Get existing chat sessions for current user */
  getSessions: () => api.get<ChatSession[]>("/chat/sessions"),

  /** Get a session with its messages */
  getSession: (sessionId: string) => api.get<ChatSession>(`/chat/sessions/${sessionId}`),

  /** Send a message and receive a streamed or JSON response */
  sendMessage: (sessionId: string, content: string) =>
    api.post<ChatMessage>(`/chat/sessions/${sessionId}/messages`, { content }),

  /** Delete a session */
  deleteSession: (sessionId: string) => api.delete(`/chat/sessions/${sessionId}`),
};
