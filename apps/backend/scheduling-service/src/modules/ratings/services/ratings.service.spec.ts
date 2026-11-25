import { BadRequestException, ServiceUnavailableException } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { JwtPayload } from '@app/shared/types/jwt-payload.interface';
import { Appointment } from '../../appointments/entities/appointment.entity';
import { AppointmentsRepository } from '../../appointments/repositories/appointments.repository';
import { RatingsRepository } from '../../appointments/repositories/ratings.repository';
import { PetOwnerCheck } from '../clients/pet-owner.check';
import { RatingsService } from './ratings.service';

const APPOINTMENT_ID = '7c9e6679-7425-40de-944b-e07fc1f90ae7';
const PET_ID = 'aaaaaaaa-0000-4000-8000-000000000001';
const CLIENT_ID = 'cccccccc-0000-4000-8000-000000000001';
const VET_ID = '55555555-5555-5555-5555-5555555555a1';

const owner: JwtPayload = {
  sub: '55555555-5555-5555-5555-555555555553',
  email: 'dueno@vetconecta.cl',
  role: 'owner',
};

function appointment(status: Appointment['status'] = 'completed'): Appointment {
  return { id: APPOINTMENT_ID, petId: PET_ID, clientId: CLIENT_ID, vetUserId: VET_ID, status } as Appointment;
}

function uniqueViolation(): QueryFailedError {
  return new QueryFailedError('INSERT', [], Object.assign(new Error('duplicate'), { code: '23505' }));
}

describe('RatingsService [K2]', () => {
  let appointments: { findById: jest.Mock };
  let ratings: {
    findByAppointmentId: jest.Mock;
    create: jest.Mock;
    findPage: jest.Mock;
    countByStars: jest.Mock;
  };
  let petOwner: { isOwner: jest.Mock };
  let service: RatingsService;

  beforeEach(() => {
    appointments = { findById: jest.fn().mockResolvedValue(appointment()) };
    ratings = {
      findByAppointmentId: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockImplementation(async (data) => ({
        id: 'rating-1',
        createdAt: new Date('2026-11-25T15:30:00Z'),
        ...data,
      })),
      findPage: jest.fn().mockResolvedValue([[], 0]),
      countByStars: jest.fn().mockResolvedValue([]),
    };
    petOwner = { isOwner: jest.fn().mockResolvedValue(true) };
    service = new RatingsService(
      appointments as unknown as AppointmentsRepository,
      ratings as unknown as RatingsRepository,
      petOwner as unknown as PetOwnerCheck,
    );
  });

  describe('create', () => {
    it('registra la calificación de una cita realizada del dueño', async () => {
      const result = await service.create(owner, APPOINTMENT_ID, { stars: 5, comment: 'Excelente' });

      expect(petOwner.isOwner).toHaveBeenCalledWith(PET_ID, owner.sub);
      expect(ratings.create).toHaveBeenCalledWith({
        appointmentId: APPOINTMENT_ID,
        clientId: CLIENT_ID,
        stars: 5,
        comment: 'Excelente',
      });
      expect(result).toEqual({
        id: 'rating-1',
        appointmentId: APPOINTMENT_ID,
        stars: 5,
        comment: 'Excelente',
        createdAt: new Date('2026-11-25T15:30:00Z'),
      });
    });

    it('guarda null cuando no hay comentario', async () => {
      await service.create(owner, APPOINTMENT_ID, { stars: 3 });

      expect(ratings.create).toHaveBeenCalledWith(expect.objectContaining({ stars: 3, comment: null }));
    });

    it('404 si la cita no existe', async () => {
      appointments.findById.mockResolvedValue(null);

      await expect(service.create(owner, APPOINTMENT_ID, { stars: 5 })).rejects.toMatchObject({
        status: 404,
      });
      expect(ratings.create).not.toHaveBeenCalled();
    });

    it('403 si la cita no es del dueño autenticado', async () => {
      petOwner.isOwner.mockResolvedValue(false);

      await expect(service.create(owner, APPOINTMENT_ID, { stars: 5 })).rejects.toMatchObject({
        status: 403,
      });
      expect(ratings.create).not.toHaveBeenCalled();
    });

    it.each(['booked', 'confirmed', 'cancelled', 'no_show'] as const)(
      '422 si la cita está en estado %s (no realizada)',
      async (status) => {
        appointments.findById.mockResolvedValue(appointment(status));

        await expect(service.create(owner, APPOINTMENT_ID, { stars: 5 })).rejects.toMatchObject({
          status: 422,
          response: { error: 'APPOINTMENT_NOT_COMPLETED' },
        });
        expect(ratings.create).not.toHaveBeenCalled();
      },
    );

    it('409 si la cita ya tiene calificación', async () => {
      ratings.findByAppointmentId.mockResolvedValue({ id: 'previa' });

      await expect(service.create(owner, APPOINTMENT_ID, { stars: 4 })).rejects.toMatchObject({
        status: 409,
        response: { error: 'RATING_ALREADY_EXISTS' },
      });
      expect(ratings.create).not.toHaveBeenCalled();
    });

    it('409 si dos peticiones simultáneas chocan con el UNIQUE de appointment_id', async () => {
      ratings.create.mockRejectedValue(uniqueViolation());

      await expect(service.create(owner, APPOINTMENT_ID, { stars: 4 })).rejects.toMatchObject({
        status: 409,
        response: { error: 'RATING_ALREADY_EXISTS' },
      });
    });

    it('propaga otros errores de base de datos sin convertirlos', async () => {
      const boom = new Error('conexión perdida');
      ratings.create.mockRejectedValue(boom);

      await expect(service.create(owner, APPOINTMENT_ID, { stars: 4 })).rejects.toBe(boom);
    });

    it('propaga el 503 si clients-pets no responde', async () => {
      petOwner.isOwner.mockRejectedValue(new ServiceUnavailableException());

      await expect(service.create(owner, APPOINTMENT_ID, { stars: 5 })).rejects.toMatchObject({
        status: 503,
      });
      expect(ratings.create).not.toHaveBeenCalled();
    });

    it('comprueba al dueño antes que el estado, para no revelar citas ajenas', async () => {
      petOwner.isOwner.mockResolvedValue(false);
      appointments.findById.mockResolvedValue(appointment('booked'));

      await expect(service.create(owner, APPOINTMENT_ID, { stars: 5 })).rejects.toMatchObject({
        status: 403,
      });
    });
  });

  describe('findAll', () => {
    it('devuelve data y meta con el total de páginas', async () => {
      ratings.findPage.mockResolvedValue([[{ id: 'r1' }, { id: 'r2' }], 25]);

      const result = await service.findAll({ page: 2, limit: 10 });

      expect(ratings.findPage).toHaveBeenCalledWith(
        { vetUserId: undefined, from: undefined, toExclusive: undefined },
        2,
        10,
      );
      expect(result).toEqual({
        data: [{ id: 'r1' }, { id: 'r2' }],
        meta: { total: 25, page: 2, limit: 10, totalPages: 3 },
      });
    });

    it('totalPages es 0 cuando no hay resultados', async () => {
      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.meta).toEqual({ total: 0, page: 1, limit: 10, totalPages: 0 });
    });

    it('pasa el veterinario y convierte un "to" sin hora en el día completo', async () => {
      await service.findAll({ page: 1, limit: 10, vetUserId: VET_ID, from: '2026-11-01', to: '2026-11-30' });

      expect(ratings.findPage).toHaveBeenCalledWith(
        {
          vetUserId: VET_ID,
          from: new Date('2026-11-01T00:00:00Z'),
          toExclusive: new Date('2026-12-01T00:00:00Z'),
        },
        1,
        10,
      );
    });

    it('un "to" con hora es inclusivo hasta ese instante', async () => {
      await service.findAll({ page: 1, limit: 10, to: '2026-11-30T12:00:00Z' });

      const [filters] = ratings.findPage.mock.calls[0];
      expect(filters.toExclusive).toEqual(new Date('2026-11-30T12:00:00.001Z'));
    });

    it('400 si from es posterior a to', async () => {
      await expect(
        service.findAll({ page: 1, limit: 10, from: '2026-12-01', to: '2026-11-01' }),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(ratings.findPage).not.toHaveBeenCalled();
    });

    it('acepta from igual a to (un solo día)', async () => {
      await expect(
        service.findAll({ page: 1, limit: 10, from: '2026-11-15', to: '2026-11-15' }),
      ).resolves.toBeDefined();
    });

    it('400 si la fecha no se puede interpretar', async () => {
      await expect(service.findAll({ page: 1, limit: 10, from: '2026-13-45' })).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });
  });

  describe('summarize', () => {
    it('sin calificaciones: average null, total 0 y distribución en ceros', async () => {
      await expect(service.summarize({})).resolves.toEqual({
        average: null,
        total: 0,
        distribution: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 },
      });
    });

    it('calcula promedio y distribución a partir de los conteos', async () => {
      ratings.countByStars.mockResolvedValue([
        { stars: 5, count: 2 },
        { stars: 3, count: 1 },
      ]);

      await expect(service.summarize({})).resolves.toEqual({
        average: 4.33,
        total: 3,
        distribution: { '1': 0, '2': 0, '3': 1, '4': 0, '5': 2 },
      });
    });

    it('el promedio exacto no se altera', async () => {
      ratings.countByStars.mockResolvedValue([
        { stars: 4, count: 2 },
        { stars: 5, count: 2 },
      ]);

      expect((await service.summarize({})).average).toBe(4.5);
    });

    it('aplica los mismos filtros que el listado', async () => {
      await service.summarize({ vetUserId: VET_ID, from: '2026-11-01', to: '2026-11-30' });

      expect(ratings.countByStars).toHaveBeenCalledWith({
        vetUserId: VET_ID,
        from: new Date('2026-11-01T00:00:00Z'),
        toExclusive: new Date('2026-12-01T00:00:00Z'),
      });
    });
  });
});
