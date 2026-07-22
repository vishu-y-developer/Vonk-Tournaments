import { PrizeDistributionRecord } from '@/types';
import { PrizeDistributionRepository } from '../interfaces/prize-distribution-repository';
import { browserStorage } from '@/lib/storage/browser-storage';
import { STORAGE_KEYS } from '@/constants';

export class LocalPrizeDistributionRepository implements PrizeDistributionRepository {
  getAll(): PrizeDistributionRecord[] {
    return browserStorage.getItem<PrizeDistributionRecord[]>(STORAGE_KEYS.PRIZE_DISTRIBUTIONS, []);
  }

  getByTournament(tournamentId: string): PrizeDistributionRecord | null {
    const list = this.getAll();
    return list.find((p) => p.tournamentId === tournamentId) || null;
  }

  save(record: PrizeDistributionRecord): void {
    const list = this.getAll();
    const idx = list.findIndex((p) => p.id === record.id || p.tournamentId === record.tournamentId);
    if (idx > -1) {
      list[idx] = record;
    } else {
      list.push(record);
    }
    browserStorage.setItem(STORAGE_KEYS.PRIZE_DISTRIBUTIONS, list);
  }

  saveAll(records: PrizeDistributionRecord[]): void {
    browserStorage.setItem(STORAGE_KEYS.PRIZE_DISTRIBUTIONS, records);
  }

  clear(): void {
    browserStorage.setItem(STORAGE_KEYS.PRIZE_DISTRIBUTIONS, []);
  }
}

export const localPrizeDistributionRepository = new LocalPrizeDistributionRepository();
