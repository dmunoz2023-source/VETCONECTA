import { useCallback } from "react";
import { getOwner } from "../api/clients.api";
import { getPet } from "../api/pets.api";
import type { PetFormValues, PetOwner } from "../types/pet.types";
import { SPECIES_OPTIONS } from "../utils/petLabels";
import { useAsync } from "./useAsync";

export const EMPTY_PET_FORM: PetFormValues = {
  clientId: "",
  name: "",
  species: "",
  otherSpecies: "",
  breed: "",
  sex: "",
  birthDate: "",
  color: "",
  microchip: "",
};

/** Species with their own card in the form; any other value is a free-text species. */
const KNOWN_SPECIES: string[] = SPECIES_OPTIONS.map((option) => option.value).filter((value) => value !== "other");

interface PetFormData {
  initialValues: PetFormValues;
  initialOwner: PetOwner | null;
}

async function loadFormData(petId?: string, presetClientId?: string): Promise<PetFormData> {
  if (petId) {
    const pet = await getPet(petId);
    return {
      initialValues: {
        clientId: pet.clientId,
        name: pet.name,
        // A species that is not one of the listed ones was typed by hand: show it under "Otro".
        species: KNOWN_SPECIES.includes(pet.species) ? pet.species : "other",
        otherSpecies: KNOWN_SPECIES.includes(pet.species) || pet.species === "other" ? "" : pet.species,
        breed: pet.breed ?? "",
        sex: pet.sex ?? "",
        birthDate: pet.birthDate ?? "",
        color: pet.color ?? "",
        microchip: pet.microchip ?? "",
      },
      initialOwner: await getOwner(pet.clientId),
    };
  }
  if (presetClientId) {
    const owner = await getOwner(presetClientId);
    return { initialValues: { ...EMPTY_PET_FORM, clientId: owner.id }, initialOwner: owner };
  }
  return { initialValues: EMPTY_PET_FORM, initialOwner: null };
}

/**
 * Initial data of the pet form:
 * - edit (`petId`): the pet and its owner;
 * - create from a client's file (`presetClientId`): the owner already chosen (UC-05, step 2);
 * - create without owner: empty form.
 */
export function usePetFormData(petId?: string, presetClientId?: string) {
  const load = useCallback(() => loadFormData(petId, presetClientId), [petId, presetClientId]);
  const { data, error, loading } = useAsync(load, "No se pudieron cargar los datos de la mascota.");
  return { data, error, loading };
}
