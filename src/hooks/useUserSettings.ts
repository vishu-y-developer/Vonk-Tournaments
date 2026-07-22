import { useUserSettings as useSettingsContext } from '@/providers/SettingsProvider';

export const useUserSettings = () => {
  return useSettingsContext();
};

export default useUserSettings;
