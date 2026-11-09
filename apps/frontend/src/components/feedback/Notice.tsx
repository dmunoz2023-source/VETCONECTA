import { CheckCircle2, X } from "lucide-react";
import IconButton from "../common/IconButton";
import css from "./Notice.module.css";

interface NoticeProps {
  message: string;
  onDismiss: () => void;
}

/** Success notice that the user can close. */
export default function Notice({ message, onDismiss }: NoticeProps) {
  return (
    <div className={css.notice} role="status">
      <CheckCircle2 size={18} aria-hidden="true" />
      <span className={css.message}>{message}</span>
      <IconButton label="Cerrar aviso" onClick={onDismiss}>
        <X size={16} />
      </IconButton>
    </div>
  );
}
