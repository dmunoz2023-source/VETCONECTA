import { useCallback } from "react";
import type { ClientFormValues, ClientsQuery, ClientsResult } from "../types/client.types";
import { createClient, deleteClient, listClients, updateClient } from "../api/clients.api";
import { usePagedRequest } from "./usePagedRequest";

const EMPTY_RESULT: ClientsResult = { clients: [], total: 0 };

/**
 * Listado de clientes con búsqueda y paginación, más alta, edición y baja.
 * Consume /v1/clients a través del API Gateway; tras cada cambio vuelve a pedir el listado.
 */
export function useClients(query: ClientsQuery) {
  const { result, loading, error, reload } = usePagedRequest(
    listClients,
    query,
    EMPTY_RESULT,
    "No se pudieron cargar los clientes.",
  );

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
    clients: result.clients,
    total: result.total,
    loading,
    error,
    saveClient,
    removeClient,
  };
}
