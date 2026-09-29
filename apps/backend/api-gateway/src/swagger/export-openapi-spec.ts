import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { dump } from 'js-yaml';
import { OpenAPIObject } from '@nestjs/swagger';

// Deja una copia del contrato combinado en infra/docs/openapi/openapi.yaml
// para que el equipo lo consulte sin tener que levantar el Gateway.
const OUTPUT_DIR = join(__dirname, '../../../../../infra/docs/openapi');
const OUTPUT_FILE = join(OUTPUT_DIR, 'openapi.yaml');

export function exportOpenApiSpec(document: OpenAPIObject): void {
  if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR, { recursive: true });
  writeFileSync(OUTPUT_FILE, dump(document), 'utf8');
}
