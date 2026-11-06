import { IsIn } from 'class-validator';

export const FINAL_STATUSES = ['completed', 'no_show'] as const;
export type FinalStatus = (typeof FINAL_STATUSES)[number];

/** [G2] Cuerpo de PATCH /v1/citas/:id/estado: marca la cita como realizada o no asistida. */
export class UpdateEstadoDto {
  @IsIn(FINAL_STATUSES, { message: 'status debe ser "completed" o "no_show"' })
  status!: FinalStatus;
}
