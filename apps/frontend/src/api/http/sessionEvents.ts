/**
 * Avisos del cliente HTTP hacia la interfaz (Panel web §3):
 * - `unauthorized`: el token venció o no es válido (401) → la sesión se cierra y se vuelve a /login.
 * - `forbidden`: el rol no tiene permiso (403) → se muestra una alerta sin cerrar la sesión.
 * La capa api/ no conoce React: AuthProvider y el layout se suscriben a estos avisos.
 */
type Listener<T> = (payload: T) => void;

function createChannel<T>() {
  const listeners = new Set<Listener<T>>();
  return {
    emit: (payload: T) => listeners.forEach((listener) => listener(payload)),
    /** Registra `listener` y devuelve la función para darlo de baja. */
    subscribe: (listener: Listener<T>) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

const unauthorized = createChannel<void>();
const forbidden = createChannel<string>();

export const emitUnauthorized = () => unauthorized.emit();
export const onUnauthorized = unauthorized.subscribe;

export const emitForbidden = (message: string) => forbidden.emit(message);
export const onForbidden = forbidden.subscribe;
