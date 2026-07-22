'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import SettingsShell from '@/components/settings/SettingsShell';
import { useLanguageRegionSettings } from '@/hooks/useLanguageRegionSettings';
import { Globe, Info } from 'lucide-react';

export default function LanguageRegionSettingsPage() {
  const { languageRegion, updateLanguageRegion } = useLanguageRegionSettings();

  return (
    <SettingsShell>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-xl font-black text-foreground uppercase tracking-tight flex items-center gap-2">
            <Globe className="h-5 w-5 text-secondary" />
            Language & Regional Format
          </h1>
          <p className="text-xs text-muted">
            Set local display language, timezone, date formatting, and currency symbols.
          </p>
        </div>

        <div className="p-6 rounded-2xl border border-card-border bg-card-bg/25 flex flex-col gap-4">
          <div className="flex items-center gap-2 text-secondary text-xs font-extrabold bg-secondary/10 p-3 rounded-xl border border-secondary/20">
            <Info className="h-4 w-4 shrink-0" />
            <span>English is fully supported across all 11 phases. Hindi & Hinglish options operate as preview preferences.</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-muted uppercase">Interface Language</label>
              <select
                value={languageRegion.language}
                onChange={(e) => updateLanguageRegion({ language: e.target.value })}
                className="p-3 bg-card-bg/60 border border-card-border rounded-xl text-xs text-foreground"
              >
                <option value="English">English (Full Support)</option>
                <option value="Hindi">Hindi (Preview Preference)</option>
                <option value="Hinglish">Hinglish (Preview Preference)</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-muted uppercase">Region</label>
              <select
                value={languageRegion.region}
                onChange={(e) => updateLanguageRegion({ region: e.target.value })}
                className="p-3 bg-card-bg/60 border border-card-border rounded-xl text-xs text-foreground"
              >
                <option value="India">India (IN)</option>
                <option value="Global">Global / International</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-muted uppercase">Timezone</label>
              <input
                type="text"
                value={languageRegion.timezone}
                onChange={(e) => updateLanguageRegion({ timezone: e.target.value })}
                className="p-3 bg-card-bg/60 border border-card-border rounded-xl text-xs text-foreground"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-muted uppercase">Currency Display Symbol</label>
              <select
                value={languageRegion.currencyDisplay}
                onChange={(e) => updateLanguageRegion({ currencyDisplay: e.target.value })}
                className="p-3 bg-card-bg/60 border border-card-border rounded-xl text-xs text-foreground"
              >
                <option value="INR (₹)">Indian Rupee (₹)</option>
                <option value="USD ($)">US Dollar ($)</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </SettingsShell>
  );
}
