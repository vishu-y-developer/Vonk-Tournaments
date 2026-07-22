'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Tournament,
  Player,
  Team,
  Registration,
  RegistrationEligibility,
  TournamentSlot
} from '@/types';
import { useRegistrations } from '@/providers/RegistrationProvider';
import { useRegistrationFlow } from '@/hooks/useRegistrationFlow';
import { useTournamentSlots } from '@/hooks/useTournamentSlots';
import { useWallet } from '@/providers/WalletProvider';
import { 
  Trophy, 
  Calendar, 
  User, 
  Users, 
  CheckCircle, 
  AlertTriangle, 
  ChevronRight, 
  ChevronLeft, 
  HelpCircle, 
  ShieldAlert, 
  PlusCircle, 
  ExternalLink,
  Lock,
  Copy,
  TrendingUp,
  RotateCcw
} from 'lucide-react';
import Link from 'next/link';

interface RegistrationWizardProps {
  tournament: Tournament;
  player: Player;
  team: Team | null;
}

export const RegistrationWizard: React.FC<RegistrationWizardProps> = ({
  tournament,
  player,
  team
}) => {
  const { 
    validateEligibility,
    resetRegistrationData,
    seedRegistrationData,
    promoteWaitlistEntry
  } = useRegistrations();

  const { balance } = useWallet();

  // Multi-step Registration controller hook
  const {
    step,
    nextStep,
    prevStep,
    selectedTeam,
    setSelectedTeam,
    selectedRosterIds,
    setSelectedRosterIds,
    selectedSlot,
    setSelectedSlot,
    consent,
    handleConsentChange,
    allConsentChecked,
    isSubmitting,
    error: flowError,
    successRegistration,
    executeRegistration,
    resetFlow
  } = useRegistrationFlow(tournament, player);

  // Sync slots real-time hooks
  const { slots, available } = useTournamentSlots(tournament.id);

  // State to simulate registration failure (controlled by developer panel)
  const [forceFailDebit, setForceFailDebit] = useState(false);
  const [successCopy, setSuccessCopy] = useState(false);

  // Compute eligibility checklist
  const eligibility: RegistrationEligibility = validateEligibility(tournament, player, selectedTeam || team, selectedRosterIds);

  const isWaitlist = available.length === 0;

  // Next triggers per step validations
  const canGoNext = () => {
    if (step === 1) return eligibility.allowed;
    if (step === 2) {
      if (tournament.teamSize > 1) {
        return !!(selectedTeam || team);
      }
      return true;
    }
    if (step === 3) {
      if (tournament.manualSlotSelection && !isWaitlist) {
        return selectedSlot !== undefined;
      }
      return true;
    }
    if (step === 4) return allConsentChecked;
    if (step === 5) return balance >= tournament.entryFee;
    return true;
  };

  const handleRosterToggle = (playerId: string) => {
    if (selectedRosterIds.includes(playerId)) {
      setSelectedRosterIds(selectedRosterIds.filter((id) => id !== playerId));
    } else {
      setSelectedRosterIds([...selectedRosterIds, playerId]);
    }
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setSuccessCopy(true);
    setTimeout(() => setSuccessCopy(false), 2000);
  };

  const handleForceFailToggle = () => {
    setForceFailDebit(!forceFailDebit);
    // Tweak settings in localStorage to enforce failure inside walletService
    const stored = localStorage.getItem('vonk:v1:settings') || '{}';
    const parsed = JSON.parse(stored);
    parsed.devModeOptions = {
      ...parsed.devModeOptions,
      forceWalletDeductionFailure: !forceFailDebit
    };
    localStorage.setItem('vonk:v1:settings', JSON.stringify(parsed));
  };

  const stepLabels = [
    'Eligibility',
    'Roster Select',
    'Slot Booking',
    'Rules Consent',
    'Payment Review',
    'Confirmation'
  ];

  return (
    <div className="space-y-6">
      {/* Dev Controls Sandboxing Panel */}
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 space-y-3">
        <div className="flex items-center gap-2 border-b border-amber-500/25 pb-2">
          <ShieldAlert className="h-4 w-4 text-amber-500" />
          <h4 className="text-xs font-black tracking-wider text-amber-500 uppercase">Demo Registration Controls</h4>
        </div>
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          Manipulate slots allocation, toggle simulated wallet failure states, or trigger waitlist promotions.
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          <button
            onClick={() => {
              if (typeof window !== 'undefined') {
                const s = [...slots];
                s.forEach((item) => {
                  item.status = 'OCCUPIED';
                  item.participantName = 'Simulated Pro Squad';
                });
                localStorage.setItem('vonk:v1:tournament-slots', JSON.stringify(s));
                window.location.reload();
              }
            }}
            className="px-2 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 text-[10px] rounded font-bold transition-all"
          >
            Force Slots Full
          </button>
          <button
            onClick={() => {
              if (typeof window !== 'undefined') {
                const s = [...slots];
                s.forEach((item) => {
                  item.status = 'AVAILABLE';
                  item.participantName = undefined;
                  item.registrationId = undefined;
                });
                localStorage.setItem('vonk:v1:tournament-slots', JSON.stringify(s));
                window.location.reload();
              }
            }}
            className="px-2 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 text-[10px] rounded font-bold transition-all"
          >
            Clear Slots
          </button>
          <button
            onClick={handleForceFailToggle}
            className={`px-2 py-1 text-[10px] rounded font-bold transition-all ${
              forceFailDebit
                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/35 border border-red-500/30'
                : 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20'
            }`}
          >
            {forceFailDebit ? 'Force Wallet Error: Active' : 'Simulate Wallet Debit Error'}
          </button>
          <button
            onClick={() => promoteWaitlistEntry(tournament.id)}
            className="px-2 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 text-[10px] rounded font-bold transition-all"
          >
            Promote Waitlist Entry
          </button>
          <button
            onClick={() => {
              resetRegistrationData();
              window.location.reload();
            }}
            className="px-2 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 text-[10px] rounded font-bold transition-all"
          >
            Reset Registers Data
          </button>
          <button
            onClick={() => {
              seedRegistrationData();
              window.location.reload();
            }}
            className="px-2 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 text-[10px] rounded font-bold transition-all"
          >
            Re-Seed Default Data
          </button>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Hand: Workflow Stepper Wizard */}
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6 space-y-6">
          
          {/* Timeline Steps Indicator */}
          {step <= 6 && (
            <div className="grid grid-cols-6 gap-2 border-b border-border/60 pb-5">
              {stepLabels.map((label, idx) => {
                const active = idx + 1 === step;
                const done = idx + 1 < step;
                return (
                  <div key={label} className="text-center space-y-1">
                    <div className={`h-1.5 w-full rounded-full transition-all duration-300 ${
                      active ? 'bg-primary shadow-[0_0_8px_rgba(251,191,36,0.5)]' : done ? 'bg-green-500' : 'bg-muted'
                    }`} />
                    <span className={`hidden md:block text-[9px] font-black uppercase tracking-wider ${
                      active ? 'text-primary' : done ? 'text-green-400' : 'text-muted'
                    }`}>{label}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Steps Content Area */}
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: -20, x: -20 }}
              className="space-y-5"
            >
              
              {/* STEP 1: ELIGIBILITY CHECK */}
              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-foreground">Step 1: Check Roster Eligibility</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Verify level requirements, account settings, server regions, and balances before proceeding.
                    </p>
                  </div>

                  {/* Checklist display */}
                  <div className="space-y-2 border border-border/80 bg-black/20 rounded-xl p-4">
                    <div className="flex items-center justify-between border-b border-border pb-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-muted">Checks Checklist</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-muted">
                        {eligibility.issues.length} {eligibility.issues.length === 1 ? 'Issue' : 'Issues'} Found
                      </span>
                    </div>

                    <div className="space-y-3 pt-2">
                      {/* Banned check mock row */}
                      <div className="flex items-start justify-between gap-3 text-xs">
                        <div className="space-y-0.5">
                          <h5 className="font-bold">Player Account Restricted check</h5>
                          <p className="text-[10px] text-muted">Verify player profile does not carry tournament locks.</p>
                        </div>
                        {eligibility.issues.some((i) => i.code === 'PLAYER_BANNED') ? (
                          <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
                        ) : (
                          <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                        )}
                      </div>

                      {/* Rank & Tier check */}
                      <div className="flex items-start justify-between gap-3 text-xs border-t border-border/40 pt-2">
                        <div className="space-y-0.5">
                          <h5 className="font-bold">Skill Tier Requirement check</h5>
                          <p className="text-[10px] text-muted">Required level tier is {tournament.level} or above.</p>
                        </div>
                        {eligibility.issues.some((i) => i.code === 'LEVEL_BELOW_MIN') ? (
                          <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />
                        ) : (
                          <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                        )}
                      </div>

                      {/* Character ID checking */}
                      <div className="flex items-start justify-between gap-3 text-xs border-t border-border/40 pt-2">
                        <div className="space-y-0.5">
                          <h5 className="font-bold">Verified BGMI Game IDs</h5>
                          <p className="text-[10px] text-muted">Roster participants must provide verified character digits.</p>
                        </div>
                        {eligibility.issues.some((i) => i.code === 'CHARACTER_ID_MISSING' || i.code === 'INCOMPLETE_ROSTER_PROFILES') ? (
                          <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />
                        ) : (
                          <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                        )}
                      </div>

                      {/* Wallet checking */}
                      <div className="flex items-start justify-between gap-3 text-xs border-t border-border/40 pt-2">
                        <div className="space-y-0.5">
                          <h5 className="font-bold">Demo Balance Coverage</h5>
                          <p className="text-[10px] text-muted">Wallet must have at least ₹{tournament.entryFee} available.</p>
                        </div>
                        {eligibility.issues.some((i) => i.code === 'INSUFFICIENT_BALANCE') ? (
                          <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />
                        ) : (
                          <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                        )}
                      </div>

                      {/* Region Server check */}
                      <div className="flex items-start justify-between gap-3 text-xs border-t border-border/40 pt-2">
                        <div className="space-y-0.5">
                          <h5 className="font-bold">Server Server Region check</h5>
                          <p className="text-[10px] text-muted">Must reside inside tournament server boundary ({tournament.region || 'India'}).</p>
                        </div>
                        {eligibility.issues.some((i) => i.code === 'REGION_MISMATCH') ? (
                          <AlertTriangle className="h-4 w-4 text-yellow-500 shrink-0" />
                        ) : (
                          <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* List issues warnings */}
                  {eligibility.issues.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-red-400 block">Critical Blockers</span>
                      <div className="space-y-2">
                        {eligibility.issues.map((issue) => (
                          <div 
                            key={issue.code}
                            className={`rounded-lg border p-3 flex justify-between items-center text-xs ${
                              issue.severity === 'CRITICAL' ? 'border-red-500/20 bg-red-500/5' : 'border-yellow-500/20 bg-yellow-500/5'
                            }`}
                          >
                            <div className="space-y-0.5">
                              <span className={`font-black ${issue.severity === 'CRITICAL' ? 'text-red-400' : 'text-yellow-400'}`}>
                                {issue.title}
                              </span>
                              <p className="text-[10px] text-muted-foreground">{issue.message}</p>
                            </div>
                            
                            {/* Suggested actions redirects */}
                            {issue.code === 'INSUFFICIENT_BALANCE' && (
                              <Link href="/wallet" className="px-2 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[10px] rounded font-bold transition-all">
                                Load Demo Cash
                              </Link>
                            )}
                            {issue.code === 'CHARACTER_ID_MISSING' && (
                              <Link href="/profile" className="px-2 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[10px] rounded font-bold transition-all">
                                Edit Game ID
                              </Link>
                            )}
                            {issue.code === 'TEAM_REQUIRED' && (
                              <Link href="/teams/create" className="px-2 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[10px] rounded font-bold transition-all">
                                Create Squad
                              </Link>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {eligibility.allowed && (
                    <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-4 flex gap-3 text-xs text-green-400">
                      <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <span className="font-bold"> Roster Eligible!</span>
                        <p className="text-[10px] text-green-500/80">You pass all level, region, account parameters. Proceed to participant setup.</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 2: PARTICIPANT SELECTION */}
              {step === 2 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-foreground">Step 2: Participant Roster Selection</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Confirm roster players and active substitutes for this tournament mode format.
                    </p>
                  </div>

                  {tournament.teamSize === 1 ? (
                    /* Solo flow details card */
                    <div className="rounded-xl border border-border bg-black/25 p-4 space-y-3">
                      <span className="text-[10px] font-black uppercase text-muted tracking-wider">Solo Player Profile</span>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center text-primary font-black border border-primary/20">
                          {player.username.substring(0,2).toUpperCase()}
                        </div>
                        <div className="space-y-0.5">
                          <h4 className="text-sm font-bold text-foreground">{player.username}</h4>
                          <span className="text-[10px] text-muted font-bold block">IGN: {player.inGameName || 'Not Set'}</span>
                          <span className="text-[10px] text-muted block">Character ID: {player.characterId || 'Not Set'}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Team roster selection card */
                    <div className="space-y-4">
                      {!(selectedTeam || team) ? (
                        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-5 text-center space-y-3">
                          <AlertTriangle className="h-8 w-8 text-red-500 mx-auto" />
                          <h4 className="text-sm font-bold">Roster Missing</h4>
                          <p className="text-xs text-muted max-w-sm mx-auto">
                            This tournament requires a squad. Create or join a team team format first to participate.
                          </p>
                          <Link href="/teams/create" className="inline-block px-3 py-1.5 bg-red-500/10 text-red-400 font-bold text-xs rounded hover:bg-red-500/20 transition-all">
                            Create Team
                          </Link>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="rounded-xl border border-border bg-black/25 p-4 flex justify-between items-center">
                            <div className="space-y-0.5">
                              <span className="text-[10px] font-black uppercase text-muted tracking-wider">Selected Squad Team</span>
                              <h4 className="text-sm font-bold text-primary">{(selectedTeam || team)?.name}</h4>
                            </div>
                            <span className="text-xs font-bold px-2 py-0.5 rounded bg-white/5 border border-border">
                              {(selectedTeam || team)?.type} Format
                            </span>
                          </div>

                          <div className="space-y-2">
                            <span className="text-[10px] font-black uppercase text-muted tracking-wider block"> Roster Members Selection</span>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {(selectedTeam || team)?.members.map((member) => {
                                const selected = selectedRosterIds.length === 0 || selectedRosterIds.includes(member.playerId);
                                const isLeader = (selectedTeam || team)?.captainId === member.playerId;
                                return (
                                  <div
                                    key={member.playerId}
                                    onClick={() => handleRosterToggle(member.playerId)}
                                    className={`rounded-xl border p-3 flex justify-between items-center cursor-pointer transition-all ${
                                      selected 
                                        ? 'border-primary bg-primary/5 shadow-[0_0_8px_rgba(251,191,36,0.1)]' 
                                        : 'border-border bg-card/40 hover:border-white/10 opacity-70'
                                    }`}
                                  >
                                    <div className="space-y-0.5">
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-xs font-bold text-foreground">{member.inGameName}</span>
                                        {isLeader && (
                                          <span className="text-[8px] font-black uppercase bg-primary/20 text-primary px-1 rounded">
                                            Leader
                                          </span>
                                        )}
                                      </div>
                                      <span className="text-[9px] text-muted block">ID: {member.characterId || 'N/A'}</span>
                                      <span className="text-[9px] text-muted uppercase block font-bold">{member.role}</span>
                                    </div>

                                    <div className={`h-4 w-4 rounded-full border flex items-center justify-center transition-all ${
                                      selected ? 'border-primary bg-primary text-background' : 'border-muted'
                                    }`}>
                                      {selected && <CheckCircle className="h-3 w-3" />}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              )}

              {/* STEP 3: SLOT SELECTION */}
              {step === 3 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-foreground">Step 3: Tournament Slot Grid Selection</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Select your preferred battle slot mapping number. Availability is simulated in real time locally.
                    </p>
                  </div>

                  {isWaitlist ? (
                    <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4 space-y-2">
                      <span className="text-xs font-bold text-yellow-400 block">Queue Registration Active</span>
                      <p className="text-[10px] text-muted-foreground leading-relaxed">
                        Confirmed slots are currently full. Proceeding will enroll your squad in the waitlist queue.
                        If a slot becomes released, waitlist orders are promoted automatically.
                      </p>
                    </div>
                  ) : tournament.manualSlotSelection ? (
                    <div className="space-y-4">
                      {/* Slot selector legends */}
                      <div className="flex flex-wrap gap-4 text-[10px] font-bold border-b border-border/40 pb-3">
                        <div className="flex items-center gap-1.5">
                          <div className="h-3.5 w-3.5 rounded border border-border bg-card" />
                          <span className="text-muted">Available</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="h-3.5 w-3.5 rounded bg-primary text-background flex items-center justify-center"><CheckCircle className="h-2.5 w-2.5" /></div>
                          <span className="text-primary font-black">Your Selection</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="h-3.5 w-3.5 rounded bg-white/5 border border-border/60 opacity-60" />
                          <span className="text-muted/75">Occupied / Locked</span>
                        </div>
                      </div>

                      {/* Grid */}
                      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2">
                        {slots.map((s) => {
                          const isOccupied = s.status === 'OCCUPIED';
                          const isSelected = selectedSlot === s.slotNumber;
                          
                          return (
                            <button
                              key={s.id}
                              disabled={isOccupied}
                              onClick={() => setSelectedSlot(s.slotNumber)}
                              className={`h-11 rounded-lg border flex flex-col justify-center items-center text-xs font-bold transition-all relative ${
                                isOccupied 
                                  ? 'bg-white/5 border-border/30 text-muted/30 cursor-not-allowed opacity-40'
                                  : isSelected
                                    ? 'border-primary bg-primary/10 text-primary shadow-[0_0_8px_rgba(251,191,36,0.3)]'
                                    : 'border-border bg-card hover:border-white/10 text-foreground'
                              }`}
                            >
                              <span className="text-[10px] block">Slot</span>
                              <span className="text-sm font-black">{s.slotNumber}</span>
                            </button>
                          );
                        })}
                      </div>

                      {selectedSlot && (
                        <div className="rounded-lg bg-primary/5 border border-primary/20 p-2.5 text-center text-xs font-bold text-primary">
                          Selected Slot Number: Slot #{selectedSlot}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-border bg-black/25 p-5 text-center space-y-2">
                      <TrendingUp className="h-8 w-8 text-primary mx-auto opacity-70 animate-pulse" />
                      <h4 className="text-sm font-bold">Auto Slot Allocation Enabled</h4>
                      <p className="text-xs text-muted max-w-sm mx-auto">
                        Your squad will be automatically assigned the next available room slot number upon confirmation.
                      </p>
                    </div>
                  )}

                </div>
              )}

              {/* STEP 4: RULES AND CONSENT */}
              {step === 4 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-foreground">Step 4: Rules Verification & Legal Consent</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Accept terms and conditions for participating in VONK competitive lobbies.
                    </p>
                  </div>

                  {/* Rules preview container */}
                  <div className="rounded-xl border border-border bg-black/25 p-4 max-h-[160px] overflow-y-auto space-y-2.5 text-xs text-muted-foreground leading-relaxed">
                    <span className="font-bold text-foreground block">Tournament Rulebook:</span>
                    <ol className="list-decimal list-inside space-y-1.5">
                      <li>Hacking, scripting, or device emulation is strictly prohibited. All players must use registered mobile devices.</li>
                      <li>Team rosters are locked 1 hour prior to match launch. Late substitutes are not allowed.</li>
                      <li> Lobbies start exactly at the scheduled time. Slots not occupied at room start are disqualified.</li>
                      <li>Refund requests are governed by the refund policy rules before the cancellation deadline.</li>
                      <li>Lobby Room ID and passwords will be released exactly 15 minutes before the match start.</li>
                    </ol>
                  </div>

                  {/* Consent Checkboxes */}
                  <div className="space-y-2 pt-2 text-xs">
                    <label className="flex items-start gap-2.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={consent.rulesReviewed}
                        onChange={(e) => handleConsentChange('rulesReviewed', e.target.checked)}
                        className="mt-0.5 rounded accent-primary bg-card border-border"
                      />
                      <span>I have fully reviewed and agreed to the official tournament rules and scoring weights.</span>
                    </label>

                    <label className="flex items-start gap-2.5 cursor-pointer select-none border-t border-border/40 pt-2">
                      <input
                        type="checkbox"
                        checked={consent.infoCorrect}
                        onChange={(e) => handleConsentChange('infoCorrect', e.target.checked)}
                        className="mt-0.5 rounded accent-primary bg-card border-border"
                      />
                      <span>I verify that my roster character names and BGMI character digits are accurate.</span>
                    </label>

                    <label className="flex items-start gap-2.5 cursor-pointer select-none border-t border-border/40 pt-2">
                      <input
                        type="checkbox"
                        checked={consent.isDemoUnderstood}
                        onChange={(e) => handleConsentChange('isDemoUnderstood', e.target.checked)}
                        className="mt-0.5 rounded accent-primary bg-card border-border"
                      />
                      <span>I understand that this is a simulated transaction. No real money or slot entries are involved.</span>
                    </label>

                    <label className="flex items-start gap-2.5 cursor-pointer select-none border-t border-border/40 pt-2">
                      <input
                        type="checkbox"
                        checked={consent.refundPolicyAccepted}
                        onChange={(e) => handleConsentChange('refundPolicyAccepted', e.target.checked)}
                        className="mt-0.5 rounded accent-primary bg-card border-border"
                      />
                      <span>I accept the cancellation and refund policy timeline details.</span>
                    </label>
                  </div>

                </div>
              )}

              {/* STEP 5: PAYMENT REVIEW */}
              {step === 5 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-foreground">Step 5: simulated Checkout Invoice</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Review entry fees, wallet balances, and simulated credits.
                    </p>
                  </div>

                  {tournament.entryFee === 0 ? (
                    <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-5 text-center space-y-3">
                      <CheckCircle className="h-8 w-8 text-green-500 mx-auto" />
                      <h4 className="text-sm font-bold text-green-400">Free Entry Tournament</h4>
                      <p className="text-xs text-muted max-w-sm mx-auto">
                        This is a free-to-play beginner tournament lobby. No demo balance will be deducted.
                      </p>
                      <div className="bg-black/35 py-2 px-4 rounded-lg inline-block text-xs font-black">
                        Deduction: ₹0.00
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="rounded-xl border border-border bg-black/25 p-4 space-y-2 text-xs">
                        <div className="flex justify-between items-center text-muted">
                          <span>Simulated Entry Fee:</span>
                          <span className="font-bold text-foreground">₹{tournament.entryFee}</span>
                        </div>
                        <div className="flex justify-between items-center text-muted border-t border-border/40 pt-2">
                          <span>Available Demo Balance:</span>
                          <span className="font-bold text-foreground">₹{balance}</span>
                        </div>
                        <div className="flex justify-between items-center border-t border-border/60 pt-2 font-bold text-sm">
                          <span>Balance After Registration:</span>
                          <span className={balance >= tournament.entryFee ? 'text-green-400' : 'text-red-400'}>
                            ₹{Math.max(0, balance - tournament.entryFee)}
                          </span>
                        </div>
                      </div>

                      {balance < tournament.entryFee && (
                        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 space-y-3 text-xs text-red-400">
                          <div className="flex gap-2 font-bold">
                            <AlertTriangle className="h-4 w-4 shrink-0" />
                            <span>Insufficient Simulated Funds</span>
                          </div>
                          <p className="text-[10px] text-muted-foreground leading-relaxed">
                            You need an additional ₹{tournament.entryFee - balance} to register. You can add demo cash instantly for mock testing.
                          </p>
                          <Link href="/wallet" className="inline-block px-3 py-1 bg-red-500/10 text-red-400 font-bold text-[10px] rounded hover:bg-red-500/20 transition-all">
                            Add Demo Cash
                          </Link>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              )}

              {/* STEP 6: FINAL CONFIRMATION */}
              {step === 6 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-foreground">Step 6: Confirm Slot Roster Booking</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Check your final parameters checklist before submitting slot orders.
                    </p>
                  </div>

                  <div className="rounded-xl border border-border bg-black/25 p-4 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted">Target Tournament:</span>
                      <span className="font-bold">{tournament.title}</span>
                    </div>
                    <div className="flex justify-between border-t border-border/40 pt-2">
                      <span className="text-muted">Roster Participant:</span>
                      <span className="font-bold">
                        {tournament.teamSize > 1 ? `Team: ${selectedTeam?.name || team?.name}` : `Player: ${player.username}`}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-border/40 pt-2">
                      <span className="text-muted">Mode format:</span>
                      <span className="font-bold">{tournament.registrationFormat || 'Squad'} ({tournament.perspective})</span>
                    </div>
                    <div className="flex justify-between border-t border-border/40 pt-2">
                      <span className="text-muted">Allocated Slot Number:</span>
                      <span className="font-bold text-primary">
                        {isWaitlist ? 'Waitlist Placement' : selectedSlot ? `Slot #${selectedSlot}` : 'Auto Assigned'}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-border/40 pt-2">
                      <span className="text-muted">Invoice Cost:</span>
                      <span className="font-bold text-yellow-400">₹{tournament.entryFee}</span>
                    </div>
                  </div>

                  {flowError && (
                    <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-xs text-red-400 flex gap-2">
                      <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                      <span>{flowError}</span>
                    </div>
                  )}

                  <button
                    onClick={executeRegistration}
                    disabled={isSubmitting}
                    className="w-full py-3 bg-gradient-to-r from-primary to-yellow-500 text-background font-black text-xs rounded-xl shadow-[0_4px_12px_rgba(251,191,36,0.25)] hover:shadow-[0_4px_16px_rgba(251,191,36,0.35)] transition-all flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <RotateCcw className="h-4 w-4 animate-spin text-background" />
                        <span>Confirming Slot...</span>
                      </>
                    ) : (
                      <span>Confirm Demo Registration</span>
                    )}
                  </button>

                  <p className="text-[9px] text-muted text-center leading-relaxed">
                    This registration submits simulated balance logs. No actual slots or room logins are issued.
                  </p>
                </div>
              )}

              {/* SUCCESS STATE */}
              {step === 7 && successRegistration && (
                <div className="space-y-6 text-center py-6">
                  <div className="h-16 w-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400 mx-auto shadow-[0_0_15px_rgba(34,197,94,0.15)]">
                    <CheckCircle className="h-8 w-8" />
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-lg font-black text-green-400">Demo Registration Complete!</h3>
                    <p className="text-xs text-muted max-w-sm mx-auto">
                      Slot confirmed. Registration ledger saved to local browser state successfully.
                    </p>
                  </div>

                  {/* Details receipt */}
                  <div className="rounded-xl border border-border bg-black/20 p-4 max-w-md mx-auto text-left text-xs space-y-2">
                    <div className="flex justify-between items-center border-b border-border pb-2 text-[10px] font-black uppercase text-muted">
                      <span>Receipt Invoice</span>
                      <button 
                        onClick={() => handleCopyId(successRegistration.id)}
                        className="flex items-center gap-1 hover:text-foreground text-muted text-[9px] transition-all"
                      >
                        {successCopy ? 'Copied!' : 'Copy ID'}
                        <Copy className="h-3 w-3" />
                      </button>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-muted">Registration ID:</span>
                      <span className="font-bold text-foreground">{successRegistration.id}</span>
                    </div>

                    <div className="flex justify-between border-t border-border/40 pt-2">
                      <span className="text-muted">Assigned Slot:</span>
                      <span className="font-bold text-primary">
                        {successRegistration.slotNumber ? `Slot #${successRegistration.slotNumber}` : 'Waitlist Position #1'}
                      </span>
                    </div>

                    <div className="flex justify-between border-t border-border/40 pt-2">
                      <span className="text-muted">Roster size:</span>
                      <span className="font-bold text-foreground">{successRegistration.membersRegistered.length} Players</span>
                    </div>

                    <div className="flex justify-between border-t border-border/40 pt-2">
                      <span className="text-muted">Invoice Paid:</span>
                      <span className="font-bold text-green-400">₹{successRegistration.entryFeePaid} (Simulated)</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 max-w-xs mx-auto pt-2">
                    <Link
                      href="/registrations"
                      className="px-4 py-2 bg-primary text-background font-black text-xs rounded-lg transition-all"
                    >
                      View My Registrations
                    </Link>
                    <button
                      onClick={resetFlow}
                      className="px-4 py-2 border border-border bg-transparent hover:bg-white/5 text-muted hover:text-foreground text-xs font-bold rounded-lg transition-all"
                    >
                      Register Another Team
                    </button>
                  </div>

                  <span className="text-[9px] text-muted block max-w-xs mx-auto leading-relaxed">
                    Notice: This was a simulated ledger confirmation created under local browser storage. No real match logins are issued.
                  </span>
                </div>
              )}

            </motion.div>
          </AnimatePresence>

          {/* Stepper Bottom Control buttons */}
          {step < 7 && (
            <div className="flex justify-between items-center border-t border-border/60 pt-4">
              <button
                disabled={step === 1 || isSubmitting}
                onClick={prevStep}
                className="flex items-center gap-1 px-4 py-2 border border-border rounded-lg bg-transparent text-muted hover:text-foreground hover:bg-white/5 text-xs font-bold transition-all disabled:opacity-30 disabled:pointer-events-none"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Back</span>
              </button>

              {step < 6 ? (
                <button
                  disabled={!canGoNext()}
                  onClick={nextStep}
                  className="flex items-center gap-1 px-5 py-2 rounded-lg bg-primary text-background text-xs font-black transition-all hover:bg-yellow-500 disabled:opacity-40 disabled:pointer-events-none"
                >
                  <span>Continue</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              ) : null}
            </div>
          )}

        </div>

        {/* Right Hand: Sidebar Tournament Details Summary */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-5 space-y-4 sticky top-6">
            <span className="text-[10px] font-black uppercase text-muted tracking-wider block">Tournament Overview</span>
            
            <div className="aspect-video w-full rounded-xl overflow-hidden relative border border-border bg-black/25">
              <img
                src={tournament.banner || '/images/default-banner.jpg'}
                alt={tournament.title}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 text-left">
                <span className="text-[8px] font-black uppercase bg-primary text-background px-1.5 py-0.5 rounded">
                  {tournament.mode}
                </span>
                <h4 className="text-sm font-bold text-white truncate mt-1">{tournament.title}</h4>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between border-b border-border/40 pb-2">
                <span className="text-muted">Match Date:</span>
                <span className="font-bold text-foreground">
                  {new Date(tournament.matchStart).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="flex justify-between border-b border-border/40 pb-2">
                <span className="text-muted">Lobby Format:</span>
                <span className="font-bold text-foreground">{tournament.registrationFormat || 'Squad'} ({tournament.perspective})</span>
              </div>
              <div className="flex justify-between border-b border-border/40 pb-2">
                <span className="text-muted">Available Slots:</span>
                <span className="font-bold text-foreground">{available.length} / {tournament.maximumSlots || tournament.maxParticipants}</span>
              </div>
              <div className="flex justify-between font-bold text-sm text-primary">
                <span>Simulated Entry Fee:</span>
                <span>₹{tournament.entryFee}</span>
              </div>
            </div>

            <div className="rounded-xl border border-border/60 bg-black/20 p-3 space-y-2 text-[10px] text-muted-foreground leading-relaxed">
              <div className="flex gap-2">
                <HelpCircle className="h-4 w-4 shrink-0 text-primary" />
                <div className="space-y-0.5">
                  <span className="font-bold text-foreground block">Cancellation & Refund Policy</span>
                  <p>
                    Cancellations allowed up to 1 hour before lobby starts. Full demo refund will be issued back.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
