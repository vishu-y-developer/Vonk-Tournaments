import { OrganizerActivity } from '@/types';

export interface OrganizerActivityRepository {
  getAll(): OrganizerActivity[];
  getByOrganizer(organizerId: string): OrganizerActivity[];
  save(activity: OrganizerActivity): void;
  saveAll(activities: OrganizerActivity[]): void;
  clear(): void;
}
