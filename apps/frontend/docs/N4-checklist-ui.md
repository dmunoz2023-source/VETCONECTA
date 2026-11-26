# [N4] Checklist de UI del panel web

Revisión general de la UI pedida en N4 (punto 2): estados de carga, vacío y error (Panel web §5), adaptación a laptop y tablet, y consistencia visual.

Revisado sobre `develop` (ec8f2f09) en tres tamaños: **1366×768** (laptop), **1024×768** (laptop chica / tablet horizontal) y **768×1024** (tablet vertical).

Leyenda: ✅ cumple · 🔧 corregido en N4 · ⚠️ pendiente (se indica a quién le toca)

## 1. Consistencia visual

| Punto | Estado | Detalle |
|---|---|---|
| Variables de color `--vc-*` | 🔧 | 53 usos de `--vc-text-muted`, `--vc-primary`, `--vc-border`, etc. no estaban definidos desde el cambio de tema (5df66dfc). Ahora son alias de la paleta actual en `index.css`. Efecto visible: el día de hoy del minicalendario era invisible (texto blanco sin fondo), la página activa de la paginación no se marcaba y los bordes de tablas y tarjetas no aparecían. |
| Mensajes de error | ⚠️ I1 (#80) | `DataTable` muestra el error en gris, igual que "sin resultados", y sin `role="alert"`. En la agenda y la ficha el error se ve en rojo (`vc-modal-error`). No se tocó porque #80 reescribe `DataTable`. |
| Minicalendario vs. agenda | ⚠️ inicio | El minicalendario empieza la semana el domingo; la agenda, el lunes. |

## 2. Laptop y tablet

| Punto | Estado | Detalle |
|---|---|---|
| Menú lateral | 🔧 | Hasta 1024 px parte colapsado (solo íconos) y deja el espacio al contenido. El botón sigue funcionando; al cruzar el corte se vuelve al valor por defecto. |
| Menú colapsado: accesibilidad | 🔧 | Los íconos tienen `title`/`aria-label` con su nombre; el botón dice "Expandir/Colapsar menú" y expone `aria-expanded`. |
| Encabezado de página | 🔧 | Las acciones (buscador, botones) bajan debajo del título en vez de apretarlo hasta una palabra por línea. |
| Inicio | 🔧 | Bajo 1100 px el calendario baja debajo de la tabla de citas (antes la tabla quedaba cortada a ~150 px). Las tarjetas de métricas se reacomodan solas. |
| Agenda: filtros | 🔧 | A 768 px el buscador se encogía hasta desaparecer; ahora va en su propia fila y los selectores se reparten el ancho. |
| Agenda: cabecera del calendario | 🔧 | Los controles pasan a la línea siguiente si no caben. |
| Clientes y mascotas | ✅ | Con el menú colapsado, la tabla se ve completa a 768 px. |
| Login | ✅ | Se ve bien en los tres tamaños. |
| Paginación | ⚠️ I1 (#80) | Dibuja un botón por página; con muchas páginas se desborda en tablet. |

## 3. Estados de carga, vacío y error (Panel web §5)

| Pantalla | Carga | Vacío | Error | Comentario |
|---|---|---|---|---|
| Inicio – métricas | ✅ | ✅ | ✅ | Datos de prueba (`mocks/`), sin endpoint real. |
| Inicio – citas del día | ✅ | ✅ | ✅ | Datos de prueba (`mocks/`). |
| Clientes | ✅ | ✅ | ⚠️ | Error en gris (ver §1). |
| Mascotas | ✅ | ✅ | ⚠️ | Error en gris (ver §1). |
| Ficha de mascota | ✅ | — | ✅ | |
| Agenda | ✅ | ✅ | ✅ | |
| Reportes, Historial, Configuración | — | — | — | Siguen como `PlaceholderPage` (L2, L3). |

## 4. Elementos que no hacen nada (avisar a cada responsable)

- **Inicio:** los botones "Exportar Reporte" y "+ Nuevo Registro" y los íconos de filtro/menú de "Citas del Día" no tienen acción.
- **Header:** el buscador global y la campana no hacen nada.
- **Agenda:** los filtros de veterinario y especialidad tienen opciones fijas (`v1`, `v2`, `esp1`…) que no salen de la API. Se pueden cargar con `GET /v1/catalog/vets` y `/v1/catalog/specialties` (G1, #57).

## 5. Pruebas de componentes (punto 1 de N4): pendiente

No se pueden escribir todavía:
- El dashboard de reportes (L2) y la vista de historial (L3) aún no existen.
- El front no tiene Vitest ni React Testing Library en `develop`. Los agregan J4 (#87) e I2 (#41); conviene usar esa configuración y no duplicarla.

Cuando entren, las pruebas de N4 deben cubrir en L2 y L3 los cuatro estados (carga, vacío, error y éxito), los filtros (fecha y veterinario en L2; tipo y fecha en L3) y el acceso solo para admin en L2.

## 6. Bugs de QA (punto 3 de N4): pendiente

Depende de que M1 (pruebas end-to-end) entregue la lista de defectos.
