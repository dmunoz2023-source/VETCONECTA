import { api } from './axios';
import type { ClinicalEvent, ClinicalEventFormValues, ClinicalEventType } from '../types/clinical.types';
import { parseDateOnly, toDateInputValue } from '../utils/age';

/**
 * Body of POST /v1/clinical/events. The key names are dictated by CreateClinicalEventDto
 * (F2, backend), so they are the only Spanish identifiers left: rename them here when F2 does.
 * The veterinarian comes from the JWT (BR-3).
 */
interface ClinicalEventPayload {
  mascotaId: string;
  tipo: ClinicalEventType;
  fecha: string;
  peso: number;
  observaciones: string;
  proximoControl?: string;
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

/** The form already validated the required fields; an empty next checkup is not sent. */
function toPayload(petId: string, values: ClinicalEventFormValues): ClinicalEventPayload {
  return {
    mascotaId: petId,
    tipo: values.type as ClinicalEventType,
    fecha: toEventTimestamp(values.date),
    peso: Number(values.weightKg),
    observaciones: values.notes.trim(),
    proximoControl: values.nextCheckup || undefined,
  };
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
