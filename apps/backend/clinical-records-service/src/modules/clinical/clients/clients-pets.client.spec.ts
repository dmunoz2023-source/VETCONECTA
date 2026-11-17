import {
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { of, throwError } from 'rxjs';
import { ClientsPetsClient } from './clients-pets.client';

const PET_ID = '11111111-1111-4111-8111-111111111111';
const USER_ID = '33333333-3333-4333-8333-333333333331';

describe('ClientsPetsClient [F2]', () => {
  const http = { get: jest.fn() };
  let config: Record<string, string | undefined>;
  let client: ClientsPetsClient;

  const respondWith = (status: number) => http.get.mockReturnValue(of({ status, data: {} }));

  beforeEach(() => {
    jest.resetAllMocks();
    config = { internalApiKey: 'k-test', clientsServiceUrl: 'http://clients:3002/' };
    const configService = { get: jest.fn((key: string) => config[key]) };
    respondWith(200);
    client = new ClientsPetsClient(
      http as unknown as HttpService,
      configService as unknown as ConfigService,
    );
  });

  describe('assertPetExists', () => {
    it('mascota existente: consulta la URL interna con la clave y no lanza error', async () => {
      await expect(client.assertPetExists(PET_ID)).resolves.toBeUndefined();

      expect(http.get).toHaveBeenCalledWith(
        `http://clients:3002/internal/pets/${PET_ID}`,
        expect.objectContaining({ headers: { 'X-Internal-Key': 'k-test' } }),
      );
    });

    it('mascota inexistente (404) -> NotFoundException', async () => {
      respondWith(404);
      await expect(client.assertPetExists(PET_ID)).rejects.toThrow(NotFoundException);
    });

    it('error del servicio de clientes (500) -> 503', async () => {
      respondWith(500);
      await expect(client.assertPetExists(PET_ID)).rejects.toThrow(ServiceUnavailableException);
    });

    it('sin conexion con el servicio de clientes -> 503', async () => {
      http.get.mockReturnValue(throwError(() => new Error('ECONNREFUSED')));
      await expect(client.assertPetExists(PET_ID)).rejects.toThrow(ServiceUnavailableException);
    });

    it('sin clave interna configurada -> 500 y no se llama al servicio', async () => {
      config = {};
      await expect(client.assertPetExists(PET_ID)).rejects.toThrow(InternalServerErrorException);
      expect(http.get).not.toHaveBeenCalled();
    });

    it('acepta INTERNAL_KEY como alternativa y usa localhost si no hay URL configurada', async () => {
      config = { INTERNAL_KEY: 'k-alt' };

      await client.assertPetExists(PET_ID);

      expect(http.get).toHaveBeenCalledWith(
        `http://localhost:3002/internal/pets/${PET_ID}`,
        expect.objectContaining({ headers: { 'X-Internal-Key': 'k-alt' } }),
      );
    });

    it('codifica el id para evitar rutas manipuladas', async () => {
      await client.assertPetExists('a/b');

      expect(http.get).toHaveBeenCalledWith('http://clients:3002/internal/pets/a%2Fb', expect.any(Object));
    });
  });

  describe('assertPetOwnership', () => {
    it('el dueño es de la mascota: consulta la ruta de propiedad y no lanza error', async () => {
      await expect(client.assertPetOwnership(PET_ID, USER_ID)).resolves.toBeUndefined();

      expect(http.get).toHaveBeenCalledWith(
        `http://clients:3002/internal/pets/${PET_ID}/owner/${USER_ID}`,
        expect.any(Object),
      );
    });

    it('la mascota no es del dueño (404) -> 403 (BR-8)', async () => {
      respondWith(404);
      await expect(client.assertPetOwnership(PET_ID, USER_ID)).rejects.toThrow(ForbiddenException);
    });

    it('error del servicio de clientes -> 503', async () => {
      respondWith(500);
      await expect(client.assertPetOwnership(PET_ID, USER_ID)).rejects.toThrow(ServiceUnavailableException);
    });

    it('sin conexion -> 503', async () => {
      http.get.mockReturnValue(throwError(() => new Error('timeout')));
      await expect(client.assertPetOwnership(PET_ID, USER_ID)).rejects.toThrow(ServiceUnavailableException);
    });
  });
});
