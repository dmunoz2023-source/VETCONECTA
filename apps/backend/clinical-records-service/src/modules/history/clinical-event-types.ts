/** Tipos de evento clínico que admite la tabla clinical.clinical_events (CHECK de infra/db/01-tables.sql). */
export type ClinicalEventType = 'consultation' | 'vaccine' | 'checkup';

export const CLINICAL_EVENT_TYPES: ClinicalEventType[] = ['consultation', 'vaccine', 'checkup'];
