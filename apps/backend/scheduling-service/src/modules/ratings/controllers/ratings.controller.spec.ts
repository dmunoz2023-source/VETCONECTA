import 'reflect-metadata';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { ROLES_KEY } from '@app/shared/decorators/roles.decorator';
import { JwtHeadersGuard } from '@app/shared/guards/jwt-headers.guard';
import { RolesGuard } from '@app/shared/guards/roles.guard';
import { RatingsController } from './ratings.controller';

const roles = (method: keyof RatingsController) =>
  Reflect.getMetadata(ROLES_KEY, RatingsController.prototype[method]);

describe('RatingsController [K2]', () => {
  it('todas las rutas exigen JWT (cabeceras del Gateway) y control de roles', () => {
    const guards = Reflect.getMetadata(GUARDS_METADATA, RatingsController);
    expect(guards).toEqual([JwtHeadersGuard, RolesGuard]);
  });

  it('solo el dueño califica una cita', () => {
    expect(roles('create')).toEqual(['owner']);
  });

  it('el personal clínico consulta las calificaciones', () => {
    expect(roles('findAll')).toEqual(['vet', 'reception', 'admin']);
  });

  it('solo el administrador ve el resumen', () => {
    expect(roles('summarize')).toEqual(['admin']);
  });
});
