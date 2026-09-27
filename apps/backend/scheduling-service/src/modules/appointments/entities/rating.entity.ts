import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * [A3] Mapea scheduling.ratings. `appointmentId` es único en la tabla real
 * (una calificación por cita), y clientId vuelve a ser un UUID plano: la
 * pertenencia se valida en la capa de servicio contra el X-Client-Id que
 * llega del Gateway, no con una relación de TypeORM.
 */
@Entity({ name: 'ratings', schema: 'scheduling' })
export class Rating {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'appointment_id', type: 'uuid', unique: true })
  appointmentId: string;

  @Column({ name: 'client_id', type: 'uuid' })
  clientId: string;

  @Column({ type: 'smallint' })
  estrellas: number;

  @Column({ type: 'text', nullable: true })
  comentario: string | null;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt: Date;
}
