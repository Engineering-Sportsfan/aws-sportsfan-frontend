/*

// src/hooks/useChat.ts  — FRONTEND project

import { useState, useEffect, useCallback, useRef } from "react";
import {
  ChatAPI, GroupAPI, CommunityAPI, MessageAPI,
  type Chat, type Message, type Group, type Community,
} from "../lib/chatApi";

// ─── useChats — 30s polling ────────────────────────────────────────────────────
export function useChats(type?: "dm" | "group", authReady = true) {
  const [chats, setChats]     = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const cursorRef = useRef<{ lastDocId: string; lastDocUpdatedAt: number } | null>(null);

  const load = useCallback(async (reset = false) => {
    console.log("[useChats] load called, authReady:", authReady, "reset:", reset);
    try {
      if (reset) setLoading(true);
      setError(null);
      const cursor = reset ? undefined : cursorRef.current ?? undefined;
      const res = await ChatAPI.list({ type, ...(cursor ?? {}) });
      console.log("[useChats] loaded chats count:", res.chats.length);
      setChats(prev => reset ? res.chats : [...prev, ...res.chats]);
      setHasMore(res.pagination.hasMore);
      if (res.pagination.nextCursor) {
        cursorRef.current = {
          lastDocId:        res.pagination.nextCursor.lastDocId,
          lastDocUpdatedAt: res.pagination.nextCursor.lastDocUpdatedAt as number,
        };
      }
    } catch (e) {
      console.error("[useChats] ERROR:", e);
      if (reset) setError(e instanceof Error ? e.message : "Failed to load chats");
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => {
    if (!authReady) return;

    load(true);

    const startPolling = () =>
      setInterval(() => {
        if (!document.hidden) { cursorRef.current = null; load(true); }
      }, 30_000);

    let interval = startPolling();

    const handleVisibility = () => {
      if (!document.hidden) {
        clearInterval(interval);
        cursorRef.current = null;
        load(true);
        interval = startPolling();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [load, authReady]);

  const refresh    = useCallback(() => { cursorRef.current = null; load(true); }, [load]);
  const loadMore   = useCallback(() => { if (hasMore && !loading) load(false); }, [hasMore, loading, load]);
  const updateChat = useCallback((updated: Chat) => setChats(prev => prev.map(c => c.id === updated.id ? updated : c)), []);
  const removeChat = useCallback((chatId: string) => setChats(prev => prev.filter(c => c.id !== chatId)), []);
  const prependChat = useCallback((chat: Chat) => setChats(prev => [chat, ...prev.filter(c => c.id !== chat.id)]), []);

  const markChatAsRead = useCallback((chatId: string) => {
    setChats(prev => prev.map(c => c.id === chatId ? { ...c, unreadCount: 0 } : c));
  }, []);

  return { chats, loading, error, hasMore, refresh, loadMore, updateChat, removeChat, prependChat, markChatAsRead };
}

// ─── useMessages — 3s polling ─────────────────────────────────────────────────
export function useMessages(chatId: string | null, currentUserId: string, authReady = true) {
  const [messages, setMessages]         = useState<Message[]>([]);
  const [loading, setLoading]           = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [sending, setSending]           = useState(false);
  const [error, setError]               = useState<string | null>(null);
  const [hasMore, setHasMore]           = useState(false);

  const olderCursorRef     = useRef<{ lastDocId: string; lastDocCreatedAt: number } | null>(null);
  const latestCreatedAtRef = useRef<number>(0);
  const pollingRef         = useRef(false);

  const loadInitial = useCallback(async (cid: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await ChatAPI.getMessages(cid, { limit: 50 });
      setMessages(res.messages);
      setHasMore(res.pagination.hasMore);
      if (res.messages.length > 0) {
        latestCreatedAtRef.current = Math.max(...res.messages.map(m => m.createdAt));
      }
      if (res.pagination.nextCursor) {
        olderCursorRef.current = {
          lastDocId:        res.pagination.nextCursor.lastDocId,
          lastDocCreatedAt: res.pagination.nextCursor.lastDocCreatedAt as number,
        };
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load messages");
    } finally {
      setLoading(false);
    }
  }, []);

  const pollNewMessages = useCallback(async (cid: string) => {
    if (pollingRef.current) return;
    pollingRef.current = true;
    try {
      const res = await ChatAPI.getMessages(cid, { limit: 50 });
      setMessages(prev => {
        const existingIds = new Set(prev.map(m => m.id));
        const newMsgs     = res.messages.filter(m => !existingIds.has(m.id));
        const updated = prev.map(existing => {
          const serverVersion = res.messages.find(m => m.id === existing.id);
          if (!serverVersion) return existing;
          return existing.id.startsWith("optimistic_") ? existing : serverVersion;
        });
        if (newMsgs.length === 0) return updated;
        const allTimestamps = res.messages.map(m => m.createdAt);
        if (allTimestamps.length > 0) latestCreatedAtRef.current = Math.max(...allTimestamps);
        return [...updated, ...newMsgs];
      });
    } catch {
      // Silent fail on background polls
    } finally {
      pollingRef.current = false;
    }
  }, []);

  useEffect(() => {
    if (!authReady) return;

    if (!chatId) {
      setMessages([]);
      olderCursorRef.current     = null;
      latestCreatedAtRef.current = 0;
      setHasMore(false);
      return;
    }

    setMessages([]);
    olderCursorRef.current     = null;
    latestCreatedAtRef.current = 0;
    setHasMore(false);
    setError(null);
    pollingRef.current = false;

    loadInitial(chatId);

    const startPolling = () =>
      setInterval(() => { if (!document.hidden) pollNewMessages(chatId); }, 3_000);

    let interval = startPolling();

    const handleVisibility = () => {
      if (document.hidden) {
        clearInterval(interval);
      } else {
        pollNewMessages(chatId);
        interval = startPolling();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [chatId, loadInitial, pollNewMessages, authReady]);

  const loadMore = useCallback(async () => {
    if (!chatId || loadingOlder || !hasMore) return;
    try {
      setLoadingOlder(true);
      const cursor = olderCursorRef.current ?? undefined;
      const res = await ChatAPI.getMessages(chatId, { limit: 30, ...(cursor ?? {}) });
      setMessages(prev => {
        const existingIds = new Set(prev.map(m => m.id));
        const fresh = res.messages.filter(m => !existingIds.has(m.id));
        return [...fresh, ...prev];
      });
      setHasMore(res.pagination.hasMore);
      if (res.pagination.nextCursor) {
        olderCursorRef.current = {
          lastDocId:        res.pagination.nextCursor.lastDocId,
          lastDocCreatedAt: res.pagination.nextCursor.lastDocCreatedAt as number,
        };
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load older messages");
    } finally {
      setLoadingOlder(false);
    }
  }, [chatId, loadingOlder, hasMore]);

  const send = useCallback(async (content: string, opts?: { replyToId?: string }) => {
    if (!chatId || !content.trim()) return null;
    try {
      setSending(true);
      const optimistic: Message = {
        id:        `optimistic_${Date.now()}`,
        chatId,
        senderId:  currentUserId,
        type:      "text",
        content:   content.trim(),
        isRead:    false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        ...(opts?.replyToId && { replyToId: opts.replyToId }),
      };
      setMessages(prev => [...prev, optimistic]);
      const res = await ChatAPI.sendMessage(chatId, content.trim(), opts);
      setMessages(prev => prev.map(m => m.id === optimistic.id ? res.message : m));
      latestCreatedAtRef.current = Math.max(latestCreatedAtRef.current, res.message.createdAt);
      return res.message;
    } catch (e) {
      setMessages(prev => prev.filter(m => !m.id.startsWith("optimistic_")));
      setError(e instanceof Error ? e.message : "Failed to send message");
      return null;
    } finally {
      setSending(false);
    }
  }, [chatId, currentUserId]);

  const editMessage = useCallback(async (messageId: string, content: string) => {
    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, content, updatedAt: Date.now() } : m));
    try {
      await MessageAPI.edit(messageId, content);
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to edit message");
      return false;
    }
  }, []);

  const deleteMessage = useCallback(async (messageId: string) => {
    setMessages(prev => prev.map(m =>
      m.id === messageId
        ? { ...m, content: "This message was deleted.", deletedAt: Date.now() }
        : m
    ));
    try {
      await MessageAPI.delete(messageId);
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete message");
      return false;
    }
  }, []);

  return { messages, loading, loadingOlder, sending, error, hasMore, loadMore, send, editMessage, deleteMessage };
}

// ─── useGroups ────────────────────────────────────────────────────────────────
export function useGroups(params?: { privacy?: "public" | "closed" | "private"; trending?: boolean }, authReady = true) {
  const [groups, setGroups]   = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const cursorRef = useRef<{ lastDocId: string; lastDocAt: number } | null>(null);

  const privacyParam  = params?.privacy;
  const trendingParam = params?.trending;

  const load = useCallback(async (reset = false) => {
    console.log("[useGroups] load called, authReady:", authReady, "reset:", reset);
    try {
      setLoading(true);
      setError(null);
      const cursor = reset ? undefined : cursorRef.current ?? undefined;
      const res = await GroupAPI.list({ privacy: privacyParam, trending: trendingParam, ...(cursor ?? {}) });
      console.log("[useGroups] loaded groups count:", res.groups.length, res.groups.map(g => g.name));
      setGroups(prev => reset ? res.groups : [...prev, ...res.groups]);
      setHasMore(res.pagination.hasMore);
      if (res.pagination.nextCursor) {
        cursorRef.current = {
          lastDocId: res.pagination.nextCursor.lastDocId,
          lastDocAt: res.pagination.nextCursor.lastDocAt as number,
        };
      }
    } catch (e) {
      console.error("[useGroups] ERROR:", e);
      setError(e instanceof Error ? e.message : "Failed to load groups");
    } finally {
      setLoading(false);
    }
  }, [privacyParam, trendingParam]);

  useEffect(() => {
    if (!authReady) return;
    load(true);
  }, [load, authReady]);

  const refresh  = useCallback(() => { cursorRef.current = null; load(true); }, [load]);
  const loadMore = useCallback(() => { if (hasMore && !loading) load(false); }, [hasMore, loading, load]);

  const join = useCallback(async (groupId: string) => {
    const res = await GroupAPI.join(groupId);
    if (res.status === "joined") setGroups(prev => prev.map(g => g.id === groupId ? { ...g, memberCount: g.memberCount + 1 } : g));
    return res;
  }, []);

  const leave = useCallback(async (groupId: string) => {
    await GroupAPI.leave(groupId);
    setGroups(prev => prev.map(g => g.id === groupId ? { ...g, memberCount: Math.max(0, g.memberCount - 1) } : g));
  }, []);

  const create = useCallback(async (data: { name: string; description?: string; privacy?: "public" | "closed" | "private"; tags?: string[] }) => {
    console.log("[useGroups] create called:", data);
    const res = await GroupAPI.create(data);
    console.log("[useGroups] create response:", res);
    setGroups(prev => [res.group, ...prev]);
    return res.group;
  }, []);

  // Update a group in local state (e.g. after patching chatId or editing)
  const updateGroup = useCallback((updated: Group) => {
    setGroups(prev => prev.map(g => g.id === updated.id ? updated : g));
  }, []);

  return { groups, loading, error, hasMore, refresh, loadMore, join, leave, create, updateGroup };
}

// ─── useCommunities ───────────────────────────────────────────────────────────
export function useCommunities(authReady = true) {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [hasMore, setHasMore]         = useState(false);
  const cursorRef = useRef<{ lastDocId: string; lastDocMemberCount: number } | null>(null);

  const load = useCallback(async (reset = false) => {
    try {
      setLoading(true);
      setError(null);
      const cursor = reset ? undefined : cursorRef.current ?? undefined;
      const res = await CommunityAPI.list(cursor ?? {});
      setCommunities(prev => reset ? res.communities : [...prev, ...res.communities]);
      setHasMore(res.pagination.hasMore);
      if (res.pagination.nextCursor) {
        cursorRef.current = {
          lastDocId:          res.pagination.nextCursor.lastDocId,
          lastDocMemberCount: res.pagination.nextCursor.lastDocMemberCount as number,
        };
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load communities");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authReady) return;
    load(true);
  }, [load, authReady]);

  const loadMore = useCallback(() => { if (hasMore && !loading) load(false); }, [hasMore, loading, load]);

  const refresh = useCallback(() => { cursorRef.current = null; load(true); }, [load]);
  return { communities, loading, error, hasMore, loadMore, refresh };
}

// ─── useCreateChat ─────────────────────────────────────────────────────────────
export function useCreateChat() {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const createGroup = useCallback(async (name: string, participantIds?: string[]) => {
    try {
      setLoading(true); setError(null);
      const res = await ChatAPI.createGroup(name, participantIds);
      return res.chat;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create group");
      return null;
    } finally { setLoading(false); }
  }, []);

  const createDM = useCallback(async (participantId: string) => {
    try {
      setLoading(true); setError(null);
      const res = await ChatAPI.createDM(participantId);
      return res.chat;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to start DM");
      return null;
    } finally { setLoading(false); }
  }, []);

  return { createGroup, createDM, loading, error };
}

// ─── Time helper ──────────────────────────────────────────────────────────────
export function timeAgo(ms: number): string {
  const diff = Date.now() - ms;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

*/

// src/hooks/useChat.ts  — FRONTEND project

import { useState, useEffect, useCallback, useRef } from "react";
import {
  ChatAPI,
  GroupAPI,
  CommunityAPI,
  MessageAPI,
  type Chat,
  type Message,
  type Group,
  type Community,
} from "../lib/chatApi";

// ─── useChats — 30s polling ────────────────────────────────────────────────────
export function useChats(type?: "dm" | "group", authReady = true) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const cursorRef = useRef<{
    lastDocId: string;
    lastDocUpdatedAt: number;
  } | null>(null);

  const load = useCallback(
    async (reset = false) => {
      console.log(
        "[useChats] load called, authReady:",
        authReady,
        "reset:",
        reset,
      );
      try {
        if (reset) setLoading(true);
        setError(null);
        const cursor = reset ? undefined : (cursorRef.current ?? undefined);
        const res = await ChatAPI.list({ type, ...(cursor ?? {}) });
        console.log("[useChats] loaded chats count:", res.chats.length);
        setChats((prev) => (reset ? res.chats : [...prev, ...res.chats]));
        setHasMore(res.pagination.hasMore);
        if (res.pagination.nextCursor) {
          cursorRef.current = {
            lastDocId: res.pagination.nextCursor.lastDocId,
            lastDocUpdatedAt: res.pagination.nextCursor
              .lastDocUpdatedAt as number,
          };
        }
      } catch (e) {
        console.error("[useChats] ERROR:", e);
        if (reset)
          setError(e instanceof Error ? e.message : "Failed to load chats");
      } finally {
        setLoading(false);
      }
    },
    [type],
  );

  useEffect(() => {
    if (!authReady) return;

    load(true);

    const startPolling = () =>
      setInterval(() => {
        if (!document.hidden) {
          cursorRef.current = null;
          load(true);
        }
      }, 30_000);

    let interval = startPolling();

    const handleVisibility = () => {
      if (!document.hidden) {
        clearInterval(interval);
        cursorRef.current = null;
        load(true);
        interval = startPolling();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [load, authReady]);

  const refresh = useCallback(() => {
    cursorRef.current = null;
    load(true);
  }, [load]);
  const loadMore = useCallback(() => {
    if (hasMore && !loading) load(false);
  }, [hasMore, loading, load]);
  const updateChat = useCallback(
    (updated: Chat) =>
      setChats((prev) => prev.map((c) => (c.id === updated.id ? updated : c))),
    [],
  );
  const removeChat = useCallback(
    (chatId: string) => setChats((prev) => prev.filter((c) => c.id !== chatId)),
    [],
  );
  const prependChat = useCallback(
    (chat: Chat) =>
      setChats((prev) => [chat, ...prev.filter((c) => c.id !== chat.id)]),
    [],
  );

  const markChatAsRead = useCallback((chatId: string) => {
    setChats((prev) =>
      prev.map((c) => (c.id === chatId ? { ...c, unreadCount: 0 } : c)),
    );
  }, []);

  return {
    chats,
    loading,
    error,
    hasMore,
    refresh,
    loadMore,
    updateChat,
    removeChat,
    prependChat,
    markChatAsRead,
  };
}

// ─── useMessages — 3s polling ─────────────────────────────────────────────────
export function useMessages(
  chatId: string | null,
  currentUserId: string,
  authReady = true,
) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  const olderCursorRef = useRef<{
    lastDocId: string;
    lastDocCreatedAt: number;
  } | null>(null);
  const latestCreatedAtRef = useRef<number>(0);
  const pollingRef = useRef(false);

  const loadInitial = useCallback(async (cid: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await ChatAPI.getMessages(cid, { limit: 50 });
      setMessages(res.messages);
      setHasMore(res.pagination.hasMore);
      if (res.messages.length > 0) {
        latestCreatedAtRef.current = Math.max(
          ...res.messages.map((m) => m.createdAt),
        );
      }
      if (res.pagination.nextCursor) {
        olderCursorRef.current = {
          lastDocId: res.pagination.nextCursor.lastDocId,
          lastDocCreatedAt: res.pagination.nextCursor
            .lastDocCreatedAt as number,
        };
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load messages");
    } finally {
      setLoading(false);
    }
  }, []);

  const pollNewMessages = useCallback(async (cid: string) => {
    if (pollingRef.current) return;
    pollingRef.current = true;
    try {
      const res = await ChatAPI.getMessages(cid, { limit: 50 });
      setMessages((prev) => {
        const existingIds = new Set(prev.map((m) => m.id));
        const newMsgs = res.messages.filter((m) => !existingIds.has(m.id));
        const updated = prev.map((existing) => {
          const serverVersion = res.messages.find((m) => m.id === existing.id);
          if (!serverVersion) return existing;
          return existing.id.startsWith("optimistic_")
            ? existing
            : serverVersion;
        });
        if (newMsgs.length === 0) return updated;
        const allTimestamps = res.messages.map((m) => m.createdAt);
        if (allTimestamps.length > 0)
          latestCreatedAtRef.current = Math.max(...allTimestamps);
        return [...updated, ...newMsgs];
      });
    } catch {
      // Silent fail on background polls
    } finally {
      pollingRef.current = false;
    }
  }, []);

  useEffect(() => {
    if (!authReady) return;

    if (!chatId) {
      setMessages([]);
      olderCursorRef.current = null;
      latestCreatedAtRef.current = 0;
      setHasMore(false);
      return;
    }

    setMessages([]);
    olderCursorRef.current = null;
    latestCreatedAtRef.current = 0;
    setHasMore(false);
    setError(null);
    pollingRef.current = false;

    loadInitial(chatId);

    const startPolling = () =>
      setInterval(() => {
        if (!document.hidden) pollNewMessages(chatId);
      }, 3_000);

    let interval = startPolling();

    const handleVisibility = () => {
      if (document.hidden) {
        clearInterval(interval);
      } else {
        pollNewMessages(chatId);
        interval = startPolling();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [chatId, loadInitial, pollNewMessages, authReady]);

  const loadMore = useCallback(async () => {
    if (!chatId || loadingOlder || !hasMore) return;
    try {
      setLoadingOlder(true);
      const cursor = olderCursorRef.current ?? undefined;
      const res = await ChatAPI.getMessages(chatId, {
        limit: 30,
        ...(cursor ?? {}),
      });
      setMessages((prev) => {
        const existingIds = new Set(prev.map((m) => m.id));
        const fresh = res.messages.filter((m) => !existingIds.has(m.id));
        return [...fresh, ...prev];
      });
      setHasMore(res.pagination.hasMore);
      if (res.pagination.nextCursor) {
        olderCursorRef.current = {
          lastDocId: res.pagination.nextCursor.lastDocId,
          lastDocCreatedAt: res.pagination.nextCursor
            .lastDocCreatedAt as number,
        };
      }
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Failed to load older messages",
      );
    } finally {
      setLoadingOlder(false);
    }
  }, [chatId, loadingOlder, hasMore]);

  const send = useCallback(
    async (content: string, opts?: { replyToId?: string }) => {
      if (!chatId || !content.trim()) return null;
      try {
        setSending(true);
        const optimistic: Message = {
          id: `optimistic_${Date.now()}`,
          chatId,
          senderId: currentUserId,
          type: "text",
          content: content.trim(),
          isRead: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          ...(opts?.replyToId && { replyToId: opts.replyToId }),
        };
        setMessages((prev) => [...prev, optimistic]);
        const res = await ChatAPI.sendMessage(chatId, content.trim(), opts);
        setMessages((prev) =>
          prev.map((m) => (m.id === optimistic.id ? res.message : m)),
        );
        latestCreatedAtRef.current = Math.max(
          latestCreatedAtRef.current,
          res.message.createdAt,
        );
        return res.message;
      } catch (e) {
        setMessages((prev) =>
          prev.filter((m) => !m.id.startsWith("optimistic_")),
        );
        setError(e instanceof Error ? e.message : "Failed to send message");
        return null;
      } finally {
        setSending(false);
      }
    },
    [chatId, currentUserId],
  );

  const editMessage = useCallback(
    async (messageId: string, content: string) => {
      if (!chatId) return false;

      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId ? { ...m, content, updatedAt: Date.now() } : m,
        ),
      );

      try {
        await MessageAPI.edit(chatId, messageId, content);
        return true;
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to edit message");
        return false;
      }
    },
    [chatId],
  );

  const deleteMessage = useCallback(
    async (messageId: string, forEveryone = true) => {
      if (!chatId) return false;

      if (forEveryone) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === messageId
              ? {
                  ...m,
                  content: "This message was deleted.",
                  deletedAt: Date.now(),
                }
              : m,
          ),
        );
      } else {
        setMessages((prev) => prev.filter((m) => m.id !== messageId));
      }

      try {
        await MessageAPI.delete(chatId, messageId, forEveryone);
        return true;
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to delete message");
        return false;
      }
    },
    [chatId],
  );

  return {
    messages,
    loading,
    loadingOlder,
    sending,
    error,
    hasMore,
    loadMore,
    send,
    editMessage,
    deleteMessage,
  };
}

// ─── useGroups ────────────────────────────────────────────────────────────────
export function useGroups(
  params?: { privacy?: "public" | "closed" | "private"; trending?: boolean },
  authReady = true,
) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const cursorRef = useRef<{ lastDocId: string; lastDocAt: number } | null>(
    null,
  );

  const privacyParam = params?.privacy;
  const trendingParam = params?.trending;

  const load = useCallback(
    async (reset = false) => {
      console.log(
        "[useGroups] load called, authReady:",
        authReady,
        "reset:",
        reset,
      );
      try {
        setLoading(true);
        setError(null);
        const cursor = reset ? undefined : (cursorRef.current ?? undefined);
        const res = await GroupAPI.list({
          privacy: privacyParam,
          trending: trendingParam,
          ...(cursor ?? {}),
        });
        console.log(
          "[useGroups] loaded groups count:",
          res.groups.length,
          res.groups.map((g) => g.name),
        );
        setGroups((prev) => (reset ? res.groups : [...prev, ...res.groups]));
        setHasMore(res.pagination.hasMore);
        if (res.pagination.nextCursor) {
          cursorRef.current = {
            lastDocId: res.pagination.nextCursor.lastDocId,
            lastDocAt: res.pagination.nextCursor.lastDocAt as number,
          };
        }
      } catch (e) {
        console.error("[useGroups] ERROR:", e);
        setError(e instanceof Error ? e.message : "Failed to load groups");
      } finally {
        setLoading(false);
      }
    },
    [privacyParam, trendingParam],
  );

  useEffect(() => {
    if (!authReady) return;
    load(true);
  }, [load, authReady]);

  const refresh = useCallback(() => {
    cursorRef.current = null;
    load(true);
  }, [load]);
  const loadMore = useCallback(() => {
    if (hasMore && !loading) load(false);
  }, [hasMore, loading, load]);

  const join = useCallback(async (groupId: string) => {
    const res = await GroupAPI.join(groupId);
    if (res.status === "joined")
      setGroups((prev) =>
        prev.map((g) =>
          g.id === groupId ? { ...g, memberCount: g.memberCount + 1 } : g,
        ),
      );
    return res;
  }, []);

  const leave = useCallback(async (groupId: string) => {
    await GroupAPI.leave(groupId);
    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? { ...g, memberCount: Math.max(0, g.memberCount - 1) }
          : g,
      ),
    );
  }, []);

  const create = useCallback(
    async (data: {
      name: string;
      description?: string;
      privacy?: "public" | "closed" | "private";
      tags?: string[];
    }) => {
      console.log("[useGroups] create called:", data);
      const res = await GroupAPI.create(data);
      console.log("[useGroups] create response:", res);
      setGroups((prev) => [res.group, ...prev]);
      return res.group;
    },
    [],
  );

  // Update a group in local state (e.g. after patching chatId or editing)
  const updateGroup = useCallback((updated: Group) => {
    setGroups((prev) => prev.map((g) => (g.id === updated.id ? updated : g)));
  }, []);

  return {
    groups,
    loading,
    error,
    hasMore,
    refresh,
    loadMore,
    join,
    leave,
    create,
    updateGroup,
  };
}

// ─── useCommunities ───────────────────────────────────────────────────────────
export function useCommunities(authReady = true) {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const cursorRef = useRef<{
    lastDocId: string;
    lastDocMemberCount: number;
  } | null>(null);

  const load = useCallback(async (reset = false) => {
    try {
      setLoading(true);
      setError(null);
      const cursor = reset ? undefined : (cursorRef.current ?? undefined);
      const res = await CommunityAPI.list(cursor ?? {});
      setCommunities((prev) =>
        reset ? res.communities : [...prev, ...res.communities],
      );
      setHasMore(res.pagination.hasMore);
      if (res.pagination.nextCursor) {
        cursorRef.current = {
          lastDocId: res.pagination.nextCursor.lastDocId,
          lastDocMemberCount: res.pagination.nextCursor
            .lastDocMemberCount as number,
        };
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load communities");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authReady) return;
    load(true);
  }, [load, authReady]);

  const loadMore = useCallback(() => {
    if (hasMore && !loading) load(false);
  }, [hasMore, loading, load]);

  const refresh = useCallback(() => {
    cursorRef.current = null;
    load(true);
  }, [load]);
  return { communities, loading, error, hasMore, loadMore, refresh };
}

// ─── useCreateChat ─────────────────────────────────────────────────────────────
export function useCreateChat() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createGroup = useCallback(
    async (name: string, participantIds?: string[]) => {
      try {
        setLoading(true);
        setError(null);
        const res = await ChatAPI.createGroup(name, participantIds);
        return res.chat;
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to create group");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const createDM = useCallback(async (participantId: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await ChatAPI.createDM(participantId);
      return res.chat;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to start DM");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createGroup, createDM, loading, error };
}

// ─── Time helper ──────────────────────────────────────────────────────────────
export function timeAgo(ms: number): string {
  const diff = Date.now() - ms;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}
