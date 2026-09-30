import type { DashboardStat, WeeklyActivityPoint } from "../types/dashboard.types";

// MOCK temporal
export const DASHBOARD_STATS_MOCK: DashboardStat[] = [
  { id: "appointments", label: "Citas Hoy", value: "24", trend: "+12%", tone: "blue" },
  { id: "patients", label: "Pacientes Atendidos", value: "24", trend: "+12%", tone: "pink" },
  { id: "income", label: "Ingresos Estimados", value: "$4.8 mill.", trend: "+12%", tone: "dark" },
];

export const WEEKLY_ACTIVITY_MOCK: WeeklyActivityPoint[] = [
  { day: "L", value: 18 },
  { day: "M", value: 22 },
  { day: "M", value: 20 },
  { day: "J", value: 28 },
  { day: "V", value: 24 },
  { day: "S", value: 16 },
  { day: "D", value: 14 },
];
