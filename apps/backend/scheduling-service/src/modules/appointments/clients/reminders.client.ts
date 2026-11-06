import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AppConfig } from '../../../config/configuration';

export interface ScheduleReminderInput {
  appointmentId: string;
  ownerUserId: string;
  petName: string;
  startsAt: Date;
}

/**
 * [G2] Motor de avisos (notifications-service, tarea H1). Segun el diseno, si
 * notifications falla la cita NO se revierte: aqui los errores se registran y
 * se devuelve false, nunca se propagan. Un job de reconciliacion se encarga
 * despues de los recordatorios ausentes.
 */
export abstract class RemindersClient {
  abstract schedule(input: ScheduleReminderInput): Promise<boolean>;
  abstract cancel(appointmentId: string): Promise<boolean>;
}

@Injectable()
export class HttpRemindersClient extends RemindersClient {
  private readonly logger = new Logger(HttpRemindersClient.name);

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService<AppConfig, true>,
  ) {
    super();
  }

  async schedule(input: ScheduleReminderInput): Promise<boolean> {
    return this.call('programar', () =>
      this.http.post(
        `${this.baseUrl()}/internal/reminders`,
        {
          appointmentId: input.appointmentId,
          ownerUserId: input.ownerUserId,
          petName: input.petName,
          startsAt: input.startsAt.toISOString(),
        },
        this.options(),
      ),
    );
  }

  async cancel(appointmentId: string): Promise<boolean> {
    return this.call('anular', () =>
      this.http.delete(`${this.baseUrl()}/internal/reminders`, {
        ...this.options(),
        params: { type: 'appointment', refId: appointmentId },
      }),
    );
  }

  private baseUrl(): string {
    return this.config.get('notificationsServiceUrl', { infer: true });
  }

  private options() {
    return {
      headers: { 'X-Internal-Key': this.config.get('internalKey', { infer: true }) },
      timeout: 5000,
    };
  }

  private async call(action: string, request: () => ReturnType<HttpService['get']>): Promise<boolean> {
    try {
      await firstValueFrom(request());
      return true;
    } catch (error) {
      this.logger.warn(`No se pudo ${action} el recordatorio: ${(error as Error).message}`);
      return false;
    }
  }
}
