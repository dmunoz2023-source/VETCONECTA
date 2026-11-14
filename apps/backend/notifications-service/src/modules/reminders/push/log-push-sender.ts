import { Injectable, Logger } from '@nestjs/common';
import { PushPayload, PushResult, PushSender } from './push-sender.interface';

/**
 * Envío SIMULADO: escribe en el log en vez de llamar a Firebase.
 * Para probar la limpieza de tokens, cualquier token que empiece con
 * "invalid" se responde como token inválido.
 */
@Injectable()
export class LogPushSender implements PushSender {
  private readonly logger = new Logger(LogPushSender.name);

  async send(token: string, payload: PushPayload): Promise<PushResult> {
    const shortToken = `${token.slice(0, 8)}…`;

    if (token.startsWith('invalid')) {
      this.logger.warn(`[SIMULADO] Token inválido: ${shortToken}`);
      return { ok: false, invalidToken: true, error: 'Token inválido (simulado)' };
    }

    this.logger.log(`[SIMULADO] Push a ${shortToken} -> "${payload.title}": ${payload.body}`);
    return { ok: true, messageId: `simulado-${Date.now()}` };
  }
}
