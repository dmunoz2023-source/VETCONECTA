import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AppConfig } from '../../../config/configuration';

/**
 * [F3] Nombre de los veterinarios, que vive en clinic-catalog (catalog.vets). Solo
 * enriquece la respuesta: si el catálogo no responde o aún no expone la ruta, el
 * historial sigue saliendo con `vetUserId` y el nombre en null.
 */
export abstract class VetsLookup {
  /** Mapa id -> nombre completo (o null si no se pudo obtener). Nunca lanza. */
  abstract findNames(vetIds: string[]): Promise<Map<string, string | null>>;
}

@Injectable()
export class HttpVetsLookup extends VetsLookup {
  private readonly logger = new Logger(HttpVetsLookup.name);

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService<AppConfig, true>,
  ) {
    super();
  }

  async findNames(vetIds: string[]): Promise<Map<string, string | null>> {
    const baseUrl = this.config.get('catalogServiceUrl', { infer: true });
    const internalKey = this.config.get('internalKey', { infer: true });

    const entries = await Promise.all(
      vetIds.map(async (vetId): Promise<[string, string | null]> => {
        try {
          const { data } = await firstValueFrom(
            this.http.get(`${baseUrl}/internal/vets/${encodeURIComponent(vetId)}`, {
              headers: { 'X-Internal-Key': internalKey },
              timeout: 3000,
            }),
          );
          const name = [data.firstName, data.lastName].filter(Boolean).join(' ').trim();
          return [vetId, name || null];
        } catch (error) {
          this.logger.warn(`No se pudo obtener el veterinario ${vetId}: ${(error as Error).message}`);
          return [vetId, null];
        }
      }),
    );

    return new Map(entries);
  }
}
