-- ============================================================================
-- infra/db/clinic-catalog-service/01-seed.sql
-- Base de datos: catalog_db
-- Datos iniciales de desarrollo. Ejecutar después de 00-tables.sql.
-- ============================================================================

-- Datos de la clínica
INSERT INTO clinic (id, name, rut, emergency_phone, email)
VALUES (1, 'VetConecta Clinic', '76.123.456-7', '+56912345678', 'emergencia@vetconecta.cl');

-- Especialidades
INSERT INTO specialties (id, name, duration_minutes) VALUES
('44444444-4444-4444-4444-444444444441', 'General Medicine', 30),
('44444444-4444-4444-4444-444444444442', 'Vaccination', 15);

-- Ficha profesional del veterinario. user_id es una referencia lógica (sin FK)
-- al usuario con rol "vet" sembrado en auth_db.
INSERT INTO vets (user_id, first_name, last_name, professional_license) VALUES
('55555555-5555-5555-5555-555555555551', 'Vet', 'One', 'MV-0001');

INSERT INTO vet_specialties (vet_user_id, specialty_id) VALUES
('55555555-5555-5555-5555-555555555551', '44444444-4444-4444-4444-444444444441'),
('55555555-5555-5555-5555-555555555551', '44444444-4444-4444-4444-444444444442');
