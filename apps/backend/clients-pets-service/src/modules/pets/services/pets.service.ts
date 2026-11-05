import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PetEntity } from '../entities/pet.entity';
import { calculateAge } from '../age-calculator.util';

@Injectable()
export class PetsService {
  constructor(
    @InjectRepository(PetEntity)
    private readonly petRepository: Repository<PetEntity>,
  ) {}

  async findByClientId(clientId: string) {
    const pets = await this.petRepository.find({
      where: {
        clientId: clientId,
        active: true,
      },
      order: {
        name: 'ASC', // Usamos "name" según tu PetEntity
      },
    });

    return pets.map((pet) => {
      const ageInfo = calculateAge(pet.birthDate);

      return {
        id: pet.id,
        name: pet.name,
        species: pet.species,
        breed: pet.breed,
        sex: pet.sex,
        birthDate: pet.birthDate,
        color: pet.color,
        microchip: pet.microchip,
        photoUrl: pet.photoUrl,
        age: ageInfo, // Devuelve el objeto con la edad o null si no tiene fecha
        clientId: pet.clientId,
      };
    });
  }
}