'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import SettingsShell from '@/components/settings/SettingsShell';
import { useAccessibilitySettings } from '@/hooks/useAccessibilitySettings';
import { Eye } from 'lucide-react';

export default function AccessibilitySettingsPage() {
  const { accessibility, updateAccessibility } = useAccessibilitySettings();

  return (
    <SettingsShell>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-xl font-black text-foreground uppercase tracking-tight flex items-center gap-2">
            <Eye className="h-5 w-5 text-secondary" />
            Accessibility & Screen Preferences
          </h1>
          <p className="text-xs text-muted">
            Configure visual contrast, text sizing, focus states, and motion preferences.
          </p>
        </div>

        <div className="p-6 rounded-2xl border border-card-border bg-card-bg/25 flex flex-col gap-3">
          {[
            { key: 'reducedMotion', label: 'Reduced Motion (Disable dynamic transitions)' },
            { key: 'increasedContrast', label: 'Increased Contrast Colors' },
            { key: 'largerText', label: 'Larger Text Mode' },
            { key: 'strongerFocus', label: 'Stronger Focus Ring Indicators' },
            { key: 'simplifiedAnimations', label: 'Simplified Component Animations' },
            { key: 'preferCardsOverTables', label: 'Prefer Card Views over Data Tables' },
          ].map((item) => (
            <label
              key={item.key}
              className="flex items-center justify-between p-3.5 rounded-xl border border-card-border bg-card-bg/40 text-xs font-bold cursor-pointer"
            >
              <span>{item.label}</span>
              <input
                type="checkbox"
                checked={(accessibility as any)[item.key]}
                onChange={(e) => updateAccessibility({ [item.key]: e.target.checked })}
                className="h-4 w-4 rounded bg-card-bg border-card-border text-secondary"
              />
            </label>
          ))}
        </div>
      </div>
    </SettingsShell>
  );
}
