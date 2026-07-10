
/*


// lib/chatApi.ts  — FRONTEND project

const BASE = "/api";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string> ?? {}),
    },
    ...options,
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error ?? `Request failed: ${res.status}`);
  }
  return json as T;
}

export type ChatType     = "dm" | "group";
export type MessageType  = "text" | "image" | "video" | "audio" | "file";
export type GroupPrivacy = "public" | "closed" | "private";
export type GroupRole    = "owner" | "admin" | "member";

export interface Chat {
  id: string;
  type: ChatType;
  name: string;
  avatarUrl?: string;
  participantIds: string[];
  lastMessageContent: string;
  lastMessageAt: number;
  unreadCount: number;
  isOnline: boolean;
  isVerified: boolean;
  isPinned: boolean;
  isMuted: boolean;
  createdBy: string;
  createdAt: number;
  updatedAt: number;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  type: MessageType;
  content: string;
  mediaUrl?: string;
  replyToId?: string;
  isRead: boolean;
  deletedAt?: number;
  createdAt: number;
  updatedAt: number;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  avatarUrl?: string;
  privacy: GroupPrivacy;
  memberCount: number;
  isTrending: boolean;
  category?: string;
  lastActivityAt: number;
  isVerified: boolean;
  tags: string[];
  chatId?: string;
  createdBy: string;
  createdAt: number;
  updatedAt: number;
}

export interface GroupMember {
  id: string;       // userId
  userId: string;
  email: string;
  name: string;
  role: GroupRole;
  status?: string;
  joinedAt: number;
}

export interface Community {
  id: string;
  name: string;
  description?: string;
  avatarUrl?: string;
  memberCount: number;
  groupCount: number;
  isVerified: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface Pagination {
  limit: number;
  hasMore: boolean;
  nextCursor: { lastDocId: string; [key: string]: unknown } | null;
}

export function resolveChatName(chat: Chat, currentUserId: string): string {
  if (chat.type === "group") return chat.name || "Unnamed Group";
  if (chat.name && chat.name.trim()) return chat.name;
  const otherId = chat.participantIds.find(id => id !== currentUserId);
  if (!otherId) return "Unknown User";
  return otherId.replace(/_gmail_com$|_sportsfan360_com$/, "").replace(/_/g, " ");
}

// ─── Chats ────────────────────────────────────────────────────────────────────
export const ChatAPI = {
  list: (params?: { type?: ChatType; lastDocId?: string; lastDocUpdatedAt?: number; limit?: number }) => {
    const q = new URLSearchParams();
    if (params?.type)             q.set("type",             params.type);
    if (params?.limit)            q.set("limit",            String(params.limit));
    if (params?.lastDocId)        q.set("lastDocId",        params.lastDocId);
    if (params?.lastDocUpdatedAt) q.set("lastDocUpdatedAt", String(params.lastDocUpdatedAt));
    return request<{ success: true; chats: Chat[]; pagination: Pagination }>(`/chats?${q}`);
  },

  get: (chatId: string) =>
    request<{ success: true; chat: Chat }>(`/chats/${chatId}`),

  createDM: (participantId: string, name?: string) =>
    request<{ success: true; id: string; chat: Chat }>("/chats", {
      method: "POST",
      body: JSON.stringify({ type: "dm", participantId, name: name ?? "" }),
    }),

  createGroup: (name: string, participantIds?: string[]) =>
    request<{ success: true; id: string; chat: Chat }>("/chats", {
      method: "POST",
      body: JSON.stringify({ type: "group", name, participantIds }),
    }),

  update: (chatId: string, data: Partial<Pick<Chat, "name" | "isMuted" | "isPinned" | "avatarUrl">>) =>
    request<{ success: true; chat: Chat }>(`/chats/${chatId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (chatId: string) =>
    request<{ success: true; message: string }>(`/chats/${chatId}`, { method: "DELETE" }),

  getMessages: (chatId: string, params?: { lastDocId?: string; lastDocCreatedAt?: number; limit?: number }) => {
    const q = new URLSearchParams();
    if (params?.limit)            q.set("limit",            String(params.limit));
    if (params?.lastDocId)        q.set("lastDocId",        params.lastDocId);
    if (params?.lastDocCreatedAt) q.set("lastDocCreatedAt", String(params.lastDocCreatedAt));
    return request<{ success: true; messages: Message[]; pagination: Pagination }>(`/chats/${chatId}/messages?${q}`);
  },

  sendMessage: (chatId: string, content: string, opts?: { type?: MessageType; replyToId?: string; mediaUrl?: string }) =>
    request<{ success: true; id: string; message: Message }>(`/chats/${chatId}/messages`, {
      method: "POST",
      body: JSON.stringify({ content, ...opts }),
    }),
};

// ─── Messages ─────────────────────────────────────────────────────────────────
export const MessageAPI = {
  edit: (messageId: string, content: string) =>
    request<{ success: true; message: Message }>(`/messages/${messageId}`, {
      method: "PATCH",
      body: JSON.stringify({ content }),
    }),

  delete: (messageId: string) =>
    request<{ success: true; message: string }>(`/messages/${messageId}`, { method: "DELETE" }),
};

// ─── Groups ───────────────────────────────────────────────────────────────────
export const GroupAPI = {
  list: (params?: { privacy?: GroupPrivacy; trending?: boolean; category?: string; joined?: boolean; lastDocId?: string; lastDocAt?: number; limit?: number }) => {
    const q = new URLSearchParams();
    if (params?.privacy)   q.set("privacy",   params.privacy);
    if (params?.trending)  q.set("trending",  "true");
    if (params?.category)  q.set("category",  params.category);
    if (params?.joined)    q.set("joined",    "true");
    if (params?.limit)     q.set("limit",     String(params.limit));
    if (params?.lastDocId) q.set("lastDocId", params.lastDocId);
    if (params?.lastDocAt) q.set("lastDocAt", String(params.lastDocAt));
    return request<{ success: true; groups: Group[]; pagination: Pagination }>(`/groups?${q}`);
  },

  get: (groupId: string) =>
    request<{ success: true; group: Group }>(`/groups/${groupId}`),

  create: (data: { name: string; description?: string; privacy?: GroupPrivacy; category?: string; tags?: string[] }) =>
    request<{ success: true; id: string; group: Group }>("/groups", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // chatId included so we can link the group ↔ chat after creation
  update: (groupId: string, data: Partial<Pick<Group, "name" | "description" | "privacy" | "category" | "tags" | "avatarUrl" | "chatId">>) =>
    request<{ success: true; group: Group }>(`/groups/${groupId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (groupId: string) =>
    request<{ success: true; message: string }>(`/groups/${groupId}`, { method: "DELETE" }),

  join: (groupId: string) =>
    request<{ success: true; status: "joined" | "pending"; message: string }>(`/groups/${groupId}/join`, { method: "POST" }),

  leave: (groupId: string) =>
    request<{ success: true; message: string }>(`/groups/${groupId}/join`, { method: "DELETE" }),

  // ── Members ──────────────────────────────────────────────────────────────
  listMembers: (groupId: string, params?: { role?: GroupRole; limit?: number; lastDocId?: string }) => {
    const q = new URLSearchParams();
    if (params?.role)      q.set("role",      params.role);
    if (params?.limit)     q.set("limit",     String(params.limit));
    if (params?.lastDocId) q.set("lastDocId", params.lastDocId);
    return request<{ success: true; members: GroupMember[]; pagination: Pagination }>(`/groups/${groupId}/members?${q}`);
  },

  addMember: (groupId: string, userId: string) =>
    request<{ success: true; message: string; userId: string; role: string }>(`/groups/${groupId}/members`, {
      method: "POST",
      body: JSON.stringify({ userId }),
    }),

  updateMemberRole: (groupId: string, userId: string, role: "admin" | "member") =>
    request<{ success: true; message: string; userId: string; role: string }>(`/groups/${groupId}/members`, {
      method: "PATCH",
      body: JSON.stringify({ userId, role }),
    }),

  removeMember: (groupId: string, userId: string) =>
    request<{ success: true; message: string }>(`/groups/${groupId}/members`, {
      method: "DELETE",
      body: JSON.stringify({ userId }),
    }),
};

// ─── Communities ──────────────────────────────────────────────────────────────
// ─── Communities ──────────────────────────────────────────────────────────────
export const CommunityAPI = {
  list: (params?: { lastDocId?: string; lastDocMemberCount?: number; limit?: number; joined?: boolean }) => {
    const q = new URLSearchParams();
    if (params?.limit)              q.set("limit",              String(params.limit));
    if (params?.lastDocId)          q.set("lastDocId",          params.lastDocId);
    if (params?.lastDocMemberCount) q.set("lastDocMemberCount", String(params.lastDocMemberCount));
    if (params?.joined)             q.set("joined",             "true");
    return request<{ success: true; communities: Community[]; pagination: Pagination }>(`/communities?${q}`);
  },

  create: (data: { name: string; description?: string; avatarUrl?: string }) =>
    request<{ success: true; id: string; community: Community }>("/communities", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  get: (communityId: string) =>
    request<{ success: true; community: Community; groups?: Group[] }>(`/communities/${communityId}`),

  update: (communityId: string, data: Partial<Pick<Community, "name" | "description" | "avatarUrl">>) =>
    request<{ success: true; community: Community }>(`/communities/${communityId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  join: (communityId: string) =>
    request<{ success: true; status: "joined"; message: string }>(`/communities/${communityId}/join`, { method: "POST" }),

  leave: (communityId: string) =>
    request<{ success: true; message: string }>(`/communities/${communityId}/join`, { method: "DELETE" }),
};


*/









// lib/chatApi.ts  — FRONTEND project

const BASE = "/api";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string> ?? {}),
    },
    ...options,
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error ?? `Request failed: ${res.status}`);
  }
  return json as T;
}

export type ChatType     = "dm" | "group";
export type MessageType  = "text" | "image" | "video" | "audio" | "file";
export type GroupPrivacy = "public" | "closed" | "private";
export type GroupRole    = "owner" | "admin" | "member";

export interface Chat {
  id: string;
  type: ChatType;
  name: string;
  avatarUrl?: string;
  participantIds: string[];
  lastMessageContent: string;
  lastMessageAt: number;
  unreadCount: number;
  isOnline: boolean;
  isVerified: boolean;
  isPinned: boolean;
  isMuted: boolean;
  createdBy: string;
  createdAt: number;
  updatedAt: number;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  type: MessageType;
  content: string;
  mediaUrl?: string;
  replyToId?: string;
  isRead: boolean;
  deletedAt?: number;
  createdAt: number;
  updatedAt: number;
  edited?: boolean;
  deleted?: boolean;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  avatarUrl?: string;
  privacy: GroupPrivacy;
  memberCount: number;
  isTrending: boolean;
  category?: string;
  lastActivityAt: number;
  isVerified: boolean;
  tags: string[];
  chatId?: string;
  createdBy: string;
  createdAt: number;
  updatedAt: number;
}

export interface GroupMember {
  id: string;       // userId
  userId: string;
  email: string;
  name: string;
  role: GroupRole;
  status?: string;
  joinedAt: number;
}

export interface Community {
  id: string;
  name: string;
  description?: string;
  avatarUrl?: string;
  memberCount: number;
  chatId?: string; 
  groupCount: number;
  isVerified: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface Pagination {
  limit: number;
  hasMore: boolean;
  nextCursor: { lastDocId: string; [key: string]: unknown } | null;
}

export function resolveChatName(chat: Chat, currentUserId: string): string {
  if (chat.type === "group") return chat.name || "Unnamed Group";
  if (chat.name && chat.name.trim()) return chat.name;
  const normalize = (id: string) => id.toLowerCase().replace(/[^a-zA-Z0-9]/g, "_");
  const normCurrent = normalize(currentUserId);
  const otherId = chat.participantIds.find(id => {
    const normId = normalize(id);
    if (!normCurrent) return true;
    return !normId.endsWith(normCurrent) && !normCurrent.endsWith(normId);
  });
  if (!otherId) return "Unknown User";
  
  let cleaned = otherId;
  cleaned = cleaned.replace(/^google_/, "");
  cleaned = cleaned.replace(/_[0-9]+$/, ""); // Remove trailing timestamps
  cleaned = cleaned.replace(/_gmail_com$|_sportsfan360_com$/, "");
  
  // Remove numbers or duplicate handles if possible (e.g. guptaraghav1375 -> gupta)
  cleaned = cleaned.replace(/[0-9]+/g, ""); 
  cleaned = cleaned.replace(/(.+)\1/g, "$1"); // Deduplicate if word repeat patterns exist

  return cleaned
    .split("_")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
    .trim();
}

// ─── Chats ────────────────────────────────────────────────────────────────────
export const ChatAPI = {
  list: (params?: { type?: ChatType; lastDocId?: string; lastDocUpdatedAt?: number; limit?: number }) => {
    const q = new URLSearchParams();
    if (params?.type)             q.set("type",             params.type);
    if (params?.limit)            q.set("limit",            String(params.limit));
    if (params?.lastDocId)        q.set("lastDocId",        params.lastDocId);
    if (params?.lastDocUpdatedAt) q.set("lastDocUpdatedAt", String(params.lastDocUpdatedAt));
    return request<{ success: true; chats: Chat[]; pagination: Pagination }>(`/chats?${q}`);
  },

  get: (chatId: string) =>
    request<{ success: true; chat: Chat }>(`/chats/${chatId}`),

  createDM: (participantId: string, name?: string) =>
    request<{ success: true; id: string; chat: Chat }>("/chats", {
      method: "POST",
      body: JSON.stringify({ type: "dm", participantId, name: name ?? "" }),
    }),

  createGroup: (name: string, participantIds?: string[]) =>
    request<{ success: true; id: string; chat: Chat }>("/chats", {
      method: "POST",
      body: JSON.stringify({ type: "group", name, participantIds }),
    }),

  update: (chatId: string, data: Partial<Pick<Chat, "name" | "isMuted" | "isPinned" | "avatarUrl">>) =>
    request<{ success: true; chat: Chat }>(`/chats/${chatId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (chatId: string) =>
    request<{ success: true; message: string }>(`/chats/${chatId}`, { method: "DELETE" }),

  getMessages: (chatId: string, params?: { lastDocId?: string; lastDocCreatedAt?: number; limit?: number }) => {
    const q = new URLSearchParams();
    if (params?.limit)            q.set("limit",            String(params.limit));
    if (params?.lastDocId)        q.set("lastDocId",        params.lastDocId);
    if (params?.lastDocCreatedAt) q.set("lastDocCreatedAt", String(params.lastDocCreatedAt));
    return request<{ success: true; messages: Message[]; pagination: Pagination }>(`/chats/${chatId}/messages?${q}`);
  },

  sendMessage: (chatId: string, content: string, opts?: { type?: MessageType; replyToId?: string; mediaUrl?: string }) =>
    request<{ success: true; id: string; message: Message }>(`/chats/${chatId}/messages`, {
      method: "POST",
      body: JSON.stringify({ content, ...opts }),
    }),
};

// ─── Messages ─────────────────────────────────────────────────────────────────
export const MessageAPI = {
  edit: (chatId: string, messageId: string, content: string) =>
  request<{ success: true; message: Message }>(
    `/chats/${chatId}/messages/${messageId}`,
    {
      method: "PATCH",
      body: JSON.stringify({ content }),
    }
  ),

  delete: (chatId: string, messageId: string, forEveryone = true) => {
    const q = new URLSearchParams();
    if (!forEveryone) q.set("forEveryone", "false");
    return request<{ success: true; message: string }>(
      `/chats/${chatId}/messages/${messageId}?${q}`,
      {
        method: "DELETE",
      }
    );
  },
};

// ─── Groups ───────────────────────────────────────────────────────────────────
export const GroupAPI = {
  list: (params?: { privacy?: GroupPrivacy; trending?: boolean; category?: string; joined?: boolean; lastDocId?: string; lastDocAt?: number; limit?: number }) => {
    const q = new URLSearchParams();
    if (params?.privacy)   q.set("privacy",   params.privacy);
    if (params?.trending)  q.set("trending",  "true");
    if (params?.category)  q.set("category",  params.category);
    if (params?.joined)    q.set("joined",    "true");
    if (params?.limit)     q.set("limit",     String(params.limit));
    if (params?.lastDocId) q.set("lastDocId", params.lastDocId);
    if (params?.lastDocAt) q.set("lastDocAt", String(params.lastDocAt));
    return request<{ success: true; groups: Group[]; pagination: Pagination }>(`/groups?${q}`);
  },

  get: (groupId: string) =>
    request<{ success: true; group: Group }>(`/groups/${groupId}`),

  create: (data: { name: string; description?: string; privacy?: GroupPrivacy; category?: string; tags?: string[] }) =>
    request<{ success: true; id: string; group: Group }>("/groups", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // chatId included so we can link the group ↔ chat after creation
  update: (groupId: string, data: Partial<Pick<Group, "name" | "description" | "privacy" | "category" | "tags" | "avatarUrl" | "chatId">>) =>
    request<{ success: true; group: Group }>(`/groups/${groupId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (groupId: string) =>
    request<{ success: true; message: string }>(`/groups/${groupId}`, { method: "DELETE" }),

  join: (groupId: string) =>
    request<{ success: true; status: "joined" | "pending"; message: string }>(`/groups/${groupId}/join`, { method: "POST" }),

  leave: (groupId: string) =>
    request<{ success: true; message: string }>(`/groups/${groupId}/join`, { method: "DELETE" }),

  // ── Members ──────────────────────────────────────────────────────────────
  listMembers: (groupId: string, params?: { role?: GroupRole; limit?: number; lastDocId?: string }) => {
    const q = new URLSearchParams();
    if (params?.role)      q.set("role",      params.role);
    if (params?.limit)     q.set("limit",     String(params.limit));
    if (params?.lastDocId) q.set("lastDocId", params.lastDocId);
    return request<{ success: true; members: GroupMember[]; pagination: Pagination }>(`/groups/${groupId}/members?${q}`);
  },

  addMember: (groupId: string, userId: string) =>
    request<{ success: true; message: string; userId: string; role: string }>(`/groups/${groupId}/members`, {
      method: "POST",
      body: JSON.stringify({ userId }),
    }),

  updateMemberRole: (groupId: string, userId: string, role: "admin" | "member") =>
    request<{ success: true; message: string; userId: string; role: string }>(`/groups/${groupId}/members`, {
      method: "PATCH",
      body: JSON.stringify({ userId, role }),
    }),

  removeMember: (groupId: string, userId: string) =>
    request<{ success: true; message: string }>(`/groups/${groupId}/members`, {
      method: "DELETE",
      body: JSON.stringify({ userId }),
    }),
};


// ─── Communities ──────────────────────────────────────────────────────────────
export const CommunityAPI = {
  list: (params?: { lastDocId?: string; lastDocMemberCount?: number; limit?: number; joined?: boolean }) => {
    const q = new URLSearchParams();
    if (params?.limit)              q.set("limit",              String(params.limit));
    if (params?.lastDocId)          q.set("lastDocId",          params.lastDocId);
    if (params?.lastDocMemberCount) q.set("lastDocMemberCount", String(params.lastDocMemberCount));
    if (params?.joined)             q.set("joined",             "true");
    return request<{ success: true; communities: Community[]; pagination: Pagination }>(`/communities?${q}`);
  },

  create: (data: { name: string; description?: string; avatarUrl?: string }) =>
    request<{ success: true; id: string; community: Community }>("/communities", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  get: (communityId: string) =>
    request<{ success: true; community: Community; groups?: Group[] }>(`/communities/${communityId}`),

  update: (communityId: string, data: Partial<Pick<Community, "name" | "description" | "avatarUrl">>) =>
    request<{ success: true; community: Community }>(`/communities/${communityId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  join: (communityId: string) =>
    request<{ success: true; status: "joined"; message: string }>(`/communities/${communityId}/join`, { method: "POST" }),

  leave: (communityId: string) =>
    request<{ success: true; message: string }>(`/communities/${communityId}/join`, { method: "DELETE" }),

  // ── Members ──────────────────────────────────────────────────────────────
  listMembers: (communityId: string, params?: { role?: string; limit?: number; lastDocId?: string }) => {
    const q = new URLSearchParams();
    if (params?.role)      q.set("role",      params.role);
    if (params?.limit)     q.set("limit",     String(params.limit));
    if (params?.lastDocId) q.set("lastDocId", params.lastDocId);
    return request<{ success: true; members: GroupMember[]; pagination: Pagination }>(`/communities/${communityId}/members?${q}`);
  },

  addMember: (communityId: string, userId: string) =>
    request<{ success: true; message: string; userId: string; role: string }>(`/communities/${communityId}/members`, {
      method: "POST",
      body: JSON.stringify({ userId }),
    }),

  updateMemberRole: (communityId: string, userId: string, role: "admin" | "member") =>
    request<{ success: true; message: string; userId: string; role: string }>(`/communities/${communityId}/members`, {
      method: "PATCH",
      body: JSON.stringify({ userId, role }),
    }),

  removeMember: (communityId: string, userId: string) =>
    request<{ success: true; message: string }>(`/communities/${communityId}/members`, {
      method: "DELETE",
      body: JSON.stringify({ userId }),
    }),
};
