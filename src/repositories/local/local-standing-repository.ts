import { TournamentStanding } from '@/types';
import { StandingRepository } from '../interfaces/standing-repository';
import { browserStorage } from '@/lib/storage/browser-storage';
import { STORAGE_KEYS } from '@/constants';

export class LocalStandingRepository implements StandingRepository {
  getAll(): TournamentStanding[] {
    return browserStorage.getItem<TournamentStanding[]>(STORAGE_KEYS.TOURNAMENT_STANDINGS, []);
  }

  getByTournamentId(tournamentId: string): TournamentStanding[] {
    const list = this.getAll();
    return list.filter((s) => s.tournamentId === tournamentId);
  }

  save(standing: TournamentStanding): void {
    const list = this.getAll();
    const index = list.findIndex(
      (s) => s.tournamentId === standing.tournamentId && s.participantId === standing.participantId
    );
    if (index > -1) {
      list[index] = standing;
    } else {
      list.push(standing);
    }
    browserStorage.setItem(STORAGE_KEYS.TOURNAMENT_STANDINGS, list);
  }

  saveAll(standings: TournamentStanding[]): void {
    browserStorage.setItem(STORAGE_KEYS.TOURNAMENT_STANDINGS, standings);
  }
}

export const localStandingRepository = new LocalStandingRepository();
export default localStandingRepository;
