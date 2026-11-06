import { HttpService } from '@nestjs/axios';
import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { isAxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';
import { AppConfig } from '../../../config/configuration';

/** Lo que el historial necesita saber de la mascota: de quién es (BR-8). */
export interface PetInfo {
  id: string;
  clientId: string;
  active: boolean;
}

/**
 * [F3] Consulta de mascotas en clients-pets-service. clinical no puede leer el esquema
 * clients_pets, así que pregunta por HTTP (GET /internal/pets/:id, con X-Internal-Key).
 * Es una clase abstracta para poder sustituirla en las pruebas.
 */
export abstract class PetsLookup {
  /** Devuelve null si la mascota no existe; lanza 503 si clients-pets no responde. */
  abstract findById(petId: string): Promise<PetInfo | null>;
}

@Injectable()
export class HttpPetsLookup extends PetsLookup {
  private readonly logger = new Logger(HttpPetsLookup.name);

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService<AppConfig, true>,
  ) {
    super();
  }

  async findById(petId: string): Promise<PetInfo | null> {
    const baseUrl = this.config.get('clientsServiceUrl', { infer: true });
    try {
      const { data } = await firstValueFrom(
        this.http.get(`${baseUrl}/internal/pets/${encodeURIComponent(petId)}`, {
          headers: { 'X-Internal-Key': this.config.get('internalKey', { infer: true }) },
          timeout: 3000,
        }),
      );
      return { id: data.id, clientId: data.clientId, active: data.active ?? true };
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      this.logger.error(`No se pudo consultar la mascota ${petId}: ${(error as Error).message}`);
      throw new ServiceUnavailableException(
        'No se pudo verificar la mascota: el servicio de clientes no está disponible.',
      );
    }
  }
}
