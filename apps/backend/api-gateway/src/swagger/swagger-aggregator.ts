import { OpenAPIObject } from '@nestjs/swagger';
import { PROXY_ROUTES_CONFIG } from '../config/proxy.config';

const {
  auth,
  clients,
  clinical,
  scheduling,
  notifications,
  catalog
} = PROXY_ROUTES_CONFIG

// Cada microservicio publica su contrato en /docs-json y el gateway los junta en un solo /docs.
// Si un servicio no está levantado o todavía no publica su contrato, simplemente se salta.
const SERVICE_DOCS_URLS = [
  auth.origin + '/docs-json', // auth-service
  clients.origin + '/docs-json', // clients-pets-service
  clinical.origin + '/docs-json', // clinical-records-service
  scheduling.origin + '/docs-json', // scheduling-service
  notifications.origin + '/docs-json', // notifications-service
  catalog.origin + '/docs-json', // clinic-catalog-service
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
