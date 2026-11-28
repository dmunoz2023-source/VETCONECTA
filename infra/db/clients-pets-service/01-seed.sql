-- ============================================================================
-- infra/db/clients-pets-service/01-seed.sql
-- Base de datos: clients_pets_db
-- Datos iniciales de desarrollo. Ejecutar después de 00-tables.sql.
-- Los UUID son fijos y coinciden con los seeds de los demás servicios (ver infra/db/README.md).
-- ============================================================================

-- clients.user_id = id del usuario con rol "owner" en auth_db (referencia lógica, sin FK).
INSERT INTO clients (id, user_id, rut, first_name, last_name, email, phone, address, district, active) VALUES
('22222222-2222-2222-2222-222222222222', '55555555-5555-5555-5555-555555555553', '12.345.678-9', 'Owner', 'One',   'dueno1@vetconecta.cl', '+56911111111', 'Av. Alemania 1234',    'Temuco',          TRUE),
('22222222-2222-2222-2222-222222222223', '55555555-5555-5555-5555-555555555554', '9.876.543-2',  'Owner', 'Two',   'dueno2@vetconecta.cl', '+56922222222', 'Calle Bulnes 567',     'Padre Las Casas', TRUE),
('22222222-2222-2222-2222-222222222224', '55555555-5555-5555-5555-5555555555b3', '15.234.567-4', 'Owner', 'Three', 'dueno3@vetconecta.cl', '+56933333333', 'Av. Pedro de Valdivia 890', 'Temuco',     TRUE),
('22222222-2222-2222-2222-222222222225', '55555555-5555-5555-5555-5555555555b4', '16.789.012-1', 'Owner', 'Four',  'dueno4@vetconecta.cl', '+56944444444', 'Calle Manuel Montt 321', 'Temuco',        TRUE),
('22222222-2222-2222-2222-222222222226', '55555555-5555-5555-5555-5555555555b5', '17.456.321-7', 'Owner', 'Five',  'dueno5@vetconecta.cl', '+56955555555', 'Av. San Martín 1500',  'Labranza',        TRUE);

-- pets.client_id = clients.id (FK física dentro de esta base).
-- Estos id de mascota los usan clinical_db, scheduling_db y notifications_db.
INSERT INTO pets (id, client_id, name, species, breed, sex, birth_date, color, microchip, active) VALUES
('33333333-3333-3333-3333-333333333331', '22222222-2222-2222-2222-222222222222', 'Polo',  'dog', 'Labrador',      'male',   '2025-05-10', 'Dorado',        '985112345678901', TRUE),
('33333333-3333-3333-3333-333333333332', '22222222-2222-2222-2222-222222222222', 'Luna',  'dog', 'Poodle',        'female', '2021-08-20', 'Blanco',        NULL,              TRUE),
('33333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222223', 'Rex',   'dog', 'Pastor Alemán', 'male',   '2020-01-15', 'Negro y fuego', '985112345678903', TRUE),
('33333333-3333-3333-3333-333333333334', '22222222-2222-2222-2222-222222222223', 'Misu',  'cat', 'Siamés',        'female', '2022-03-03', 'Crema',         NULL,              TRUE),
('33333333-3333-3333-3333-333333333335', '22222222-2222-2222-2222-222222222224', 'Toby',  'dog', 'Beagle',        'male',   '2023-11-02', 'Tricolor',      '985112345678905', TRUE),
('33333333-3333-3333-3333-333333333336', '22222222-2222-2222-2222-222222222224', 'Nala',  'cat', 'Mestizo',       'female', '2024-06-18', 'Gris',          NULL,              TRUE),
('33333333-3333-3333-3333-333333333337', '22222222-2222-2222-2222-222222222225', 'Max',   'dog', 'Bulldog Francés', 'male', '2019-09-09', 'Atigrado',      '985112345678907', TRUE),
('33333333-3333-3333-3333-333333333338', '22222222-2222-2222-2222-222222222226', 'Kira',  'dog', 'Husky Siberiano', 'female','2022-12-25', 'Gris y blanco', NULL,              TRUE);
