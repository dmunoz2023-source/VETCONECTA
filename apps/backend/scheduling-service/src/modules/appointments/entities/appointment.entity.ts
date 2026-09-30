import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { AvailabilitySlot } from '../../availability/entities/availability-slot.entity';

export type AppointmentStatus =
  | 'booked'
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | 'no_show';

/**
 * [A3] Mapea scheduling.appointments (infra/db/01-tables.sql).
 *
 * `slotId` sí tiene relación de TypeORM (@OneToOne) porque availability_slots
 * vive en el MISMO esquema (scheduling) — la FK física existe en la base.
 * En cambio petId, clientId y vetUserId son UUID planos: pertenecen a
 * clients_pets y catalog, esquemas ajenos, así que aquí no se declara
 * ninguna relación ni se hace JOIN contra ellos.
 */
@Entity({ name: 'appointments', schema: 'scheduling' })
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'slot_id', type: 'uuid', unique: true })
  slotId: string;

  @OneToOne(() => AvailabilitySlot)
  @JoinColumn({ name: 'slot_id' })
  slot?: AvailabilitySlot;

  @Column({ name: 'pet_id', type: 'uuid' })
  petId: string;

  @Column({ name: 'client_id', type: 'uuid' })
  clientId: string;

  @Column({ name: 'vet_user_id', type: 'uuid' })
  vetUserId: string;

  @Column({ name: 'specialty_id', type: 'uuid' })
  specialtyId: string;

  @Column({ name: 'start_time', type: 'timestamptz' })
  startTime: Date;

  @Column({ name: 'end_time', type: 'timestamptz' })
  endTime: Date;

  @Column({ name: 'status', type: 'varchar', length: 20 })
  status: AppointmentStatus;

  @Column({ name: 'channel', type: 'varchar', length: 20, default: 'app' })
  channel: string;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy: string | null;

  @Column({ name: 'cancelled_at', type: 'timestamptz', nullable: true })
  cancelledAt: Date | null;
}
