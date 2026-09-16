import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PetEntity } from '../entities/pet.entity';

@Injectable()
export class PetsService {
  constructor(
    @InjectRepository(PetEntity)
    private readonly petRepository: Repository<PetEntity>,
  ) {}

  /**
   * Obtiene las mascotas de un dueño autenticado (BR-8, BR-12)
   */
  async findByClientId(clientId: string) {
    const pets = await this.petRepository.find({
      where: {
        clientId: clientId, // BR-8, BR-12: Filtro estricto por el dueño
        activo: true,       // BR-9: Solo mascotas no eliminadas
      },
      order: {
        nombre: 'ASC',
      },
    });

    // Mapeamos para calcular dinámicamente la edad (BR-2)
    return pets.map((pet) => {
      const edadCalculada = this.calcularEdad(pet.fechaNacimiento);
      return {
        id: pet.id,
        nombre: pet.nombre,
        especie: pet.especie,
        raza: pet.raza,
        fechaNacimiento: pet.fechaNacimiento,
        edad: edadCalculada, // BR-2: Se entrega al vuelo, no se guarda en BD
        clientId: pet.clientId,
      };
    });
  }

  /**
   * Algoritmo auxiliar para calcular edad (BR-2)
   */
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