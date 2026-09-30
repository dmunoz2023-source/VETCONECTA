import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from '../entities/client.entity';
import { NewClientDataDTO } from '../dto/new-client-data.dto';

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

  /**
   * Crea y persiste un cliente nuevo. Recibe los datos ya validados por la
   * capa superior (DTO) y devuelve la fila creada con su id generado.
   */
  create(data: NewClientDataDTO): Promise<Client> {
    return this.repo.save(this.repo.create(data));
  }

  /**
   * Baja lógica: marca active=false en vez de borrar la fila, para no perder
   * el histórico ni romper las mascotas que referencian al cliente.
   */
  async softDelete(id: string): Promise<void> {
    await this.repo.update(id, { active: false });
  }
}
