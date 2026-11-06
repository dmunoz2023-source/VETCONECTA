import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtHeadersGuard } from '@app/shared/guards/jwt-headers.guard';
import { ClinicService } from '../services/clinic.service';

@ApiTags('catalog')
@ApiBearerAuth()
@Controller('v1/catalog/clinic')
@UseGuards(JwtHeadersGuard)
export class ClinicController {
  constructor(private readonly clinicService: ClinicService) {}

  @Get('contact')
  @ApiOperation({ summary: 'Teléfono y WhatsApp oficiales de la clínica (BR-11)' })
  @ApiOkResponse({
    schema: {
      example: {
        phone: '+56452000000',
        emergencyPhone: '+56912345678',
        whatsapp: '+56912345678',
      },
    },
  })
  getContact() {
    return this.clinicService.getContact();
  }
}
