'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import SettingsShell from '@/components/settings/SettingsShell';
import { useNotificationPreferences } from '@/hooks/useNotificationPreferences';
import { useNotificationReminders } from '@/hooks/useNotificationReminders';
import { Bell, Info } from 'lucide-react';

export default function NotificationSettingsPage() {
  const { preferences, updatePreferences } = useNotificationPreferences();

  const handleCategoryToggle = (category: string) => {
    const updated = {
      ...preferences,
      categories: {
        ...preferences.categories,
        [category]: !(preferences.categories as any)[category]
      }
    };
    updatePreferences(updated);
  };

  const handleDeliveryToggle = (field: 'demoEmail' | 'demoSms' | 'demoPush') => {
    const updated = {
      ...preferences,
      delivery: {
        ...preferences.delivery,
        [field]: !preferences.delivery[field]
      }
    };
    updatePreferences(updated);
  };

  return (
    <SettingsShell>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-xl font-black text-foreground uppercase tracking-tight flex items-center gap-2">
            <Bell className="h-5 w-5 text-secondary" />
            Notification & Alert Preferences
          </h1>
          <p className="text-xs text-muted">
            Choose notification categories and configured reminder timings.
          </p>
        </div>

        <div className="p-6 rounded-2xl border border-card-border bg-card-bg/25 flex flex-col gap-6">
          {/* Categories */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-extrabold uppercase text-foreground">In-App Notification Categories</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(preferences.categories).map(([cat, enabled]) => (
                <label key={cat} className="flex items-center justify-between p-3 rounded-xl border border-card-border bg-card-bg/40 text-xs font-bold cursor-pointer">
                  <span>{cat} Alerts</span>
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={() => handleCategoryToggle(cat)}
                    className="h-4 w-4 rounded bg-card-bg border-card-border text-secondary"
                  />
                </label>
              ))}
            </div>
          </div>

          {/* Delivery Channels (Placeholder Toggles) */}
          <div className="flex flex-col gap-3 border-t border-card-border/50 pt-4">
            <div className="flex items-center gap-2 text-warning text-xs font-extrabold">
              <Info className="h-4 w-4 shrink-0" />
              <span>External Delivery Channels (Demo Placeholders Only)</span>
            </div>
            <div className="flex flex-col gap-2">
              <label className="flex items-center justify-between p-3 rounded-xl border border-card-border bg-card-bg/40 text-xs font-bold cursor-pointer">
                <span>Demo Email Preference</span>
                <input
                  type="checkbox"
                  checked={preferences.delivery.demoEmail}
                  onChange={() => handleDeliveryToggle('demoEmail')}
                  className="h-4 w-4 rounded bg-card-bg border-card-border text-secondary"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl border border-card-border bg-card-bg/40 text-xs font-bold cursor-pointer">
                <span>Demo SMS Preference</span>
                <input
                  type="checkbox"
                  checked={preferences.delivery.demoSms}
                  onChange={() => handleDeliveryToggle('demoSms')}
                  className="h-4 w-4 rounded bg-card-bg border-card-border text-secondary"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl border border-card-border bg-card-bg/40 text-xs font-bold cursor-pointer">
                <span>Demo Browser Push Preference</span>
                <input
                  type="checkbox"
                  checked={preferences.delivery.demoPush}
                  onChange={() => handleDeliveryToggle('demoPush')}
                  className="h-4 w-4 rounded bg-card-bg border-card-border text-secondary"
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    </SettingsShell>
  );
}
