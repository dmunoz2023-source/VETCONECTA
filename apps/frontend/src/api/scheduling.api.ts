import { api } from './http/client';
import { getErrorBody, getErrorMessage, getErrorStatus } from './http/errors';
import type { AppointmentStatus, CalendarEvent, NewBookingPayload } from '../types/scheduling.types';
import type {
  BlockFormValues,
  ScheduleFormValues,
  VetBlock,
  VetBlockResult,
  VetSchedule,
} from '../types/agenda.types';

/** Filtros de GET /v1/scheduling/appointments. */
export interface AppointmentsFilter {
  vetId?: string;
  specialtyId?: string;
  status?: string;
}

/** Estados que el personal puede marcar al cerrar una cita. */
export type AttendanceStatus = Extract<AppointmentStatus, 'realizada' | 'no_asistio'>;

/** Evento tal como viaja en JSON: las fechas llegan como texto ISO. */
type CalendarEventDto = Omit<CalendarEvent, 'start' | 'end'> & { start: string; end: string };

const SLOT_TAKEN_CODE = 'SLOT_ALREADY_TAKEN';
const SLOT_TAKEN_MESSAGE = 'El bloque horario seleccionado ya fue reservado por otro usuario.';

/** El bloque ya fue reservado por otra persona (409, BR-5). */
export class SlotTakenError extends Error {
  /** Se mantiene para las pantallas que revisan `isSlotTaken` en el error. */
  readonly isSlotTaken = true;

  constructor(message: string = SLOT_TAKEN_MESSAGE, options?: ErrorOptions) {
    super(message, options);
    this.name = 'SlotTakenError';
  }
}

function toCalendarEvent(dto: CalendarEventDto): CalendarEvent {
  return { ...dto, start: new Date(dto.start), end: new Date(dto.end) };
}

function isSlotTaken(error: unknown): boolean {
  return getErrorStatus(error) === 409 || getErrorBody(error)?.error === SLOT_TAKEN_CODE;
}

/** GET /v1/scheduling/appointments: citas de la agenda del panel (FR-9). */
export async function fetchAppointments(filter?: AppointmentsFilter): Promise<CalendarEvent[]> {
  const { data } = await api.get<{ data: CalendarEventDto[] }>('/v1/scheduling/appointments', {
    params: filter,
  });
  return data.data.map(toCalendarEvent);
}

/** POST /v1/scheduling/appointments: reserva telefónica hecha por recepción. */
export async function createPhoneBooking(payload: NewBookingPayload): Promise<CalendarEvent> {
  try {
    const { data } = await api.post<{ data: CalendarEventDto }>('/v1/scheduling/appointments', payload);
    return toCalendarEvent(data.data);
  } catch (error: unknown) {
    if (isSlotTaken(error)) throw new SlotTakenError(getErrorMessage(error, SLOT_TAKEN_MESSAGE), { cause: error });
    throw new Error(getErrorMessage(error, 'Error al agendar la cita.'), { cause: error });
  }
}

/** PATCH /v1/scheduling/appointments/{id}/status: marca la cita como realizada o no asistió. */
export async function updateAppointmentStatus(id: string, status: AttendanceStatus): Promise<void> {
  await api.patch(`/v1/scheduling/appointments/${id}/status`, { status });
}

/** PATCH /v1/scheduling/appointments/{id}/cancel. */
export async function cancelAppointment(id: string): Promise<void> {
  await api.patch(`/v1/scheduling/appointments/${id}/cancel`);
}

/* ---------- Configuración de agenda (L1, endpoints de G3) ---------- */

/** GET /v1/scheduling/vets/{vetId}/schedules: horario semanal. */
export async function listVetSchedules(vetId: string): Promise<VetSchedule[]> {
  const { data } = await api.get<VetSchedule[]>(`/v1/scheduling/vets/${vetId}/schedules`);
  return data;
}

/** POST /v1/scheduling/vets/{vetId}/schedules: 409 si el turno se solapa con otro. */
export async function createVetSchedule(vetId: string, values: ScheduleFormValues): Promise<VetSchedule> {
  const { data } = await api.post<VetSchedule>(`/v1/scheduling/vets/${vetId}/schedules`, values);
  return data;
}

/** PATCH /v1/scheduling/vets/{vetId}/schedules/{id}: 409 si el turno se solapa con otro. */
export async function updateVetSchedule(vetId: string, id: string, values: ScheduleFormValues): Promise<VetSchedule> {
  const { data } = await api.patch<VetSchedule>(`/v1/scheduling/vets/${vetId}/schedules/${id}`, values);
  return data;
}

/** DELETE /v1/scheduling/vets/{vetId}/schedules/{id}. */
export async function deleteVetSchedule(vetId: string, id: string): Promise<void> {
  await api.delete(`/v1/scheduling/vets/${vetId}/schedules/${id}`);
}

/** GET /v1/scheduling/vets/{vetId}/blocks?from&to (fechas "AAAA-MM-DD", inclusivas). */
export async function listVetBlocks(vetId: string, range?: { from?: string; to?: string }): Promise<VetBlock[]> {
  const { data } = await api.get<VetBlock[]>(`/v1/scheduling/vets/${vetId}/blocks`, { params: range });
  return data;
}

/**
 * Cuerpo de POST/PATCH de bloqueos. `notes` solo viaja con el motivo "other":
 * la API rechaza campos que no conoce, y fuera de "other" no se usa.
 */
function toBlockPayload(values: BlockFormValues) {
  const { notes, ...rest } = values;
  return values.reason === "other" ? { ...rest, notes } : rest;
}

/** POST /v1/scheduling/vets/{vetId}/blocks: devuelve el bloqueo y las citas que quedan dentro. */
export async function createVetBlock(vetId: string, values: BlockFormValues): Promise<VetBlockResult> {
  const { data } = await api.post<VetBlockResult>(`/v1/scheduling/vets/${vetId}/blocks`, toBlockPayload(values));
  return data;
}

/** PATCH /v1/scheduling/vets/{vetId}/blocks/{id}: devuelve el bloqueo y las citas afectadas. */
export async function updateVetBlock(vetId: string, id: string, values: BlockFormValues): Promise<VetBlockResult> {
  const { data } = await api.patch<VetBlockResult>(
    `/v1/scheduling/vets/${vetId}/blocks/${id}`,
    toBlockPayload(values),
  );
  return data;
}

/** DELETE /v1/scheduling/vets/{vetId}/blocks/{id}. */
export async function deleteVetBlock(vetId: string, id: string): Promise<void> {
  await api.delete(`/v1/scheduling/vets/${vetId}/blocks/${id}`);
}
