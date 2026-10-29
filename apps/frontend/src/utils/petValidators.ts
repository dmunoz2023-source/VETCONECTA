import type { PetFormValues } from "../types/pet.types";
import { parseDateOnly } from "./age";

export type PetFormErrors = Partial<Record<keyof PetFormValues, string>>;

/**
 * Mismas reglas que CrearMascotaDto / ActualizarMascotaDto (F1): nombre, especie,
 * sexo, fecha de nacimiento y dueño obligatorios; la fecha no puede ser futura.
 * Raza, color y microchip son opcionales. Devuelve un objeto vacío si todo es válido.
 */
export function validatePetForm(values: PetFormValues, today: Date = new Date()): PetFormErrors {
  const errors: PetFormErrors = {};

  if (!values.clientId) errors.clientId = "Selecciona el dueño de la mascota.";
  if (!values.name.trim()) errors.name = "Ingresa el nombre de la mascota.";
  if (!values.species) errors.species = "Selecciona la especie.";
  // Se eliminó la validación estricta de raza (puede quedar en blanco)
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