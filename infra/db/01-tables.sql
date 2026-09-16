-- auth schema
CREATE TABLE auth.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email CITEXT UNIQUE NOT NULL,
    password_hash VARCHAR NOT NULL,
    role VARCHAR NOT NULL CHECK (role IN ('owner', 'vet', 'reception', 'admin')),
    status VARCHAR NOT NULL DEFAULT 'activa',
    email_verified_at TIMESTAMPTZ,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE auth.refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    token_hash VARCHAR NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ,
    user_agent VARCHAR
);

-- clients pets schema
CREATE TABLE clients_pets.clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL, 
    rut CITEXT UNIQUE NOT NULL,
    nombres VARCHAR NOT NULL,
    apellidos VARCHAR NOT NULL,
    email CITEXT NOT NULL,
    telefono VARCHAR,
    direccion VARCHAR,
    comuna VARCHAR,
    activo BOOLEAN DEFAULT true
);

CREATE TABLE clients_pets.pets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients_pets.clients(id) ON DELETE RESTRICT,
    nombre VARCHAR NOT NULL,
    especie VARCHAR NOT NULL,
    raza VARCHAR,
    sexo VARCHAR,
    fecha_nacimiento DATE, 
    color VARCHAR,
    microchip VARCHAR,
    foto_url VARCHAR,
    activo BOOLEAN DEFAULT true
);

-- catalog schema
CREATE TABLE catalog.clinic (
    id INT PRIMARY KEY DEFAULT 1,
    nombre VARCHAR NOT NULL,
    rut VARCHAR NOT NULL,
    direccion VARCHAR,
    comuna VARCHAR,
    telefono VARCHAR,
    telefono_emergencia VARCHAR NOT NULL,
    whatsapp VARCHAR,
    email VARCHAR,
    horario JSONB,
    lat DECIMAL,
    lng DECIMAL
);

CREATE TABLE catalog.specialties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR UNIQUE NOT NULL,
    duracion_min INT NOT NULL,
    activo BOOLEAN DEFAULT true
);

CREATE TABLE catalog.vets (
    user_id UUID PRIMARY KEY,
    nombres VARCHAR NOT NULL,
    apellidos VARCHAR NOT NULL,
    registro_profesional VARCHAR,
    foto_url VARCHAR,
    activo BOOLEAN DEFAULT true
);

CREATE TABLE catalog.vet_specialties (
    vet_user_id UUID NOT NULL REFERENCES catalog.vets(user_id) ON DELETE CASCADE,
    specialty_id UUID NOT NULL REFERENCES catalog.specialties(id) ON DELETE CASCADE,
    PRIMARY KEY (vet_user_id, specialty_id)
);