import { useCallback } from "react";
import { useAsync } from "./useAsync";

export interface PageQuery {
  search: string;
  page: number;
  pageSize: number;
}

/**
 * Pide una página de resultados cada vez que cambian la búsqueda o la página,
 * y expone `reload` para volver a pedirla tras un cambio.
 * `fetchPage` debe ser estable (una función del módulo api/, no una creada en cada render).
 */
export function usePagedRequest<R>(
  fetchPage: (query: PageQuery) => Promise<R>,
  { search, page, pageSize }: PageQuery,
  emptyResult: R,
  errorMessage: string,
) {
  const load = useCallback(() => fetchPage({ search, page, pageSize }), [fetchPage, search, page, pageSize]);
  const { data, loading, error, reload } = useAsync(load, errorMessage);

  return { result: data ?? emptyResult, loading, error, reload };
}
