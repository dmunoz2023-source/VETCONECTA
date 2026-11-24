import { useState } from "react";
import { Plus, SquarePen, Trash2 } from "lucide-react";
import Button from "../../../components/common/Button";
import Card from "../../../components/common/Card";
import IconButton from "../../../components/common/IconButton";
import ConfirmDialog from "../../../components/feedback/ConfirmDialog";
import DataTable, { type TableColumn } from "../../../components/tables/DataTable";
import { getErrorMessage } from "../../../api/http/errors";
import { useCrudDialogs } from "../../../hooks/common/useCrudDialogs";
import type { BlockFormValues, Specialty, VetBlock, VetBlockResult, VetSchedule } from "../../../types/agenda.types";
import { WEEKDAY_LABELS, formatBlockRange, formatBlockReason, weekdayOf } from "../../../utils/agenda";
import { formatDate } from "../../../utils/formatters";
import AffectedAppointmentsDialog from "./AffectedAppointmentsDialog";
import BlockFormModal from "./BlockFormModal";

interface BlocksCardProps {
  blocks: VetBlock[];
  schedules: VetSchedule[];
  vetSpecialties: Specialty[];
  loading: boolean;
  error: string | null;
  onSave: (values: BlockFormValues, block: VetBlock | null) => Promise<VetBlockResult | null>;
  onRemove: (block: VetBlock) => Promise<void>;
  /** Aviso de éxito para la página. */
  onNotice: (message: string) => void;
}

interface SavedWarning {
  result: VetBlockResult;
  /** `true` si el bloqueo se acaba de crear (se puede deshacer borrándolo). */
  created: boolean;
}

/** Bloqueos vigentes del veterinario (vacaciones, feriados...) y advertencia de citas afectadas. */
export default function BlocksCard({
  blocks,
  schedules,
  vetSpecialties,
  loading,
  error,
  onSave,
  onRemove,
  onNotice,
}: BlocksCardProps) {
  const [warning, setWarning] = useState<SavedWarning | null>(null);
  const [undoError, setUndoError] = useState<string | null>(null);

  const dialogs = useCrudDialogs<VetBlock, BlockFormValues, { result: VetBlockResult | null; created: boolean }>({
    save: async (values, block) => ({ result: await onSave(values, block), created: block === null }),
    remove: async (block) => {
      await onRemove(block);
      onNotice("Bloqueo eliminado.");
    },
    onSaved: ({ result, created }) => {
      if (!result) return;
      if (result.affectedAppointments.length > 0) setWarning({ result, created });
      else onNotice(created ? "Bloqueo creado. No había citas en ese horario." : "Bloqueo actualizado.");
    },
    saveError: "No se pudo guardar el bloqueo.",
    removeError: "No se pudo eliminar el bloqueo.",
  });

  const closeWarning = () => {
    setWarning(null);
    setUndoError(null);
  };

  const undo = async () => {
    if (!warning) return;
    setUndoError(null);
    try {
      await onRemove(warning.result.block);
      closeWarning();
      onNotice("Bloqueo deshecho.");
    } catch (err: unknown) {
      setUndoError(getErrorMessage(err, "No se pudo deshacer el bloqueo."));
    }
  };

  const columns: TableColumn<VetBlock>[] = [
    {
      key: "date",
      header: "Fecha",
      render: (b) => `${WEEKDAY_LABELS[weekdayOf(b.date)]} ${formatDate(b.date)}`,
    },
    { key: "range", header: "Horario", render: formatBlockRange },
    {
      key: "reason",
      header: "Motivo",
      render: (b) => (b.notes ? `${formatBlockReason(b.reason)}: ${b.notes}` : formatBlockReason(b.reason)),
    },
    {
      key: "actions",
      header: "Acciones",
      render: (b) => (
        <div className="vc-row-actions">
          <IconButton label={`Editar bloqueo del ${formatDate(b.date)}`} onClick={() => dialogs.form.openEdit(b)}>
            <SquarePen size={16} />
          </IconButton>
          <IconButton
            label={`Eliminar bloqueo del ${formatDate(b.date)}`}
            variant="danger"
            onClick={() => dialogs.remove.ask(b)}
          >
            <Trash2 size={16} />
          </IconButton>
        </div>
      ),
    },
  ];

  return (
    <Card
      title="Bloqueos"
      subtitle="Días u horas en que el veterinario no atiende. Se muestran desde hoy."
      actions={
        <Button variant="primary" onClick={dialogs.form.openNew}>
          <Plus size={16} /> Nuevo bloqueo
        </Button>
      }
    >
      <DataTable
        columns={columns}
        rows={blocks}
        getRowKey={(b) => b.id}
        loading={loading}
        error={error}
        emptyMessage="No hay bloqueos próximos."
      />

      {dialogs.form.open && (
        <BlockFormModal
          block={dialogs.form.item}
          schedules={schedules}
          vetSpecialties={vetSpecialties}
          error={dialogs.error}
          onClose={dialogs.form.close}
          onSubmit={dialogs.form.submit}
        />
      )}

      {dialogs.remove.item && (
        <ConfirmDialog
          title="Eliminar bloqueo"
          message={`¿Eliminar el bloqueo del ${formatDate(dialogs.remove.item.date)} (${formatBlockRange(dialogs.remove.item)})? Esas horas vuelven a quedar disponibles.`}
          error={dialogs.error}
          onCancel={dialogs.remove.cancel}
          onConfirm={dialogs.remove.confirm}
        />
      )}

      {warning && (
        <AffectedAppointmentsDialog
          block={warning.result.block}
          appointments={warning.result.affectedAppointments}
          error={undoError}
          onUndo={warning.created ? () => void undo() : undefined}
          onClose={closeWarning}
        />
      )}
    </Card>
  );
}
