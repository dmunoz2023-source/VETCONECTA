import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Specialty } from '../../specialties/entities/specialty.entity';
import { SpecialtiesService } from '../../specialties/services/specialties.service';
import { Vet } from '../entities/vet.entity';
import { VetsRepository } from '../repositories/vets.repository';

export interface VetSummary {
  userId: string;
  active: boolean;
  specialties: Pick<Specialty, 'id' | 'name' | 'durationMinutes'>[];
}

/** [G3] Especialidades que atiende cada veterinario (FR-7, BR-4). */
@Injectable()
export class VetsService {
  constructor(
    private readonly vets: VetsRepository,
    private readonly specialtiesService: SpecialtiesService,
  ) {}

  async findSpecialties(vetUserId: string): Promise<Specialty[]> {
    await this.findVet(vetUserId);
    return this.vets.findSpecialties(vetUserId);
  }

  async assignSpecialty(vetUserId: string, specialtyId: string): Promise<Specialty[]> {
    await this.findVet(vetUserId);
    const specialty = await this.specialtiesService.findById(specialtyId);
    if (!specialty.active) {
      throw new UnprocessableEntityException('La especialidad está desactivada.');
    }
    if (await this.vets.hasSpecialty(vetUserId, specialtyId)) {
      throw new ConflictException('El veterinario ya atiende esta especialidad.');
    }
    await this.vets.addSpecialty(vetUserId, specialtyId);
    return this.vets.findSpecialties(vetUserId);
  }

  async unassignSpecialty(vetUserId: string, specialtyId: string): Promise<void> {
    await this.findVet(vetUserId);
    if (!(await this.vets.removeSpecialty(vetUserId, specialtyId))) {
      throw new NotFoundException('El veterinario no atiende esta especialidad.');
    }
  }

  /** Respuesta de GET /internal/vets/:id. Solo incluye especialidades activas. */
  async getSummary(vetUserId: string): Promise<VetSummary> {
    const vet = await this.findVet(vetUserId);
    const specialties = await this.vets.findSpecialties(vetUserId);
    return {
      userId: vet.userId,
      active: vet.active,
      specialties: specialties
        .filter((specialty) => specialty.active)
        .map(({ id, name, durationMinutes }) => ({ id, name, durationMinutes })),
    };
  }

  private async findVet(vetUserId: string): Promise<Vet> {
    const vet = await this.vets.findById(vetUserId);
    if (!vet) {
      throw new NotFoundException(`Veterinario ${vetUserId} no encontrado.`);
    }
    return vet;
  }
}
