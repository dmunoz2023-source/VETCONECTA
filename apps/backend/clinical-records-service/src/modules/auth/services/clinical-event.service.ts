import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClinicalEventEntity } from '../entities/clinical-event.entity';
import { CreateClinicalEventDto } from '../dto/create-clinical-event.dto';
import { GetClinicalHistoryQueryDto } from '../dto/get-clinical-history-query.dto';

@Injectable()
export class ClinicalEventService {
  constructor(
    @InjectRepository(ClinicalEventEntity)
    private readonly clinicalEventRepository: Repository<ClinicalEventEntity>,
  ) {}

  async create(createDto: CreateClinicalEventDto, veterinarianId: string): Promise<ClinicalEventEntity> {
    const eventDate = new Date(createDto.fecha);
    if (eventDate > new Date()) {
      throw new BadRequestException('La fecha del evento clínico no puede ser futura.');
    }

    const clinicalEvent = this.clinicalEventRepository.create({
      petId: createDto.mascotaId,
      veterinarianId: veterinarianId,
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

  // El método de consulta vive aquí, usando el repositorio privado del servicio
  async findByPetId(petId: string): Promise<ClinicalEventEntity[]> {
    return await this.clinicalEventRepository.find({
      where: { petId },
      order: { date: 'DESC' },
    });
  }

  async findHistoryByPetId(
    petId: string,
    { page, limit }: GetClinicalHistoryQueryDto,
  ) {
    const [events, total] = await this.clinicalEventRepository.findAndCount({
      where: { petId },
      order: { date: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: events,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}