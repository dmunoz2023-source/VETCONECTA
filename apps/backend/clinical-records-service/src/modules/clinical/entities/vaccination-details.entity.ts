import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ClinicalEventEntity } from './clinical-event.entity';

@Entity({ name: 'vaccination_details', schema: 'clinical' })
export class VaccinationDetailsEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  vaccine!: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  laboratory!: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  batch!: string | null;

  @Column({ name: 'booster_date', type: 'date', nullable: true })
  boosterDate!: string | null;

  @OneToOne(
    () => ClinicalEventEntity,
    (clinicalEvent) => clinicalEvent.vaccinationDetails,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'clinical_event_id' })
  clinicalEvent!: ClinicalEventEntity;
}
