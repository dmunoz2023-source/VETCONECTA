import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'clinical_events', schema: 'clinical' })
export class ClinicalEventEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'pet_id', type: 'uuid' })
  petId!: string;

  @Column({ type: 'varchar' })
  type!: string;

  @Column({ name: 'date', type: 'timestamp' })
  date!: Date;

  @Column({ name: 'weight_kg', type: 'decimal', precision: 5, scale: 2 })
  weight!: number;

  @Column({ name: 'notes', type: 'text' })
  observations!: string;

  @Column({ name: 'vet_user_id', type: 'uuid' })
  veterinarianId!: string;

  @Column({ nullable: true })
  name!: string | null;

  @Column({ nullable: true })
  lot!: string | null;

  @Column({ name: 'next_dose_date', type: 'timestamp', nullable: true })
  nextDoseDate!: string | null;

  @Column({ nullable: true })
  diagnosis!: string | null;

  @Column({ name: 'next_control_date', type: 'timestamp', nullable: true })
  nextControlDate!: string | null;
}