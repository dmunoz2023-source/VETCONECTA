import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'mascotas', schema: 'clients_pets' })
export class PetEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'client_id', type: 'uuid', nullable: false })
  clientId: string; // BR-1: Asociada obligatoriamente a un cliente

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @Column({ type: 'varchar', length: 50 })
  especie: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  raza: string;

  @Column({ name: 'fecha_nacimiento', type: 'date' })
  fechaNacimiento: Date; // Usado para calcular la edad dinámicamente (BR-2)

  @Column({ type: 'boolean', default: true })
  activo: boolean; // BR-9: Baja lógica (activo = true)

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}