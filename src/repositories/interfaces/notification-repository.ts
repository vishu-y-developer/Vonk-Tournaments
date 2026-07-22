import { NotificationItem, NotificationPreference } from '@/types';

export interface NotificationRepository {
  getAll(userId: string): NotificationItem[];
  getById(id: string): NotificationItem | null;
  getByEventKey(eventKey: string): NotificationItem | null;
  save(notification: NotificationItem): void;
  saveAll(notifications: NotificationItem[]): void;
  delete(id: string): void;
  clear(userId: string): void;

  getPreferences(userId: string): NotificationPreference | null;
  savePreferences(userId: string, preferences: NotificationPreference): void;
}
