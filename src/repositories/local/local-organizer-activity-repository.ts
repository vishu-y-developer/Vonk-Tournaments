import { OrganizerActivity } from '@/types';
import { OrganizerActivityRepository } from '../interfaces/organizer-activity-repository';
import { browserStorage } from '@/lib/storage/browser-storage';
import { STORAGE_KEYS } from '@/constants';

export class LocalOrganizerActivityRepository implements OrganizerActivityRepository {
  getAll(): OrganizerActivity[] {
    return browserStorage.getItem<OrganizerActivity[]>(STORAGE_KEYS.ORGANIZER_ACTIVITIES, []);
  }

  getByOrganizer(organizerId: string): OrganizerActivity[] {
    const list = this.getAll();
    return list.filter((a) => a.organizerId === organizerId);
  }

  save(activity: OrganizerActivity): void {
    const list = this.getAll();
    list.push(activity);
    browserStorage.setItem(STORAGE_KEYS.ORGANIZER_ACTIVITIES, list);
  }

  saveAll(activities: OrganizerActivity[]): void {
    browserStorage.setItem(STORAGE_KEYS.ORGANIZER_ACTIVITIES, activities);
  }

  clear(): void {
    browserStorage.setItem(STORAGE_KEYS.ORGANIZER_ACTIVITIES, []);
  }
}

export const localOrganizerActivityRepository = new LocalOrganizerActivityRepository();
