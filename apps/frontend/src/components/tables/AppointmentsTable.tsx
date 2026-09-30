import type { Appointment } from "../../types/appointment.types";
import { APPOINTMENT_COLUMNS } from "./columns/appointmentColumns";
import DataTable from "./DataTable";

interface AppointmentsTableProps {
  appointments: Appointment[];
  loading?: boolean;
  error?: string | null;
}

export default function AppointmentsTable({ appointments, loading, error }: AppointmentsTableProps) {
  return (
    <DataTable
      columns={APPOINTMENT_COLUMNS}
      rows={appointments}
      getRowKey={(a) => a.id}
      loading={loading}
      error={error}
      emptyMessage="No hay citas agendadas para hoy."
    />
  );
}
