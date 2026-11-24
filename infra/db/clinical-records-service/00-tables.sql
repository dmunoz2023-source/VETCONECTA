-- ============================================================================
-- infra/db/clinical-records-service/00-tables.sql
-- Base de datos: clinical_db  (propiedad exclusiva de clinical-records-service)
-- Sin esquemas: las tablas viven en el esquema por defecto (public).
-- Ejecutar conectado a clinical_db, después de 00-databases.sql.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE clinical_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pet_id UUID NOT NULL,
    vet_user_id UUID NOT NULL,
    type VARCHAR(20) CHECK (type IN ('consultation', 'vaccine', 'checkup')),
    date TIMESTAMPTZ DEFAULT NOW(),
    weight_kg DECIMAL(5,2),
    temperature_c DECIMAL(4,1),
    reason VARCHAR(200),
    diagnosis VARCHAR(200),
    notes TEXT,
    next_checkup DATE
);

CREATE INDEX idx_clinical_events_pet_date ON clinical_events (pet_id, date DESC);

CREATE TABLE vaccination_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinical_event_id UUID NOT NULL UNIQUE,
    vaccine VARCHAR(100),
    laboratory VARCHAR(100),
    batch VARCHAR(50),
    booster_date DATE,
    CONSTRAINT fk_vaccination_event FOREIGN KEY (clinical_event_id) REFERENCES clinical_events(id) ON DELETE CASCADE
);

CREATE TABLE treatments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinical_event_id UUID,
    pet_id UUID NOT NULL,
    medication VARCHAR(100),
    dose VARCHAR(50),
    route VARCHAR(50),
    frequency_hours INT,
    duration_days INT,
    start_date TIMESTAMPTZ,
    instructions TEXT,
    active BOOLEAN DEFAULT TRUE,
    CONSTRAINT fk_treatments_event FOREIGN KEY (clinical_event_id) REFERENCES clinical_events(id) ON DELETE CASCADE
);

CREATE TABLE treatment_doses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    treatment_id UUID NOT NULL,
    dose_number INT,
    scheduled_for TIMESTAMPTZ,
    confirmed_at TIMESTAMPTZ,
    source VARCHAR(20),
    CONSTRAINT fk_treatment_doses FOREIGN KEY (treatment_id) REFERENCES treatments(id) ON DELETE CASCADE
);

CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_user_id UUID,
    action VARCHAR(100),
    entity VARCHAR(50),
    entity_id UUID,
    data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
