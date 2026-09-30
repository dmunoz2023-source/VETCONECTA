import { api } from './axios';
import type { Client, ClientFormValues, ClientsQuery, ClientsResult } from '../types/client.types';

/** Columnas de `clients_pets.clients` tal como las devuelve clients-pets-service (script 01-tables.sql). */
interface ClientDto {
  rut: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  address: string | null;
  district: string | null;
  active: boolean;
}

/**
 * Cuerpo de POST/PATCH /v1/clients: columnas que llena el formulario.
 * TODO: `user_id` es NOT NULL en la tabla; confirmar con backend cómo se asigna al crear desde el panel.
 */
type ClientPayload = Pick<ClientDto, 'rut' | 'first_name' | 'last_name' | 'email' | 'phone'>;

/** Respuesta paginada común: { data, meta: { total, page, limit } } (Diseño §3.4). */
interface ClientsPageDto {
  data: ClientDto[];
  meta: { total: number; page: number; limit: number };
}

function toClient(dto: ClientDto): Client {
  return {
    first_name: dto.first_name,
    last_name: dto.last_name,
    rut: dto.rut,
    phone: dto.phone ?? '',
    email: dto.email,
    // TODO: el listado no informa las mascotas del cliente; confirmar con backend.
    pets: 0,
  };
}



function toPayload(values: ClientFormValues): ClientPayload {
  return {
    rut: values.rut.trim(),
    first_name: values.first_name.trim(),
    last_name: values.last_name.trim(),
    email: values.email.trim(),
    phone: values.phone.trim(),
  };
}

/** GET /v1/clients?q=&page=&limit= (FR-5). */
export async function listClients({ search, page, pageSize }: ClientsQuery): Promise<ClientsResult> {
  const { data } = await api.get<ClientsPageDto>('/v1/clients', {
    params: { q: search || undefined, page, limit: pageSize },
  });
  return { clients: data.data.map(toClient), total: data.meta.total };
}

/**
 * POST /v1/clients (crear) o PATCH /v1/clients/{...} (editar) (FR-5).

 */
export async function saveClient(values: ClientFormValues, id?: string): Promise<void> {
  const payload = toPayload(values);
  if (id) {
    await api.patch(`/v1/clients/${id}`, payload);
  } else {
    await api.post('/v1/clients', payload);
  }
}

export async function deleteClient(id: string): Promise<void> {
  // TODO: DELETE /v1/clients/{id} (baja lógica); el endpoint no está en la documentación.
  void id;
}