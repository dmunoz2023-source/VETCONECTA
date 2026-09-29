import { api } from './axios';
import type { PaginatedResponse } from '../types/api.types';
import type {
  Client,
  ClientListParams,
  CreateClientPayload,
  UpdateClientPayload,
} from '../types/client.types';

/** Prefijo que el Gateway enruta a clients-pets-service (:3002). */
const CLIENTS_URL = '/v1/clients';

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 20;

/**
 * GET /v1/clients?q=&page=&limit=
 * Lista y busca clientes por RUT, nombre o teléfono, con paginación (FR-5).
 */
export async function listClients(
  params: ClientListParams = {},
): Promise<PaginatedResponse<Client>> {
  const q = params.q?.trim();
  const { data } = await api.get<PaginatedResponse<Client>>(CLIENTS_URL, {
    params: {
      // Si la búsqueda está vacía no se envía el parámetro q.
      ...(q ? { q } : {}),
      page: params.page ?? DEFAULT_PAGE,
      limit: params.limit ?? DEFAULT_LIMIT,
    },
  });
  return data;
}

/** GET /v1/clients/{id} — ficha de un cliente. */
export async function getClient(id: string): Promise<Client> {
  const { data } = await api.get<Client>(`${CLIENTS_URL}/${encodeURIComponent(id)}`);
  return data;
}

/**
 * POST /v1/clients — crea un cliente.
 * Si el RUT ya existe, el backend responde 409 (UC-05 A1).
 */
export async function createClient(payload: CreateClientPayload): Promise<Client> {
  const { data } = await api.post<Client>(CLIENTS_URL, payload);
  return data;
}

/** PATCH /v1/clients/{id} — actualiza solo los campos enviados. */
export async function updateClient(
  id: string,
  payload: UpdateClientPayload,
): Promise<Client> {
  const { data } = await api.patch<Client>(
    `${CLIENTS_URL}/${encodeURIComponent(id)}`,
    payload,
  );
  return data;
}