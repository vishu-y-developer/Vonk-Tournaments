import { OrganizerProfile } from '@/types';
import { OrganizerRepository } from '../interfaces/organizer-repository';
import { browserStorage } from '@/lib/storage/browser-storage';
import { STORAGE_KEYS } from '@/constants';

export class LocalOrganizerRepository implements OrganizerRepository {
  get(): OrganizerProfile | null {
    const list = browserStorage.getItem<OrganizerProfile[]>(STORAGE_KEYS.ORGANIZERS, []);
    return list.length > 0 ? list[0] : null;
  }

  save(profile: OrganizerProfile): void {
    const list = browserStorage.getItem<OrganizerProfile[]>(STORAGE_KEYS.ORGANIZERS, []);
    const idx = list.findIndex((p) => p.id === profile.id);
    if (idx > -1) {
      list[idx] = profile;
    } else {
      list[0] = profile; // Force singleton
    }
    browserStorage.setItem(STORAGE_KEYS.ORGANIZERS, list);
  }

  clear(): void {
    browserStorage.setItem(STORAGE_KEYS.ORGANIZERS, []);
  }
}

export const localOrganizerRepository = new LocalOrganizerRepository();
