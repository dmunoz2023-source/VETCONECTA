import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Specialty } from '../entities/specialty.entity';

/** [G3] Capa de persistencia de catalog.specialties. */
@Injectable()
export class SpecialtiesRepository {
  constructor(
    @InjectRepository(Specialty)
    private readonly repo: Repository<Specialty>,
  ) {}

  findActive(): Promise<Specialty[]> {
    return this.repo.find({ where: { active: true }, order: { name: 'ASC' } });
  }

  findById(id: string): Promise<Specialty | null> {
    return this.repo.findOne({ where: { id } });
  }

  findByName(name: string): Promise<Specialty | null> {
    return this.repo.findOne({ where: { name } });
  }

  save(specialty: Partial<Specialty>): Promise<Specialty> {
    return this.repo.save(this.repo.create(specialty));
  }
}
