import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { DevicePlatform } from '../dto/register-device.dto';

@Entity({ name: 'device_tokens', schema: 'notifications' })
export class DeviceTokenEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty()
  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @ApiProperty()
  @Column({ type: 'varchar', length: 255, unique: true })
  token!: string;

  @ApiPropertyOptional({ enum: DevicePlatform, nullable: true })
  @Column({ type: 'varchar', length: 20, nullable: true })
  platform!: DevicePlatform | null;

  @ApiProperty()
  @Column({ type: 'boolean', default: true })
  active!: boolean;

  @ApiPropertyOptional({ type: Date, nullable: true })
  @Column({ name: 'last_used_at', type: 'timestamptz', nullable: true })
  lastUsedAt!: Date | null;
}
