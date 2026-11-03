import { Logger } from '@nestjs/common';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import { FirebaseConfig } from '../../../config/configuration';
import { PushPayload, PushResult, PushSender } from './push-sender.interface';

/** Códigos de FCM que significan "este token ya no sirve". */
const INVALID_TOKEN_CODES = new Set([
  'messaging/registration-token-not-registered',
  'messaging/invalid-registration-token',
]);

/** Envío real con Firebase Admin SDK. */
export class FirebasePushSender implements PushSender {
  private readonly logger = new Logger(FirebasePushSender.name);

  constructor(config: FirebaseConfig) {
    if (getApps().length === 0) {
      initializeApp({
        credential: cert({
          projectId: config.projectId,
          clientEmail: config.clientEmail,
          privateKey: config.privateKey.replace(/\\n/g, '\n'),
        }),
      });
    }
  }

  async send(token: string, payload: PushPayload): Promise<PushResult> {
    try {
      const messageId = await getMessaging().send({
        token,
        notification: { title: payload.title, body: payload.body },
        data: payload.data,
        android: { priority: 'high' },
      });
      return { ok: true, messageId };
    } catch (error) {
      const code = (error as { code?: string }).code ?? 'unknown';
      this.logger.warn(`FCM rechazó el envío (${code}) a ${token.slice(0, 8)}…`);
      return { ok: false, invalidToken: INVALID_TOKEN_CODES.has(code), error: code };
    }
  }
}
