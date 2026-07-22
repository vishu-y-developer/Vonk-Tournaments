import { PrizeDistributionRecord } from '@/types';

export interface PrizeDistributionRepository {
  getAll(): PrizeDistributionRecord[];
  getByTournament(tournamentId: string): PrizeDistributionRecord | null;
  save(record: PrizeDistributionRecord): void;
  saveAll(records: PrizeDistributionRecord[]): void;
  clear(): void;
}
