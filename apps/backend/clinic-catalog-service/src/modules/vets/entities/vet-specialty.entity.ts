import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Specialty } from '../../specialties/entities/specialty.entity';
import { Vet } from './vet.entity';

/** [G3] Relación N:M catalog.vet_specialties: qué especialidades atiende cada veterinario. */
@Entity({ name: 'vet_specialties', schema: 'catalog' })
export class VetSpecialty {
  @PrimaryColumn({ name: 'vet_user_id', type: 'uuid' })
  vetUserId: string;

  @PrimaryColumn({ name: 'specialty_id', type: 'uuid' })
  specialtyId: string;

  @ManyToOne(() => Vet, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'vet_user_id' })
  vet?: Vet;

  @ManyToOne(() => Specialty, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'specialty_id' })
  specialty?: Specialty;
}
