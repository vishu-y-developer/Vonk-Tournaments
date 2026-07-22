'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import SettingsShell from '@/components/settings/SettingsShell';
import { usePrivacySettings } from '@/hooks/usePrivacySettings';
import { Lock, Info } from 'lucide-react';

export default function PrivacySettingsPage() {
  const { privacy, updatePrivacy } = usePrivacySettings();

  return (
    <SettingsShell>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-xl font-black text-foreground uppercase tracking-tight flex items-center gap-2">
            <Lock className="h-5 w-5 text-secondary" />
            Privacy & Profile Visibility
          </h1>
          <p className="text-xs text-muted">
            Control what stats, team memberships, and wallet balances are visible in your player profile.
          </p>
        </div>

        <div className="p-6 rounded-2xl border border-card-border bg-card-bg/25 flex flex-col gap-4">
          <div className="flex items-center gap-2 text-secondary text-xs font-extrabold bg-secondary/10 p-3 rounded-xl border border-secondary/20">
            <Info className="h-4 w-4 shrink-0" />
            <span>Note: Local demo data is stored in your browser storage and accessible locally on this client.</span>
          </div>

          <div className="flex flex-col gap-3">
            {[
              { key: 'publicProfile', label: 'Public Player Profile' },
              { key: 'showMatchHistory', label: 'Show Recent Match History' },
              { key: 'showTeamMembership', label: 'Show Team Membership Roster' },
              { key: 'showAchievements', label: 'Show Unlocked Badges & Achievements' },
              { key: 'showWalletBalance', label: 'Show Demo Wallet Balance Badge' },
              { key: 'showTournamentHistory', label: 'Show Tournament Participation History' },
              { key: 'allowTeamInvitations', label: 'Allow Incoming Team Invitations' },
              { key: 'allowJoinRequests', label: 'Allow Join Requests to My Team' },
            ].map((item) => (
              <label
                key={item.key}
                className="flex items-center justify-between p-3.5 rounded-xl border border-card-border bg-card-bg/40 text-xs font-bold cursor-pointer"
              >
                <span>{item.label}</span>
                <input
                  type="checkbox"
                  checked={(privacy as any)[item.key]}
                  onChange={(e) => updatePrivacy({ [item.key]: e.target.checked })}
                  className="h-4 w-4 rounded bg-card-bg border-card-border text-secondary"
                />
              </label>
            ))}
          </div>
        </div>
      </div>
    </SettingsShell>
  );
}
