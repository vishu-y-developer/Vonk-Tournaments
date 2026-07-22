import { Tournament } from '@/types';
import { TournamentRepository } from '../interfaces/tournament-repository';
import { browserStorage } from '@/lib/storage/browser-storage';
import { STORAGE_KEYS } from '@/constants';

export class LocalTournamentRepository implements TournamentRepository {
  getAll(): Tournament[] {
    return browserStorage.getItem<Tournament[]>(STORAGE_KEYS.TOURNAMENTS, []);
  }

  getById(id: string): Tournament | null {
    const list = this.getAll();
    return list.find((t) => t.id === id) || null;
  }

  getBySlug(slug: string): Tournament | null {
    const list = this.getAll();
    return list.find((t) => t.slug === slug) || null;
  }

  save(tournament: Tournament): void {
    const list = this.getAll();
    const index = list.findIndex((t) => t.id === tournament.id);
    if (index > -1) {
      list[index] = tournament;
    } else {
      list.push(tournament);
    }
    browserStorage.setItem(STORAGE_KEYS.TOURNAMENTS, list);
  }

  saveAll(tournaments: Tournament[]): void {
    browserStorage.setItem(STORAGE_KEYS.TOURNAMENTS, tournaments);
  }
}

export const localTournamentRepository = new LocalTournamentRepository();
export default localTournamentRepository;
