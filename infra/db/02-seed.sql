-- infra/db/02-seed.sql

-- 1. Insert base admin user and test accounts
INSERT INTO auth.users (id, email, password_hash, role) VALUES
('11111111-1111-1111-1111-111111111111', 'admin@vetconecta.cl', '$2b$10$UnHashDePruebaBcryptGeneradoParaAdmin123!', 'admin'),
('55555555-5555-5555-5555-555555555551', 'veterinario@vetconecta.cl', '$2b$10$UnHashDePruebaBcryptGeneradoParaAdmin123!', 'vet'),
('55555555-5555-5555-5555-555555555552', 'recepcion@vetconecta.cl', '$2b$10$UnHashDePruebaBcryptGeneradoParaAdmin123!', 'reception'),
('55555555-5555-5555-5555-555555555553', 'dueno1@vetconecta.cl', '$2b$10$UnHashDePruebaBcryptGeneradoParaAdmin123!', 'owner'),
('55555555-5555-5555-5555-555555555554', 'dueno2@vetconecta.cl', '$2b$10$UnHashDePruebaBcryptGeneradoParaAdmin123!', 'owner');

-- 2. Configure the clinic and specialties (catalog)
INSERT INTO catalog.clinic (id, name, rut, emergency_phone, email)
VALUES (1, 'VetConecta Clinic', '76.123.456-7', '+56912345678', 'emergencia@vetconecta.cl');

INSERT INTO catalog.specialties (id, name, duration_minutes) VALUES
('44444444-4444-4444-4444-444444444441', 'General Medicine', 30),
('44444444-4444-4444-4444-444444444442', 'Vaccination', 15);

-- 3. Insert two test clients linked to the "owner" user ids
INSERT INTO clients_pets.clients (id, user_id, rut, first_name, last_name, email) VALUES
('22222222-2222-2222-2222-222222222222', '55555555-5555-5555-5555-555555555553', '12.345.678-9', 'Owner', 'One', 'dueno1@vetconecta.cl'),
('22222222-2222-2222-2222-222222222223', '55555555-5555-5555-5555-555555555554', '9.876.543-2', 'Owner', 'Two', 'dueno2@vetconecta.cl');

-- 4. Insert test pets
INSERT INTO clients_pets.pets (client_id, name, species, birth_date) VALUES
-- Client 1 pets
('22222222-2222-2222-2222-222222222222', 'Polo', 'dog', '2025-05-10'),
('22222222-2222-2222-2222-222222222222', 'Luna', 'dog', '2021-08-20'),
-- Client 2 pet
('22222222-2222-2222-2222-222222222223', 'Rex', 'dog', '2020-01-15');