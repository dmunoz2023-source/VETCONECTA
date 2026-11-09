import { api, getErrorMessage } from "./axios";
import type { CalendarEvent, NewBookingPayload } from "../types/scheduling.types";
import axios from "axios";

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