-- ============================================================================
-- infra/db/notifications-service/01-seed.sql
-- Base de datos: notifications_db
-- Datos iniciales de desarrollo. Ejecutar después de 00-tables.sql.
-- ============================================================================

-- 1. Dispositivos de prueba (tokens falsos, no son válidos en FCM/APNs)
INSERT INTO device_tokens (id, user_id, token, platform, active, last_used_at) VALUES
('66666666-6666-6666-6666-666666666661', '55555555-5555-5555-5555-555555555553', 'fcm-token-prueba-dueno1-android', 'android', TRUE, NOW() - INTERVAL '1 day'),
('66666666-6666-6666-6666-666666666662', '55555555-5555-5555-5555-555555555554', 'apns-token-prueba-dueno2-ios', 'ios', TRUE, NOW() - INTERVAL '2 days');

-- 2. Recordatorios ya procesados
INSERT INTO scheduled_reminders (id, type, ref_id, user_id, title, body, fire_at, status, attempts) VALUES
('77777777-7777-7777-7777-777777777771', 'appointment_reminder', '88888888-8888-8888-8888-888888888881', '55555555-5555-5555-5555-555555555553',
 'Recordatorio de cita', 'Mañana tienes una cita para Polo en VetConecta.', NOW() - INTERVAL '3 days', 'sent', 1),
('77777777-7777-7777-7777-777777777772', 'appointment_reminder', '88888888-8888-8888-8888-888888888882', '55555555-5555-5555-5555-555555555554',
 'Recordatorio de cita', 'Mañana tienes una cita para Rex en VetConecta.', NOW() - INTERVAL '2 days', 'sent', 1);

-- 3. Bitácora de envíos
INSERT INTO notification_log (id, reminder_id, channel, provider_response, sent_at) VALUES
('99999999-9999-9999-9999-999999999991', '77777777-7777-7777-7777-777777777771', 'push', '{"provider": "fcm", "success": true}', NOW() - INTERVAL '3 days'),
('99999999-9999-9999-9999-999999999992', '77777777-7777-7777-7777-777777777772', 'push', '{"provider": "apns", "success": true}', NOW() - INTERVAL '2 days');

-- 4. Historial de avisos del dueño (uno leído y otro sin leer)
INSERT INTO user_notifications (id, user_id, reminder_id, type, ref_id, title, body, read_at, created_at) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', '55555555-5555-5555-5555-555555555553', '77777777-7777-7777-7777-777777777771', 'appointment_reminder', '88888888-8888-8888-8888-888888888881',
 'Recordatorio de cita', 'Mañana tienes una cita para Polo en VetConecta.', NOW() - INTERVAL '2 days', NOW() - INTERVAL '3 days'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', '55555555-5555-5555-5555-555555555554', '77777777-7777-7777-7777-777777777772', 'appointment_reminder', '88888888-8888-8888-8888-888888888882',
 'Recordatorio de cita', 'Mañana tienes una cita para Rex en VetConecta.', NULL, NOW() - INTERVAL '2 days');

-- 5. Correo ya enviado
INSERT INTO email_outbox (id, recipient, template, data, status, attempts) VALUES
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1', 'dueno1@vetconecta.cl', 'email_verification', '{"name": "Owner One"}', 'sent', 1);