-- ============================================================================
-- infra/db/auth-service/01-seed.sql
-- Base de datos: auth_db
-- Datos iniciales de desarrollo. Ejecutar después de 00-tables.sql.
-- Los UUID son fijos y coinciden con los seeds de los demás servicios (ver infra/db/README.md).
-- ============================================================================

-- 2 administradores, 4 recepcionistas, 2 veterinarios y 5 dueños.
-- Contraseña de prueba de TODOS: "Vetconecta2026!" (bcrypt, 10 rounds).
-- Estos id son la referencia (user_id / vet_user_id / created_by) del resto de las bases.
INSERT INTO users (id, email, password_hash, role, status, email_verified_at) VALUES
('11111111-1111-1111-1111-111111111111', 'admin@vetconecta.cl', '$2b$10$mlrjGSw/nVwnVv6aOvw/4O2sdShcfqZbjSq6ZFmNQZwz/8arsc1Ji', 'admin', 'active', NOW()),
('11111111-1111-1111-1111-111111111112', 'admin2@vetconecta.cl', '$2b$10$mlrjGSw/nVwnVv6aOvw/4O2sdShcfqZbjSq6ZFmNQZwz/8arsc1Ji', 'admin', 'active', NOW()),
('55555555-5555-5555-5555-555555555552', 'recepcion@vetconecta.cl', '$2b$10$mlrjGSw/nVwnVv6aOvw/4O2sdShcfqZbjSq6ZFmNQZwz/8arsc1Ji', 'reception', 'active', NOW()),
('55555555-5555-5555-5555-555555555562', 'recepcion2@vetconecta.cl', '$2b$10$mlrjGSw/nVwnVv6aOvw/4O2sdShcfqZbjSq6ZFmNQZwz/8arsc1Ji', 'reception', 'active', NOW()),
('55555555-5555-5555-5555-555555555572', 'recepcion3@vetconecta.cl', '$2b$10$mlrjGSw/nVwnVv6aOvw/4O2sdShcfqZbjSq6ZFmNQZwz/8arsc1Ji', 'reception', 'active', NOW()),
('55555555-5555-5555-5555-555555555582', 'recepcion4@vetconecta.cl', '$2b$10$mlrjGSw/nVwnVv6aOvw/4O2sdShcfqZbjSq6ZFmNQZwz/8arsc1Ji', 'reception', 'active', NOW()),
('55555555-5555-5555-5555-555555555551', 'veterinario@vetconecta.cl', '$2b$10$mlrjGSw/nVwnVv6aOvw/4O2sdShcfqZbjSq6ZFmNQZwz/8arsc1Ji', 'vet', 'active', NOW()),
('55555555-5555-5555-5555-555555555555', 'veterinaria@vetconecta.cl', '$2b$10$mlrjGSw/nVwnVv6aOvw/4O2sdShcfqZbjSq6ZFmNQZwz/8arsc1Ji', 'vet', 'active', NOW()),
('55555555-5555-5555-5555-555555555553', 'dueno1@vetconecta.cl', '$2b$10$mlrjGSw/nVwnVv6aOvw/4O2sdShcfqZbjSq6ZFmNQZwz/8arsc1Ji', 'owner', 'active', NOW()),
('55555555-5555-5555-5555-555555555554', 'dueno2@vetconecta.cl', '$2b$10$mlrjGSw/nVwnVv6aOvw/4O2sdShcfqZbjSq6ZFmNQZwz/8arsc1Ji', 'owner', 'active', NOW()),
('55555555-5555-5555-5555-5555555555b3', 'dueno3@vetconecta.cl', '$2b$10$mlrjGSw/nVwnVv6aOvw/4O2sdShcfqZbjSq6ZFmNQZwz/8arsc1Ji', 'owner', 'active', NOW()),
('55555555-5555-5555-5555-5555555555b4', 'dueno4@vetconecta.cl', '$2b$10$mlrjGSw/nVwnVv6aOvw/4O2sdShcfqZbjSq6ZFmNQZwz/8arsc1Ji', 'owner', 'active', NOW()),
('55555555-5555-5555-5555-5555555555b5', 'dueno5@vetconecta.cl', '$2b$10$mlrjGSw/nVwnVv6aOvw/4O2sdShcfqZbjSq6ZFmNQZwz/8arsc1Ji', 'owner', 'active', NOW());
