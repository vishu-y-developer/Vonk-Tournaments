import { ResultDispute } from '@/types';
import { DisputeRepository } from '../interfaces/dispute-repository';
import { browserStorage } from '@/lib/storage/browser-storage';
import { STORAGE_KEYS } from '@/constants';

export class LocalDisputeRepository implements DisputeRepository {
  getAll(): ResultDispute[] {
    return browserStorage.getItem<ResultDispute[]>(STORAGE_KEYS.RESULT_DISPUTES, []);
  }

  getByTournamentId(tournamentId: string): ResultDispute[] {
    const list = this.getAll();
    return list.filter((d) => d.tournamentId === tournamentId);
  }

  save(dispute: ResultDispute): void {
    const list = this.getAll();
    const index = list.findIndex((d) => d.id === dispute.id);
    if (index > -1) {
      list[index] = dispute;
    } else {
      list.push(dispute);
    }
    browserStorage.setItem(STORAGE_KEYS.RESULT_DISPUTES, list);
  }

  saveAll(disputes: ResultDispute[]): void {
    browserStorage.setItem(STORAGE_KEYS.RESULT_DISPUTES, disputes);
  }
}

export const localDisputeRepository = new LocalDisputeRepository();
export default localDisputeRepository;
