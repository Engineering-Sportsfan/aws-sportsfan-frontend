/** Display order of the Step 2 "What do you follow?" groups. Legacy "Teams" sits where it used to be. */
const FOLLOW_GROUP_ORDER = ["Sports", "Teams", "International Teams", "League / IPL Teams", "Athletes", "Competitions"];

const norm = (s: string) => s.trim().toLowerCase();

/**
 * Returns the groups in display order. Known groups come first in FOLLOW_GROUP_ORDER; admin-defined custom
 * titles follow in their original (API) order. Never drops a group, so legacy "Teams" still renders.
 */
export function orderFollowGroups<T>(groups: Record<string, T[]>): Record<string, T[]> {
  const rank = (k: string) => {
    const i = FOLLOW_GROUP_ORDER.findIndex((g) => norm(g) === norm(k));
    return i === -1 ? FOLLOW_GROUP_ORDER.length : i;
  };
  const sorted = Object.keys(groups)
    .map((k, i) => ({ k, i }))
    .sort((a, b) => rank(a.k) - rank(b.k) || a.i - b.i)
    .map((x) => x.k);
  const out: Record<string, T[]> = {};
  for (const k of sorted) if (groups[k].length > 0) out[k] = groups[k];
  return out;
}
