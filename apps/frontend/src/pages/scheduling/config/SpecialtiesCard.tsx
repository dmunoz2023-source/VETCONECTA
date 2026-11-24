import { Plus, SquarePen, Trash2 } from "lucide-react";
import Button from "../../../components/common/Button";
import Card from "../../../components/common/Card";
import IconButton from "../../../components/common/IconButton";
import ConfirmDialog from "../../../components/feedback/ConfirmDialog";
import DataTable, { type TableColumn } from "../../../components/tables/DataTable";
import { useCrudDialogs } from "../../../hooks/common/useCrudDialogs";
import type { Specialty, SpecialtyFormValues } from "../../../types/agenda.types";
import SpecialtyFormModal from "./SpecialtyFormModal";

interface SpecialtiesCardProps {
  specialties: Specialty[];
  loading: boolean;
  error: string | null;
  onSave: (values: SpecialtyFormValues, specialty: Specialty | null) => Promise<void>;
  onRemove: (specialty: Specialty) => Promise<void>;
}

/** Catálogo de especialidades de la clínica: nombre y duración del bloque de agenda. */
export default function SpecialtiesCard({ specialties, loading, error, onSave, onRemove }: SpecialtiesCardProps) {
  const dialogs = useCrudDialogs<Specialty, SpecialtyFormValues>({
    save: onSave,
    remove: onRemove,
    saveError: "No se pudo guardar la especialidad.",
    removeError: "No se pudo desactivar la especialidad.",
  });

  const columns: TableColumn<Specialty>[] = [
    { key: "name", header: "Especialidad", render: (s) => s.name },
    { key: "duration", header: "Duración del bloque", render: (s) => `${s.durationMinutes} min` },
    {
      key: "actions",
      header: "Acciones",
      render: (s) => (
        <div className="vc-row-actions">
          <IconButton label={`Editar ${s.name}`} onClick={() => dialogs.form.openEdit(s)}>
            <SquarePen size={16} />
          </IconButton>
          <IconButton label={`Desactivar ${s.name}`} variant="danger" onClick={() => dialogs.remove.ask(s)}>
            <Trash2 size={16} />
          </IconButton>
        </div>
      ),
    },
  ];

  return (
    <Card
      title="Especialidades"
      subtitle="La duración define el largo de cada bloque de agenda."
      actions={
        <Button variant="primary" onClick={dialogs.form.openNew}>
          <Plus size={16} /> Nueva especialidad
        </Button>
      }
    >
      <DataTable
        columns={columns}
        rows={specialties}
        getRowKey={(s) => s.id}
        loading={loading}
        error={error}
        emptyMessage="Aún no hay especialidades. Crea la primera para poder asignarla a los veterinarios."
      />

      {dialogs.form.open && (
        <SpecialtyFormModal
          specialty={dialogs.form.item}
          error={dialogs.error}
          onClose={dialogs.form.close}
          onSubmit={dialogs.form.submit}
        />
      )}

      {dialogs.remove.item && (
        <ConfirmDialog
          title="Desactivar especialidad"
          message={`¿Desactivar ${dialogs.remove.item.name}? Dejará de ofrecerse para nuevas reservas; las citas ya agendadas se mantienen.`}
          confirmLabel="Desactivar"
          error={dialogs.error}
          onCancel={dialogs.remove.cancel}
          onConfirm={dialogs.remove.confirm}
        />
      )}
    </Card>
  );
}
