import { Injectable } from '@nestjs/common';
import { VetSchedulesRepository } from '../repositories/vet-schedules.repository';
import { clinicTimeToDate, dayOfWeek, fromMinutes, toMinutes } from '../utils/clinic-time';

export interface DayBlock {
  startTime: Date;
  endTime: Date;
}

/**
 * [G3] Divide los turnos de un día en bloques del largo de la especialidad. Lo
 * usa G1, que después descuenta citas, bloqueos y horas pasadas. El resto de un
 * turno que no alcanza para un bloque completo se descarta.
 */
@Injectable()
export class DayBlocksService {
  constructor(private readonly schedules: VetSchedulesRepository) {}

  async generate(vetUserId: string, date: string, durationMinutes: number): Promise<DayBlock[]> {
    const shifts = await this.schedules.findByVetAndDay(vetUserId, dayOfWeek(date));
    const blocks: DayBlock[] = [];

    for (const shift of shifts) {
      const shiftEnd = toMinutes(shift.endTime);
      for (
        let start = toMinutes(shift.startTime);
        start + durationMinutes <= shiftEnd;
        start += durationMinutes
      ) {
        blocks.push({
          startTime: clinicTimeToDate(date, fromMinutes(start)),
          endTime: clinicTimeToDate(date, fromMinutes(start + durationMinutes)),
        });
      }
    }
    return blocks;
  }
}
