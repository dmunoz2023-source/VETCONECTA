import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientsRepository } from '../../clients/repositories/clients.repository';
import { CreatePetDto } from '../dto/create-pet.dto';
import { UpdatePetDto } from '../dto/update-pet.dto';
import { PetEntity } from '../entities/pet.entity';
import { calculateAge } from '../age-calculator.util';

@Injectable()
export class PetsService {
  constructor(
    @InjectRepository(PetEntity)
    private readonly petRepository: Repository<PetEntity>,
    @Inject(forwardRef(() => ClientsRepository))
    private readonly clientsRepository: ClientsRepository,
  ) {}

  async create(createPetDto: CreatePetDto) {
    const client = await this.clientsRepository.findById(createPetDto.clientId);
    if (!client) {
      throw new NotFoundException(
        `El cliente con ID ${createPetDto.clientId} no existe`,
      );
    }
    this.validateBirthDate(createPetDto.birthDate);
    const pet = this.petRepository.create(createPetDto);
    const savedPet = await this.petRepository.save(pet);
    return this.mapPetWithAge(savedPet);
  }

  async update(id: string, updatePetDto: UpdatePetDto) {
    const pet = await this.petRepository.findOne({ where: { id } });
    if (!pet) {
      throw new NotFoundException(`Mascota con ID ${id} no encontrada`);
    }
    if (updatePetDto.clientId) {
      const client = await this.clientsRepository.findById(updatePetDto.clientId);
      if (!client) {
        throw new NotFoundException(
          `El cliente con ID ${updatePetDto.clientId} no existe`,
        );
      }
    }
    if (updatePetDto.birthDate) {
      this.validateBirthDate(updatePetDto.birthDate);
    }
    Object.assign(pet, updatePetDto);
    const updatedPet = await this.petRepository.save(pet);
    return this.mapPetWithAge(updatedPet);
  }

  async findByClientId(clientId: string) {
    const pets = await this.petRepository.find({
      where: { clientId, active: true },
      order: { name: 'ASC' },
    });
    return pets.map((pet) => this.mapPetWithAge(pet));
  }

  async findByPetId(clientId: string, petId: string) {
    const pet = await this.petRepository.findOne({
      where: { id: petId, clientId, active: true },
    });
    if (!pet) {
      throw new NotFoundException(
        `Mascota con ID ${petId} no encontrada para el cliente indicado`,
      );
    }
    return this.mapPetWithAge(pet);
  }

  async findById(id: string) {
    const pet = await this.petRepository.findOne({
      where: { id, active: true },
    });
    if (!pet) {
      throw new NotFoundException(`Mascota con ID ${id} no encontrada`);
    }
    return this.mapPetWithAge(pet);
  }

  async findInternalById(id: string) {
    const pet = await this.petRepository.findOne({
      where: { id },
    });
    if (!pet) {
      throw new NotFoundException(`Mascota con ID ${id} no encontrada`);
    }
    return {
      id: pet.id,
      clientId: pet.clientId,
      name: pet.name,
      active: pet.active,
    };
  }

  async softDelete(id: string) {
    const pet = await this.petRepository.findOne({ where: { id } });
    if (!pet) {
      throw new NotFoundException(`Mascota con ID ${id} no encontrada`);
    }
    pet.active = false;
    await this.petRepository.save(pet);
    return { message: `La mascota con ID ${id} ha sido dada de baja lógicamente.` };
  }

  private validateBirthDate(birthDate: string): void {
    if (new Date(birthDate) > new Date()) {
      throw new BadRequestException(
        'La fecha de nacimiento no puede ser una fecha futura',
      );
    }
  }

  private mapPetWithAge(pet: PetEntity) {
    return {
      ...pet,
      age: calculateAge(pet.birthDate),
    };
  }
}