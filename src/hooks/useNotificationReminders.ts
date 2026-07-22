import { useUserSettings } from '@/providers/SettingsProvider';

export const useNotificationReminders = () => {
  const { settings, updateGameplay } = useUserSettings();
  return {
    reminders: settings.notificationReminders,
    gameplayReminders: settings.gameplay
  };
};

export default useNotificationReminders;
