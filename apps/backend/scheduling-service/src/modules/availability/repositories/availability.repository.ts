import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AvailabilitySlot } from '../entities/availability-slot.entity';

/**
 * [A3] Repositorio tipado de scheduling.availability_slots. Regla estricta
 * del documento de estructura de carpetas: este repositorio SOLO ejecuta
 * sentencias sobre scheduling.*, nunca un JOIN a otro esquema.
 */
@Injectable()
export class AvailabilityRepository {
  constructor(
    @InjectRepository(AvailabilitySlot)
    private readonly repo: Repository<AvailabilitySlot>,
  ) {}

  findById(id: string): Promise<AvailabilitySlot | null> {
    return this.repo.findOne({ where: { id } });
  }

  /** Bloques libres de un veterinario para una especialidad, a futuro. */
  findFreeSlots(vetUserId: string, specialtyId: string): Promise<AvailabilitySlot[]> {
    return this.repo
      .createQueryBuilder('slot')
      .where('slot.vet_user_id = :vetUserId', { vetUserId })
      .andWhere('slot.specialty_id = :specialtyId', { specialtyId })
      .andWhere('slot.estado = :estado', { estado: 'libre' })
      .andWhere('slot.inicio > NOW()')
      .orderBy('slot.inicio', 'ASC')
      .getMany();
  }

  /**
   * Bloqueo de fila para la futura tarea de reserva (BR-5): dentro de una
   * transacción, `SELECT ... FOR UPDATE` sobre este slot antes de
   * confirmarlo, exactamente como describe el manual técnico.
   */
  lockForUpdate(id: string, manager = this.repo.manager): Promise<AvailabilitySlot | null> {
    return manager
      .createQueryBuilder(AvailabilitySlot, 'slot')
      .setLock('pessimistic_write')
      .where('slot.id = :id', { id })
      .getOne();
  }
}
