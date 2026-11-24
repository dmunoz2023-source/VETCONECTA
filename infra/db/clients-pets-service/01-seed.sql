-- ============================================================================
-- infra/db/clients-pets-service/01-seed.sql
-- Base de datos: clients_pets_db
-- Datos iniciales de desarrollo. Ejecutar después de 00-tables.sql.
-- ============================================================================

-- Dos clientes de prueba. user_id es una referencia lógica (sin FK) a los
-- usuarios con rol "owner" sembrados en auth_db.
INSERT INTO clients (id, user_id, rut, first_name, last_name, email) VALUES
('22222222-2222-2222-2222-222222222222', '55555555-5555-5555-5555-555555555553', '12.345.678-9', 'Owner', 'One', 'dueno1@vetconecta.cl'),
('22222222-2222-2222-2222-222222222223', '55555555-5555-5555-5555-555555555554', '9.876.543-2', 'Owner', 'Two', 'dueno2@vetconecta.cl');

-- Mascotas de prueba
INSERT INTO pets (client_id, name, species, birth_date) VALUES
-- Cliente 1
('22222222-2222-2222-2222-222222222222', 'Polo', 'dog', '2025-05-10'),
('22222222-2222-2222-2222-222222222222', 'Luna', 'dog', '2021-08-20'),
-- Cliente 2
('22222222-2222-2222-2222-222222222223', 'Rex', 'dog', '2020-01-15');
