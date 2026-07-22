import { PlatformReport } from '@/types';
import { ReportRepository } from '../interfaces/report-repository';
import { browserStorage } from '@/lib/storage/browser-storage';
import { STORAGE_KEYS } from '@/constants';

export class LocalReportRepository implements ReportRepository {
  getAll(): PlatformReport[] {
    return browserStorage.getItem<PlatformReport[]>(STORAGE_KEYS.REPORTS, []);
  }

  getById(id: string): PlatformReport | null {
    const reports = this.getAll();
    return reports.find((r) => r.id === id) || null;
  }

  save(report: PlatformReport): void {
    const reports = this.getAll();
    const idx = reports.findIndex((r) => r.id === report.id);
    if (idx > -1) {
      reports[idx] = report;
    } else {
      reports.unshift(report);
    }
    browserStorage.setItem(STORAGE_KEYS.REPORTS, reports);
  }

  saveAll(reports: PlatformReport[]): void {
    browserStorage.setItem(STORAGE_KEYS.REPORTS, reports);
  }

  clear(): void {
    browserStorage.setItem(STORAGE_KEYS.REPORTS, []);
  }
}

export const localReportRepository = new LocalReportRepository();
