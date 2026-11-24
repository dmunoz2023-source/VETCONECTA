import type { AgendaSlot, VetBlock, VetBlockReason, VetSchedule } from "../types/agenda.types";

/** Zona horaria de la clínica: horarios, bloqueos y citas se muestran en esta hora. */
const CLINIC_TIME_ZONE = "America/Santiago";

/** Índice = `dayOfWeek` de la API (0 = domingo). */
export const WEEKDAY_LABELS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"] as const;

/** Orden de la semana en pantalla: lunes primero. */
export const WEEKDAY_ORDER = [1, 2, 3, 4, 5, 6, 0] as const;

export const BLOCK_REASON_LABELS: Record<VetBlockReason, string> = {
  vacation: "Vacaciones",
  holiday: "Feriado",
  sick_leave: "Licencia médica",
  training: "Capacitación",
  other: "Otro",
};

/** Etiqueta del motivo; los bloqueos antiguos con texto libre se muestran tal cual. */
export const formatBlockReason = (reason: string): string =>
  reason in BLOCK_REASON_LABELS ? BLOCK_REASON_LABELS[reason as VetBlockReason] : reason;

const toMinutes = (time: string): number => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

const fromMinutes = (total: number): string =>
  `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;

/**
 * Divide un turno en bloques del largo de la especialidad. Igual que
 * DayBlocksService (scheduling-service): el resto que no alcanza para un
 * bloque completo se descarta.
 */
export function sliceShift(startTime: string, endTime: string, durationMinutes: number): AgendaSlot[] {
  const slots: AgendaSlot[] = [];
  if (durationMinutes <= 0) return slots;
  const end = toMinutes(endTime);
  for (let start = toMinutes(startTime); start + durationMinutes <= end; start += durationMinutes) {
    slots.push({ startTime: fromMinutes(start), endTime: fromMinutes(start + durationMinutes) });
  }
  return slots;
}

/** Bloques de un día de la semana, a partir de todos sus turnos, ordenados por hora. */
export function slotsForWeekday(schedules: VetSchedule[], dayOfWeek: number, durationMinutes: number): AgendaSlot[] {
  return schedules
    .filter((shift) => shift.dayOfWeek === dayOfWeek)
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
    .flatMap((shift) => sliceShift(shift.startTime, shift.endTime, durationMinutes));
}

/** Minutos que quedan sin usar al final de un turno con esa duración de bloque. */
export function leftoverMinutes(startTime: string, endTime: string, durationMinutes: number): number {
  const length = toMinutes(endTime) - toMinutes(startTime);
  return durationMinutes > 0 && length > 0 ? length % durationMinutes : 0;
}

/** El bloqueo cubre el bloque (día completo, o rangos que se cruzan). */
export function isSlotBlocked(slot: AgendaSlot, block: Pick<VetBlock, "startTime" | "endTime">): boolean {
  if (!block.startTime || !block.endTime) return true;
  return slot.startTime < block.endTime && block.startTime < slot.endTime;
}

/** Día de la semana (0 = domingo) de una fecha "AAAA-MM-DD", sin depender de la zona del navegador. */
export function weekdayOf(date: string): number {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

/** Fecha de hoy en la clínica, "AAAA-MM-DD". */
export function clinicToday(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: CLINIC_TIME_ZONE }).format(new Date());
}

/** Suma días a una fecha "AAAA-MM-DD". */
export function addDays(date: string, days: number): string {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10);
}

/** Instante ISO → "lun 15-12-2026, 10:30" en hora de la clínica. */
export function formatClinicDateTime(iso: string): string {
  return new Date(iso).toLocaleString("es-CL", {
    timeZone: CLINIC_TIME_ZONE,
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
}

/** Rango legible de un bloqueo: "Día completo" o "09:00 – 13:00". */
export const formatBlockRange = (block: Pick<VetBlock, "startTime" | "endTime">): string =>
  block.startTime && block.endTime ? `${block.startTime} – ${block.endTime}` : "Día completo";
