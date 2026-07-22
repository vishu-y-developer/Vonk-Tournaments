import { PlatformSystemStatus } from '@/types';
import { PlatformStatusRepository } from '../interfaces/platform-status-repository';
import { browserStorage } from '@/lib/storage/browser-storage';
import { STORAGE_KEYS } from '@/constants';

export class LocalPlatformStatusRepository implements PlatformStatusRepository {
  get(): PlatformSystemStatus | null {
    return browserStorage.getItem<PlatformSystemStatus | null>(STORAGE_KEYS.PLATFORM_STATUS, null);
  }

  save(status: PlatformSystemStatus): void {
    browserStorage.setItem(STORAGE_KEYS.PLATFORM_STATUS, status);
  }
}

export const localPlatformStatusRepository = new LocalPlatformStatusRepository();
