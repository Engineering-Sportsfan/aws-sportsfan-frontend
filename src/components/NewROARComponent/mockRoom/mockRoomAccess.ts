// src/components/NewROARComponent/mockRoom/mockRoomAccess.ts
//
// Registry of the demo-only "mock play" rooms, plus the internal-team
// visibility check. These rooms are static/local — never hit the DB.

import type { MockRoomMeta, RawMockEntry } from "./mockRoomTypes";
import {
  IND_ENG_5TH_T20I_ROOM_ID,
  IND_ENG_5TH_T20I_META,
  IND_ENG_5TH_T20I_RAW,
} from "./mockRoomData/indEng5thT20i";
import {
  FIFA_WC_QF_ENG_NOR_ROOM_ID,
  FIFA_WC_QF_ENG_NOR_META,
  FIFA_WC_QF_ENG_NOR_RAW,
} from "./mockRoomData/fifaWcQfEngNor";

export interface MockRoomDefinition {
  meta: MockRoomMeta;
  raw: RawMockEntry[];
}

export const MOCK_ROOMS: Record<string, MockRoomDefinition> = {
  [IND_ENG_5TH_T20I_ROOM_ID]: {
    meta: IND_ENG_5TH_T20I_META,
    raw: IND_ENG_5TH_T20I_RAW,
  },
  [FIFA_WC_QF_ENG_NOR_ROOM_ID]: {
    meta: FIFA_WC_QF_ENG_NOR_META,
    raw: FIFA_WC_QF_ENG_NOR_RAW,
  },
};

export function isMockRoomId(roomId?: string | null): boolean {
  if (!roomId) return false;
  return Object.prototype.hasOwnProperty.call(MOCK_ROOMS, roomId);
}

export function getMockRoomDefinition(roomId: string): MockRoomDefinition | undefined {
  return MOCK_ROOMS[roomId];
}

/**
 * Internal-only visibility check. Mock rooms should only ever be injected
 * into a room list (and only ever be reachable) for accounts whose id or
 * email contains "sportsfan" — e.g. internal @sportsfan360 test accounts.
 *
 * Kept intentionally simple/string-based since this is a throwaway demo
 * gate, not a real permissions system — do not reuse this pattern for
 * anything that needs to be secure.
 */
export function canViewMockRooms(identifiers: Array<string | null | undefined>): boolean {
  return identifiers.some(
    (id) => typeof id === "string" && id.toLowerCase().includes("sportsfan")
  );
}

/** Convenience list for injecting into a room list UI, gated by the caller. */
export function listMockRoomsForDisplay(): MockRoomMeta[] {
  return Object.values(MOCK_ROOMS).map((r) => r.meta);
}