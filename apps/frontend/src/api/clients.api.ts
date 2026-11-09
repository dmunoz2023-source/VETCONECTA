import { api } from './axios';
import type { Client, ClientDetail, ClientFormValues, ClientsQuery, ClientsResult } from '../types/client.types';
import type { PetOwner } from '../types/pet.types';

/** Common paged response: { data, meta: { total, page, limit } } (Design §3.4). */
interface ClientsPageDto {
  data: Client[];
  meta: { total: number; page: number; limit: number };
}

/**
 * Cuerpo de POST/PATCH /v1/clients (NewClientDataDTO).
 * TODO: `userId` is required in the create DTO; confirm with the backend how it is assigned when creating from the panel.
 */
type ClientPayload = Omit<Client, 'id' | 'active'>;

/** Empty optional fields are sent as null. */
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

/** GET /v1/clients/{id}: client file with their pets (FR-5). */
export async function getClient(id: string): Promise<ClientDetail> {
  const { data } = await api.get<ClientDetail>(`/v1/clients/${id}`);
  return data;
}

/** Short owner of a pet, from GET /v1/clients/{id}: GET /v1/pets/{id} does not include it. */
export async function getOwner(id: string): Promise<PetOwner> {
  const { rut, firstName, lastName } = await getClient(id);
  return { id, rut, firstName, lastName };
}

/** POST /v1/clients (FR-5). */
export async function createClient(values: ClientFormValues): Promise<void> {
  await api.post('/v1/clients', toPayload(values));
}

/** PATCH /v1/clients/{id} (FR-5). */
export async function updateClient(id: string, values: ClientFormValues): Promise<void> {
  await api.patch(`/v1/clients/${id}`, toPayload(values));
}

/** DELETE /v1/clients/{id}: soft delete (`active = false`), never a physical delete. */
export async function deleteClient(id: string): Promise<void> {
  await api.delete(`/v1/clients/${id}`);
}
