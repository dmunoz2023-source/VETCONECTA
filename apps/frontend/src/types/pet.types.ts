/** Especies admitidas. Se guardan en inglés en `clients_pets.pets.species` (ver infra/db/02-seed.sql). */
export type PetSpecies = "dog" | "cat" | "other";

export type PetSex = "male" | "female";

/** Edad calculada por clients-pets-service a partir de `birthDate` (BR-2: no se almacena). */
export interface PetAge {
  years: number;
  months: number;
  displayAge: string;
}

/** Dueño resumido que acompaña a la mascota en el listado y en la ficha. */
export interface PetOwner {
  id: string;
  rut: string;
  firstName: string;
  lastName: string;
}

/** Mascota tal como la devuelve GET /v1/pets/{id} (entidad `clients_pets.pets` + edad calculada). */
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
  /** Datos del dueño; el listado y la ficha los incluyen para no hacer una segunda llamada. */
  client?: PetOwner;
}

/** Campos que llena el formulario de alta y edición (BR-1: `clientId` es obligatorio). */
export interface PetFormValues {
  clientId: string;
  name: string;
  species: string;
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
