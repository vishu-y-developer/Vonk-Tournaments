'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { use, useState, useMemo } from 'react';
import Link from 'next/link';
import { useOrganizer } from '@/providers/OrganizerProvider';
import { useTournaments } from '@/providers/TournamentProvider';
import { useResults } from '@/providers/ResultProvider';
import { localRegistrationRepository } from '@/repositories/local/local-registration-repository';
import { localTournamentSlotRepository } from '@/repositories/local/local-tournament-slot-repository';
import { localResultRepository } from '@/repositories/local/local-result-repository';
import { localDisputeRepository } from '@/repositories/local/local-dispute-repository';
import OrganizerShell from '@/components/organizer/OrganizerShell';
import { 
  Trophy, 
  Users, 
  Sword, 
  CheckSquare, 
  Gift, 
  Megaphone, 
  BarChart2, 
  AlertTriangle, 
  Check, 
  X, 
  Plus, 
  Key, 
  Send,
  ArrowLeft,
  ChevronRight,
  TrendingUp,
  Activity,
  Layers,
  Settings
} from 'lucide-react';
import { TournamentStatus, RegistrationRejectionReason, MatchResult } from '@/types';

export default function TournamentDetailPage({ params }: { params: Promise<{ tournamentId: string }> }) {
  const { tournamentId } = use(params);
  
  const { 
    managedTournaments, 
    changeTournamentStatus,
    approveRegistration, 
    rejectRegistration,
    assignSlot,
    swapSlots,
    releaseCredentials,
    publishAnnouncement,
    publishResult,
    correctResult,
    calculatePrizeDistribution,
    approvePrizeDistribution,
    creditDemoPrizes,
    prizeDistributions
  } = useOrganizer();

  const { tournaments } = useTournaments();
  
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'REGISTRATIONS' | 'SLOTS' | 'MATCHES' | 'RESULTS' | 'PRIZES' | 'ANNOUNCEMENTS'>('OVERVIEW');

  // Find Tournament
  const tournament = useMemo(() => {
    return managedTournaments.find((t) => t.id === tournamentId) || 
           tournaments.find((t) => t.id === tournamentId) || null;
  }, [managedTournaments, tournaments, tournamentId]);

  // Fetch registrations
  const registrations = useMemo(() => {
    return localRegistrationRepository.getByTournamentId(tournamentId);
  }, [tournamentId, managedTournaments]);

  // Fetch Slots
  const slots = useMemo(() => {
    return localTournamentSlotRepository.getByTournamentId(tournamentId);
  }, [tournamentId, managedTournaments]);

  // Fetch disputes
  const disputes = useMemo(() => {
    return localDisputeRepository.getAll().filter((d) => d.tournamentId === tournamentId);
  }, [tournamentId]);

  // Fetch local match results (drafts)
  const matchResults = useMemo(() => {
    return localResultRepository.getAll().filter((r) => r.tournamentId === tournamentId);
  }, [tournamentId, managedTournaments]);

  // Fetch prize distributions
  const prizeDist = useMemo(() => {
    return prizeDistributions.find((p) => p.tournamentId === tournamentId) || null;
  }, [prizeDistributions, tournamentId]);

  // Match room credential fields
  const [roomIdInput, setRoomIdInput] = useState('');
  const [roomPasswordInput, setRoomPasswordInput] = useState('');

  // Announcement fields
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annType, setAnnType] = useState<'GENERAL' | 'SCHEDULE_CHANGE' | 'URGENT'>('GENERAL');

  // Result entry fields
  const [resultPlacement, setResultPlacement] = useState('1');
  const [resultKills, setResultKills] = useState('0');
  const [resultDamage, setResultDamage] = useState('0');
  const [selectedRosterId, setSelectedRosterId] = useState('');

  if (!tournament) {
    return (
      <OrganizerShell>
        <div className="text-center py-16">
          <h2 className="text-lg font-bold text-foreground">Tournament Not Found</h2>
          <p className="text-xs text-muted">ID: {tournamentId}</p>
        </div>
      </OrganizerShell>
    );
  }

  // Handle Registration Audit
  const handleApproveReg = (id: string) => {
    if (confirm('Approve this registration team roster and confirm entry fee payment?')) {
      approveRegistration(id);
      alert('Approved successfully!');
    }
  };

  const handleRejectReg = (id: string) => {
    const reason = prompt('Enter rejection reason:\nINCOMPLETE_PROFILE | RULE_VIOLATION | INVALID_GAME_ID', 'INCOMPLETE_PROFILE');
    if (reason) {
      rejectRegistration(id, reason as RegistrationRejectionReason, 'Roster review failed');
      alert('Registration rejected.');
    }
  };

  // Handle Room Release
  const handleReleaseCredentials = () => {
    if (!roomIdInput || !roomPasswordInput) {
      alert('Please fill Room ID and Password.');
      return;
    }
    // We assume matchId is match-tour-5-r1 for seed or generic match ID
    const matchId = `match-${tournament.id}-r1`;
    releaseCredentials(matchId, roomIdInput, roomPasswordInput);
    alert('Credentials released! Notifications and Announcement broadcasted.');
    setRoomIdInput('');
    setRoomPasswordInput('');
  };

  // Handle Announcement
  const handlePublishAnn = () => {
    if (!annTitle || !annContent) return;
    publishAnnouncement({
      tournamentId,
      title: annTitle,
      content: annContent,
      type: annType as any,
      targetAudience: 'ALL'
    });
    alert('Announcement published!');
    setAnnTitle('');
    setAnnContent('');
  };

  // Handle Result submission draft
  const handleAddResultDraft = () => {
    if (!selectedRosterId) {
      alert('Please select a team.');
      return;
    }
    const teamObj = registrations.find((r) => r.teamId === selectedRosterId || r.playerId === selectedRosterId);
    if (!teamObj) return;

    // Save mock result draft
    const placement = Number(resultPlacement) || 1;
    const kills = Number(resultKills) || 0;
    const damage = Number(resultDamage) || 0;

    const mockRes: MatchResult = {
      id: `res-draft-${Date.now()}`,
      tournamentId,
      matchId: `match-${tournament.id}-r1`,
      roundId: 'Round 1',
      registrationId: teamObj.id,
      participantId: selectedRosterId,
      teamId: selectedRosterId,
      participantName: teamObj.teamName || teamObj.playerId,
      teamName: teamObj.teamName,
      placement,
      kills,
      damage,
      placementPoints: placement === 1 ? 10 : placement === 2 ? 6 : placement === 3 ? 5 : 1,
      killPoints: kills * 1,
      totalPoints: (placement === 1 ? 10 : placement === 2 ? 6 : placement === 3 ? 5 : 1) + kills * 1,
      status: 'DRAFT',
      publishedAt: '',
      isDemo: true
    };

    const results = localResultRepository.getAll();
    results.push(mockRes);
    localResultRepository.saveAll(results);
    alert('Result draft saved! Click Publish in Results tab to update standings.');
  };

  // Handle Publish Result
  const handlePublishResultsTab = (id: string) => {
    try {
      publishResult(id);
      alert('Match result published successfully! Standings recalculated.');
    } catch (err: any) {
      alert(err.message || 'Publication failed.');
    }
  };

  // Handle Prize Flow
  const handleCalculatePrizes = () => {
    calculatePrizeDistribution(tournamentId);
    alert('Prize ledger calculated! Go to Prizes tab to review.');
  };

  const handleApprovePrizes = () => {
    approvePrizeDistribution(tournamentId);
    alert('Prize ledger approved.');
  };

  const handleCreditPrizes = () => {
    try {
      creditDemoPrizes(tournamentId);
      alert('Demo prizes successfully credited to players wallets!');
    } catch (err: any) {
      alert(err.message || 'Payout failed.');
    }
  };

  const tabs = [
    { id: 'OVERVIEW', label: 'Overview', icon: BarChart2 },
    { id: 'REGISTRATIONS', label: 'Registrations', icon: Users },
    { id: 'SLOTS', label: 'Slot Grid', icon: Layers },
    { id: 'MATCHES', label: 'Matches & Rooms', icon: Sword },
    { id: 'RESULTS', label: 'Results Audit', icon: CheckSquare },
    { id: 'PRIZES', label: 'Prize Ledger', icon: Gift },
    { id: 'ANNOUNCEMENTS', label: 'Announcements', icon: Megaphone }
  ];

  return (
    <OrganizerShell>
      <div className="flex flex-col gap-6">
        {/* Back Link */}
        <Link 
          href="/organizer/tournaments"
          className="flex items-center gap-1.5 text-xs text-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Tournaments
        </Link>

        {/* Tournament Headline */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-card-border pb-4">
          <div>
            <h1 className="text-xl md:text-2xl font-black text-foreground uppercase tracking-tight">
              {tournament.title}
            </h1>
            <span className="text-xs text-muted font-semibold block mt-0.5">
              Format: {tournament.mode} ({tournament.perspective}) | Status: <span className="text-secondary font-bold">{tournament.status}</span>
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCalculatePrizes}
              className="px-4 py-2 bg-secondary hover:bg-secondary/95 text-white font-extrabold rounded-xl text-xs transition-colors"
            >
              Recalculate Standings Ledger
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex overflow-x-auto gap-2 border-b border-card-border pb-2 scrollbar-none">
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                  active 
                    ? 'border-secondary bg-secondary/15 text-secondary'
                    : 'border-transparent text-muted hover:text-foreground'
                }`}
              >
                <Icon className="h-4 w-4" />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Tab content panel */}
        <div className="p-6 rounded-2xl border border-card-border bg-card-bg/25 min-h-[40vh]">
          {/* TAB 1: Overview */}
          {activeTab === 'OVERVIEW' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Registration utilization */}
              <div className="flex flex-col gap-4 border border-card-border p-4 rounded-xl">
                <h4 className="text-xs font-extrabold text-foreground uppercase">Registration & Slot Bookings</h4>
                <div className="flex items-center justify-between text-xs font-bold text-muted">
                  <span>Capacity filled:</span>
                  <span className="font-mono text-foreground font-black">
                    {registrations.filter((r) => r.status === 'CONFIRMED' || r.status === 'APPROVED').length} / {tournament.maxParticipants} Slots
                  </span>
                </div>
                <div className="w-full bg-card-bg border border-card-border h-3 rounded-full overflow-hidden">
                  <div 
                    className="bg-secondary h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (registrations.filter((r) => r.status === 'CONFIRMED' || r.status === 'APPROVED').length / tournament.maxParticipants) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Status transitions options */}
              <div className="flex flex-col gap-4 border border-card-border p-4 rounded-xl">
                <h4 className="text-xs font-extrabold text-foreground uppercase">Manage Status Stage</h4>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => changeTournamentStatus(tournamentId, 'REGISTRATION_OPEN')}
                    className="px-3.5 py-2 bg-success/15 hover:bg-success/25 border border-success/30 text-success text-xs font-extrabold rounded-lg transition-colors"
                  >
                    Open Registrations
                  </button>
                  <button
                    onClick={() => changeTournamentStatus(tournamentId, 'LIVE')}
                    className="px-3.5 py-2 bg-secondary/15 hover:bg-secondary/25 border border-secondary/30 text-secondary text-xs font-extrabold rounded-lg transition-colors"
                  >
                    Start Matches (LIVE)
                  </button>
                  <button
                    onClick={() => changeTournamentStatus(tournamentId, 'COMPLETED')}
                    className="px-3.5 py-2 bg-primary/15 hover:bg-primary/25 border border-primary/30 text-primary text-xs font-extrabold rounded-lg transition-colors"
                  >
                    Set Completed
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Registrations */}
          {activeTab === 'REGISTRATIONS' && (
            <div className="flex flex-col gap-4">
              <h4 className="text-xs font-extrabold text-foreground uppercase">Audit Participant Roster Registrations</h4>
              {registrations.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted">No registration rosters submitted.</div>
              ) : (
                <div className="flex flex-col gap-3">
                  {registrations.map((reg) => (
                    <div 
                      key={reg.id}
                      className="p-4 rounded-xl border border-card-border bg-card-bg/25 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                    >
                      <div>
                        <span className="font-extrabold text-foreground text-xs block">{reg.teamName || 'Solo Player'}</span>
                        <span className="text-[10px] text-muted font-mono block">ID: {reg.id} | Status: <span className="font-bold text-secondary">{reg.status}</span></span>
                      </div>
                      
                      {reg.status === 'PENDING' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleRejectReg(reg.id)}
                            className="px-3 py-1.5 bg-danger/10 hover:bg-danger/20 border border-danger/25 text-danger rounded-lg text-[10px] font-extrabold transition-colors"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => handleApproveReg(reg.id)}
                            className="px-3 py-1.5 bg-success/10 hover:bg-success/20 border border-success/25 text-success rounded-lg text-[10px] font-extrabold transition-colors"
                          >
                            Approve
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Slots Grid */}
          {activeTab === 'SLOTS' && (
            <div className="flex flex-col gap-4">
              <h4 className="text-xs font-extrabold text-foreground uppercase">Visual Roster Slot Management</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {slots.map((s) => (
                  <div 
                    key={s.id}
                    className={`p-3 rounded-xl border flex flex-col gap-1.5 transition-all text-xs font-semibold ${
                      s.status === 'OCCUPIED'
                        ? 'border-secondary/35 bg-secondary/5 text-foreground'
                        : 'border-card-border bg-card-bg/30 text-muted'
                    }`}
                  >
                    <div className="flex justify-between items-center text-[9px] uppercase tracking-wider">
                      <span>Slot #{s.slotNumber}</span>
                      <span className={s.status === 'OCCUPIED' ? 'text-secondary font-bold' : 'text-muted'}>
                        {s.status}
                      </span>
                    </div>
                    <span className="font-extrabold truncate text-foreground block min-h-[16px]">
                      {s.participantName || 'EMPTY'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: Matches */}
          {activeTab === 'MATCHES' && (
            <div className="flex flex-col gap-6">
              <div className="p-4 rounded-xl border border-card-border bg-card-bg/15 flex flex-col gap-4 max-w-md">
                <h4 className="text-xs font-extrabold text-foreground uppercase flex items-center gap-1.5">
                  <Key className="h-4 w-4 text-secondary" />
                  Publish Match Lobby Credentials
                </h4>
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-muted uppercase">Lobby Room ID</label>
                  <input
                    type="text"
                    value={roomIdInput}
                    onChange={(e) => setRoomIdInput(e.target.value)}
                    placeholder="e.g. 847291"
                    className="p-3 bg-card-bg/60 border border-card-border rounded-xl text-xs text-foreground focus:outline-none"
                  />
                </div>
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-muted uppercase">Lobby Password</label>
                  <input
                    type="password"
                    value={roomPasswordInput}
                    onChange={(e) => setRoomPasswordInput(e.target.value)}
                    placeholder="Lobby Password"
                    className="p-3 bg-card-bg/60 border border-card-border rounded-xl text-xs text-foreground focus:outline-none"
                  />
                </div>

                <button
                  onClick={handleReleaseCredentials}
                  className="w-full py-3 bg-secondary hover:bg-secondary/95 text-white font-extrabold rounded-xl text-xs transition-colors glow-secondary"
                >
                  Broadcast Room Credentials
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: Results */}
          {activeTab === 'RESULTS' && (
            <div className="flex flex-col gap-6">
              {/* Add Draft Result */}
              <div className="p-4 rounded-xl border border-card-border bg-card-bg/15 flex flex-col gap-4 max-w-md">
                <h4 className="text-xs font-extrabold text-foreground uppercase">Enter Match Score placement</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] text-muted">Select Team</label>
                    <select
                      value={selectedRosterId}
                      onChange={(e) => setSelectedRosterId(e.target.value)}
                      className="p-2.5 bg-card-bg/60 border border-card-border rounded-lg text-xs"
                    >
                      <option value="">Choose Team...</option>
                      {registrations.filter((r) => r.status === 'CONFIRMED' || r.status === 'APPROVED').map((r) => (
                        <option key={r.id} value={r.teamId || r.playerId}>{r.teamName || r.playerId}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] text-muted">Placement Rank</label>
                    <input
                      type="number"
                      value={resultPlacement}
                      onChange={(e) => setResultPlacement(e.target.value)}
                      className="p-2.5 bg-card-bg/60 border border-card-border rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] text-muted">Kills Count</label>
                    <input
                      type="number"
                      value={resultKills}
                      onChange={(e) => setResultKills(e.target.value)}
                      className="p-2.5 bg-card-bg/60 border border-card-border rounded-lg text-xs"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] text-muted">Damage score</label>
                    <input
                      type="number"
                      value={resultDamage}
                      onChange={(e) => setResultDamage(e.target.value)}
                      className="p-2.5 bg-card-bg/60 border border-card-border rounded-lg text-xs"
                    />
                  </div>
                </div>

                <button
                  onClick={handleAddResultDraft}
                  className="w-full py-2.5 bg-secondary hover:bg-secondary/90 text-white text-xs font-extrabold rounded-xl"
                >
                  Save Scorecard Draft
                </button>
              </div>

              {/* Draft Results audit list */}
              <div className="flex flex-col gap-3">
                <h4 className="text-xs font-extrabold text-foreground uppercase">Published / Draft Scores Checklist</h4>
                {matchResults.length === 0 ? (
                  <div className="text-xs text-muted">No matches scorecards entered.</div>
                ) : (
                  <div className="flex flex-col gap-2.5">
                    {matchResults.map((r) => (
                      <div 
                        key={r.id}
                        className="p-3.5 rounded-xl border border-card-border bg-card-bg/25 flex justify-between items-center gap-4 text-xs font-semibold"
                      >
                        <div className="flex flex-col">
                          <span className="font-extrabold text-foreground">{r.participantName}</span>
                          <span className="text-[9px] text-muted">Rank: #{r.placement} | Kills: {r.kills} | Status: {r.status}</span>
                        </div>
                        {r.status === 'DRAFT' && (
                          <button
                            onClick={() => handlePublishResultsTab(r.id)}
                            className="px-3 py-1 bg-success/15 hover:bg-success/25 border border-success/30 text-success rounded-lg text-[10px] font-extrabold"
                          >
                            Publish Live
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: Prizes */}
          {activeTab === 'PRIZES' && (
            <div className="flex flex-col gap-6">
              <div className="p-4 rounded-xl border border-card-border bg-card-bg/15 flex flex-col gap-4 max-w-md">
                <h4 className="text-xs font-extrabold text-foreground uppercase">Audit Winnings ledger payouts</h4>
                
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-muted uppercase">Ledger Status</span>
                  <span className="text-xs text-foreground font-extrabold">
                    {prizeDist ? prizeDist.status : 'NOT_READY'}
                  </span>
                </div>

                {prizeDist && (
                  <div className="flex flex-col gap-2 border-t border-card-border pt-3">
                    <span className="text-[9px] text-muted uppercase">Winners recipients:</span>
                    {prizeDist.recipients.map((rec) => (
                      <div key={rec.participantId} className="flex justify-between items-center text-xs">
                        <span className="text-muted">Rank #{rec.rank}: {rec.participantName}</span>
                        <span className="font-mono text-gradient-prize font-bold">₹{rec.prizeAmount}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex flex-col gap-2 mt-2">
                  {!prizeDist && (
                    <button
                      onClick={handleCalculatePrizes}
                      className="w-full py-2.5 bg-secondary hover:bg-secondary/90 text-white text-xs font-bold rounded-lg"
                    >
                      Calculate Prize Distribution
                    </button>
                  )}
                  {prizeDist && prizeDist.status === 'CALCULATED' && (
                    <button
                      onClick={handleApprovePrizes}
                      className="w-full py-2.5 bg-secondary hover:bg-secondary/90 text-white text-xs font-bold rounded-lg"
                    >
                      Approve Prize Distribution
                    </button>
                  )}
                  {prizeDist && prizeDist.status === 'APPROVED' && (
                    <button
                      onClick={handleCreditPrizes}
                      className="w-full py-2.5 bg-success/15 hover:bg-success/25 border border-success/30 text-success text-xs font-bold rounded-lg"
                    >
                      Credit simulated Demo Prizes
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: Announcements */}
          {activeTab === 'ANNOUNCEMENTS' && (
            <div className="flex flex-col gap-6">
              <div className="p-4 rounded-xl border border-card-border bg-card-bg/15 flex flex-col gap-4 max-w-md">
                <h4 className="text-xs font-extrabold text-foreground uppercase flex items-center gap-1">
                  <Megaphone className="h-4.5 w-4.5 text-secondary" />
                  Publish Organizer Broadcast Update
                </h4>
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-muted uppercase">Headline *</label>
                  <input
                    type="text"
                    value={annTitle}
                    onChange={(e) => setAnnTitle(e.target.value)}
                    placeholder="e.g. Round 2 schedule change delay"
                    className="p-3 bg-card-bg/60 border border-card-border rounded-xl text-xs text-foreground focus:outline-none"
                  />
                </div>
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-muted uppercase">Message content</label>
                  <textarea
                    rows={3}
                    value={annContent}
                    onChange={(e) => setAnnContent(e.target.value)}
                    placeholder="Enter broadcast message details..."
                    className="p-3 bg-card-bg/60 border border-card-border rounded-xl text-xs text-foreground resize-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-muted uppercase">Broadcast Urgency</label>
                  <select
                    value={annType}
                    onChange={(e: any) => setAnnType(e.target.value)}
                    className="p-3 bg-card-bg/60 border border-card-border rounded-xl text-xs"
                  >
                    <option value="GENERAL">General update</option>
                    <option value="SCHEDULE_CHANGE">Schedule Delay</option>
                    <option value="URGENT">Urgent Warning</option>
                  </select>
                </div>

                <button
                  onClick={handlePublishAnn}
                  className="w-full py-2.5 bg-secondary hover:bg-secondary/90 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5"
                >
                  <Send className="h-4 w-4" />
                  Broadcast Announcement
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </OrganizerShell>
  );
}
