import { useCallback, useEffect, useState } from "react";
import { getErrorMessage } from "../api/axios";

interface AsyncState<T> {
  /** Load that produced this state; if it differs from the current one, a load is in progress. */
  load: (() => Promise<T>) | null;
  version: number;
  data: T | null;
  error: string | null;
}

/**
 * Runs `load` on mount, every time it changes and when `reload` is called;
 * discards responses of earlier loads. `load` must come from `useCallback`
 * with its dependencies, so it is only requested again when they change.
 * While a new response arrives, `data` keeps the last result (tables do not flicker).
 */
export function useAsync<T>(load: () => Promise<T>, errorMessage: string) {
  const [version, setVersion] = useState(0);
  const [state, setState] = useState<AsyncState<T>>({ load: null, version: 0, data: null, error: null });

  useEffect(() => {
    let cancelled = false;

    load()
      .then((data) => {
        if (!cancelled) setState({ load, version, data, error: null });
      })
      .catch((err: unknown) => {
        if (!cancelled) setState({ load, version, data: null, error: getErrorMessage(err, errorMessage) });
      });

    return () => {
      cancelled = true;
    };
  }, [load, version, errorMessage]);

  const reload = useCallback(() => setVersion((v) => v + 1), []);

  return {
    data: state.data,
    error: state.error,
    loading: state.load !== load || state.version !== version,
    reload,
  };
}
