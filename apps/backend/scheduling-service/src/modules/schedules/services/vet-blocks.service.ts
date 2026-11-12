import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Appointment } from '../../appointments/entities/appointment.entity';
import { AppointmentsRepository } from '../../appointments/repositories/appointments.repository';
import { CatalogClient } from '../clients/catalog.client';
import { CreateVetBlockDto } from '../dto/create-vet-block.dto';
import { UpdateVetBlockDto } from '../dto/update-vet-block.dto';
import { VetBlock, VetBlockReason } from '../entities/vet-block.entity';
import { VetBlocksRepository } from '../repositories/vet-blocks.repository';
import { clinicTimeToDate, nextDate } from '../utils/clinic-time';

export interface AffectedAppointment {
  id: string;
  petId: string;
  clientId: string;
  startTime: Date;
  endTime: Date;
  status: Appointment['status'];
}

export interface VetBlockResult {
  block: VetBlock;
  /** Advertencia: citas vigentes que quedan dentro del bloqueo. No se cancelan solas. */
  affectedAppointments: AffectedAppointment[];
}

/** [G3] Bloqueos puntuales de agenda: vacaciones, feriados, etc. (FR-7). */
@Injectable()
export class VetBlocksService {
  constructor(
    private readonly blocks: VetBlocksRepository,
    private readonly appointments: AppointmentsRepository,
    private readonly catalog: CatalogClient,
  ) {}

  findByVet(vetUserId: string, from?: string, to?: string): Promise<VetBlock[]> {
    return this.blocks.findByVet(vetUserId, from, to);
  }

  async create(
    vetUserId: string,
    dto: CreateVetBlockDto,
    createdBy: string,
  ): Promise<VetBlockResult> {
    const vet = await this.catalog.findVet(vetUserId);
    if (!vet) {
      throw new NotFoundException(`Veterinario ${vetUserId} no encontrado.`);
    }
    if (!vet.active) {
      throw new UnprocessableEntityException('El veterinario está inactivo.');
    }
    this.assertValidRange(dto.startTime, dto.endTime);
    this.assertNotesForOther(dto.reason, dto.notes);
    const block = await this.blocks.save({ ...dto, vetUserId, createdBy });
    return this.withAffectedAppointments(block);
  }

  async update(vetUserId: string, id: string, dto: UpdateVetBlockDto): Promise<VetBlockResult> {
    const block = await this.findOne(vetUserId, id);
    const updated = { ...block, ...dto };
    this.assertValidRange(updated.startTime, updated.endTime);
    this.assertNotesForOther(updated.reason, updated.notes);
    return this.withAffectedAppointments(await this.blocks.save(updated));
  }

  async remove(vetUserId: string, id: string): Promise<void> {
    await this.findOne(vetUserId, id);
    await this.blocks.remove(id);
  }

  private async findOne(vetUserId: string, id: string): Promise<VetBlock> {
    const block = await this.blocks.findOne(vetUserId, id);
    if (!block) {
      throw new NotFoundException(`Bloqueo ${id} no encontrado.`);
    }
    return block;
  }

  /** Sin horas es un día completo; con horas, deben venir ambas y en orden. */
  private assertValidRange(startTime?: string | null, endTime?: string | null): void {
    if (!startTime && !endTime) {
      return;
    }
    if (!startTime || !endTime) {
      throw new BadRequestException(
        'Indica hora de inicio y de fin, u omite ambas para bloquear el día completo.',
      );
    }
    if (endTime <= startTime) {
      throw new BadRequestException('La hora de fin debe ser mayor a la hora de inicio.');
    }
  }

  /** Con motivo "other" hay que explicar el bloqueo en notes. */
  private assertNotesForOther(reason?: VetBlockReason, notes?: string | null): void {
    if (reason === 'other' && !notes) {
      throw new BadRequestException('Indica el detalle del bloqueo en notes cuando el motivo es other.');
    }
  }

  private async withAffectedAppointments(block: VetBlock): Promise<VetBlockResult> {
    const from = clinicTimeToDate(block.date, block.startTime ?? '00:00');
    const to = block.endTime
      ? clinicTimeToDate(block.date, block.endTime)
      : clinicTimeToDate(nextDate(block.date), '00:00');
    const appointments = await this.appointments.findActiveByVetBetween(block.vetUserId, from, to);

    return {
      block,
      affectedAppointments: appointments.map(
        ({ id, petId, clientId, startTime, endTime, status }) => ({
          id,
          petId,
          clientId,
          startTime,
          endTime,
          status,
        }),
      ),
    };
  }
}
