-- ============================================================================
-- infra/db/scheduling-service/01-seed.sql
-- Base de datos: scheduling_db
-- Datos iniciales de desarrollo. Ejecutar después de 00-tables.sql.
-- Los UUID son fijos y coinciden con los seeds de los demás servicios (ver infra/db/README.md).
-- ============================================================================

-- Referencias lógicas (sin FK entre bases):
--   vet_user_id / created_by -> auth_db.users.id y catalog_db.vets.user_id
--   specialty_id             -> catalog_db.specialties.id
--   pet_id                   -> clients_pets_db.pets.id
--   client_id                -> clients_pets_db.clients.id
-- Las fechas son relativas a CURRENT_DATE (hora de la clínica: America/Santiago),
-- así la agenda de prueba siempre queda en el futuro cercano.

-- 1. Horario semanal (0 = domingo ... 6 = sábado)
-- Vet One: lunes a viernes 09:00-13:00 y 14:00-18:00
INSERT INTO vet_schedules (vet_user_id, day_of_week, start_time, end_time)
SELECT '55555555-5555-5555-5555-555555555551', day, shift.start_time, shift.end_time
FROM generate_series(1, 5) AS day
CROSS JOIN (VALUES ('09:00'::TIME, '13:00'::TIME), ('14:00'::TIME, '18:00'::TIME))
    AS shift(start_time, end_time);
-- Veterina Two: martes a sábado 10:00-14:00
INSERT INTO vet_schedules (vet_user_id, day_of_week, start_time, end_time)
SELECT '55555555-5555-5555-5555-555555555555', day, '10:00'::TIME, '14:00'::TIME
FROM generate_series(2, 6) AS day;

-- 2. Bloqueos de agenda (created_by = recepción)
INSERT INTO vet_blocks (id, vet_user_id, block_date, start_time, end_time, reason, notes, created_by) VALUES
('dddddddd-0000-0000-0000-000000000001', '55555555-5555-5555-5555-555555555555', CURRENT_DATE + 10, NULL,    NULL,    'holiday',  NULL,                       '55555555-5555-5555-5555-555555555552'),
('dddddddd-0000-0000-0000-000000000002', '55555555-5555-5555-5555-555555555551', CURRENT_DATE + 5,  '14:00', '16:00', 'training', NULL,                       '55555555-5555-5555-5555-555555555552'),
('dddddddd-0000-0000-0000-000000000003', '55555555-5555-5555-5555-555555555555', CURRENT_DATE + 7,  '10:00', '12:00', 'other',    'Reunión de equipo clínico', '11111111-1111-1111-1111-111111111111');

-- 3. Bloques de disponibilidad (created_by = recepción)
INSERT INTO availability_slots (id, vet_user_id, specialty_id, start_time, end_time, status, created_by) VALUES
-- Vet One / General Medicine, mañana
('cccccccc-cccc-cccc-cccc-ccccccccccc1', '55555555-5555-5555-5555-555555555551', '44444444-4444-4444-4444-444444444441', (CURRENT_DATE + 1 + TIME '10:00') AT TIME ZONE 'America/Santiago', (CURRENT_DATE + 1 + TIME '10:30') AT TIME ZONE 'America/Santiago', 'booked',    '55555555-5555-5555-5555-555555555552'),
('cccccccc-cccc-cccc-cccc-ccccccccccc2', '55555555-5555-5555-5555-555555555551', '44444444-4444-4444-4444-444444444441', (CURRENT_DATE + 1 + TIME '10:30') AT TIME ZONE 'America/Santiago', (CURRENT_DATE + 1 + TIME '11:00') AT TIME ZONE 'America/Santiago', 'available', '55555555-5555-5555-5555-555555555552'),
('cccccccc-cccc-cccc-cccc-ccccccccccc3', '55555555-5555-5555-5555-555555555551', '44444444-4444-4444-4444-444444444441', (CURRENT_DATE + 1 + TIME '11:00') AT TIME ZONE 'America/Santiago', (CURRENT_DATE + 1 + TIME '11:30') AT TIME ZONE 'America/Santiago', 'available', '55555555-5555-5555-5555-555555555552'),
('cccccccc-cccc-cccc-cccc-ccccccccccc4', '55555555-5555-5555-5555-555555555551', '44444444-4444-4444-4444-444444444441', (CURRENT_DATE + 1 + TIME '12:00') AT TIME ZONE 'America/Santiago', (CURRENT_DATE + 1 + TIME '12:30') AT TIME ZONE 'America/Santiago', 'blocked',   '55555555-5555-5555-5555-555555555552'),
-- Veterina Two / Vaccination, en dos días
('cccccccc-cccc-cccc-cccc-ccccccccccc5', '55555555-5555-5555-5555-555555555555', '44444444-4444-4444-4444-444444444442', (CURRENT_DATE + 2 + TIME '12:00') AT TIME ZONE 'America/Santiago', (CURRENT_DATE + 2 + TIME '12:15') AT TIME ZONE 'America/Santiago', 'booked',    '55555555-5555-5555-5555-555555555552'),
('cccccccc-cccc-cccc-cccc-ccccccccccc6', '55555555-5555-5555-5555-555555555555', '44444444-4444-4444-4444-444444444442', (CURRENT_DATE + 2 + TIME '12:15') AT TIME ZONE 'America/Santiago', (CURRENT_DATE + 2 + TIME '12:30') AT TIME ZONE 'America/Santiago', 'available', '55555555-5555-5555-5555-555555555552');

-- 4. Citas (una reservada, una confirmada, una realizada y una cancelada)
INSERT INTO appointments (id, slot_id, pet_id, client_id, vet_user_id, specialty_id, start_time, end_time, status, channel, created_by, cancelled_at) VALUES
-- Polo: reservada para mañana (slot booked). Su recordatorio está en notifications_db.
('88888888-8888-8888-8888-888888888881', 'cccccccc-cccc-cccc-cccc-ccccccccccc1', '33333333-3333-3333-3333-333333333331', '22222222-2222-2222-2222-222222222222', '55555555-5555-5555-5555-555555555551', '44444444-4444-4444-4444-444444444441',
 (CURRENT_DATE + 1 + TIME '10:00') AT TIME ZONE 'America/Santiago', (CURRENT_DATE + 1 + TIME '10:30') AT TIME ZONE 'America/Santiago', 'booked', 'app', '55555555-5555-5555-5555-555555555553', NULL),
-- Rex: realizada hace 3 días (sin slot, el bloque ya expiró). Tiene evento clínico y calificación.
('88888888-8888-8888-8888-888888888882', NULL, '33333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222223', '55555555-5555-5555-5555-555555555551', '44444444-4444-4444-4444-444444444441',
 (CURRENT_DATE - 3 + TIME '11:00') AT TIME ZONE 'America/Santiago', (CURRENT_DATE - 3 + TIME '11:30') AT TIME ZONE 'America/Santiago', 'completed', 'app', '55555555-5555-5555-5555-555555555554', NULL),
-- Luna: vacuna confirmada en dos días con Veterina Two (reservada por recepción).
('88888888-8888-8888-8888-888888888883', 'cccccccc-cccc-cccc-cccc-ccccccccccc5', '33333333-3333-3333-3333-333333333332', '22222222-2222-2222-2222-222222222222', '55555555-5555-5555-5555-555555555555', '44444444-4444-4444-4444-444444444442',
 (CURRENT_DATE + 2 + TIME '12:00') AT TIME ZONE 'America/Santiago', (CURRENT_DATE + 2 + TIME '12:15') AT TIME ZONE 'America/Santiago', 'confirmed', 'web', '55555555-5555-5555-5555-555555555552', NULL),
-- Misu: cancelada por su dueño; el bloque quedó libre (available).
('88888888-8888-8888-8888-888888888884', 'cccccccc-cccc-cccc-cccc-ccccccccccc2', '33333333-3333-3333-3333-333333333334', '22222222-2222-2222-2222-222222222223', '55555555-5555-5555-5555-555555555551', '44444444-4444-4444-4444-444444444441',
 (CURRENT_DATE + 1 + TIME '10:30') AT TIME ZONE 'America/Santiago', (CURRENT_DATE + 1 + TIME '11:00') AT TIME ZONE 'America/Santiago', 'cancelled', 'app', '55555555-5555-5555-5555-555555555554', NOW() - INTERVAL '2 hours');

-- 5. Calificación de la cita realizada (la hace el dueño de la mascota atendida)
INSERT INTO ratings (id, appointment_id, client_id, stars, comment) VALUES
('eeeeeeee-0000-0000-0000-000000000001', '88888888-8888-8888-8888-888888888882', '22222222-2222-2222-2222-222222222223', 5, 'Muy buena atención, explicó todo con claridad.');

-- 6. Auditoría de acciones críticas (BR-9)
INSERT INTO audit_log (id, actor_user_id, action, entity_id, data, created_at) VALUES
('ffffffff-0000-0000-0000-000000000001', '55555555-5555-5555-5555-555555555553', 'APPOINTMENT_CREATED',   '88888888-8888-8888-8888-888888888881', '{"channel": "app"}', NOW() - INTERVAL '1 day'),
('ffffffff-0000-0000-0000-000000000002', '55555555-5555-5555-5555-555555555552', 'APPOINTMENT_CREATED',   '88888888-8888-8888-8888-888888888883', '{"channel": "web"}', NOW() - INTERVAL '1 day'),
('ffffffff-0000-0000-0000-000000000003', '55555555-5555-5555-5555-555555555554', 'APPOINTMENT_CANCELLED', '88888888-8888-8888-8888-888888888884', '{"channel": "app"}', NOW() - INTERVAL '2 hours'),
('ffffffff-0000-0000-0000-000000000004', '55555555-5555-5555-5555-555555555551', 'APPOINTMENT_COMPLETED', '88888888-8888-8888-8888-888888888882', '{"status": "completed"}', NOW() - INTERVAL '3 days');
