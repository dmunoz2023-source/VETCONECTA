import axios from 'axios';
import { api, getErrorMessage } from './axios';
import type { ClinicalEvent, ClinicalFormValues } from '../types/clinical.types';

/** Contrato de integración con F2; ver docs/clinical-events.md. */
export async function listClinicalEvents(petId: string): Promise<ClinicalEvent[]> {
  const { data } = await api.get<ClinicalEvent[]>(`/v1/clinical/pets/${petId}/card`);
  return data;
}

export async function createClinicalEvent(petId: string, values: ClinicalFormValues): Promise<ClinicalEvent> {
  const { data } = await api.post<ClinicalEvent>('/v1/clinical/events', {
    petId, type: values.type, date: values.date,
    weightKg: Number(values.weightKg), notes: values.notes.trim(),
    ...(values.type === 'vaccine'
      ? { vaccination: { vaccine: values.vaccine.trim(), batch: values.batch.trim(), boosterDate: values.boosterDate } }
      : { diagnosis: values.diagnosis.trim(), nextCheckup: values.nextCheckup }),
  });
  return data;
}

export function clinicalErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error) && error.response?.status === 403) {
    return getErrorMessage(error, 'No tienes permiso para realizar esta acción clínica.');
  }
  if (axios.isAxiosError(error) && error.response?.status === 400) {
    return getErrorMessage(error, 'Revisa los datos obligatorios del evento.');
  }
  return getErrorMessage(error, 'No se pudo guardar el evento clínico. Intenta nuevamente.');
}
