-- infra/db/02-seed.sql

-- 1. Insertar usuario administrador base y cuentas de prueba
-- Password de prueba para TODOS los usuarios de este seed: "Vetconecta2026!"
-- Hash generado con bcrypt, 10 rounds (formato $2b$ válido, 60 caracteres)
INSERT INTO auth.users (id, email, password_hash, role) VALUES
('11111111-1111-1111-1111-111111111111', 'admin@vetconecta.cl', '$2b$10$mlrjGSw/nVwnVv6aOvw/4O2sdShcfqZbjSq6ZFmNQZwz/8arsc1Ji', 'admin'),
('55555555-5555-5555-5555-555555555551', 'veterinario@vetconecta.cl', '$2b$10$mlrjGSw/nVwnVv6aOvw/4O2sdShcfqZbjSq6ZFmNQZwz/8arsc1Ji', 'vet'),
('55555555-5555-5555-5555-555555555552', 'recepcion@vetconecta.cl', '$2b$10$mlrjGSw/nVwnVv6aOvw/4O2sdShcfqZbjSq6ZFmNQZwz/8arsc1Ji', 'reception'),
('55555555-5555-5555-5555-555555555553', 'dueno1@vetconecta.cl', '$2b$10$mlrjGSw/nVwnVv6aOvw/4O2sdShcfqZbjSq6ZFmNQZwz/8arsc1Ji', 'owner'),
('55555555-5555-5555-5555-555555555554', 'dueno2@vetconecta.cl', '$2b$10$mlrjGSw/nVwnVv6aOvw/4O2sdShcfqZbjSq6ZFmNQZwz/8arsc1Ji', 'owner');

-- 2. Configurar la Clínica y Especialidades (Catálogo)
INSERT INTO catalog.clinic (id, nombre, telefono_emergencia, email_contacto)
VALUES ('33333333-3333-3333-3333-333333333333', 'Clínica VetConecta', '+56912345678', 'emergencia@vetconecta.cl');

INSERT INTO catalog.specialties (id, nombre, duracion_minutos) VALUES
('44444444-4444-4444-4444-444444444441', 'Medicina General', 30),
('44444444-4444-4444-4444-444444444442', 'Vacunación', 15);

-- 3. Insertar DOS clientes de prueba asociados a los IDs de los usuarios "owner"
INSERT INTO clients_pets.clients (id, rut, user_id) VALUES
('22222222-2222-2222-2222-222222222222', '12345678-9', '55555555-5555-5555-5555-555555555553'),
('22222222-2222-2222-2222-222222222223', '98765432-1', '55555555-5555-5555-5555-555555555554');

-- 4. Insertar las mascotas de prueba
INSERT INTO clients_pets.pets (client_id, nombre, fecha_nacimiento, peso_actual) VALUES
-- Mascotas del Cliente 1
('22222222-2222-2222-2222-222222222222', 'Polo', '2025-05-10', 5.5),
('22222222-2222-2222-2222-222222222222', 'Luna', '2021-08-20', 12.0),
-- Mascota del Cliente 2
('22222222-2222-2222-2222-222222222223', 'Rex', '2020-01-15', 25.0);
