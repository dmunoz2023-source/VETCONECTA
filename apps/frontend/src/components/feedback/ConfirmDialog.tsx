import Button from "../common/Button";
import Modal from "./Modal";
import "./ConfirmDialog.css";

interface ConfirmDialogProps {
  title: string;
  /** Texto de la pregunta; puede incluir el nombre del elemento a eliminar. */
  message: string;
  confirmLabel?: string;
  /** Mensaje de error del servidor al confirmar; `null` si no hay. */
  error?: string | null;
  onCancel: () => void;
  onConfirm: () => void;
}

/** Diálogo genérico para confirmar acciones destructivas (eliminar, dar de baja, etc.). */
export default function ConfirmDialog({
  title,
  message,
  confirmLabel = "Eliminar",
  error = null,
  onCancel,
  onConfirm,
}: Readonly<ConfirmDialogProps>) {
  return (
    <Modal title={title} onClose={onCancel}>
      <p className="vc-confirm-message">{message}</p>
      {error && (
        <p className="vc-modal-error" role="alert">
          {error}
        </p>
      )}
      <div className="vc-modal-actions">
        <Button type="button" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="button" className="vc-btn-danger" onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
