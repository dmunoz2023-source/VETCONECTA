import { api } from './axios';
import { getClient, listClients } from './clients.api';
import type { Pet, PetFormValues, PetsQuery, PetsResult } from '../types/pet.types';

/** Cuerpo de POST /v1/pets y PATCH /v1/pets/{id} (F1). La edad nunca se envía (BR-2). */
type PetPayload = Omit<Pet, 'id' | 'active' | 'age' | 'photoUrl' | 'client'>;

/** Los campos opcionales vacíos se envían como null. */
function toPayload(values: PetFormValues): PetPayload {
  const optional = (value: string) => value.trim() || null;
  return {
    clientId: values.clientId,
    name: values.name.trim(),
    species: values.species,
    breed: optional(values.breed),
    sex: optional(values.sex),
    birthDate: optional(values.birthDate),
    color: optional(values.color),
    microchip: optional(values.microchip),
  };
}

/**
 * Listado de pacientes (FR-5, UC-05). El diseño no tiene GET /v1/pets, así que se buscan
 * los dueños con GET /v1/clients?q= y se piden sus mascotas con GET /v1/clients/{id}.
 * La búsqueda es por nombre o RUT del dueño, y `total` cuenta dueños, no mascotas.
 */
export async function listPets(query: PetsQuery): Promise<PetsResult> {
  const { clients, total } = await listClients(query);
  const details = await Promise.all(clients.map((client) => getClient(client.id)));

  const pets = details.flatMap(({ pets, id, rut, firstName, lastName }) =>
    pets.map((pet) => ({ ...pet, client: { id, rut, firstName, lastName } })),
  );
  return { pets, total };
}

/** GET /v1/pets/{id}: ficha con la edad calculada (FR-2, BR-2). */
export async function getPet(id: string): Promise<Pet> {
  const { data } = await api.get<Pet>(`/v1/pets/${id}`);
  return data;
}

/** POST /v1/pets: crea la mascota asociada a un cliente existente (FR-5, BR-1). */
export async function createPet(values: PetFormValues): Promise<Pet> {
  const { data } = await api.post<Pet>('/v1/pets', toPayload(values));
  return data;
}

/** PATCH /v1/pets/{id} (FR-5). */
export async function updatePet(id: string, values: PetFormValues): Promise<Pet> {
  const { data } = await api.patch<Pet>(`/v1/pets/${id}`, toPayload(values));
  return data;
}

/** DELETE /v1/pets/{id}: baja lógica (`active = false`); el historial clínico se conserva (BR-9). */
export async function deactivatePet(id: string): Promise<void> {
  await api.delete(`/v1/pets/${id}`);
}
