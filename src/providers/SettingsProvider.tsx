'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  UserSettings,
  AppearanceSettings,
  PrivacySettings,
  AccessibilitySettings,
  LanguageRegionSettings,
  GameplaySettings,
  DataExportPackage,
  DataImportValidation,
  StorageCategorySummary
} from '@/types';
import { settingsService } from '@/lib/services/settings-service';

interface SettingsContextType {
  settings: UserSettings;
  storageSummaries: StorageCategorySummary[];
  updateAppearance: (appearance: Partial<AppearanceSettings>) => UserSettings;
  updatePrivacy: (privacy: Partial<PrivacySettings>) => UserSettings;
  updateAccessibility: (accessibility: Partial<AccessibilitySettings>) => UserSettings;
  updateLanguageRegion: (langRegion: Partial<LanguageRegionSettings>) => UserSettings;
  updateGameplay: (gameplay: Partial<GameplaySettings>) => UserSettings;
  exportDemoData: () => DataExportPackage;
  validateImportData: (jsonStr: string) => DataImportValidation;
  importDemoData: (jsonStr: string) => boolean;
  resetSelectedCategory: (key: string) => void;
  resetAllDemoData: () => void;
  refreshSettings: () => void;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<UserSettings>(() => settingsService.getUserSettings());
  const [storageSummaries, setStorageSummaries] = useState<StorageCategorySummary[]>([]);

  const refreshSettings = useCallback(() => {
    setSettings(settingsService.getUserSettings());
    setStorageSummaries(settingsService.getStorageSummaries());
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      refreshSettings();
    }, 0);
    return () => clearTimeout(timer);
  }, [refreshSettings]);

  const updateAppearance = (app: Partial<AppearanceSettings>) => {
    const res = settingsService.updateAppearance(app);
    refreshSettings();
    return res;
  };

  const updatePrivacy = (priv: Partial<PrivacySettings>) => {
    const res = settingsService.updatePrivacy(priv);
    refreshSettings();
    return res;
  };

  const updateAccessibility = (acc: Partial<AccessibilitySettings>) => {
    const res = settingsService.updateAccessibility(acc);
    refreshSettings();
    return res;
  };

  const updateLanguageRegion = (lr: Partial<LanguageRegionSettings>) => {
    const res = settingsService.updateLanguageRegion(lr);
    refreshSettings();
    return res;
  };

  const updateGameplay = (gp: Partial<GameplaySettings>) => {
    const res = settingsService.updateGameplay(gp);
    refreshSettings();
    return res;
  };

  const exportDemoData = () => {
    return settingsService.exportDemoData();
  };

  const validateImportData = (jsonStr: string) => {
    return settingsService.validateImportData(jsonStr);
  };

  const importDemoData = (jsonStr: string) => {
    const res = settingsService.importDemoData(jsonStr);
    refreshSettings();
    return res;
  };

  const resetSelectedCategory = (key: string) => {
    settingsService.resetSelectedCategory(key);
    refreshSettings();
  };

  const resetAllDemoData = () => {
    settingsService.resetAllDemoData();
    refreshSettings();
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        storageSummaries,
        updateAppearance,
        updatePrivacy,
        updateAccessibility,
        updateLanguageRegion,
        updateGameplay,
        exportDemoData,
        validateImportData,
        importDemoData,
        resetSelectedCategory,
        resetAllDemoData,
        refreshSettings
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useUserSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error('useUserSettings must be used within a SettingsProvider');
  }
  return ctx;
};
