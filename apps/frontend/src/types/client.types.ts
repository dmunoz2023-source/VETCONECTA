/** Cliente tal como lo devuelve clients-pets-service (entidad `clients_pets.clients`). */
export interface Client {
  id: string;
  rut: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  address: string | null;
  district: string | null;
  active: boolean;
}

/** Campos que llena el formulario de alta y edición. */
export interface ClientFormValues {
  rut: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  district: string;
}

export interface ClientsQuery {
  search: string;
  page: number;
  pageSize: number;
}

export interface ClientsResult {
  clients: Client[];
  total: number;
}
