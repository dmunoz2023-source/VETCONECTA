import { ClinicalEventEntity } from '../entities/clinical-event.entity';
import { ClinicalEventRepository } from '../repositories/clinical-event.repository';
import { ClientsPetsClient } from '../clients/clients-pets.client';
import { NotificationsClient } from '../clients/notifications.client';
import {
  ClinicalEventType,
  CreateClinicalEventDto,
} from '../dto/create-clinical-event.dto';
import { ClinicalEventService } from './clinical-event.service';

describe('ClinicalEventService', () => {
  const clinicalEventRepository = {
    save: jest.fn(),
  };
  const clientsPetsClient = {
    assertPetExists: jest.fn(),
    getPetOwnerId: jest.fn(),
  };
  const notificationsClient = {
    create: jest.fn(),
  };
  const service = new ClinicalEventService(
    clinicalEventRepository as unknown as ClinicalEventRepository,
    clientsPetsClient as unknown as ClientsPetsClient,
    notificationsClient as unknown as NotificationsClient,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates an unread notification for the owner when a vaccine is recorded', async () => {
    const petId = '11111111-1111-4111-8111-111111111111';
    const ownerUserId = '22222222-2222-4222-8222-222222222222';
    const veterinarianId = '33333333-3333-4333-8333-333333333333';
    const dto: CreateClinicalEventDto = {
      petId,
      type: ClinicalEventType.VACCINE,
      date: '2026-01-15T12:00:00.000Z',
      weightKg: 8,
      notes: 'Vacunación registrada.',
      vaccineName: 'Rabia',
      batch: 'BATCH-123',
      boosterDate: '2027-01-15',
    };
    const savedEvent = {
      id: '44444444-4444-4444-8444-444444444444',
    } as ClinicalEventEntity;
    clinicalEventRepository.save.mockResolvedValue(savedEvent);
    clientsPetsClient.getPetOwnerId.mockResolvedValue(ownerUserId);
    notificationsClient.create.mockResolvedValue(undefined);

    await expect(service.create(dto, veterinarianId)).resolves.toBe(savedEvent);

    expect(clientsPetsClient.getPetOwnerId).toHaveBeenCalledWith(petId);
    expect(clientsPetsClient.assertPetExists).not.toHaveBeenCalled();
    expect(notificationsClient.create).toHaveBeenCalledWith({
      userId: ownerUserId,
      petId,
      title: 'Próxima dosis de Rabia',
      body: 'La próxima dosis de Rabia está programada para el 2027-01-15.',
    });
  });

  it('does not create a notification for non-vaccine clinical events', async () => {
    const dto: CreateClinicalEventDto = {
      petId: '11111111-1111-4111-8111-111111111111',
      type: ClinicalEventType.CONSULTATION,
      date: '2026-01-15T12:00:00.000Z',
      weightKg: 8,
      notes: 'Consulta registrada.',
      diagnosis: 'Control general',
      nextCheckup: '2027-01-15',
    };
    const savedEvent = {
      id: '44444444-4444-4444-8444-444444444444',
    } as ClinicalEventEntity;
    clinicalEventRepository.save.mockResolvedValue(savedEvent);

    await expect(service.create(dto, '33333333-3333-4333-8333-333333333333'))
      .resolves.toBe(savedEvent);

    expect(clientsPetsClient.assertPetExists).toHaveBeenCalledWith(dto.petId);
    expect(clientsPetsClient.getPetOwnerId).not.toHaveBeenCalled();
    expect(notificationsClient.create).not.toHaveBeenCalled();
  });
});
