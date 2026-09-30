import type { WeeklyActivityPoint } from "../../types/dashboard.types";
import Card from "../common/Card";

interface WeeklyActivityChartProps {
  data: WeeklyActivityPoint[];
  subtitle: string;
}

export default function WeeklyActivityChart({ data, subtitle }: WeeklyActivityChartProps) {
  const max = Math.max(...data.map((p) => p.value), 1);

  return (
    <Card title="Actividad Semanal" subtitle={subtitle}>
      <div className="vc-bars">
        {data.map((point, i) => (
          <div className="vc-bar-col" key={i}>
            <div
              className={`vc-bar ${point.value === max ? "highlight" : ""}`}
              style={{ height: `${(point.value / max) * 85}%` }}
            />
            <span className="vc-bar-label">{point.day}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
