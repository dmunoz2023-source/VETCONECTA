import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

/**
 * [A3] Mapea la tabla availability_slots de scheduling_db, la base propia
 * de scheduling-service (DDL en infra/db/scheduling-service/00-tables.sql).
 * `schema: 'scheduling'` debe coincidir con el esquema donde ese DDL crea la
 * tabla, igual que en database.module.ts y en el resto de las entidades.
 *
 * vetUserId y specialtyId son UUID planos, sin relación de TypeORM hacia
 * catalog-service: catalog vive en otra base (catalog_db), así que esa
 * validación cruzada se hace por HTTP interno, nunca con un JOIN ni una FK.
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
