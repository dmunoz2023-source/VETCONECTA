import { api } from './http/client';
import { blankToNull } from './http/payload';
import type { Client, ClientDetail, ClientFormValues, ClientsQuery, ClientsResult } from '../types/client.types';
import type { PetOwner } from '../types/pet.types';

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

function toPayload(values: ClientFormValues): ClientPayload {
  return {
    rut: values.rut.trim(),
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    email: values.email.trim(),
    phone: blankToNull(values.phone),
    address: blankToNull(values.address),
    district: blankToNull(values.district),
  };
}

/** GET /v1/clients?q=&page=&limit= (FR-5). */
export async function listClients({ search, page, pageSize }: ClientsQuery): Promise<ClientsResult> {
  const { data } = await api.get<ClientsPageDto>('/v1/clients', {
    params: { q: search || undefined, page, limit: pageSize },
  });
  return { clients: data.data, total: data.meta.total };
}

/** GET /v1/clients/{id}: ficha del cliente con sus mascotas (FR-5). */
export async function getClient(id: string): Promise<ClientDetail> {
  const { data } = await api.get<ClientDetail>(`/v1/clients/${id}`);
  return data;
}

/** Dueño resumido de una mascota, desde GET /v1/clients/{id}: GET /v1/pets/{id} no lo incluye. */
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

/** DELETE /v1/clients/{id}: baja lógica (`active = false`), nunca borrado físico. */
export async function deleteClient(id: string): Promise<void> {
  await api.delete(`/v1/clients/${id}`);
}
