import { OrganizerSettings } from '@/types';
import { OrganizerSettingsRepository } from '../interfaces/organizer-settings-repository';
import { browserStorage } from '@/lib/storage/browser-storage';
import { STORAGE_KEYS } from '@/constants';

export class LocalOrganizerSettingsRepository implements OrganizerSettingsRepository {
  get(organizerId: string): OrganizerSettings | null {
    const list = browserStorage.getItem<OrganizerSettings[]>(STORAGE_KEYS.ORGANIZER_SETTINGS, []);
    return list.find((s) => s.organizerId === organizerId) || null;
  }

  save(settings: OrganizerSettings): void {
    const list = browserStorage.getItem<OrganizerSettings[]>(STORAGE_KEYS.ORGANIZER_SETTINGS, []);
    const idx = list.findIndex((s) => s.organizerId === settings.organizerId);
    if (idx > -1) {
      list[idx] = settings;
    } else {
      list.push(settings);
    }
    browserStorage.setItem(STORAGE_KEYS.ORGANIZER_SETTINGS, list);
  }

  clear(): void {
    browserStorage.setItem(STORAGE_KEYS.ORGANIZER_SETTINGS, []);
  }
}

export const localOrganizerSettingsRepository = new LocalOrganizerSettingsRepository();
