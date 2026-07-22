import { ResultPenalty } from '@/types';
import { PenaltyRepository } from '../interfaces/penalty-repository';
import { browserStorage } from '@/lib/storage/browser-storage';
import { STORAGE_KEYS } from '@/constants';

export class LocalPenaltyRepository implements PenaltyRepository {
  getAll(): ResultPenalty[] {
    return browserStorage.getItem<ResultPenalty[]>(STORAGE_KEYS.RESULT_PENALTIES, []);
  }

  getByResultId(resultId: string): ResultPenalty[] {
    const list = this.getAll();
    return list.filter((p) => p.resultId === resultId);
  }

  save(penalty: ResultPenalty): void {
    const list = this.getAll();
    const index = list.findIndex((p) => p.id === penalty.id);
    if (index > -1) {
      list[index] = penalty;
    } else {
      list.push(penalty);
    }
    browserStorage.setItem(STORAGE_KEYS.RESULT_PENALTIES, list);
  }

  saveAll(penalties: ResultPenalty[]): void {
    browserStorage.setItem(STORAGE_KEYS.RESULT_PENALTIES, penalties);
  }
}

export const localPenaltyRepository = new LocalPenaltyRepository();
export default localPenaltyRepository;
