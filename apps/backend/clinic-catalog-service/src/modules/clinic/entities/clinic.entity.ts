import { Column, Entity, PrimaryColumn } from 'typeorm';

/** [G1] Datos de contacto de catalog.clinic. La tabla tiene una sola fila (id = 1). */
@Entity({ name: 'clinic', schema: 'catalog' })
export class Clinic {
  @PrimaryColumn({ type: 'int' })
  id: number;

  @Column({ type: 'varchar', nullable: true })
  phone: string | null;

  @Column({ name: 'emergency_phone', type: 'varchar' })
  emergencyPhone: string;

  @Column({ type: 'varchar', nullable: true })
  whatsapp: string | null;
}
