-- [M2] Índices de clinical (base clinical_db).
--   psql -U postgres -d clinical_db -f infra/db/optimizacion/indices/clinical.sql
--
-- Idempotente (IF NOT EXISTS).
--
-- Ya existe y se mantiene: idx_clinical_events_pet_date (pet_id, date DESC), que es el índice
-- de carnet, historial y última visita (clinical_events.mascota_id + fecha del enunciado).

-- Con esquemas (develop) las tablas están en "clinical"; con bases separadas, en "public".
SET search_path TO clinical, public;

-- Pauta de tratamiento vigente de una mascota. Parcial: la mayoría de las pautas
-- terminadas no se consultan en el uso normal (?todos=true es la excepción).
-- GET /mascotas/:id/tratamientos
CREATE INDEX IF NOT EXISTS idx_treatments_pet_active
    ON treatments (pet_id, start_date DESC)
    WHERE active = TRUE;

-- Histórico completo de pautas de una mascota (?todos=true).
CREATE INDEX IF NOT EXISTS idx_treatments_pet_start
    ON treatments (pet_id, start_date DESC);

-- Tratamientos de un evento clínico (detalle del evento en el historial) y borrado en cascada.
CREATE INDEX IF NOT EXISTS idx_treatments_event
    ON treatments (clinical_event_id);

-- Dosis de una pauta (FK sin índice: cada borrado en cascada recorrería toda la tabla).
CREATE INDEX IF NOT EXISTS idx_treatment_doses_treatment
    ON treatment_doses (treatment_id);

ANALYZE;
