import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { AvailabilitySlot } from '../../availability/entities/availability-slot.entity';

export type AppointmentEstado =
  | 'reservada'
  | 'confirmada'
  | 'realizada'
  | 'cancelada'
  | 'no_asistio';

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

  @Column({ type: 'timestamptz' })
  inicio: Date;

  @Column({ type: 'timestamptz' })
  fin: Date;

  @Column({ type: 'varchar', length: 20 })
  estado: AppointmentEstado;

  @Column({ type: 'varchar', length: 20, default: 'app' })
  canal: string;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy: string | null;

  @Column({ name: 'cancelled_at', type: 'timestamptz', nullable: true })
  cancelledAt: Date | null;
}
