import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AppointmentsRepository } from '../../src/modules/appointments/repositories/appointments.repository';
import { Appointment } from '../../src/modules/appointments/entities/appointment.entity';

/**
 * [A3] Prueba de humo: confirma que findByClient arma el WHERE por
 * client_id, aplica el filtro de estado solo cuando se pide, y pagina.
 * No toca una base real — se mockea el QueryBuilder, como corresponde a
 * una prueba unitaria de la capa de repositorio.
 */
describe('AppointmentsRepository.findByClient', () => {
  let repository: AppointmentsRepository;
  let qb: any;

  beforeEach(async () => {
    qb = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        AppointmentsRepository,
        {
          provide: getRepositoryToken(Appointment),
          useValue: { createQueryBuilder: jest.fn().mockReturnValue(qb) },
        },
      ],
    }).compile();

    repository = moduleRef.get(AppointmentsRepository);
  });

  it('filtra siempre por client_id y pagina', async () => {
    await repository.findByClient('client-1', { page: 1, limit: 10 });

    expect(qb.where).toHaveBeenCalledWith('appointment.client_id = :clientId', {
      clientId: 'client-1',
    });
    expect(qb.skip).toHaveBeenCalledWith(0);
    expect(qb.take).toHaveBeenCalledWith(10);
    expect(qb.andWhere).not.toHaveBeenCalled();
  });

  it('agrega el filtro de estado solo si se envía', async () => {
    await repository.findByClient('client-1', {
      page: 2,
      limit: 5,
      estado: ['reservada', 'confirmada'],
    });

    expect(qb.skip).toHaveBeenCalledWith(5);
    expect(qb.andWhere).toHaveBeenCalledWith('appointment.estado IN (:...estado)', {
      estado: ['reservada', 'confirmada'],
    });
  });
});
