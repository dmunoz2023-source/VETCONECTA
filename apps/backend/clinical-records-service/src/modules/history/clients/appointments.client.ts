import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AppConfig } from '../../../config/configuration';

export interface PastAppointment {
  id: string;
  startTime: string;
  endTime: string;
  status: string;
  vetUserId: string;
  specialtyId: string;
}

export interface AppointmentRange {
  /** Inicio del rango (inclusive). */
  from?: Date;
  /** Fin del rango (exclusivo). */
  toExclusive?: Date;
}

/**
 * [F3] Citas pasadas de una mascota, que viven en scheduling-service. Se piden por HTTP
 * (GET /internal/appointments?petId=...), porque clinical no puede leer el esquema scheduling.
 */
export abstract class AppointmentsClient {
  /** Citas con inicio anterior a ahora, de la más reciente a la más antigua; null si scheduling no respondió. */
  abstract findPastByPet(petId: string, range: AppointmentRange): Promise<PastAppointment[] | null>;
}

@Injectable()
export class HttpAppointmentsClient extends AppointmentsClient {
  private readonly logger = new Logger(HttpAppointmentsClient.name);

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService<AppConfig, true>,
  ) {
    super();
  }

  async findPastByPet(petId: string, range: AppointmentRange): Promise<PastAppointment[] | null> {
    const baseUrl = this.config.get('schedulingServiceUrl', { infer: true });
    try {
      const { data } = await firstValueFrom(
        this.http.get(`${baseUrl}/internal/appointments`, {
          headers: { 'X-Internal-Key': this.config.get('internalKey', { infer: true }) },
          params: {
            petId,
            from: range.from?.toISOString(),
            to: range.toExclusive?.toISOString(),
          },
          timeout: 3000,
        }),
      );
      return data.data as PastAppointment[];
    } catch (error) {
      this.logger.warn(`No se pudieron obtener las citas de la mascota ${petId}: ${(error as Error).message}`);
      return null;
    }
  }
}
