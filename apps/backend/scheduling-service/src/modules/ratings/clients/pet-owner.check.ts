import { HttpService } from '@nestjs/axios';
import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { isAxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';
import { AppConfig } from '../../../config/configuration';

/** Tiempo máximo de espera a otro servicio (Arquitectura: 3 s). */
const TIMEOUT_MS = 3000;

/**
 * [K2] Comprueba en clients-pets-service que una mascota pertenece al usuario dueño
 * autenticado (BR-8). scheduling no puede leer el esquema clients_pets, así que
 * pregunta por HTTP con GET /internal/pets/:id/owner/:userId, usando el `sub` del token
 * porque el JWT todavía no trae `clientId`. Es abstracta para sustituirla en pruebas.
 */
export abstract class PetOwnerCheck {
  /** true si la mascota es del usuario; lanza 503 si clients-pets no responde. */
  abstract isOwner(petId: string, userId: string): Promise<boolean>;
}

@Injectable()
export class HttpPetOwnerCheck extends PetOwnerCheck {
  private readonly logger = new Logger(HttpPetOwnerCheck.name);

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService<AppConfig, true>,
  ) {
    super();
  }

  async isOwner(petId: string, userId: string): Promise<boolean> {
    const baseUrl = this.config.get('clientsServiceUrl', { infer: true });
    try {
      await firstValueFrom(
        this.http.get(
          `${baseUrl}/internal/pets/${encodeURIComponent(petId)}/owner/${encodeURIComponent(userId)}`,
          {
            headers: { 'X-Internal-Key': this.config.get('internalKey', { infer: true }) },
            timeout: TIMEOUT_MS,
          },
        ),
      );
      return true;
    } catch (error: unknown) {
      // clients-pets responde 404 cuando el usuario no tiene cliente o la mascota no es suya.
      if (isAxiosError(error) && error.response?.status === 404) {
        return false;
      }
      this.logger.error(
        `No se pudo verificar al dueño de la mascota ${petId}: ${(error as Error).message}`,
      );
      throw new ServiceUnavailableException(
        'No se pudo verificar la mascota: el servicio de clientes no está disponible.',
      );
    }
  }
}
