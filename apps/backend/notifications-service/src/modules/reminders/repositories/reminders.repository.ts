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

  /**
   * Reclamo atómico: un UPDATE condicional pasa el recordatorio de 'pending'
   * a 'processing'. Si dos procesos lo intentan a la vez, solo uno obtiene
   * affected = 1 y es el único que lo envía.
   */
  async claim(id: string): Promise<boolean> {
    const result = await this.repo.update({ id, status: 'pending' }, { status: 'processing' });
    return (result.affected ?? 0) === 1;
  }

  /** Al arrancar el servicio: devuelve a 'pending' los que quedaron en 'processing' por una caída. */
  async resetProcessing(): Promise<number> {
    const result = await this.repo.update({ status: 'processing' }, { status: 'pending' });
    return result.affected ?? 0;
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
   * (se acabaron los reintentos); si no, vuelve a 'pending' con `fireAt`
   * movido a `retryAt` (backoff entre reintentos).
   */
  async registerFailure(
    id: string,
    message: string,
    attempts: number,
    giveUp: boolean,
    retryAt?: Date,
  ): Promise<void> {
    await this.repo.update(id, {
      attempts,
      lastError: message,
      status: giveUp ? 'error' : 'pending',
      ...(!giveUp && retryAt ? { fireAt: retryAt } : {}),
    });
  }
}