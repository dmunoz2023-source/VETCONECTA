import type { ClinicalEventFormValues } from "../types/clinical.types";
import { parseDateOnly } from "./age";

export type ClinicalEventFormErrors = Partial<Record<keyof ClinicalEventFormValues, string>>;

/** Minimum weight accepted by CreateClinicalEventDto (`@Min(0.1)`). */
const MIN_WEIGHT_KG = 0.1;

/**
 * Same rules as CreateClinicalEventDto (F2): type, date (not in the future), weight (> 0)
 * and notes are required. The next checkup or next vaccine is optional but cannot be
 * earlier than the event. With no errors nothing is blocked; with errors nothing is sent (flow A1 of UC-06).
 */
export function validateClinicalEventForm(
  values: ClinicalEventFormValues,
  today: Date = new Date(),
): ClinicalEventFormErrors {
  const errors: ClinicalEventFormErrors = {};

  if (!values.type) errors.type = "Selecciona el tipo de evento.";

  const date = values.date ? parseDateOnly(values.date) : null;
  if (!values.date) errors.date = "Ingresa la fecha del evento.";
  else if (!date) errors.date = "Ingresa una fecha válida.";
  else if (date > today) errors.date = "La fecha del evento no puede ser futura.";

  const weight = Number(values.weightKg);
  if (!values.weightKg.trim()) errors.weightKg = "Ingresa el peso.";
  else if (!Number.isFinite(weight) || weight < MIN_WEIGHT_KG) errors.weightKg = "El peso debe ser mayor a 0 kg.";

  if (!values.notes.trim()) errors.notes = "Ingresa las observaciones.";

  if (values.nextCheckup) {
    const next = parseDateOnly(values.nextCheckup);
    if (!next) errors.nextCheckup = "Ingresa una fecha válida.";
    else if (date && next < date) errors.nextCheckup = "No puede ser anterior a la fecha del evento.";
  }

  return errors;
}
