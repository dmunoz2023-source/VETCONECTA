import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CatalogClient } from '../clients/catalog.client';
import { CreateVetScheduleDto } from '../dto/create-vet-schedule.dto';
import { UpdateVetScheduleDto } from '../dto/update-vet-schedule.dto';
import { VetSchedule } from '../entities/vet-schedule.entity';
import { VetSchedulesRepository } from '../repositories/vet-schedules.repository';

/** [G3] Horario semanal de cada veterinario (FR-7). */
@Injectable()
export class VetSchedulesService {
  constructor(
    private readonly schedules: VetSchedulesRepository,
    private readonly catalog: CatalogClient,
  ) {}

  findByVet(vetUserId: string): Promise<VetSchedule[]> {
    return this.schedules.findByVet(vetUserId);
  }

  async create(vetUserId: string, dto: CreateVetScheduleDto): Promise<VetSchedule> {
    const vet = await this.catalog.findVet(vetUserId);
    if (!vet) {
      throw new NotFoundException(`Veterinario ${vetUserId} no encontrado.`);
    }
    if (!vet.active) {
      throw new UnprocessableEntityException('El veterinario está inactivo.');
    }
    await this.assertValidShift(vetUserId, dto);
    return this.schedules.save({ ...dto, vetUserId });
  }

  async update(vetUserId: string, id: string, dto: UpdateVetScheduleDto): Promise<VetSchedule> {
    const schedule = await this.findOne(vetUserId, id);
    const updated = { ...schedule, ...dto };
    await this.assertValidShift(vetUserId, updated, id);
    return this.schedules.save(updated);
  }

  async remove(vetUserId: string, id: string): Promise<void> {
    await this.findOne(vetUserId, id);
    await this.schedules.remove(id);
  }

  private async findOne(vetUserId: string, id: string): Promise<VetSchedule> {
    const schedule = await this.schedules.findOne(vetUserId, id);
    if (!schedule) {
      throw new NotFoundException(`Horario ${id} no encontrado.`);
    }
    return schedule;
  }

  /** Hora fin mayor a hora inicio y sin turnos solapados el mismo día. */
  private async assertValidShift(
    vetUserId: string,
    shift: Pick<VetSchedule, 'dayOfWeek' | 'startTime' | 'endTime'>,
    ignoreId?: string,
  ): Promise<void> {
    if (shift.endTime <= shift.startTime) {
      throw new BadRequestException('La hora de fin debe ser mayor a la hora de inicio.');
    }
    const sameDay = await this.schedules.findByVetAndDay(vetUserId, shift.dayOfWeek);
    const overlapping = sameDay.find(
      (other) =>
        other.id !== ignoreId &&
        shift.startTime < other.endTime &&
        other.startTime < shift.endTime,
    );
    if (overlapping) {
      throw new ConflictException(
        `El horario se solapa con el turno ${overlapping.startTime}-${overlapping.endTime}.`,
      );
    }
  }
}
