-- [M2] Seed de volumen alto para clinical (base clinical_db).
--   psql -U postgres -d clinical_db -f infra/db/optimization/volume-seed/clinical.sql
--
-- SOLO para una base de pruebas de rendimiento: inserta cientos de miles de filas.
-- No toca el seed normal. Es idempotente (no duplica si ya se cargó).
--
-- Volumen: 3.000 mascotas x 100 eventos = 300.000 eventos (1 de cada 5 es vacuna),
-- ~65.000 tratamientos y una mascota "caliente" con 5.000 eventos para medir el peor caso.
--   Mascota caliente : aaaaaaaa-0000-4000-8000-000000000001
--   Veterinario      : 55555555-5555-5555-5555-555555555551 (el del seed normal)

-- Con esquemas (develop) las tablas están en "clinical"; con bases separadas, en "public".
SET search_path TO clinical, public;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM clinical_events WHERE pet_id = 'aaaaaaaa-0000-4000-8000-000000000001') THEN
        RAISE NOTICE 'Seed de volumen ya cargado: no se hace nada.';
        RETURN;
    END IF;

    -- Mascotas: 3.000 UUID deterministas (md5 -> uuid) + la mascota caliente (n = 0).
    CREATE TEMP TABLE seed_pets ON COMMIT DROP AS
        SELECT md5('pet-' || n)::uuid AS pet_id, n FROM generate_series(1, 3000) AS n
        UNION ALL
        SELECT 'aaaaaaaa-0000-4000-8000-000000000001'::uuid, 0;

    -- Eventos: 100 por mascota (5.000 para la caliente), repartidos hacia atrás en el tiempo.
    INSERT INTO clinical_events (id, pet_id, vet_user_id, type, date, weight_kg, temperature_c, reason, notes, next_checkup)
    SELECT md5('ev-' || p.n || '-' || e)::uuid,
           p.pet_id,
           '55555555-5555-5555-5555-555555555551',
           (ARRAY['consultation', 'vaccine', 'checkup', 'consultation', 'checkup'])[1 + e % 5],
           NOW() - ((e * 7 + p.n % 13) * interval '1 hour'),
           round((4 + (e % 40) * 0.3)::numeric, 2),
           round((38 + (e % 10) * 0.1)::numeric, 1),
           'Control de rutina ' || e,
           'Observaciones del evento ' || e,
           CURRENT_DATE + (e % 90)
    FROM seed_pets p
    CROSS JOIN LATERAL generate_series(1, CASE WHEN p.n = 0 THEN 5000 ELSE 100 END) AS e;

    INSERT INTO vaccination_details (clinical_event_id, vaccine, laboratory, batch, booster_date)
    SELECT id,
           'Vacuna ' || (abs(hashtext(id::text)) % 6),
           'Laboratorio ' || (abs(hashtext(id::text)) % 4),
           'L-' || (abs(hashtext(id::text)) % 9999),
           (date + interval '1 year')::date
    FROM clinical_events
    WHERE type = 'vaccine';

    -- Tratamientos: 1 de cada 3 consultas; ~20 % sigue activo.
    INSERT INTO treatments (clinical_event_id, pet_id, medication, dose, route, frequency_hours, duration_days, start_date, instructions, active)
    SELECT id, pet_id,
           'Medicamento ' || (abs(hashtext(id::text)) % 15),
           '1 comprimido', 'oral',
           8 + (abs(hashtext(id::text)) % 3) * 4,
           5 + (abs(hashtext(id::text)) % 10),
           date, 'Dar con comida',
           abs(hashtext(id::text)) % 5 = 0
    FROM clinical_events
    WHERE type = 'consultation' AND abs(hashtext(id::text)) % 3 = 0;
END
$$;

ANALYZE;
