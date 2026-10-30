# I2: eventos clínicos

Desde la ficha del paciente, «Registrar evento» abre `/mascotas/:id/atencion`
(solo `vet`); «Historial» abre `/mascotas/:id/historial` en modo lectura.
Consulta/control requieren diagnóstico y próximo control; vacuna requiere nombre,
lote y próxima dosis. Todos requieren fecha no futura, peso positivo y observaciones.
El formulario conserva los datos cuando falla la API y muestra sus mensajes 400/403.

## Contrato propuesto para coordinar con F2

El servicio clínico aún no implementa estos endpoints en esta rama. Los nombres
siguientes son una propuesta basada en el prefijo `/v1/clinical` del gateway y
las convenciones inglesas del repositorio; deben confirmarse con Jeremy antes
de considerar validada la integración. El SRS no define sus nombres HTTP.

- `POST /v1/clinical/events`: devuelve el evento creado (201).
- `GET /v1/clinical/pets/:petId/card`: devuelve un arreglo de eventos sin paginar.

Ejemplo de consulta/control (para control, `type: "checkup"`):

```json
{
  "petId": "UUID",
  "type": "consultation",
  "date": "2026-10-29",
  "weightKg": 8.5,
  "notes": "Paciente estable",
  "diagnosis": "Control preventivo",
  "nextCheckup": "2026-11-29"
}
```

Para vacuna, usar `type: "vaccine"` y reemplazar `diagnosis` y `nextCheckup` por:

```json
{
  "vaccination": {
    "vaccine": "Antirrábica",
    "batch": "L001",
    "boosterDate": "2027-10-29"
  }
}
```

Cada evento leído incluye los campos enviados más `id` y `vetUserId`. El frontend
no envía el veterinario: F2 debe tomarlo de la identidad autenticada, validar roles,
persistir, auditar y exponer el mismo evento al carnet móvil (BR-3, BR-9).
Después del POST exitoso el panel navega al historial y hace un GET nuevo, sin
simular persistencia local.

## Verificación manual con F2 disponible

1. Iniciar sesión como veterinario y abrir una ficha existente.
2. Intentar guardar cada tipo con campos vacíos, peso cero y fecha futura:
   debe mostrar validaciones sin enviar el POST.
3. Registrar cada tipo completo y comprobar que el GET del carnet lo muestra,
   incluso después de recargar; probar cada filtro y el estado sin resultados.
4. Con recepción/admin, verificar que no aparece «Registrar evento» y que la
   URL de registro redirige al inicio. El carnet permanece consultable.
5. Provocar respuestas 400 con `message` como lista y 403 sin mensaje: comprobar
   el aviso, que los datos se conservan y que se puede reintentar.
6. Consultar el carnet de la misma mascota desde la app del dueño.

Desde la raíz: `npm.cmd run build --workspace=apps/frontend` y
`npm.cmd run lint --workspace=apps/frontend` (en Linux usar `npm`).

## Commits pequeños sugeridos

1. `feat(clinical): agrega cliente y validaciones`: `src/types/clinical.types.ts`,
   `src/utils/clinicalValidators.ts`, `src/api/clinical.api.ts`.
2. `feat(clinical): agrega formulario y carnet`: `src/pages/pets/ClinicalEventForm.tsx`,
   `src/pages/pets/ClinicalTimeline.tsx`, `src/pages/pets/Clinical.css`.
3. `feat(clinical): conecta ficha con eventos`: `src/pages/pets/PetClinicalPage.tsx`,
   `src/router/AppRouter.tsx` y este documento.

Las rutas anteriores son relativas a `apps/frontend`. Cada bloque depende del
anterior. No incluir cambios ajenos en `infra/docs/openapi/openapi.yaml`.
