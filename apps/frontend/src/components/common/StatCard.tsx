import type { ReactNode } from "react";
import type { StatTone } from "../../types/dashboard.types";

interface StatCardProps {
  icon: ReactNode;
  tone: StatTone;
  label: string;
  value: string;
  trend: string;
}

export default function StatCard({ icon, tone, label, value, trend }: StatCardProps) {
  return (
    <div className="vc-stat-card">
      <div className={`vc-stat-icon ${tone}`}>{icon}</div>
      <div className="vc-stat-body">
        <div className="vc-stat-top">
          <span>{label}</span>
          <span className="vc-stat-trend">↑ {trend}</span>
        </div>
        <div className="vc-stat-value">{value}</div>
      </div>
    </div>
  );
}
