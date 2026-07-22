'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import SettingsShell from '@/components/settings/SettingsShell';
import { useGameplaySettings } from '@/hooks/useGameplaySettings';
import { Gamepad2 } from 'lucide-react';

export default function GameplaySettingsPage() {
  const { gameplay, updateGameplay } = useGameplaySettings();

  return (
    <SettingsShell>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-xl font-black text-foreground uppercase tracking-tight flex items-center gap-2">
            <Gamepad2 className="h-5 w-5 text-secondary" />
            Gameplay Defaults & Match Preferences
          </h1>
          <p className="text-xs text-muted">
            Configure default game modes, preferred maps, perspectives, and scorecard auto-open behaviors.
          </p>
        </div>

        <div className="p-6 rounded-2xl border border-card-border bg-card-bg/25 flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-muted uppercase">Default Game Title</label>
              <select
                value={gameplay.defaultGame}
                onChange={(e) => updateGameplay({ defaultGame: e.target.value })}
                className="p-3 bg-card-bg/60 border border-card-border rounded-xl text-xs text-foreground"
              >
                <option value="BGMI">BGMI (Battlegrounds Mobile India)</option>
                <option value="PUBG Mobile">PUBG Mobile</option>
                <option value="Free Fire MAX">Free Fire MAX</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-muted uppercase">Preferred Format Mode</label>
              <select
                value={gameplay.preferredMode}
                onChange={(e: any) => updateGameplay({ preferredMode: e.target.value })}
                className="p-3 bg-card-bg/60 border border-card-border rounded-xl text-xs text-foreground"
              >
                <option value="Squad">Squad (4v4)</option>
                <option value="Duo">Duo (2v2)</option>
                <option value="Solo">Solo (1v1)</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-muted uppercase">Preferred Map</label>
              <select
                value={gameplay.preferredMap}
                onChange={(e) => updateGameplay({ preferredMap: e.target.value })}
                className="p-3 bg-card-bg/60 border border-card-border rounded-xl text-xs text-foreground"
              >
                <option value="Erangel">Erangel</option>
                <option value="Miramar">Miramar</option>
                <option value="Sanhok">Sanhok</option>
                <option value="Vikendi">Vikendi</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-muted uppercase">Preferred Camera Perspective</label>
              <select
                value={gameplay.preferredPerspective}
                onChange={(e) => updateGameplay({ preferredPerspective: e.target.value })}
                className="p-3 bg-card-bg/60 border border-card-border rounded-xl text-xs text-foreground"
              >
                <option value="TPP">Third Person Perspective (TPP)</option>
                <option value="FPP">First Person Perspective (FPP)</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-card-border/50 pt-4">
            <label className="flex items-center justify-between p-3.5 rounded-xl border border-card-border bg-card-bg/40 text-xs font-bold cursor-pointer">
              <span>Auto-Open Next Match Room Card in Match Center</span>
              <input
                type="checkbox"
                checked={gameplay.autoOpenNextMatch}
                onChange={(e) => updateGameplay({ autoOpenNextMatch: e.target.checked })}
                className="h-4 w-4 rounded bg-card-bg border-card-border text-secondary"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-xl border border-card-border bg-card-bg/40 text-xs font-bold cursor-pointer">
              <span>Show Advanced K/D & Contribution Statistics</span>
              <input
                type="checkbox"
                checked={gameplay.showAdvancedStats}
                onChange={(e) => updateGameplay({ showAdvancedStats: e.target.checked })}
                className="h-4 w-4 rounded bg-card-bg border-card-border text-secondary"
              />
            </label>
          </div>
        </div>
      </div>
    </SettingsShell>
  );
}
