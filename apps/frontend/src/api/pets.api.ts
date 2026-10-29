import { api } from './axios';
import type { Pet, PetFormValues, PetsQuery, PetsResult } from '../types/pet.types';

/** Respuesta paginada común: { data, meta: { total, page, limit } } (Diseño §3.4). */
interface PetsPageDto {
  data: Pet[];
  meta: { total: number; page: number; limit: number };
}

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
 * GET /v1/pets?q=&page=&limit= (FR-5). Busca por nombre de la mascota o nombre/RUT del dueño.
 * TODO: endpoint pendiente en clients-pets-service (coordinar con F1).
 */
export async function listPets({ search, page, pageSize }: PetsQuery): Promise<PetsResult> {
  const { data } = await api.get<PetsPageDto>('/v1/pets', {
    params: { q: search || undefined, page, limit: pageSize },
  });
  return { pets: data.data, total: data.meta.total };
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
