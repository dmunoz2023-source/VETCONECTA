import { useEffect, useState } from "react";
import type { ClientsQuery, ClientsResult } from "../types/client.types";
import { CLIENTS_MOCK } from "../mocks/clients.mock";
import { paginate } from "../utils/pagination";
import { matchesSearch } from "../utils/search";

const EMPTY_RESULT: ClientsResult = { clients: [], total: 0 };

interface RequestState {
  key: string;
  result: ClientsResult;
  error: string | null;
}

/**
 * Listado de clientes con búsqueda y paginación.
 * Hoy simula la petición con una Promise sobre datos mock.
 */
export function useClients({ search, page, pageSize }: ClientsQuery) {
  const queryKey = `${search}|${page}|${pageSize}`;
  const [state, setState] = useState<RequestState>({ key: "", result: EMPTY_RESULT, error: null });

  useEffect(() => {
    let cancelled = false;

    // ------------------------------------------------------------------
    // TODO (API real) — reemplazar este bloque cuando exista el cliente HTTP:
    //
    //   const request = api
    //     .get<{ data: Client[]; meta: { total: number; page: number } }>("/v1/clients", {
    //       params: { q: search, page, pageSize },
    //     })
    //     .then((res) => ({ clients: res.data.data, total: res.data.meta.total }));
    //
    // - Endpoint: GET /v1/clients?q= vía Gateway :3000 (roles reception, admin).
    // - Confirmar con backend los nombres de los parámetros de paginación.
    // - Al conectar la API, aplicar debounce (~300 ms) a `search` en la página.
    // ------------------------------------------------------------------
    const request = new Promise<ClientsResult>((resolve) =>
      setTimeout(() => {
        const filtered = CLIENTS_MOCK.filter((c) => matchesSearch([c.nombre, c.rut, c.telefono], search));
        resolve({ clients: paginate(filtered, page, pageSize), total: filtered.length });
      }, 200),
    );

    request
      .then((result) => {
        if (!cancelled) setState({ key: queryKey, result, error: null });
      })
      .catch(() => {
        if (!cancelled) {
          setState({ key: queryKey, result: EMPTY_RESULT, error: "No se pudieron cargar los clientes." });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [search, page, pageSize, queryKey]);

  return {
    clients: state.result.clients,
    total: state.result.total,
    loading: state.key !== queryKey,
    error: state.error,
  };
}
