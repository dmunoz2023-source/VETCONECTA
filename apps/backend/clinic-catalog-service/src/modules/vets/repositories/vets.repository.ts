import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Specialty } from '../../specialties/entities/specialty.entity';
import { VetSpecialty } from '../entities/vet-specialty.entity';
import { Vet } from '../entities/vet.entity';

/** [G3] Capa de persistencia de catalog.vets y catalog.vet_specialties. */
@Injectable()
export class VetsRepository {
  constructor(
    @InjectRepository(Vet)
    private readonly vets: Repository<Vet>,
    @InjectRepository(VetSpecialty)
    private readonly vetSpecialties: Repository<VetSpecialty>,
  ) {}

  findById(userId: string): Promise<Vet | null> {
    return this.vets.findOne({ where: { userId } });
  }

  async findSpecialties(vetUserId: string): Promise<Specialty[]> {
    const rows = await this.vetSpecialties.find({
      where: { vetUserId },
      relations: ['specialty'],
    });
    return rows
      .map((row) => row.specialty as Specialty)
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  hasSpecialty(vetUserId: string, specialtyId: string): Promise<boolean> {
    return this.vetSpecialties.existsBy({ vetUserId, specialtyId });
  }

  async addSpecialty(vetUserId: string, specialtyId: string): Promise<void> {
    await this.vetSpecialties.insert({ vetUserId, specialtyId });
  }

  async removeSpecialty(vetUserId: string, specialtyId: string): Promise<boolean> {
    const result = await this.vetSpecialties.delete({ vetUserId, specialtyId });
    return (result.affected ?? 0) > 0;
  }
}
