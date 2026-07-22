import { useNotifications } from '@/providers/NotificationProvider';

export const useNotificationPreferences = () => {
  const { preferences, updatePreferences } = useNotifications();
  return { preferences, updatePreferences };
};

export default useNotificationPreferences;
