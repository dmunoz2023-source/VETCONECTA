-- infra/db/02-seed.sql

-- 1. Insertar usuario administrador base (Contraseña de prueba: Admin123!)
INSERT INTO auth.users (id, email, password_hash, role) 
VALUES ('11111111-1111-1111-1111-111111111111', 'admin@vetconecta.cl', '$2b$10$UnHashDePruebaBcryptGeneradoParaAdmin123!', 'admin');
-- Cuentas de prueba para los roles restantes (vet, reception, owner)
INSERT INTO auth.users (id, email, password_hash, role) VALUES 
('55555555-5555-5555-5555-555555555551', 'veterinario@vetconecta.cl', '$2b$10$UnHashDePruebaBcrypt...', 'vet'),
('55555555-5555-5555-5555-555555555552', 'recepcion@vetconecta.cl', '$2b$10$UnHashDePruebaBcrypt...', 'reception'),
('55555555-5555-5555-5555-555555555553', 'dueno@vetconecta.cl', '$2b$10$UnHashDePruebaBcrypt...', 'owner');
-- 2. Configurar la Clínica y Especialidades (Catálogo)
INSERT INTO catalog.clinic (id, nombre, telefono_emergencia, email_contacto)
VALUES ('33333333-3333-3333-3333-333333333333', 'Clínica VetConecta', '+56912345678', 'emergencia@vetconecta.cl');

INSERT INTO catalog.specialties (id, nombre, duracion_minutos) VALUES 
('44444444-4444-4444-4444-444444444441', 'Medicina General', 30),
('44444444-4444-4444-4444-444444444442', 'Vacunación', 15);

-- 3. Insertar un cliente de prueba asociado al ID del usuario "owner"
INSERT INTO clients_pets.clients (id, rut, user_id) 
VALUES ('22222222-2222-2222-2222-222222222222', '12345678-9', '55555555-5555-5555-5555-555555555553');

-- 4. Insertar las mascotas de prueba
INSERT INTO clients_pets.pets (client_id, nombre, fecha_nacimiento, peso_actual) VALUES 
('22222222-2222-2222-2222-222222222222', 'Polo', '2025-05-10', 5.5),
('22222222-2222-2222-2222-222222222222', 'Luna', '2021-08-20', 12.0);