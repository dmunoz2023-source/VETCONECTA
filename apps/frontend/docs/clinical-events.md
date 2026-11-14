# I2: eventos clínicos (panel web)

Desde la ficha del paciente, «Registrar evento» abre `/pets/:id/clinical-event`
(solo `vet`) y «Historial» abre `/pets/:id/clinical-history`, el carnet de solo
lectura. Al registrar un evento se vuelve al carnet, donde aparece primero.

## Estructura

| Capa | Archivo | Responsabilidad |
|---|---|---|
| Tipos | `src/types/clinical.types.ts` | Evento que devuelve la API y campos del formulario |
| API | `src/api/clinical.api.ts` | Llamadas HTTP y traducción al DTO de F2 |
| Utils | `src/utils/clinicalLabels.ts` | Etiquetas en español, formato del peso |
| Utils | `src/utils/clinicalValidators.ts` | Mismas reglas que `CreateClinicalEventDto` |
| Hooks | `src/hooks/useClinicalEventForm.ts` | Estado, validación y envío del formulario |
| Hooks | `src/hooks/useClinicalEvents.ts` | Carga del carnet |
| UI | `src/pages/clinical/ClinicalEventForm.tsx` | Formulario (presentación) |
| UI | `src/pages/clinical/ClinicalTimeline.tsx` | Línea de tiempo (presentación; estilos en `*.module.css`) |
| UI | `src/pages/clinical/ClinicalEventPage.tsx`, `ClinicalHistoryPage.tsx` | Páginas de las rutas |

## Contrato con F2 (clinical-records-service, PR #77)

### `POST /v1/clinical/events` — rol `vet`

Las claves del cuerpo las define `CreateClinicalEventDto` de F2, ya unido a `develop`
(PR #77, claves en inglés). F2 valida según el tipo y responde 400 si faltan los
campos de ese tipo.

Consulta o control (`consultation` | `checkup`):

```json
{
  "petId": "UUID",
  "type": "consultation",
  "date": "2026-11-06T15:30:00.000Z",
  "weightKg": 8.5,
  "notes": "Paciente estable",
  "diagnosis": "Gastritis leve",
  "nextCheckup": "2026-12-06"
}
```

Vacuna (`vaccine`):

```json
{
  "petId": "UUID",
  "type": "vaccine",
  "date": "2026-11-06T15:30:00.000Z",
  "weightKg": 8.5,
  "notes": "Sin reacciones",
  "vaccineName": "Antirrábica",
  "batch": "L-2026-014",
  "boosterDate": "2026-12-06"
}
```

- Obligatorios siempre: `petId`, `type`, `date` (no futura), `weightKg` (> 0) y `notes`.
- Consulta y control: `diagnosis` y `nextCheckup` obligatorios; no llevan datos de vacuna.
- Vacuna: `vaccineName`, `batch` y `boosterDate` obligatorios; no lleva `diagnosis` ni `nextCheckup`.
- El veterinario no se envía: F2 lo toma del JWT (BR-3).
- `date` va con hora porque la columna es `timestamptz`: hoy se envía la hora
  actual y un día pasado su mediodía local, para que no cambie de día en Chile.

Errores: 400 (dato inválido o faltante), 403 (rol sin permiso), 404 (mascota
inexistente). El panel muestra el `message` del backend y conserva los datos.

### `GET /v1/clinical/pets/{petId}/carnet` — roles `owner` (solo las suyas), `vet`, `reception`

Devuelve un arreglo ordenado del más reciente al más antiguo:

```json
[
  {
    "id": "UUID",
    "petId": "UUID",
    "veterinarianId": "UUID",
    "type": "consultation",
    "date": "2026-11-06T15:30:00.000Z",
    "weightKg": "8.50",
    "temperatureC": null,
    "reason": null,
    "notes": "Paciente estable",
    "nextCheckup": "2026-12-06"
  }
]
```

`weightKg` llega como texto (columna `decimal`). El filtro por tipo se aplica en el panel.

## Pendiente del backend (fuera de I2)

- El carnet no admite el rol `admin` (recibe 403); por eso el panel oculta Historial a ese rol.
- Si F2 cambia el DTO, el único lugar a ajustar es `toPayload` en `src/api/clinical.api.ts`.

## Verificación manual

1. Como veterinario, abrir una ficha y entrar a «Registrar evento».
2. Guardar con campos vacíos, peso 0 y fecha futura: se muestran los errores y no se envía nada.
3. Registrar cada tipo: se vuelve al carnet con el aviso y el evento aparece primero; probar el filtro.
4. Como recepción, comprobar que «Registrar evento» no aparece y que `/clinical-event` redirige al inicio.
5. Ver el mismo evento en el carnet de la app del dueño.

Desde la raíz: `npm run build --workspace=apps/frontend` y `npm run lint --workspace=apps/frontend`.
