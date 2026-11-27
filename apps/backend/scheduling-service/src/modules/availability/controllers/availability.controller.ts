import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtHeadersGuard } from '@app/shared/guards/jwt-headers.guard';
import { AvailabilityBlockDto } from '../dto/availability-block.dto';
import { GetAvailabilityQueryDto } from '../dto/get-availability-query.dto';
import { AvailabilityService } from '../services/availability.service';

@ApiTags('scheduling')
@ApiBearerAuth()
@Controller('v1/scheduling/availability')
@UseGuards(JwtHeadersGuard)
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  @Get()
  @ApiOperation({
    summary: 'Bloques libres de un veterinario para una especialidad',
    description:
      'Rango máximo de 30 días. 422 si el veterinario está inactivo o no atiende la especialidad.',
  })
  @ApiOkResponse({ type: [AvailabilityBlockDto] })
  findFreeBlocks(@Query() query: GetAvailabilityQueryDto) {
    return this.availabilityService.findFreeBlocks(query);
  }
}
