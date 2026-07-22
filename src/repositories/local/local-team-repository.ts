import { Team } from '@/types';
import { TeamRepository } from '../interfaces/team-repository';
import { browserStorage } from '@/lib/storage/browser-storage';
import { STORAGE_KEYS } from '@/constants';

export class LocalTeamRepository implements TeamRepository {
  getAll(): Team[] {
    return browserStorage.getItem<Team[]>(STORAGE_KEYS.TEAMS, []);
  }

  getById(id: string): Team | null {
    const list = this.getAll();
    return list.find((t) => t.id === id) || null;
  }

  getByCode(code: string): Team | null {
    const list = this.getAll();
    return list.find((t) => t.code.toUpperCase() === code.toUpperCase()) || null;
  }

  getByPlayerId(playerId: string): Team | null {
    const list = this.getAll();
    return list.find((t) => t.members.some((m) => m.playerId === playerId)) || null;
  }

  save(team: Team): void {
    const list = this.getAll();
    const index = list.findIndex((t) => t.id === team.id);
    if (index > -1) {
      list[index] = team;
    } else {
      list.push(team);
    }
    browserStorage.setItem(STORAGE_KEYS.TEAMS, list);
  }

  saveAll(teams: Team[]): void {
    browserStorage.setItem(STORAGE_KEYS.TEAMS, teams);
  }
}

export const localTeamRepository = new LocalTeamRepository();
export default localTeamRepository;
