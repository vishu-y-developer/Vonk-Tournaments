import { TournamentStanding } from '@/types';

export interface StandingRepository {
  getAll(): TournamentStanding[];
  getByTournamentId(tournamentId: string): TournamentStanding[];
  save(standing: TournamentStanding): void;
  saveAll(standings: TournamentStanding[]): void;
}
