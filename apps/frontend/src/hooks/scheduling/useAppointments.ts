import type { Appointment } from "../../types/appointment.types";
import { APPOINTMENTS_MOCK } from "../../mocks/appointments.mock";
import { mockRequest } from "../../mocks/mockRequest";
import { useAsync } from "../common/useAsync";

interface UseAppointmentsResult {
  data: Appointment[];
  loading: boolean;
  error: string | null;
}

/**
 * Citas del panel de inicio (mock por ahora).
 * TODO (API real): cambiar el mock por `fetchAppointments` de api/scheduling.api,
 * siempre contra el Gateway :3000 y con el JWT en Authorization.
 */
const loadAppointments = (): Promise<Appointment[]> => mockRequest(APPOINTMENTS_MOCK);

export function useAppointments(): UseAppointmentsResult {
  const { data, loading, error } = useAsync(loadAppointments, "No se pudieron cargar las citas.");
  return { data: data ?? [], loading, error };
}
