-- [M2] EXPLAIN ANALYZE de los endpoints de notifications (base notifications_db).
--   psql -U postgres -d notifications_db -f infra/db/optimization/explain/notifications.sql
-- o todos juntos con infra/db/optimization/explain/measure.sh
--
-- user_notifications: H2 (feat/H2-notifications-engine) y X3 la definen; "no leído" = read_at IS NULL.

SET search_path TO notifications, public;
\set hot_user '''99999999-0000-4000-8000-000000000001'''

\echo >> Q1 avisos no leidos del usuario (GET /notifications?leida=false), pagina 1
EXPLAIN (ANALYZE, BUFFERS)
SELECT n.*
FROM user_notifications n
WHERE n.user_id = :hot_user AND n.read_at IS NULL
ORDER BY n.created_at DESC
LIMIT 20 OFFSET 0;

\echo >> Q2 contador de avisos no leidos (badge de la app)
EXPLAIN (ANALYZE, BUFFERS)
SELECT count(*) FROM user_notifications WHERE user_id = :hot_user AND read_at IS NULL;

\echo >> Q3 todos los avisos del usuario, pagina 1
EXPLAIN (ANALYZE, BUFFERS)
SELECT n.*
FROM user_notifications n
WHERE n.user_id = :hot_user
ORDER BY n.created_at DESC
LIMIT 20 OFFSET 0;

\echo >> Q4 despachador - recordatorios pendientes cuya hora ya llego (job cada minuto)
EXPLAIN (ANALYZE, BUFFERS)
SELECT id FROM scheduled_reminders
WHERE status = 'pending' AND fire_at <= NOW() + interval '3 days'
ORDER BY fire_at
LIMIT 200;

\echo >> Q5 cancelar recordatorios de una cita (DELETE /internal/reminders por tipo y ref_id)
SELECT ref_id AS some_ref FROM scheduled_reminders WHERE type = 'cita' LIMIT 1 \gset
EXPLAIN (ANALYZE, BUFFERS)
SELECT id FROM scheduled_reminders WHERE type = 'cita' AND ref_id = :'some_ref' AND status = 'pending';

\echo >> Q6 recordatorios de un usuario por estado
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM scheduled_reminders WHERE user_id = :hot_user AND status = 'pending';
