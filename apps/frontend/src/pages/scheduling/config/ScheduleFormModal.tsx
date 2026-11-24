import { useState, type FormEvent } from "react";
import Button from "../../../components/common/Button";
import FormField from "../../../components/common/FormField";
import SelectField from "../../../components/common/SelectField";
import Modal from "../../../components/feedback/Modal";
import type { ScheduleFormValues, Specialty, VetSchedule } from "../../../types/agenda.types";
import { WEEKDAY_LABELS, WEEKDAY_ORDER, leftoverMinutes, sliceShift } from "../../../utils/agenda";

interface ScheduleFormModalProps {
  /** Turno a editar; `null` para agregar uno nuevo. */
  schedule: VetSchedule | null;
  /** Especialidades del veterinario, para la vista previa de bloques. */
  vetSpecialties: Specialty[];
  error?: string | null;
  onClose: () => void;
  onSubmit: (values: ScheduleFormValues) => void | Promise<void>;
}

const DAY_OPTIONS = WEEKDAY_ORDER.map((day) => ({ value: String(day), label: WEEKDAY_LABELS[day] }));

/** Alta y edición de un turno semanal (día, inicio y fin), con vista previa de los bloques. */
export default function ScheduleFormModal({ schedule, vetSpecialties, error, onClose, onSubmit }: ScheduleFormModalProps) {
  const [values, setValues] = useState<ScheduleFormValues>({
    dayOfWeek: schedule?.dayOfWeek ?? 1,
    startTime: schedule?.startTime ?? "09:00",
    endTime: schedule?.endTime ?? "13:00",
  });
  const [localError, setLocalError] = useState<string | null>(null);

  const update = (patch: Partial<ScheduleFormValues>) => setValues((prev) => ({ ...prev, ...patch }));

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (values.endTime <= values.startTime) {
      setLocalError("La hora de fin debe ser mayor a la hora de inicio.");
      return;
    }
    setLocalError(null);
    void onSubmit(values);
  };

  const validRange = values.startTime < values.endTime;
  const shownError = localError ?? error;

  return (
    <Modal title={schedule ? "Editar turno" : "Agregar turno"} onClose={onClose}>
      <form className="vc-modal-form" onSubmit={handleSubmit}>
        <SelectField
          label="Día"
          value={String(values.dayOfWeek)}
          onChange={(e) => update({ dayOfWeek: Number(e.target.value) })}
          options={DAY_OPTIONS}
          required
        />
        <FormField
          label="Inicio"
          type="time"
          value={values.startTime}
          onChange={(e) => update({ startTime: e.target.value })}
          required
        />
        <FormField
          label="Fin"
          type="time"
          value={values.endTime}
          onChange={(e) => update({ endTime: e.target.value })}
          required
        />

        <div className="vc-preview">
          <p className="vc-preview-title">Bloques que generará este turno</p>
          {!validRange && <p className="vc-preview-empty">Indica un inicio anterior al fin.</p>}
          {validRange && vetSpecialties.length === 0 && (
            <p className="vc-preview-empty">Asigna una especialidad al veterinario para ver los bloques.</p>
          )}
          {validRange &&
            vetSpecialties.map((specialty) => {
              const slots = sliceShift(values.startTime, values.endTime, specialty.durationMinutes);
              const leftover = leftoverMinutes(values.startTime, values.endTime, specialty.durationMinutes);
              return (
                <div key={specialty.id} className="vc-preview-row">
                  <strong>
                    {specialty.name} ({specialty.durationMinutes} min): {slots.length} bloques
                  </strong>
                  <span className="vc-preview-slots">
                    {slots.length ? slots.map((slot) => slot.startTime).join(" · ") : "El turno es más corto que un bloque."}
                  </span>
                  {leftover > 0 && slots.length > 0 && (
                    <span className="vc-preview-hint">Quedan {leftover} min sin usar al final del turno.</span>
                  )}
                </div>
              );
            })}
        </div>

        {shownError && (
          <p className="vc-modal-error" role="alert">
            {shownError}
          </p>
        )}
        <div className="vc-modal-actions">
          <Button type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary">
            {schedule ? "Guardar cambios" : "Agregar turno"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
