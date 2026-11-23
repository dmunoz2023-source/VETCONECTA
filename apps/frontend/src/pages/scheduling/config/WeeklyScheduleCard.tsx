import { useState } from "react";
import { Plus, SquarePen, Trash2 } from "lucide-react";
import Button from "../../../components/common/Button";
import Card from "../../../components/common/Card";
import IconButton from "../../../components/common/IconButton";
import SelectField from "../../../components/common/SelectField";
import ConfirmDialog from "../../../components/feedback/ConfirmDialog";
import StatusText from "../../../components/feedback/StatusText";
import { useCrudDialogs } from "../../../hooks/useCrudDialogs";
import type { ScheduleFormValues, Specialty, VetSchedule } from "../../../types/agenda.types";
import { WEEKDAY_LABELS, WEEKDAY_ORDER, slotsForWeekday } from "../../../utils/agenda";
import ScheduleFormModal from "./ScheduleFormModal";

interface WeeklyScheduleCardProps {
  schedules: VetSchedule[];
  vetSpecialties: Specialty[];
  loading: boolean;
  error: string | null;
  onSave: (values: ScheduleFormValues, schedule: VetSchedule | null) => Promise<void>;
  onRemove: (schedule: VetSchedule) => Promise<void>;
}

/** Horario semanal del veterinario por día, con la vista previa de bloques por especialidad. */
export default function WeeklyScheduleCard({
  schedules,
  vetSpecialties,
  loading,
  error,
  onSave,
  onRemove,
}: WeeklyScheduleCardProps) {
  const dialogs = useCrudDialogs<VetSchedule, ScheduleFormValues>({
    save: onSave,
    remove: onRemove,
    saveError: "No se pudo guardar el turno.",
    removeError: "No se pudo eliminar el turno.",
  });
  const [previewId, setPreviewId] = useState("");
  // Si la especialidad elegida deja de estar asignada, se usa la primera del veterinario.
  const preview = vetSpecialties.find((s) => s.id === previewId) ?? vetSpecialties[0] ?? null;

  const renderWeek = () => {
    if (error) return <StatusText>{error}</StatusText>;
    if (loading && schedules.length === 0) return <StatusText>Cargando...</StatusText>;
    if (schedules.length === 0) {
      return <StatusText>Sin turnos: el veterinario no tendrá horas disponibles hasta que agregues uno.</StatusText>;
    }
    return (
      <div className="vc-week">
        {WEEKDAY_ORDER.map((day) => {
          const shifts = schedules
            .filter((s) => s.dayOfWeek === day)
            .sort((a, b) => a.startTime.localeCompare(b.startTime));
          const slots = preview ? slotsForWeekday(schedules, day, preview.durationMinutes) : [];
          return (
            <div key={day} className={`vc-week-day ${shifts.length ? "" : "is-off"}`.trim()}>
              <h3>{WEEKDAY_LABELS[day]}</h3>
              {shifts.length === 0 && <p className="vc-week-off">No atiende</p>}
              {shifts.map((shift) => (
                <div key={shift.id} className="vc-shift">
                  <span>
                    {shift.startTime} – {shift.endTime}
                  </span>
                  <span className="vc-row-actions">
                    <IconButton label={`Editar turno ${shift.startTime}`} onClick={() => dialogs.form.openEdit(shift)}>
                      <SquarePen size={14} />
                    </IconButton>
                    <IconButton
                      label={`Eliminar turno ${shift.startTime}`}
                      variant="danger"
                      onClick={() => dialogs.remove.ask(shift)}
                    >
                      <Trash2 size={14} />
                    </IconButton>
                  </span>
                </div>
              ))}
              {preview && shifts.length > 0 && (
                <p className="vc-week-slots" title={slots.map((s) => `${s.startTime}–${s.endTime}`).join(", ")}>
                  {slots.length} bloques de {preview.durationMinutes} min
                </p>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Card
      title="Horario semanal"
      subtitle="Turnos de atención por día, en hora local de la clínica."
      actions={
        <Button variant="primary" onClick={dialogs.form.openNew}>
          <Plus size={16} /> Agregar turno
        </Button>
      }
    >
      {vetSpecialties.length > 0 && (
        <div className="vc-inline-form">
          <SelectField
            label="Ver bloques para"
            value={preview?.id ?? ""}
            onChange={(e) => setPreviewId(e.target.value)}
            options={vetSpecialties.map((s) => ({ value: s.id, label: `${s.name} (${s.durationMinutes} min)` }))}
          />
        </div>
      )}

      {renderWeek()}

      {dialogs.form.open && (
        <ScheduleFormModal
          schedule={dialogs.form.item}
          vetSpecialties={vetSpecialties}
          error={dialogs.error}
          onClose={dialogs.form.close}
          onSubmit={dialogs.form.submit}
        />
      )}

      {dialogs.remove.item && (
        <ConfirmDialog
          title="Eliminar turno"
          message={`¿Eliminar el turno del ${WEEKDAY_LABELS[dialogs.remove.item.dayOfWeek].toLowerCase()} de ${dialogs.remove.item.startTime} a ${dialogs.remove.item.endTime}? Las citas ya agendadas no se cancelan.`}
          error={dialogs.error}
          onCancel={dialogs.remove.cancel}
          onConfirm={dialogs.remove.confirm}
        />
      )}
    </Card>
  );
}
