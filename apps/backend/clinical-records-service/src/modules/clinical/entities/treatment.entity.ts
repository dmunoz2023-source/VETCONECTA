import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ClinicalEventEntity } from './clinical-event.entity';

@Entity({ name: 'treatments', schema: 'clinical' })
export class TreatmentEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'pet_id', type: 'uuid' })
  petId!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  medication!: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  dose!: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  route!: string | null;

  @Column({ name: 'frequency_hours', type: 'integer', nullable: true })
  frequencyHours!: number | null;

  @Column({ name: 'duration_days', type: 'integer', nullable: true })
  durationDays!: number | null;

  @Column({ name: 'start_date', type: 'timestamptz', nullable: true })
  startDate!: Date | null;

  @Column({ type: 'text', nullable: true })
  instructions!: string | null;

  @Column({ type: 'boolean', default: true })
  active!: boolean;

  @ManyToOne(
    () => ClinicalEventEntity,
    (clinicalEvent) => clinicalEvent.treatments,
    { nullable: true, onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'clinical_event_id' })
  clinicalEvent!: ClinicalEventEntity | null;
}
