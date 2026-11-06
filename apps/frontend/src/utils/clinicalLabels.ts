import type { ClinicalEventType } from "../types/clinical.types";

export const CLINICAL_TYPE_OPTIONS: { value: ClinicalEventType; label: string }[] = [
  { value: "consultation", label: "Consulta" },
  { value: "vaccine", label: "Vacuna" },
  { value: "checkup", label: "Control" },
];

/** Etiqueta en español del tipo de evento (si no es conocido, muestra el valor tal cual). */
export const formatClinicalType = (type: string): string =>
  CLINICAL_TYPE_OPTIONS.find((option) => option.value === type)?.label ?? type;

/** Peso que llega como número o como texto decimal de PostgreSQL ("8.50") → "8.5 kg". */
export const formatWeight = (weightKg: string | number | null): string => {
  const weight = weightKg === null ? NaN : Number(weightKg);
  return Number.isFinite(weight) ? `${weight.toLocaleString("es-CL")} kg` : "—";
};

/** Una vacuna agenda la próxima dosis; una consulta o un control, el próximo control. */
export const formatNextDateLabel = (type: string): string =>
  type === "vaccine" ? "Próxima vacuna" : "Próximo control";
