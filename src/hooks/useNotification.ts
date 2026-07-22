import { useNotifications } from '@/providers/NotificationProvider';

export const useNotification = (id: string) => {
  const { notifications, markAsRead, archiveNotification, deleteNotification } = useNotifications();
  const notification = notifications.find((n) => n.id === id) || null;
  return { notification, markAsRead: () => markAsRead(id), archive: () => archiveNotification(id), delete: () => deleteNotification(id) };
};

export default useNotification;
