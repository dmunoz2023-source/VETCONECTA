# VetConecta

Plataforma para clínicas veterinarias: carnet digital de las mascotas, historial clínico, agenda de citas y recordatorios.
Este repositorio contiene el **backend** (API Gateway + 6 microservicios NestJS) y el **panel web** (React) para recepción,
veterinarios y administración. La app móvil de los dueños vive en otro repositorio y consume el mismo API.

* Diseño de la arquitectura: *Diseño detallado de microservicios* (documento complementario al SRS).
* Contrato de la API: Swagger en vivo en `http://localhost:3000/docs` (ver [Documentación de la API](#documentación-de-la-api)).
* Modelo de datos: [`infra/docs/modelo-datos.md`](infra/docs/modelo-datos.md) · Trazabilidad FR → endpoint → pantalla:
  [`infra/docs/trazabilidad.md`](infra/docs/trazabilidad.md) · Guion de la demo: [`infra/docs/guion-demo.md`](infra/docs/guion-demo.md).

## Arquitectura

Un proceso Node.js por microservicio, sin contenedores y sin balanceador de carga. El gateway verifica el JWT una sola vez
y enruta cada prefijo siempre al mismo servicio. **Cada servicio tiene su propia base de datos PostgreSQL** y ningún servicio
lee las tablas de otro: si necesita un dato ajeno, lo pide por HTTP a una ruta `/internal` del servicio dueño.

| Servicio | Puerto | Prefijo público | Base de datos | Responsabilidad |
| --- | :---: | --- | --- | --- |
| `api-gateway` | 3000 | `/v1/*` | — | Verifica el JWT, enruta, agrega el Swagger, propaga `X-Request-Id` |
| `auth-service` | 3001 | `/v1/auth` | `auth_db` | Credenciales, JWT y roles |
| `clients-pets-service` | 3002 | `/v1/clients`, `/v1/pets` | `clients_pets_db` | Clientes y mascotas (edad calculada al vuelo) |
| `clinical-records-service` | 3003 | `/v1/clinical` | `clinical_db` | Eventos clínicos, carnet, historial y pautas de tratamiento |
| `scheduling-service` | 3004 | `/v1/scheduling` | `scheduling_db` | Disponibilidad, citas y calificaciones |
| `notifications-service` | 3005 | `/v1/notifications` | `notifications_db` | Dispositivos, recordatorios y avisos |
| `clinic-catalog-service` | 3006 | `/v1/catalog` | `catalog_db` | Datos de la clínica, especialidades y veterinarios |
| `frontend` (panel web) | 5173 | — | — | React + Vite; habla solo con el gateway |

Roles: `owner` (dueño, app móvil), `vet`, `reception` y `admin` (panel web). Cada endpoint declara qué roles lo pueden invocar.

## Requisitos

* **Node.js 24** y npm (el proyecto es un monorepo de npm workspaces).
* **PostgreSQL 17 o superior**, instalado de forma nativa (no se usa Docker). Se necesita un usuario con permiso de superusuario
  (por ejemplo `postgres`) para crear las bases.
* `psql` en el `PATH`.

## Instalación

Todos los comandos se ejecutan **desde la raíz del repositorio**. Nunca se corre `npm install` dentro de un servicio.

```bash
# 1. Dependencias de todos los workspaces (backend, frontend y libs/shared)
npm ci

# 2. Bases de datos (una vez). Crea las 6 bases, sus roles y las extensiones.
psql -U postgres -d postgres -f infra/db/00-databases.sql

# 3. Tablas y datos iniciales de cada servicio, conectado a su propia base
for pair in auth-service:auth_db clients-pets-service:clients_pets_db \
            clinical-records-service:clinical_db scheduling-service:scheduling_db \
            notifications-service:notifications_db clinic-catalog-service:catalog_db; do
  svc=${pair%%:*}; db=${pair##*:}
  psql -U postgres -d "$db" -f "infra/db/$svc/00-tables.sql"
  psql -U postgres -d "$db" -f "infra/db/$svc/01-seed.sql"
done

# 4. Variables de entorno: copiar cada .env.example a .env y completarlo (ver la tabla de abajo)
for d in apps/backend/*/ apps/frontend/; do [ -f "$d.env.example" ] && cp -n "$d.env.example" "$d.env"; done

# 5. Levantar los servicios (cada comando en su terminal, o el segundo para los seis microservicios juntos)
npm run dev:gateway
npm run dev:microservices
npm run dev:frontend          # panel en http://localhost:5173
```

`00-databases.sql` se puede volver a ejecutar sin problema (no borra datos). Los scripts por servicio están descritos en
[`infra/db/README.md`](infra/db/README.md). Las contraseñas de los roles de base de datos que crea son **solo de desarrollo**;
en producción se crean con secretos propios.

Para trabajar en un solo servicio: `npm run start:dev --workspace=apps/backend/<servicio>`. Para agregar una librería a un
servicio: `npm install <paquete> --workspace=apps/backend/<servicio>` (siempre desde la raíz).

## Variables de entorno

Cada servicio tiene su `.env.example` con los valores de desarrollo. Los `.env` reales están en `.gitignore` y **nunca** se suben.

| Variable | Qué es | Quién la usa |
| --- | --- | --- |
| `PORT` | Puerto fijo del servicio (3000 a 3006) | todos |
| `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME` | Conexión a **su** base de datos (ej. `DB_NAME=auth_db`) | los 6 microservicios |
| `JWT_SECRET` | Secreto de firma del JWT. **Debe ser el mismo** en `auth-service` y en el gateway | auth, gateway, clinical, notifications |
| `INTERNAL_KEY` / `INTERNAL_API_KEY` | Secreto compartido que protege las rutas `/internal` (cabecera `X-Internal-Key`) | todos |
| `CLIENTS_SERVICE_URL`, `CATALOG_SERVICE_URL`, `NOTIFICATIONS_SERVICE_URL` | URLs de los servicios a los que se llama internamente (por defecto `localhost` con su puerto) | auth, scheduling |
| `*_SERVICE_PORT`, `*_SERVICE_PREFIX`, `ORIGIN_URL` | Destinos del enrutamiento 1:1 | gateway |
| `FRONTEND_WEB_ORIGIN_URL`, `FRONTEND_MOVILE_ORIGIN_URL` | Orígenes permitidos por CORS | gateway |
| `VITE_API_URL` | URL base del gateway, sin `/v1` ni barra final (por defecto `http://localhost:3000`) | frontend |

## Usuarios de prueba por rol

El seed crea estas cuentas. **La contraseña de todas es `Vetconecta2026!`**.

| Rol | Correo | Qué permite probar |
| --- | --- | --- |
| `admin` | `admin@vetconecta.cl` | Todo lo de recepción, más gestión de cuentas, especialidades y configuración |
| `vet` | `veterinario@vetconecta.cl` | Eventos clínicos, historial, marcar citas como realizadas |
| `reception` | `recepcion@vetconecta.cl` | Clientes, mascotas, disponibilidad y agenda |
| `owner` | `dueno1@vetconecta.cl` | Dueño con 2 mascotas (Polo y Luna); sus datos y sus citas |
| `owner` | `dueno2@vetconecta.cl` | Dueño con 1 mascota (Rex); sirve para comprobar que no ve lo del otro dueño (BR-8) |

El panel web es para `vet`, `reception` y `admin`. Las cuentas `owner` se usan desde la app móvil.

## Cómo correr las pruebas

```bash
npm test                                   # todas las pruebas unitarias (backend y frontend)
npm test --workspace=apps/backend/auth-service
npm test --workspace=apps/frontend         # Vitest + React Testing Library
npm run lint --workspaces --if-present     # lint
npm run build --workspaces --if-present    # compila todo (lo mismo que hace el CI)
```

Las pruebas de integración de `scheduling-service` (reserva concurrente de citas, BR-5) usan una base de datos real y tienen
sus propios pasos en [`apps/backend/scheduling-service/test/README.md`](apps/backend/scheduling-service/test/README.md).
El CI (`.github/workflows/ci.yml`) corre lint, build y test en cada pull request hacia `develop` o `main`.

## Documentación de la API

* **Swagger UI:** `http://localhost:3000/docs` (con el gateway y los servicios levantados). El gateway junta el contrato de
  los seis servicios en un solo documento; el JSON está en `http://localhost:3000/docs-json`.
* Cada servicio publica además su propio contrato en `http://localhost:<puerto>/docs-json`. Si un servicio está apagado, el
  gateway simplemente lo omite del documento agregado.
* Para probar endpoints protegidos: hacer `POST /v1/auth/login` con `{ "identifier": "veterinario@vetconecta.cl", "password": "Vetconecta2026!" }`
  (`identifier` es el correo o el RUT), copiar el `accessToken` de la respuesta y usar el botón **Authorize** de Swagger.
* `infra/docs/openapi/openapi.yaml` se **regenera automáticamente** cada vez que arranca el gateway; no se edita a mano.
* Formato de error común a todos los servicios: `{ statusCode, error, message, path, requestId, timestamp }`, donde `error`
  es un código estable (`VALIDATION_ERROR`, `FORBIDDEN`, `NOT_FOUND`, `CONFLICT`, ...). Detalle de endpoints, roles y estado
  de cada uno en [`infra/docs/trazabilidad.md`](infra/docs/trazabilidad.md).

## Despliegue

La arquitectura está pensada para correr sin contenedores: una máquina con Node.js y PostgreSQL, **PM2** manteniendo los
procesos vivos (reinicia cualquiera que caiga) y **Nginx** delante como terminador TLS y servidor del panel estático. Solo el
puerto 3000 (gateway) se expone; los puertos 3001 a 3006 escuchan únicamente en la interfaz local, de modo que no hay forma
de saltarse el gateway ni de llamar a una ruta `/internal` desde fuera de la máquina.

> **Pendiente:** el despliegue en la nube del MVP (tarea M5) todavía no está hecho. Cuando exista, esta sección debe quedar con
> la URL estable de la API y del panel, la plataforma elegida, cómo se cargan los secretos y el comando de despliegue.

Pasos genéricos para cualquier servidor:

```bash
npm ci && npm run build --workspaces --if-present     # compilar
# crear las bases con infra/db/00-databases.sql (con contraseñas propias) y ejecutar 00-tables.sql de cada servicio
pm2 start ecosystem.config.js && pm2 save             # un proceso por servicio; el archivo todavía no existe en el repo
```

## Estructura del repositorio

```
apps/
├─ backend/
│  ├─ api-gateway/            proxy, validación del JWT y Swagger agregado
│  └─ <servicio>-service/     src/modules/<dominio>/{controllers,services,repositories,entities,dto}
├─ frontend/                  panel web (React + Vite + TypeScript)
infra/
├─ db/                        00-databases.sql y una carpeta por servicio con 00-tables.sql y 01-seed.sql
│  └─ optimization/           seed de volumen, índices y mediciones EXPLAIN ANALYZE (M2)
└─ docs/                      modelo de datos, trazabilidad, guion de demo y openapi generado
libs/shared/                  guards, filtros, decoradores y tipos comunes a los servicios
```

Cada servicio sigue las capas **controller → service → repository**. Reglas del monorepo y de los servicios en
[`apps/backend/README.md`](apps/backend/README.md).

## Flujo de trabajo

Ramas `feat/<tarea>-<descripcion>` desde `develop`, commits pequeños con prefijo `tipo(ámbito): [Tarea] ...` y pull request
hacia `develop`. `main` solo recibe lo que está estable.
