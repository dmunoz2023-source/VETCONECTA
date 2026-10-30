import { useCallback, useEffect, useState } from "react";
import { getErrorMessage } from "../api/axios";

export interface PageQuery {
  search: string;
  page: number;
  pageSize: number;
}

interface RequestState<R> {
  key: string;
  result: R;
  error: string | null;
}

/**
 * Pide una página de resultados cada vez que cambian la búsqueda o la página,
 * descarta respuestas de consultas anteriores y expone `reload` para volver a pedirla.
 * `fetchPage` debe ser estable (una función del módulo api/, no una creada en cada render).
 */
export function usePagedRequest<R>(
  fetchPage: (query: PageQuery) => Promise<R>,
  { search, page, pageSize }: PageQuery,
  emptyResult: R,
  errorMessage: string,
) {
  const [reloadCount, setReloadCount] = useState(0);
  const queryKey = `${search}|${page}|${pageSize}|${reloadCount}`;
  const [state, setState] = useState<RequestState<R>>({ key: "", result: emptyResult, error: null });

  useEffect(() => {
    let cancelled = false;

    fetchPage({ search, page, pageSize })
      .then((result) => {
        if (!cancelled) setState({ key: queryKey, result, error: null });
      })
      .catch((err: unknown) => {
        if (!cancelled) setState({ key: queryKey, result: emptyResult, error: getErrorMessage(err, errorMessage) });
      });

    return () => {
      cancelled = true;
    };
  }, [fetchPage, search, page, pageSize, queryKey, emptyResult, errorMessage]);

  const reload = useCallback(() => setReloadCount((count) => count + 1), []);

  return { result: state.result, loading: state.key !== queryKey, error: state.error, reload };
}
