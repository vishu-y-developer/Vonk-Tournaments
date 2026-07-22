import { IssueReport } from '@/types';
import { IssueReportRepository } from '../interfaces/issue-report-repository';
import { browserStorage } from '@/lib/storage/browser-storage';
import { STORAGE_KEYS } from '@/constants';

export class LocalIssueReportRepository implements IssueReportRepository {
  getAll(): IssueReport[] {
    return browserStorage.getItem<IssueReport[]>(STORAGE_KEYS.ISSUE_REPORTS, []);
  }

  save(report: IssueReport): void {
    const reports = this.getAll();
    reports.unshift(report);
    browserStorage.setItem(STORAGE_KEYS.ISSUE_REPORTS, reports);
  }

  clear(): void {
    browserStorage.setItem(STORAGE_KEYS.ISSUE_REPORTS, []);
  }
}

export const localIssueReportRepository = new LocalIssueReportRepository();
