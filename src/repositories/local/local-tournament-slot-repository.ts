import { TournamentSlot } from '@/types';
import { TournamentSlotRepository } from '../interfaces/tournament-slot-repository';
import { browserStorage } from '@/lib/storage/browser-storage';

export class LocalTournamentSlotRepository implements TournamentSlotRepository {
  getAll(): TournamentSlot[] {
    return browserStorage.getItem<TournamentSlot[]>('vonk:v1:tournament-slots', []);
  }

  getByTournamentId(tournamentId: string): TournamentSlot[] {
    const list = this.getAll();
    return list.filter((s) => s.tournamentId === tournamentId);
  }

  save(slot: TournamentSlot): void {
    const list = this.getAll();
    const index = list.findIndex((s) => s.id === slot.id);
    if (index > -1) {
      list[index] = slot;
    } else {
      list.push(slot);
    }
    browserStorage.setItem('vonk:v1:tournament-slots', list);
  }

  saveAll(slots: TournamentSlot[]): void {
    browserStorage.setItem('vonk:v1:tournament-slots', slots);
  }

  reset(tournamentId: string): void {
    const list = this.getAll().filter((s) => s.tournamentId !== tournamentId);
    browserStorage.setItem('vonk:v1:tournament-slots', list);
  }
}

export const localTournamentSlotRepository = new LocalTournamentSlotRepository();
export default localTournamentSlotRepository;
