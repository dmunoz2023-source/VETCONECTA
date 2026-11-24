-- ============================================================================
-- infra/db/clients-pets-service/00-tables.sql
-- Base de datos: clients_pets_db  (propiedad exclusiva de clients-pets-service)
-- Sin esquemas: las tablas viven en el esquema por defecto (public).
-- Ejecutar conectado a clients_pets_db, después de 00-databases.sql.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "citext";

CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL,
    rut CITEXT UNIQUE NOT NULL,
    first_name VARCHAR NOT NULL,
    last_name VARCHAR NOT NULL,
    email CITEXT NOT NULL,
    phone VARCHAR,
    address VARCHAR,
    district VARCHAR,
    active BOOLEAN DEFAULT true
);

CREATE TABLE pets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
    name VARCHAR NOT NULL,
    species VARCHAR NOT NULL,
    breed VARCHAR,
    sex VARCHAR,
    birth_date DATE,
    color VARCHAR,
    microchip VARCHAR,
    photo_url VARCHAR,
    active BOOLEAN DEFAULT true
);
