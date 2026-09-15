-- ============================================================================
-- 1. ESQUEMA: SCHEDULING (Disponibilidad y Citas)
-- ============================================================================

CREATE TABLE scheduling.availability_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vet_user_id UUID NOT NULL, 
    specialty_id UUID NOT NULL, 
    inicio TIMESTAMPTZ NOT NULL,
    fin TIMESTAMPTZ NOT NULL,
    estado VARCHAR(20) CHECK (estado IN ('libre', 'reservado', 'bloqueado')),[cite: 3, 10]
    created_by UUID,
    UNIQUE (vet_user_id, inicio) -- Impide que un veterinario publique bloques solapados[cite: 3, 10]
);

CREATE TABLE scheduling.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slot_id UUID NOT NULL UNIQUE, -- BR-5: Restricción crítica contra dobles reservas[cite: 3, 7, 10]
    pet_id UUID NOT NULL, 
    client_id UUID NOT NULL, 
    vet_user_id UUID NOT NULL,
    specialty_id UUID NOT NULL,
    inicio TIMESTAMPTZ NOT NULL,
    fin TIMESTAMPTZ NOT NULL,
    estado VARCHAR(20) CHECK (estado IN ('reservada', 'confirmada', 'realizada', 'cancelada', 'no_asistio')),[cite: 3, 10]
    canal VARCHAR(20) DEFAULT 'app',[cite: 10]
    created_by UUID,
    cancelled_at TIMESTAMPTZ,
    CONSTRAINT fk_appointments_slot FOREIGN KEY (slot_id) REFERENCES scheduling.availability_slots(id) ON DELETE RESTRICT[cite: 7]
);

CREATE TABLE scheduling.ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID NOT NULL UNIQUE, -- BR-13: Garantiza una única calificación por cita[cite: 3]
    client_id UUID NOT NULL,
    estrellas SMALLINT CHECK (estrellas BETWEEN 1 AND 5),[cite: 3]
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
    tipo VARCHAR(20) CHECK (tipo IN ('consulta', 'vacuna', 'control')),[cite: 3, 10]
    fecha TIMESTAMPTZ DEFAULT NOW(),[cite: 10]
    peso_kg DECIMAL(5,2),[cite: 10]
    temperatura_c DECIMAL(4,1),[cite: 10]
    motivo VARCHAR(200),[cite: 10]
    observaciones TEXT,[cite: 10]
    proximo_control DATE[cite: 3, 10]
);

-- Índice requerido para optimizar los tiempos de carga del carnet digital (NFR-1)[cite: 7]
CREATE INDEX idx_clinical_events_pet_fecha ON clinical.clinical_events (pet_id, fecha DESC);[cite: 7]

CREATE TABLE clinical.vaccination_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinical_event_id UUID NOT NULL UNIQUE, -- 3FN: Relación 1:1 para evitar columnas nulas en consultas normales[cite: 3, 7]
    vacuna VARCHAR(100),[cite: 3]
    laboratorio VARCHAR(100),[cite: 3]
    lote VARCHAR(50),[cite: 3]
    fecha_refuerzo DATE,[cite: 3]
    CONSTRAINT fk_vaccination_event FOREIGN KEY (clinical_event_id) REFERENCES clinical.clinical_events(id) ON DELETE CASCADE[cite: 7]
);

CREATE TABLE clinical.treatments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinical_event_id UUID NOT NULL,[cite: 3]
    pet_id UUID NOT NULL,[cite: 3]
    medicamento VARCHAR(100),[cite: 3]
    dosis VARCHAR(50),[cite: 3]
    via VARCHAR(50),[cite: 3]
    frecuencia_horas INT,[cite: 3]
    duracion_dias INT,[cite: 3]
    inicio TIMESTAMPTZ,[cite: 3]
    indicaciones TEXT,[cite: 3]
    activo BOOLEAN DEFAULT TRUE,[cite: 3]
    CONSTRAINT fk_treatments_event FOREIGN KEY (clinical_event_id) REFERENCES clinical.clinical_events(id) ON DELETE CASCADE
);

CREATE TABLE clinical.treatment_doses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    treatment_id UUID NOT NULL,[cite: 3]
    numero_dosis INT,[cite: 3]
    programada_para TIMESTAMPTZ,[cite: 3]
    confirmada_at TIMESTAMPTZ,[cite: 3]
    origen VARCHAR(20),[cite: 3]
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
    user_id UUID NOT NULL,[cite: 3]
    token VARCHAR(255) UNIQUE NOT NULL,[cite: 3]
    plataforma VARCHAR(20),[cite: 3]
    activo BOOLEAN DEFAULT TRUE,[cite: 3]
    ultimo_uso_at TIMESTAMPTZ[cite: 3]
);

CREATE TABLE notifications.scheduled_reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tipo VARCHAR(50),[cite: 3]
    ref_id UUID,[cite: 3]
    user_id UUID NOT NULL,[cite: 3]
    titulo VARCHAR(150),[cite: 3]
    cuerpo TEXT,[cite: 3]
    fire_at TIMESTAMPTZ NOT NULL,[cite: 3]
    estado VARCHAR(20) DEFAULT 'pendiente',[cite: 3]
    intentos INT DEFAULT 0,[cite: 3]
    ultimo_error TEXT[cite: 3]
);

-- Índice parcial para optimizar el job de despacho sin cargar la CPU[cite: 3]
CREATE INDEX idx_reminders_pending_fire_at ON notifications.scheduled_reminders (fire_at) WHERE estado = 'pendiente';[cite: 3]

CREATE TABLE notifications.notification_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reminder_id UUID,[cite: 3]
    canal VARCHAR(50),[cite: 3]
    proveedor_respuesta JSONB,[cite: 3]
    enviado_at TIMESTAMPTZ DEFAULT NOW(),[cite: 3]
    CONSTRAINT fk_notification_log_reminder FOREIGN KEY (reminder_id) REFERENCES notifications.scheduled_reminders(id) ON DELETE SET NULL
);

CREATE TABLE notifications.email_outbox (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    destinatario VARCHAR(255),[cite: 3]
    plantilla VARCHAR(100),[cite: 3]
    datos JSONB,[cite: 3]
    estado VARCHAR(20) DEFAULT 'pendiente',[cite: 3]
    intentos INT DEFAULT 0[cite: 3]
);