'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useOrganizer } from '@/providers/OrganizerProvider';
import OrganizerShell from '@/components/organizer/OrganizerShell';
import { 
  Trophy, 
  Calendar, 
  Users, 
  Gift, 
  CheckSquare, 
  FileText, 
  Eye, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  AlertTriangle 
} from 'lucide-react';
import { Tournament, TournamentMode, TournamentLevel } from '@/types';

export default function CreateTournamentPage() {
  const router = useRouter();
  const { createTournament } = useOrganizer();

  const [step, setStep] = useState(1);

  // Form State
  const [formData, setFormData] = useState<any>(() => ({
    title: '',
    slug: '',
    description: '',
    game: 'BGMI',
    mode: 'Squad',
    map: 'Erangel',
    perspective: 'TPP',
    level: 'Intermediate',
    tags: ['BGMI', 'Squad', 'Clash'],
    visibility: 'Public',

    registrationStart: new Date().toISOString().substring(0, 16),
    registrationEnd: new Date(Date.now() + 86400000 * 3).toISOString().substring(0, 16),
    matchStart: new Date(Date.now() + 86400000 * 4).toISOString().substring(0, 16),
    roomReleaseTime: new Date(Date.now() + 86400000 * 4 - 900000).toISOString().substring(0, 16),
    timezone: 'Asia/Kolkata',

    maxParticipants: 16,
    teamSize: 4,
    substituteLimit: 2,
    minimumPlayers: 4,
    maximumPlayers: 6,
    captainOnlyRegistration: true,
    manualSlotSelection: true,
    waitlistEnabled: true,
    refundPolicy: 'REFUND_BEFORE_DEADLINE',
    cancellationDeadline: new Date(Date.now() + 86400000 * 2).toISOString().substring(0, 16),
    refundPercentage: 100,

    entryFee: 0,
    prizePool: 1000,
    perKillReward: 0,
    mvpReward: 0,

    pointsPerKill: 1,
    placementPoints_1: 10,
    placementPoints_2: 6,
    placementPoints_3: 5,
    placementPoints_4: 4,
    placementPoints_5: 3,

    generalRules: '1. Emulators are strictly banned.\n2. Team matches coordinates are published 15 minutes prior to match.',
    fairPlayRules: 'No cheats or screen-stretching features allowed.'
  }));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev: any) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev: any) => ({ ...prev, [name]: value }));
    }
  };

  const handleCreate = (status: 'DRAFT' | 'REGISTRATION_OPEN') => {
    // Generate placement points map
    const placementPoints = {
      1: Number(formData.placementPoints_1) || 10,
      2: Number(formData.placementPoints_2) || 6,
      3: Number(formData.placementPoints_3) || 5,
      4: Number(formData.placementPoints_4) || 4,
      5: Number(formData.placementPoints_5) || 3
    };

    const finalData: Partial<Tournament> = {
      title: formData.title || 'Draft BGMI Clash',
      slug: (formData.title || 'draft-bgmi-clash').toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
      description: formData.description,
      game: formData.game,
      mode: formData.mode as TournamentMode,
      map: formData.map,
      perspective: formData.perspective,
      level: formData.level as TournamentLevel,
      entryFee: Number(formData.entryFee) || 0,
      prizePool: Number(formData.prizePool) || 0,
      perKillReward: Number(formData.perKillReward) || 0,
      maxParticipants: Number(formData.maxParticipants) || 16,
      teamSize: Number(formData.teamSize) || 4,
      substituteLimit: Number(formData.substituteLimit) || 2,
      registrationStart: new Date(formData.registrationStart).toISOString(),
      registrationEnd: new Date(formData.registrationEnd).toISOString(),
      matchStart: new Date(formData.matchStart).toISOString(),
      roomReleaseTime: new Date(formData.roomReleaseTime).toISOString(),
      status: status as any,
      visibility: formData.visibility,
      rules: [formData.generalRules, formData.fairPlayRules],
      scoringSystem: {
        pointsPerKill: Number(formData.pointsPerKill) || 1,
        placementPoints
      },
      prizeDistribution: {
        placePercentages: { 1: 50, 2: 30, 3: 20 },
        perKillReward: Number(formData.perKillReward) || 0
      },
      tags: formData.tags,
      featured: false,
      minimumPlayers: Number(formData.minimumPlayers) || 4,
      maximumPlayers: Number(formData.maximumPlayers) || 6,
      captainOnlyRegistration: formData.captainOnlyRegistration,
      manualSlotSelection: formData.manualSlotSelection,
      maximumSlots: Number(formData.maxParticipants) || 16,
      waitlistEnabled: formData.waitlistEnabled,
      refundPolicy: formData.refundPolicy,
      cancellationDeadline: new Date(formData.cancellationDeadline).toISOString(),
      refundPercentage: Number(formData.refundPercentage) || 100
    };

    try {
      const tour = createTournament(finalData);
      alert(`Tournament created successfully (Status: ${status}).`);
      router.push(`/organizer/tournaments/${tour.id}`);
    } catch (err: any) {
      alert(err.message || 'Failed to create.');
    }
  };

  const stepsList = [
    { label: 'Basic Information', icon: Trophy },
    { label: 'Schedule Times', icon: Calendar },
    { label: 'Participation Rules', icon: Users },
    { label: 'Entry & Winnings', icon: Gift },
    { label: 'Scoring Rules', icon: CheckSquare },
    { label: 'Rules & Policies', icon: FileText },
    { label: 'Review & Launch', icon: Eye }
  ];

  return (
    <OrganizerShell>
      <div className="flex flex-col gap-6 max-w-4xl mx-auto">
        {/* Creation header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-secondary/15 flex items-center justify-center text-secondary">
            <Trophy className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-foreground uppercase tracking-tight">
              Create New Tournament
            </h1>
            <p className="text-xs text-muted">
              Configure brackets, entry fees, schedule timelines, and scoring systems step by step.
            </p>
          </div>
        </div>

        {/* Stepper Wizard Indicator */}
        <div className="grid grid-cols-7 gap-1 border-b border-card-border pb-4">
          {stepsList.map((s, idx) => {
            const Icon = s.icon;
            const active = idx + 1 === step;
            const completed = idx + 1 < step;
            return (
              <div 
                key={s.label}
                className="flex flex-col items-center text-center gap-1 group"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border text-xs font-bold transition-all ${
                  active 
                    ? 'border-secondary bg-secondary/15 text-secondary glow-secondary'
                    : completed
                      ? 'border-success bg-success/15 text-success'
                      : 'border-card-border bg-card-bg text-muted'
                }`}>
                  {completed ? <Check className="h-4 w-4" /> : idx + 1}
                </div>
                <span className={`text-[8px] uppercase tracking-wider font-extrabold hidden md:inline ${
                  active ? 'text-secondary' : 'text-muted'
                }`}>
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Stepper Body Container */}
        <div className="p-6 rounded-2xl border border-card-border bg-card-bg/25">
          {/* STEP 1: Basic Information */}
          {step === 1 && (
            <div className="flex flex-col gap-4">
              <h3 className="text-sm font-extrabold uppercase text-foreground">Step 1 — Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-muted uppercase">Tournament Name *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g. VONK Pro League Season 4"
                    className="p-3 bg-card-bg/60 border border-card-border rounded-xl text-xs text-foreground focus:outline-none focus:border-secondary/40 transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-muted uppercase">Game Engine *</label>
                  <select
                    name="game"
                    value={formData.game}
                    onChange={handleChange}
                    className="p-3 bg-card-bg/60 border border-card-border rounded-xl text-xs text-foreground focus:outline-none focus:border-secondary/40"
                  >
                    <option value="BGMI">BGMI</option>
                    <option value="Valorant Mobile">Valorant Mobile</option>
                    <option value="COD Mobile">COD Mobile</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-muted uppercase">Match Mode</label>
                  <select
                    name="mode"
                    value={formData.mode}
                    onChange={handleChange}
                    className="p-3 bg-card-bg/60 border border-card-border rounded-xl text-xs text-foreground focus:outline-none focus:border-secondary/40"
                  >
                    <option value="Solo">Solo</option>
                    <option value="Duo">Duo</option>
                    <option value="Squad">Squad</option>
                    <option value="TDM 4v4">TDM 4v4</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-muted uppercase">Map Pool</label>
                  <select
                    name="map"
                    value={formData.map}
                    onChange={handleChange}
                    className="p-3 bg-card-bg/60 border border-card-border rounded-xl text-xs text-foreground focus:outline-none"
                  >
                    <option value="Erangel">Erangel</option>
                    <option value="Miramar">Miramar</option>
                    <option value="Sanhok">Sanhok</option>
                    <option value="Vikendi">Vikendi</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-muted uppercase">Perspective</label>
                  <select
                    name="perspective"
                    value={formData.perspective}
                    onChange={handleChange}
                    className="p-3 bg-card-bg/60 border border-card-border rounded-xl text-xs text-foreground"
                  >
                    <option value="TPP">TPP</option>
                    <option value="FPP">FPP</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-muted uppercase">Description</label>
                <textarea
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Detail the tournament overview, streaming channels, and check-in steps..."
                  className="p-3 bg-card-bg/60 border border-card-border rounded-xl text-xs text-foreground resize-none"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Schedule */}
          {step === 2 && (
            <div className="flex flex-col gap-4">
              <h3 className="text-sm font-extrabold uppercase text-foreground">Step 2 — Schedule Timeline</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-muted uppercase">Registration Opens</label>
                  <input
                    type="datetime-local"
                    name="registrationStart"
                    value={formData.registrationStart}
                    onChange={handleChange}
                    className="p-3 bg-card-bg/60 border border-card-border rounded-xl text-xs text-foreground"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-muted uppercase">Registration Closes</label>
                  <input
                    type="datetime-local"
                    name="registrationEnd"
                    value={formData.registrationEnd}
                    onChange={handleChange}
                    className="p-3 bg-card-bg/60 border border-card-border rounded-xl text-xs text-foreground"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-muted uppercase">Tournament Match Starts</label>
                  <input
                    type="datetime-local"
                    name="matchStart"
                    value={formData.matchStart}
                    onChange={handleChange}
                    className="p-3 bg-card-bg/60 border border-card-border rounded-xl text-xs text-foreground"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-muted uppercase">Credentials Release Time</label>
                  <input
                    type="datetime-local"
                    name="roomReleaseTime"
                    value={formData.roomReleaseTime}
                    onChange={handleChange}
                    className="p-3 bg-card-bg/60 border border-card-border rounded-xl text-xs text-foreground"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Participation Rules */}
          {step === 3 && (
            <div className="flex flex-col gap-4">
              <h3 className="text-sm font-extrabold uppercase text-foreground">Step 3 — Participation & Slots</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-muted uppercase">Max Slot Slots</label>
                  <input
                    type="number"
                    name="maxParticipants"
                    value={formData.maxParticipants}
                    onChange={handleChange}
                    className="p-3 bg-card-bg/60 border border-card-border rounded-xl text-xs text-foreground"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-muted uppercase">Team Roster Size</label>
                  <input
                    type="number"
                    name="teamSize"
                    value={formData.teamSize}
                    onChange={handleChange}
                    className="p-3 bg-card-bg/60 border border-card-border rounded-xl text-xs text-foreground"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-muted uppercase">Max Substitutes</label>
                  <input
                    type="number"
                    name="substituteLimit"
                    value={formData.substituteLimit}
                    onChange={handleChange}
                    className="p-3 bg-card-bg/60 border border-card-border rounded-xl text-xs text-foreground"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3 mt-2">
                <label className="flex items-center gap-2 text-xs text-foreground font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    name="captainOnlyRegistration"
                    checked={formData.captainOnlyRegistration}
                    onChange={(e) => setFormData((prev: any) => ({ ...prev, captainOnlyRegistration: e.target.checked }))}
                    className="h-4 w-4 rounded bg-card-bg border-card-border text-secondary focus:ring-0"
                  />
                  Captain-Only Registration (Only team captain can register details)
                </label>
                <label className="flex items-center gap-2 text-xs text-foreground font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    name="manualSlotSelection"
                    checked={formData.manualSlotSelection}
                    onChange={(e) => setFormData((prev: any) => ({ ...prev, manualSlotSelection: e.target.checked }))}
                    className="h-4 w-4 rounded bg-card-bg border-card-border text-secondary focus:ring-0"
                  />
                  Manual Slot Selection (Teams choose their slot number on success checkout)
                </label>
              </div>
            </div>
          )}

          {/* STEP 4: Entry fee and Prizes */}
          {step === 4 && (
            <div className="flex flex-col gap-4">
              <h3 className="text-sm font-extrabold uppercase text-foreground">Step 4 — Entry & Prize Pool</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-muted uppercase">Demo Entry Fee (₹)</label>
                  <input
                    type="number"
                    name="entryFee"
                    value={formData.entryFee}
                    onChange={handleChange}
                    placeholder="0 for FREE tournament"
                    className="p-3 bg-card-bg/60 border border-card-border rounded-xl text-xs text-foreground"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-muted uppercase">Demo Prize Pool (₹)</label>
                  <input
                    type="number"
                    name="prizePool"
                    value={formData.prizePool}
                    onChange={handleChange}
                    className="p-3 bg-card-bg/60 border border-card-border rounded-xl text-xs text-foreground"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-muted uppercase">Per-Kill Reward (₹)</label>
                  <input
                    type="number"
                    name="perKillReward"
                    value={formData.perKillReward}
                    onChange={handleChange}
                    className="p-3 bg-card-bg/60 border border-card-border rounded-xl text-xs text-foreground"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-muted uppercase">MVP Reward (₹)</label>
                  <input
                    type="number"
                    name="mvpReward"
                    value={formData.mvpReward}
                    onChange={handleChange}
                    className="p-3 bg-card-bg/60 border border-card-border rounded-xl text-xs text-foreground"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Scoring */}
          {step === 5 && (
            <div className="flex flex-col gap-4">
              <h3 className="text-sm font-extrabold uppercase text-foreground">Step 5 — Scoring Configuration</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-muted uppercase">Points Per Kill</label>
                  <input
                    type="number"
                    name="pointsPerKill"
                    value={formData.pointsPerKill}
                    onChange={handleChange}
                    className="p-3 bg-card-bg/60 border border-card-border rounded-xl text-xs text-foreground"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-muted uppercase">1st Place Placement Points</label>
                  <input
                    type="number"
                    name="placementPoints_1"
                    value={formData.placementPoints_1}
                    onChange={handleChange}
                    className="p-3 bg-card-bg/60 border border-card-border rounded-xl text-xs text-foreground"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] text-muted uppercase">2nd Place</label>
                  <input
                    type="number"
                    name="placementPoints_2"
                    value={formData.placementPoints_2}
                    onChange={handleChange}
                    className="p-2.5 bg-card-bg/40 border border-card-border rounded-lg text-xs"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] text-muted uppercase">3rd Place</label>
                  <input
                    type="number"
                    name="placementPoints_3"
                    value={formData.placementPoints_3}
                    onChange={handleChange}
                    className="p-2.5 bg-card-bg/40 border border-card-border rounded-lg text-xs"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] text-muted uppercase">4th Place</label>
                  <input
                    type="number"
                    name="placementPoints_4"
                    value={formData.placementPoints_4}
                    onChange={handleChange}
                    className="p-2.5 bg-card-bg/40 border border-card-border rounded-lg text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: Rules & Policies */}
          {step === 6 && (
            <div className="flex flex-col gap-4">
              <h3 className="text-sm font-extrabold uppercase text-foreground">Step 6 — Rules & Policies</h3>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-muted uppercase">General Rules</label>
                <textarea
                  name="generalRules"
                  rows={4}
                  value={formData.generalRules}
                  onChange={handleChange}
                  className="p-3 bg-card-bg/60 border border-card-border rounded-xl text-xs text-foreground resize-none"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-muted uppercase">Fair Play & Anti-Cheat</label>
                <textarea
                  name="fairPlayRules"
                  rows={3}
                  value={formData.fairPlayRules}
                  onChange={handleChange}
                  className="p-3 bg-card-bg/60 border border-card-border rounded-xl text-xs text-foreground resize-none"
                />
              </div>
            </div>
          )}

          {/* STEP 7: Review & launch */}
          {step === 7 && (
            <div className="flex flex-col gap-4">
              <h3 className="text-sm font-extrabold uppercase text-foreground">Step 7 — Review & Launch</h3>
              <div className="flex items-center gap-2.5 p-4 rounded-xl border border-secondary/20 bg-secondary/5 mb-2">
                <AlertTriangle className="h-4.5 w-4.5 text-secondary flex-shrink-0" />
                <span className="text-[10px] text-secondary-text leading-relaxed font-semibold">
                  Ensure all schedule timelines logically proceed chronologically. You can publish instantly to accept registrations, or save as DRAFT.
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 border border-card-border p-4 rounded-xl text-xs bg-card-bg/10">
                <div>
                  <span className="text-muted block text-[10px]">TOURNAMENT TITLE</span>
                  <span className="text-foreground font-extrabold">{formData.title || 'Untitled'}</span>
                </div>
                <div>
                  <span className="text-muted block text-[10px]">GAME MODE</span>
                  <span className="text-foreground font-extrabold">{formData.mode} ({formData.perspective})</span>
                </div>
                <div>
                  <span className="text-muted block text-[10px]">ENTRY FEE</span>
                  <span className="text-gradient-prize font-bold">{formData.entryFee === 0 ? 'FREE' : `₹${formData.entryFee}`}</span>
                </div>
                <div>
                  <span className="text-muted block text-[10px]">PRIZE POOL</span>
                  <span className="text-foreground font-extrabold font-mono">₹{formData.prizePool}</span>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Controls Row */}
          <div className="flex justify-between items-center mt-6 pt-4 border-t border-card-border">
            <button
              onClick={() => step > 1 && setStep(step - 1)}
              disabled={step === 1}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all border border-card-border bg-card-bg text-muted ${
                step === 1 ? 'opacity-35 cursor-not-allowed' : 'hover:text-foreground'
              }`}
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </button>

            {step < 7 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="flex items-center gap-1.5 px-4.5 py-2.5 bg-secondary hover:bg-secondary/95 text-white font-extrabold rounded-xl text-xs transition-colors"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => handleCreate('DRAFT')}
                  className="px-4.5 py-2.5 border border-card-border bg-card-bg text-muted hover:text-foreground font-bold rounded-xl text-xs transition-colors"
                >
                  Save as Draft
                </button>
                <button
                  onClick={() => handleCreate('REGISTRATION_OPEN')}
                  className="px-4.5 py-2.5 bg-secondary hover:bg-secondary/95 text-white font-extrabold rounded-xl text-xs transition-colors shadow-md glow-secondary"
                >
                  Launch & Publish
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </OrganizerShell>
  );
}
