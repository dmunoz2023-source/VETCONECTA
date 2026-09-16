-- infra/db/01-tables.sql

-- ==========================================
-- ESQUEMA AUTH (Microservicio auth-service)
-- ==========================================
CREATE TABLE auth.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email citext UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('owner', 'vet', 'reception', 'admin')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- ESQUEMA CLIENTS_PETS (Microservicio clients-pets-service)
-- ==========================================
CREATE TABLE clients_pets.clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rut VARCHAR(12) UNIQUE NOT NULL,
    user_id UUID NOT NULL, -- FK Lógica a auth.users (Sin constraint físico)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE clients_pets.pets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients_pets.clients(id) ON DELETE CASCADE, -- FK permitida (mismo esquema)
    nombre VARCHAR(100) NOT NULL,
    fecha_nacimiento DATE NOT NULL, -- La edad se calcula dinámicamente al vuelo (BR-2)
    peso_actual DECIMAL(5,2),
    activo BOOLEAN DEFAULT true
);

-- ==========================================
-- ESQUEMA CATALOG (Microservicio clinic-catalog-service)
-- ==========================================
CREATE TABLE catalog.clinic (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(150) NOT NULL,
    telefono_emergencia VARCHAR(20) NOT NULL,
    email_contacto VARCHAR(100) NOT NULL
);

CREATE TABLE catalog.specialties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(100) UNIQUE NOT NULL,
    duracion_minutos INTEGER DEFAULT 30
);