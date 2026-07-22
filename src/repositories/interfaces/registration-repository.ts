import { Registration } from '@/types';

export interface RegistrationRepository {
  getAll(): Registration[];
  getByTournamentId(tournamentId: string): Registration[];
  getByPlayerId(playerId: string): Registration[];
  getById(id: string): Registration | null;
  save(registration: Registration): void;
  saveAll(registrations: Registration[]): void;
}
