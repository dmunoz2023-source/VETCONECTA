import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
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
  @ApiOkResponse({
    schema: {
      example: [
        {
          userId: '55555555-5555-5555-5555-555555555551',
          firstName: 'Vet',
          lastName: 'One',
          professionalLicense: 'MV-0001',
          photoUrl: null,
          active: true,
        },
      ],
    },
  })
  findActive(@Query() query: GetVetsQueryDto) {
    return this.vetsService.findActive(query.specialtyId);
  }
}
