import { useUserSettings } from '@/providers/SettingsProvider';

export const useDataManagement = () => {
  const { storageSummaries, exportDemoData, validateImportData, importDemoData, resetSelectedCategory, resetAllDemoData } = useUserSettings();
  return { storageSummaries, exportDemoData, validateImportData, importDemoData, resetSelectedCategory, resetAllDemoData };
};

export default useDataManagement;
