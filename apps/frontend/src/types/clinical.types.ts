/** Event types of `clinical.clinical_events.type` and of CreateClinicalEventDto (F2). */
export type ClinicalEventType = "consultation" | "vaccine" | "checkup";

/** Vaccine data of an event (`clinical.vaccination_details`); only vaccine events have it. */
export interface VaccinationDetails {
  vaccine: string | null;
  batch: string | null;
  laboratory: string | null;
  /** "YYYY-MM-DD": date of the next dose. */
  boosterDate: string | null;
}

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
  diagnosis: string | null;
  notes: string | null;
  /** "YYYY-MM-DD": next checkup (consultation and checkup events). */
  nextCheckup: string | null;
  vaccinationDetails?: VaccinationDetails | null;
}

/** Fields filled in by the registration form (UC-06). */
export interface ClinicalEventFormValues {
  /** Empty until the veterinarian picks a type. */
  type: ClinicalEventType | "";
  date: string;
  weightKg: string;
  notes: string;
  /** Consultation and checkup only. */
  diagnosis: string;
  /** Next checkup (consultation and checkup) or next dose (vaccine). */
  nextCheckup: string;
  /** Vaccine only. */
  vaccineName: string;
  /** Vaccine only. */
  batch: string;
}
