import type { ClinicalEventFormValues } from "../types/clinical.types";
import { parseDateOnly } from "./age";

export type ClinicalEventFormErrors = Partial<Record<keyof ClinicalEventFormValues, string>>;

/** Minimum weight accepted by CreateClinicalEventDto (`@IsPositive`; the form asks for at least 0.1 kg). */
const MIN_WEIGHT_KG = 0.1;

/** Max lengths of CreateClinicalEventDto. */
const MAX_DIAGNOSIS = 200;
const MAX_VACCINE_NAME = 100;
const MAX_BATCH = 50;

/**
 * Same rules as CreateClinicalEventDto (F2): type, date (not in the future), weight (> 0)
 * and notes are always required. By type:
 * - vaccine: name, batch and next dose date;
 * - consultation / checkup: diagnosis and next checkup date.
 * The next date cannot be earlier than the event. With errors nothing is sent (flow A1 of UC-06).
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

  if (values.type === "vaccine") {
    if (!values.vaccineName.trim()) errors.vaccineName = "Ingresa el nombre de la vacuna.";
    else if (values.vaccineName.trim().length > MAX_VACCINE_NAME) errors.vaccineName = `Máximo ${MAX_VACCINE_NAME} caracteres.`;
    if (!values.batch.trim()) errors.batch = "Ingresa el lote de la vacuna.";
    else if (values.batch.trim().length > MAX_BATCH) errors.batch = `Máximo ${MAX_BATCH} caracteres.`;
  } else if (values.type) {
    if (!values.diagnosis.trim()) errors.diagnosis = "Ingresa el diagnóstico.";
    else if (values.diagnosis.trim().length > MAX_DIAGNOSIS) errors.diagnosis = `Máximo ${MAX_DIAGNOSIS} caracteres.`;
  }

  if (values.type) {
    const next = values.nextCheckup ? parseDateOnly(values.nextCheckup) : null;
    if (!values.nextCheckup) {
      errors.nextCheckup = values.type === "vaccine" ? "Ingresa la fecha de la próxima dosis." : "Ingresa la fecha del próximo control.";
    } else if (!next) errors.nextCheckup = "Ingresa una fecha válida.";
    else if (date && next < date) errors.nextCheckup = "No puede ser anterior a la fecha del evento.";
  }

  return errors;
}
