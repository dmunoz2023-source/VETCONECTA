/** Supported species. Stored in English in `clients_pets.pets.species` (see infra/db/02-seed.sql). */
export type PetSpecies = "dog" | "cat" | "rabbit" | "bird" | "rodent" | "reptile" | "other";

export type PetSex = "male" | "female";

/** Age calculated by clients-pets-service from `birthDate` (BR-2: it is not stored). */
export interface PetAge {
  years: number;
  months: number;
  displayAge: string;
}

/** Short owner that comes with the pet in the list and the file. */
export interface PetOwner {
  id: string;
  rut: string;
  firstName: string;
  lastName: string;
}

/** Pet as returned by GET /v1/pets/{id} (`clients_pets.pets` entity + calculated age). */
export interface Pet {
  id: string;
  clientId: string;
  name: string;
  species: string;
  breed: string | null;
  sex: string | null;
  birthDate: string | null;
  color: string | null;
  microchip: string | null;
  photoUrl: string | null;
  active: boolean;
  age: PetAge | null;
  /** Owner data; the list and the file include it to avoid a second call. */
  client?: PetOwner;
}

/** Fields filled in by the create and edit form (BR-1: `clientId` is required). */
export interface PetFormValues {
  clientId: string;
  name: string;
  /** A listed species ("dog", "cat", "rabbit"...) or "other"; with "other" the real species is written in `otherSpecies`. */
  species: string;
  /** Free-text species, only used when `species` is "other" (the backend accepts any text). */
  otherSpecies: string;
  breed: string;
  sex: string;
  birthDate: string;
  color: string;
  microchip: string;
}

export interface PetsQuery {
  search: string;
  page: number;
  pageSize: number;
}

export interface PetsResult {
  pets: Pet[];
  total: number;
}
