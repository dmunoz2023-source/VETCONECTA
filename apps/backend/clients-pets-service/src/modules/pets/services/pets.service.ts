import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PetEntity } from '../entities/pet.entity';

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
        activo: true,
      },
      order: {
        nombre: 'ASC',
      },
    });

    return pets.map((pet) => {
      const edad = this.calcularEdad(pet.fechaNacimiento);
      return {
        id: pet.id,
        nombre: pet.nombre,
        especie: pet.especie,
        raza: pet.raza,
        fechaNacimiento: pet.fechaNacimiento,
        edad,
        clientId: pet.clientId,
      };
    });
  }

  private calcularEdad(fechaNacimiento: Date): { anos: number; meses: number } {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);

    let anos = hoy.getFullYear() - nacimiento.getFullYear();
    let meses = hoy.getMonth() - nacimiento.getMonth();

    if (meses < 0 || (meses === 0 && hoy.getDate() < nacimiento.getDate())) {
      anos--;
      meses += 12;
    }

    if (hoy.getDate() < nacimiento.getDate()) {
      meses--;
      if (meses < 0) {
        meses = 11;
      }
    }

    return { anos, meses };
  }
}