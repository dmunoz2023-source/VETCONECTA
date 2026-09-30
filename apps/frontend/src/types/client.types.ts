export interface Client {
  first_name: string;
  last_name: string;
  rut: string;
  phone: string;
  email : string;
  pets: number;
  address?: string;
  district?: string;
}

export type ClientFormValues = Pick<Client, "first_name" | "last_name" | "rut" | "phone" | "email" | "address" | "district">;

export interface ClientsQuery {
  search: string;
  page: number;
  pageSize: number;
}

export interface ClientsResult {
  clients: Client[];
  total: number;
}
