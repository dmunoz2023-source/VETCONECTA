export interface Client {
  id: string;
  rut: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string;
  direccion?: string;
  comuna?: string;
  activo: boolean;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
}

export interface Paginated<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface ListClientsParams {
  q?: string;
  page: number;
  limit: number;
}

export type CreateClientPayload = Omit<Client, 'id' | 'activo'>;
export type UpdateClientPayload = Partial<CreateClientPayload>;