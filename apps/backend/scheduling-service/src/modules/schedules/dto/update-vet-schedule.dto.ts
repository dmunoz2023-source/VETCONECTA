import { PartialType } from '@nestjs/swagger';
import { CreateVetScheduleDto } from './create-vet-schedule.dto';

export class UpdateVetScheduleDto extends PartialType(CreateVetScheduleDto) {}
