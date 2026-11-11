import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '../../../config/configuration';

/** Respuesta de GET /internal/vets/:id en clinic-catalog-service. */
export interface VetSummary {
  userId: string;
  active: boolean;
  specialties: { id: string; name: string; durationMinutes: number }[];
}

const INTERNAL_TIMEOUT_MS = 3000;

/** [G3] scheduling no lee el esquema catalog: pregunta por HTTP interno. */
@Injectable()
export class CatalogClient {
  private readonly logger = new Logger(CatalogClient.name);

  constructor(private readonly config: ConfigService<AppConfig, true>) {}

  /** Devuelve null si el veterinario no existe; lanza 503 si catálogo no responde. */
  async findVet(vetUserId: string): Promise<VetSummary | null> {
    const baseUrl = this.config.get('catalogServiceUrl', { infer: true });
    try {
      const response = await fetch(`${baseUrl}/internal/vets/${vetUserId}`, {
        headers: { 'X-Internal-Key': this.config.get('internalKey', { infer: true }) },
        signal: AbortSignal.timeout(INTERNAL_TIMEOUT_MS),
      });
      if (response.status === 404) {
        return null;
      }
      if (!response.ok) {
        throw new Error(`catálogo respondió ${response.status}`);
      }
      return (await response.json()) as VetSummary;
    } catch (error) {
      this.logger.error(`No se pudo consultar al veterinario ${vetUserId}: ${(error as Error).message}`);
      throw new ServiceUnavailableException(
        'No se pudo verificar al veterinario: el servicio de catálogo no está disponible.',
      );
    }
  }
}
