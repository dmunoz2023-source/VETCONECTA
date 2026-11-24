import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '../config/configuration';

/** [G3] Comprueba que el servicio levantó y contra qué esquema quedó conectado. */
@Controller('health')
export class HealthController {
  constructor(private readonly configService: ConfigService<AppConfig, true>) {}

  @Get()
  check() {
    return {
      status: 'ok',
      service: 'clinic-catalog-service',
      schema: this.configService.get('dbSchema', { infer: true }),
    };
  }
}
