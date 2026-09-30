export type StatTone = "blue" | "pink" | "dark";

export interface DashboardStat {
  id: string;
  label: string;
  value: string;
  trend: string;
  tone: StatTone;
}

export interface WeeklyActivityPoint {
  day: string;
  value: number;
}
