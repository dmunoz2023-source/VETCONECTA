import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { TreatmentEntity } from './treatment.entity';
import { VaccinationDetailsEntity } from './vaccination-details.entity';

@Entity({ name: 'clinical_events', schema: 'clinical' })
export class ClinicalEventEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'pet_id', type: 'uuid' })
  petId!: string;

  @Column({ name: 'vet_user_id', type: 'uuid' })
  veterinarianId!: string;

  @Column({ type: 'varchar', length: 20 })
  type!: string;

  @Column({ name: 'date', type: 'timestamptz' })
  date!: Date;

  @Column({ name: 'weight_kg', type: 'decimal', precision: 5, scale: 2, nullable: true })
  weightKg!: number | null;

  @Column({ name: 'temperature_c', type: 'decimal', precision: 4, scale: 1, nullable: true })
  temperatureC!: number | null;

  @Column({ name: 'reason', type: 'varchar', length: 200, nullable: true })
  reason!: string | null;

  @Column({ name: 'diagnosis', type: 'varchar', length: 200, nullable: true })
  diagnosis!: string | null;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes!: string | null;

  @Column({ name: 'next_checkup', type: 'date', nullable: true })
  nextCheckup!: string | null;

  @OneToOne(
    () => VaccinationDetailsEntity,
    (vaccinationDetails) => vaccinationDetails.clinicalEvent,
  )
  vaccinationDetails?: VaccinationDetailsEntity | null;

  @OneToMany(() => TreatmentEntity, (treatment) => treatment.clinicalEvent)
  treatments?: TreatmentEntity[];
}
