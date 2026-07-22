'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { useOrganizer } from '@/providers/OrganizerProvider';
import OrganizerShell from '@/components/organizer/OrganizerShell';
import { Settings, Save, ShieldAlert } from 'lucide-react';
import { OrganizerProfile } from '@/types';

export default function SettingsPage() {
  const { organizer, updateSettings, organizerSettings, refreshData } = useOrganizer();

  const [orgName, setOrgName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [estYear, setEstYear] = useState('2024');

  const [defaultFormat, setDefaultFormat] = useState('Squad');
  const [defaultTimezone, setDefaultTimezone] = useState('Asia/Kolkata');

  useEffect(() => {
    const timer = setTimeout(() => {
      if (organizer) {
        setOrgName(organizer.organizationName || '');
        setDisplayName(organizer.displayName || '');
        setBio(organizer.bio || '');
        setEstYear(String(organizer.establishedYear || 2024));
      }
      if (organizerSettings) {
        setDefaultFormat(organizerSettings.defaultFormat || 'Squad');
        setDefaultTimezone(organizerSettings.defaultTimezone || 'Asia/Kolkata');
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [organizer, organizerSettings]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!organizer) return;

    const updatedProfile: OrganizerProfile = {
      ...organizer,
      organizationName: orgName,
      displayName,
      bio,
      establishedYear: Number(estYear) || 2024
    };

    organizerService.createProfile(updatedProfile); // Overwrites/saves
    updateSettings({
      defaultFormat: defaultFormat as any,
      defaultTimezone
    });

    alert('Organizer profile and defaults settings saved successfully!');
    window.location.reload();
  };

  return (
    <OrganizerShell>
      <div className="flex flex-col gap-6 max-w-2xl mx-auto">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-foreground uppercase tracking-tight flex items-center gap-2">
            <Settings className="h-6 w-6 text-secondary" />
            Organizer Profile & Settings
          </h1>
          <p className="text-xs text-muted">
            Configure default brackets styles, change display credentials, and toggle developer debug controls.
          </p>
        </div>

        <form onSubmit={handleSave} className="p-6 rounded-2xl border border-card-border bg-card-bg/25 flex flex-col gap-4">
          <h3 className="text-sm font-extrabold uppercase text-foreground">Organizer profile details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-muted uppercase">Organization Name</label>
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="p-3 bg-card-bg/60 border border-card-border rounded-xl text-xs text-foreground focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-muted uppercase">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="p-3 bg-card-bg/60 border border-card-border rounded-xl text-xs text-foreground focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-muted uppercase">Established Year</label>
              <input
                type="number"
                value={estYear}
                onChange={(e) => setEstYear(e.target.value)}
                className="p-3 bg-card-bg/60 border border-card-border rounded-xl text-xs text-foreground focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-muted uppercase">Default Timezone</label>
              <input
                type="text"
                value={defaultTimezone}
                onChange={(e) => setDefaultTimezone(e.target.value)}
                className="p-3 bg-card-bg/60 border border-card-border rounded-xl text-xs text-foreground focus:outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-muted uppercase">Bio / Description</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="p-3 bg-card-bg/60 border border-card-border rounded-xl text-xs text-foreground resize-none focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-muted uppercase">Default Match Format</label>
            <select
              value={defaultFormat}
              onChange={(e) => setDefaultFormat(e.target.value)}
              className="p-3 bg-card-bg/60 border border-card-border rounded-xl text-xs focus:outline-none"
            >
              <option value="Squad">Squad</option>
              <option value="Solo">Solo</option>
              <option value="Duo">Duo</option>
              <option value="TDM 4v4">TDM 4v4</option>
            </select>
          </div>

          <button
            type="submit"
            className="mt-4 py-3 bg-secondary hover:bg-secondary/95 text-white font-extrabold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 glow-secondary shadow-md"
          >
            <Save className="h-4 w-4" />
            Save Profile & Preferences
          </button>
        </form>
      </div>
    </OrganizerShell>
  );
}

// Inline helper to resolve cyclic service references
import { organizerService } from '@/lib/services/organizer-service';
