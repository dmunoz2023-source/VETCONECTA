import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { JwtPayload } from '@app/shared/types/jwt-payload.interface';
import { ClinicalEventEntity } from '../entities/clinical-event.entity';
import { CreateClinicalEventDto } from '../dto/create-clinical-event.dto';
import { GetClinicalHistoryQueryDto } from '../dto/get-clinical-history-query.dto';
import { ClinicalEventRepository } from '../repositories/clinical-event.repository';

@Injectable()
export class ClinicalEventService {
  constructor(
    private readonly clinicalEventRepository: ClinicalEventRepository,
  ) {}

  async create(createDto: CreateClinicalEventDto, veterinarianId: string): Promise<ClinicalEventEntity> {
    const eventDate = new Date(createDto.fecha);
    if (eventDate > new Date()) {
      throw new BadRequestException('La fecha del evento clínico no puede ser futura.');
    }

    return this.clinicalEventRepository.save({
      petId: createDto.mascotaId,
      veterinarianId: veterinarianId,
      type: createDto.tipo,
      date: eventDate,
      weightKg: createDto.peso ?? null,
      temperatureC: createDto.temperatura ?? null,
      reason: createDto.motivo ?? null,
      notes: createDto.observaciones,
      nextCheckup: createDto.proximoControl ?? null,
    });
  }

  async findByPetId(
    petId: string,
    user: JwtPayload,
  ): Promise<ClinicalEventEntity[]> {
    if (user.role === 'owner') {
      await this.assertPetOwnership(petId, user.sub);
    }

    return this.clinicalEventRepository.findByPetId(petId);
  }

  private async assertPetOwnership(petId: string, userId: string): Promise<void> {
    const internalKey =
      process.env.INTERNAL_API_KEY || process.env.INTERNAL_KEY;
    if (!internalKey) {
      throw new InternalServerErrorException(
        'La clave de comunicación interna no está configurada.',
      );
    }

    const clientsServiceUrl = (
      process.env.CLIENTS_SERVICE_URL || 'http://localhost:3002'
    ).replace(/\/+$/, '');
    let response: Response;
    try {
      response = await fetch(
        `${clientsServiceUrl}/internal/pets/${encodeURIComponent(petId)}/owner/${encodeURIComponent(userId)}`,
        { headers: { 'X-Internal-Key': internalKey } },
      );
    } catch {
      throw new ServiceUnavailableException(
        'No fue posible verificar la propiedad de la mascota.',
      );
    }

    if (response.status === 404) {
      throw new ForbiddenException(
        'No tienes permiso para consultar el carnet de esta mascota.',
      );
    }
    if (!response.ok) {
      throw new ServiceUnavailableException(
        'No fue posible verificar la propiedad de la mascota.',
      );
    }
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