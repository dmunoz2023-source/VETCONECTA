import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ClinicalEvent } from './clinical-event.entity';

/**
 * [F3] Mapea clinical.vaccination_details (mismo esquema que clinical_events,
 * así que aquí sí cabe un JOIN). `clinical_event_id` es UNIQUE: una vacuna por evento.
 */
@Entity({ name: 'vaccination_details', schema: 'clinical' })
export class VaccinationDetail {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'clinical_event_id', type: 'uuid', unique: true })
  clinicalEventId: string;

  @Column({ name: 'vaccine', type: 'varchar', length: 100, nullable: true })
  vaccine: string | null;

  @Column({ name: 'laboratory', type: 'varchar', length: 100, nullable: true })
  laboratory: string | null;

  @Column({ name: 'batch', type: 'varchar', length: 50, nullable: true })
  batch: string | null;

  @Column({ name: 'booster_date', type: 'date', nullable: true })
  boosterDate: string | null;

  @OneToOne(() => ClinicalEvent, (event) => event.vaccination)
  @JoinColumn({ name: 'clinical_event_id' })
  event: ClinicalEvent;
}
