'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useTeams } from '@/providers/TeamProvider';
import { useAuth } from '@/providers/AuthProvider';
import { TeamType, TournamentMode } from '@/types';
import { ArrowLeft, Settings, Shield, Save } from 'lucide-react';
import { localTeamRepository } from '@/repositories/local/local-team-repository';

export default function TeamSettings() {
  const { teamId } = useParams() as { teamId: string };
  const router = useRouter();
  const { user } = useAuth();
  const { myTeam, refreshTeams } = useTeams();

  // Setup form states pre-populated from myTeam
  const [name, setName] = useState(myTeam?.name || '');
  const [shortName, setShortName] = useState(myTeam?.shortName || '');
  const [bio, setBio] = useState(myTeam?.bio || '');
  const [preferredMode, setPreferredMode] = useState<TournamentMode>(myTeam?.preferredMode || 'Squad');
  const [preferredMap, setPreferredMap] = useState(myTeam?.preferredMap || 'Erangel');
  const [motto, setMotto] = useState(myTeam?.motto || '');
  const [colorTheme, setColorTheme] = useState(myTeam?.colorTheme || '#8b5cf6');

  // Privacy states
  const defaultPrivacy = useMemo(() => {
    return myTeam?.privacySettings || {
      publicTeam: true,
      showStats: true,
      allowJoinRequests: true,
      inviteOnly: false,
      showHistory: true,
      showCharacterIds: true,
      showOnlineStatus: true,
    };
  }, [myTeam]);

  const [publicTeam, setPublicTeam] = useState(defaultPrivacy.publicTeam);
  const [showStats, setShowStats] = useState(defaultPrivacy.showStats);
  const [allowJoinRequests, setAllowJoinRequests] = useState(defaultPrivacy.allowJoinRequests);
  const [inviteOnly, setInviteOnly] = useState(defaultPrivacy.inviteOnly);
  const [showHistory, setShowHistory] = useState(defaultPrivacy.showHistory);
  const [showCharacterIds, setShowCharacterIds] = useState(defaultPrivacy.showCharacterIds);
  const [showOnlineStatus, setShowOnlineStatus] = useState(defaultPrivacy.showOnlineStatus);

  // Sync state if myTeam changes
  useEffect(() => {
    if (myTeam) {
      setTimeout(() => {
        setName(myTeam.name);
        setShortName(myTeam.shortName);
        setBio(myTeam.bio);
        setPreferredMode(myTeam.preferredMode);
        setPreferredMap(myTeam.preferredMap);
        setMotto(myTeam.motto || '');
        setColorTheme(myTeam.colorTheme || '#8b5cf6');

        const priv = myTeam.privacySettings || {
          publicTeam: true,
          showStats: true,
          allowJoinRequests: true,
          inviteOnly: false,
          showHistory: true,
          showCharacterIds: true,
          showOnlineStatus: true,
        };
        setPublicTeam(priv.publicTeam);
        setShowStats(priv.showStats);
        setAllowJoinRequests(priv.allowJoinRequests);
        setInviteOnly(priv.inviteOnly);
        setShowHistory(priv.showHistory);
        setShowCharacterIds(priv.showCharacterIds);
        setShowOnlineStatus(priv.showOnlineStatus);
      }, 0);
    }
  }, [myTeam]);

  // Validate authorization
  if (!user || !myTeam || myTeam.id !== teamId) {
    return (
      <div className="max-w-xl mx-auto w-full pb-20 px-4 md:px-0 pt-12 text-center">
        <h2 className="text-sm font-black text-foreground">NOT AUTHORIZED</h2>
      </div>
    );
  }

  const isCaptain = myTeam.captainId === user.id;
  const myMemberRecord = myTeam.members.find((m) => m.playerId === user.id);
  const isCoCaptain = myMemberRecord?.role === 'Co-Captain';

  if (!isCaptain && !isCoCaptain) {
    return (
      <div className="max-w-xl mx-auto w-full pb-20 px-4 md:px-0 pt-12 text-center">
        <h2 className="text-sm font-black text-foreground">ACCESS DENIED</h2>
        <p className="text-xs text-muted">Only the Captain or Co-Captain can configure team settings.</p>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!myTeam) return;

    // Check restrictions if Co-Captain (e.g. Co-Captain cannot rename team)
    if (isCoCaptain && (name !== myTeam.name || shortName !== myTeam.shortName)) {
      alert('Co-Captains cannot edit the team name or short tag.');
      return;
    }

    const updatedTeam = {
      ...myTeam,
      name,
      shortName,
      bio,
      preferredMode,
      preferredMap,
      motto,
      colorTheme,
      privacySettings: {
        publicTeam,
        showStats,
        allowJoinRequests,
        inviteOnly,
        showHistory,
        showCharacterIds,
        showOnlineStatus,
      },
    };

    localTeamRepository.save(updatedTeam);
    refreshTeams();
    alert('Team settings successfully updated!');
    router.push('/teams');
  };

  return (
    <div className="max-w-xl mx-auto w-full pb-20 px-4 md:px-0 pt-4 text-left flex flex-col gap-6">
      {/* Back button */}
      <Link href="/teams" className="flex items-center gap-1.5 text-xs text-muted hover:text-foreground w-fit transition-colors">
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Arena</span>
      </Link>

      <div className="flex flex-col gap-1 border-b border-card-border pb-4">
        <h1 className="text-xl md:text-2xl font-black uppercase tracking-tight flex items-center gap-2">
          <Settings className="h-6 w-6 text-primary" />
          Squad Configuration settings
        </h1>
        <p className="text-xs text-muted">Update general details and toggle privacy permissions.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Section 1: General Details */}
        <div className="p-5 rounded-2xl border border-card-border bg-[#0d0d12]/50 flex flex-col gap-4 text-left">
          <h3 className="text-xs font-black uppercase text-foreground">General Specifications</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-extrabold uppercase text-muted tracking-wider">Team Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isCoCaptain}
                className="w-full bg-[#0a0a0f] border border-card-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:border-primary/50 disabled:opacity-50"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-extrabold uppercase text-muted tracking-wider">Short Tag</label>
              <input
                type="text"
                value={shortName}
                onChange={(e) => setShortName(e.target.value)}
                disabled={isCoCaptain}
                className="w-full bg-[#0a0a0f] border border-card-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:border-primary/50 disabled:opacity-50"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-extrabold uppercase text-muted tracking-wider">Motto</label>
              <input
                type="text"
                value={motto}
                onChange={(e) => setMotto(e.target.value)}
                className="w-full bg-[#0a0a0f] border border-card-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:border-primary/50"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-extrabold uppercase text-muted tracking-wider">Accent Theme Color</label>
              <input
                type="color"
                value={colorTheme}
                onChange={(e) => setColorTheme(e.target.value)}
                className="w-full h-10 bg-[#0a0a0f] border border-card-border rounded-xl cursor-pointer"
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-extrabold uppercase text-muted tracking-wider">Team Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="w-full bg-[#0a0a0f] border border-card-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:border-primary/50"
            />
          </div>
        </div>

        {/* Section 2: Privacy Configuration */}
        {isCaptain && (
          <div className="p-5 rounded-2xl border border-card-border bg-[#0d0d12]/50 flex flex-col gap-4 text-left text-xs font-semibold">
            <h3 className="text-xs font-black uppercase text-foreground">Privacy & Visibility Settings</h3>
            
            <div className="flex flex-col gap-3.5">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={publicTeam}
                  onChange={(e) => setPublicTeam(e.target.checked)}
                  className="rounded border-card-border bg-[#0a0a0f] text-primary focus:ring-0 focus:ring-offset-0 h-4 w-4"
                />
                <div>
                  <p className="text-foreground">Public Team Profile</p>
                  <p className="text-[10px] text-muted leading-tight font-normal mt-0.5">Allow other free agents to discover your team profile on the leaderboard boards.</p>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showStats}
                  onChange={(e) => setShowStats(e.target.checked)}
                  className="rounded border-card-border bg-[#0a0a0f] text-primary focus:ring-0 focus:ring-offset-0 h-4 w-4"
                />
                <div>
                  <p className="text-foreground">Display Performance Statistics</p>
                  <p className="text-[10px] text-muted leading-tight font-normal mt-0.5">Let public lookup viewers see win-rates, total kills, and contributing parameters.</p>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowJoinRequests}
                  onChange={(e) => setAllowJoinRequests(e.target.checked)}
                  className="rounded border-card-border bg-[#0a0a0f] text-primary focus:ring-0 focus:ring-offset-0 h-4 w-4"
                />
                <div>
                  <p className="text-foreground">Allow Roster Applications</p>
                  <p className="text-[10px] text-muted leading-tight font-normal mt-0.5">Enables players to send join requests directly from the discovery recruitment boards.</p>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={inviteOnly}
                  onChange={(e) => setInviteOnly(e.target.checked)}
                  className="rounded border-card-border bg-[#0a0a0f] text-primary focus:ring-0 focus:ring-offset-0 h-4 w-4"
                />
                <div>
                  <p className="text-foreground">Require Invitation Validation</p>
                  <p className="text-[10px] text-muted leading-tight font-normal mt-0.5">Direct code registrations will require Captain manual approval before joining the roster.</p>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showCharacterIds}
                  onChange={(e) => setShowCharacterIds(e.target.checked)}
                  className="rounded border-card-border bg-[#0a0a0f] text-primary focus:ring-0 focus:ring-offset-0 h-4 w-4"
                />
                <div>
                  <p className="text-foreground">Show Character BGMI IDs</p>
                  <p className="text-[10px] text-muted leading-tight font-normal mt-0.5">Make BGMI game IDs visible on the public roster sheet.</p>
                </div>
              </label>
            </div>
          </div>
        )}

        <button
          type="submit"
          className="w-full py-3 bg-primary hover:bg-primary/95 text-background font-black text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5 glow-primary"
        >
          <Save className="h-4 w-4" />
          <span>Save Configuration</span>
        </button>
      </form>
    </div>
  );
}
