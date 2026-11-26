-- ============================================================================
-- infra/db/clinic-catalog-service/00-tables.sql
-- Base de datos: catalog_db  (propiedad exclusiva de clinic-catalog-service)
-- Sin esquemas: las tablas viven en el esquema por defecto (public).
-- Ejecutar conectado a catalog_db, después de 00-databases.sql.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE clinic (
    id INT PRIMARY KEY DEFAULT 1,
    name VARCHAR NOT NULL,
    rut VARCHAR NOT NULL,
    address VARCHAR,
    district VARCHAR,
    phone VARCHAR,
    emergency_phone VARCHAR NOT NULL,
    whatsapp VARCHAR,
    email VARCHAR,
    schedule JSONB,
    lat DECIMAL,
    lng DECIMAL
);

CREATE TABLE specialties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR UNIQUE NOT NULL,
    duration_minutes INT NOT NULL,
    active BOOLEAN DEFAULT true
);

CREATE TABLE vets (
    user_id UUID PRIMARY KEY,
    first_name VARCHAR NOT NULL,
    last_name VARCHAR NOT NULL,
    professional_license VARCHAR,
    photo_url VARCHAR,
    active BOOLEAN DEFAULT true
);

CREATE TABLE vet_specialties (
    vet_user_id UUID NOT NULL REFERENCES vets(user_id) ON DELETE CASCADE,
    specialty_id UUID NOT NULL REFERENCES specialties(id) ON DELETE CASCADE,
    PRIMARY KEY (vet_user_id, specialty_id)
);
