import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
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

type UpdatedClinicalEvent = Omit<NewClinicalEvent, 'veterinarianId'>;

@Injectable()
export class ClinicalEventRepository {
  constructor(
    @InjectRepository(ClinicalEventEntity)
    private readonly repository: Repository<ClinicalEventEntity>,
  ) {}

  async save(
    eventData: NewClinicalEvent,
    actorUserId: string,
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

      await this.writeAuditEntry(
        manager,
        actorUserId,
        'CREATE',
        event,
      );

      return event;
    });
  }

  findById(id: string): Promise<ClinicalEventEntity | null> {
    return this.repository.findOne({
      where: { id },
      relations: { vaccinationDetails: true },
    });
  }

  async update(
    id: string,
    eventData: UpdatedClinicalEvent,
    actorUserId: string,
    vaccinationData?: NewVaccinationDetails,
  ): Promise<ClinicalEventEntity | null> {
    return this.repository.manager.transaction(async (manager) => {
      const event = await manager.findOne(ClinicalEventEntity, {
        where: { id },
        relations: { vaccinationDetails: true },
      });
      if (!event) {
        return null;
      }

      Object.assign(event, eventData);
      const updatedEvent = await manager.save(ClinicalEventEntity, event);

      if (vaccinationData) {
        const details = updatedEvent.vaccinationDetails
          ? Object.assign(updatedEvent.vaccinationDetails, vaccinationData)
          : manager.create(VaccinationDetailsEntity, {
              ...vaccinationData,
              clinicalEvent: updatedEvent,
            });
        updatedEvent.vaccinationDetails = await manager.save(
          VaccinationDetailsEntity,
          details,
        );
      } else if (updatedEvent.vaccinationDetails) {
        await manager.remove(
          VaccinationDetailsEntity,
          updatedEvent.vaccinationDetails,
        );
        updatedEvent.vaccinationDetails = null;
      }

      await this.writeAuditEntry(
        manager,
        actorUserId,
        'UPDATE',
        updatedEvent,
      );

      return updatedEvent;
    });
  }

  private async writeAuditEntry(
    manager: EntityManager,
    actorUserId: string,
    action: 'CREATE' | 'UPDATE',
    event: ClinicalEventEntity,
  ): Promise<void> {
    const data = {
      ...event,
      vaccinationDetails: event.vaccinationDetails
        ? {
            vaccine: event.vaccinationDetails.vaccine,
            batch: event.vaccinationDetails.batch,
            boosterDate: event.vaccinationDetails.boosterDate,
          }
        : null,
    };

    await manager.query(
      `INSERT INTO clinical.audit_log
        (actor_user_id, action, entity, entity_id, data)
       VALUES ($1, $2, $3, $4, $5::jsonb)`,
      [
        actorUserId,
        action,
        'clinical_event',
        event.id,
        JSON.stringify(data),
      ],
    );
  }

  findByPetId(petId: string): Promise<ClinicalEventEntity[]> {
    return this.repository.find({
      where: { petId },
      order: { date: 'DESC' },
      relations: { vaccinationDetails: true },
    });
  }
}
