-- [M2] Seed de volumen alto para scheduling (base scheduling_db).
--   psql -U postgres -d scheduling_db -f infra/db/optimizacion/seed-volumen/scheduling.sql
--
-- SOLO para una base de pruebas de rendimiento. Es idempotente.
--
-- Volumen: 20 veterinarios x 1 año de bloques de 15 min (lunes a viernes, 08:00-18:00)
-- = ~208.000 bloques, ~125.000 citas y sus calificaciones.
--   Veterinario del seed normal : 55555555-5555-5555-5555-555555555551 (caso medido)
--   Especialidad                : 44444444-4444-4444-4444-444444444441

-- Con esquemas (develop) las tablas están en "scheduling"; con bases separadas, en "public".
SET search_path TO scheduling, public;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM availability_slots WHERE vet_user_id = '55555555-5555-5555-5555-555555555551') THEN
        RAISE NOTICE 'Seed de volumen ya cargado: no se hace nada.';
        RETURN;
    END IF;

    CREATE TEMP TABLE seed_vets ON COMMIT DROP AS
        SELECT '55555555-5555-5555-5555-555555555551'::uuid AS vet_id, 1 AS n
        UNION ALL
        SELECT md5('vet-' || n)::uuid, n FROM generate_series(2, 20) AS n;

    -- Bloques: desde hace 6 meses hasta dentro de 6 meses, de lunes a viernes.
    INSERT INTO availability_slots (id, vet_user_id, specialty_id, start_time, end_time, status)
    SELECT md5('slot-' || v.n || '-' || days.d || '-' || s)::uuid,
           v.vet_id,
           '44444444-4444-4444-4444-444444444441',
           (days.d + time '08:00' + s * interval '15 minutes') AT TIME ZONE 'America/Santiago',
           (days.d + time '08:00' + (s + 1) * interval '15 minutes') AT TIME ZONE 'America/Santiago',
           'available'
    FROM seed_vets v
    CROSS JOIN LATERAL (
        SELECT dd::date AS d
        FROM generate_series(CURRENT_DATE - 182, CURRENT_DATE + 182, interval '1 day') AS dd
        WHERE extract(isodow FROM dd) < 6
    ) days
    CROSS JOIN generate_series(0, 39) AS s;

    -- Citas: 60 % de los bloques; ~5.000 clientes y ~4.000 mascotas distintos.
    INSERT INTO appointments (slot_id, pet_id, client_id, vet_user_id, specialty_id, start_time, end_time, status)
    SELECT id,
           md5('pet-' || (abs(hashtext(id::text)) % 4000))::uuid,
           md5('client-' || (abs(hashtext(id::text)) % 5000))::uuid,
           vet_user_id, specialty_id, start_time, end_time,
           CASE WHEN start_time < NOW()
                THEN (ARRAY['completed', 'completed', 'completed', 'cancelled', 'no_show'])[1 + abs(hashtext(id::text)) % 5]
                ELSE (ARRAY['booked', 'booked', 'confirmed', 'cancelled'])[1 + abs(hashtext(id::text)) % 4]
           END
    FROM availability_slots
    WHERE abs(hashtext(id::text)) % 10 < 6;

    UPDATE availability_slots s
       SET status = 'booked'
      FROM appointments a
     WHERE a.slot_id = s.id
       AND a.status IN ('booked', 'confirmed', 'completed', 'no_show');

    UPDATE appointments SET cancelled_at = start_time - interval '2 days' WHERE status = 'cancelled';

    -- Calificaciones: ~70 % de las citas realizadas.
    INSERT INTO ratings (appointment_id, client_id, stars, comment)
    SELECT id, client_id, 1 + abs(hashtext(id::text)) % 5, 'Comentario ' || left(id::text, 8)
    FROM appointments
    WHERE status = 'completed' AND abs(hashtext(id::text)) % 10 < 7;
END
$$;

ANALYZE;
