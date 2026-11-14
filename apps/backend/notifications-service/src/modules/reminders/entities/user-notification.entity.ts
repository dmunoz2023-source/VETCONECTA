import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * [H1] Mapea notifications.user_notifications: el aviso que el dueño ve en el
 * centro de avisos de la app. `readAt` nulo = no leído.
 */
@Entity({ name: 'user_notifications' })
export class UserNotification {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({ name: 'reminder_id', type: 'uuid', nullable: true })
  reminderId!: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  type!: string | null;

  @Column({ name: 'ref_id', type: 'uuid', nullable: true })
  refId!: string | null;

  @Column({ type: 'varchar', length: 150, nullable: true })
  title!: string | null;

  @Column({ type: 'text', nullable: true })
  body!: string | null;

  @Column({ name: 'read_at', type: 'timestamptz', nullable: true })
  readAt!: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}