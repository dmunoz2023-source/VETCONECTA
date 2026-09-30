import { Link } from "react-router-dom";
import { Calendar, PawPrint, Wallet, SlidersHorizontal, MoreVertical } from "lucide-react";
import type { ReactNode } from "react";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import PageHeader from "../../components/common/PageHeader";
import StatCard from "../../components/common/StatCard";
import MiniCalendar from "../../components/dashboard/MiniCalendar";
import WeeklyActivityChart from "../../components/dashboard/WeeklyActivityChart";
import AppointmentsTable from "../../components/tables/AppointmentsTable";
import { useAppointments } from "../../hooks/useAppointments";
import { useDashboardStats } from "../../hooks/useDashboardStats";
import "./DashboardHome.css";

// Icono por tarjeta de métrica (los datos vienen del hook, el icono es visual).
const STAT_ICONS: Record<string, ReactNode> = {
  appointments: <Calendar size={20} />,
  patients: <PawPrint size={20} />,
  income: <Wallet size={20} />,
};

export default function DashboardHome() {
  const { data: appointments, loading, error } = useAppointments();
  const { stats, weeklyActivity } = useDashboardStats();
  const today = new Date();

  return (
    <div className="vc-dashboard">
      <PageHeader
        title="Panel de Control"
        description="Resumen de actividad diaria, métricas principales y agenda de consultas."
        actions={
          <>
            <Button>Exportar Reporte</Button>
            <Button variant="primary">+ Nuevo Registro</Button>
          </>
        }
      />

      <div className="vc-stats-row">
        {stats.map(({ id, label, value, trend, tone }) => (
          <StatCard key={id} icon={STAT_ICONS[id]} label={label} value={value} trend={trend} tone={tone} />
        ))}
      </div>

      <div className="vc-dash-grid">
        <Card
          title="Citas del Día"
          subtitle="Pacientes agendados y estado clínico actual"
          actions={
            <>
              <SlidersHorizontal size={16} />
              <MoreVertical size={16} />
            </>
          }
        >
          <AppointmentsTable appointments={appointments} loading={loading} error={error} />
          <div className="vc-table-footer">
            <Link to="/agenda">Ver todas las citas del mes →</Link>
          </div>
        </Card>

        <div>
          <MiniCalendar date={today} selectedDay={today.getDate()} />
          <WeeklyActivityChart data={weeklyActivity} subtitle="Pacientes atendidos esta semana" />
        </div>
      </div>
    </div>
  );
}
