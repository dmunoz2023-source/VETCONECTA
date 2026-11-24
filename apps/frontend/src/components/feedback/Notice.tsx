import { X } from "lucide-react";
import IconButton from "../common/IconButton";
import "./Notice.css";

interface NoticeProps {
  message: string;
  onDismiss: () => void;
  /** `success` (por defecto) confirma una acción; `error` avisa que algo no se pudo hacer. */
  tone?: "success" | "error";
}

/** Aviso que el usuario puede cerrar. */
export default function Notice({ message, onDismiss, tone = "success" }: NoticeProps) {
  const isError = tone === "error";
  return (
    <div className={isError ? "vc-notice vc-notice--error" : "vc-notice"} role={isError ? "alert" : "status"}>
      <span>{message}</span>
      <IconButton label="Cerrar aviso" onClick={onDismiss}>
        <X size={16} />
      </IconButton>
    </div>
  );
}
