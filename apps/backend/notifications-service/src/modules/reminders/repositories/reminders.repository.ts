import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, Repository } from 'typeorm';
import { ScheduledReminder } from '../entities/scheduled-reminder.entity';

/**
 * [H1] Repositorio tipado — capa de persistencia exclusiva de
 * `notifications.scheduled_reminders`. No consulta tablas de otros esquemas.
 */
@Injectable()
export class RemindersRepository {
  constructor(
    @InjectRepository(ScheduledReminder)
    private readonly repo: Repository<ScheduledReminder>,
  ) {}

  findById(id: string): Promise<ScheduledReminder | null> {
    return this.repo.findOne({ where: { id } });
  }

  /** Busca el recordatorio de una referencia */
  findByRef(type: string, refId: string): Promise<ScheduledReminder | null> {
    return this.repo.findOne({ where: { type, refId } });
  }

  create(data: Partial<ScheduledReminder>): Promise<ScheduledReminder> {
    return this.repo.save(this.repo.create(data));
  }

  /** Recordatorios pendientes cuya hora de disparo ya llegó; los usa el job programado. */
  findDue(now: Date, limit = 50): Promise<ScheduledReminder[]> {
    return this.repo.find({
      where: { status: 'pending', fireAt: LessThanOrEqual(now) },
      order: { fireAt: 'ASC' },
      take: limit,
    });
  }

  async markSent(id: string): Promise<void> {
    await this.repo.update(id, { status: 'sent' });
  }

  /**
   * Cancela los recordatorios pendientes de una referencia (cita cancelada).
   * Devuelve cuántos se cancelaron.
   */
  async cancelByRef(type: string, refId: string): Promise<number> {
    const result = await this.repo.update(
      { type, refId, status: 'pending' },
      { status: 'cancelled' },
    );
    return result.affected ?? 0;
  }

  /**
   * Registra un intento fallido. Si `giveUp` es true queda en 'error'
   * (se acabaron los reintentos); si no, vuelve a 'pending' para reintentar.
   */
  async registerFailure(
    id: string,
    message: string,
    attempts: number,
    giveUp: boolean,
  ): Promise<void> {
    await this.repo.update(id, {
      attempts,
      lastError: message,
      status: giveUp ? 'error' : 'pending',
    });
  }
}