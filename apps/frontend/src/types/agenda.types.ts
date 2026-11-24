/**
 * Tipos de la configuración de agenda (L1, FR-7). Reflejan las respuestas de
 * clinic-catalog-service (especialidades y veterinarios) y de scheduling-service
 * (horario semanal y bloqueos) creadas en G3.
 */

/** Especialidad del catálogo; `durationMinutes` es el largo de cada bloque de agenda. */
export interface Specialty {
  id: string;
  name: string;
  durationMinutes: number;
  active: boolean;
}

export interface SpecialtyFormValues {
  name: string;
  durationMinutes: number;
}

/** Veterinario activo, tal como lo entrega GET /v1/catalog/vets (G1). */
export interface Vet {
  userId: string;
  firstName: string;
  lastName: string;
  professionalLicense: string | null;
  photoUrl: string | null;
  active: boolean;
}

/** Turno del horario semanal. `dayOfWeek`: 0 = domingo ... 6 = sábado. Horas "HH:mm" locales. */
export interface VetSchedule {
  id: string;
  vetUserId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export interface ScheduleFormValues {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

/** Motivos de bloqueo permitidos por scheduling.vet_blocks. */
export const VET_BLOCK_REASONS = ["vacation", "holiday", "sick_leave", "training", "other"] as const;
export type VetBlockReason = (typeof VET_BLOCK_REASONS)[number];

/** Bloqueo puntual. Sin `startTime`/`endTime` cubre el día completo. */
export interface VetBlock {
  id: string;
  vetUserId: string;
  /** Fecha local de la clínica, "AAAA-MM-DD". */
  date: string;
  startTime: string | null;
  endTime: string | null;
  /** Los bloqueos anteriores a la lista fija pueden traer un texto libre. */
  reason: VetBlockReason | string;
  notes?: string | null;
  createdBy: string | null;
  createdAt: string;
}

export interface BlockFormValues {
  date: string;
  /** `null` en ambas horas = día completo. */
  startTime: string | null;
  endTime: string | null;
  reason: VetBlockReason;
  /** Obligatorio cuando `reason` es "other". */
  notes: string | null;
}

/** Cita vigente que queda dentro de un bloqueo. No se cancela sola: es una advertencia. */
export interface AffectedAppointment {
  id: string;
  petId: string;
  clientId: string;
  /** Instante ISO (UTC). */
  startTime: string;
  endTime: string;
  status: string;
}

/** Respuesta de POST y PATCH de bloqueos. */
export interface VetBlockResult {
  block: VetBlock;
  affectedAppointments: AffectedAppointment[];
}

/** Bloque de agenda calculado a partir de un turno ("HH:mm"). */
export interface AgendaSlot {
  startTime: string;
  endTime: string;
}
