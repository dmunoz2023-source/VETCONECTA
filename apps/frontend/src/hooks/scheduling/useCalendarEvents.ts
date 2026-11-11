import { useCallback, useState } from "react";
import {
  cancelAppointment,
  createPhoneBooking,
  fetchAppointments,
  SlotTakenError,
  updateAppointmentStatus,
} from "../../api/scheduling.api";
import type { AttendanceStatus } from "../../api/scheduling.api";
import { getErrorMessage } from "../../api/http/errors";
import { CALENDAR_EVENTS_MOCK, mockBookingEvent } from "../../mocks/scheduling.mock";
import type { CalendarEvent, NewBookingPayload } from "../../types/scheduling.types";
import { usePolling } from "../common/usePolling";

const POLLING_INTERVAL_MS = 30_000;

/**
 * Citas de la agenda con actualización periódica, más reserva telefónica,
 * cierre (realizada / no asistió) y cancelación.
 * Mientras el backend no responda, se trabaja sobre datos locales de resguardo;
 * un 409 (bloque ya tomado, BR-5) sí se propaga para que la pantalla lo muestre.
 */
export function useCalendarEvents() {
  const [events, setEvents] = useState<CalendarEvent[]>(CALENDAR_EVENTS_MOCK);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setEvents(await fetchAppointments());
      setError(null);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "No se pudieron cargar las citas."));
    } finally {
      setLoading(false);
    }
  }, []);

  usePolling(refresh, POLLING_INTERVAL_MS);

  const setStatus = (id: string, status: CalendarEvent["status"]) =>
    setEvents((prev) => prev.map((event) => (event.id === id ? { ...event, status } : event)));

  const addBooking = async (payload: NewBookingPayload) => {
    try {
      const created = await createPhoneBooking(payload);
      setEvents((prev) => [...prev, created]);
    } catch (err: unknown) {
      if (err instanceof SlotTakenError) throw err;
      setEvents((prev) => [...prev, mockBookingEvent(payload)]);
    }
  };

  // TODO: con el backend conectado, propagar el error en vez de aplicar el cambio solo en local.
  const changeStatus = async (id: string, status: AttendanceStatus) => {
    await updateAppointmentStatus(id, status).catch(() => undefined);
    setStatus(id, status);
  };

  const cancel = async (id: string) => {
    await cancelAppointment(id).catch(() => undefined);
    setStatus(id, "cancelada");
  };

  return { events, loading, error, refresh, addBooking, changeStatus, cancel };
}
