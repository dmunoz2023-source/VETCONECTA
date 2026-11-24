import { useCallback, useState } from "react";
import {
  cancelAppointment,
  createPhoneBooking,
  fetchAppointments,
  updateAppointmentStatus,
} from "../../api/scheduling.api";
import type { AttendanceStatus } from "../../api/scheduling.api";
import { getErrorMessage } from "../../api/http/errors";
import type { CalendarEvent, NewBookingPayload } from "../../types/scheduling.types";
import { usePolling } from "../common/usePolling";

const POLLING_INTERVAL_MS = 30_000;

/**
 * Citas de la agenda con actualización periódica, más reserva telefónica,
 * cierre (realizada / no asistió) y cancelación. Solo muestra lo que responde
 * el API Gateway: si una petición falla, la agenda no cambia y se informa el error
 * (Panel web §5). La reserva relanza el error para que el modal muestre el 409 (BR-5).
 */
export function useCalendarEvents() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

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

  /** Ejecuta un cambio en el backend y lo refleja en la agenda solo si respondió bien. */
  const runAction = async (request: Promise<void>, apply: () => void, failMessage: string) => {
    setActionError(null);
    try {
      await request;
      apply();
    } catch (err: unknown) {
      setActionError(getErrorMessage(err, failMessage));
    }
  };

  const addBooking = async (payload: NewBookingPayload) => {
    const created = await createPhoneBooking(payload);
    setEvents((prev) => [...prev, created]);
  };

  const changeStatus = (id: string, status: AttendanceStatus) =>
    runAction(updateAppointmentStatus(id, status), () => setStatus(id, status), "No se pudo actualizar el estado de la cita.");

  const cancel = (id: string) =>
    runAction(cancelAppointment(id), () => setStatus(id, "cancelada"), "No se pudo cancelar la cita.");

  const dismissActionError = () => setActionError(null);

  return { events, loading, error, actionError, dismissActionError, refresh, addBooking, changeStatus, cancel };
}
