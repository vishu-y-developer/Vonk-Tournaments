import { UserSettings } from '@/types';

export interface UserSettingsRepository {
  get(): UserSettings | null;
  save(settings: UserSettings): void;
  clear(): void;
}
