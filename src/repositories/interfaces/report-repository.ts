import { PlatformReport } from '@/types';

export interface ReportRepository {
  getAll(): PlatformReport[];
  getById(id: string): PlatformReport | null;
  save(report: PlatformReport): void;
  saveAll(reports: PlatformReport[]): void;
  clear(): void;
}
