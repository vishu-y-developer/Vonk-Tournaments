import { useUserSettings } from '@/providers/SettingsProvider';

export const useAppearanceSettings = () => {
  const { settings, updateAppearance } = useUserSettings();
  return { appearance: settings.appearance, updateAppearance };
};

export default useAppearanceSettings;
