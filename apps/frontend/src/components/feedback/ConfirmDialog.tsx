import Button from "../common/Button";
import Modal from "./Modal";
import "./ConfirmDialog.css";

interface ConfirmDialogProps {
  title: string;
  /** Question text; it can include the name of the item to delete. */
  message: string;
  confirmLabel?: string;
  /** Server error message on confirm; `null` if none. */
  error?: string | null;
  onCancel: () => void;
  onConfirm: () => void;
}

/** Generic dialog to confirm destructive actions (delete, deactivate, etc.). */
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
