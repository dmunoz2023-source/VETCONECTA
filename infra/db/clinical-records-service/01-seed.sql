-- ============================================================================
-- infra/db/clinical-records-service/01-seed.sql
-- Base de datos: clinical_db
-- Datos iniciales de desarrollo. Ejecutar después de 00-tables.sql.
-- Los UUID son fijos y coinciden con los seeds de los demás servicios (ver infra/db/README.md).
-- ============================================================================

-- Referencias lógicas (sin FK entre bases):
--   pet_id       -> clients_pets_db.pets.id
--   vet_user_id  -> auth_db.users.id / catalog_db.vets.user_id
-- Fechas relativas a CURRENT_DATE (America/Santiago). El evento de Rex coincide con la
-- cita realizada 88888888-...-882 de scheduling_db.

-- 1. Eventos clínicos
INSERT INTO clinical_events (id, pet_id, vet_user_id, type, date, weight_kg, temperature_c, reason, diagnosis, notes, next_checkup) VALUES
-- Polo (Labrador, cachorro): vacuna y control de crecimiento
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee1', '33333333-3333-3333-3333-333333333331', '55555555-5555-5555-5555-555555555551', 'vaccine',      (CURRENT_DATE - 120 + TIME '10:00') AT TIME ZONE 'America/Santiago',  6.80, 38.4, 'Vacuna múltiple', NULL, 'Sin reacciones adversas.', CURRENT_DATE + 10),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee2', '33333333-3333-3333-3333-333333333331', '55555555-5555-5555-5555-555555555551', 'checkup',      (CURRENT_DATE - 30 + TIME '10:00') AT TIME ZONE 'America/Santiago',  12.40, 38.5, 'Control de crecimiento', NULL, 'Peso acorde a la edad.', NULL),
-- Luna: consulta dermatológica con Veterina Two
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee3', '33333333-3333-3333-3333-333333333332', '55555555-5555-5555-5555-555555555555', 'consultation', (CURRENT_DATE - 60 + TIME '12:00') AT TIME ZONE 'America/Santiago',   8.10, 38.6, 'Picazón en las orejas', 'Otitis externa leve', 'Limpieza ótica y tratamiento tópico por 7 días.', NULL),
-- Rex: consulta de hace 3 días (cita realizada 88888888-...-882)
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee4', '33333333-3333-3333-3333-333333333333', '55555555-5555-5555-5555-555555555551', 'consultation', (CURRENT_DATE - 3 + TIME '11:00') AT TIME ZONE 'America/Santiago',   31.50, 38.9, 'Cojera en pata trasera', 'Tendinitis leve', 'Reposo relativo y antiinflamatorio por 5 días.', CURRENT_DATE + 11),
-- Misu: vacuna felina con Veterina Two
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee5', '33333333-3333-3333-3333-333333333334', '55555555-5555-5555-5555-555555555555', 'vaccine',      (CURRENT_DATE - 45 + TIME '12:00') AT TIME ZONE 'America/Santiago',   3.90, 38.3, 'Vacuna triple felina', NULL, NULL, CURRENT_DATE + 30);

-- 2. Detalle de las vacunas (1:1 con el evento de tipo vaccine)
INSERT INTO vaccination_details (id, clinical_event_id, vaccine, laboratory, batch, booster_date) VALUES
('ffffffff-eeee-eeee-eeee-eeeeeeeeeee1', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee1', 'Múltiple (DHPPi)', 'Zoetis',      'LOT-2026-A1', CURRENT_DATE + 10),
('ffffffff-eeee-eeee-eeee-eeeeeeeeeee5', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee5', 'Triple felina',    'Boehringer',  'LOT-2026-F7', CURRENT_DATE + 30);

-- 3. Tratamientos (pet_id repetido a propósito: permite listar pautas por mascota)
INSERT INTO treatments (id, clinical_event_id, pet_id, medication, dose, route, frequency_hours, duration_days, start_date, instructions, active) VALUES
-- Rex: en curso (día 4 de 5)
('dddddddd-dddd-dddd-dddd-ddddddddddd1', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee4', '33333333-3333-3333-3333-333333333333', 'Meloxicam', '15 mg', 'oral', 24, 5, (CURRENT_DATE - 3 + TIME '20:00') AT TIME ZONE 'America/Santiago', 'Administrar con comida, una vez al día.', TRUE),
-- Luna: terminado
('dddddddd-dddd-dddd-dddd-ddddddddddd2', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee3', '33333333-3333-3333-3333-333333333332', 'Gotas óticas antibióticas', '5 gotas', 'ótica', 12, 7, (CURRENT_DATE - 60 + TIME '20:00') AT TIME ZONE 'America/Santiago', 'Aplicar en cada oído cada 12 horas.', FALSE);

-- 4. Dosis del tratamiento de Rex: 1 a 3 confirmadas desde la app, la 4 es hoy y la 5 mañana
INSERT INTO treatment_doses (id, treatment_id, dose_number, scheduled_for, confirmed_at, source) VALUES
('dddddddd-0000-0000-0000-000000000001', 'dddddddd-dddd-dddd-dddd-ddddddddddd1', 1, (CURRENT_DATE - 3 + TIME '20:00') AT TIME ZONE 'America/Santiago', (CURRENT_DATE - 3 + TIME '20:10') AT TIME ZONE 'America/Santiago', 'app'),
('dddddddd-0000-0000-0000-000000000002', 'dddddddd-dddd-dddd-dddd-ddddddddddd1', 2, (CURRENT_DATE - 2 + TIME '20:00') AT TIME ZONE 'America/Santiago', (CURRENT_DATE - 2 + TIME '20:05') AT TIME ZONE 'America/Santiago', 'app'),
('dddddddd-0000-0000-0000-000000000003', 'dddddddd-dddd-dddd-dddd-ddddddddddd1', 3, (CURRENT_DATE - 1 + TIME '20:00') AT TIME ZONE 'America/Santiago', (CURRENT_DATE - 1 + TIME '20:30') AT TIME ZONE 'America/Santiago', 'app'),
('dddddddd-0000-0000-0000-000000000004', 'dddddddd-dddd-dddd-dddd-ddddddddddd1', 4, (CURRENT_DATE     + TIME '20:00') AT TIME ZONE 'America/Santiago', NULL, NULL),
('dddddddd-0000-0000-0000-000000000005', 'dddddddd-dddd-dddd-dddd-ddddddddddd1', 5, (CURRENT_DATE + 1 + TIME '20:00') AT TIME ZONE 'America/Santiago', NULL, NULL);

-- 5. Auditoría de eventos clínicos (BR-9)
INSERT INTO audit_log (id, actor_user_id, action, entity, entity_id, data, created_at) VALUES
('ffffffff-1111-0000-0000-000000000001', '55555555-5555-5555-5555-555555555551', 'CLINICAL_EVENT_CREATED', 'clinical_event', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee4', '{"type": "consultation"}', NOW() - INTERVAL '3 days'),
('ffffffff-1111-0000-0000-000000000002', '55555555-5555-5555-5555-555555555551', 'TREATMENT_CREATED',      'treatment',      'dddddddd-dddd-dddd-dddd-ddddddddddd1', '{"medication": "Meloxicam"}', NOW() - INTERVAL '3 days'),
('ffffffff-1111-0000-0000-000000000003', '55555555-5555-5555-5555-555555555555', 'CLINICAL_EVENT_CREATED', 'clinical_event', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee5', '{"type": "vaccine"}', NOW() - INTERVAL '45 days');
