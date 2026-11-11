import { X } from "lucide-react";
import IconButton from "../common/IconButton";

interface NoticeProps {
  message: string;
  onDismiss: () => void;
}

/** Aviso de éxito que el usuario puede cerrar. */
export default function Notice({ message, onDismiss }: NoticeProps) {
  return (
    <div className="vc-notice" role="status">
      <span>{message}</span>
      <IconButton label="Cerrar aviso" onClick={onDismiss}>
        <X size={16} />
      </IconButton>
    </div>
  );
}
