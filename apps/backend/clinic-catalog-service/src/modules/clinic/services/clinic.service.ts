import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Clinic } from '../entities/clinic.entity';

export type ClinicContact = Pick<Clinic, 'phone' | 'emergencyPhone' | 'whatsapp'>;

/** [G1] Contacto oficial de la clínica para el botón de emergencia (BR-11). */
@Injectable()
export class ClinicService {
  constructor(
    @InjectRepository(Clinic)
    private readonly clinics: Repository<Clinic>,
  ) {}

  async getContact(): Promise<ClinicContact> {
    const clinic = await this.clinics.findOne({ where: { id: 1 } });
    if (!clinic) {
      throw new NotFoundException('La clínica no está configurada.');
    }
    const { phone, emergencyPhone, whatsapp } = clinic;
    return { phone, emergencyPhone, whatsapp };
  }
}
