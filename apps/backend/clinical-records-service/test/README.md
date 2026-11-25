# Pruebas de integración del historial clínico (F3)

Prueban `GET /v1/clinical/pets/:petId/history` de punta a punta (HTTP → guards → servicio →
TypeORM → PostgreSQL). La base de datos es real, porque lo que se verifica es el JOIN con
`vaccination_details`, los filtros, la paginación y el uso del índice `idx_clinical_events_pet_date`.
Solo se sustituyen los servicios externos (`helpers/fakes.ts`): mascotas (clients-pets),
nombres de veterinarios (catálogo) y citas pasadas (scheduling).

## Cómo ejecutarlas

1. Una base de prueba separada de la de desarrollo, cuyo nombre termine en `_test`, con el esquema real:

   ```bash
   createdb -h localhost -U postgres db_vetconecta_test
   psql -h localhost -U postgres -d db_vetconecta_test -f infra/db/00-schemas.sql
   psql -h localhost -U postgres -d db_vetconecta_test -f infra/db/01-tables.sql
   ```

2. Desde la raíz del repositorio (Node 24):

   ```bash
   export TEST_DATABASE_URL="postgresql://postgres:CLAVE@localhost:5432/db_vetconecta_test"
   npm run test:e2e --workspace=apps/backend/clinical-records-service -- --verbose
   ```

Cada caso **vacía las tablas de `clinical`**; por eso se niegan a correr si `TEST_DATABASE_URL`
falta o si la base no termina en `_test`. No forman parte de `npm test`, así que el CI no las
ejecuta (no tiene PostgreSQL).

## Casos

| Grupo | Qué verifica |
|---|---|
| Contenido y orden | Eventos del más reciente al más antiguo; detalle de vacuna solo en `vaccine` (JOIN); nombre del veterinario o `null`; no mezcla mascotas; lista vacía |
| Citas pasadas | Se agregan con su estado; si scheduling no responde, el historial sale igual con `appointmentsAvailable=false` |
| Filtros | Por tipo; por rango de fechas (inclusive); `to` sin hora incluye el día; combinados; el rango se reenvía a scheduling |
| Paginación | Recorrer las páginas sin repetir ni saltar eventos; página fuera de rango |
| Validación | `limit` > 50 o 0, `page` 0 o no numérico, tipo inexistente, fecha inválida, rango invertido, parámetro desconocido e id no UUID responden 400 |
| Permisos (BR-8, NFR-4) | Veterinario, recepción y admin ven cualquier mascota; el dueño ve las suyas; mascota ajena o inexistente 403 (el dueño se valida por su `sub` con clients-pets); dueño sin cliente 403; clients-pets caído 503 (y el personal clínico no depende de él); sin cabeceras 401 |
| Rendimiento (NFR-1) | 5.000 eventos de la mascota entre 55.000 en la tabla: menos de 2 s, también con filtros; el plan de la consulta usa el índice |
