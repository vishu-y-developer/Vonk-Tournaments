import { MVPRecord } from '@/types';

export interface MVPRepository {
  getAll(): MVPRecord[];
  getByTournamentId(tournamentId: string): MVPRecord[];
  save(mvp: MVPRecord): void;
  saveAll(mvps: MVPRecord[]): void;
}
