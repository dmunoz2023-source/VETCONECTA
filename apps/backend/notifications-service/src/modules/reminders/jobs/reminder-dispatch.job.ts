import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SchedulerRegistry } from '@nestjs/schedule';
import { ReminderDispatcherService } from '../services/reminder-dispatcher.service';

const JOB_NAME = 'reminder-dispatch';

/**
 * [H1] Job programado (@nestjs/schedule): cada REMINDER_POLL_SECONDS revisa los
 * recordatorios pendientes vencidos y los entrega. El intervalo se lee de la
 * configuración, así se puede bajar a pocos segundos para probar.
 */
@Injectable()
export class ReminderDispatchJob implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ReminderDispatchJob.name);
  private running = false;

  constructor(
    private readonly dispatcher: ReminderDispatcherService,
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly configService: ConfigService,
  ) {}

  onModuleInit(): void {
    const seconds = this.configService.get<number>('reminderPollSeconds') ?? 300;
    const handle = setInterval(() => void this.run(), seconds * 1000);
    this.schedulerRegistry.addInterval(JOB_NAME, handle);
    this.logger.log(`Job de recordatorios activo: revisa cada ${seconds} s`);
  }

  onModuleDestroy(): void {
    if (this.schedulerRegistry.doesExist('interval', JOB_NAME)) {
      this.schedulerRegistry.deleteInterval(JOB_NAME);
    }
  }

  async run(): Promise<void> {
    if (this.running) return; // no solapar ejecuciones
    this.running = true;
    try {
      const taken = await this.dispatcher.dispatchDue();
      if (taken > 0) {
        this.logger.log(`Job: ${taken} recordatorio(s) procesado(s)`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error(`Fallo en el job de recordatorios: ${message}`);
    } finally {
      this.running = false;
    }
  }
}
