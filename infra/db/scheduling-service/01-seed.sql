-- ============================================================================
-- infra/db/scheduling-service/01-seed.sql
-- Base de datos: scheduling_db
-- Datos iniciales de desarrollo. Ejecutar después de 00-tables.sql.
-- ============================================================================

-- Horario semanal del veterinario de prueba (lunes a viernes,
-- 09:00-13:00 y 14:00-18:00). vet_user_id es una referencia lógica (sin FK)
-- al veterinario de catalog_db / auth_db.
INSERT INTO vet_schedules (vet_user_id, day_of_week, start_time, end_time)
SELECT '55555555-5555-5555-5555-555555555551', day, shift.start_time, shift.end_time
FROM generate_series(1, 5) AS day
CROSS JOIN (VALUES ('09:00'::TIME, '13:00'::TIME), ('14:00'::TIME, '18:00'::TIME))
    AS shift(start_time, end_time);
