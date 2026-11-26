-- ============================================================================
-- infra/db/scheduling-service/00-tables.sql
-- Base de datos: scheduling_db  (propiedad exclusiva de scheduling-service)
-- Sin esquemas: las tablas viven en el esquema por defecto (public).
-- Ejecutar conectado a scheduling_db, después de 00-databases.sql.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE availability_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vet_user_id UUID NOT NULL,
    specialty_id UUID NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    status VARCHAR(20) CHECK (status IN ('available', 'booked', 'blocked')),
    created_by UUID,
    UNIQUE (vet_user_id, start_time)
);

CREATE TABLE vet_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vet_user_id UUID NOT NULL,
    day_of_week SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    CHECK (end_time > start_time),
    UNIQUE (vet_user_id, day_of_week, start_time)
);

CREATE TABLE vet_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vet_user_id UUID NOT NULL,
    block_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    reason VARCHAR(200) NOT NULL,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CHECK (
        (start_time IS NULL AND end_time IS NULL)
        OR (start_time IS NOT NULL AND end_time IS NOT NULL AND end_time > start_time)
    )
);

CREATE INDEX idx_vet_blocks_vet_date ON vet_blocks (vet_user_id, block_date);

CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slot_id UUID,
    pet_id UUID NOT NULL,
    client_id UUID NOT NULL,
    vet_user_id UUID NOT NULL,
    specialty_id UUID NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    status VARCHAR(20) CHECK (status IN ('booked', 'confirmed', 'completed', 'cancelled', 'no_show')),
    channel VARCHAR(20) DEFAULT 'app',
    created_by UUID,
    cancelled_at TIMESTAMPTZ,
    CONSTRAINT fk_appointments_slot FOREIGN KEY (slot_id) REFERENCES availability_slots(id) ON DELETE RESTRICT
);

CREATE UNIQUE INDEX uq_appointments_vet_start_active
    ON appointments (vet_user_id, start_time)
    WHERE status IN ('booked', 'confirmed');

CREATE TABLE ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID NOT NULL UNIQUE,
    client_id UUID NOT NULL,
    stars SMALLINT CHECK (stars BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fk_ratings_appointment FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE
);

CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_user_id UUID,
    action VARCHAR(100),
    entity_id UUID,
    data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);