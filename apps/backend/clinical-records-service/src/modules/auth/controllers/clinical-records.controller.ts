import { Controller, Get, Param } from '@nestjs/common';
import { ClinicalRecordsService } from '../services/clinical-records.service';

@Controller('pets')
export class ClinicalRecordsController {
  constructor(private readonly clinicalRecordsService: ClinicalRecordsService) {}

  @Get(':petId/carnet')
  async getCarnetTimeline(@Param('petId') petId: string) {
    // Endpoint para obtener la línea de tiempo cronológica del carnet digital (FR-2, BR-6)
    return this.clinicalRecordsService.getCarnetTimeline(petId);
  }
}