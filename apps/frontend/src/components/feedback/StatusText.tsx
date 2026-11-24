import type { ReactNode } from "react";
import "./StatusText.css";

/** Texto de estado discreto: "Cargando...", "Sin resultados", etc. */
export default function StatusText({ children }: { children: ReactNode }) {
  return <p className="vc-status-text">{children}</p>;
}
