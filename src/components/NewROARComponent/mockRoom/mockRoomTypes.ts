// src/components/NewROARComponent/mockRoom/mockRoomTypes.ts
//
// Types for the two static "mock play" ROAR rooms (demo/internal only).
// These rooms are NOT backed by the database — everything after the
// initial seed lives in localStorage on the viewer's own device.

export type MockPollType =
  | "camp"
  | "reaction"
  | "debate"
  | "battle"
  | "lock"
  | "quiz"
  | "rate";

// Option shape varies by poll type in the source data:
//  - "reaction"                → [label, pct]              (no color key)
//  - "camp" | "debate" | "battle" | "rate" → [label, colorKey, pct]
//  - "quiz"                    → [label, colorKey]          (no pct — unrevealed)
//  - "lock"                    → [label, colorKey, null]    (pct not revealed yet)
// Kept loose (rather than a strict tuple) since the shape genuinely differs
// by type and PollBlock branches on poll.type to interpret it.
export type MockPollOptionValue = string | number | null;
export type MockPollOption = MockPollOptionValue[];

export interface RawMockPoll {
  type: MockPollType;
  opts: MockPollOption[];
}

export interface RawMockSlider {
  left: string;
  right: string;
  pct: number; // 0-100, position of the "fill" from the left label's side
}

// One entry from the original mock-play scripts. A given entry is exactly
// one of: a section divider ({d}), a Dolly "special" card ({special}), or
// a normal chat message (everything else).
export interface RawMockEntry {
  d?: string;

  special?: "analysis" | "story" | "spicy";
  title?: string;
  pts?: string[];

  name?: string;
  camp?: string; // e.g. "ind" | "eng" | "nor" | "neu" — meaning is per-room
  bot?: boolean;
  time?: string;
  txt?: string;
  poll?: RawMockPoll;
  slider?: RawMockSlider;
  reax?: Record<string, number>; // emoji -> seed count
}

export interface MockRoomRosterGroup {
  label?: string; // e.g. a university name — omit for a flat roster
  members: string[];
}

export interface MockRoomMeta {
  roomId: string;
  title: string; // header title, e.g. "England vs India — 5th T20I"
  eyebrow: string; // small label above title
  subtitle: string; // description paragraph
  resultFact: string; // the "this was real, dialogue is invented" disclaimer
  tickerText: string;
  score?: string;
  scoreSubtitle?: string;
  roomSports: "cricket" | "football";
  campColors: Record<string, string>; // camp key -> hex, incl. "neu"
  campLabels: Record<string, string>; // camp key -> short tag text, e.g. "IND"
  roster: MockRoomRosterGroup[];
}

// ---- Normalized feed items (what the component actually renders) ----

export type MockFeedItem =
  | {
      kind: "divider";
      id: string;
      label: string;
    }
  | {
      kind: "special";
      id: string;
      special: "analysis" | "story" | "spicy";
      time: string;
      title: string;
      pts?: string[];
      text?: string;
      poll?: RawMockPoll;
    }
  | {
      kind: "message";
      id: string;
      name: string;
      camp: string;
      bot?: boolean;
      time: string;
      text: string;
      poll?: RawMockPoll;
      slider?: RawMockSlider;
      seedReactions: Record<string, number>;
    };

// ---- Per-device local state (localStorage) ----

export interface MockLocalComment {
  id: string;
  authorName: string;
  authorAvatarUrl?: string;
  text: string;
  createdAt: number;
}

export interface MockLocalItemState {
  // emoji -> whether the CURRENT viewer added that reaction (seed counts are
  // never mutated in storage — we add the viewer's own delta on render)
  myReactions: Record<string, boolean>;
  comments: MockLocalComment[];
}

export interface MockRoomLocalState {
  items: Record<string, MockLocalItemState>;
}