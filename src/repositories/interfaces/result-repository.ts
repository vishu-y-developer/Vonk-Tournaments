import { MatchResult } from '@/types';

export interface ResultRepository {
  getAll(): MatchResult[];
  getByTournamentId(tournamentId: string): MatchResult | null;
  save(result: MatchResult): void;
  saveAll(results: MatchResult[]): void;
}
