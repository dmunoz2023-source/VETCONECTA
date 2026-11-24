// Cliente HTTP para consultar existencia y propiedad de mascotas en clients-pets-service.
import {
  Injectable,
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { AxiosResponse } from 'axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ClientsPetsClient {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async assertPetExists(petId: string): Promise<void> {
    const response = await this.get(
      `/internal/pets/${encodeURIComponent(petId)}`,
    );
    if (response.status === 404) {
      throw new NotFoundException(`No existe una mascota con el ID ${petId}.`);
    }
  }

  async assertPetOwnership(petId: string, userId: string): Promise<void> {
    const response = await this.get(
      `/internal/pets/${encodeURIComponent(petId)}/owner/${encodeURIComponent(userId)}`,
    );
    if (response.status === 404) {
      throw new ForbiddenException(
        'No tienes permiso para consultar el carnet de esta mascota.',
      );
    }
  }

  private async get(path: string): Promise<AxiosResponse> {
    const internalKey =
      this.configService.get<string>('internalApiKey') ||
      this.configService.get<string>('INTERNAL_API_KEY') ||
      this.configService.get<string>('INTERNAL_KEY');
    if (!internalKey) {
      throw new InternalServerErrorException(
        'La clave de comunicación interna no está configurada.',
      );
    }

    const baseUrl = (
      this.configService.get<string>('clientsServiceUrl') ||
      this.configService.get<string>('CLIENTS_SERVICE_URL') ||
      'http://localhost:3002'
    ).replace(/\/+$/, '');

    let response: AxiosResponse;
    try {
      response = await firstValueFrom(
        this.httpService.get(`${baseUrl}${path}`, {
          headers: { 'X-Internal-Key': internalKey },
          validateStatus: () => true,
        }),
      );
    } catch {
      throw new ServiceUnavailableException(
        'No fue posible verificar la mascota en clients-pets-service.',
      );
    }

    if (response.status < 200 || response.status >= 300) {
      if (response.status === 404) {
        return response;
      }
      throw new ServiceUnavailableException(
        'No fue posible verificar la mascota en clients-pets-service.',
      );
    }

    return response;
  }
}
