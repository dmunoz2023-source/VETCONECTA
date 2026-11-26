import { VetBlock } from '../entities/vet-block.entity';
import { clinicTimeToDate, nextDate } from './clinic-time';

/** Rango real [from, to) que cubre un bloqueo. Sin horas es el día completo de la clínica. */
export function vetBlockRange(block: VetBlock): { from: Date; to: Date } {
  return {
    from: clinicTimeToDate(block.date, block.startTime ?? '00:00'),
    to: block.endTime
      ? clinicTimeToDate(block.date, block.endTime)
      : clinicTimeToDate(nextDate(block.date), '00:00'),
  };
}
