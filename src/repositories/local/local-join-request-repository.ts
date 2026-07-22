import { TeamJoinRequest } from '@/types';
import { JoinRequestRepository } from '../interfaces/join-request-repository';
import { browserStorage } from '@/lib/storage/browser-storage';
import { STORAGE_KEYS } from '@/constants';

export class LocalJoinRequestRepository implements JoinRequestRepository {
  getAll(): TeamJoinRequest[] {
    return browserStorage.getItem<TeamJoinRequest[]>(STORAGE_KEYS.TEAM_JOIN_REQUESTS, []);
  }

  getById(id: string): TeamJoinRequest | null {
    const list = this.getAll();
    return list.find((req) => req.id === id) || null;
  }

  getByTeamId(teamId: string): TeamJoinRequest[] {
    const list = this.getAll();
    return list.filter((req) => req.teamId === teamId);
  }

  getByPlayerId(playerId: string): TeamJoinRequest[] {
    const list = this.getAll();
    return list.filter((req) => req.playerId === playerId);
  }

  save(request: TeamJoinRequest): void {
    const list = this.getAll();
    const index = list.findIndex((req) => req.id === request.id);
    if (index > -1) {
      list[index] = request;
    } else {
      list.push(request);
    }
    browserStorage.setItem(STORAGE_KEYS.TEAM_JOIN_REQUESTS, list);
  }

  saveAll(requests: TeamJoinRequest[]): void {
    browserStorage.setItem(STORAGE_KEYS.TEAM_JOIN_REQUESTS, requests);
  }
}

export const localJoinRequestRepository = new LocalJoinRequestRepository();
export default localJoinRequestRepository;
