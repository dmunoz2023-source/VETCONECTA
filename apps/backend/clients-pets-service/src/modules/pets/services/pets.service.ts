import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pet } from '../entities/pet.entity';
import { CreatePetDto } from '../dto/create-pet.dto';
import { UpdatePetDto } from '../dto/update-pet.dto';
import { Client } from '../../clients/entities/client.entity'; // Ajusta esta ruta si tu entidad Client está en otra carpeta

@Injectable()
export class PetsService {
  constructor(
    @InjectRepository(Pet)
    private readonly petRepository: Repository<Pet>,
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>, // Necesario para validar BR-1
  ) {}

  // 1. Crear Mascota (POST /mascotas)
  async create(createPetDto: CreatePetDto): Promise<any> {
    // BR-1: Validar que el cliente exista en la base de datos
    const clientExists = await this.clientRepository.findOne({
      where: { id: createPetDto.clientId },
    });
    if (!clientExists) {
      throw new NotFoundException(`El cliente con ID ${createPetDto.clientId} no existe`);
    }

    // Validar que la fecha de nacimiento no sea una fecha futura
    if (createPetDto.birthDate && new Date(createPetDto.birthDate) > new Date()) {
      throw new BadRequestException('La fecha de nacimiento no puede ser una fecha futura');
    }

    const pet = this.petRepository.create(createPetDto);
    const savedPet = await this.petRepository.save(pet);

    return this.mapPetWithAge(savedPet);
  }

  // 2. Actualizar Mascota (PUT /mascotas/:id)
  async update(id: string, updatePetDto: UpdatePetDto): Promise<any> {
    const pet = await this.petRepository.findOne({ where: { id } });
    if (!pet) {
      throw new NotFoundException(`Mascota con ID ${id} no encontrada`);
    }

    // Si se envía un nuevo clientId, validar que el cliente exista (BR-1)
    if (updatePetDto.clientId) {
      const clientExists = await this.clientRepository.findOne({
        where: { id: updatePetDto.clientId },
      });
      if (!clientExists) {
        throw new NotFoundException(`El cliente con ID ${updatePetDto.clientId} no existe`);
      }
    }

    // Validar fecha futura si se proporciona
    if (updatePetDto.birthDate && new Date(updatePetDto.birthDate) > new Date()) {
      throw new BadRequestException('La fecha de nacimiento no puede ser una fecha futura');
    }

    Object.assign(pet, updatePetDto);
    const updatedPet = await this.petRepository.save(pet);

    return this.mapPetWithAge(updatedPet);
  }

  // BR-2: Método auxiliar para calcular la edad dinámicamente al responder
  private mapPetWithAge(pet: Pet) {
    let ageYears: number | null = null;
    if (pet.birthDate) {
      const birth = new Date(pet.birthDate);
      const today = new Date();
      ageYears = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        ageYears--;
      }
    }

    return {
      ...pet,
      age: ageYears, // Calculada al vuelo, no se persiste en la BD
    };
  }
}