import { PlatformAnnouncement } from '@/types';

export interface PlatformAnnouncementRepository {
  getAll(): PlatformAnnouncement[];
  save(announcement: PlatformAnnouncement): void;
  saveAll(announcements: PlatformAnnouncement[]): void;
  clear(): void;
}
