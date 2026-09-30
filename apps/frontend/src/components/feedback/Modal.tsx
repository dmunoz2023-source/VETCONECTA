import type { ReactNode } from "react";
import { X } from "lucide-react";
import IconButton from "../common/IconButton";

interface ModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
}

/** Modal generico: cierra al hacer clic fuera o en la X */
export default function Modal({ title, onClose, children }: ModalProps) {
  return (
    <div className="vc-modal-overlay" onClick={onClose}>
      <div className="vc-modal" onClick={(e) => e.stopPropagation()}>
        <div className="vc-modal-header">
          <h2>{title}</h2>
          <IconButton label="Cerrar" onClick={onClose}>
            <X size={18} />
          </IconButton>
        </div>
        {children}
      </div>
    </div>
  );
}
