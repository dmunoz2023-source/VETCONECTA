import { api } from './axios';
import type { ClinicalEvent, ClinicalEventFormValues, ClinicalEventType } from '../types/clinical.types';
import { parseDateOnly, toDateInputValue } from '../utils/age';

/** Cuerpo de POST /v1/clinical/events (CreateClinicalEventDto de F2). El veterinario sale del JWT (BR-3). */
interface ClinicalEventPayload {
  mascotaId: string;
  tipo: ClinicalEventType;
  fecha: string;
  peso: number;
  observaciones: string;
  proximoControl?: string;
}

/**
 * La columna `date` es timestamptz: "AAAA-MM-DD" se guardaría como medianoche UTC
 * y en Chile se vería como el día anterior. Hoy se envía la hora actual; un día
 * pasado, su mediodía local (nunca queda en el futuro, que el backend rechaza).
 */
function toEventTimestamp(date: string): string {
  if (date === toDateInputValue(new Date())) return new Date().toISOString();
  const day = parseDateOnly(date);
  if (!day) return date;
  day.setHours(12);
  return day.toISOString();
}

/** El formulario ya validó los obligatorios; el próximo control vacío no se envía. */
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

/** GET /v1/clinical/pets/{petId}/carnet: eventos de la mascota, del más reciente al más antiguo (FR-2, BR-6). */
export async function listClinicalEvents(petId: string): Promise<ClinicalEvent[]> {
  const { data } = await api.get<ClinicalEvent[]>(`/v1/clinical/pets/${petId}/carnet`);
  return data;
}

/** POST /v1/clinical/events: solo el veterinario (BR-6); 400 si falta un dato, 404 si la mascota no existe. */
export async function createClinicalEvent(petId: string, values: ClinicalEventFormValues): Promise<ClinicalEvent> {
  const { data } = await api.post<ClinicalEvent>('/v1/clinical/events', toPayload(petId, values));
  return data;
}
