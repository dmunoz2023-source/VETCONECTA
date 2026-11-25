# Pruebas de integración de scheduling-service (J2 y K2)

Prueban la reserva de citas de punta a punta (HTTP → controlador → servicio → PostgreSQL) y
verifican que **nunca quedan dos citas activas en el mismo horario de un veterinario** (BR-5).

También prueban las calificaciones de citas (K2, ver el final de los casos).

Solo se sustituyen los servicios externos: la consulta de mascotas y la verificación del dueño
(clients-pets) y los recordatorios (notifications) se reemplazan por dobles en memoria
(`helpers/fakes.ts`).
La base de datos es real, porque lo que se prueba es el bloqueo por veterinario y el índice
único parcial `uq_appointments_vet_start_active`.

## Cómo ejecutarlas

1. Crear una base de datos de prueba, **separada de la de desarrollo** y cuyo nombre termine en `_test`:

   ```bash
   createdb -h localhost -U postgres db_vetconecta_test
   psql -h localhost -U postgres -d db_vetconecta_test -f infra/db/00-schemas.sql
   psql -h localhost -U postgres -d db_vetconecta_test -f infra/db/01-tables.sql
   ```

   Si `infra/db/01-tables.sql` cambia, hay que recrear esta base.

2. Ejecutar desde la raíz del repositorio (Node 24):

   ```bash
   export TEST_DATABASE_URL="postgresql://postgres:CLAVE@localhost:5432/db_vetconecta_test"
   npm run test:e2e --workspace=apps/backend/scheduling-service
   ```

Las pruebas **borran todas las tablas de `scheduling`** antes de cada caso. Por seguridad se
niegan a correr si `TEST_DATABASE_URL` falta o si el nombre de la base no termina en `_test`.

No forman parte de `npm test`, así que el CI no las ejecuta (no tiene PostgreSQL).

## Casos y resultado esperado

Archivo: `citas-conflictos.e2e-spec.ts`.

### Misma hora
| Caso | Resultado esperado |
|---|---|
| Dos reservas al mismo horario del mismo veterinario | La primera responde 201 y la segunda 409 "Horario ya reservado". Queda una sola cita activa |
| Dos reservas a la misma hora con veterinarios distintos | Ambas responden 201 |

### Cita cancelada
| Caso | Resultado esperado |
|---|---|
| Reservar un horario cuya cita fue cancelada | 201. La cita cancelada se conserva (`cancelled`), la nueva queda `booked`, y se anula el recordatorio de la cancelada |

### Hora no reservable
| Caso | Resultado esperado |
|---|---|
| Hora en el pasado | 400, no se crea ninguna cita |
| Fuera del horario del veterinario (sin bloque, a mitad de un bloque o de otra especialidad) | 404 |
| Bloque con estado `blocked` | 404, no se crea ninguna cita |

### Validaciones de entrada
| Caso | Resultado esperado |
|---|---|
| `startTime` sin zona horaria | 400 |
| Dueño que reserva con la mascota de otro cliente | 403 (BR-8) |
| Recepción que reserva con la mascota de un cliente | 201 |

### Reservas simultáneas (`Promise.all`)
| Caso | Resultado esperado |
|---|---|
| 20 reservas al mismo bloque | Exactamente una 201 y 19 con 409; una sola cita activa, una sola fila de auditoría y un solo recordatorio programado |
| 8 reservas simultáneas en cada uno de 5 bloques | 5 con 201 y 35 con 409; una cita activa por bloque |
| Mismo horario con dos veterinarios a la vez (3 intentos cada uno) | Una 201 por veterinario y 4 con 409 |
| 5 cancelaciones simultáneas de la misma cita | Una 200 y 4 con 409; no queda ninguna cita activa |

### Solapamiento parcial (bloques de distinta duración)
Bloques del veterinario: consulta 13:00–14:00, cirugía 13:30–14:00, cirugía 12:30–13:30 y consulta 14:00–14:30.

| Caso | Resultado esperado |
|---|---|
| Reservada la consulta de 13:00, reservar la cirugía de 13:30 (dentro de la anterior) | 409 |
| Reservada la cirugía de 13:30, reservar la consulta de 13:00 (que la contiene) | 409 |
| Reservada la consulta de 13:00, reservar la cirugía de 12:30–13:30 (se pisan 30 min) | 409 |
| Reservada la consulta de 13:00–14:00, reservar el bloque de 14:00 (contiguo) | 201: tocar el borde no es solapar |
| Mismo solapamiento, pero con otro veterinario | 201 |
| 6 reservas simultáneas que se solapan sin empezar a la misma hora | Solo una 201 y 5 con 409 |

### Cambio de día a medianoche y zona horaria
La cita larga empieza a las 23:30 (-03:00) y termina a las 00:30 del día siguiente.

| Caso | Resultado esperado |
|---|---|
| Reservar escribiendo la hora con zona `-03:00` | 201; en la base queda el instante UTC correcto (02:30Z) |
| El mismo instante escrito en UTC o en `+09:00` | 409: es el mismo horario |
| Bloque que empieza a las 00:00 locales, dentro de la cita que cruza la medianoche | 409 |
| Bloque que empieza a las 00:30 locales, justo cuando termina | 201 |
| La misma hora de reloj (23:30) pero con `+00:00` | 404: es otro instante, tres horas después |

## Calificaciones de citas (K2)

Archivo: `calificaciones.e2e-spec.ts`. La verificación de dueño (`GET /internal/pets/:id/owner/:userId`
de clients-pets) se sustituye por `FakePetOwnerCheck`; el resto (guards, validación, servicio y
PostgreSQL) es real. Las citas y calificaciones se siembran directamente en la base.

### `POST /v1/scheduling/appointments/:id/rating` (solo owner)
| Caso | Resultado esperado |
|---|---|
| Dueño califica su cita realizada (`completed`) | 201; queda una fila con `stars`, `comment` y el `client_id` de la cita. La respuesta no incluye `clientId` |
| Sin comentario / comentario de exactamente 500 caracteres | 201; el comentario ausente se guarda como `null` |
| Segunda calificación de la misma cita | 409 `RATING_ALREADY_EXISTS`; la primera no cambia |
| 5 calificaciones simultáneas de la misma cita | Una 201 y 4 con 409; una sola fila (`appointment_id` UNIQUE) |
| Cita `booked`, `confirmed`, `cancelled` o `no_show` | 422 `APPOINTMENT_NOT_COMPLETED`; no se guarda nada |
| Dueño que califica la cita de otro (también si no está realizada) | 403 (BR-8) |
| Rol recepción, administrador o veterinario | 403 |
| Cita inexistente | 404 |
| Sin cabeceras del Gateway | 401 |
| Id que no es UUID; `stars` 0, 6, decimal, texto o ausente; comentario de 501 caracteres; campos desconocidos | 400 |
| clients-pets no responde | 503; no se guarda nada |

### Campo `rated` en `GET /v1/scheduling/appointments/me`
| Caso | Resultado esperado |
|---|---|
| Citas calificadas y no calificadas del dueño | `rated` es `true` solo en las calificadas |
| Dueño sin citas | Lista vacía |
| Otro dueño calificó su propia cita | No marca las citas del primero |

### `GET /v1/scheduling/ratings` (vet, reception, admin)
Datos: cinco calificaciones de dos veterinarios, del 10 de noviembre al 2 de diciembre de 2026.

| Caso | Resultado esperado |
|---|---|
| Rol vet, reception o admin / rol owner / sin cabeceras | 200 / 403 / 401 |
| Orden | De la más reciente a la más antigua; cada ítem trae `vetUserId` y `appointmentStartTime` |
| `?page=2&limit=2` | `meta` con total 5 y 3 páginas; la última página trae 1 ítem |
| `?vetUserId=` | Solo las del veterinario |
| `?from=2026-11-15&to=2026-11-30` | Incluye el 30 completo (una calificación a las 23:30Z) |
| Veterinario y fechas a la vez | Intersección de ambos filtros |
| Sin coincidencias | 200 con lista vacía |
| `from` posterior a `to`, fecha inválida, `vetUserId` que no es UUID, `limit` mayor a 50, `page=0`, parámetro desconocido | 400 |

### `GET /v1/scheduling/ratings/summary` (solo admin)
| Caso | Resultado esperado |
|---|---|
| Resumen general | Promedio 3,8 y distribución 1:0, 2:1, 3:1, 4:1, 5:2; coincide con `AVG(stars)` y `COUNT(*)` de la base |
| Con `vetUserId` o con fechas | Mismos filtros que el listado |
| Sin calificaciones | `average: null`, total 0 y distribución en ceros |
| Promedio no exacto (11 / 3) | Redondeado a 2 decimales: 3,67 |
| Rol vet, reception u owner / sin cabeceras | 403 / 401 |
| Filtros inválidos | 400 |

## Estructura

- `jest-e2e.json`: configuración de jest (usa `@nestjs` v10 del servicio, no el de la raíz).
- `helpers/setup-env.ts`: valida `TEST_DATABASE_URL` y fija las variables de entorno.
- `helpers/app.ts`: levanta la app completa con los servicios externos sustituidos.
- `helpers/db.ts`: limpieza, siembra de bloques y consultas de comprobación.
- `helpers/fakes.ts` y `helpers/fixtures.ts`: dobles en memoria, datos de ejemplo y cabeceras del Gateway.
