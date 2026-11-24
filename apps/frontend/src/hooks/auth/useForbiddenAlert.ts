import { useEffect, useState } from "react";
import { onForbidden } from "../../api/http/sessionEvents";

/**
 * Último 403 recibido por el cliente HTTP: el rol no tiene permiso para la acción.
 * Se muestra como alerta sin cerrar la sesión (Panel web §3).
 */
export function useForbiddenAlert() {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => onForbidden(setMessage), []);

  return { message, dismiss: () => setMessage(null) };
}
