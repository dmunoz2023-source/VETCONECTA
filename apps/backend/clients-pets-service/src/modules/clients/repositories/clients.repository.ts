import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from '../entities/client.entity';

/**
 * [A3] Repositorio tipado — capa de persistencia exclusiva de `clients`.
 * Solo consulta su propio esquema; cualquier dato de otro dominio (por
 * ejemplo, el rol del usuario en auth-service) se obtiene vía /internal.
 */
@Injectable()
export class ClientsRepository {
  constructor(
    @InjectRepository(Client) private readonly repo: Repository<Client>,
  ) {}

  findById(id: string): Promise<Client | null> {
    return this.repo.findOne({ where: { id } });
  }

  /**
   * Busca el cliente asociado a un usuario de auth-service. Es la
   * consulta base para resolver "¿quién es el dueño autenticado?" sin
   * necesitar un JOIN entre esquemas.
   */
  findByUserId(userId: string): Promise<Client | null> {
    return this.repo.findOne({ where: { userId } });
  }

  findByRut(rut: string): Promise<Client | null> {
    return this.repo.findOne({ where: { rut } });
  }
}
