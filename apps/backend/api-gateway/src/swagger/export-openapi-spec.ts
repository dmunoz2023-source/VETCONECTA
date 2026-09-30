import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { dump } from 'js-yaml';
import { OpenAPIObject } from '@nestjs/swagger';

export function exportOpenApiSpec(document: OpenAPIObject): void {
  const isInsideWorkspace = process.cwd().endsWith('api-gateway');
  const OUTPUT_DIR = isInsideWorkspace
    ? join(process.cwd(), '../../../infra/docs/openapi')
    : join(process.cwd(), 'infra/docs/openapi');

  const OUTPUT_FILE = join(OUTPUT_DIR, 'openapi.yaml');

  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  writeFileSync(OUTPUT_FILE, dump(document), 'utf8');
}