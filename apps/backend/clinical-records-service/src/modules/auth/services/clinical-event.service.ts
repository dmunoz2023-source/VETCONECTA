import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClinicalEventEntity } from '../entities/clinical-event.entity';
import { CreateClinicalEventDto } from '../dto/create-clinical-event.dto';

@Injectable()
export class ClinicalEventService {
  constructor(
    @InjectRepository(ClinicalEventEntity)
    private readonly clinicalEventRepository: Repository<ClinicalEventEntity>,
  ) {}

  async create(createDto: CreateClinicalEventDto, veterinarianId: string): Promise<ClinicalEventEntity> {
    // Validar que la fecha no sea futura
    const eventDate = new Date(createDto.fecha);
    if (eventDate > new Date()) {
      throw new BadRequestException('La fecha del evento clínico no puede ser futura.');
    }

    // Mapear y guardar directamente en la tabla física de PostgreSQL
    const clinicalEvent = this.clinicalEventRepository.create({
      petId: createDto.mascotaId,
      veterinarianId: veterinarianId, // Extraído estrictamente del JWT (BR-3)
      type: createDto.tipo,
      date: eventDate,
      weightKg: createDto.peso ?? null,
      temperatureC: createDto.temperatura ?? null,
      reason: createDto.motivo ?? null,
      notes: createDto.observaciones,
      nextCheckup: createDto.fechaProximoControl ? createDto.fechaProximoControl : null,
    });

    return await this.clinicalEventRepository.save(clinicalEvent);
  }
}