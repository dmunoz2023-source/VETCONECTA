import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateSpecialtyDto } from '../dto/create-specialty.dto';
import { UpdateSpecialtyDto } from '../dto/update-specialty.dto';
import { Specialty } from '../entities/specialty.entity';
import { SpecialtiesRepository } from '../repositories/specialties.repository';

/** [G3] Catálogo de especialidades (FR-7). */
@Injectable()
export class SpecialtiesService {
  constructor(private readonly specialties: SpecialtiesRepository) {}

  findActive(): Promise<Specialty[]> {
    return this.specialties.findActive();
  }

  async findById(id: string): Promise<Specialty> {
    const specialty = await this.specialties.findById(id);
    if (!specialty) {
      throw new NotFoundException(`Especialidad ${id} no encontrada.`);
    }
    return specialty;
  }

  async create(dto: CreateSpecialtyDto): Promise<Specialty> {
    await this.assertNameIsFree(dto.name);
    return this.specialties.save(dto);
  }

  async update(id: string, dto: UpdateSpecialtyDto): Promise<Specialty> {
    const specialty = await this.findById(id);
    if (dto.name && dto.name !== specialty.name) {
      await this.assertNameIsFree(dto.name);
    }
    return this.specialties.save({ ...specialty, ...dto });
  }

  /**
   * Baja lógica: las citas guardan specialty_id sin FK, así que borrar la fila
   * dejaría el historial apuntando a una especialidad que ya no existe.
   */
  async deactivate(id: string): Promise<void> {
    const specialty = await this.findById(id);
    await this.specialties.save({ ...specialty, active: false });
  }

  private async assertNameIsFree(name: string): Promise<void> {
    if (await this.specialties.findByName(name)) {
      throw new ConflictException(`Ya existe la especialidad "${name}".`);
    }
  }
}
