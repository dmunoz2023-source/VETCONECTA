import { api } from './axios';
import { getClient, listClients } from './clients.api';
import type { Pet, PetFormValues, PetsQuery, PetsResult } from '../types/pet.types';

/** Body of POST /v1/pets and PATCH /v1/pets/{id} (F1). The age is never sent (BR-2). */
type PetPayload = Omit<Pet, 'id' | 'active' | 'age' | 'photoUrl' | 'client'>;

/** Empty optional fields are sent as null. */
function toPayload(values: PetFormValues): PetPayload {
  const optional = (value: string) => value.trim() || null;
  return {
    clientId: values.clientId,
    name: values.name.trim(),
    species: values.species === 'other' ? values.otherSpecies.trim() : values.species,
    breed: optional(values.breed),
    sex: optional(values.sex),
    birthDate: optional(values.birthDate),
    color: optional(values.color),
    microchip: optional(values.microchip),
  };
}

/**
 * Patient list (FR-5, UC-05). The design has no GET /v1/pets, so owners are searched with
 * GET /v1/clients?q= and their pets are requested with GET /v1/clients/{id}.
 * The search is by owner name or RUT, and `total` counts owners, not pets.
 */
export async function listPets(query: PetsQuery): Promise<PetsResult> {
  const { clients, total } = await listClients(query);
  const details = await Promise.all(clients.map((client) => getClient(client.id)));

  const pets = details.flatMap(({ pets, id, rut, firstName, lastName }) =>
    pets.map((pet) => ({ ...pet, client: { id, rut, firstName, lastName } })),
  );
  return { pets, total };
}

/** GET /v1/pets/{id}: file with the calculated age (FR-2, BR-2). */
export async function getPet(id: string): Promise<Pet> {
  const { data } = await api.get<Pet>(`/v1/pets/${id}`);
  return data;
}

/** POST /v1/pets: creates the pet linked to an existing client (FR-5, BR-1). */
export async function createPet(values: PetFormValues): Promise<Pet> {
  const { data } = await api.post<Pet>('/v1/pets', toPayload(values));
  return data;
}

/** PATCH /v1/pets/{id} (FR-5). */
export async function updatePet(id: string, values: PetFormValues): Promise<Pet> {
  const { data } = await api.patch<Pet>(`/v1/pets/${id}`, toPayload(values));
  return data;
}

/** DELETE /v1/pets/{id}: soft delete (`active = false`); the clinical record is kept (BR-9). */
export async function deactivatePet(id: string): Promise<void> {
  await api.delete(`/v1/pets/${id}`);
}
