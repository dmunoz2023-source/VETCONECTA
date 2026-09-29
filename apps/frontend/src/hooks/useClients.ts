import { useCallback, useEffect, useState } from 'react';
import { DEFAULT_LIMIT, DEFAULT_PAGE, listClients } from '../api/clients.api';
import { toApiError } from '../api/errors';
import type { ApiError, PaginationMeta } from '../types/api.types';
import type { Client } from '../types/client.types';

/** Espera tras la última tecla antes de consultar a la API. */
const SEARCH_DEBOUNCE_MS = 400;

interface ClientsResult {
  /** Identifica la consulta que produjo este resultado. */
  key: string;
  clients: Client[];
  meta: PaginationMeta | null;
  error: ApiError | null;
}

export interface UseClientsResult {
  clients: Client[];
  meta: PaginationMeta | null;
  totalPages: number;
  page: number;
  /** Texto tal como lo escribe el usuario en el buscador. */
  search: string;
  loading: boolean;
  error: ApiError | null;
  /** true cuando la consulta terminó bien pero no trajo registros. */
  isEmpty: boolean;
  setSearch: (value: string) => void;
  setPage: (page: number) => void;
  /** Vuelve a pedir la página actual (p. ej. después de crear o editar). */
  reload: () => void;
}

/**
 * Lista, busca (por RUT, nombre o teléfono) y pagina clientes de GET /v1/clients.
 * Maneja los estados de carga, error y vacío que exige el estándar del panel.
 */
export function useClients(limit: number = DEFAULT_LIMIT): UseClientsResult {
  const [search, setSearchValue] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPageValue] = useState(DEFAULT_PAGE);
  const [reloadCount, setReloadCount] = useState(0);
  const [result, setResult] = useState<ClientsResult | null>(null);

  const requestKey = `${query}|${page}|${limit}|${reloadCount}`;

  // Debounce: aplica la búsqueda cuando el usuario deja de escribir
  // y vuelve a la primera página.
  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery(search.trim());
      setPageValue(DEFAULT_PAGE);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [search]);

  // Pide los datos cada vez que cambia la búsqueda, la página o se recarga.
  useEffect(() => {
    let ignore = false; // evita pisar el estado con respuestas viejas

    listClients({ q: query, page, limit })
      .then((response) => {
        if (!ignore) {
          setResult({ key: requestKey, clients: response.data, meta: response.meta, error: null });
        }
      })
      .catch((err: unknown) => {
        if (!ignore) {
          setResult({ key: requestKey, clients: [], meta: null, error: toApiError(err) });
        }
      });

    return () => {
      ignore = true;
    };
  }, [query, page, limit, requestKey]);

  const loading = result?.key !== requestKey;
  const clients = result?.clients ?? [];
  const meta = result?.meta ?? null;
  const error = loading ? null : (result?.error ?? null);
  const totalPages = meta ? Math.max(1, Math.ceil(meta.total / meta.limit)) : 1;

  const setSearch = useCallback((value: string) => {
    setSearchValue(value);
  }, []);

  const setPage = useCallback((next: number) => {
    setPageValue(Math.max(DEFAULT_PAGE, next));
  }, []);

  const reload = useCallback(() => {
    setReloadCount((count) => count + 1);
  }, []);

  return {
    clients,
    meta,
    totalPages,
    page,
    search,
    loading,
    error,
    isEmpty: !loading && !error && clients.length === 0,
    setSearch,
    setPage,
    reload,
  };
}