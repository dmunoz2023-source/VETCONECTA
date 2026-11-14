import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export type ReminderStatus = 'pending' | 'sent' | 'cancelled' | 'error';

/**
 * [H1] Mapea notifications.scheduled_reminders.
 * `refId` es el id de la cita (UUID plano, sin FK entre esquemas) y
 * `fireAt` es la fecha de la cita menos la anticipación configurada (BR-7).
 */
@Entity({ name: 'scheduled_reminders' })
export class ScheduledReminder {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  type!: string | null;

  @Column({ name: 'ref_id', type: 'uuid', nullable: true })
  refId!: string | null;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  title!: string | null;

  @Column({ type: 'text', nullable: true })
  body!: string | null;

  @Column({ name: 'fire_at', type: 'timestamptz' })
  fireAt!: Date;

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status!: ReminderStatus;

  @Column({ type: 'int', default: 0 })
  attempts!: number;

  @Column({ name: 'last_error', type: 'text', nullable: true })
  lastError!: string | null;
}