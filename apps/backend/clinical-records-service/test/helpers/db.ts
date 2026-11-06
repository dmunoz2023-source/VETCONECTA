import { DataSource } from 'typeorm';

export interface EventSeed {
  petId: string;
  vetUserId: string;
  type: 'consultation' | 'vaccine' | 'checkup';
  date: string;
  weightKg?: number;
  temperatureC?: number;
  reason?: string;
  notes?: string;
  nextCheckup?: string;
  vaccine?: { vaccine: string; laboratory?: string; batch?: string; boosterDate?: string };
}

/** Deja vacías las tablas de clinical entre pruebas. */
export async function resetDatabase(dataSource: DataSource): Promise<void> {
  await dataSource.query('TRUNCATE clinical.vaccination_details, clinical.clinical_events CASCADE');
}

/** Inserta un evento clínico (y su detalle de vacuna si corresponde) y devuelve su id. */
export async function seedEvent(dataSource: DataSource, event: EventSeed): Promise<string> {
  const rows = await dataSource.query(
    `INSERT INTO clinical.clinical_events
       (pet_id, vet_user_id, type, date, weight_kg, temperature_c, reason, notes, next_checkup)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
    [
      event.petId,
      event.vetUserId,
      event.type,
      event.date,
      event.weightKg ?? null,
      event.temperatureC ?? null,
      event.reason ?? null,
      event.notes ?? null,
      event.nextCheckup ?? null,
    ],
  );
  const id = rows[0].id as string;

  if (event.vaccine) {
    await dataSource.query(
      `INSERT INTO clinical.vaccination_details (clinical_event_id, vaccine, laboratory, batch, booster_date)
       VALUES ($1, $2, $3, $4, $5)`,
      [id, event.vaccine.vaccine, event.vaccine.laboratory ?? null, event.vaccine.batch ?? null, event.vaccine.boosterDate ?? null],
    );
  }
  return id;
}

/**
 * Carga masiva para medir el rendimiento: `perPet` eventos para cada una de `pets` mascotas
 * generadas, repartidos en el último año, más `petEvents` eventos para la mascota indicada.
 */
export async function seedBulk(
  dataSource: DataSource,
  target: { petId: string; vetUserId: string; petEvents: number },
  noise: { pets: number; perPet: number },
): Promise<void> {
  await dataSource.query(
    `INSERT INTO clinical.clinical_events (pet_id, vet_user_id, type, date, weight_kg, reason)
     SELECT $1, $2, (ARRAY['consultation','vaccine','checkup'])[1 + (g % 3)],
            now() - (g || ' hours')::interval, 10 + (g % 20), 'carga ' || g
     FROM generate_series(1, $3) g`,
    [target.petId, target.vetUserId, target.petEvents],
  );
  await dataSource.query(
    `INSERT INTO clinical.clinical_events (pet_id, vet_user_id, type, date, weight_kg, reason)
     SELECT gen_random_uuid(), $1, (ARRAY['consultation','vaccine','checkup'])[1 + (g % 3)],
            now() - (g || ' hours')::interval, 10 + (g % 20), 'ruido ' || g
     FROM generate_series(1, $2) g`,
    [target.vetUserId, noise.pets * noise.perPet],
  );
  await dataSource.query('ANALYZE clinical.clinical_events');
}
