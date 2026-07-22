'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import SettingsShell from '@/components/settings/SettingsShell';
import { useAppearanceSettings } from '@/hooks/useAppearanceSettings';
import { Palette, Check } from 'lucide-react';

export default function AppearanceSettingsPage() {
  const { appearance, updateAppearance } = useAppearanceSettings();

  return (
    <SettingsShell>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-xl font-black text-foreground uppercase tracking-tight flex items-center gap-2">
            <Palette className="h-5 w-5 text-secondary" />
            Appearance & Theme Settings
          </h1>
          <p className="text-xs text-muted">
            Customize platform visual themes, density, and animation parameters.
          </p>
        </div>

        <div className="p-6 rounded-2xl border border-card-border bg-card-bg/25 flex flex-col gap-6">
          {/* Theme Selector */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-extrabold uppercase text-foreground">Theme Preference</label>
            <div className="grid grid-cols-3 gap-3">
              {(['dark', 'light', 'system'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => updateAppearance({ theme: t })}
                  className={`p-4 rounded-xl border flex items-center justify-between text-xs font-extrabold capitalize transition-all ${
                    appearance.theme === t
                      ? 'border-secondary bg-secondary/15 text-secondary'
                      : 'border-card-border bg-card-bg/40 text-muted hover:text-foreground'
                  }`}
                >
                  <span>{t} Mode</span>
                  {appearance.theme === t && <Check className="h-4 w-4 text-secondary" />}
                </button>
              ))}
            </div>
          </div>

          {/* Layout Density */}
          <div className="flex flex-col gap-2 border-t border-card-border/50 pt-4">
            <label className="text-xs font-extrabold uppercase text-foreground">Layout & Card Density</label>
            <div className="grid grid-cols-2 gap-3">
              {(['comfortable', 'compact'] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => updateAppearance({ layoutDensity: d, cardDensity: d, tableDensity: d })}
                  className={`p-4 rounded-xl border flex items-center justify-between text-xs font-extrabold capitalize transition-all ${
                    appearance.layoutDensity === d
                      ? 'border-secondary bg-secondary/15 text-secondary'
                      : 'border-card-border bg-card-bg/40 text-muted hover:text-foreground'
                  }`}
                >
                  <span>{d}</span>
                  {appearance.layoutDensity === d && <Check className="h-4 w-4 text-secondary" />}
                </button>
              ))}
            </div>
          </div>

          {/* Animation Toggles */}
          <div className="flex flex-col gap-3 border-t border-card-border/50 pt-4">
            <label className="flex items-center justify-between text-xs font-semibold cursor-pointer">
              <span>Reduced UI Animations</span>
              <input
                type="checkbox"
                checked={appearance.reducedAnimations}
                onChange={(e) => updateAppearance({ reducedAnimations: e.target.checked })}
                className="h-4 w-4 rounded bg-card-bg border-card-border text-secondary"
              />
            </label>

            <label className="flex items-center justify-between text-xs font-semibold cursor-pointer">
              <span>High Contrast Mode</span>
              <input
                type="checkbox"
                checked={appearance.highContrast}
                onChange={(e) => updateAppearance({ highContrast: e.target.checked })}
                className="h-4 w-4 rounded bg-card-bg border-card-border text-secondary"
              />
            </label>
          </div>
        </div>
      </div>
    </SettingsShell>
  );
}
