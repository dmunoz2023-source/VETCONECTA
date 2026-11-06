import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClinicalEventEntity } from '../entities/clinical-event.entity';
import { CreateClinicalEventDto, ClinicalEventType } from '../dto/create-clinical-event.dto';

@Injectable()
export class ClinicalEventService {
  constructor(
    @InjectRepository(ClinicalEventEntity)
    private readonly clinicalEventRepository: Repository<ClinicalEventEntity>,
  ) {}

  async create(createDto: CreateClinicalEventDto, veterinarianId: string): Promise<ClinicalEventEntity> {
    // 1. Validar reglas de negocio condicionales según el tipo de evento
    if (createDto.tipo === ClinicalEventType.VACUNA) {
      if (!createDto.nombre || !createDto.lote) {
        throw new BadRequestException('El nombre y el lote son obligatorios para eventos de tipo VACUNA.');
      }
    } else {
      if (!createDto.diagnostico) {
        throw new BadRequestException('El diagnóstico es obligatorio para eventos de tipo CONSULTA o CONTROL.');
      }
    }

    // 2. Validar que la fecha no sea futura
    const eventDate = new Date(createDto.fecha);
    if (eventDate > new Date()) {
      throw new BadRequestException('La fecha del evento clínico no puede ser futura.');
    }

    // 3. Mapear y guardar el evento clínico
    const clinicalEvent = this.clinicalEventRepository.create({
      petId: createDto.mascotaId,
      type: createDto.tipo,
      date: eventDate,
      weight: createDto.peso,
      observations: createDto.observaciones,
      veterinarianId: veterinarianId, // Extraído estrictamente del JWT (BR-3)
      name: createDto.nombre || null,
      lot: createDto.lote || null,
      nextDoseDate: createDto.fechaProximaDosis ? new Date(createDto.fechaProximaDosis).toISOString() : null,
      diagnosis: createDto.diagnostico || null,
      nextControlDate: createDto.fechaProximoControl ? new Date(createDto.fechaProximoControl).toISOString() : null,
    });

    return await this.clinicalEventRepository.save(clinicalEvent);
  }
}