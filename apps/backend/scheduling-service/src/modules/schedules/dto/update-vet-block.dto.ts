import { PartialType } from '@nestjs/swagger';
import { CreateVetBlockDto } from './create-vet-block.dto';

export class UpdateVetBlockDto extends PartialType(CreateVetBlockDto) {}
