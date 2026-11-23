import { api, getErrorMessage } from "./axios";
import type { CalendarEvent, NewBookingPayload } from "../types/scheduling.types";
import axios from "axios";
import type {
  BlockFormValues,
  ScheduleFormValues,
  VetBlock,
  VetBlockResult,
  VetSchedule,
} from "../types/agenda.types";

export interface ApiErrorResponse {
  statusCode: number;
  error: string;
  message: string;
}

export async function fetchAppointments(params?: {
  vetId?: string;
  specialtyId?: string;
  status?: string;
}): Promise<CalendarEvent[]> {
  const { data } = await api.get<{ data: CalendarEvent[] }>("/v1/scheduling/appointments", {
    params,
  });
  return data.data.map((evt) => ({
    ...evt,
    start: new Date(evt.start),
    end: new Date(evt.end),
  }));
}

export async function createPhoneBooking(payload: NewBookingPayload): Promise<CalendarEvent> {
  try {
    const { data } = await api.post<{ data: CalendarEvent }>("/v1/scheduling/appointments", payload);
    return {
      ...data.data,
      start: new Date(data.data.start),
      end: new Date(data.data.end),
    };
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      if (err.response?.status === 409 || err.response?.data?.error === "SLOT_ALREADY_TAKEN") {
        const error = new Error(
          err.response?.data?.message || "El bloque horario seleccionado ya fue reservado por otro usuario."
        ) as Error & { isSlotTaken?: boolean };

        error.isSlotTaken = true;
        throw error;
      }
    }
    throw new Error(getErrorMessage(err, "Error al agendar la cita."), { cause: err });
  }
}

export async function updateAppointmentStatus(
  id: string,
  status: "realizada" | "no_asistio"
): Promise<void> {
  await api.patch(`/v1/scheduling/appointments/${id}/status`, { status });
}

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
