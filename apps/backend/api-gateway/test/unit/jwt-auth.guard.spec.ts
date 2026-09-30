import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from '../../src/auth/jwt-auth.guard';

type FakeRequest = {
  method: string;
  url: string;
  headers: Record<string, unknown>;
};

function makeContext(request: FakeRequest): ExecutionContext {
  return {
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
}

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let jwtService: { verify: jest.Mock };
  let configService: { get: jest.Mock };

  beforeEach(() => {
    jwtService = { verify: jest.fn() };
    configService = { get: jest.fn().mockReturnValue('secret_key') };
    guard = new JwtAuthGuard(jwtService as any, configService as any);
  });

  it('deja pasar rutas de la whitelist sin token', () => {
    const req: FakeRequest = { method: 'POST', url: '/v1/auth/login', headers: {} };

    expect(guard.canActivate(makeContext(req))).toBe(true);
    expect(jwtService.verify).not.toHaveBeenCalled();
  });

  it('rechaza rutas protegidas sin Bearer', () => {
    const req: FakeRequest = { method: 'GET', url: '/v1/citas', headers: {} };

    expect(() => guard.canActivate(makeContext(req))).toThrow(UnauthorizedException);
  });

  it('rechaza token invalido o expirado', () => {
    jwtService.verify.mockImplementation(() => {
      throw new Error('jwt expired');
    });
    const req: FakeRequest = {
      method: 'GET',
      url: '/v1/citas',
      headers: { authorization: 'Bearer token-malo' },
    };

    expect(() => guard.canActivate(makeContext(req))).toThrow(UnauthorizedException);
  });

  it('inyecta cabeceras confiables desde el JWT de un owner', () => {
    jwtService.verify.mockReturnValue({
      sub: 'user-1',
      email: 'dueno@vetconecta.cl',
      role: 'owner',
      clientId: 'client-1',
    });
    const req: FakeRequest = {
      method: 'GET',
      url: '/v1/citas',
      headers: { authorization: 'Bearer token-ok' },
    };

    guard.canActivate(makeContext(req));

    expect(req.headers['x-user-id']).toBe('user-1');
    expect(req.headers['x-user-role']).toBe('owner');
    expect(req.headers['x-client-id']).toBe('client-1');
  });

  it('ignora un X-Client-Id falso del cliente y usa el del JWT real', () => {
    jwtService.verify.mockReturnValue({
      sub: 'real-user',
      email: 'dueno@vetconecta.cl',
      role: 'owner',
      clientId: 'real-client',
    });
    const req: FakeRequest = {
      method: 'GET',
      url: '/v1/citas',
      headers: {
        authorization: 'Bearer token-ok',
        'x-user-id': 'HACKER',
        'x-user-role': 'admin',
        'x-client-id': 'CLIENTE-FALSO',
      },
    };

    guard.canActivate(makeContext(req));

    expect(req.headers['x-user-id']).toBe('real-user');
    expect(req.headers['x-user-role']).toBe('owner');
    expect(req.headers['x-client-id']).toBe('real-client');
  });

  it('no inyecta x-client-id para roles distintos de owner', () => {
    jwtService.verify.mockReturnValue({
      sub: 'vet-user',
      email: 'vet@vetconecta.cl',
      role: 'vet',
    });
    const req: FakeRequest = {
      method: 'GET',
      url: '/v1/citas',
      headers: { authorization: 'Bearer token-ok', 'x-client-id': 'CLIENTE-FALSO' },
    };

    guard.canActivate(makeContext(req));

    expect(req.headers['x-user-role']).toBe('vet');
    expect(req.headers['x-client-id']).toBeUndefined();
  });

  it('limpia cabeceras de identidad falsas aun en rutas publicas', () => {
    const req: FakeRequest = {
      method: 'POST',
      url: '/v1/auth/login',
      headers: {
        'x-user-id': 'HACKER',
        'x-user-role': 'admin',
        'x-client-id': 'CLIENTE-FALSO',
      },
    };

    guard.canActivate(makeContext(req));

    expect(req.headers['x-user-id']).toBeUndefined();
    expect(req.headers['x-user-role']).toBeUndefined();
    expect(req.headers['x-client-id']).toBeUndefined();
  });
});
