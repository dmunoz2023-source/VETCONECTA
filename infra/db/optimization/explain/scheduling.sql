-- [M2] EXPLAIN ANALYZE de los endpoints de scheduling (base scheduling_db).
--   psql -U postgres -d scheduling_db -f infra/db/optimization/explain/scheduling.sql
-- o todos juntos con infra/db/optimization/explain/measure.sh

SET search_path TO scheduling, public;
\set vet       '''55555555-5555-5555-5555-555555555551'''
\set specialty '''44444444-4444-4444-4444-444444444441'''
SELECT md5('client-7')::uuid AS some_client \gset

\echo >> Q1 disponibilidad - bloques libres de un veterinario y especialidad (GET /scheduling/availability)
EXPLAIN (ANALYZE, BUFFERS)
SELECT slot.*
FROM availability_slots slot
WHERE slot.vet_user_id = :vet
  AND slot.specialty_id = :specialty
  AND slot.status = 'available'
  AND slot.start_time > NOW()
ORDER BY slot.start_time ASC;

\echo >> Q2 disponibilidad - misma consulta acotada a una semana (el rango que pide la app)
EXPLAIN (ANALYZE, BUFFERS)
SELECT slot.*
FROM availability_slots slot
WHERE slot.vet_user_id = :vet
  AND slot.specialty_id = :specialty
  AND slot.status = 'available'
  AND slot.start_time >= NOW()
  AND slot.start_time <  NOW() + interval '7 days'
ORDER BY slot.start_time ASC;

\echo >> Q3 citas vigentes del veterinario que se cruzan con un dia (G3, bloqueos y calculo de bloques)
EXPLAIN (ANALYZE, BUFFERS)
SELECT a.*
FROM appointments a
WHERE a.vet_user_id = :vet
  AND a.status IN ('booked', 'confirmed')
  AND a.start_time < NOW() + interval '1 day'
  AND a.end_time   > NOW()
ORDER BY a.start_time ASC;

\echo >> Q4 agenda de la clinica - un dia, todos los veterinarios (GET /scheduling/appointments?fecha=)
EXPLAIN (ANALYZE, BUFFERS)
SELECT a.*
FROM appointments a
WHERE a.start_time >= date_trunc('day', NOW() + interval '3 days')
  AND a.start_time <  date_trunc('day', NOW() + interval '4 days')
ORDER BY a.start_time ASC;

\echo >> Q5 agenda de un veterinario - una semana, cualquier estado
EXPLAIN (ANALYZE, BUFFERS)
SELECT a.*
FROM appointments a
WHERE a.vet_user_id = :vet
  AND a.start_time >= date_trunc('week', NOW())
  AND a.start_time <  date_trunc('week', NOW()) + interval '7 days'
ORDER BY a.start_time ASC;

\echo >> Q6 citas del dueno (GET /scheduling/appointments/me), pagina 1
EXPLAIN (ANALYZE, BUFFERS)
SELECT a.*
FROM appointments a
WHERE a.client_id = :'some_client'
ORDER BY a.start_time DESC
LIMIT 20 OFFSET 0;

\echo >> Q7 resumen de calificaciones por veterinario (K2: GET /calificaciones/resumen)
EXPLAIN (ANALYZE, BUFFERS)
SELECT a.vet_user_id, round(avg(r.stars), 2) AS average, count(*) AS total
FROM ratings r
JOIN appointments a ON a.id = r.appointment_id
GROUP BY a.vet_user_id;

\echo >> Q8 calificaciones de un veterinario en un rango de fechas (K2: GET /calificaciones?veterinario=&desde=)
EXPLAIN (ANALYZE, BUFFERS)
SELECT r.*
FROM ratings r
JOIN appointments a ON a.id = r.appointment_id
WHERE a.vet_user_id = :vet
  AND r.created_at >= NOW() - interval '30 days'
ORDER BY r.created_at DESC
LIMIT 20;
