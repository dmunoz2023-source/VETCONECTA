import {
  Injectable,
  InternalServerErrorException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { AxiosResponse } from 'axios';
import { firstValueFrom } from 'rxjs';

export interface CreateUserNotificationPayload {
  userId: string;
  petId: string;
  title: string;
  body: string;
}

@Injectable()
export class NotificationsClient {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async create(notification: CreateUserNotificationPayload): Promise<void> {
    const internalKey =
      this.configService.get<string>('internalApiKey') ||
      this.configService.get<string>('INTERNAL_API_KEY') ||
      this.configService.get<string>('INTERNAL_KEY');
    if (!internalKey) {
      throw new InternalServerErrorException(
        'El evento clínico se guardó, pero falta la clave interna para crear el aviso.',
      );
    }

    const baseUrl = (
      this.configService.get<string>('notificationsServiceUrl') ||
      this.configService.get<string>('NOTIFICATIONS_SERVICE_URL') ||
      'http://localhost:3005'
    ).replace(/\/+$/, '');

    let response: AxiosResponse;
    try {
      response = await firstValueFrom(
        this.httpService.post(
          `${baseUrl}/internal/notifications`,
          notification,
          {
            headers: { 'X-Internal-Key': internalKey },
            validateStatus: () => true,
          },
        ),
      );
    } catch {
      throw new ServiceUnavailableException(
        'El evento clínico se guardó, pero no fue posible contactar notifications-service para crear el aviso.',
      );
    }

    if (response.status < 200 || response.status >= 300) {
      throw new ServiceUnavailableException(
        `El evento clínico se guardó, pero notifications-service no pudo crear el aviso (HTTP ${response.status}).`,
      );
    }
  }
}
