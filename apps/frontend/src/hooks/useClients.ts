import { useEffect, useState } from "react";
import type { ClientsQuery, ClientsResult } from "../types/client.types";
import { getErrorMessage } from "../api/axios";
import { listClients } from "../api/clients.api";

const EMPTY_RESULT: ClientsResult = { clients: [], total: 0 };

interface RequestState {
  key: string;
  result: ClientsResult;
  error: string | null;
}

/**
 * Listado de clientes con búsqueda y paginación.
 * Consulta GET /v1/clients a través del API Gateway.
 */
export function useClients({ search, page, pageSize }: ClientsQuery) {
  const queryKey = `${search}|${page}|${pageSize}`;
  const [state, setState] = useState<RequestState>({ key: "", result: EMPTY_RESULT, error: null });

  useEffect(() => {
    let cancelled = false;

    listClients({ search, page, pageSize })
      .then((result) => {
        if (!cancelled) setState({ key: queryKey, result, error: null });
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const error = getErrorMessage(err, "No se pudieron cargar los clientes.");
          setState({ key: queryKey, result: EMPTY_RESULT, error });
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
