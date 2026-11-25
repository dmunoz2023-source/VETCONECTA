import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

/**
 * Mensaje de éxito enviado por la pantalla anterior en `navigate(ruta, { state: { notice } })`.
 * Se muestra una sola vez: se limpia del historial para que no reaparezca al recargar.
 */
export function useFlashNotice() {
  const location = useLocation();
  const navigate = useNavigate();
  const state: unknown = location.state;
  const incoming =
    typeof state === "object" && state !== null && "notice" in state && typeof state.notice === "string"
      ? state.notice
      : null;
  const [notice, setNotice] = useState(incoming);

  // Llega un aviso nuevo sin que la página se desmonte: se toma durante el render.
  if (incoming && incoming !== notice) setNotice(incoming);

  useEffect(() => {
    if (incoming) navigate(location.pathname + location.search, { replace: true, state: null });
  }, [incoming, navigate, location.pathname, location.search]);

  return { notice, dismiss: () => setNotice(null) };
}
