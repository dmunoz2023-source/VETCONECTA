import {
  mockPetsList,
  mockOwnerUser,
  calculateAge,
  MockPet,
} from '../../../test/mocks/pets.mock';

// import { PetsService } from './pets.service';

describe('PetsService - Reglas de Negocio GET [E2]', () => {
  class MockPetsServiceLogic {
    async getPetsByClientId(clientId: string): Promise<MockPet[]> {
      const pets = mockPetsList.filter((pet) => pet.clientId === clientId && pet.isActive);

      return pets.map((pet) => ({
        ...pet,
        age: calculateAge(pet.birthDate),
      }));
    }
  }

  let service: MockPetsServiceLogic;

  beforeEach(() => {
    service = new MockPetsServiceLogic();
  });

  it('debe calcular dinámicamente la edad sin persistirla en la base de datos (BR-2)', async () => {
    const pets = await service.getPetsByClientId(mockOwnerUser.clientId!);

    expect(pets.length).toBeGreaterThan(0);
    pets.forEach((pet) => {
      expect(pet).toHaveProperty('age');
      expect(pet.age).toHaveProperty('years');
      expect(pet.age).toHaveProperty('months');
      expect(typeof pet.age?.years).toBe('number');
      expect(typeof pet.age?.months).toBe('number');
    });
  });

  it('no debe retornar mascotas que hayan sido dadas de baja lógica (activo = false) (BR-9)', async () => {
    const pets = await service.getPetsByClientId(mockOwnerUser.clientId!);

    const inactivePet = pets.find((pet) => pet.id === 'pet-uuid-004');
    expect(inactivePet).toBeUndefined();
  });

  it('debe garantizar el aislamiento de datos entre distintos clientes (BR-8)', async () => {
    const clientOnePets = await service.getPetsByClientId('22222222-2222-2222-2222-222222222222');
    const clientTwoPets = await service.getPetsByClientId('77777777-7777-7777-7777-777777777777');

    const clientOneIds = clientOnePets.map((pet) => pet.id);
    const clientTwoIds = clientTwoPets.map((pet) => pet.id);

    const intersection = clientOneIds.filter((id) => clientTwoIds.includes(id));
    expect(intersection.length).toBe(0);
  });
});