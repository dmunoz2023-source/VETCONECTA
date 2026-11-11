import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { timeColumnTransformer } from '../utils/time-column.transformer';

/** [G3] Mapea scheduling.vet_schedules: un turno semanal de un veterinario. */
@Entity({ name: 'vet_schedules', schema: 'scheduling' })
@Unique('uq_vet_schedule_start', ['vetUserId', 'dayOfWeek', 'startTime'])
export class VetSchedule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'vet_user_id', type: 'uuid' })
  vetUserId: string;

  /** 0 = domingo ... 6 = sábado. */
  @Column({ name: 'day_of_week', type: 'smallint' })
  dayOfWeek: number;

  @Column({ name: 'start_time', type: 'time', transformer: timeColumnTransformer })
  startTime: string;

  @Column({ name: 'end_time', type: 'time', transformer: timeColumnTransformer })
  endTime: string;
}
