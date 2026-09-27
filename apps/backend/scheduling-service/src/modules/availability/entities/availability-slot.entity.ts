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
@Unique('uq_slot_vet_inicio', ['vetUserId', 'inicio'])
export class AvailabilitySlot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'vet_user_id', type: 'uuid' })
  vetUserId: string;

  @Column({ name: 'specialty_id', type: 'uuid' })
  specialtyId: string;

  @Column({ type: 'timestamptz' })
  inicio: Date;

  @Column({ type: 'timestamptz' })
  fin: Date;

  @Column({ type: 'varchar', length: 20 })
  estado: 'libre' | 'reservado' | 'bloqueado';

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy: string | null;
}
