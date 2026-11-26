# Guion de la demo del panel web

Demo de unos **15 minutos** que recorre el flujo completo de la clínica, coordinada con la demo de la app móvil (Mobile K3).
La idea central es mostrar que **lo que se hace en el panel aparece en la app, y al revés**: los dos clientes comparten el mismo API.

## Antes de empezar (10 minutos antes)

1. Servicios, gateway y panel levantados (ver el [README](../../README.md)) o apuntando al ambiente desplegado (M5).
2. Base de datos con el seed normal. Para repetir la demo desde cero: borrar y volver a crear las bases con
   `infra/db/00-databases.sql` y los `00-tables.sql` / `01-seed.sql` de cada servicio.
3. Dos ventanas del navegador: una con el panel como **recepción** y otra de incógnito para **veterinario**. La app móvil con
   el dueño `dueno1@vetconecta.cl`, en el emulador o en el teléfono.
4. Probar el login de las tres cuentas **antes** de la demo. Contraseña de todas: `Vetconecta2026!`.
5. Tener abierto `http://localhost:3000/docs` (Swagger) por si preguntan por el contrato.

| Persona | Cuenta | Dónde |
| --- | --- | --- |
| Recepción | `recepcion@vetconecta.cl` | Panel |
| Veterinario | `veterinario@vetconecta.cl` | Panel |
| Administrador | `admin@vetconecta.cl` | Panel |
| Dueño | `dueno1@vetconecta.cl` (mascotas Polo y Luna) | App móvil |

## Escenas

### 1. Ingreso y roles (2 min)

| Paso | Qué se hace | Qué se debe ver |
| --- | --- | --- |
| 1 | Entrar al panel como **recepción** | Menú lateral con Inicio, Clientes, Mascotas, Agenda |
| 2 | Cerrar sesión y entrar como **veterinario** | Mismas pantallas, pero sin crear mascotas; con acceso al historial |
| 3 | Intentar abrir una URL no permitida para el rol | Redirección: cada pantalla está restringida por rol (BR-14) |

**Mensaje:** el mismo login sirve para dueños y personal; lo que cambia es el rol dentro del token.

### 2. Alta de cliente y mascota (3 min) — recepción

| Paso | Qué se hace | Qué se debe ver |
| --- | --- | --- |
| 1 | Clientes → **Nuevo cliente**: RUT, nombre, correo, teléfono | El cliente aparece en el listado |
| 2 | Volver a crear un cliente con el **mismo RUT** | Error claro: el RUT ya está registrado (409) |
| 3 | En el cliente nuevo, crear una mascota con fecha de nacimiento | La ficha muestra la **edad calculada**, no guardada (BR-2) |
| 4 | Buscar al cliente por RUT, nombre y teléfono | La búsqueda responde al instante |

**Cruce con la app:** ingresar con el dueño del cliente nuevo y mostrar la mascota en *Mis mascotas*.

### 3. Agenda y reserva (3 min) — app móvil y panel

| Paso | Qué se hace | Qué se debe ver |
| --- | --- | --- |
| 1 | En la app, como `dueno1`, reservar una hora para Polo | La cita queda reservada |
| 2 | En el panel → **Agenda** | La **misma cita aparece en la agenda** del veterinario |
| 3 | En la app, intentar reservar **la misma hora** con `dueno2` (o desde dos dispositivos a la vez) | La segunda reserva es rechazada: una hora ocupada nunca se reserva dos veces (BR-5) |
| 4 | *(Requiere L1)* En **Configuración de agenda**, crear un bloqueo del veterinario para un día | El panel advierte de las citas afectadas; la app deja de ofrecer esas horas |

### 4. Atención clínica (3 min) — veterinario

| Paso | Qué se hace | Qué se debe ver |
| --- | --- | --- |
| 1 | Abrir la ficha de Polo → **Registrar atención** | Formulario de evento clínico |
| 2 | Registrar una consulta con peso, temperatura y observaciones | El evento queda guardado con el nombre del veterinario (BR-3) |
| 3 | *(Requiere K1)* Agregar en *Tratamiento* un medicamento con dosis y frecuencia | La pauta queda asociada al evento; solo el veterinario puede definirla (BR-10) |
| 4 | Abrir el **historial** de Polo | Línea de tiempo con el evento nuevo y el gráfico de peso *(L3)* |
| 5 | En la app, abrir el carnet de Polo | **El evento aparece**, de solo lectura para el dueño (BR-6); la pauta genera los recordatorios en el teléfono |

### 5. Cierre de la cita y calificación (2 min)

| Paso | Qué se hace | Qué se debe ver |
| --- | --- | --- |
| 1 | En el panel, el veterinario marca la cita como **realizada** | La cita cambia de estado |
| 2 | En la app, el dueño **califica** la atención (1 a 5 estrellas) | La calificación se guarda; calificar otra vez la misma cita es rechazado |
| 3 | *(Requiere L2)* Como **admin** → Reportes | El promedio y la distribución reflejan la calificación recién enviada |

### 6. Seguridad y contrato (2 min)

| Paso | Qué se hace | Qué se debe ver |
| --- | --- | --- |
| 1 | En Swagger, probar `GET /v1/pets/<id de una mascota de dueno2>` con el token de `dueno1` | 404/403: un dueño no puede ver lo de otro cambiando el id (BR-8) |
| 2 | Mostrar el contrato en `/docs` | Todos los endpoints, con roles, ejemplos y códigos de error |
| 3 | *(Requiere K4)* Como admin, abrir la auditoría | Cada acción crítica deja usuario, fecha y hora (BR-9) |

## Si algo falla durante la demo

* **Un servicio no responde:** mostrar que los demás siguen funcionando (un fallo aislado no tumba el sistema, NFR-2) y reiniciarlo.
* **Una pantalla todavía no está integrada:** pasar a la escena siguiente y mostrar el endpoint equivalente en Swagger.
* **La reserva falla por «hora ya pasó»:** el seed genera horarios de lunes a viernes; elegir un bloque futuro.
* Tener a mano la grabación de la demo anterior como respaldo.

## Checklist de la tarea

- [ ] Las tres cuentas del panel y la del dueño inician sesión.
- [ ] Datos en estado inicial (bases recreadas con el seed).
- [ ] Escenas 3 a 5 ensayadas **junto con el equipo Mobile** (la reserva y la calificación cruzan ambas aplicaciones).
- [ ] Las escenas marcadas con *(Requiere ...)* se ensayan solo si esa tarea ya está integrada.
