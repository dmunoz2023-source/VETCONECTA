import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { timeColumnTransformer } from '../utils/time-column.transformer';

/** [G3] Mapea scheduling.vet_blocks. Sin horas, el bloqueo cubre el día completo. */
@Entity({ name: 'vet_blocks', schema: 'scheduling' })
export class VetBlock {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'vet_user_id', type: 'uuid' })
  vetUserId: string;

  @Column({ name: 'block_date', type: 'date' })
  date: string;

  @Column({ name: 'start_time', type: 'time', nullable: true, transformer: timeColumnTransformer })
  startTime: string | null;

  @Column({ name: 'end_time', type: 'time', nullable: true, transformer: timeColumnTransformer })
  endTime: string | null;

  @Column({ type: 'varchar', length: 200 })
  reason: string;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
