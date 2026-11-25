import { DataSource } from 'typeorm';

export type SlotStatus = 'available' | 'booked' | 'blocked';

export interface SlotSeed {
  vetUserId: string;
  specialtyId: string;
  start: Date;
  minutes: number;
  status?: SlotStatus;
}

/** Deja vacias las tablas de scheduling entre pruebas. */
export async function resetDatabase(dataSource: DataSource): Promise<void> {
  await dataSource.query(
    `TRUNCATE scheduling.ratings, scheduling.audit_log, scheduling.appointments,
             scheduling.availability_slots`,
  );
}

/** Inserta un bloque de disponibilidad y devuelve su id. */
export async function seedSlot(dataSource: DataSource, slot: SlotSeed): Promise<string> {
  const end = new Date(slot.start.getTime() + slot.minutes * 60_000);
  const rows = await dataSource.query(
    `INSERT INTO scheduling.availability_slots (vet_user_id, specialty_id, start_time, end_time, status)
     VALUES ($1, $2, $3, $4, $5) RETURNING id`,
    [slot.vetUserId, slot.specialtyId, slot.start, end, slot.status ?? 'available'],
  );
  return rows[0].id as string;
}

/** Cuantas citas activas (booked/confirmed) tiene un veterinario a una hora de inicio. */
export async function countActiveAppointments(
  dataSource: DataSource,
  vetUserId: string,
  start: Date,
): Promise<number> {
  const rows = await dataSource.query(
    `SELECT count(*)::int AS total FROM scheduling.appointments
     WHERE vet_user_id = $1 AND start_time = $2 AND status IN ('booked', 'confirmed')`,
    [vetUserId, start],
  );
  return rows[0].total as number;
}

/** Todas las citas activas de un veterinario (para revisar solapamientos). */
export async function countAllActive(dataSource: DataSource, vetUserId: string): Promise<number> {
  const rows = await dataSource.query(
    `SELECT count(*)::int AS total FROM scheduling.appointments
     WHERE vet_user_id = $1 AND status IN ('booked', 'confirmed')`,
    [vetUserId],
  );
  return rows[0].total as number;
}

export interface AppointmentSeed {
  petId: string;
  clientId: string;
  vetUserId: string;
  specialtyId: string;
  start: Date;
  status: 'booked' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
}

/** [K2] Inserta una cita directamente (sin pasar por la reserva) y devuelve su id. */
export async function seedAppointment(
  dataSource: DataSource,
  appointment: AppointmentSeed,
): Promise<string> {
  const end = new Date(appointment.start.getTime() + 30 * 60_000);
  const rows = await dataSource.query(
    `INSERT INTO scheduling.appointments
       (pet_id, client_id, vet_user_id, specialty_id, start_time, end_time, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
    [
      appointment.petId,
      appointment.clientId,
      appointment.vetUserId,
      appointment.specialtyId,
      appointment.start,
      end,
      appointment.status,
    ],
  );
  return rows[0].id as string;
}

export interface RatingSeed {
  appointmentId: string;
  clientId: string;
  stars: number;
  comment?: string | null;
  createdAt: Date;
}

/** [K2] Inserta una calificación con la fecha indicada (para probar filtros y orden). */
export async function seedRating(dataSource: DataSource, rating: RatingSeed): Promise<void> {
  await dataSource.query(
    `INSERT INTO scheduling.ratings (appointment_id, client_id, stars, comment, created_at)
     VALUES ($1, $2, $3, $4, $5)`,
    [rating.appointmentId, rating.clientId, rating.stars, rating.comment ?? null, rating.createdAt],
  );
}

/** [K2] Calificaciones guardadas de una cita. */
export async function ratingsOf(
  dataSource: DataSource,
  appointmentId: string,
): Promise<Array<{ stars: number; comment: string | null; client_id: string }>> {
  return dataSource.query(
    `SELECT stars, comment, client_id FROM scheduling.ratings WHERE appointment_id = $1`,
    [appointmentId],
  );
}
