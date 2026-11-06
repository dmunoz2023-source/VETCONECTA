import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { JwtPayload } from '@app/shared/types/jwt-payload.interface';
import { ClientsRepository } from '../repositories/clients.repository';
import { CreateClientDto } from '../dto/create-client.dto';
import { UpdateClientDto } from '../dto/update-client.dto';
import { UpdateClientProfileDto } from '../dto/update-client-profile.dto';
import { PetsService } from '../../pets/services/pets.service';

@Injectable()
export class ClientsService {
  constructor(
    private readonly clientsRepository: ClientsRepository,
    @Inject(forwardRef(() => PetsService))
    private readonly petsService: PetsService,
  ) {}

  async findAll(search?: string, page = 1, limit = 10) {
    return this.clientsRepository.findAll({ search, page, limit });
  }

  async create(createClientDto: CreateClientDto) {
    const existingRut = await this.clientsRepository.findByRut(createClientDto.rut);
    if (existingRut) {
      throw new ConflictException(
        `El RUT ${createClientDto.rut} ya se encuentra registrado (UC-05 A1).`,
      );
    }
    return this.clientsRepository.create(createClientDto);
  }

  async findById(clientId: string) {
    const client = await this.clientsRepository.findById(clientId);
    if (!client) {
      throw new NotFoundException(
        `El cliente con ID ${clientId} no fue encontrado.`,
      );
    }
    const pets = await this.petsService.findByClientId(clientId);
    return { ...client, pets };
  }

  async update(clientId: string, updateClientDto: UpdateClientDto) {
    const client = await this.clientsRepository.findById(clientId);
    if (!client) {
      throw new NotFoundException(
        `El cliente con ID ${clientId} no fue encontrado.`,
      );
    }
    return this.clientsRepository.update(clientId, updateClientDto);
  }

  async getMyProfile(user: JwtPayload) {
    const clientId = await this.resolveClientId(user);
    const client = await this.clientsRepository.findById(clientId);
    if (!client) {
      throw new NotFoundException(
        'No se encontró la ficha del cliente asociado al usuario.',
      );
    }
    return client;
  }

  /**
    * PATCH /v1/clients/me (FR-14, BR-15)
    * Permite al dueño editar sus datos de contacto (email, phone, address, district),
    * bloqueando cualquier intento de alterar campos de identidad.
    */
  async updateMyProfile(
    user: JwtPayload,
    updateProfileDto: UpdateClientProfileDto,
  ) {
    // BR-15: Prohibir cualquier intento de modificar RUT, nombres o apellidos por el dueño
    if (
      updateProfileDto.rut ||
      updateProfileDto.nombres ||
      updateProfileDto.apellidos ||
      updateProfileDto.firstName ||
      updateProfileDto.lastName
    ) {
      throw new ForbiddenException(
        'No tienes permiso para modificar tu RUT, nombres o apellidos (BR-15).',
      );
    }

    const clientId = await this.resolveClientId(user);
    return this.clientsRepository.update(clientId, updateProfileDto);
  }

  async getMyPets(user: JwtPayload) {
    const clientId = await this.resolveClientId(user);
    return this.petsService.findByClientId(clientId);
  }

  async resolveClientId(user: JwtPayload): Promise<string> {
    const clientId =
      user.clientId ?? (await this.clientsRepository.findByUserId(user.sub))?.id;

    if (!clientId) {
      throw new UnauthorizedException(
        'El usuario autenticado no tiene un ID de cliente asociado.',
      );
    }

    return clientId;
  }
}