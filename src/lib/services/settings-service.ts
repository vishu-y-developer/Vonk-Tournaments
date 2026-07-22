/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { localUserSettingsRepository } from '@/repositories/local/local-user-settings-repository';
import { STORAGE_KEYS } from '@/constants';
import { browserStorage } from '@/lib/storage/browser-storage';

export class SettingsService {
  getDefaultSettings(): UserSettings {
    return {
      appearance: {
        theme: 'dark',
        layoutDensity: 'comfortable',
        reducedAnimations: false,
        highContrast: false,
        cardDensity: 'comfortable',
        tableDensity: 'comfortable'
      },
      notifications: {
        categories: {
          TOURNAMENT: true,
          REGISTRATION: true,
          MATCH: true,
          RESULT: true,
          LEADERBOARD: true,
          TEAM: true,
          WALLET: true,
          PRIZE: true,
          ANNOUNCEMENT: true,
          SUPPORT: true,
          SYSTEM: true,
          SECURITY_DEMO: true,
          ORGANIZER: true,
          ADMIN: true
        },
        delivery: {
          inApp: true,
          demoEmail: false,
          demoSms: false,
          demoPush: false
        }
      },
      notificationReminders: {
        matchReminderHoursBefore: 1,
        checkInReminderMinutesBefore: 15,
        registrationClosingReminderHoursBefore: 2,
        roomCredentialsReminderMinutesBefore: 15
      },
      privacy: {
        publicProfile: true,
        showMatchHistory: true,
        showTeamMembership: true,
        showAchievements: true,
        showWalletBalance: true,
        showTournamentHistory: true,
        allowTeamInvitations: true,
        allowJoinRequests: true
      },
      accessibility: {
        reducedMotion: false,
        increasedContrast: false,
        largerText: false,
        strongerFocus: false,
        simplifiedAnimations: false,
        preferCardsOverTables: false
      },
      languageRegion: {
        language: 'English',
        region: 'India',
        timezone: 'Asia/Kolkata',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '12h',
        currencyDisplay: 'INR (₹)'
      },
      gameplay: {
        defaultGame: 'BGMI',
        preferredMode: 'Squad',
        preferredMap: 'Erangel',
        preferredPerspective: 'TPP',
        autoOpenNextMatch: true,
        showAdvancedStats: true
      }
    };
  }

  getUserSettings(): UserSettings {
    const stored = localUserSettingsRepository.get();
    if (!stored) return this.getDefaultSettings();

    // Deep merge defaults
    const defaults = this.getDefaultSettings();
    return {
      appearance: { ...defaults.appearance, ...stored.appearance },
      notifications: {
        categories: { ...defaults.notifications.categories, ...(stored.notifications?.categories || {}) },
        delivery: { ...defaults.notifications.delivery, ...(stored.notifications?.delivery || {}) }
      },
      notificationReminders: { ...defaults.notificationReminders, ...(stored.notificationReminders || {}) },
      privacy: { ...defaults.privacy, ...stored.privacy },
      accessibility: { ...defaults.accessibility, ...stored.accessibility },
      languageRegion: { ...defaults.languageRegion, ...stored.languageRegion },
      gameplay: { ...defaults.gameplay, ...stored.gameplay }
    };
  }

  saveUserSettings(settings: UserSettings): void {
    localUserSettingsRepository.save(settings);
  }

  updateAppearance(appearance: Partial<AppearanceSettings>): UserSettings {
    const current = this.getUserSettings();
    current.appearance = { ...current.appearance, ...appearance };
    this.saveUserSettings(current);
    return current;
  }

  updatePrivacy(privacy: Partial<PrivacySettings>): UserSettings {
    const current = this.getUserSettings();
    current.privacy = { ...current.privacy, ...privacy };
    this.saveUserSettings(current);
    return current;
  }

  updateAccessibility(accessibility: Partial<AccessibilitySettings>): UserSettings {
    const current = this.getUserSettings();
    current.accessibility = { ...current.accessibility, ...accessibility };
    this.saveUserSettings(current);
    return current;
  }

  updateLanguageRegion(langRegion: Partial<LanguageRegionSettings>): UserSettings {
    const current = this.getUserSettings();
    current.languageRegion = { ...current.languageRegion, ...langRegion };
    this.saveUserSettings(current);
    return current;
  }

  updateGameplay(gameplay: Partial<GameplaySettings>): UserSettings {
    const current = this.getUserSettings();
    current.gameplay = { ...current.gameplay, ...gameplay };
    this.saveUserSettings(current);
    return current;
  }

  // --- LOCAL STORAGE DATA MANAGEMENT & EXPORT/IMPORT ---
  getStorageSummaries(): StorageCategorySummary[] {
    const categories: { name: string; key: string }[] = [
      { name: 'Player Profile & Role', key: STORAGE_KEYS.USER },
      { name: 'Teams', key: STORAGE_KEYS.TEAMS },
      { name: 'Demo Wallet', key: STORAGE_KEYS.WALLET },
      { name: 'Wallet Transactions', key: STORAGE_KEYS.TRANSACTIONS },
      { name: 'Tournaments', key: STORAGE_KEYS.TOURNAMENTS },
      { name: 'Registrations', key: STORAGE_KEYS.REGISTRATIONS },
      { name: 'Match Scorecards', key: STORAGE_KEYS.RESULTS },
      { name: 'Organizer Data', key: STORAGE_KEYS.ORGANIZERS },
      { name: 'Admin Data', key: STORAGE_KEYS.ADMINS },
      { name: 'Notifications', key: STORAGE_KEYS.NOTIFICATIONS },
      { name: 'Support Tickets', key: STORAGE_KEYS.SUPPORT_TICKETS },
      { name: 'User Preferences', key: STORAGE_KEYS.USER_SETTINGS }
    ];

    return categories.map((cat) => {
      const raw = localStorage.getItem(cat.key);
      const estimatedBytes = raw ? raw.length * 2 : 0;
      let itemCount = 0;
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          itemCount = Array.isArray(parsed) ? parsed.length : 1;
        } catch {
          itemCount = 1;
        }
      }
      return {
        category: cat.name,
        key: cat.key,
        itemCount,
        estimatedBytes
      };
    });
  }

  exportDemoData(): DataExportPackage {
    const summaries = this.getStorageSummaries();
    const dataObj: Record<string, unknown> = {};

    summaries.forEach((s) => {
      const raw = localStorage.getItem(s.key);
      if (raw) {
        try {
          dataObj[s.key] = JSON.parse(raw);
        } catch {
          dataObj[s.key] = raw;
        }
      }
    });

    return {
      version: 'vonk-v1.0-demo',
      exportedAt: new Date().toISOString(),
      categories: dataObj,
      isDemoData: true
    };
  }

  validateImportData(jsonStr: string): DataImportValidation {
    try {
      const parsed = JSON.parse(jsonStr) as DataExportPackage;
      if (!parsed || typeof parsed !== 'object') {
        return { valid: false, version: 'unknown', categoriesCount: 0, recordsCount: 0, warnings: [], errors: ['Invalid JSON object.'] };
      }
      if (!parsed.categories || typeof parsed.categories !== 'object') {
        return { valid: false, version: parsed.version || 'unknown', categoriesCount: 0, recordsCount: 0, warnings: [], errors: ['Missing data categories package.'] };
      }

      const keys = Object.keys(parsed.categories);
      return {
        valid: true,
        version: parsed.version || 'v1.0',
        categoriesCount: keys.length,
        recordsCount: keys.length * 5,
        warnings: parsed.isDemoData ? [] : ['File does not specify demo metadata badge.'],
        errors: []
      };
    } catch (err: any) {
      return { valid: false, version: 'unknown', categoriesCount: 0, recordsCount: 0, warnings: [], errors: [err.message || 'JSON Parse error.'] };
    }
  }

  importDemoData(jsonStr: string): boolean {
    const val = this.validateImportData(jsonStr);
    if (!val.valid) return false;

    const parsed = JSON.parse(jsonStr) as DataExportPackage;
    Object.entries(parsed.categories).forEach(([k, v]) => {
      if (k.startsWith('vonk:v1:')) {
        browserStorage.setItem(k, v);
      }
    });
    return true;
  }

  resetSelectedCategory(key: string): void {
    if (key.startsWith('vonk:v1:')) {
      localStorage.removeItem(key);
    }
  }

  resetAllDemoData(): void {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('vonk:v1:')) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  }
}

export const settingsService = new SettingsService();
