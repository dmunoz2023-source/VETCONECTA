import { OpenAPIObject } from '@nestjs/swagger';

// Cada microservicio publica su contrato en /docs-json y el gateway los junta en un solo /docs.
// Si un servicio no está levantado o todavía no publica su contrato, simplemente se salta.

async function fetchServiceDocument(url: string): Promise<OpenAPIObject | null> {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(2000) });
    if (!response.ok) return null;
    return (await response.json()) as OpenAPIObject;
  } catch {
    return null;
  }
}

function mergeDocuments(target: OpenAPIObject, source: OpenAPIObject): void {
  target.paths = { ...target.paths, ...source.paths };
  target.components = target.components ?? {};
  target.components.schemas = {
    ...target.components.schemas,
    ...source.components?.schemas,
  };
  target.tags = [...(target.tags ?? []), ...(source.tags ?? [])];
}

/**
 * Agrega al documento del gateway el contrato de cada servicio en `serviceUrls`.
 * Devuelve las URLs de los servicios que no respondieron.
 */
export async function aggregateServiceDocs(
  document: OpenAPIObject,
  serviceUrls: string[],
): Promise<string[]> {
  const serviceDocuments = await Promise.all(
    serviceUrls.map((url) => fetchServiceDocument(`${url}/docs-json`)),
  );

  const missing: string[] = [];
  serviceDocuments.forEach((serviceDocument, index) => {
    if (serviceDocument) mergeDocuments(document, serviceDocument);
    else missing.push(serviceUrls[index]);
  });
  return missing;
}
