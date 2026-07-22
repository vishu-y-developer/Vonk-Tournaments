import { useUserSettings } from '@/providers/SettingsProvider';

export const useLanguageRegionSettings = () => {
  const { settings, updateLanguageRegion } = useUserSettings();
  return { languageRegion: settings.languageRegion, updateLanguageRegion };
};

export default useLanguageRegionSettings;
