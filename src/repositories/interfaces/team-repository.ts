import { Team } from '@/types';

export interface TeamRepository {
  getAll(): Team[];
  getById(id: string): Team | null;
  getByCode(code: string): Team | null;
  getByPlayerId(playerId: string): Team | null;
  save(team: Team): void;
  saveAll(teams: Team[]): void;
}
