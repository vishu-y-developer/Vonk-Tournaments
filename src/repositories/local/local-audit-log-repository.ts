import { AdminAuditLog } from '@/types';
import { AuditLogRepository } from '../interfaces/audit-log-repository';
import { browserStorage } from '@/lib/storage/browser-storage';
import { STORAGE_KEYS } from '@/constants';

export class LocalAuditLogRepository implements AuditLogRepository {
  getAll(): AdminAuditLog[] {
    return browserStorage.getItem<AdminAuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, []);
  }

  save(log: AdminAuditLog): void {
    const logs = this.getAll();
    logs.unshift(log); // newest first
    browserStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, logs);
  }

  saveAll(logs: AdminAuditLog[]): void {
    browserStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, logs);
  }

  clear(): void {
    browserStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, []);
  }
}

export const localAuditLogRepository = new LocalAuditLogRepository();
