import { IssueReport } from '@/types';

export interface IssueReportRepository {
  getAll(): IssueReport[];
  save(report: IssueReport): void;
  clear(): void;
}
