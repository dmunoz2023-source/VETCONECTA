export interface PushPayload {
  title: string;
  body: string;
  /** Datos extra para que la app abra la pantalla correcta (valores siempre string). */
  data?: Record<string, string>;
}

export interface PushResult {
  ok: boolean;
  /** true si el proveedor indica que el token ya no sirve (se elimina de la BD). */
  invalidToken?: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Contrato del envío de notificaciones push. Hoy lo implementa un envío
 * simulado; cuando exista la credencial de Firebase se agrega una clase
 * FirebasePushSender con la misma interfaz y se cambia solo el provider.
 */
export interface PushSender {
  send(token: string, payload: PushPayload): Promise<PushResult>;
}

export const PUSH_SENDER = Symbol('PUSH_SENDER');
