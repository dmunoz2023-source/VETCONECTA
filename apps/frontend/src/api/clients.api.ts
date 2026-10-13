import { api } from './axios';
import type { Client, ClientFormValues, ClientsQuery, ClientsResult } from '../types/client.types';

/** Respuesta paginada común: { data, meta: { total, page, limit } } (Diseño §3.4). */
interface ClientsPageDto {
  data: Client[];
  meta: { total: number; page: number; limit: number };
}

/**
 * Cuerpo de POST/PATCH /v1/clients (NewClientDataDTO).
 * TODO: `userId` es obligatorio en el DTO de alta; confirmar con backend cómo se asigna al crear desde el panel.
 */
type ClientPayload = Omit<Client, 'id' | 'active'>;

/** Los campos opcionales vacíos se envían como null. */
function toPayload(values: ClientFormValues): ClientPayload {
  const optional = (value: string) => value.trim() || null;
  return {
    rut: values.rut.trim(),
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    email: values.email.trim(),
    phone: optional(values.phone),
    address: optional(values.address),
    district: optional(values.district),
  };
}

/** GET /v1/clients?q=&page=&limit= (FR-5). */
export async function listClients({ search, page, pageSize }: ClientsQuery): Promise<ClientsResult> {
  const { data } = await api.get<ClientsPageDto>('/v1/clients', {
    params: { q: search || undefined, page, limit: pageSize },
  });
  return { clients: data.data, total: data.meta.total };
}

/** POST /v1/clients (FR-5). */
export async function createClient(values: ClientFormValues): Promise<void> {
  await api.post('/v1/clients', toPayload(values));
}

/** PATCH /v1/clients/{id} (FR-5). */
export async function updateClient(id: string, values: ClientFormValues): Promise<void> {
  await api.patch(`/v1/clients/${id}`, toPayload(values));
}

/** DELETE /v1/clients/{id}: baja lógica (`active = false`), nunca borrado físico. */
export async function deleteClient(id: string): Promise<void> {
  await api.delete(`/v1/clients/${id}`);
}
