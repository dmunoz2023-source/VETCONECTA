import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from '../entities/client.entity';
import { CreateClientDto } from '../dto/create-client.dto';
import { UpdateClientDto } from '../dto/update-client.dto';

@Injectable()
export class ClientsRepository {
  constructor(
    @InjectRepository(Client)
    private readonly repo: Repository<Client>,
  ) {}

  async findById(id: string): Promise<Client | null> {
    return this.repo.findOne({ where: { id } });
  }

  async findByUserId(userId: string): Promise<Client | null> {
    return this.repo.findOne({ where: { userId } });
  }

  async findByRut(rut: string): Promise<Client | null> {
    return this.repo.findOne({ where: { rut } });
  }

  async findAll(options: { search?: string; page: number; limit: number }) {
    const { search, page, limit } = options;
    const skip = (page - 1) * limit;

    const queryBuilder = this.repo.createQueryBuilder('client');

    if (search) {
      queryBuilder.where(
        'client.rut ILIKE :search OR client.firstName ILIKE :search OR client.lastName ILIKE :search OR client.phone ILIKE :search',
        { search: `%${search}%` },
      );
    }

    const [data, total] = await queryBuilder
      .orderBy('client.lastName', 'ASC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async create(createClientDto: CreateClientDto): Promise<Client> {
    const client = this.repo.create(createClientDto);
    return this.repo.save(client);
  }

  async update(id: string, updateClientDto: Partial<UpdateClientDto>): Promise<Client | null> {
    await this.repo.update(id, updateClientDto);
    return this.findById(id);
  }
}