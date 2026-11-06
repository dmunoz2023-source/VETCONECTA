import { Injectable } from '@nestjs/common';
import { VetSchedule } from '../entities/vet-schedule.entity';
import { VetSchedulesRepository } from '../repositories/vet-schedules.repository';
import { clinicTimeToDate, dayOfWeek, fromMinutes, nextDate, toMinutes } from '../utils/clinic-time';

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
    return this.sliceShifts(shifts, date, durationMinutes);
  }

  /** Igual que generate para un rango inclusivo, con una sola consulta de horarios. */
  async generateRange(
    vetUserId: string,
    from: string,
    to: string,
    durationMinutes: number,
  ): Promise<DayBlock[]> {
    const shifts = await this.schedules.findByVet(vetUserId);
    const blocks: DayBlock[] = [];

    for (let date = from; date <= to; date = nextDate(date)) {
      const weekday = dayOfWeek(date);
      const dayShifts = shifts.filter((shift) => shift.dayOfWeek === weekday);
      blocks.push(...this.sliceShifts(dayShifts, date, durationMinutes));
    }
    return blocks;
  }

  private sliceShifts(shifts: VetSchedule[], date: string, durationMinutes: number): DayBlock[] {
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
