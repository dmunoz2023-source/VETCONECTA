import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Client } from '../../clients/entities/client.entity';

/**
 * [A3] Mapea 1:1 la tabla real clients_pets.pets. La FK a `clients` sí existe
 * físicamente porque ambas tablas viven en el mismo esquema (clients_pets);
 * esto es lo único permitido por las reglas de persistencia del proyecto.
 */
@Entity({ name: 'pets', schema: 'clients_pets' })
export class Pet {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'client_id', type: 'uuid' })
  clientId!: string;

  @ManyToOne(() => Client, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'client_id' })
  client?: Client;

  @Column()
  name!: string;

  @Column()
  species!: string;

  @Column({ type: 'varchar', nullable: true })
  breed!: string | null;

  @Column({ type: 'varchar', nullable: true })
  sex!: string | null;

  @Column({ name: 'birth_date', type: 'date', nullable: true })
  birthDate!: string | null;

  @Column({ type: 'varchar', nullable: true })
  color!: string | null;

  @Column({ type: 'varchar', nullable: true })
  microchip!: string | null;

  @Column({ name: 'photo_url', type: 'varchar', nullable: true })
  photoUrl!: string | null;

  @Column({ default: true })
  active!: boolean;
}
