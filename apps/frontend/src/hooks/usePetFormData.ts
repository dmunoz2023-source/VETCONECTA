import { useCallback } from "react";
import { getClient } from "../api/clients.api";
import { getPet } from "../api/pets.api";
import type { PetFormValues, PetOwner } from "../types/pet.types";
import { useAsync } from "./useAsync";

export const EMPTY_PET_FORM: PetFormValues = {
  clientId: "",
  name: "",
  species: "",
  breed: "",
  sex: "",
  birthDate: "",
  color: "",
  microchip: "",
};

interface PetFormData {
  initialValues: PetFormValues;
  initialOwner: PetOwner | null;
}

async function loadOwner(clientId: string): Promise<PetOwner> {
  const { id, rut, firstName, lastName } = await getClient(clientId);
  return { id, rut, firstName, lastName };
}

async function loadFormData(petId?: string, presetClientId?: string): Promise<PetFormData> {
  if (petId) {
    const pet = await getPet(petId);
    return {
      initialValues: {
        clientId: pet.clientId,
        name: pet.name,
        species: pet.species,
        breed: pet.breed ?? "",
        sex: pet.sex ?? "",
        birthDate: pet.birthDate ?? "",
        color: pet.color ?? "",
        microchip: pet.microchip ?? "",
      },
      initialOwner: pet.client ?? (await loadOwner(pet.clientId)),
    };
  }
  if (presetClientId) {
    const owner = await loadOwner(presetClientId);
    return { initialValues: { ...EMPTY_PET_FORM, clientId: owner.id }, initialOwner: owner };
  }
  return { initialValues: EMPTY_PET_FORM, initialOwner: null };
}

/**
 * Datos iniciales del formulario de mascota:
 * - edición (`petId`): la mascota y su dueño;
 * - alta desde la ficha de un cliente (`presetClientId`): el dueño ya elegido (UC-05, paso 2);
 * - alta sin dueño: formulario vacío.
 */
export function usePetFormData(petId?: string, presetClientId?: string) {
  const load = useCallback(() => loadFormData(petId, presetClientId), [petId, presetClientId]);
  const { data, error, loading } = useAsync(load, "No se pudieron cargar los datos de la mascota.");
  return { data, error, loading };
}
