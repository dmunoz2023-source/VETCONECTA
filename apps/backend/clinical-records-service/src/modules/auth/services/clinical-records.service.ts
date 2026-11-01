import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClinicalEventEntity } from '../entities/clinical-event.entity';

@Injectable()
export class ClinicalRecordsService {
  constructor(
    @InjectRepository(ClinicalEventEntity)
    private readonly clinicalEventRepository: Repository<ClinicalEventEntity>,
  ) {}

  async getCarnetTimeline(petId: string) {
    // Consultar eventos clínicos ordenados cronológicamente (FR-2, BR-6)
    const events = await this.clinicalEventRepository.find({
      where: { petId },
      order: { eventDate: 'DESC' }, // Orden cronológico descendente
    });

    return {
      petId,
      events: events.map((event) => ({
        id: event.id,
        type: event.type, // consulta, vacuna, control
        eventDate: event.eventDate,
        weight: event.weight,
        observations: event.observations,
        veterinarianId: event.veterinarianId,
      })),
    };
  }
}