// =============================================================================
// src/hooks/useAsync.ts
// Minimal async-data hook: runs a promise-returning function, tracks
// loading/error/value, and exposes reload(). Guards against setting state after
// unmount. Used by pages to load IndexedDB data.
// =============================================================================

import { useCallback, useEffect, useRef, useState } from "react";

export interface AsyncState<T> {
  loading: boolean;
  error: Error | null;
  value: T | null;
  reload: () => void;
}

export function useAsync<T>(fn: () => Promise<T>, deps: unknown[] = []): AsyncState<T> {
  const [value, setValue] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [nonce, setNonce] = useState<number>(0);
  const mounted = useRef<boolean>(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  // fn is intentionally excluded from deps; callers pass a stable dep list.
  const run = useCallback(fn, deps); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setLoading(true);
    setError(null);
    run()
      .then((result) => {
        if (mounted.current) {
          setValue(result);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (mounted.current) {
          setError(err instanceof Error ? err : new Error(String(err)));
          setLoading(false);
        }
      });
  }, [run, nonce]);

  const reload = useCallback(() => setNonce((n) => n + 1), []);

  return { loading, error, value, reload };
}
