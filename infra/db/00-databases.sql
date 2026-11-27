-- infra/db/00-databases.sql
--
-- [X2] Una base de datos independiente por microservicio (reemplaza a 00-schemas.sql,
-- que creaba un esquema por servicio dentro de una sola base).
--
-- Cada servicio tiene su propia base y su propio rol, y ese rol solo puede entrar a su base:
-- ningún servicio puede leer las tablas de otro (regla 10.2 del diseño de microservicios).
--
-- Uso (una sola vez, como superusuario, conectado a la base "postgres"):
--   psql -U postgres -d postgres -f infra/db/00-databases.sql
-- Después, por cada servicio: 00-tables.sql y 01-seed.sql de su carpeta en infra/db/ (ver infra/db/README.md).
--
-- Es idempotente: se puede volver a ejecutar sin errores y no borra datos.
--
-- IMPORTANTE: las contraseñas de abajo son SOLO para desarrollo local. En producción
-- se crean los roles con secretos propios (ver N3) y no se usa este archivo tal cual.
--
--   Servicio                   Puerto  Base de datos      Rol
--   auth-service               :3001   auth_db            auth_user
--   clients-pets-service       :3002   clients_pets_db    clients_pets_user
--   clinical-records-service   :3003   clinical_db        clinical_user
--   scheduling-service         :3004   scheduling_db      scheduling_user
--   notifications-service      :3005   notifications_db   notifications_user
--   clinic-catalog-service     :3006   catalog_db         catalog_user

-- 1. Roles de servicio (CREATE ROLE no admite IF NOT EXISTS, por eso el bloque DO).
DO $$
DECLARE
    svc TEXT;
BEGIN
    FOREACH svc IN ARRAY ARRAY['auth', 'clients_pets', 'clinical', 'scheduling', 'notifications', 'catalog']
    LOOP
        IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = svc || '_user') THEN
            EXECUTE format('CREATE ROLE %I LOGIN PASSWORD %L', svc || '_user', svc || '_dev_password');
        END IF;
    END LOOP;
END
$$;

-- 2. Bases de datos. CREATE DATABASE no puede ir dentro de un bloque DO ni de una
--    transacción, así que se genera la sentencia y se ejecuta con \gexec (solo si falta).
SELECT format('CREATE DATABASE %I OWNER %I', svc || '_db', svc || '_user')
FROM unnest(ARRAY['auth', 'clients_pets', 'clinical', 'scheduling', 'notifications', 'catalog']) AS svc
WHERE NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = svc || '_db')
\gexec

-- 3. Cada base es privada de su rol: nadie más puede conectarse (salvo el superusuario).
REVOKE CONNECT ON DATABASE auth_db          FROM PUBLIC;
REVOKE CONNECT ON DATABASE clients_pets_db  FROM PUBLIC;
REVOKE CONNECT ON DATABASE clinical_db      FROM PUBLIC;
REVOKE CONNECT ON DATABASE scheduling_db    FROM PUBLIC;
REVOKE CONNECT ON DATABASE notifications_db FROM PUBLIC;
REVOKE CONNECT ON DATABASE catalog_db       FROM PUBLIC;

-- 4. Por cada base: extensiones y permisos por defecto.
--    * Las extensiones son por base, no globales. Se crean como superusuario porque
--      pgcrypto y citext no son "trusted" en todas las versiones de PostgreSQL.
--      pgcrypto -> gen_random_uuid()   citext -> correos y RUT sin distinguir mayúsculas.
--    * Los 00-tables.sql los ejecuta el superusuario, así que las tablas nacen con dueño
--      "postgres". ALTER DEFAULT PRIVILEGES hace que el rol del servicio tenga acceso a
--      todo lo que se cree después en su base, sin dar permisos a nadie más.
\connect auth_db
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "citext";
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES    TO auth_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO auth_user;

\connect clients_pets_db
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "citext";
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES    TO clients_pets_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO clients_pets_user;

\connect clinical_db
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES    TO clinical_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO clinical_user;

\connect scheduling_db
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES    TO scheduling_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO scheduling_user;

\connect notifications_db
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES    TO notifications_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO notifications_user;

\connect catalog_db
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES    TO catalog_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO catalog_user;

-- Deja la sesión en la base de mantenimiento por defecto.
\connect postgres
