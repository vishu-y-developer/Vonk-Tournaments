import { AdminAuditLog } from '@/types';

export interface AuditLogRepository {
  getAll(): AdminAuditLog[];
  save(log: AdminAuditLog): void;
  saveAll(logs: AdminAuditLog[]): void;
  clear(): void;
}
