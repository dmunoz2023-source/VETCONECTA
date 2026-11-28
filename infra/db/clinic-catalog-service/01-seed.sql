-- ============================================================================
-- infra/db/clinic-catalog-service/01-seed.sql
-- Base de datos: catalog_db
-- Datos iniciales de desarrollo. Ejecutar después de 00-tables.sql.
-- Los UUID son fijos y coinciden con los seeds de los demás servicios (ver infra/db/README.md).
-- ============================================================================

INSERT INTO clinic (id, name, rut, address, district, phone, emergency_phone, whatsapp, email, schedule, lat, lng) VALUES
(1, 'VetConecta Clinic', '76.123.456-7', 'Av. Alemania 0671', 'Temuco', '+56452000000', '+56912345678', '+56912345678', 'emergencia@vetconecta.cl',
 '{"mon-fri": "09:00-13:00, 14:00-18:00", "sat": "10:00-13:00", "sun": "cerrado"}', -38.7359, -72.5904);

INSERT INTO specialties (id, name, duration_minutes, active) VALUES
('44444444-4444-4444-4444-444444444441', 'General Medicine', 30, TRUE),
('44444444-4444-4444-4444-444444444442', 'Vaccination',      15, TRUE),
('44444444-4444-4444-4444-444444444443', 'Dermatology',      30, TRUE),
('44444444-4444-4444-4444-444444444444', 'Surgery',          60, TRUE);

-- vets.user_id = id del usuario con rol "vet" en auth_db (referencia lógica, sin FK).
INSERT INTO vets (user_id, first_name, last_name, professional_license, active) VALUES
('55555555-5555-5555-5555-555555555551', 'Vet',      'One', 'MV-0001', TRUE),
('55555555-5555-5555-5555-555555555555', 'Veterina', 'Two', 'MV-0002', TRUE);

INSERT INTO vet_specialties (vet_user_id, specialty_id) VALUES
('55555555-5555-5555-5555-555555555551', '44444444-4444-4444-4444-444444444441'),
('55555555-5555-5555-5555-555555555551', '44444444-4444-4444-4444-444444444442'),
('55555555-5555-5555-5555-555555555555', '44444444-4444-4444-4444-444444444442'),
('55555555-5555-5555-5555-555555555555', '44444444-4444-4444-4444-444444444443'),
('55555555-5555-5555-5555-555555555555', '44444444-4444-4444-4444-444444444444');
