import { MatchResult } from '@/types';
import { ResultRepository } from '../interfaces/result-repository';
import { browserStorage } from '@/lib/storage/browser-storage';
import { STORAGE_KEYS } from '@/constants';

export class LocalResultRepository implements ResultRepository {
  getAll(): MatchResult[] {
    return browserStorage.getItem<MatchResult[]>(STORAGE_KEYS.RESULTS, []);
  }

  getByTournamentId(tournamentId: string): MatchResult | null {
    const list = this.getAll();
    return list.find((r) => r.tournamentId === tournamentId) || null;
  }

  save(result: MatchResult): void {
    const list = this.getAll();
    const index = list.findIndex((r) => r.id === result.id);
    if (index > -1) {
      list[index] = result;
    } else {
      list.push(result);
    }
    browserStorage.setItem(STORAGE_KEYS.RESULTS, list);
  }

  saveAll(results: MatchResult[]): void {
    browserStorage.setItem(STORAGE_KEYS.RESULTS, results);
  }
}

export const localResultRepository = new LocalResultRepository();
export default localResultRepository;
