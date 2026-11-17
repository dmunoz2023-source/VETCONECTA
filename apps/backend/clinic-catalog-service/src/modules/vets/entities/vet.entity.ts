import { Column, Entity, PrimaryColumn } from 'typeorm';

/** [G3] Mapea catalog.vets. La PK es el id del usuario en auth-service (UUID plano). */
@Entity({ name: 'vets', schema: 'catalog' })
export class Vet {
  @PrimaryColumn({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'first_name', type: 'varchar' })
  firstName: string;

  @Column({ name: 'last_name', type: 'varchar' })
  lastName: string;

  @Column({ name: 'professional_license', type: 'varchar', nullable: true })
  professionalLicense: string | null;

  @Column({ name: 'photo_url', type: 'varchar', nullable: true })
  photoUrl: string | null;

  @Column({ default: true })
  active: boolean;
}
