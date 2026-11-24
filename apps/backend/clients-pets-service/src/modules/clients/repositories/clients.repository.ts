import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client as ClientEntity } from '../entities/client.entity';
import { CreateClientDto } from '../dto/create-client.dto';
import { UpdateClientDto } from '../dto/update-client.dto';

@Injectable()
export class ClientsRepository {
  constructor(
    @InjectRepository(ClientEntity)
    private readonly repo: Repository<ClientEntity>,
  ) {}

  async findById(id: string): Promise<ClientEntity | null> {
    return this.repo.findOne({ where: { id, active: true } });
  }

  async findByUserId(userId: string): Promise<ClientEntity | null> {
    return this.repo.findOne({ where: { userId, active: true } });
  }

  async findByRut(rut: string): Promise<ClientEntity | null> {
    const cleanRut = rut.replace(/[\.\-]/g, '');
    return this.repo
      .createQueryBuilder('client')
      .where("REPLACE(REPLACE(client.rut, '.', ''), '-', '') = :cleanRut", { cleanRut })
      .andWhere('client.active = true')
      .getOne();
  }

  async findAll(options: { search?: string; page: number; limit: number }) {
    const { search, page, limit } = options;
    const skip = (page - 1) * limit;

    const queryBuilder = this.repo.createQueryBuilder('client');

    // Punto 3: Filtrar únicamente clientes activos (baja lógica)
    queryBuilder.where('client.active = :active', { active: true });

    if (search && search.trim()) {
      const cleanSearch = search.trim();
      const cleanRutSearch = cleanSearch.replace(/[\.\-]/g, '');

      // Punto 2: Búsqueda por RUT sin formato y por nombre completo concatenado
      queryBuilder.andWhere(
        `(
          client.rut ILIKE :search 
          OR REPLACE(REPLACE(client.rut, '.', ''), '-', '') ILIKE :cleanRutSearch
          OR client.firstName ILIKE :search 
          OR client.lastName ILIKE :search 
          OR CONCAT(client.firstName, ' ', client.lastName) ILIKE :search
          OR client.phone ILIKE :search
        )`,
        {
          search: `%${cleanSearch}%`,
          cleanRutSearch: `%${cleanRutSearch}%`,
        },
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

  async create(createClientDto: CreateClientDto): Promise<ClientEntity> {
    const client = this.repo.create(createClientDto);
    return this.repo.save(client);
  }

  async update(id: string, updateClientDto: Partial<UpdateClientDto>): Promise<ClientEntity | null> {
    await this.repo.update(id, updateClientDto);
    return this.findById(id);
  }
}