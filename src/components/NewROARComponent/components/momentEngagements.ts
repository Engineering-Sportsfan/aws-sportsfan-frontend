import axios from "axios";

/** Minimal shape of a match-moment engagement from the list endpoint. */
export interface MomentEngagement {
  id?: string;
  type?: string;
  loopId?: string;
  momentId?: string;
  [k: string]: unknown;
}

const LIST_URL = "/api/engagements?excludeFlipArena=true&source=match_moment&allEnvs=true&limit=500";
const TTL_MS = 5 * 60 * 1000;

let cache: { at: number; items: MomentEngagement[] } | null = null;
let inflight: Promise<MomentEngagement[]> | null = null;

/**
 * Match-moment engagements (only those with a loopId or momentId), shared by the Profile tiles and the
 * Contribution History overlay. One request per 5 minutes; concurrent callers share the same request.
 */
export function getMomentEngagements(timeout = 15000): Promise<MomentEngagement[]> {
  if (cache && Date.now() - cache.at < TTL_MS) return Promise.resolve(cache.items);
  if (inflight) return inflight;
  inflight = axios
    .get(LIST_URL, { timeout })
    .then((res) => {
      const d = res.data;
      const list: MomentEngagement[] = d?.engagements || d?.data || (Array.isArray(d) ? d : []);
      const items = list.filter((e) => !!e?.loopId || !!e?.momentId);
      cache = { at: Date.now(), items };
      return items;
    })
    .finally(() => {
      inflight = null;
    });
  return inflight;
}
