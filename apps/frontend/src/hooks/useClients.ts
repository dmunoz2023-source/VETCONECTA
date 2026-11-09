import { useCallback } from "react";
import type { ClientFormValues, ClientsQuery, ClientsResult } from "../types/client.types";
import { createClient, deleteClient, listClients, updateClient } from "../api/clients.api";
import { usePagedRequest } from "./usePagedRequest";

const EMPTY_RESULT: ClientsResult = { clients: [], total: 0 };

/**
 * Client list with search and pagination, plus create, edit and delete.
 * Uses /v1/clients through the API Gateway; after each change it requests the list again.
 */
export function useClients(query: ClientsQuery) {
  const { result, loading, error, reload } = usePagedRequest(
    listClients,
    query,
    EMPTY_RESULT,
    "No se pudieron cargar los clientes.",
  );

  /** Creates a client (no `id`) or edits an existing one (with `id`). If the API fails, the promise rejects. */
  const saveClient = useCallback(
    async (values: ClientFormValues, id?: string) => {
      if (id) await updateClient(id, values);
      else await createClient(values);
      reload();
    },
    [reload],
  );

  /** Deactivates the client. If the API fails, the promise rejects. */
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
