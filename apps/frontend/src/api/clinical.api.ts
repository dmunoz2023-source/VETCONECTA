import { api } from './axios';
import type { ClinicalEvent, ClinicalEventFormValues, ClinicalEventType } from '../types/clinical.types';
import { parseDateOnly, toDateInputValue } from '../utils/age';

/**
 * Body of POST /v1/clinical/events: the keys of CreateClinicalEventDto (F2, backend).
 * The veterinarian comes from the JWT (BR-3).
 *
 * F2 validates by type, so only the fields of the chosen type are sent:
 * - vaccine: vaccineName, batch and boosterDate are required; no diagnosis or nextCheckup.
 * - consultation / checkup: diagnosis and nextCheckup are required; no vaccine fields.
 */
interface ClinicalEventPayload {
  petId: string;
  type: ClinicalEventType;
  date: string;
  weightKg: number;
  notes: string;
  vaccineName?: string;
  batch?: string;
  boosterDate?: string;
  diagnosis?: string;
  nextCheckup?: string;
}

/**
 * The `date` column is timestamptz: "YYYY-MM-DD" would be stored as midnight UTC and
 * show up as the previous day in Chile. Today sends the current time; a past day
 * sends its local noon (never in the future, which the backend rejects).
 */
function toEventTimestamp(date: string): string {
  if (date === toDateInputValue(new Date())) return new Date().toISOString();
  const day = parseDateOnly(date);
  if (!day) return date;
  day.setHours(12);
  return day.toISOString();
}

/** The form already validated the required fields; only the fields of the chosen type are sent. */
function toPayload(petId: string, values: ClinicalEventFormValues): ClinicalEventPayload {
  const common = {
    petId,
    type: values.type as ClinicalEventType,
    date: toEventTimestamp(values.date),
    weightKg: Number(values.weightKg),
    notes: values.notes.trim(),
  };

  if (values.type === "vaccine") {
    return {
      ...common,
      vaccineName: values.vaccineName.trim(),
      batch: values.batch.trim(),
      boosterDate: values.nextCheckup,
    };
  }
  return { ...common, diagnosis: values.diagnosis.trim(), nextCheckup: values.nextCheckup };
}

/** GET /v1/clinical/pets/{petId}/carnet: the pet's events, newest first (FR-2, BR-6). */
export async function listClinicalEvents(petId: string): Promise<ClinicalEvent[]> {
  const { data } = await api.get<ClinicalEvent[]>(`/v1/clinical/pets/${petId}/carnet`);
  return data;
}

/** POST /v1/clinical/events: veterinarian only (BR-6); 400 if data is missing, 404 if the pet does not exist. */
export async function createClinicalEvent(petId: string, values: ClinicalEventFormValues): Promise<ClinicalEvent> {
  const { data } = await api.post<ClinicalEvent>('/v1/clinical/events', toPayload(petId, values));
  return data;
}
