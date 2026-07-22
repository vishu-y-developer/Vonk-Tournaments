import { OrganizerSettings } from '@/types';

export interface OrganizerSettingsRepository {
  get(organizerId: string): OrganizerSettings | null;
  save(settings: OrganizerSettings): void;
  clear(): void;
}
