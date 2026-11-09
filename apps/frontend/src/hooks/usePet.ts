import { useCallback } from "react";
import { getOwner } from "../api/clients.api";
import { deactivatePet, getPet } from "../api/pets.api";
import type { Pet } from "../types/pet.types";
import { useAsync } from "./useAsync";

/** GET /v1/pets/{id} does not include the owner, so it is requested separately with GET /v1/clients/{id}. */
async function loadPetWithOwner(id: string): Promise<Pet> {
  const pet = await getPet(id);
  return { ...pet, client: await getOwner(pet.clientId) };
}

/** A pet's file with its owner and its soft delete (DELETE /v1/pets/{id}). */
export function usePet(id: string) {
  const load = useCallback(() => loadPetWithOwner(id), [id]);
  const { data: pet, error, loading } = useAsync(load, "No se pudo cargar la ficha del paciente.");

  /** Deactivates the pet. If the API fails, the promise rejects so the screen shows the error. */
  const deactivate = useCallback(() => deactivatePet(id), [id]);

  return { pet, error, loading, deactivate };
}
