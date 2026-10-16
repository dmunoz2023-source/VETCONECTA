import { useCallback, useEffect, useState } from "react";
import { getErrorMessage } from "../api/axios";

interface AsyncState<T> {
  /** Carga que produjo este estado; si no coincide con la actual, hay una carga en curso. */
  load: (() => Promise<T>) | null;
  version: number;
  data: T | null;
  error: string | null;
}

/**
 * Ejecuta `load` al montar, cada vez que cambia y cuando se llama a `reload`;
 * descarta respuestas de cargas anteriores. `load` debe venir de `useCallback`
 * con sus dependencias, así solo se vuelve a pedir cuando cambian.
 * Mientras llega una nueva respuesta, `data` conserva el último resultado (las tablas no parpadean).
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
