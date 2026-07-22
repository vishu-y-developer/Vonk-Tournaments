import { PlatformSettings } from '@/types';
import { PlatformSettingsRepository } from '../interfaces/platform-settings-repository';
import { browserStorage } from '@/lib/storage/browser-storage';
import { STORAGE_KEYS } from '@/constants';

export class LocalPlatformSettingsRepository implements PlatformSettingsRepository {
  get(): PlatformSettings | null {
    return browserStorage.getItem<PlatformSettings | null>(STORAGE_KEYS.ADMIN_SETTINGS, null);
  }

  save(settings: PlatformSettings): void {
    browserStorage.setItem(STORAGE_KEYS.ADMIN_SETTINGS, settings);
  }

  clear(): void {
    browserStorage.setItem(STORAGE_KEYS.ADMIN_SETTINGS, null);
  }
}

export const localPlatformSettingsRepository = new LocalPlatformSettingsRepository();
