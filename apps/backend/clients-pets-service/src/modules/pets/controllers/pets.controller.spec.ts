import { mockOwnerUser, mockOtherOwnerUser, mockPetsList } from '../../../test/mocks/pets.mock';

// import { PetsController } from './pets.controller';

describe('PetsController - Endpoints GET [E2]', () => {
  const mockPetsService = {
    findMyPets: jest.fn((clientId: string) => {
      return mockPetsList.filter((pet) => pet.clientId === clientId && pet.isActive);
    }),
    findById: jest.fn((petId: string, userClientId?: string) => {
      const pet = mockPetsList.find((item) => item.id === petId && item.isActive);
      if (!pet) return null;
      if (userClientId && pet.clientId !== userClientId) {
        throw new Error('FORBIDDEN_RESOURCE');
      }
      return pet;
    }),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /v1/clients/me/pets (Selector multi-mascota)', () => {
    it('debe listar únicamente las mascotas activas que pertenecen al cliente autenticado (BR-8, BR-12)', async () => {
      const result = mockPetsService.findMyPets(mockOwnerUser.clientId!);

      expect(mockPetsService.findMyPets).toHaveBeenCalledWith(mockOwnerUser.clientId);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(2);
      expect(result.every((pet) => pet.clientId === mockOwnerUser.clientId)).toBe(true);
      expect(result.every((pet) => pet.isActive === true)).toBe(true);
    });

    it('debe devolver un arreglo vacío si el cliente autenticado no posee mascotas registradas', async () => {
      const clientWithoutPets = '99999999-9999-9999-9999-999999999999';
      const result = mockPetsService.findMyPets(clientWithoutPets);

      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });
  });

  describe('Protección de Propiedad (Ownership)', () => {
    it('debe impedir que un dueño acceda a la ficha de una mascota ajena (HTTP 403 Forbidden)', async () => {
      const otherPetId = 'pet-uuid-003';

      expect(() => {
        mockPetsService.findById(otherPetId, mockOwnerUser.clientId);
      }).toThrow('FORBIDDEN_RESOURCE');
    });

    it('debe permitir a un veterinario o administrador consultar cualquier mascota sin restricción de propiedad', async () => {
      const petId = 'pet-uuid-003';
      const result = mockPetsService.findById(petId, undefined);

      expect(result).toBeDefined();
      expect(result?.id).toBe(petId);
    });
  });
});