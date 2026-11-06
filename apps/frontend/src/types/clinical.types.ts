/** Tipos de evento de `clinical.clinical_events.type` y de CreateClinicalEventDto (F2). */
export type ClinicalEventType = "consultation" | "vaccine" | "checkup";

/** Evento clínico tal como lo devuelve clinical-records-service (entidad `clinical.clinical_events`). */
export interface ClinicalEvent {
  id: string;
  petId: string;
  /** Usuario veterinario que lo registró; el backend lo toma del JWT (BR-3). */
  veterinarianId: string;
  type: ClinicalEventType;
  /** Fecha y hora ISO (columna timestamptz). */
  date: string;
  /** PostgreSQL entrega las columnas decimal como texto, p. ej. "8.50". */
  weightKg: string | number | null;
  temperatureC: string | number | null;
  reason: string | null;
  notes: string | null;
  /** "AAAA-MM-DD": próximo control o, en una vacuna, la próxima dosis. */
  nextCheckup: string | null;
}

/** Campos que llena el formulario de registro (UC-06). */
export interface ClinicalEventFormValues {
  /** Vacío hasta que el veterinario elige el tipo. */
  type: ClinicalEventType | "";
  date: string;
  weightKg: string;
  notes: string;
  nextCheckup: string;
}
