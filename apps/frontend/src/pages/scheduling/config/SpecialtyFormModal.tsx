import type { FormEvent } from "react";
import Button from "../../../components/common/Button";
import FormField from "../../../components/common/FormField";
import Modal from "../../../components/feedback/Modal";
import type { Specialty, SpecialtyFormValues } from "../../../types/agenda.types";

interface SpecialtyFormModalProps {
  /** Especialidad a editar; `null` para crear una nueva. */
  specialty: Specialty | null;
  error?: string | null;
  onClose: () => void;
  onSubmit: (values: SpecialtyFormValues) => void | Promise<void>;
}

/** Alta y edición de una especialidad: nombre y duración del bloque (5 a 480 min). */
export default function SpecialtyFormModal({ specialty, error, onClose, onSubmit }: SpecialtyFormModalProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    void onSubmit({
      name: String(form.get("name")).trim(),
      durationMinutes: Number(form.get("durationMinutes")),
    });
  };

  return (
    <Modal title={specialty ? "Editar especialidad" : "Nueva especialidad"} onClose={onClose}>
      <form className="vc-modal-form" onSubmit={handleSubmit}>
        <FormField
          label="Nombre"
          name="name"
          type="text"
          defaultValue={specialty?.name}
          placeholder="Dermatología"
          maxLength={100}
          required
        />
        <FormField
          label="Duración del bloque (minutos)"
          name="durationMinutes"
          type="number"
          min={5}
          max={480}
          step={1}
          defaultValue={specialty?.durationMinutes ?? 30}
          required
        />
        {error && (
          <p className="vc-modal-error" role="alert">
            {error}
          </p>
        )}
        <div className="vc-modal-actions">
          <Button type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary">
            {specialty ? "Guardar cambios" : "Crear especialidad"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
