export const clinicalTypes = [
  { value: 'consultation', label: 'Consulta' },
  { value: 'vaccine', label: 'Vacuna' },
  { value: 'checkup', label: 'Control' },
] as const;

export type ClinicalType = typeof clinicalTypes[number]['value'];

export interface ClinicalEventPayload {
  petId: string;
  type: ClinicalType;
  date: string;
  weightKg: number;
  notes: string;
  diagnosis?: string;
  nextCheckup?: string;
  vaccination?: { vaccine: string; batch: string; boosterDate: string };
}

export interface ClinicalEvent extends ClinicalEventPayload {
  id: string;
  vetUserId: string;
}

export interface ClinicalFormValues {
  type: ClinicalType;
  date: string;
  weightKg: string;
  notes: string;
  diagnosis: string;
  nextCheckup: string;
  vaccine: string;
  batch: string;
  boosterDate: string;
}
