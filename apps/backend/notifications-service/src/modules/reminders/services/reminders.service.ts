import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreateReminderDto } from '../dto/create-reminder.dto';
import { ReminderResponse } from '../dto/reminder-response.dto';
import { RemindersRepository } from '../repositories/reminders.repository';
import { REMINDER_TYPE_APPOINTMENT } from '../reminders.constants';
import { ReminderDispatcherService } from './reminder-dispatcher.service';

/**
 * [H1] Capa de aplicación: reglas de negocio de los recordatorios de cita.
 * - BR-7: cada cita reservada genera un recordatorio 24 h antes.
 * - Si faltan menos de 24 h, el aviso se envía de inmediato.
 * - No se duplica el recordatorio de una misma cita.
 */
@Injectable()
export class RemindersService {
  private readonly logger = new Logger(RemindersService.name);
  private readonly leadMinutes: number;

  constructor(
    private readonly remindersRepository: RemindersRepository,
    private readonly dispatcher: ReminderDispatcherService,
    configService: ConfigService,
  ) {
    this.leadMinutes = configService.get<number>('reminderLeadMinutes') ?? 1440;
  }

  async scheduleAppointmentReminder(dto: CreateReminderDto): Promise<ReminderResponse> {
    const startsAt = new Date(dto.startsAt);
    const now = new Date();

    if (startsAt.getTime() <= now.getTime()) {
      throw new BadRequestException('La cita ya pasó: no se puede programar un recordatorio');
    }

    const existing = await this.remindersRepository.findByRef(
      REMINDER_TYPE_APPOINTMENT,
      dto.appointmentId,
    );
    if (existing) {
      return {
        id: existing.id,
        appointmentId: dto.appointmentId,
        fireAt: existing.fireAt,
        status: existing.status,
        immediate: false,
        alreadyExisted: true,
      };
    }

    const nominalFireAt = new Date(startsAt.getTime() - this.leadMinutes * 60_000);
    const immediate = nominalFireAt.getTime() <= now.getTime();
    const fireAt = immediate ? now : nominalFireAt;

    const reminder = await this.remindersRepository.create({
      type: REMINDER_TYPE_APPOINTMENT,
      refId: dto.appointmentId,
      userId: dto.ownerUserId,
      title: 'Recordatorio de cita',
      body: `Tu cita para ${dto.petName} es el ${this.formatDate(startsAt)}`,
      fireAt,
      status: 'pending',
    });

    if (immediate) {
      // No se espera el envio
      this.dispatcher.dispatchById(reminder.id).catch((error: unknown) => {
        const message = error instanceof Error ? error.message : 'Error desconocido';
        this.logger.error(`Envío inmediato fallido para ${reminder.id}: ${message}`);
      });
    }

    return {
      id: reminder.id,
      appointmentId: dto.appointmentId,
      fireAt: reminder.fireAt,
      status: reminder.status,
      immediate,
      alreadyExisted: false,
    };
  }

  /** Cancela los recordatorios pendientes de una referencia (ej. cita cancelada). */
  async cancelByRef(type: string, refId: string): Promise<{ cancelled: number }> {
    const cancelled = await this.remindersRepository.cancelByRef(type, refId);
    return { cancelled };
  }

  private formatDate(date: Date): string {
    return date.toLocaleString('es-CL', {
      timeZone: 'America/Santiago',
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
