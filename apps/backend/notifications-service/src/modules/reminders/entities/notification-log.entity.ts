import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

/** [H1] Mapea notifications.notification_log: bitácora de cada envío. */
@Entity({ name: 'notification_log' })
export class NotificationLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'reminder_id', type: 'uuid', nullable: true })
  reminderId!: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  channel!: string | null;

  @Column({ name: 'provider_response', type: 'jsonb', nullable: true })
  providerResponse!: Record<string, unknown> | null;

  @CreateDateColumn({ name: 'sent_at', type: 'timestamptz' })
  sentAt!: Date;
}
