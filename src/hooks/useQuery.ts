import { useEffect, useState, useCallback } from 'react';

interface UseQueryResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useQuery<T>(
  fetcher: () => Promise<T>,
  deps: unknown[] = [],
): UseQueryResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refetchCount, setRefetchCount] = useState(0);

  const refetch = useCallback(() => setRefetchCount((c) => c + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetcher()
      .then((result) => {
        if (!cancelled) {
          setData(result);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load data');
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, refetchCount]);

  return { data, loading, error, refetch };
}
