# [M2] Optimización de consultas SQL

Revisión con `EXPLAIN (ANALYZE, BUFFERS)` de las consultas de **carnet, historial, disponibilidad, agenda**,
calificaciones y avisos, con medición **antes y después** de crear los índices sobre un seed de volumen alto.
Objetivo: carnet y disponibilidad en menos de 2 s en el 95 % de los casos (NFR-1).

## Estructura

```
infra/db/optimization/
├─ volume-seed/   clinical.sql · scheduling.sql · notifications.sql   (datos de prueba de volumen alto)
├─ explain/        clinical.sql · scheduling.sql · notifications.sql · measure.sh   (consultas medidas)
└─ indexes/        clinical.sql · scheduling.sql · notifications.sql · drop-indexes.sql
```

Cada script se ejecuta contra la base de su servicio (`clinical_db`, `scheduling_db`,
`notifications_db`, ver `00-databases.sql`). Ponen `search_path` al esquema del servicio, así que
funcionan igual con la estructura anterior (un esquema por servicio) y con bases separadas.

## Cómo repetir la medición

```bash
# 1. Base de pruebas de rendimiento (NO usar la de desarrollo): crear tablas con el DDL normal y cargar el volumen.
psql -U postgres -d clinical_db      -f infra/db/optimization/volume-seed/clinical.sql
psql -U postgres -d scheduling_db    -f infra/db/optimization/volume-seed/scheduling.sql
psql -U postgres -d notifications_db -f infra/db/optimization/volume-seed/notifications.sql

# 2. ANTES: medir sin los índices nuevos (mediana de 5 corridas por consulta).
PGUSER=postgres ./infra/db/optimization/explain/measure.sh 5

# 3. Crear los índices.
psql -U postgres -d clinical_db      -f infra/db/optimization/indexes/clinical.sql
psql -U postgres -d scheduling_db    -f infra/db/optimization/indexes/scheduling.sql
psql -U postgres -d notifications_db -f infra/db/optimization/indexes/notifications.sql

# 4. DESPUÉS: volver a medir. Para repetir el "antes": drop-indexes.sql en cada base.
PGUSER=postgres ./infra/db/optimization/explain/measure.sh 5
```

`measure.sh` usa las variables `DB_CLINICAL`, `DB_SCHEDULING`, `DB_NOTIFICATIONS` y `PGHOST/PGPORT/PGUSER` si las bases
tienen otros nombres. Para ver el plan completo de una consulta, ejecutar su archivo de `explain/` directamente con `psql`.

## Volumen del seed

| Servicio | Datos |
| --- | --- |
| clinical | 3.000 mascotas × 100 eventos + 1 mascota con 5.000 = **305.000 eventos**, 61.000 vacunas, 40.487 tratamientos |
| scheduling | 20 veterinarios × 1 año (L-V, bloques de 15 min) = **208.000 bloques**, **124.529 citas**, 29.096 calificaciones |
| notifications | 2.000 usuarios + 1 con 5.000 avisos = **201.000 avisos** (70 % leídos), **153.000 recordatorios** |

## Resultados (mediana de 5 corridas, tiempo de ejecución en PostgreSQL)

Entorno: PostgreSQL 18.6 local en Windows 11, una sola conexión, datos en caché. Mide solo la base de datos,
no la red ni NestJS. Los tiempos absolutos de otra máquina serán distintos; lo que importa es el cambio de plan.

| Consulta (endpoint) | Antes | Después | Mejora | Plan después |
| --- | ---: | ---: | ---: | --- |
| Agenda de la clínica, un día (`GET /scheduling/appointments?fecha=`) | 44,314 ms | 0,016 ms | ~2.800× | Index Scan `idx_appointments_start` |
| Agenda de un veterinario, una semana | 43,996 ms | 0,160 ms | ~275× | Bitmap Heap Scan `idx_appointments_vet_start` |
| Citas del dueño (`GET /scheduling/appointments/me`) | 5,815 ms | 0,016 ms | ~360× | Index Scan `idx_appointments_client_start` |
| Disponibilidad, bloques libres sin rango (`GET /scheduling/availability`) | 11,269 ms | 4,239 ms | 2,7× | Bitmap Heap Scan `idx_slots_free_by_vet_specialty` |
| Disponibilidad acotada a una semana | 0,120 ms | 0,085 ms | — | ya usaba `UNIQUE (vet_user_id, start_time)` |
| Citas vigentes del veterinario en un día (G3) | 0,057 ms | 0,063 ms | — | ya usaba `uq_appointments_vet_start_active` |
| Calificaciones filtradas por fecha (K2) | 13,561 ms | 0,936 ms | ~14× | Index Scan `idx_ratings_created_at` |
| Resumen de calificaciones por veterinario (K2) | 48,734 ms | 45,299 ms | — | agregación total, ver nota 2 |
| Pauta de tratamiento activa (K1) | 3,890 ms | 0,095 ms | ~41× | Bitmap Heap Scan `idx_treatments_pet_active` |
| Tratamientos de un evento (L3) | 1,647 ms | 0,017 ms | ~97× | Index Scan `idx_treatments_event` (antes Seq Scan) |
| Carnet, mascota normal (100 eventos) | 0,501 ms | 0,453 ms | — | ya usaba `idx_clinical_events_pet_date` |
| Carnet, mascota con 5.000 eventos, sin paginar | 11,538 ms | 11,801 ms | — | ver nota 1 |
| Carnet / historial paginado (20 filas) | 0,100 ms | 0,113 ms | — | `idx_clinical_events_pet_date` |
| Historial filtrado por tipo y fecha, 20 filas | 0,026 ms | 0,028 ms | — | `idx_clinical_events_pet_date` |
| Avisos no leídos (`user_notifications`), pág. 1 | 0,062 ms | 0,048 ms | — | Index Scan `idx_user_notifications_user_unread` |
| Contador de avisos no leídos | 0,699 ms | 0,302 ms | 2,3× | Index Only Scan `idx_user_notifications_user_unread` |
| Anular recordatorios por `type` + `ref_id` | 8,160 ms | 0,022 ms | ~370× | Index Scan `idx_reminders_type_ref` |
| Recordatorios de un usuario por estado | 4,333 ms | 0,372 ms | ~12× | Bitmap Heap Scan `idx_reminders_user_status` |
| Despachador (recordatorios pendientes) | 0,350 ms | 0,386 ms | — | ya usaba `idx_reminders_pending_fire_at` |

**NFR-1:** todas las consultas de carnet y disponibilidad responden en menos de 12 ms en base de datos, muy por
debajo de los 2 s. El p95 de extremo a extremo (HTTP + NestJS + llamadas internas) se mide con las pruebas de carga
de N2 sobre el ambiente desplegado; este documento cubre solo la parte SQL.

### Notas

1. **El carnet no está paginado.** `GET /clinical/pets/:id/carnet` devuelve todos los eventos de la mascota. En base
   de datos es barato (11 ms para 5.000 eventos), pero el cuerpo de la respuesta crece sin límite, y con una mascota
   de muchos años el costo pasa a ser serializar y transferir el JSON. El historial (`/history`) sí está paginado.
   No lo cambié porque pasar de `[...]` a `{ data, meta }` rompe el contrato con la app móvil: queda como
   **recomendación a coordinar con Mobile** (paginar el carnet con `?page=&limit=` y un límite por defecto).
2. **Resumen de calificaciones (K2).** Es una agregación sobre todas las calificaciones (~45 ms con 29.000), y
   ningún índice la acelera de forma importante porque lee todas las filas. Si el volumen crece mucho, la salida es
   guardar `vet_user_id` en `ratings` o calcular el resumen con una vista materializada; con el volumen del MVP no hace falta.
3. **`user_notifications`** (H2) todavía no está en `develop`. Los scripts la contemplan si existe y se omiten si no.
   El enunciado pide `notificacion(usuario_id, leida)`; en el modelo real es `user_notifications(user_id, read_at)`:
   "no leído" es `read_at IS NULL`, condición que sirve tanto con la tabla de H2 (que además tiene `is_read`) como
   con la de la estructura de X3 (que solo tiene `read_at`).

## Revisión de consultas N+1 y paginación

Se revisaron los repositorios de `clinical-records-service` y `scheduling-service`:

* **Sin N+1.** Ningún servicio consulta dentro de un bucle: las relaciones (`vaccinationDetails`, `slot`) se cargan
  con un solo `JOIN` por consulta (`relations`), y las únicas iteraciones (`day-blocks.service.ts`) operan en memoria sobre
  resultados ya cargados.
* **Paginados:** historial clínico (`findHistoryByPetId`) y citas del dueño (`findByClient`), ambos con `skip/take`.
* **Sin paginar:** el carnet (nota 1) y `findFreeSlots` (disponibilidad), que devuelve todos los bloques libres a futuro:
  4 ms con 208.000 bloques; el repositorio actual no recibe un rango de fechas, y acotarlo a una semana (como mide
  la consulta Q2 de `explain/scheduling.sql`) lo baja a 0,09 ms. Recomendable al implementar el rango en el endpoint.
* Los endpoints de agenda de la clínica, calificaciones y avisos aún no están en `develop`; los índices están listos
  para cuando lleguen (`feat/I3`, `feat/K2`, `feat/H2`) y las consultas medidas son las que esos endpoints deben generar.
