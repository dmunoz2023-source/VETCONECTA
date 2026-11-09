import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClinicalEventEntity } from '../entities/clinical-event.entity';

type NewClinicalEvent = Pick<
  ClinicalEventEntity,
  | 'petId'
  | 'veterinarianId'
  | 'type'
  | 'date'
  | 'weightKg'
  | 'temperatureC'
  | 'reason'
  | 'notes'
  | 'nextCheckup'
>;

@Injectable()
export class ClinicalEventRepository {
  constructor(
    @InjectRepository(ClinicalEventEntity)
    private readonly repository: Repository<ClinicalEventEntity>,
  ) {}

  async save(eventData: NewClinicalEvent): Promise<ClinicalEventEntity> {
    const event = this.repository.create(eventData);
    return this.repository.save(event);
  }

  findByPetId(petId: string): Promise<ClinicalEventEntity[]> {
    return this.repository.find({
      where: { petId },
      order: { date: 'DESC' },
    });
  }

  findHistoryByPetId(
    petId: string,
    page: number,
    limit: number,
  ): Promise<[ClinicalEventEntity[], number]> {
    return this.repository.findAndCount({
      where: { petId },
      order: { date: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }
}
