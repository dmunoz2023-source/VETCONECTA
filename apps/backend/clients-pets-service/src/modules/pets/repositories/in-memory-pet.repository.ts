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
/*error: Modificacion de nombres de entidad*/
export class InMemoryPetRepository {
  private readonly pets: PetEntity[] = [
    {
      id: 'pet-demo-001',
      clientId: 'client-demo-001',
      name: 'Luna',
      species: 'Perro',
      breed: 'Mestiza',
      sex: 'Hembra',
      birthDate: '2021-05-15',
      color: 'Negro con blanco',
      microchip: '985141000123456',
      photoUrl: 'https://example.com/photos/luna.jpg',
      active: true,
    },
    {
      id: 'pet-demo-002',
      clientId: 'client-demo-001',
      name: 'Milo',
      species: 'Gato',
      breed: null,
      sex: 'Macho',
      birthDate: null, // Ejemplo con fecha nula
      color: null,
      microchip: null,
      photoUrl: null,
      active: true,
    },
  ];

  async find(options: PetFindOptions = {}): Promise<PetEntity[]> {
    const filteredPets = this.pets.filter((pet) => {
      const matchesClient = !options.where?.clientId || pet.clientId === options.where.clientId;
      const matchesStatus = options.where?.activo === undefined || pet.active === options.where.activo;
      return matchesClient && matchesStatus;
    });

    if (options.order?.nombre === 'ASC') {
      filteredPets.sort((firstPet, secondPet) => firstPet.name.localeCompare(secondPet.name));
    }

    return filteredPets;
  }
}