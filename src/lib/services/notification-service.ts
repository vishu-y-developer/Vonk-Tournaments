/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  NotificationItem,
  NotificationCategory,
  NotificationPriority,
  NotificationPreference,
  NotificationReminderPreference
} from '@/types';
import { localNotificationRepository } from '@/repositories/local/local-notification-repository';

export class NotificationService {
  generateId(): string {
    return `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }

  createNotification(
    userId: string,
    role: 'PLAYER' | 'ORGANIZER' | 'ADMIN' | 'GUEST',
    type: NotificationCategory,
    priority: NotificationPriority,
    title: string,
    message: string,
    options?: {
      entityType?: string;
      entityId?: string;
      actionLabel?: string;
      actionHref?: string;
      eventKey?: string;
      metadata?: Record<string, unknown>;
    }
  ): NotificationItem | null {
    if (options?.eventKey) {
      const existing = localNotificationRepository.getByEventKey(options.eventKey);
      if (existing) return existing; // Deduplicate
    }

    const item: NotificationItem = {
      id: this.generateId(),
      userId,
      role,
      type,
      priority,
      title,
      message,
      entityType: options?.entityType,
      entityId: options?.entityId,
      actionLabel: options?.actionLabel,
      actionHref: options?.actionHref,
      status: 'UNREAD',
      createdAt: new Date().toISOString(),
      metadata: options?.metadata,
      eventKey: options?.eventKey,
      isDemo: true
    };

    localNotificationRepository.save(item);
    return item;
  }

  sendNotification(userId: string, type: any, title: string, message: string): NotificationItem | null {
    const category: NotificationCategory =
      type === 'SYSTEM' || type === 'MATCH' || type === 'REGISTRATION' || type === 'RESULT' || type === 'WALLET' || type === 'TEAM' || type === 'ANNOUNCEMENT'
        ? type
        : 'SYSTEM';
    return this.createNotification(userId, 'PLAYER', category, 'NORMAL', title, message);
  }

  getNotifications(userId: string): NotificationItem[] {
    return localNotificationRepository.getAll(userId);
  }

  markAsRead(id: string): boolean {
    const item = localNotificationRepository.getById(id);
    if (!item) return false;
    item.status = 'READ';
    item.readAt = new Date().toISOString();
    localNotificationRepository.save(item);
    return true;
  }

  markAsUnread(id: string): boolean {
    const item = localNotificationRepository.getById(id);
    if (!item) return false;
    item.status = 'UNREAD';
    item.readAt = undefined;
    localNotificationRepository.save(item);
    return true;
  }

  markAllAsRead(userId: string): void {
    const list = localNotificationRepository.getAll(userId);
    list.forEach((n) => {
      if (n.status === 'UNREAD') {
        n.status = 'READ';
        n.readAt = new Date().toISOString();
      }
    });
    localNotificationRepository.saveAll(list);
  }

  archiveNotification(id: string): boolean {
    const item = localNotificationRepository.getById(id);
    if (!item) return false;
    item.status = 'ARCHIVED';
    item.archivedAt = new Date().toISOString();
    localNotificationRepository.save(item);
    return true;
  }

  restoreNotification(id: string): boolean {
    const item = localNotificationRepository.getById(id);
    if (!item) return false;
    item.status = 'READ';
    item.archivedAt = undefined;
    localNotificationRepository.save(item);
    return true;
  }

  deleteNotification(id: string): void {
    localNotificationRepository.delete(id);
  }

  getUnreadCount(userId: string): number {
    const list = localNotificationRepository.getAll(userId);
    return list.filter((n) => n.status === 'UNREAD').length;
  }

  getPreferences(userId: string): NotificationPreference {
    const stored = localNotificationRepository.getPreferences(userId);
    if (stored) return stored;

    const defaultPrefs: NotificationPreference = {
      categories: {
        TOURNAMENT: true,
        REGISTRATION: true,
        MATCH: true,
        RESULT: true,
        LEADERBOARD: true,
        TEAM: true,
        WALLET: true,
        PRIZE: true,
        ANNOUNCEMENT: true,
        SUPPORT: true,
        SYSTEM: true,
        SECURITY_DEMO: true,
        ORGANIZER: true,
        ADMIN: true
      },
      delivery: {
        inApp: true,
        demoEmail: false,
        demoSms: false,
        demoPush: false
      }
    };
    return defaultPrefs;
  }

  savePreferences(userId: string, prefs: NotificationPreference): void {
    localNotificationRepository.savePreferences(userId, prefs);
  }

  seedData(userId: string): void {
    const existing = localNotificationRepository.getAll(userId);
    if (existing.length > 0) return;

    this.createNotification(
      userId,
      'PLAYER',
      'REGISTRATION',
      'HIGH',
      'Registration Confirmed!',
      'Your team roster slot in VONK Pro League Season 4 has been confirmed by the organizer.',
      { actionLabel: 'View Registration', actionHref: '/registrations', eventKey: `seed-reg-${userId}` }
    );

    this.createNotification(
      userId,
      'PLAYER',
      'MATCH',
      'URGENT',
      'Room Credentials Available',
      'Match Lobby credentials for Round 1 have been released by the organizer. Head to Match Center.',
      { actionLabel: 'Open Match Center', actionHref: '/tournaments/vonk-pro-league-season-4', eventKey: `seed-match-${userId}` }
    );

    this.createNotification(
      userId,
      'PLAYER',
      'WALLET',
      'NORMAL',
      'Demo Prize Credited',
      'Simulated winnings of ₹1,000 credited to your demo wallet for 1st place finish.',
      { actionLabel: 'View Wallet', actionHref: '/wallet', eventKey: `seed-wallet-${userId}` }
    );

    this.createNotification(
      userId,
      'PLAYER',
      'ANNOUNCEMENT',
      'NORMAL',
      'Welcome to VONK Tournaments Phase 11',
      'Explore notifications, help center articles, support tickets, and customizable user settings.',
      { actionLabel: 'Explore Settings', actionHref: '/settings', eventKey: `seed-ann-${userId}` }
    );
  }
}

export const notificationService = new NotificationService();
