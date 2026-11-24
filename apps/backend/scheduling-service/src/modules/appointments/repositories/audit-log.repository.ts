import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { AuditLog } from '../entities/audit-log.entity';

export interface AuditEntry {
  actorUserId: string;
  action: string;
  entityId: string;
  data?: Record<string, unknown>;
}

/**
 * [G2] Registra en scheduling.audit_log. Recibe el EntityManager de la
 * transaccion en curso para que la auditoria se confirme (o se revierta)
 * junto con el cambio que describe.
 */
@Injectable()
export class AuditLogRepository {
  constructor(
    @InjectRepository(AuditLog)
    private readonly repo: Repository<AuditLog>,
  ) {}

  record(entry: AuditEntry, manager: EntityManager = this.repo.manager): Promise<AuditLog> {
    const logs = manager.getRepository(AuditLog);
    return logs.save(logs.create({ ...entry, data: entry.data ?? null }));
  }
}
