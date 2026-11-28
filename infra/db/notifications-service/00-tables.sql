-- ============================================================================
-- infra/db/notifications-service/00-tables.sql
-- Base de datos: notifications_db  (propiedad exclusiva de notifications-service)
-- Sin esquemas: las tablas viven en el esquema por defecto (public).
-- Ejecutar conectado a notifications_db, después de 00-databases.sql.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE device_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    platform VARCHAR(20),
    active BOOLEAN DEFAULT TRUE,
    last_used_at TIMESTAMPTZ
);

CREATE TABLE scheduled_reminders (
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

CREATE INDEX idx_reminders_pending_fire_at ON scheduled_reminders (fire_at) WHERE status = 'pending';

CREATE TABLE notification_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reminder_id UUID,
    channel VARCHAR(50),
    provider_response JSONB,
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fk_notification_log_reminder FOREIGN KEY (reminder_id) REFERENCES scheduled_reminders(id) ON DELETE SET NULL
);

-- Centro de avisos del dueño. Lo comparten H1 y H2:
CREATE TABLE user_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    pet_id UUID,
    reminder_id UUID UNIQUE,
    type VARCHAR(50),
    ref_id UUID,
    title VARCHAR(150),
    body TEXT,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_user_notifications_reminder FOREIGN KEY (reminder_id) REFERENCES scheduled_reminders(id) ON DELETE SET NULL
);

CREATE INDEX idx_user_notifications_user_created ON user_notifications (user_id, created_at DESC);
CREATE INDEX idx_user_notifications_unread ON user_notifications (user_id) WHERE is_read = FALSE;

CREATE TABLE email_outbox (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient VARCHAR(255),
    template VARCHAR(100),
    data JSONB,
    status VARCHAR(20) DEFAULT 'pending',
    attempts INT DEFAULT 0
);
