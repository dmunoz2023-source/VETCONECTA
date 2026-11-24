import { ApiProperty } from '@nestjs/swagger';
import { UserNotificationEntity } from '../entities/user-notification.entity';

export class NotificationsPageDto {
  @ApiProperty({ type: [UserNotificationEntity] })
  items!: UserNotificationEntity[];

  @ApiProperty({ example: 25 })
  total!: number;

  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 10 })
  limit!: number;
}
