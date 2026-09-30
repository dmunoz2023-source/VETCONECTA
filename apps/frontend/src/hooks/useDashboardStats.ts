import { useEffect, useState } from "react";
import type { DashboardStat, WeeklyActivityPoint } from "../types/dashboard.types";
import { DASHBOARD_STATS_MOCK, WEEKLY_ACTIVITY_MOCK } from "../mocks/dashboard.mock";

interface DashboardData {
  stats: DashboardStat[];
  weeklyActivity: WeeklyActivityPoint[];
}

/** Métricas del panel de inicio (mock por ahora). */
export function useDashboardStats() {
  const [data, setData] = useState<DashboardData>({ stats: [], weeklyActivity: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    // ------------------------------------------------------------------
    // TODO (API real) — reemplazar este bloque cuando exista el cliente HTTP:
    //
    //   const request = api
    //     .get<{ data: DashboardData }>("/v1/scheduling/appointments")
    //     .then((res) => buildDashboardData(res.data.data));
    //
    // El contrato actual no define un endpoint de resumen, por eso las métricas
    // se calcularían a partir de las citas (buildDashboardData sería un helper
    // en utils/). Siempre contra el Gateway :3000 y con el JWT en Authorization.
    // ------------------------------------------------------------------
    const request = new Promise<DashboardData>((resolve) =>
      setTimeout(
        () => resolve({ stats: DASHBOARD_STATS_MOCK, weeklyActivity: WEEKLY_ACTIVITY_MOCK }),
        300,
      ),
    );

    request
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { ...data, loading };
}
