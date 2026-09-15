// hooks/usePlayerSearch.ts
// Search -> (miss) generate -> poll the correct profile endpoint -> render.

import { useCallback, useRef, useState } from "react";
import axios from "axios";

type Status = "idle" | "searching" | "generating" | "published" | "rejected" | "error";

interface UsePlayerSearchResult {
  status: Status;
  profile: any | null;
  error: string | null;
  search: (name: string, sport: string) => Promise<void>;
  reset: () => void;
}

const POLL_INTERVAL_MS = 2000;
const MAX_POLL_MS = 28000; // stay under the 30s target with margin

function isCricket(sport: string) {
  return sport?.toLowerCase().trim() === "cricket";
}

export function usePlayerSearch(): UsePlayerSearchResult {
  const [status, setStatus] = useState<Status>("idle");
  const [profile, setProfile] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const reset = useCallback(() => {
    if (pollTimer.current) clearTimeout(pollTimer.current);
    setStatus("idle");
    setProfile(null);
    setError(null);
  }, []);

  const fetchDetail = useCallback(async (id: string, sport: string) => {
    const url = isCricket(sport) ? `/api/ms_players/${id}` : `/api/athleteProfile/${id}`;
    const res = await axios.get(url);
    return res.data;
  }, []);

  const pollUntilPublished = useCallback(
    (id: string, sport: string, startedAt: number) => {
      pollTimer.current = setTimeout(async () => {
        try {
          const data = await fetchDetail(id, sport);
          const currentStatus = data?.status ?? data?.coreInfo ? "published" : data?.status;

          if (currentStatus === "published" || (data && !data.status)) {
            // No "status" field at all (assemblePlayerDocument output) also
            // means it's a finished, real profile.
            setProfile(data);
            setStatus("published");
            return;
          }
          if (currentStatus === "rejected") {
            setStatus("rejected");
            setError(data?.reason ?? "Could not verify this player");
            return;
          }
          if (Date.now() - startedAt > MAX_POLL_MS) {
            setStatus("error");
            setError("Taking longer than expected — try again in a moment");
            return;
          }
          pollUntilPublished(id, sport, startedAt);
        } catch (e) {
          if (Date.now() - startedAt > MAX_POLL_MS) {
            setStatus("error");
            setError("Taking longer than expected — try again in a moment");
            return;
          }
          pollUntilPublished(id, sport, startedAt);
        }
      }, POLL_INTERVAL_MS);
    },
    [fetchDetail]
  );

  const search = useCallback(
    async (name: string, sport: string) => {
      reset();
      setStatus("searching");
      try {
        const searchRes = await axios.get(`/api/global-search`, { params: { q: name } });
        const results = searchRes.data?.results ?? [];

        if (results.length > 0) {
          setProfile(results[0]);
          setStatus("published");
          return;
        }

        // Miss -> trigger generation
        setStatus("generating");
        const genRes = await axios.post(`/api/player-profile/generate`, { name, sport });
        const { status: genStatus, id, profile: genProfile } = genRes.data;

        if (genStatus === "published") {
          setProfile(genProfile);
          setStatus("published");
          return;
        }
        if (genStatus === "rejected") {
          setStatus("rejected");
          setError(genRes.data?.message ?? "Could not verify this player");
          return;
        }

        // status === "generating" -> start polling the real detail endpoint
        pollUntilPublished(id, sport, Date.now());
      } catch (e: any) {
        setStatus("error");
        setError(e?.response?.data?.message ?? "Something went wrong");
      }
    },
    [reset, pollUntilPublished]
  );

  return { status, profile, error, search, reset };
}