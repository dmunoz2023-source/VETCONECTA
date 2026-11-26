# Trazabilidad de requisitos y catálogo de endpoints

Cómo leer el estado de cada fila:

* **develop**: ya está integrado en `develop`.
* **rama `x`**: existe en una rama todavía no integrada (se pasa a *develop* al aprobarse su pull request).
* **pendiente (tarea)**: aún no existe; la tarea del Sprint 3 que lo cubre.

Las rutas públicas pasan por el gateway con el prefijo `/v1`. Las rutas `/internal` solo las llaman otros microservicios con
la cabecera `X-Internal-Key` y **nunca** se publican en el gateway ni en Swagger. `owner*` significa que, además del rol, el
servicio comprueba que el recurso pertenezca al usuario del token (BR-8, BR-12).

## 1. Matriz FR → servicio → endpoint → pantalla

| FR | Requisito | Servicio | Endpoint(s) | Pantalla del panel | Estado |
| --- | --- | --- | --- | --- | --- |
| FR-1 | Registro y autenticación de dueños (UC-01) | auth | `POST /v1/auth/register`, `POST /v1/auth/login`, `GET /v1/auth/me` | `/login` | `login` y `me`: develop. **`register` está sin conectar** (el controlador no llama al servicio, no crea la cuenta). Verificación de correo y refresh de token: pendiente (M3) |
| FR-2 | Ver mascotas y carnet digital con edad (UC-02) | clients-pets + clinical | `GET /v1/pets/:id`, `GET /v1/clinical/pets/:petId/carnet` | `/pets/:id` (ficha de la mascota) | develop |
| FR-3 | Reservar hora (UC-03) | scheduling (+ catalog, clients-pets) | `GET /v1/scheduling/availability`, `POST /v1/scheduling/appointments`, `PATCH /v1/scheduling/appointments/:id/cancel`, `GET /v1/scheduling/appointments/me` | `/agend` | develop, salvo la disponibilidad: rama `feat/G1-disponibilidad` |
| FR-4 | Recordatorios push 24 h antes (UC-04) | notifications (programa scheduling) | `POST /v1/notifications/devices`, `DELETE /v1/notifications/devices/:token`, `GET /v1/notifications`, `PATCH /v1/notifications/:id/read`; internos `POST` y `DELETE /internal/reminders` | — (la app móvil) | rama `feat/H2-notifications-engine` y `feature/H1-recordatorio-24h` |
| FR-5 | Gestionar clientes y fichas de mascotas (UC-05) | clients-pets | `GET`/`POST /v1/clients`, `GET`/`PATCH /v1/clients/:id`, `POST /v1/pets`, `PATCH`/`DELETE /v1/pets/:id` | `/clients`, `/pets`, `/pets/nueva`, `/pets/:id/editar` | develop |
| FR-6 | Registrar eventos clínicos (UC-06) | clinical | `POST /v1/clinical/events`, `PUT /v1/clinical/events/:id` | `/pets/:id/atencion` | API: develop. Pantalla: rama `feat/I2-eventos-clinicos` (en develop es un marcador) |
| FR-7 | Gestionar disponibilidad y agenda (UC-07) | scheduling (+ catalog) | `/v1/scheduling/vets/:vetId/schedules` y `/blocks` (GET, POST, PATCH, DELETE), `/v1/catalog/specialties`, `/v1/catalog/vets/:vetId/specialties` | `/agend`; `/config` (L1) | API: develop. Pantalla de configuración: rama `feat/L1-configuracion-agenda` (L1) |
| FR-8 | Consultar historial clínico (UC-08) | clinical | `GET /v1/clinical/pets/:petId/history` | `/pets/:id/historial` | API: develop (en rama `feat/F3-historial-mascota` se mueve a su propio módulo). Vista detallada: pendiente (L3) |
| FR-9 | Recordatorio de medicamentos (UC-09) | clinical (+ app móvil) | pauta de tratamiento sobre un evento y su consulta por mascota | formulario de evento, sección *Tratamiento* | pendiente (K1) |
| FR-10 | Acceso de emergencia (UC-10) | catalog | `GET /v1/catalog/clinic/contact` | — (la app móvil) | rama `feat/G1-disponibilidad` |
| FR-11 | Selector multi-mascota (UC-11) | clients-pets | `GET /v1/clients/me/pets` | — (la app móvil) | develop |
| FR-12 | Calificación post-consulta (UC-12) | scheduling | `POST /v1/scheduling/appointments/:id/rating`, `GET /v1/scheduling/ratings`, `GET /v1/scheduling/ratings/summary` | `/reports` (L2) | rama `feat/K2-calificaciones`. Dashboard: pendiente (L2) |
| FR-13 | Autenticación de personal clínico (UC-13) | auth (+ guardas en todos) | `POST /v1/auth/login` (el rol viene en el JWT); alta de personal `POST /v1/auth/staff` | `/login`, rutas restringidas por rol | login y guardas: develop. Alta de personal: pendiente (no asignada) |
| FR-14 | Editar datos propios (UC-14) | auth + clients-pets | `GET`/`PATCH /v1/clients/me`; contraseña `PUT /clientes/me/password` | — (la app móvil) | `/clients/me`: develop. Cambio de contraseña y reglas de correo: pendiente (K3) |

### Requisitos no funcionales

| NFR | Dónde se resuelve | Evidencia |
| --- | --- | --- |
| NFR-1: respuesta < 2 s en el 95 % | Índices en carnet, agenda y disponibilidad; llamadas internas locales | [`infra/db/optimization/README.md`](../db/optimization/README.md) (medición SQL antes/después). El p95 extremo a extremo lo mide N2 |
| NFR-2: 99 % de disponibilidad | PM2 reinicia cualquier proceso que caiga; un fallo en notificaciones no tumba la agenda | Despliegue pendiente (M5) |
| NFR-3: seguridad con JWT | JWT verificado una vez en el gateway; `RolesGuard` por endpoint; `/internal` con `X-Internal-Key` | Revisión endpoint × rol: pendiente (M3) |
| NFR-4: privacidad | `owner*` compara el dueño del recurso con el usuario del token | Pruebas de acceso a recursos ajenos: pendiente (M3) |
| NFR-5: resiliencia sin conexión | Caché y notificaciones locales en la app móvil | Responsabilidad de Mobile |
| NFR-6: reserva en ≤ 5 pasos | El catálogo entrega especialidades y veterinarios filtrados; scheduling entrega bloques libres | Responsabilidad de Mobile |

## 2. Catálogo de endpoints en `develop`

Los roles son los declarados con `@Roles(...)` en cada controlador. «Todos» = cualquier usuario autenticado.

### auth-service · `/v1/auth`

| Método y ruta | Roles | Propósito |
| --- | --- | --- |
| `POST /v1/auth/register` | público | Registra un dueño. **Hoy es un stub:** devuelve el cuerpo recibido y no crea la cuenta |
| `POST /v1/auth/login` | público | Body `{ identifier, password }` (correo o RUT). Devuelve los datos del usuario y el `accessToken`; el JWT lleva `sub`, `email` y `role` (todavía sin `clientId`) |
| `GET /v1/auth/me` | todos | Usuario autenticado |

### clients-pets-service · `/v1/clients`, `/v1/pets`

| Método y ruta | Roles | Propósito |
| --- | --- | --- |
| `GET /v1/clients?q=&page=&limit=` | reception, admin, vet | Busca clientes por RUT, nombre o teléfono |
| `POST /v1/clients` | reception, admin | Crea un cliente; 409 si el RUT ya existe |
| `GET /v1/clients/:id` | reception, admin, vet | Ficha del cliente con sus mascotas |
| `PATCH /v1/clients/:id` | reception, admin | Actualiza un cliente |
| `GET /v1/clients/me` | owner | Perfil del dueño autenticado |
| `PATCH /v1/clients/me` | owner | Edita correo, teléfono, dirección y comuna; RUT o nombre responden 403 (BR-15) |
| `GET /v1/clients/me/pets` | owner | Mascotas del dueño (selector multi-mascota) |
| `POST /v1/pets` | reception, admin | Crea una mascota asociada a un cliente |
| `GET /v1/pets/:id` | owner\*, vet, reception, admin | Ficha con la edad calculada |
| `PATCH /v1/pets/:id` | reception, admin, vet | Actualiza una mascota |
| `DELETE /v1/pets/:id` | admin | Baja lógica (`active = false`) |
| `GET /internal/pets/:id`, `GET /internal/pets/:id/owner/:userId` | interno | Validan que la mascota existe y de quién es |

### clinical-records-service · `/v1/clinical`

| Método y ruta | Roles | Propósito |
| --- | --- | --- |
| `POST /v1/clinical/events` | vet | Registra un evento clínico (consulta, vacuna o control) |
| `PUT /v1/clinical/events/:id` | vet, admin | Corrige un evento; queda auditado |
| `GET /v1/clinical/pets/:petId/carnet` | owner\*, vet, reception | Línea de tiempo del carnet; de solo lectura para el dueño (BR-6) |
| `GET /v1/clinical/pets/:petId/history?page=&limit=` | vet, reception | Historial paginado |

### scheduling-service · `/v1/scheduling`

| Método y ruta | Roles | Propósito |
| --- | --- | --- |
| `POST /v1/scheduling/appointments` | owner\*, reception, admin | Reserva una hora (transacción con bloqueo de fila, BR-5) |
| `GET /v1/scheduling/appointments/me` | owner | Citas del dueño, con filtro por estado y paginación |
| `PATCH /v1/scheduling/appointments/:id/cancel` | owner\*, reception, admin | Cancela y libera el horario |
| `PATCH /v1/scheduling/appointments/:id/status` | vet, reception, admin | Marca la cita como `completed` o `no_show` |
| `GET`/`POST /v1/scheduling/vets/:vetId/schedules` | reception, admin | Horario semanal del veterinario |
| `PATCH`/`DELETE /v1/scheduling/vets/:vetId/schedules/:id` | reception, admin | Edita o elimina un turno |
| `GET`/`POST /v1/scheduling/vets/:vetId/blocks` | reception, admin | Bloqueos (vacaciones, feriados) |
| `PATCH`/`DELETE /v1/scheduling/vets/:vetId/blocks/:id` | reception, admin | Edita o elimina un bloqueo; informa las citas afectadas |

### clinic-catalog-service · `/v1/catalog`

| Método y ruta | Roles | Propósito |
| --- | --- | --- |
| `GET /v1/catalog/specialties`, `GET /v1/catalog/specialties/:id` | autenticados | Especialidades |
| `POST`/`PATCH`/`DELETE /v1/catalog/specialties[/:id]` | reception, admin | Gestión de especialidades |
| `GET`/`POST /v1/catalog/vets/:vetId/specialties`, `DELETE .../:specialtyId` | reception, admin | Especialidades que atiende cada veterinario |
| `GET /internal/vets/:id` | interno | Veterinario activo y sus especialidades (BR-4) |

## 3. Diferencias entre el diseño y lo implementado

Para que Mobile y el panel no se sorprendan:

| Tema | Diseño original | Implementado |
| --- | --- | --- |
| Corregir un evento clínico | `PATCH /v1/clinical/events/:id` | `PUT /v1/clinical/events/:id` |
| Cambiar el estado de una cita | `realizada` / `no_asistio` | `completed` / `no_show` (los estados se guardan en inglés) |
| Edición de datos del dueño | `PATCH /v1/clients/me` | K3 pide `PUT /clientes/me`; falta acordar con Mobile cuál queda |
| Pauta de tratamiento | `POST /v1/clinical/events/:id/treatments` y `GET /v1/clinical/pets/:petId/treatments` | K1 pide `GET /mascotas/:id/tratamientos`; falta acordar el nombre final |
| Contacto de emergencia | `GET /v1/catalog/clinic` | La rama G1 lo publica como `GET /v1/catalog/clinic/contact` |
