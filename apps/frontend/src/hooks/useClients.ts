import { useCallback, useEffect, useState } from "react";
import type { ClientFormValues, ClientsQuery, ClientsResult } from "../types/client.types";
import { getErrorMessage } from "../api/axios";
import { listClients, saveClient as saveClientRequest } from "../api/clients.api";

const EMPTY_RESULT: ClientsResult = { clients: [], total: 0 };

interface RequestState {
  key: string;
  result: ClientsResult;
  error: string | null;
}

/**
 * Listado de clientes con búsqueda y paginación, más el guardado (alta y edición).
 * Consulta GET /v1/clients a través del API Gateway.
 */
export function useClients({ search, page, pageSize }: ClientsQuery) {
  const [reloadCount, setReloadCount] = useState(0);
  const queryKey = `${search}|${page}|${pageSize}|${reloadCount}`;
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

  /**
   * Crea un cliente (sin identificador) o edita uno existente (con identificador)
   * y vuelve a pedir el listado. Si la API responde con error, la promesa se
   * rechaza para que la página lo muestre.
   */
  const saveClient = useCallback(async (values: ClientFormValues, id?: string) => {
    await saveClientRequest(values, id);
    setReloadCount((count) => count + 1);
  }, []);

  return {
    clients: state.result.clients,
    total: state.result.total,
    loading: state.key !== queryKey,
    error: state.error,
    saveClient,
  };
}
