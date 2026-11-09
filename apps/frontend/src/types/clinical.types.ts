/** Event types of `clinical.clinical_events.type` and of CreateClinicalEventDto (F2). */
export type ClinicalEventType = "consultation" | "vaccine" | "checkup";

/** Clinical event as returned by clinical-records-service (`clinical.clinical_events` entity). */
export interface ClinicalEvent {
  id: string;
  petId: string;
  /** Veterinarian who registered it; the backend takes it from the JWT (BR-3). */
  veterinarianId: string;
  type: ClinicalEventType;
  /** ISO date and time (timestamptz column). */
  date: string;
  /** PostgreSQL returns decimal columns as text, e.g. "8.50". */
  weightKg: string | number | null;
  temperatureC: string | number | null;
  reason: string | null;
  notes: string | null;
  /** "YYYY-MM-DD": next checkup or, for a vaccine, the next dose. */
  nextCheckup: string | null;
}

/** Fields filled in by the registration form (UC-06). */
export interface ClinicalEventFormValues {
  /** Empty until the veterinarian picks a type. */
  type: ClinicalEventType | "";
  date: string;
  weightKg: string;
  notes: string;
  nextCheckup: string;
}
