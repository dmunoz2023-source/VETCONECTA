-- ============================================================================
-- 1. ESQUEMA: SCHEDULING (Disponibilidad y Citas)
-- ============================================================================

CREATE TABLE scheduling.availability_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vet_user_id UUID NOT NULL, 
    specialty_id UUID NOT NULL, 
    inicio TIMESTAMPTZ NOT NULL,
    fin TIMESTAMPTZ NOT NULL,
    estado VARCHAR(20) CHECK (estado IN ('libre', 'reservado', 'bloqueado')),
    created_by UUID,
    UNIQUE (vet_user_id, inicio)
);

CREATE TABLE scheduling.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slot_id UUID NOT NULL UNIQUE,
    pet_id UUID NOT NULL, 
    client_id UUID NOT NULL, 
    vet_user_id UUID NOT NULL,
    specialty_id UUID NOT NULL,
    inicio TIMESTAMPTZ NOT NULL,
    fin TIMESTAMPTZ NOT NULL,
    estado VARCHAR(20) CHECK (estado IN ('reservada', 'confirmada', 'realizada', 'cancelada', 'no_asistio')),
    canal VARCHAR(20) DEFAULT 'app',
    created_by UUID,
    cancelled_at TIMESTAMPTZ,
    CONSTRAINT fk_appointments_slot FOREIGN KEY (slot_id) REFERENCES scheduling.availability_slots(id) ON DELETE RESTRICT
);

CREATE TABLE scheduling.ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID NOT NULL UNIQUE,
    client_id UUID NOT NULL,
    estrellas SMALLINT CHECK (estrellas BETWEEN 1 AND 5),
    comentario TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fk_ratings_appointment FOREIGN KEY (appointment_id) REFERENCES scheduling.appointments(id) ON DELETE CASCADE
);

CREATE TABLE scheduling.audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_user_id UUID,
    accion VARCHAR(100),
    entidad_id UUID,
    datos JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 2. ESQUEMA: CLINICAL (Eventos Médicos y Carnet)
-- ============================================================================

CREATE TABLE clinical.clinical_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pet_id UUID NOT NULL, 
    vet_user_id UUID NOT NULL, 
    tipo VARCHAR(20) CHECK (tipo IN ('consulta', 'vacuna', 'control')),
    fecha TIMESTAMPTZ DEFAULT NOW(),
    peso_kg DECIMAL(5,2),
    temperatura_c DECIMAL(4,1),
    motivo VARCHAR(200),
    observaciones TEXT,
    proximo_control DATE
);

CREATE INDEX idx_clinical_events_pet_fecha ON clinical.clinical_events (pet_id, fecha DESC);

CREATE TABLE clinical.vaccination_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinical_event_id UUID NOT NULL UNIQUE,
    vacuna VARCHAR(100),
    laboratorio VARCHAR(100),
    lote VARCHAR(50),
    fecha_refuerzo DATE,
    CONSTRAINT fk_vaccination_event FOREIGN KEY (clinical_event_id) REFERENCES clinical.clinical_events(id) ON DELETE CASCADE
);

CREATE TABLE clinical.treatments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinical_event_id UUID NOT NULL,
    pet_id UUID NOT NULL,
    medicamento VARCHAR(100),
    dosis VARCHAR(50),
    via VARCHAR(50),
    frecuencia_horas INT,
    duracion_dias INT,
    inicio TIMESTAMPTZ,
    indicaciones TEXT,
    activo BOOLEAN DEFAULT TRUE,
    CONSTRAINT fk_treatments_event FOREIGN KEY (clinical_event_id) REFERENCES clinical.clinical_events(id) ON DELETE CASCADE
);

CREATE TABLE clinical.treatment_doses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    treatment_id UUID NOT NULL,
    numero_dosis INT,
    programada_para TIMESTAMPTZ,
    confirmada_at TIMESTAMPTZ,
    origen VARCHAR(20),
    CONSTRAINT fk_treatment_doses FOREIGN KEY (treatment_id) REFERENCES clinical.treatments(id) ON DELETE CASCADE
);

CREATE TABLE clinical.audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_user_id UUID,
    accion VARCHAR(100),
    entidad VARCHAR(50),
    entidad_id UUID,
    datos JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 3. ESQUEMA: NOTIFICATIONS (Tokens y Recordatorios)
-- ============================================================================

CREATE TABLE notifications.device_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    plataforma VARCHAR(20),
    activo BOOLEAN DEFAULT TRUE,
    ultimo_uso_at TIMESTAMPTZ
);

CREATE TABLE notifications.scheduled_reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tipo VARCHAR(50),
    ref_id UUID,
    user_id UUID NOT NULL,
    titulo VARCHAR(150),
    cuerpo TEXT,
    fire_at TIMESTAMPTZ NOT NULL,
    estado VARCHAR(20) DEFAULT 'pendiente',
    intentos INT DEFAULT 0,
    ultimo_error TEXT
);

CREATE INDEX idx_reminders_pending_fire_at ON notifications.scheduled_reminders (fire_at) WHERE estado = 'pendiente';

CREATE TABLE notifications.notification_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reminder_id UUID,
    canal VARCHAR(50),
    proveedor_respuesta JSONB,
    enviado_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fk_notification_log_reminder FOREIGN KEY (reminder_id) REFERENCES notifications.scheduled_reminders(id) ON DELETE SET NULL
);

CREATE TABLE notifications.email_outbox (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    destinatario VARCHAR(255),
    plantilla VARCHAR(100),
    datos JSONB,
    estado VARCHAR(20) DEFAULT 'pendiente',
    intentos INT DEFAULT 0
);