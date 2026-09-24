import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pet } from '../entities/pet.entity';

/**
 * [A3] Repositorio tipado — capa de persistencia exclusiva de `pets`.
 * `findByClientId` es la consulta base que va a reutilizar C1 (GET mascota)
 * para listar las mascotas de un dueño.
 */
@Injectable()
export class PetsRepository {
  constructor(
    @InjectRepository(Pet) private readonly repo: Repository<Pet>,
  ) {}

  findById(id: string): Promise<Pet | null> {
    return this.repo.findOne({ where: { id } });
  }

  findByClientId(clientId: string): Promise<Pet[]> {
    return this.repo.find({
      where: { clientId, active: true },
      order: { name: 'ASC' },
    });
  }
}
