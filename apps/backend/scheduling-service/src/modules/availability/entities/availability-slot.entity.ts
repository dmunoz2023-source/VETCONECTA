import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

/**
 * [A3] Mapea scheduling.availability_slots tal como está definida en
 * infra/db/01-tables.sql. `schema: 'scheduling'` es obligatorio: sin esto,
 * TypeORM buscaría la tabla en el esquema por defecto (public) y no la
 * encontraría, o peor, chocaría con una tabla de otro esquema con el mismo
 * nombre.
 *
 * vetUserId y specialtyId son UUID planos, sin relación de TypeORM hacia
 * catalog-service: esa validación cruzada se hace por HTTP interno
 * (regla de oro de la arquitectura), nunca con un JOIN ni una FK física.
 */
@Entity({ name: 'availability_slots', schema: 'scheduling' })
@Unique('uq_slot_vet_start', ['vetUserId', 'startTime'])
export class AvailabilitySlot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'vet_user_id', type: 'uuid' })
  vetUserId: string;

  @Column({ name: 'specialty_id', type: 'uuid' })
  specialtyId: string;

  @Column({ name: 'start_time', type: 'timestamptz' })
  startTime: Date;

  @Column({ name: 'end_time', type: 'timestamptz' })
  endTime: Date;

  @Column({ name: 'status', type: 'varchar', length: 20 })
  status: 'available' | 'booked' | 'blocked';

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy: string | null;
}
