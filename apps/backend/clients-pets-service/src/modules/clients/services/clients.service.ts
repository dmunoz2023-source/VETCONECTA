import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { JwtPayload } from '@app/shared/types/jwt-payload.interface';
import { ClientsRepository } from '../repositories/clients.repository';
import { PetsService } from '../../pets/services/pets.service';

@Injectable()
export class ClientsService {
  constructor(
    private readonly clientsRepository: ClientsRepository,
    @Inject(forwardRef(() => PetsService))
    private readonly petsService: PetsService,
  ) {}

  /**
   * GET /v1/clients/:id (FR-5)
   * Ficha del cliente junto con sus mascotas asociadas.
   */
  async findById(clientId: string) {
    const client = await this.clientsRepository.findById(clientId);

    if (!client) {
      throw new NotFoundException(
        `El cliente con ID ${clientId} no fue encontrado.`,
      );
    }

    const pets = await this.petsService.findByClientId(clientId);

    return {
      ...client,
      pets,
    };
  }

  /**
   * GET /v1/clients/me (FR-14)
   * Perfil del dueño autenticado.
   */
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
   * GET /v1/clients/me/pets (FR-11, BR-8, BR-12)
   * Mascotas pertenecientes al dueño autenticado.
   */
  async getMyPets(user: JwtPayload) {
    const clientId = await this.resolveClientId(user);
    return this.petsService.findByClientId(clientId);
  }

  /**
   * Método auxiliar para resolver el clientId desde las cabeceras JWT.
   */
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