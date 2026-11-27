import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * [H1] Mapea notifications.device_tokens: tokens FCM/APNs de los dispositivos
 * del dueño. `userId` es un UUID plano (auth.users), sin FK entre esquemas.
 */
@Entity({ name: 'device_tokens' })
export class DeviceToken {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  token!: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  platform!: string | null;

  @Column({ type: 'boolean', default: true })
  active!: boolean;

  @Column({ name: 'last_used_at', type: 'timestamptz', nullable: true })
  lastUsedAt!: Date | null;
}
