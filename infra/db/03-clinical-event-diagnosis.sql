ALTER TABLE clinical.clinical_events
ADD COLUMN IF NOT EXISTS diagnosis VARCHAR(200);
