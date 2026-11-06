import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * [G2] Mapea scheduling.audit_log (infra/db/01-tables.sql). Guarda quién hizo
 * qué sobre una cita y cuándo (base de la auditoría BR-9).
 */
@Entity({ name: 'audit_log', schema: 'scheduling' })
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'actor_user_id', type: 'uuid', nullable: true })
  actorUserId: string | null;

  @Column({ name: 'action', type: 'varchar', length: 100, nullable: true })
  action: string | null;

  @Column({ name: 'entity_id', type: 'uuid', nullable: true })
  entityId: string | null;

  @Column({ name: 'data', type: 'jsonb', nullable: true })
  data: Record<string, unknown> | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
