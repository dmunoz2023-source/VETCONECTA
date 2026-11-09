import type { Pet } from "./pet.types";

/** Client as returned by clients-pets-service (`clients_pets.clients` entity). */
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

/** GET /v1/clients/{id}: client file with their active pets (FR-5). */
export interface ClientDetail extends Client {
  pets: Pet[];
}

/** Fields filled in by the create and edit form. */
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
