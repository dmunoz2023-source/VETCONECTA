import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PetEntity } from '../entities/pet.entity';

/**
 * [A3] Repositorio tipado — capa de persistencia exclusiva de `pets`.
 * `findByClientId` es la consulta base que va a reutilizar C1 (GET mascota)
 * para listar las mascotas de un dueño.
 */
@Injectable()
export class PetsRepository {
  constructor(
    @InjectRepository(PetEntity) private readonly repo: Repository<PetEntity>,
  ) {}

  findById(id: string): Promise<PetEntity | null> {
    return this.repo.findOne({ where: { id } });
  }

  findByClientId(clientId: string): Promise<PetEntity[]> {
    return this.repo.find({
      where: { clientId, active: true },
      order: { name: 'ASC' },
    });
  }
}
