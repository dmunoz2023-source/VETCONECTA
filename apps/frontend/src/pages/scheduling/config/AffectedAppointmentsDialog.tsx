import Button from "../../../components/common/Button";
import Modal from "../../../components/feedback/Modal";
import type { AffectedAppointment, VetBlock } from "../../../types/agenda.types";
import { formatClinicDateTime } from "../../../utils/agenda";
import { formatDate } from "../../../utils/formatters";

/** Estados de cita que devuelve scheduling-service, en español. */
const STATUS_LABELS: Record<string, string> = {
  booked: "Reservada",
  confirmed: "Confirmada",
};

interface AffectedAppointmentsDialogProps {
  block: VetBlock;
  appointments: AffectedAppointment[];
  /** Mensaje de error al deshacer; `null` si no hay. */
  error?: string | null;
  /** Solo para un bloqueo recién creado: lo elimina. Al editar no se ofrece (no hay versión anterior). */
  onUndo?: () => void;
  onClose: () => void;
}

/**
 * Advertencia tras guardar un bloqueo que cae sobre citas vigentes. La API no
 * las cancela: recepción debe reprogramarlas o deshacer el bloqueo.
 */
export default function AffectedAppointmentsDialog({ block, appointments, error, onUndo, onClose }: AffectedAppointmentsDialogProps) {
  return (
    <Modal title="Hay citas dentro del bloqueo" onClose={onClose}>
      <p className="vc-confirm-message">
        El bloqueo quedó guardado, pero {appointments.length === 1 ? "hay 1 cita reservada" : `hay ${appointments.length} citas reservadas`} en
        ese horario. No se cancelan automáticamente: contacta a los dueños para reprogramarlas
        {onUndo ? " o deshaz el bloqueo." : "."}
      </p>
      <ul className="vc-affected-list">
        {appointments.map((appointment) => (
          <li key={appointment.id}>
            <strong>{formatClinicDateTime(appointment.startTime)}</strong>
            <span>{STATUS_LABELS[appointment.status] ?? appointment.status}</span>
          </li>
        ))}
      </ul>
      {error && (
        <p className="vc-modal-error" role="alert">
          {error}
        </p>
      )}
      <div className="vc-modal-actions">
        {onUndo && (
          <Button type="button" className="vc-btn-danger" onClick={onUndo}>
            Deshacer bloqueo del {formatDate(block.date)}
          </Button>
        )}
        <Button type="button" variant="primary" onClick={onClose}>
          Entendido
        </Button>
      </div>
    </Modal>
  );
}
