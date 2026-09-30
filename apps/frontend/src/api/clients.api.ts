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
    nombre: `${dto.first_name} ${dto.last_name}`.trim(),
    rut: dto.rut,
    telefono: dto.phone ?? '',
    correo: dto.email,
    // TODO: el listado no informa las mascotas del cliente; confirmar con backend.
    mascotas: 0,
  };
}

/**
 * El formulario tiene un solo campo "nombre completo" y la tabla guarda `first_name` y `last_name`.
 * Regla provisional: los dos últimos términos son los apellidos y el resto es el nombre.
 */
function splitNombre(nombre: string): { first_name: string; last_name: string } {
  const words = nombre.trim().split(/\s+/);
  const cut = Math.max(1, words.length - 2);
  return { first_name: words.slice(0, cut).join(' '), last_name: words.slice(cut).join(' ') };
}

function toPayload(values: ClientFormValues): ClientPayload {
  return {
    rut: values.rut.trim(),
    ...splitNombre(values.nombre),
    email: values.correo.trim(),
    phone: values.telefono.trim(),
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
 * TODO: confirmar con el Scrum qué identifica al cliente en la URL de edición al no usar `id`.
 */
export async function saveClient(values: ClientFormValues, identifier?: string): Promise<void> {
  const payload = toPayload(values);
  if (identifier) {
    await api.patch(`/v1/clients/${identifier}`, payload);
  } else {
    await api.post('/v1/clients', payload);
  }
}
