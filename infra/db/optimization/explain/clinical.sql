-- [M2] EXPLAIN ANALYZE de los endpoints de clinical (base clinical_db).
--   psql -U postgres -d clinical_db -f infra/db/optimization/explain/clinical.sql
-- o todos juntos con infra/db/optimization/explain/measure.sh
--
-- Cada consulta es la que generan los repositorios (TypeORM) para ese endpoint.
-- Mascota "caliente" (5.000 eventos) = peor caso; mascota normal (100 eventos) = caso típico.

SET search_path TO clinical, public;
\set hot_pet   '''aaaaaaaa-0000-4000-8000-000000000001'''
SELECT md5('pet-1')::uuid AS normal_pet \gset

\echo >> Q1 carnet - mascota normal (GET /clinical/pets/:id/carnet, sin paginar)
EXPLAIN (ANALYZE, BUFFERS)
SELECT e.*, v.*
FROM clinical_events e
LEFT JOIN vaccination_details v ON v.clinical_event_id = e.id
WHERE e.pet_id = :'normal_pet'
ORDER BY e.date DESC;

\echo >> Q2 carnet - mascota caliente (5.000 eventos, sin paginar)
EXPLAIN (ANALYZE, BUFFERS)
SELECT e.*, v.*
FROM clinical_events e
LEFT JOIN vaccination_details v ON v.clinical_event_id = e.id
WHERE e.pet_id = :hot_pet
ORDER BY e.date DESC;

\echo >> Q3 carnet paginado - mascota caliente, pagina 1 de 20 (GET /clinical/pets/:id/carnet?page=1&limit=20)
EXPLAIN (ANALYZE, BUFFERS)
SELECT e.*, v.*
FROM (SELECT * FROM clinical_events WHERE pet_id = :hot_pet ORDER BY date DESC LIMIT 20 OFFSET 0) e
LEFT JOIN vaccination_details v ON v.clinical_event_id = e.id
ORDER BY e.date DESC;

\echo >> Q4 historial - total para la paginacion (count)
EXPLAIN (ANALYZE, BUFFERS)
SELECT count(*) FROM clinical_events WHERE pet_id = :hot_pet;

\echo >> Q5 historial filtrado por tipo y rango de fechas (L3), pagina 1
EXPLAIN (ANALYZE, BUFFERS)
SELECT e.*
FROM clinical_events e
WHERE e.pet_id = :hot_pet
  AND e.type = 'vaccine'
  AND e.date >= NOW() - interval '1 year'
ORDER BY e.date DESC
LIMIT 20;

\echo >> Q6 pauta de tratamiento activa (K1: GET /mascotas/:id/tratamientos)
EXPLAIN (ANALYZE, BUFFERS)
SELECT t.*
FROM treatments t
WHERE t.pet_id = :hot_pet AND t.active = TRUE
ORDER BY t.start_date DESC;

\echo >> Q7 tratamientos de un evento (detalle del evento, L3)
SELECT id AS some_event FROM clinical_events WHERE pet_id = :hot_pet AND type = 'consultation' LIMIT 1 \gset
EXPLAIN (ANALYZE, BUFFERS)
SELECT t.* FROM treatments t WHERE t.clinical_event_id = :'some_event';
