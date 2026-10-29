import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AvailabilitySlot } from '../../availability/entities/availability-slot.entity';
import { AvailabilityPort, AvailableBlock } from './availability.port';

/**
 * [G2] Adaptador provisional: valida contra la tabla scheduling.availability_slots.
 * Un bloque es reservable si existe, es de esa especialidad y esta 'available'
 * (los 'blocked' quedan fuera). No cambia el estado del bloque: que ya este
 * tomado lo decide la tabla de citas (BR-5), que es la fuente de verdad.
 */
@Injectable()
export class SlotAvailabilityAdapter extends AvailabilityPort {
  constructor(
    @InjectRepository(AvailabilitySlot)
    private readonly slots: Repository<AvailabilitySlot>,
  ) {
    super();
  }

  async findBlock(
    vetUserId: string,
    specialtyId: string,
    startTime: Date,
  ): Promise<AvailableBlock | null> {
    const slot = await this.slots.findOne({ where: { vetUserId, startTime } });
    if (!slot || slot.specialtyId !== specialtyId || slot.status !== 'available') {
      return null;
    }
    return { startTime: slot.startTime, endTime: slot.endTime, slotId: slot.id };
  }
}
