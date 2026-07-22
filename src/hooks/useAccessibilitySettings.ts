import { useUserSettings } from '@/providers/SettingsProvider';

export const useAccessibilitySettings = () => {
  const { settings, updateAccessibility } = useUserSettings();
  return { accessibility: settings.accessibility, updateAccessibility };
};

export default useAccessibilitySettings;
