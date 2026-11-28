-- ============================================================================
-- infra/db/notifications-service/01-seed.sql
-- Base de datos: notifications_db
-- Datos iniciales de desarrollo. Ejecutar después de 00-tables.sql.
-- Los UUID son fijos y coinciden con los seeds de los demás servicios (ver infra/db/README.md).
-- ============================================================================

-- Referencias lógicas (sin FK entre bases):
--   user_id -> auth_db.users.id (dueños)   55555555-...-553 dueno1 / 55555555-...-554 dueno2
--   pet_id  -> clients_pets_db.pets.id
--   ref_id  -> scheduling_db.appointments.id (cuando type = appointment_reminder)
--
-- El recordatorio de la cita de mañana (881) ya fue enviado y el de la cita de pasado
-- mañana (883) queda 'pending': el motor lo despachará 24 h antes (BR-7). Los tokens de
-- dispositivo son de prueba, no son válidos en FCM/APNs.

-- 1. Dispositivos
INSERT INTO device_tokens (id, user_id, token, platform, active, last_used_at) VALUES
('66666666-6666-6666-6666-666666666661', '55555555-5555-5555-5555-555555555553', 'fcm-token-prueba-dueno1-android', 'android', TRUE, NOW() - INTERVAL '1 day'),
('66666666-6666-6666-6666-666666666662', '55555555-5555-5555-5555-555555555554', 'apns-token-prueba-dueno2-ios',    'ios',     TRUE, NOW() - INTERVAL '2 days');

-- 2. Recordatorios de citas (fire_at = inicio de la cita - 24 h)
INSERT INTO scheduled_reminders (id, type, ref_id, user_id, title, body, fire_at, status, attempts) VALUES
-- Cita 881 (Polo, mañana 10:00): ya enviado
('77777777-7777-7777-7777-777777777771', 'appointment_reminder', '88888888-8888-8888-8888-888888888881', '55555555-5555-5555-5555-555555555553',
 'Recordatorio de cita', 'Mañana tienes una cita para Polo con Vet One a las 10:00.',
 (CURRENT_DATE + 1 + TIME '10:00') AT TIME ZONE 'America/Santiago' - INTERVAL '24 hours', 'sent', 1),
-- Cita 883 (Luna, en dos días 12:00): pendiente
('77777777-7777-7777-7777-777777777772', 'appointment_reminder', '88888888-8888-8888-8888-888888888883', '55555555-5555-5555-5555-555555555553',
 'Recordatorio de cita', 'Mañana tienes una cita de vacunación para Luna a las 12:00.',
 (CURRENT_DATE + 2 + TIME '12:00') AT TIME ZONE 'America/Santiago' - INTERVAL '24 hours', 'pending', 0),
-- Cita 882 (Rex, realizada hace 3 días): ya enviado
('77777777-7777-7777-7777-777777777773', 'appointment_reminder', '88888888-8888-8888-8888-888888888882', '55555555-5555-5555-5555-555555555554',
 'Recordatorio de cita', 'Mañana tienes una cita para Rex con Vet One a las 11:00.',
 (CURRENT_DATE - 3 + TIME '11:00') AT TIME ZONE 'America/Santiago' - INTERVAL '24 hours', 'sent', 1);

-- 3. Bitácora de envíos (solo de los recordatorios ya despachados)
INSERT INTO notification_log (id, reminder_id, channel, provider_response, sent_at) VALUES
('99999999-9999-9999-9999-999999999991', '77777777-7777-7777-7777-777777777771', 'push', '{"provider": "fcm",  "success": true}', (CURRENT_DATE + 1 + TIME '10:00') AT TIME ZONE 'America/Santiago' - INTERVAL '24 hours'),
('99999999-9999-9999-9999-999999999992', '77777777-7777-7777-7777-777777777773', 'push', '{"provider": "apns", "success": true}', (CURRENT_DATE - 3 + TIME '11:00') AT TIME ZONE 'America/Santiago' - INTERVAL '24 hours');

-- 4. Centro de avisos del dueño (uno sin leer y uno leído)
INSERT INTO user_notifications (id, user_id, pet_id, reminder_id, type, ref_id, title, body, is_read, read_at, created_at) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', '55555555-5555-5555-5555-555555555553', '33333333-3333-3333-3333-333333333331', '77777777-7777-7777-7777-777777777771', 'appointment_reminder', '88888888-8888-8888-8888-888888888881',
 'Recordatorio de cita', 'Mañana tienes una cita para Polo con Vet One a las 10:00.', FALSE, NULL, NOW() - INTERVAL '1 hour'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', '55555555-5555-5555-5555-555555555554', '33333333-3333-3333-3333-333333333333', '77777777-7777-7777-7777-777777777773', 'appointment_reminder', '88888888-8888-8888-8888-888888888882',
 'Recordatorio de cita', 'Mañana tienes una cita para Rex con Vet One a las 11:00.', TRUE, NOW() - INTERVAL '3 days', NOW() - INTERVAL '4 days');

-- 5. Correos (verificación de cuenta y confirmación de citas)
INSERT INTO email_outbox (id, recipient, template, data, status, attempts) VALUES
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1', 'dueno1@vetconecta.cl', 'email_verification',        '{"name": "Owner One"}', 'sent', 1),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2', 'dueno2@vetconecta.cl', 'email_verification',        '{"name": "Owner Two"}', 'sent', 1),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb3', 'dueno1@vetconecta.cl', 'appointment_confirmation',  '{"appointmentId": "88888888-8888-8888-8888-888888888881", "pet": "Polo"}', 'sent', 1),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb4', 'dueno1@vetconecta.cl', 'appointment_confirmation',  '{"appointmentId": "88888888-8888-8888-8888-888888888883", "pet": "Luna"}', 'sent', 1);
