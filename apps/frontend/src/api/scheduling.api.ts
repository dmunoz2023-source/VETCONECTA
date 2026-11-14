import { api } from './http/client';
import { getErrorBody, getErrorMessage, getErrorStatus } from './http/errors';
import type { AppointmentStatus, CalendarEvent, NewBookingPayload } from '../types/scheduling.types';

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
