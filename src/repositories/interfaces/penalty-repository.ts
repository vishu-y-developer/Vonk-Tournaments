import { ResultPenalty } from '@/types';

export interface PenaltyRepository {
  getAll(): ResultPenalty[];
  getByResultId(resultId: string): ResultPenalty[];
  save(penalty: ResultPenalty): void;
  saveAll(penalties: ResultPenalty[]): void;
}
