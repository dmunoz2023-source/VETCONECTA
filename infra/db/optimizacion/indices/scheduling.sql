-- [M2] Índices de scheduling (base scheduling_db).
--   psql -U postgres -d scheduling_db -f infra/db/optimizacion/indices/scheduling.sql
--
-- Idempotente (IF NOT EXISTS). En una base con tráfico real conviene crearlos con
-- CREATE INDEX CONCURRENTLY, pero ese modo no puede ir dentro de un script transaccional.
--
-- Ya existían y se mantienen: UNIQUE (vet_user_id, start_time) en availability_slots,
-- uq_appointments_vet_start_active (parcial: solo citas vigentes) e idx_vet_blocks_vet_date.

-- Con esquemas (develop) las tablas están en "scheduling"; con bases separadas, en "public".
SET search_path TO scheduling, public;

-- Agenda de un veterinario (cualquier estado: realizadas, canceladas, no asistió).
-- El índice único parcial solo cubre citas booked/confirmed, por eso no sirve aquí.
-- GET /scheduling/appointments?veterinario=&desde=&hasta=
CREATE INDEX IF NOT EXISTS idx_appointments_vet_start
    ON appointments (vet_user_id, start_time);

-- Agenda de la clínica por día, todos los veterinarios.
-- GET /scheduling/appointments?fecha=
CREATE INDEX IF NOT EXISTS idx_appointments_start
    ON appointments (start_time);

-- "Mis citas" del dueño, de la más reciente a la más antigua.
-- GET /scheduling/appointments/me
CREATE INDEX IF NOT EXISTS idx_appointments_client_start
    ON appointments (client_id, start_time DESC);

-- Disponibilidad: solo los bloques libres. Es parcial porque la gran mayoría de los
-- bloques pasan a booked/blocked y no deben ensuciar el índice.
-- GET /scheduling/availability
CREATE INDEX IF NOT EXISTS idx_slots_free_by_vet_specialty
    ON availability_slots (vet_user_id, specialty_id, start_time)
    WHERE status = 'available';

-- Calificaciones por fecha (K2: filtros y últimos comentarios del dashboard).
CREATE INDEX IF NOT EXISTS idx_ratings_created_at
    ON ratings (created_at DESC);

ANALYZE;
