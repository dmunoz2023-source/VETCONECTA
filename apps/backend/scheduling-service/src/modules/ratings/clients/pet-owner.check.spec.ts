import { HttpService } from '@nestjs/axios';
import { ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosError } from 'axios';
import { of, throwError } from 'rxjs';
import { HttpPetOwnerCheck } from './pet-owner.check';

const PET = 'aaaaaaaa-0000-4000-8000-000000000001';
const USER = '55555555-5555-5555-5555-555555555553';

function axiosError(status?: number): AxiosError {
  const error = new AxiosError('fallo');
  if (status) {
    error.response = { status } as AxiosError['response'];
  }
  return error;
}

describe('HttpPetOwnerCheck [K2]', () => {
  let http: { get: jest.Mock };
  let check: HttpPetOwnerCheck;

  beforeEach(() => {
    http = { get: jest.fn().mockReturnValue(of({ status: 200, data: {} })) };
    const config = {
      get: jest.fn((key: string) =>
        key === 'clientsServiceUrl' ? 'http://clients:3002' : 'clave-interna',
      ),
    };
    check = new HttpPetOwnerCheck(
      http as unknown as HttpService,
      config as unknown as ConfigService<never, true>,
    );
  });

  it('consulta GET /internal/pets/:id/owner/:userId con X-Internal-Key y timeout de 3 s', async () => {
    await check.isOwner(PET, USER);

    expect(http.get).toHaveBeenCalledWith(`http://clients:3002/internal/pets/${PET}/owner/${USER}`, {
      headers: { 'X-Internal-Key': 'clave-interna' },
      timeout: 3000,
    });
  });

  it('true cuando clients-pets responde 200', async () => {
    await expect(check.isOwner(PET, USER)).resolves.toBe(true);
  });

  it('false cuando clients-pets responde 404 (no es su mascota o no tiene cliente)', async () => {
    http.get.mockReturnValue(throwError(() => axiosError(404)));

    await expect(check.isOwner(PET, USER)).resolves.toBe(false);
  });

  it.each([500, 401, undefined])('503 cuando clients-pets falla (%s)', async (status) => {
    http.get.mockReturnValue(throwError(() => axiosError(status)));

    await expect(check.isOwner(PET, USER)).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});
