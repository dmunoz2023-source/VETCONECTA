import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClinicalEventEntity } from '../entities/clinical-event.entity';
import { VaccinationDetailsEntity } from '../entities/vaccination-details.entity';

type NewClinicalEvent = Pick<
  ClinicalEventEntity,
  | 'petId'
  | 'veterinarianId'
  | 'type'
  | 'date'
  | 'weightKg'
  | 'temperatureC'
  | 'reason'
  | 'diagnosis'
  | 'notes'
  | 'nextCheckup'
>;

type NewVaccinationDetails = Pick<
  VaccinationDetailsEntity,
  'vaccine' | 'batch' | 'boosterDate'
>;

@Injectable()
export class ClinicalEventRepository {
  constructor(
    @InjectRepository(ClinicalEventEntity)
    private readonly repository: Repository<ClinicalEventEntity>,
  ) {}

  async save(
    eventData: NewClinicalEvent,
    vaccinationData?: NewVaccinationDetails,
  ): Promise<ClinicalEventEntity> {
    return this.repository.manager.transaction(async (manager) => {
      const event = await manager.save(
        ClinicalEventEntity,
        manager.create(ClinicalEventEntity, eventData),
      );

      if (vaccinationData) {
        event.vaccinationDetails = await manager.save(
          VaccinationDetailsEntity,
          manager.create(VaccinationDetailsEntity, {
            ...vaccinationData,
            clinicalEvent: event,
          }),
        );
      }

      return event;
    });
  }

  findByPetId(petId: string): Promise<ClinicalEventEntity[]> {
    return this.repository.find({
      where: { petId },
      order: { date: 'DESC' },
      relations: { vaccinationDetails: true },
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
      relations: { vaccinationDetails: true },
    });
  }
}
