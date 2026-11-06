import { HttpService } from '@nestjs/axios';
import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { isAxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';
import { AppConfig } from '../../../config/configuration';

/** Datos de la mascota que scheduling necesita para reservar (BR-8 y recordatorio). */
export interface PetInfo {
  id: string;
  name: string;
  clientId: string;
  /** auth.users.id del dueño: a quien se envia el recordatorio. */
  ownerUserId: string;
  active: boolean;
}

/**
 * [G2] Consulta de mascotas en clients-pets-service. scheduling no puede leer el
 * esquema clients_pets, asi que pregunta por HTTP (GET /internal/pets/:id).
 * Es una clase abstracta para poder sustituirla en pruebas.
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
        this.http.get(`${baseUrl}/internal/pets/${petId}`, {
          headers: { 'X-Internal-Key': this.config.get('internalKey', { infer: true }) },
          timeout: 5000,
        }),
      );
      return {
        id: data.id,
        name: data.name,
        clientId: data.clientId,
        ownerUserId: data.userId,
        active: data.active ?? true,
      };
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      this.logger.error(`No se pudo consultar la mascota ${petId}: ${(error as Error).message}`);
      throw new ServiceUnavailableException(
        'No se pudo verificar la mascota: el servicio de clientes no esta disponible.',
      );
    }
  }
}
