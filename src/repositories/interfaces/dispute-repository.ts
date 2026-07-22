import { ResultDispute } from '@/types';

export interface DisputeRepository {
  getAll(): ResultDispute[];
  getByTournamentId(tournamentId: string): ResultDispute[];
  save(dispute: ResultDispute): void;
  saveAll(disputes: ResultDispute[]): void;
}
