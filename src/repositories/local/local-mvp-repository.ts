import { MVPRecord } from '@/types';
import { MVPRepository } from '../interfaces/mvp-repository';
import { browserStorage } from '@/lib/storage/browser-storage';
import { STORAGE_KEYS } from '@/constants';

export class LocalMVPRepository implements MVPRepository {
  getAll(): MVPRecord[] {
    return browserStorage.getItem<MVPRecord[]>(STORAGE_KEYS.MVP_RECORDS, []);
  }

  getByTournamentId(tournamentId: string): MVPRecord[] {
    const list = this.getAll();
    return list.filter((m) => m.tournamentId === tournamentId);
  }

  save(mvp: MVPRecord): void {
    const list = this.getAll();
    const index = list.findIndex((m) => m.id === mvp.id);
    if (index > -1) {
      list[index] = mvp;
    } else {
      list.push(mvp);
    }
    browserStorage.setItem(STORAGE_KEYS.MVP_RECORDS, list);
  }

  saveAll(mvps: MVPRecord[]): void {
    browserStorage.setItem(STORAGE_KEYS.MVP_RECORDS, mvps);
  }
}

export const localMVPRepository = new LocalMVPRepository();
export default localMVPRepository;
