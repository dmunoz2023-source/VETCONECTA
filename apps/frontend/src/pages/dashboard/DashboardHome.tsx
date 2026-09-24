import type { ReactNode } from "react";
import { Calendar, PawPrint, Wallet, SlidersHorizontal, MoreVertical, ChevronLeft, ChevronRight } from "lucide-react";
import "./DashboardHome.css";

// reemplazar estos datos mock por GET /v1/scheduling/appointments
// y GET /v1/scheduling/availability vía el API Gateway.

interface Appointment {
  pet: string;
  species: string;
  owner: string;
  phone: string;
  service: string;
  time: string;
  status: string;
  accent: string;
  badgeBg: string;
  badgeColor: string;
}

const APPOINTMENTS: Appointment[] = [
  { pet: "Luna", species: "Canino · Golden", owner: "María González", phone: "+56 9 8765 4321", service: "Consulta General", time: "09:00 AM", status: "Dado de Alta", accent: "#16a34a", badgeBg: "#dcfce7", badgeColor: "#16a34a" },
  { pet: "Simba", species: "Felino · Siamés", owner: "Carlos Pérez", phone: "+56 9 7123 9812", service: "Vacunación Múltiple", time: "10:30 AM", status: "En Consulta", accent: "#2563eb", badgeBg: "#dbeafe", badgeColor: "#2563eb" },
  { pet: "Rocky", species: "Canino · Bulldog", owner: "Ana Ramírez", phone: "+56 9 6345 1190", service: "Revisión Post-Op", time: "11:45 AM", status: "En Observación", accent: "#d97706", badgeBg: "#fef3c7", badgeColor: "#d97706" },
  { pet: "Paco", species: "Ave · Loro", owner: "Luis Sánchez", phone: "+56 9 5567 8901", service: "Corte de Uñas", time: "02:15 PM", status: "En Espera", accent: "#db2777", badgeBg: "#fce7f3", badgeColor: "#db2777" },
  { pet: "Thor", species: "Canino · Pastor Alemán", owner: "Camila Soto", phone: "+56 9 4432 1098", service: "Traumatología", time: "04:30 PM", status: "Hospitalización / UCI", accent: "#dc2626", badgeBg: "#fee2e2", badgeColor: "#dc2626" },
];

const WEEK_DAYS = ["L", "M", "M", "J", "V", "S", "D"];
const WEEKLY_ACTIVITY = [18, 22, 20, 28, 24, 16, 14];

const CALENDAR_DAYS = ["D", "L", "M", "M", "J", "V", "S"];
const OCTOBER_OFFSET = 4;

export default function DashboardHome() {
  const maxActivity = Math.max(...WEEKLY_ACTIVITY);

  return (
    <div className="vc-dashboard">
      <div className="vc-dash-header">
        <div>
          <h1>Panel de Control</h1>
          <p>Resumen de actividad diaria, métricas principales y agenda de consultas.</p>
        </div>
        <div className="vc-dash-actions">
          <button className="vc-btn">Exportar Reporte</button>
          <button className="vc-btn primary">+ Nuevo Registro</button>
        </div>
      </div>

      <div className="vc-stats-row">
        <StatCard icon={<Calendar size={20} />} tone="blue" label="Citas Hoy" value="24" trend="+12%" />
        <StatCard icon={<PawPrint size={20} />} tone="pink" label="Pacientes Atendidos" value="24" trend="+12%" />
        <StatCard icon={<Wallet size={20} />} tone="dark" label="Ingresos Estimados" value="$4.8 mill." trend="+12%" />
      </div>

      <div className="vc-dash-grid">
        <div className="vc-card">
          <div className="vc-card-header-row">
            <div>
              <h2 className="vc-card-title">Citas del Día</h2>
              <p className="vc-card-subtitle">Pacientes agendados y estado clínico actual</p>
            </div>
            <div className="vc-card-icons">
              <SlidersHorizontal size={16} />
              <MoreVertical size={16} />
            </div>
          </div>
          <div className="vc-table-wrap">
            <table className="vc-table">
              <thead>
                <tr>
                  <th>Mascota / Especie</th>
                  <th>Propietario</th>
                  <th>Servicio</th>
                  <th>Hora</th>
                  <th>Estado Clínico</th>
                </tr>
              </thead>
              <tbody>
                {APPOINTMENTS.map((a) => (
                  <tr key={a.pet}>
                    <td>
                      <div className="vc-row-accent" style={{ borderColor: a.accent }}>
                        <div className="vc-pet-avatar">
                          <PawPrint size={16} />
                        </div>
                        <div>
                          <div className="vc-pet-name">{a.pet}</div>
                          <div className="vc-pet-meta">{a.species}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div>{a.owner}</div>
                      <div className="vc-pet-meta">{a.phone}</div>
                    </td>
                    <td>{a.service}</td>
                    <td>{a.time}</td>
                    <td>
                      <span className="vc-badge" style={{ background: a.badgeBg, color: a.badgeColor }}>
                        {a.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="vc-table-footer">
            <a href="/agenda">Ver todas las citas del mes (24+) →</a>
          </div>
        </div>

        <div>
          <div className="vc-card vc-calendar">
            <div className="vc-dash-header" style={{ marginBottom: 10 }}>
              <h2 className="vc-card-title">Octubre 2026</h2>
              <div style={{ display: "flex", gap: 6 }}>
                <ChevronLeft size={16} />
                <ChevronRight size={16} />
              </div>
            </div>
            <div className="vc-calendar-grid">
              {CALENDAR_DAYS.map((d, i) => (
                <div key={i} className="dow">{d}</div>
              ))}
              {Array.from({ length: OCTOBER_OFFSET }, (_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                <div key={day} className={`vc-calendar-day ${day === 7 ? "selected" : ""}`}>
                  {day}
                </div>
              ))}
            </div>
          </div>

          <div className="vc-card">
            <h2 className="vc-card-title">Actividad Semanal</h2>
            <p className="vc-card-subtitle">142 pacientes atendidos esta semana</p>
            <div className="vc-bars">
              {WEEKLY_ACTIVITY.map((value, i) => (
                <div className="vc-bar-col" key={i}>
                  <div
                    className={`vc-bar ${value === maxActivity ? "highlight" : ""}`}
                    style={{ height: `${(value / maxActivity) * 85}%` }}
                  />
                  <span className="vc-bar-label">{WEEK_DAYS[i]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  tone,
  label,
  value,
  trend,
}: {
  icon: ReactNode;
  tone: "blue" | "pink" | "dark";
  label: string;
  value: string;
  trend: string;
}) {
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