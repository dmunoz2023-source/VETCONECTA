-- [M2] Índices de notifications (base notifications_db).
--   psql -U postgres -d notifications_db -f infra/db/optimization/indexes/notifications.sql
--
-- Idempotente (IF NOT EXISTS).
--
-- Ya existen y se mantienen: idx_reminders_pending_fire_at (parcial, lo usa el despachador)
-- e idx_user_notifications_user_created_at (H2).

-- Con esquemas (develop) las tablas están en "notifications"; con bases separadas, en "public".
SET search_path TO notifications, public;

-- Avisos no leídos del usuario (notificacion(usuario_id, leida) del enunciado). Parcial:
-- los leídos son la mayoría y nunca se piden por este camino.
-- "No leído" = read_at IS NULL (columna presente en H2 y en la estructura de X3).
-- user_notifications la crea H2 (feat/H2-notifications-engine): si aún no existe, se omite.
DO $$
BEGIN
    IF to_regclass('user_notifications') IS NOT NULL THEN
        CREATE INDEX IF NOT EXISTS idx_user_notifications_user_unread
            ON user_notifications (user_id, created_at DESC)
            WHERE read_at IS NULL;
    ELSE
        RAISE NOTICE 'user_notifications no existe todavía (H2): se omite idx_user_notifications_user_unread.';
    END IF;
END
$$;

-- Anular recordatorios de una cita o de una pauta por tipo y ref_id.
-- DELETE /internal/reminders
CREATE INDEX IF NOT EXISTS idx_reminders_type_ref
    ON scheduled_reminders (type, ref_id);

-- Recordatorios de un usuario por estado.
CREATE INDEX IF NOT EXISTS idx_reminders_user_status
    ON scheduled_reminders (user_id, status);

ANALYZE;
