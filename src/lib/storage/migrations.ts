import { browserStorage } from './browser-storage';
import { STORAGE_KEYS } from '@/constants';
import { seedDatabase } from './seed';

const CURRENT_VERSION = 'v1';

export function runMigrations(): void {
  if (typeof window === 'undefined') return;

  const installedVersion = browserStorage.getItem<string | null>(STORAGE_KEYS.SETTINGS, null);

  // If there's no settings version, seed the database with mock data
  if (!installedVersion) {
    console.log('No schema version detected. Seeding initial database...');
    seedDatabase();
    browserStorage.setItem(STORAGE_KEYS.SETTINGS, CURRENT_VERSION);
  }
}
