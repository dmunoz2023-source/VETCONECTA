import type { DashboardStat, WeeklyActivityPoint } from "../../types/dashboard.types";
import { DASHBOARD_STATS_MOCK, WEEKLY_ACTIVITY_MOCK } from "../../mocks/dashboard.mock";
import { mockRequest } from "../../mocks/mockRequest";
import { useAsync } from "../common/useAsync";

interface DashboardData {
  stats: DashboardStat[];
  weeklyActivity: WeeklyActivityPoint[];
}

const EMPTY_DASHBOARD: DashboardData = { stats: [], weeklyActivity: [] };

/**
 * Métricas del panel de inicio (mock por ahora).
 * TODO (API real): el contrato no define un endpoint de resumen, así que las métricas
 * se calcularían a partir de GET /v1/scheduling/appointments con un helper en utils/.
 */
const loadDashboard = (): Promise<DashboardData> =>
  mockRequest({ stats: DASHBOARD_STATS_MOCK, weeklyActivity: WEEKLY_ACTIVITY_MOCK });

/** Métricas del inicio con los 4 estados de Panel web §5: carga, error, vacío (listas vacías) y éxito. */
export function useDashboardStats() {
  const { data, loading, error, reload } = useAsync(loadDashboard, "No se pudieron cargar las métricas.");
  return { ...(data ?? EMPTY_DASHBOARD), loading, error, reload };
}
