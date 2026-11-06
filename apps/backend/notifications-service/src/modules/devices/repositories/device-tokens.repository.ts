import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { DeviceToken } from '../entities/device-token.entity';

/** [H1] Repositorio tipado — persistencia exclusiva de `notifications.device_tokens`. */
@Injectable()
export class DeviceTokensRepository {
  constructor(
    @InjectRepository(DeviceToken)
    private readonly repo: Repository<DeviceToken>,
  ) {}

  /** Dispositivos activos de un usuario: a ellos se envía el push. */
  findActiveByUser(userId: string): Promise<DeviceToken[]> {
    return this.repo.find({ where: { userId, active: true } });
  }

  /** Elimina tokens que el proveedor reportó como inválidos o desinstalados. */
  async removeByTokens(tokens: string[]): Promise<void> {
    if (tokens.length === 0) return;
    await this.repo.delete({ token: In(tokens) });
  }

  /** Registra que el dispositivo recibió un aviso correctamente. */
  async markUsed(ids: string[]): Promise<void> {
    if (ids.length === 0) return;
    await this.repo.update({ id: In(ids) }, { lastUsedAt: new Date() });
  }
}
