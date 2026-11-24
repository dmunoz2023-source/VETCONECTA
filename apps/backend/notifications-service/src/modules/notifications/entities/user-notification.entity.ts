import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'user_notifications', schema: 'notifications' })
export class UserNotificationEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty()
  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @ApiPropertyOptional({ format: 'uuid', nullable: true })
  @Column({ name: 'pet_id', type: 'uuid', nullable: true })
  petId!: string | null;

  @ApiPropertyOptional({ nullable: true })
  @Column({ type: 'varchar', length: 150, nullable: true })
  title!: string | null;

  @ApiPropertyOptional({ nullable: true })
  @Column({ type: 'text', nullable: true })
  body!: string | null;

  @ApiProperty()
  @Column({ name: 'is_read', type: 'boolean', default: false })
  isRead!: boolean;

  @ApiPropertyOptional({ type: Date, nullable: true })
  @Column({ name: 'read_at', type: 'timestamptz', nullable: true })
  readAt!: Date | null;

  @ApiProperty()
  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'NOW()',
  })
  createdAt!: Date;
}
