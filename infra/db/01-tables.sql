-- auth schema
CREATE TABLE auth.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email CITEXT UNIQUE NOT NULL,
    password_hash VARCHAR NOT NULL,
    role VARCHAR NOT NULL CHECK (role IN ('owner', 'vet', 'reception', 'admin')),
    status VARCHAR NOT NULL DEFAULT 'active',
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
    first_name VARCHAR NOT NULL,
    last_name VARCHAR NOT NULL,
    email CITEXT NOT NULL,
    phone VARCHAR,
    address VARCHAR,
    district VARCHAR,
    active BOOLEAN DEFAULT true
);

CREATE TABLE clients_pets.pets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients_pets.clients(id) ON DELETE RESTRICT,
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

-- catalog schema
CREATE TABLE catalog.clinic (
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

CREATE TABLE catalog.specialties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR UNIQUE NOT NULL,
    duration_minutes INT NOT NULL,
    active BOOLEAN DEFAULT true
);

CREATE TABLE catalog.vets (
    user_id UUID PRIMARY KEY,
    first_name VARCHAR NOT NULL,
    last_name VARCHAR NOT NULL,
    professional_license VARCHAR,
    photo_url VARCHAR,
    active BOOLEAN DEFAULT true
);

CREATE TABLE catalog.vet_specialties (
    vet_user_id UUID NOT NULL REFERENCES catalog.vets(user_id) ON DELETE CASCADE,
    specialty_id UUID NOT NULL REFERENCES catalog.specialties(id) ON DELETE CASCADE,
    PRIMARY KEY (vet_user_id, specialty_id)
);
-- ============================================================================
-- 1. SCHEMA: SCHEDULING (Availability and Appointments)
-- ============================================================================

CREATE TABLE scheduling.availability_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vet_user_id UUID NOT NULL,
    specialty_id UUID NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    status VARCHAR(20) CHECK (status IN ('available', 'booked', 'blocked')),
    created_by UUID,
    UNIQUE (vet_user_id, start_time)
);

CREATE TABLE scheduling.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slot_id UUID NOT NULL UNIQUE,
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
    CONSTRAINT fk_appointments_slot FOREIGN KEY (slot_id) REFERENCES scheduling.availability_slots(id) ON DELETE RESTRICT
);

CREATE TABLE scheduling.ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID NOT NULL UNIQUE,
    client_id UUID NOT NULL,
    stars SMALLINT CHECK (stars BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fk_ratings_appointment FOREIGN KEY (appointment_id) REFERENCES scheduling.appointments(id) ON DELETE CASCADE
);

CREATE TABLE scheduling.audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_user_id UUID,
    action VARCHAR(100),
    entity_id UUID,
    data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 2. SCHEMA: CLINICAL (Medical Events and Health Record)
-- ============================================================================

CREATE TABLE clinical.clinical_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pet_id UUID NOT NULL,
    vet_user_id UUID NOT NULL,
    type VARCHAR(20) CHECK (type IN ('consultation', 'vaccine', 'checkup')),
    date TIMESTAMPTZ DEFAULT NOW(),
    weight_kg DECIMAL(5,2),
    temperature_c DECIMAL(4,1),
    reason VARCHAR(200),
    notes TEXT,
    next_checkup DATE
);

CREATE INDEX idx_clinical_events_pet_date ON clinical.clinical_events (pet_id, date DESC);

CREATE TABLE clinical.vaccination_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinical_event_id UUID NOT NULL UNIQUE,
    vaccine VARCHAR(100),
    laboratory VARCHAR(100),
    batch VARCHAR(50),
    booster_date DATE,
    CONSTRAINT fk_vaccination_event FOREIGN KEY (clinical_event_id) REFERENCES clinical.clinical_events(id) ON DELETE CASCADE
);

CREATE TABLE clinical.treatments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinical_event_id UUID NOT NULL,
    pet_id UUID NOT NULL,
    medication VARCHAR(100),
    dose VARCHAR(50),
    route VARCHAR(50),
    frequency_hours INT,
    duration_days INT,
    start_date TIMESTAMPTZ,
    instructions TEXT,
    active BOOLEAN DEFAULT TRUE,
    CONSTRAINT fk_treatments_event FOREIGN KEY (clinical_event_id) REFERENCES clinical.clinical_events(id) ON DELETE CASCADE
);

CREATE TABLE clinical.treatment_doses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    treatment_id UUID NOT NULL,
    dose_number INT,
    scheduled_for TIMESTAMPTZ,
    confirmed_at TIMESTAMPTZ,
    source VARCHAR(20),
    CONSTRAINT fk_treatment_doses FOREIGN KEY (treatment_id) REFERENCES clinical.treatments(id) ON DELETE CASCADE
);

CREATE TABLE clinical.audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_user_id UUID,
    action VARCHAR(100),
    entity VARCHAR(50),
    entity_id UUID,
    data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 3. SCHEMA: NOTIFICATIONS (Tokens and Reminders)
-- ============================================================================

CREATE TABLE notifications.device_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    platform VARCHAR(20),
    active BOOLEAN DEFAULT TRUE,
    last_used_at TIMESTAMPTZ
);

CREATE TABLE notifications.scheduled_reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(50),
    ref_id UUID,
    user_id UUID NOT NULL,
    title VARCHAR(150),
    body TEXT,
    fire_at TIMESTAMPTZ NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    attempts INT DEFAULT 0,
    last_error TEXT
);

CREATE INDEX idx_reminders_pending_fire_at ON notifications.scheduled_reminders (fire_at) WHERE status = 'pending';

CREATE TABLE notifications.notification_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reminder_id UUID,
    channel VARCHAR(50),
    provider_response JSONB,
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fk_notification_log_reminder FOREIGN KEY (reminder_id) REFERENCES notifications.scheduled_reminders(id) ON DELETE SET NULL
);

CREATE TABLE notifications.email_outbox (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient VARCHAR(255),
    template VARCHAR(100),
    data JSONB,
    status VARCHAR(20) DEFAULT 'pending',
    attempts INT DEFAULT 0
);
