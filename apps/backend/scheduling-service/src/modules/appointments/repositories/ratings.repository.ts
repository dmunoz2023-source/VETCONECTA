import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rating } from '../entities/rating.entity';

/** [A3] Repositorio tipado de scheduling.ratings (BR-13, tarea futura). */
@Injectable()
export class RatingsRepository {
  constructor(
    @InjectRepository(Rating)
    private readonly repo: Repository<Rating>,
  ) {}

  findByAppointmentId(appointmentId: string): Promise<Rating | null> {
    return this.repo.findOne({ where: { appointmentId } });
  }
}
