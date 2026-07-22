import { PlatformSettings } from '@/types';

export interface PlatformSettingsRepository {
  get(): PlatformSettings | null;
  save(settings: PlatformSettings): void;
  clear(): void;
}
