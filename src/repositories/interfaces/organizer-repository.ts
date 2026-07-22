import { OrganizerProfile } from '@/types';

export interface OrganizerRepository {
  get(): OrganizerProfile | null;
  save(profile: OrganizerProfile): void;
  clear(): void;
}
