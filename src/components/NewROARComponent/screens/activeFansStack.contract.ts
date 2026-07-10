// Pure logic for the ActiveFansStack header widget in DiscussionRoom.tsx.

export function formatActiveCount(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : `${n}`;
}

export interface DisplayFan {
  uid: string;
  username: string;
  avatarUrl?: string | null;
}

// Never render more avatars than `count`, even if `fans` is stale or
// oversized relative to it (e.g. a slow GET response landing after a
// fresher, lower heartbeat count). Caps at `max` regardless.
export function getDisplayedAvatars<T extends DisplayFan>(
  fans: T[],
  count: number,
  max: number = 3,
): T[] {
  const cap = Math.min(max, Math.max(0, count));
  return fans.slice(0, cap);
}

export function shouldRenderActiveFansStack(count: number, totalJoinCount?: number): boolean {
  return count > 0 || Boolean(totalJoinCount);
}