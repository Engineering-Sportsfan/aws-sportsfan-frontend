import { useState, useEffect } from 'react';
import recordsService, {
  RecordEntry,
  TrendEntry,
  ProgressData,
  RecordInsight,
  StoryEntry,
} from '../services/records.service';

// ─── useRecords ───────────────────────────────────────────────────────────────

interface UseRecordsResult {
  records: RecordEntry[];
  loading: boolean;
  error: string | null;
}

export function useRecords(event: string, category: string): UseRecordsResult {
  const [records, setRecords] = useState<RecordEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    recordsService
      .getRecords(event, category)
      .then((data) => {
        if (!cancelled) setRecords(data ?? []);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [event, category]);

  return { records, loading, error };
}

// ─── useRecordInsight ─────────────────────────────────────────────────────────

interface UseRecordInsightResult {
  insight: RecordInsight | null;
  loading: boolean;
  error: string | null;
}

export function useRecordInsight(
  event: string,
  category: string,
): UseRecordInsightResult {
  const [insight, setInsight] = useState<RecordInsight | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    recordsService
      .getInsight(event, category)
      .then((data) => {
        if (!cancelled) setInsight(data ?? null);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [event, category]);

  return { insight, loading, error };
}

// ─── useRecordTrends ──────────────────────────────────────────────────────────

interface UseRecordTrendsResult {
  trends: TrendEntry[];
  loading: boolean;
  error: string | null;
}

export function useRecordTrends(event: string): UseRecordTrendsResult {
  const [trends, setTrends] = useState<TrendEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    recordsService
      .getTrends(event)
      .then((data) => {
        if (!cancelled) setTrends(data ?? []);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [event]);

  return { trends, loading, error };
}

// ─── useRecordProgress ────────────────────────────────────────────────────────

interface UseRecordProgressResult {
  progress: ProgressData;
  loading: boolean;
  error: string | null;
}

export function useRecordProgress(event: string): UseRecordProgressResult {
  const [progress, setProgress] = useState<ProgressData>({
    gapData: [],
    milestones: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    recordsService
      .getProgress(event)
      .then((data) => {
        if (!cancelled)
          setProgress(data ?? { gapData: [], milestones: [] });
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [event]);

  return { progress, loading, error };
}

// ─── useRecordStories ─────────────────────────────────────────────────────────

interface UseRecordStoriesResult {
  stories: StoryEntry[];
  loading: boolean;
  error: string | null;
}

export function useRecordStories(): UseRecordStoriesResult {
  const [stories, setStories] = useState<StoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    recordsService
      .getStories()
      .then((data) => {
        if (!cancelled) setStories(data ?? []);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { stories, loading, error };
}
