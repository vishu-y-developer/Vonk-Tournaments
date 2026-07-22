import { Registration } from '@/types';
import { RegistrationRepository } from '../interfaces/registration-repository';
import { browserStorage } from '@/lib/storage/browser-storage';
import { STORAGE_KEYS } from '@/constants';

export class LocalRegistrationRepository implements RegistrationRepository {
  getAll(): Registration[] {
    return browserStorage.getItem<Registration[]>(STORAGE_KEYS.REGISTRATIONS, []);
  }

  getByTournamentId(tournamentId: string): Registration[] {
    const list = this.getAll();
    return list.filter((r) => r.tournamentId === tournamentId);
  }

  getByPlayerId(playerId: string): Registration[] {
    const list = this.getAll();
    return list.filter((r) => r.playerId === playerId);
  }

  getById(id: string): Registration | null {
    const list = this.getAll();
    return list.find((r) => r.id === id) || null;
  }

  save(registration: Registration): void {
    const list = this.getAll();
    const index = list.findIndex((r) => r.id === registration.id);
    if (index > -1) {
      list[index] = registration;
    } else {
      list.push(registration);
    }
    browserStorage.setItem(STORAGE_KEYS.REGISTRATIONS, list);
  }

  saveAll(registrations: Registration[]): void {
    browserStorage.setItem(STORAGE_KEYS.REGISTRATIONS, registrations);
  }
}

export const localRegistrationRepository = new LocalRegistrationRepository();
export default localRegistrationRepository;
