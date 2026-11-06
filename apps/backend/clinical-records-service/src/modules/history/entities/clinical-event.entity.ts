import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { VaccinationDetail } from './vaccination-detail.entity';

export type ClinicalEventType = 'consultation' | 'vaccine' | 'checkup';

export const CLINICAL_EVENT_TYPES: ClinicalEventType[] = ['consultation', 'vaccine', 'checkup'];

/** Las columnas DECIMAL llegan de pg como texto; se exponen como número (o null). */
const decimalTransformer = {
  to: (value?: number | null) => value,
  from: (value?: string | null) => (value === null || value === undefined ? null : Number(value)),
};

/**
 * [F3] Mapea clinical.clinical_events tal como la define infra/db/01-tables.sql.
 * `petId` y `vetUserId` son UUID planos: la mascota vive en clients_pets y el
 * veterinario en otro servicio, así que no hay relación de TypeORM hacia ellos.
 */
@Entity({ name: 'clinical_events', schema: 'clinical' })
export class ClinicalEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'pet_id', type: 'uuid' })
  petId: string;

  @Column({ name: 'vet_user_id', type: 'uuid' })
  vetUserId: string;

  @Column({ name: 'type', type: 'varchar', length: 20 })
  type: ClinicalEventType;

  @Column({ name: 'date', type: 'timestamptz', default: () => 'NOW()' })
  date: Date;

  @Column({
    name: 'weight_kg',
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
    transformer: decimalTransformer,
  })
  weightKg: number | null;

  @Column({
    name: 'temperature_c',
    type: 'decimal',
    precision: 4,
    scale: 1,
    nullable: true,
    transformer: decimalTransformer,
  })
  temperatureC: number | null;

  @Column({ name: 'reason', type: 'varchar', length: 200, nullable: true })
  reason: string | null;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string | null;

  @Column({ name: 'next_checkup', type: 'date', nullable: true })
  nextCheckup: string | null;

  /** Detalle de vacuna: solo existe cuando `type` es 'vaccine' (relación 1 a 1 por UNIQUE). */
  @OneToOne(() => VaccinationDetail, (detail) => detail.event)
  vaccination: VaccinationDetail | null;
}
