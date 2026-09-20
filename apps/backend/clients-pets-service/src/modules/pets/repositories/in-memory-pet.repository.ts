import { PetEntity } from '../entities/pet.entity';

type PetFindOptions = {
  where?: {
    clientId?: string;
    activo?: boolean;
  };
  order?: {
    nombre?: 'ASC' | 'DESC';
  };
};

export class InMemoryPetRepository {
  private readonly pets: PetEntity[] = [
    {
      id: 'pet-demo-001',
      clientId: 'client-demo-001',
      nombre: 'Luna',
      especie: 'Perro',
      raza: 'Mestiza',
      fechaNacimiento: new Date('2021-05-15'),
      activo: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  async find(options: PetFindOptions = {}): Promise<PetEntity[]> {
    const filteredPets = this.pets.filter((pet) => {
      const matchesClient = !options.where?.clientId || pet.clientId === options.where.clientId;
      const matchesStatus = options.where?.activo === undefined || pet.activo === options.where.activo;
      return matchesClient && matchesStatus;
    });

    if (options.order?.nombre === 'ASC') {
      filteredPets.sort((firstPet, secondPet) => firstPet.nombre.localeCompare(secondPet.nombre));
    }

    return filteredPets;
  }
}