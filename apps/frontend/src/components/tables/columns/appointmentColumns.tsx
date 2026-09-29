import { PawPrint } from "lucide-react";
import type { Appointment } from "../../../types/appointment.types";
import StatusBadge from "../../common/StatusBadge";
import type { TableColumn } from "../DataTable";

/** definicion de columnas de la tabla de citas */
export const APPOINTMENT_COLUMNS: TableColumn<Appointment>[] = [
  {
    key: "pet",
    header: "Mascota / Especie",
    render: (a) => (
      <div className="vc-row-accent" style={{ borderColor: a.accent }}>
        <div className="vc-pet-avatar">
          <PawPrint size={16} />
        </div>
        <div>
          <div className="vc-pet-name">{a.pet}</div>
          <div className="vc-pet-meta">{a.species}</div>
        </div>
      </div>
    ),
  },
  {
    key: "owner",
    header: "Propietario",
    render: (a) => (
      <>
        <div>{a.owner}</div>
        <div className="vc-pet-meta">{a.phone}</div>
      </>
    ),
  },
  { key: "service", header: "Servicio", render: (a) => a.service },
  { key: "time", header: "Hora", render: (a) => a.time },
  {
    key: "status",
    header: "Estado Clínico",
    render: (a) => <StatusBadge label={a.status} background={a.badgeBg} color={a.badgeColor} />,
  },
];
