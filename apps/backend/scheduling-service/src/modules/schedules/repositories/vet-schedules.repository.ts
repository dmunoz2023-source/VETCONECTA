import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VetSchedule } from '../entities/vet-schedule.entity';

/** [G3] Capa de persistencia de scheduling.vet_schedules. */
@Injectable()
export class VetSchedulesRepository {
  constructor(
    @InjectRepository(VetSchedule)
    private readonly repo: Repository<VetSchedule>,
  ) {}

  findByVet(vetUserId: string): Promise<VetSchedule[]> {
    return this.repo.find({
      where: { vetUserId },
      order: { dayOfWeek: 'ASC', startTime: 'ASC' },
    });
  }

  findByVetAndDay(vetUserId: string, dayOfWeek: number): Promise<VetSchedule[]> {
    return this.repo.find({ where: { vetUserId, dayOfWeek }, order: { startTime: 'ASC' } });
  }

  findOne(vetUserId: string, id: string): Promise<VetSchedule | null> {
    return this.repo.findOne({ where: { id, vetUserId } });
  }

  save(schedule: Partial<VetSchedule>): Promise<VetSchedule> {
    return this.repo.save(this.repo.create(schedule));
  }

  async remove(id: string): Promise<void> {
    await this.repo.delete({ id });
  }
}
