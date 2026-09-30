import { useEffect, useState } from "react";
import type { Appointment } from "../types/appointment.types";
import { APPOINTMENTS_MOCK } from "../mocks/appointments.mock";

interface UseAppointmentsResult {
  data: Appointment[];
  loading: boolean;
  error: string | null;
}


/**simula la peticion con una Promise sobre datos mock*/

export function useAppointments(): UseAppointmentsResult {
  const [data, setData] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    // ------------------------------------------------------------------
    // TODO (API real) — reemplazar este bloque cuando exista el cliente HTTP:
    //
    //   const request = api
    //     .get<{ data: Appointment[] }>("/v1/scheduling/appointments")
    //     .then((res) => res.data.data);
    //
    // (o con fetch, siempre contra el Gateway :3000 y con el JWT en Authorization)
    // ------------------------------------------------------------------
    const request = new Promise<Appointment[]>((resolve) =>
      setTimeout(() => resolve(APPOINTMENTS_MOCK), 300),
    );

    request
      .then((appointments) => {
        if (!cancelled) setData(appointments);
      })
      .catch(() => {
        if (!cancelled) setError("No se pudieron cargar las citas.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { data, loading, error };
}
