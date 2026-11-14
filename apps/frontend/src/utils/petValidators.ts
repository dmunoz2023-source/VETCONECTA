import type { PetFormValues } from "../types/pet.types";
import { parseDateOnly } from "./age";

export type PetFormErrors = Partial<Record<keyof PetFormValues, string>>;

const MAX_SPECIES_LENGTH = 50;

/**
 * Same rules as CrearMascotaDto / ActualizarMascotaDto (F1): name, species,
 * breed, sex, birth date and owner are required; the date cannot be in the future.
 * Color and microchip are optional. Returns an empty object when everything is valid.
 */
export function validatePetForm(values: PetFormValues, today: Date = new Date()): PetFormErrors {
  const errors: PetFormErrors = {};

  if (!values.clientId) errors.clientId = "Selecciona el dueño de la mascota.";
  if (!values.name.trim()) errors.name = "Ingresa el nombre de la mascota.";
  if (!values.species) errors.species = "Selecciona la especie.";
  else if (values.species === "other") {
    if (!values.otherSpecies.trim()) errors.otherSpecies = "Escribe qué especie es.";
    else if (values.otherSpecies.trim().length > MAX_SPECIES_LENGTH) errors.otherSpecies = `Máximo ${MAX_SPECIES_LENGTH} caracteres.`;
  }
  if (!values.breed.trim()) errors.breed = "Ingresa la raza.";
  if (!values.sex) errors.sex = "Selecciona el sexo.";

  if (!values.birthDate) {
    errors.birthDate = "Ingresa la fecha de nacimiento.";
  } else {
    const birth = parseDateOnly(values.birthDate);
    if (!birth) errors.birthDate = "Ingresa una fecha válida.";
    else if (birth > today) errors.birthDate = "La fecha de nacimiento no puede ser futura.";
  }

  return errors;
}
