import { PlatformAnnouncement } from '@/types';
import { PlatformAnnouncementRepository } from '../interfaces/platform-announcement-repository';
import { browserStorage } from '@/lib/storage/browser-storage';
import { STORAGE_KEYS } from '@/constants';

export class LocalPlatformAnnouncementRepository implements PlatformAnnouncementRepository {
  getAll(): PlatformAnnouncement[] {
    return browserStorage.getItem<PlatformAnnouncement[]>(STORAGE_KEYS.PLATFORM_ANNOUNCEMENTS, []);
  }

  save(announcement: PlatformAnnouncement): void {
    const list = this.getAll();
    const idx = list.findIndex((a) => a.id === announcement.id);
    if (idx > -1) {
      list[idx] = announcement;
    } else {
      list.unshift(announcement);
    }
    browserStorage.setItem(STORAGE_KEYS.PLATFORM_ANNOUNCEMENTS, list);
  }

  saveAll(announcements: PlatformAnnouncement[]): void {
    browserStorage.setItem(STORAGE_KEYS.PLATFORM_ANNOUNCEMENTS, announcements);
  }

  clear(): void {
    browserStorage.setItem(STORAGE_KEYS.PLATFORM_ANNOUNCEMENTS, []);
  }
}

export const localPlatformAnnouncementRepository = new LocalPlatformAnnouncementRepository();
