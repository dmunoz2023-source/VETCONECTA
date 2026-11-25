-- [M2] Seed de volumen alto para notifications (base notifications_db).
--   psql -U postgres -d notifications_db -f infra/db/optimization/volume-seed/notifications.sql
--
-- SOLO para una base de pruebas de rendimiento. Es idempotente.
--
-- Volumen: 2.000 usuarios, ~200.000 avisos (user_notifications, 70 % leídos) y ~150.000
-- recordatorios programados (la mayoría ya enviados).
--   Usuario "caliente": 99999999-0000-4000-8000-000000000001 (5.000 avisos, 3.000 recordatorios)
--
-- user_notifications la crea H2 (feat/H2-notifications-engine). Si la tabla todavía no
-- existe, esa parte se omite.

-- Con esquemas (develop) las tablas están en "notifications"; con bases separadas, en "public".
SET search_path TO notifications, public;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM scheduled_reminders WHERE user_id = '99999999-0000-4000-8000-000000000001') THEN
        RAISE NOTICE 'Seed de volumen ya cargado: no se hace nada.';
        RETURN;
    END IF;

    CREATE TEMP TABLE seed_users ON COMMIT DROP AS
        SELECT md5('user-' || n)::uuid AS user_id, n FROM generate_series(1, 2000) AS n
        UNION ALL
        SELECT '99999999-0000-4000-8000-000000000001'::uuid, 0;

    INSERT INTO scheduled_reminders (type, ref_id, user_id, title, body, fire_at, status)
    SELECT 'cita', md5('ref-' || u.n || '-' || r)::uuid, u.user_id,
           'Recordatorio de cita', 'Mañana tienes una cita',
           NOW() + ((r - 60) * interval '6 hours'),
           CASE WHEN r < 55 THEN 'sent' WHEN r < 58 THEN 'failed' ELSE 'pending' END
    FROM seed_users u
    CROSS JOIN LATERAL generate_series(1, CASE WHEN u.n = 0 THEN 3000 ELSE 75 END) AS r;

    IF to_regclass('user_notifications') IS NOT NULL THEN
        INSERT INTO user_notifications (user_id, title, body, read_at, created_at)
        SELECT u.user_id, 'Aviso ' || a, 'Contenido del aviso ' || a,
               CASE WHEN a % 10 < 7 THEN NOW() - (a * interval '1 hour') END,
               NOW() - (a * interval '3 hours')
        FROM seed_users u
        CROSS JOIN LATERAL generate_series(1, CASE WHEN u.n = 0 THEN 5000 ELSE 98 END) AS a;
    END IF;
END
$$;

ANALYZE;
