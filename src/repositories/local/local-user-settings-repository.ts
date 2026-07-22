import { UserSettings } from '@/types';
import { UserSettingsRepository } from '../interfaces/user-settings-repository';
import { browserStorage } from '@/lib/storage/browser-storage';
import { STORAGE_KEYS } from '@/constants';

export class LocalUserSettingsRepository implements UserSettingsRepository {
  get(): UserSettings | null {
    return browserStorage.getItem<UserSettings | null>(STORAGE_KEYS.USER_SETTINGS, null);
  }

  save(settings: UserSettings): void {
    browserStorage.setItem(STORAGE_KEYS.USER_SETTINGS, settings);
  }

  clear(): void {
    browserStorage.setItem(STORAGE_KEYS.USER_SETTINGS, null);
  }
}

export const localUserSettingsRepository = new LocalUserSettingsRepository();
