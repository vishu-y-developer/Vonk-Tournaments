import { useUserSettings } from '@/providers/SettingsProvider';

export const usePrivacySettings = () => {
  const { settings, updatePrivacy } = useUserSettings();
  return { privacy: settings.privacy, updatePrivacy };
};

export default usePrivacySettings;
