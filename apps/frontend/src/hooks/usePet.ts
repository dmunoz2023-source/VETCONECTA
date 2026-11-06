import { useCallback } from "react";
import { getOwner } from "../api/clients.api";
import { deactivatePet, getPet } from "../api/pets.api";
import type { Pet } from "../types/pet.types";
import { useAsync } from "./useAsync";

/** GET /v1/pets/{id} no trae el dueño, así que se pide aparte con GET /v1/clients/{id}. */
async function loadPetWithOwner(id: string): Promise<Pet> {
  const pet = await getPet(id);
  return { ...pet, client: await getOwner(pet.clientId) };
}

/** Ficha de una mascota con su dueño y su baja lógica (DELETE /v1/pets/{id}). */
export function usePet(id: string) {
  const load = useCallback(() => loadPetWithOwner(id), [id]);
  const { data: pet, error, loading } = useAsync(load, "No se pudo cargar la ficha del paciente.");

  /** Desactiva la mascota. Si la API falla, la promesa se rechaza para que la pantalla muestre el error. */
  const deactivate = useCallback(() => deactivatePet(id), [id]);

  return { pet, error, loading, deactivate };
}
