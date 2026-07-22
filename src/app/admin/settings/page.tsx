'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { useAdmin } from '@/providers/AdminProvider';
import AdminShell from '@/components/admin/AdminShell';
import { Settings, Save } from 'lucide-react';
import { PlatformSettings } from '@/types';

export default function AdminSettingsPage() {
  const { settings, updateSettings } = useAdmin();

  const [platformName, setPlatformName] = useState('');
  const [maxDemoBalance, setMaxDemoBalance] = useState('100000');
  const [maxBonusClaim, setMaxBonusClaim] = useState('500');
  const [autoBroadcast, setAutoBroadcast] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (settings) {
        setPlatformName(settings.platformName || 'VONK Tournaments');
        setMaxDemoBalance(String(settings.walletLimits?.maxDemoBalance || 100000));
        setMaxBonusClaim(String(settings.walletLimits?.maxBonusClaim || 500));
        setAutoBroadcast(settings.announcementDefaults?.autoBroadcast ?? true);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [settings]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: PlatformSettings = {
      ...settings,
      platformName,
      walletLimits: {
        maxDemoBalance: Number(maxDemoBalance) || 100000,
        maxBonusClaim: Number(maxBonusClaim) || 500
      },
      announcementDefaults: {
        autoBroadcast
      }
    };
    updateSettings(updated);
    alert('Platform settings saved successfully to local storage!');
  };

  return (
    <AdminShell>
      <div className="flex flex-col gap-6 max-w-2xl mx-auto">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-foreground uppercase tracking-tight flex items-center gap-2">
            <Settings className="h-6 w-6 text-primary" />
            Platform System Settings
          </h1>
          <p className="text-xs text-muted">
            Configure simulated demo wallet thresholds, default game engines, and automated notification preferences.
          </p>
        </div>

        <form onSubmit={handleSave} className="p-6 rounded-2xl border border-card-border bg-card-bg/25 flex flex-col gap-4">
          <h3 className="text-sm font-extrabold uppercase text-foreground">Global Platform Defaults</h3>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-muted uppercase">Platform Brand Name</label>
            <input
              type="text"
              value={platformName}
              onChange={(e) => setPlatformName(e.target.value)}
              className="p-3 bg-card-bg/60 border border-card-border rounded-xl text-xs text-foreground focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-muted uppercase">Max Demo Wallet Limit (₹)</label>
              <input
                type="number"
                value={maxDemoBalance}
                onChange={(e) => setMaxDemoBalance(e.target.value)}
                className="p-3 bg-card-bg/60 border border-card-border rounded-xl text-xs text-foreground focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-muted uppercase">Max Bonus Claim (₹)</label>
              <input
                type="number"
                value={maxBonusClaim}
                onChange={(e) => setMaxBonusClaim(e.target.value)}
                className="p-3 bg-card-bg/60 border border-card-border rounded-xl text-xs text-foreground focus:outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 mt-2">
            <label className="flex items-center gap-2 text-xs text-foreground font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={autoBroadcast}
                onChange={(e) => setAutoBroadcast(e.target.checked)}
                className="h-4 w-4 rounded bg-card-bg border-card-border text-primary focus:ring-0"
              />
              Auto-Broadcast Match Credentials (Automatically push notifications on credentials release)
            </label>
          </div>

          <button
            type="submit"
            className="mt-4 py-3 bg-secondary hover:bg-secondary/95 text-white font-extrabold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 glow-secondary shadow-md"
          >
            <Save className="h-4 w-4" />
            Save Platform Settings
          </button>
        </form>
      </div>
    </AdminShell>
  );
}
