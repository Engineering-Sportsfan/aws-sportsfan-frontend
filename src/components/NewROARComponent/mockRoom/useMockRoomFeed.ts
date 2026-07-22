// src/components/NewROARComponent/mockRoom/useMockRoomFeed.ts
//
// Turns a room's RawMockEntry[] into renderable feed items, and persists
// the CURRENT viewer's own reactions/comments to localStorage only.
// Nothing here ever touches the network — by design, per-device only.
// (Reload on the same device keeps your likes/comments; a different
// device or a cleared localStorage starts back at the seed counts.)

import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  MockFeedItem,
  MockLocalComment,
  MockLocalItemState,
  MockRoomLocalState,
  RawMockEntry,
} from "./mockRoomTypes";

const STORAGE_PREFIX = "roar_mockroom_v1_";

function storageKey(roomId: string) {
  return `${STORAGE_PREFIX}${roomId}`;
}

function loadLocalState(roomId: string): MockRoomLocalState {
  try {
    const raw = localStorage.getItem(storageKey(roomId));
    if (!raw) return { items: {} };
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && parsed.items) return parsed as MockRoomLocalState;
    return { items: {} };
  } catch {
    return { items: {} };
  }
}

function saveLocalState(roomId: string, state: MockRoomLocalState) {
  try {
    localStorage.setItem(storageKey(roomId), JSON.stringify(state));
  } catch {
    // best-effort only — demo feature, fine to silently no-op (e.g. private
    // browsing with storage disabled)
  }
}

function emptyItemState(): MockLocalItemState {
  return { myReactions: {}, comments: [] };
}

/** Normalizes the raw script data into stable, id-tagged feed items. */
export function normalizeMockFeed(raw: RawMockEntry[], roomId: string): MockFeedItem[] {
  return raw.map((entry, idx) => {
    const id = `${roomId}-${idx}`;
    if (entry.d) {
      return { kind: "divider", id, label: entry.d };
    }
    if (entry.special) {
      return {
        kind: "special",
        id,
        special: entry.special,
        time: entry.time ?? "",
        title: entry.title ?? "",
        pts: entry.pts,
        text: entry.txt,
        poll: entry.poll,
      };
    }
    return {
      kind: "message",
      id,
      name: entry.name ?? "Fan",
      camp: entry.camp ?? "neu",
      bot: entry.bot,
      time: entry.time ?? "",
      text: entry.txt ?? "",
      poll: entry.poll,
      slider: entry.slider,
      seedReactions: entry.reax ?? {},
    };
  });
}

export interface DisplayReaction {
  emoji: string;
  count: number;
  active: boolean; // did the current viewer react with this emoji
}

export function useMockRoomFeed(roomId: string, raw: RawMockEntry[], currentUsername: string, currentAvatarUrl?: string) {
  const feedItems = useMemo(() => normalizeMockFeed(raw, roomId), [raw, roomId]);
  const [localState, setLocalState] = useState<MockRoomLocalState>(() => loadLocalState(roomId));

  // Re-hydrate if the room changes underneath us (shouldn't normally remount,
  // but keeps things correct if the component is reused across rooms).
  useEffect(() => {
    setLocalState(loadLocalState(roomId));
  }, [roomId]);

  const getItemState = useCallback(
    (itemId: string): MockLocalItemState => localState.items[itemId] ?? emptyItemState(),
    [localState]
  );

  const persist = useCallback(
    (next: MockRoomLocalState) => {
      setLocalState(next);
      saveLocalState(roomId, next);
    },
    [roomId]
  );

  const toggleReaction = useCallback(
    (itemId: string, emoji: string) => {
      const current = getItemState(itemId);
      const wasActive = !!current.myReactions[emoji];
      const nextItemState: MockLocalItemState = {
        ...current,
        myReactions: { ...current.myReactions, [emoji]: !wasActive },
      };
      persist({ items: { ...localState.items, [itemId]: nextItemState } });
    },
    [getItemState, localState, persist]
  );

  const addComment = useCallback(
    (itemId: string, text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      const current = getItemState(itemId);
      const comment: MockLocalComment = {
        id: `${itemId}-c-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        authorName: currentUsername || "You",
        authorAvatarUrl: currentAvatarUrl,
        text: trimmed,
        createdAt: Date.now(),
      };
      const nextItemState: MockLocalItemState = {
        ...current,
        comments: [...current.comments, comment],
      };
      persist({ items: { ...localState.items, [itemId]: nextItemState } });
    },
    [currentAvatarUrl, currentUsername, getItemState, localState, persist]
  );

  const deleteComment = useCallback(
    (itemId: string, commentId: string) => {
      const current = getItemState(itemId);
      const nextItemState: MockLocalItemState = {
        ...current,
        comments: current.comments.filter((c) => c.id !== commentId),
      };
      persist({ items: { ...localState.items, [itemId]: nextItemState } });
    },
    [getItemState, localState, persist]
  );

  /** Merges the seeded dummy counts with the viewer's own local toggles. */
  const getDisplayReactions = useCallback(
    (itemId: string, seedReactions: Record<string, number>): DisplayReaction[] => {
      const { myReactions } = getItemState(itemId);
      const emojis = new Set([...Object.keys(seedReactions), ...Object.keys(myReactions)]);
      return Array.from(emojis)
        .map((emoji) => {
          const seedCount = seedReactions[emoji] ?? 0;
          const active = !!myReactions[emoji];
          // seed counts already represent "other fans" — add 1 if the
          // viewer has actively reacted with an emoji not otherwise counted.
          const count = active ? seedCount + 1 : seedCount;
          return { emoji, count, active };
        })
        .filter((r) => r.count > 0)
        .sort((a, b) => b.count - a.count);
    },
    [getItemState]
  );

  return {
    feedItems,
    getItemState,
    getDisplayReactions,
    toggleReaction,
    addComment,
    deleteComment,
  };
}