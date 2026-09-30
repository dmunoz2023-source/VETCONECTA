import { OpenAPIObject } from '@nestjs/swagger';

// Cada microservicio publica su contrato en /docs-json y el gateway los junta en un solo /docs.
// Si un servicio no está levantado o todavía no publica su contrato, simplemente se salta.
const SERVICE_DOCS_URLS = [
  'http://localhost:3001/docs-json', // auth-service
  'http://localhost:3002/docs-json', // clients-pets-service
  'http://localhost:3003/docs-json', // clinical-records-service
  'http://localhost:3004/docs-json', // scheduling-service
  'http://localhost:3005/docs-json', // notifications-service
  'http://localhost:3006/docs-json', // clinic-catalog-service
];

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

export async function aggregateServiceDocs(document: OpenAPIObject): Promise<void> {
  const serviceDocuments = await Promise.all(SERVICE_DOCS_URLS.map(fetchServiceDocument));
  for (const serviceDocument of serviceDocuments) {
    if (serviceDocument) mergeDocuments(document, serviceDocument);
  }
}
