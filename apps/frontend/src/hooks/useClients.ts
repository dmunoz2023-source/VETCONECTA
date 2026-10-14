import { useCallback, useEffect, useState } from "react";
import type { ClientFormValues, ClientsQuery, ClientsResult } from "../types/client.types";
import { getErrorMessage } from "../api/axios";
import { createClient, deleteClient, listClients, updateClient } from "../api/clients.api";

const EMPTY_RESULT: ClientsResult = { clients: [], total: 0 };

interface RequestState {
  key: string;
  result: ClientsResult;
  error: string | null;
}

/**
 * Listado de clientes con búsqueda y paginación, más alta, edición y baja.
 * Consume /v1/clients a través del API Gateway; tras cada cambio vuelve a pedir el listado.
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

  const reload = useCallback(() => setReloadCount((count) => count + 1), []);

  /** Crea un cliente (sin `id`) o edita uno existente (con `id`). Si la API falla, la promesa se rechaza. */
  const saveClient = useCallback(
    async (values: ClientFormValues, id?: string) => {
      if (id) await updateClient(id, values);
      else await createClient(values);
      reload();
    },
    [reload],
  );

  /** Da de baja al cliente. Si la API falla, la promesa se rechaza. */
  const removeClient = useCallback(
    async (id: string) => {
      await deleteClient(id);
      reload();
    },
    [reload],
  );

  return {
    clients: state.result.clients,
    total: state.result.total,
    loading: state.key !== queryKey,
    error: state.error,
    saveClient,
    removeClient,
  };
}
