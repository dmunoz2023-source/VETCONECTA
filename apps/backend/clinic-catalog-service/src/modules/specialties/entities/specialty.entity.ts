import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/** [G3] Mapea catalog.specialties. `durationMinutes` es el largo del bloque de agenda. */
@Entity({ name: 'specialties', schema: 'catalog' })
export class Specialty {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true })
  name: string;

  @Column({ name: 'duration_minutes', type: 'int' })
  durationMinutes: number;

  @Column({ default: true })
  active: boolean;
}
