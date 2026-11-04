import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('clinical_events')
export class ClinicalEventEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'pet_id', type: 'uuid' })
  petId!: string;

  @Column({ type: 'varchar', length: 50 })
  type!: string; // ej: vacuna, consulta, desparasitación

  @Column({ name: 'event_date', type: 'timestamp' })
  eventDate!: Date;

  @Column({ type: 'float', nullable: true })
  weight!: number;

  @Column({ type: 'text', nullable: true })
  observations!: string;

  @Column({ name: 'veterinarian_id', type: 'uuid' })
  veterinarianId!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}