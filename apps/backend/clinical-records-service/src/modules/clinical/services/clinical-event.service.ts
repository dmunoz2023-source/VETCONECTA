import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtPayload } from '@app/shared/types/jwt-payload.interface';
import { ClinicalEventEntity } from '../entities/clinical-event.entity';
import {
  CreateClinicalEventDto,
  ClinicalEventType,
  UpdateClinicalEventDto,
} from '../dto/create-clinical-event.dto';
import { GetClinicalHistoryQueryDto } from '../dto/get-clinical-history-query.dto';
import { ClinicalEventRepository } from '../repositories/clinical-event.repository';
import { ClientsPetsClient } from '../clients/clients-pets.client';
import { NotificationsClient } from '../clients/notifications.client';

@Injectable()
export class ClinicalEventService {
  constructor(
    private readonly clinicalEventRepository: ClinicalEventRepository,
    private readonly clientsPetsClient: ClientsPetsClient,
    private readonly notificationsClient: NotificationsClient,
  ) {}

  async create(createDto: CreateClinicalEventDto, veterinarianId: string): Promise<ClinicalEventEntity> {
    let ownerUserId: string | undefined;
    if (createDto.type === ClinicalEventType.VACCINE) {
      ownerUserId = await this.clientsPetsClient.getPetOwnerId(createDto.petId);
    } else {
      await this.clientsPetsClient.assertPetExists(createDto.petId);
    }
    const { eventData, vaccinationData } = this.prepareEventData(createDto);

    const event = await this.clinicalEventRepository.save(
      {
        ...eventData,
        veterinarianId,
      },
      veterinarianId,
      vaccinationData,
    );

    if (vaccinationData && ownerUserId) {
      await this.notificationsClient.create({
        userId: ownerUserId,
        petId: createDto.petId,
        title: `Próxima dosis de ${vaccinationData.vaccine}`,
        body: `La próxima dosis de ${vaccinationData.vaccine} está programada para el ${vaccinationData.boosterDate}.`,
      });
    }

    return event;
  }

  async update(
    id: string,
    updateDto: UpdateClinicalEventDto,
    user: JwtPayload,
  ): Promise<ClinicalEventEntity> {
    const existingEvent = await this.clinicalEventRepository.findById(id);
    if (!existingEvent) {
      throw new NotFoundException('No se encontró el evento clínico.');
    }

    if (user.role !== 'admin' && existingEvent.veterinarianId !== user.sub) {
      throw new ForbiddenException(
        'Solo el veterinario autor o un administrador puede editar este evento.',
      );
    }

    if (updateDto.petId !== existingEvent.petId) {
      throw new BadRequestException(
        'No se puede cambiar la mascota asociada al evento clínico.',
      );
    }

    const { eventData, vaccinationData } = this.prepareEventData(updateDto);
    const updatedEvent = await this.clinicalEventRepository.update(
      id,
      eventData,
      user.sub,
      vaccinationData,
    );
    if (!updatedEvent) {
      throw new NotFoundException('No se encontró el evento clínico.');
    }

    return updatedEvent;
  }

  private prepareEventData(
    dto: CreateClinicalEventDto,
  ): {
    eventData: {
      petId: string;
      type: ClinicalEventType;
      date: Date;
      weightKg: number | null;
      temperatureC: number | null;
      reason: string | null;
      diagnosis: string | null;
      notes: string;
      nextCheckup: string | null;
    };
    vaccinationData:
      | { vaccine: string; batch: string; boosterDate: string }
      | undefined;
  } {
    const eventDate = new Date(dto.date);
    if (eventDate > new Date()) {
      throw new BadRequestException(
        'La fecha del evento clínico no puede ser futura.',
      );
    }

    let vaccinationData:
      | { vaccine: string; batch: string; boosterDate: string }
      | undefined;
    if (dto.type === ClinicalEventType.VACCINE) {
      if (
        !dto.vaccineName ||
        !dto.batch ||
        !dto.boosterDate ||
        dto.diagnosis !== undefined ||
        dto.nextCheckup !== undefined
      ) {
        throw new BadRequestException(
          'Las vacunas requieren nombre, lote y fecha de próxima dosis, y no aceptan diagnóstico ni próximo control.',
        );
      }

      vaccinationData = {
        vaccine: dto.vaccineName,
        batch: dto.batch,
        boosterDate: dto.boosterDate,
      };
    } else if (
      !dto.diagnosis ||
      !dto.nextCheckup ||
      dto.vaccineName !== undefined ||
      dto.batch !== undefined ||
      dto.boosterDate !== undefined
    ) {
      throw new BadRequestException(
        'Las consultas y controles requieren diagnóstico y próximo control, y no aceptan datos de vacuna.',
      );
    }

    return {
      eventData: {
        petId: dto.petId,
        type: dto.type,
        date: eventDate,
        weightKg: dto.weightKg,
        temperatureC: dto.temperatureC ?? null,
        reason: dto.reason ?? null,
        diagnosis: dto.diagnosis ?? null,
        notes: dto.notes,
        nextCheckup: dto.nextCheckup ?? null,
      },
      vaccinationData,
    };
  }

  async findByPetId(
    petId: string,
    user: JwtPayload,
  ): Promise<ClinicalEventEntity[]> {
    if (user.role === 'owner') {
      await this.clientsPetsClient.assertPetOwnership(petId, user.sub);
    }

    return this.clinicalEventRepository.findByPetId(petId);
  }

  async findHistoryByPetId(
    petId: string,
    { page, limit }: GetClinicalHistoryQueryDto,
  ) {
    const [events, total] =
      await this.clinicalEventRepository.findHistoryByPetId(
        petId,
        page,
        limit,
      );

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
