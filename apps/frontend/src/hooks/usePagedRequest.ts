import { useCallback } from "react";
import { useAsync } from "./useAsync";

export interface PageQuery {
  search: string;
  page: number;
  pageSize: number;
}

/**
 * Requests a page of results every time the search or the page changes,
 * and exposes `reload` to request it again after a change.
 * `fetchPage` must be stable (a function of the api/ module, not one created on every render).
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
