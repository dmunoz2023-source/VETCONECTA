import type { ClinicalEventType } from "../types/clinical.types";

export const CLINICAL_TYPE_OPTIONS: { value: ClinicalEventType; label: string; hint: string }[] = [
  { value: "consultation", label: "Consulta", hint: "Revisión o atención general" },
  { value: "vaccine", label: "Vacuna", hint: "Aplicación de una vacuna" },
  { value: "checkup", label: "Control", hint: "Seguimiento del paciente" },
];

/** Spanish label of the event type (an unknown type is shown as is). */
export const formatClinicalType = (type: string): string =>
  CLINICAL_TYPE_OPTIONS.find((option) => option.value === type)?.label ?? type;

/** Weight that arrives as a number or as a PostgreSQL decimal string ("8.50") → "8.5 kg". */
export const formatWeight = (weightKg: string | number | null): string => {
  const weight = weightKg === null ? NaN : Number(weightKg);
  return Number.isFinite(weight) ? `${weight.toLocaleString("es-CL")} kg` : "—";
};

/** A vaccine schedules the next dose; a consultation or checkup schedules the next checkup. */
export const formatNextDateLabel = (type: string): string =>
  type === "vaccine" ? "Próxima dosis" : "Próximo control";
