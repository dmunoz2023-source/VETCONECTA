import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VetBlock } from '../entities/vet-block.entity';

/** [G3] Capa de persistencia de scheduling.vet_blocks. */
@Injectable()
export class VetBlocksRepository {
  constructor(
    @InjectRepository(VetBlock)
    private readonly repo: Repository<VetBlock>,
  ) {}

  findByVet(vetUserId: string, from?: string, to?: string): Promise<VetBlock[]> {
    const query = this.repo
      .createQueryBuilder('block')
      .where('block.vetUserId = :vetUserId', { vetUserId })
      .orderBy('block.date', 'ASC')
      .addOrderBy('block.startTime', 'ASC');

    if (from) {
      query.andWhere('block.date >= :from', { from });
    }
    if (to) {
      query.andWhere('block.date <= :to', { to });
    }
    return query.getMany();
  }

  findOne(vetUserId: string, id: string): Promise<VetBlock | null> {
    return this.repo.findOne({ where: { id, vetUserId } });
  }

  save(block: Partial<VetBlock>): Promise<VetBlock> {
    return this.repo.save(this.repo.create(block));
  }

  async remove(id: string): Promise<void> {
    await this.repo.delete({ id });
  }
}
