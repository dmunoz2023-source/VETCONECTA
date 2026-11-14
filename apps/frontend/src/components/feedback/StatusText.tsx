import type { ReactNode } from "react";
import "./StatusText.css";

/** Discreet status text: "Cargando...", "Sin resultados", etc. */
export default function StatusText({ children }: { children: ReactNode }) {
  return <p className="vc-status-text">{children}</p>;
}
