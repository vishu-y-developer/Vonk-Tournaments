import { TeamJoinRequest } from '@/types';

export interface JoinRequestRepository {
  getAll(): TeamJoinRequest[];
  getById(id: string): TeamJoinRequest | null;
  getByTeamId(teamId: string): TeamJoinRequest[];
  getByPlayerId(playerId: string): TeamJoinRequest[];
  save(request: TeamJoinRequest): void;
  saveAll(requests: TeamJoinRequest[]): void;
}
