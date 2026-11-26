-- ============================================================================
-- infra/db/auth-service/01-seed.sql
-- Base de datos: auth_db
-- Datos iniciales de desarrollo. Ejecutar después de 00-tables.sql.
-- ============================================================================

-- Usuarios de prueba (uno por rol).
-- Password de prueba para TODOS los usuarios de este seed: "Vetconecta2026!"
-- Hash generado con bcrypt, 10 rounds (formato $2b$ válido, 60 caracteres)
INSERT INTO users (id, email, password_hash, role) VALUES
('11111111-1111-1111-1111-111111111111', 'admin@vetconecta.cl', '$2b$10$mlrjGSw/nVwnVv6aOvw/4O2sdShcfqZbjSq6ZFmNQZwz/8arsc1Ji', 'admin'),
('55555555-5555-5555-5555-555555555551', 'veterinario@vetconecta.cl', '$2b$10$mlrjGSw/nVwnVv6aOvw/4O2sdShcfqZbjSq6ZFmNQZwz/8arsc1Ji', 'vet'),
('55555555-5555-5555-5555-555555555552', 'recepcion@vetconecta.cl', '$2b$10$mlrjGSw/nVwnVv6aOvw/4O2sdShcfqZbjSq6ZFmNQZwz/8arsc1Ji', 'reception'),
('55555555-5555-5555-5555-555555555553', 'dueno1@vetconecta.cl', '$2b$10$mlrjGSw/nVwnVv6aOvw/4O2sdShcfqZbjSq6ZFmNQZwz/8arsc1Ji', 'owner'),
('55555555-5555-5555-5555-555555555554', 'dueno2@vetconecta.cl', '$2b$10$mlrjGSw/nVwnVv6aOvw/4O2sdShcfqZbjSq6ZFmNQZwz/8arsc1Ji', 'owner');
