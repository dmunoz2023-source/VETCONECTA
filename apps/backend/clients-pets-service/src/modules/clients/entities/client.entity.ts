import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * [A3] Mapea 1:1 la tabla real clients_pets.clients (infra/db/01-tables.sql).
 * `userId` referencia a auth.users.id, pero es un UUID plano: no existe FK
 * física entre esquemas, la validación de existencia se hace vía HTTP
 * (/internal) contra auth-service, nunca con un JOIN.
 */
@Entity({ name: 'clients', schema: 'clients_pets' })
export class Client {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id', type: 'uuid', unique: true })
  userId!: string;

  @Column({ type: 'citext', unique: true })
  rut!: string;

  @Column({ name: 'first_name' })
  firstName!: string;

  @Column({ name: 'last_name' })
  lastName!: string;

  @Column({ type: 'citext' })
  email!: string;

  @Column({ type: 'varchar', nullable: true })
  phone!: string | null;

  @Column({ type: 'varchar', nullable: true })
  address!: string | null;

  @Column({ type: 'varchar', nullable: true })
  district!: string | null;

  @Column({ default: true })
  active!: boolean;
}
