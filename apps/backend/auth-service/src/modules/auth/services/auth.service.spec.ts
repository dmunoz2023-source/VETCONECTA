import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { of } from 'rxjs';
import * as bcrypt from 'bcrypt';

// 1. Mocks de librerías externas para evitar errores en Jest
jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => {},
  getRepositoryToken: () => 'UserRepositoryToken',
}));

jest.mock('@nestjs/axios', () => ({
  HttpService: class {},
}));

jest.mock('bcrypt');

import { AuthService } from './auth.service';
import { UserRole } from '../entities/user.entity';

describe('AuthService (Pruebas Unitarias [E1])', () => {
  let service: AuthService;
  let userRepository: any;
  let configService: any;
  let httpService: any;
  let jwtService: any; // <-- 1. Declarar mock de jwtService

  const mockUser = {
    id: 'uuid-1234',
    email: 'test@vetconecta.cl',
    passwordHash: 'hashed_password',
    role: UserRole.OWNER,
    status: 'active',
    lastLoginAt: null,
  };

  beforeEach(() => {
    userRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    configService = {
      get: jest.fn().mockReturnValue('http://mock-clients-service-url'),
    };

    httpService = {
      get: jest.fn(),
    };

    // 2. Mockear el método .sign() para que emita un token simulado
    jwtService = {
      sign: jest.fn().mockReturnValue('mock_jwt_token'),
    };

    // 3. Pasar jwtService como 4to argumento
    service = new AuthService(
      userRepository,
      configService,
      httpService,
      jwtService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('debe registrar un usuario exitosamente omitiendo la contraseña en el retorno', async () => {
      userRepository.findOne.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');

      const newUser = { ...mockUser };
      userRepository.create.mockReturnValue(newUser);
      userRepository.save.mockResolvedValue(newUser);

      const result = await service.register({
        email: 'test@vetconecta.cl',
        password: 'password123',
      });

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@vetconecta.cl' },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 12);
      expect(userRepository.save).toHaveBeenCalledWith(newUser);
      expect(result).not.toHaveProperty('passwordHash');
      expect(result.email).toBe('test@vetconecta.cl');
    });

    it('debe lanzar ConflictException si el correo ya está registrado', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);

      await expect(
        service.register({ email: 'test@vetconecta.cl', password: 'password123' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('debe iniciar sesión exitosamente con correo electrónico y generar accessToken', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      userRepository.save.mockResolvedValue({ ...mockUser, lastLoginAt: new Date() });

      const result = await service.login({
        identifier: 'test@vetconecta.cl',
        password: 'password123',
      });

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@vetconecta.cl' },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashed_password');
      expect(userRepository.save).toHaveBeenCalled();
      expect(jwtService.sign).toHaveBeenCalled();
      expect(result).toHaveProperty('accessToken', 'mock_jwt_token');
      expect(result).not.toHaveProperty('passwordHash');
    });

    it('debe iniciar sesión exitosamente con RUT mediante HttpService', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      httpService.get.mockReturnValue(of({ data: { user_id: 'uuid-1234' } }));
      userRepository.save.mockResolvedValue(mockUser);

      const result = await service.login({
        identifier: '12345678-9',
        password: 'password123',
      });

      expect(httpService.get).toHaveBeenCalledWith(
        'http://mock-clients-service-url/v1/clients/id/12345678-9',
      );
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'uuid-1234' },
      });
      expect(jwtService.sign).toHaveBeenCalled();
      expect(result).toHaveProperty('accessToken', 'mock_jwt_token');
    });

    it('debe lanzar UnauthorizedException si la contraseña es incorrecta', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({ identifier: 'test@vetconecta.cl', password: 'wrongpassword' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('debe lanzar UnauthorizedException si el usuario no existe', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(
        service.login({ identifier: 'notfound@vetconecta.cl', password: 'password123' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});