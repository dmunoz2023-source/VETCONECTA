export interface Client {
  nombre: string;
  rut: string;
  telefono: string;
  correo: string;
  mascotas: number;
}

export type ClientFormValues = Pick<Client, "nombre" | "rut" | "telefono" | "correo">;

export interface ClientsQuery {
  search: string;
  page: number;
  pageSize: number;
}

export interface ClientsResult {
  clients: Client[];
  total: number;
}
