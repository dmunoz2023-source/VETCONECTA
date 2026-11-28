# infra/db

Una base de datos PostgreSQL por microservicio (sin esquemas). Cada carpeta
tiene el mismo nombre que su servicio en `apps/backend/` y contiene:

| Archivo | Contenido |
| :--- | :--- |
| `00-tables.sql` | DDL de las tablas, índices y restricciones del servicio |
| `00-seed.sql` | Datos iniciales de desarrollo del servicio |

| Carpeta | Base de datos |
| :--- | :--- |
| `auth-service/` | `auth_db` |
| `clients-pets-service/` | `clients_pets_db` |
| `clinical-records-service/` | `clinical_db` |
| `scheduling-service/` | `scheduling_db` |
| `notifications-service/` | `notifications_db` |
| `clinic-catalog-service/` | `catalog_db` |

## Orden de ejecución

1. `00-databases.sql` (X2) crea las seis bases de datos.
2. Por cada servicio, conectado a su base: `00-tables.sql` y luego `00-seed.sql`.

```bash
for pair in auth-service:auth_db clients-pets-service:clients_pets_db \
            clinical-records-service:clinical_db scheduling-service:scheduling_db \
            notifications-service:notifications_db clinic-catalog-service:catalog_db; do
  svc=${pair%%:*}; db=${pair##*:}
  psql -U postgres -d "$db" -f "infra/db/$svc/00-tables.sql"
  psql -U postgres -d "$db" -f "infra/db/$svc/00-seed.sql"
done
```

## Reglas

- Ninguna tabla tiene FK hacia otra base de datos. Las referencias entre
  servicios (`user_id`, `pet_id`, `vet_user_id`, ...) son UUID planos y se
  validan por HTTP vía `/internal`.
- Los seeds comparten UUID entre servicios (p. ej. el veterinario
  `55555555-5555-5555-5555-555555555551` existe en `auth_db`, `catalog_db` y
  `scheduling_db`), pero sin FK.
- Contraseña de todos los usuarios de prueba: `Vetconecta2026!`.
