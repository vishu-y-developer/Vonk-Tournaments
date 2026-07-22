'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  NotificationItem,
  NotificationCategory,
  NotificationPriority,
  NotificationPreference
} from '@/types';
import { notificationService } from '@/lib/services/notification-service';
import { useAuth } from './AuthProvider';

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  preferences: NotificationPreference;
  markAsRead: (id: string) => void;
  markAsUnread: (id: string) => void;
  markAllAsRead: () => void;
  archiveNotification: (id: string) => void;
  restoreNotification: (id: string) => void;
  deleteNotification: (id: string) => void;
  createNotification: (
    type: NotificationCategory,
    priority: NotificationPriority,
    title: string,
    message: string,
    options?: any
  ) => NotificationItem | null;
  sendNotification: (type: any, title: string, message: string) => NotificationItem | null;
  updatePreferences: (prefs: NotificationPreference) => void;
  refreshNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const userId = user?.id || 'player-user';

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreference>(() => notificationService.getPreferences(userId));

  const refreshNotifications = useCallback(() => {
    notificationService.seedData(userId);
    setNotifications(localNotificationRepository.getAll(userId));
    setPreferences(notificationService.getPreferences(userId));
  }, [userId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      refreshNotifications();
    }, 0);
    return () => clearTimeout(timer);
  }, [refreshNotifications]);

  const unreadCount = notifications.filter((n) => n.status === 'UNREAD').length;

  const markAsRead = (id: string) => {
    notificationService.markAsRead(id);
    refreshNotifications();
  };

  const markAsUnread = (id: string) => {
    notificationService.markAsUnread(id);
    refreshNotifications();
  };

  const markAllAsRead = () => {
    notificationService.markAllAsRead(userId);
    refreshNotifications();
  };

  const archiveNotification = (id: string) => {
    notificationService.archiveNotification(id);
    refreshNotifications();
  };

  const restoreNotification = (id: string) => {
    notificationService.restoreNotification(id);
    refreshNotifications();
  };

  const deleteNotification = (id: string) => {
    notificationService.deleteNotification(id);
    refreshNotifications();
  };

  const createNotification = (
    type: NotificationCategory,
    priority: NotificationPriority,
    title: string,
    message: string,
    options?: any
  ) => {
    const notif = notificationService.createNotification(userId, user ? 'PLAYER' : 'GUEST', type, priority, title, message, options);
    refreshNotifications();
    return notif;
  };

  const sendNotification = (type: any, title: string, message: string) => {
    const res = notificationService.sendNotification(userId, type, title, message);
    refreshNotifications();
    return res;
  };

  const updatePreferences = (prefs: NotificationPreference) => {
    notificationService.savePreferences(userId, prefs);
    refreshNotifications();
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        preferences,
        markAsRead,
        markAsUnread,
        markAllAsRead,
        archiveNotification,
        restoreNotification,
        deleteNotification,
        createNotification,
        sendNotification,
        updatePreferences,
        refreshNotifications
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return ctx;
};

// Inline helper for repository access
import { localNotificationRepository } from '@/repositories/local/local-notification-repository';
