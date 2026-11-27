import { ReminderStatus } from '../entities/scheduled-reminder.entity';

export interface ReminderResponse {
  id: string;
  appointmentId: string;
  fireAt: Date;
  status: ReminderStatus;
  /** true si faltaba menos que la anticipación y el aviso queda para envío inmediato. */
  immediate: boolean;
  /** true si ya existía un recordatorio para esa cita (no se duplica). */
  alreadyExisted: boolean;
}