import { NotificationItem, NotificationPreference } from '@/types';
import { NotificationRepository } from '../interfaces/notification-repository';
import { browserStorage } from '@/lib/storage/browser-storage';
import { STORAGE_KEYS } from '@/constants';

export class LocalNotificationRepository implements NotificationRepository {
  getAll(userId: string): NotificationItem[] {
    const list = browserStorage.getItem<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, []);
    return list.filter((n) => !userId || n.userId === userId || n.userId === 'all');
  }

  getById(id: string): NotificationItem | null {
    const list = browserStorage.getItem<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, []);
    return list.find((n) => n.id === id) || null;
  }

  getByEventKey(eventKey: string): NotificationItem | null {
    const list = browserStorage.getItem<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, []);
    return list.find((n) => n.eventKey === eventKey) || null;
  }

  save(notification: NotificationItem): void {
    const list = browserStorage.getItem<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, []);
    const idx = list.findIndex((n) => n.id === notification.id);
    if (idx > -1) {
      list[idx] = notification;
    } else {
      list.unshift(notification);
    }
    browserStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, list);
  }

  saveAll(notifications: NotificationItem[]): void {
    browserStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, notifications);
  }

  delete(id: string): void {
    const list = browserStorage.getItem<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, []);
    const filtered = list.filter((n) => n.id !== id);
    browserStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, filtered);
  }

  clear(userId: string): void {
    const list = browserStorage.getItem<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, []);
    const filtered = list.filter((n) => n.userId !== userId);
    browserStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, filtered);
  }

  getPreferences(userId: string): NotificationPreference | null {
    const prefs = browserStorage.getItem<Record<string, NotificationPreference>>(STORAGE_KEYS.NOTIFICATION_PREFERENCES, {});
    return prefs[userId] || null;
  }

  savePreferences(userId: string, preferences: NotificationPreference): void {
    const prefs = browserStorage.getItem<Record<string, NotificationPreference>>(STORAGE_KEYS.NOTIFICATION_PREFERENCES, {});
    prefs[userId] = preferences;
    browserStorage.setItem(STORAGE_KEYS.NOTIFICATION_PREFERENCES, prefs);
  }
}

export const localNotificationRepository = new LocalNotificationRepository();
