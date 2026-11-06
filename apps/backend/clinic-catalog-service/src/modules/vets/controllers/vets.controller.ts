import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtHeadersGuard } from '@app/shared/guards/jwt-headers.guard';
import { GetVetsQueryDto } from '../dto/get-vets-query.dto';
import { VetsService } from '../services/vets.service';

/** [G1] Alimenta el paso de elegir veterinario al reservar (UC-03). */
@ApiTags('catalog')
@ApiBearerAuth()
@Controller('v1/catalog/vets')
@UseGuards(JwtHeadersGuard)
export class VetsController {
  constructor(private readonly vetsService: VetsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar veterinarios activos, filtrables por especialidad' })
  findActive(@Query() query: GetVetsQueryDto) {
    return this.vetsService.findActive(query.specialtyId);
  }
}
