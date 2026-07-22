import { useUserSettings } from '@/providers/SettingsProvider';

export const useGameplaySettings = () => {
  const { settings, updateGameplay } = useUserSettings();
  return { gameplay: settings.gameplay, updateGameplay };
};

export default useGameplaySettings;
