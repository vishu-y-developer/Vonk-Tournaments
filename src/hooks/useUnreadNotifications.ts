import { useNotifications } from '@/providers/NotificationProvider';

export const useUnreadNotifications = () => {
  const { notifications, unreadCount, markAllAsRead } = useNotifications();
  const unreadList = notifications.filter((n) => n.status === 'UNREAD');
  return { unreadList, unreadCount, markAllAsRead };
};

export default useUnreadNotifications;
