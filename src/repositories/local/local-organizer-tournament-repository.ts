import { Tournament } from '@/types';
import { OrganizerTournamentRepository } from '../interfaces/organizer-tournament-repository';
import { browserStorage } from '@/lib/storage/browser-storage';
import { STORAGE_KEYS } from '@/constants';

export class LocalOrganizerTournamentRepository implements OrganizerTournamentRepository {
  getByOrganizer(organizerId: string): Tournament[] {
    const list = browserStorage.getItem<Tournament[]>(STORAGE_KEYS.TOURNAMENTS, []);
    return list.filter((t) => t.organizer === organizerId);
  }

  save(tournament: Tournament): void {
    const list = browserStorage.getItem<Tournament[]>(STORAGE_KEYS.TOURNAMENTS, []);
    const idx = list.findIndex((t) => t.id === tournament.id);
    if (idx > -1) {
      list[idx] = tournament;
    } else {
      list.push(tournament);
    }
    browserStorage.setItem(STORAGE_KEYS.TOURNAMENTS, list);
  }

  getAll(): Tournament[] {
    return browserStorage.getItem<Tournament[]>(STORAGE_KEYS.TOURNAMENTS, []);
  }

  saveAll(tournaments: Tournament[]): void {
    browserStorage.setItem(STORAGE_KEYS.TOURNAMENTS, tournaments);
  }
}

export const localOrganizerTournamentRepository = new LocalOrganizerTournamentRepository();
