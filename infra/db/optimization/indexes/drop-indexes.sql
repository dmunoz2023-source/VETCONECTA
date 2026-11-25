-- [M2] Quita los índices que crea esta carpeta, para repetir la medición "antes".
-- Se puede ejecutar contra cualquiera de las tres bases: DROP ... IF EXISTS ignora los que no estén.
-- No toca los índices originales (idx_clinical_events_pet_date, idx_reminders_pending_fire_at, ...).

SET search_path TO clinical, scheduling, notifications, public;

DROP INDEX IF EXISTS idx_appointments_vet_start;
DROP INDEX IF EXISTS idx_appointments_start;
DROP INDEX IF EXISTS idx_appointments_client_start;
DROP INDEX IF EXISTS idx_slots_free_by_vet_specialty;
DROP INDEX IF EXISTS idx_ratings_created_at;
DROP INDEX IF EXISTS idx_treatments_pet_active;
DROP INDEX IF EXISTS idx_treatments_pet_start;
DROP INDEX IF EXISTS idx_treatments_event;
DROP INDEX IF EXISTS idx_treatment_doses_treatment;
DROP INDEX IF EXISTS idx_user_notifications_user_unread;
DROP INDEX IF EXISTS idx_reminders_type_ref;
DROP INDEX IF EXISTS idx_reminders_user_status;
