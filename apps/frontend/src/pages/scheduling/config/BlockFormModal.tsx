import { useState, type FormEvent } from "react";
import Button from "../../../components/common/Button";
import FormField from "../../../components/common/FormField";
import SelectField from "../../../components/common/SelectField";
import Modal from "../../../components/feedback/Modal";
import {
  VET_BLOCK_REASONS,
  type BlockFormValues,
  type Specialty,
  type VetBlock,
  type VetBlockReason,
  type VetSchedule,
} from "../../../types/agenda.types";
import { BLOCK_REASON_LABELS, WEEKDAY_LABELS, clinicToday, isSlotBlocked, slotsForWeekday, weekdayOf } from "../../../utils/agenda";

interface BlockFormModalProps {
  /** Bloqueo a editar; `null` para crear uno nuevo. */
  block: VetBlock | null;
  schedules: VetSchedule[];
  vetSpecialties: Specialty[];
  error?: string | null;
  onClose: () => void;
  onSubmit: (values: BlockFormValues) => void | Promise<void>;
}

const REASON_OPTIONS = VET_BLOCK_REASONS.map((reason) => ({ value: reason, label: BLOCK_REASON_LABELS[reason] }));

const isReason = (value: string): value is VetBlockReason => (VET_BLOCK_REASONS as readonly string[]).includes(value);

/** Valores iniciales; un bloqueo antiguo con motivo en texto libre se edita como "Otro" con ese texto en notas. */
function initialValues(block: VetBlock | null): BlockFormValues {
  if (!block) return { date: clinicToday(), startTime: null, endTime: null, reason: "vacation", notes: null };
  const legacy = !isReason(block.reason);
  return {
    date: block.date,
    startTime: block.startTime,
    endTime: block.endTime,
    reason: legacy ? "other" : (block.reason as VetBlockReason),
    notes: legacy ? block.reason : (block.notes ?? null),
  };
}

/**
 * Alta y edición de un bloqueo (fecha, horas o día completo, motivo). Muestra
 * cómo queda la agenda de ese día: qué bloques se pierden y cuáles siguen libres.
 */
export default function BlockFormModal({ block, schedules, vetSpecialties, error, onClose, onSubmit }: BlockFormModalProps) {
  const [values, setValues] = useState<BlockFormValues>(() => initialValues(block));
  const [fullDay, setFullDay] = useState(!block?.startTime);
  const [previewId, setPreviewId] = useState(vetSpecialties[0]?.id ?? "");
  const [localError, setLocalError] = useState<string | null>(null);

  const update = (patch: Partial<BlockFormValues>) => setValues((prev) => ({ ...prev, ...patch }));

  const toggleFullDay = (checked: boolean) => {
    setFullDay(checked);
    update(checked ? { startTime: null, endTime: null } : { startTime: "09:00", endTime: "13:00" });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!fullDay && (!values.startTime || !values.endTime || values.endTime <= values.startTime)) {
      setLocalError("La hora de fin debe ser mayor a la hora de inicio.");
      return;
    }
    const notes = values.notes?.trim() || null;
    if (values.reason === "other" && !notes) {
      setLocalError("Describe el motivo del bloqueo.");
      return;
    }
    setLocalError(null);
    void onSubmit({ ...values, notes });
  };

  const preview = vetSpecialties.find((s) => s.id === previewId) ?? vetSpecialties[0] ?? null;
  const weekday = values.date ? weekdayOf(values.date) : null;
  const slots = preview && weekday !== null ? slotsForWeekday(schedules, weekday, preview.durationMinutes) : [];
  const rangeReady = fullDay || (values.startTime && values.endTime && values.startTime < values.endTime);
  const blocked = rangeReady ? slots.filter((slot) => isSlotBlocked(slot, values)) : [];
  const shownError = localError ?? error;

  return (
    <Modal title={block ? "Editar bloqueo" : "Nuevo bloqueo"} onClose={onClose}>
      <form className="vc-modal-form" onSubmit={handleSubmit}>
        <FormField
          label="Fecha"
          type="date"
          value={values.date}
          min={block ? undefined : clinicToday()}
          onChange={(e) => update({ date: e.target.value })}
          required
        />
        <label className="vc-check">
          <input type="checkbox" checked={fullDay} onChange={(e) => toggleFullDay(e.target.checked)} />
          Bloquear el día completo
        </label>
        {!fullDay && (
          <>
            <FormField
              label="Desde"
              type="time"
              value={values.startTime ?? ""}
              onChange={(e) => update({ startTime: e.target.value || null })}
              required
            />
            <FormField
              label="Hasta"
              type="time"
              value={values.endTime ?? ""}
              onChange={(e) => update({ endTime: e.target.value || null })}
              required
            />
          </>
        )}
        <SelectField
          label="Motivo"
          value={values.reason}
          onChange={(e) => update({ reason: e.target.value as VetBlockReason })}
          options={REASON_OPTIONS}
          required
        />
        {values.reason === "other" && (
          <FormField
            label="Detalle del motivo"
            type="text"
            value={values.notes ?? ""}
            maxLength={200}
            placeholder="Congreso de medicina felina"
            onChange={(e) => update({ notes: e.target.value })}
            required
          />
        )}

        <div className="vc-preview">
          <p className="vc-preview-title">
            Vista previa{weekday !== null ? ` del ${WEEKDAY_LABELS[weekday].toLowerCase()}` : ""}
          </p>
          {vetSpecialties.length > 1 && (
            <SelectField
              label="Especialidad"
              value={preview?.id ?? ""}
              onChange={(e) => setPreviewId(e.target.value)}
              options={vetSpecialties.map((s) => ({ value: s.id, label: `${s.name} (${s.durationMinutes} min)` }))}
            />
          )}
          {!preview && <p className="vc-preview-empty">Asigna una especialidad al veterinario para ver los bloques.</p>}
          {preview && slots.length === 0 && (
            <p className="vc-preview-empty">El veterinario no atiende ese día: el bloqueo no quita horas.</p>
          )}
          {preview && slots.length > 0 && (
            <>
              <ul className="vc-slot-list">
                {slots.map((slot) => {
                  const isBlocked = blocked.includes(slot);
                  return (
                    <li key={slot.startTime} className={isBlocked ? "is-blocked" : ""}>
                      {slot.startTime}
                    </li>
                  );
                })}
              </ul>
              <p className="vc-preview-hint">
                Se bloquean {blocked.length} de {slots.length} bloques; quedan {slots.length - blocked.length} disponibles.
              </p>
            </>
          )}
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
            {block ? "Guardar cambios" : "Crear bloqueo"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
