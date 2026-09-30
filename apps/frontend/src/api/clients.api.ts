import { api } from './axios';
import type { Client, ClientsQuery, ClientsResult } from '../types/client.types';

/** Cliente tal como lo devuelve clients-pets-service (Diseño §5, tabla `clients`). */
interface ClientDto {
  id: string;
  rut: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string | null;
}

/** Respuesta paginada común: { data, meta: { total, page, limit } } (Diseño §3.4). */
interface ClientsPageDto {
  data: ClientDto[];
  meta: { total: number; page: number; limit: number };
}

function toClient(dto: ClientDto): Client {
  return {
    id: dto.id,
    nombre: `${dto.nombres} ${dto.apellidos}`.trim(),
    rut: dto.rut,
    telefono: dto.telefono ?? '',
    correo: dto.email,
    // TODO: el listado no informa las mascotas del cliente; confirmar con backend.
    mascotas: 0,
  };
}

/** GET /v1/clients?q=&page=&limit= (FR-5). */
export async function listClients({ search, page, pageSize }: ClientsQuery): Promise<ClientsResult> {
  const { data } = await api.get<ClientsPageDto>('/v1/clients', {
    params: { q: search || undefined, page, limit: pageSize },
  });
  return { clients: data.data.map(toClient), total: data.meta.total };
}