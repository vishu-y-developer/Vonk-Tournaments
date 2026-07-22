'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { useTeams } from '@/providers/TeamProvider';
import { Team, TeamType, TournamentMode, TeamRole } from '@/types';
import { ROUTES } from '@/constants';
import Link from 'next/link';
import {
  Users,
  Compass,
  Palette,
  UserCheck,
  CheckCircle,
  Camera,
  Plus,
  Trash2,
  ArrowLeft,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';

export default function CreateTeam() {
  const router = useRouter();
  const { user } = useAuth();
  const { createTeam } = useTeams();

  // Stepper state
  const [step, setStep] = useState(1);

  // Form Fields State
  const [teamName, setTeamName] = useState('');
  const [shortName, setShortName] = useState('');
  const [teamType, setTeamType] = useState<TeamType>('Squad');
  const [bio, setBio] = useState('');
  const [preferredMode, setPreferredMode] = useState<TournamentMode>('Squad');
  const [preferredMap, setPreferredMap] = useState('Erangel');
  const [skillLevel, setSkillLevel] = useState('Advanced');
  const [region, setRegion] = useState('India');
  const [language, setLanguage] = useState('English');

  // Branding Fields State
  const [logoUrl, setLogoUrl] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [colorTheme, setColorTheme] = useState('#8b5cf6');
  const [tag, setTag] = useState('');
  const [motto, setMotto] = useState('');

  // Roster setup fields (Captain is user, others can be mock additions)
  const [mockRoster, setMockRoster] = useState<{ id: string; inGameName: string; characterId: string; role: TeamRole }[]>([
    // Captain slot is added implicitly from Auth user details
  ]);

  const [newMockName, setNewMockName] = useState('');
  const [newMockRole, setNewMockRole] = useState<TeamRole>('Assaulter');
  
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary mb-4" />
        <h2 className="text-xs font-bold text-muted">Retrieving profile...</h2>
      </div>
    );
  }

  // Handlers for base64 branding uploads
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'banner') => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024 * 2) {
        alert('File size exceeds 2MB limit.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'logo') {
          setLogoUrl(reader.result as string);
        } else {
          setBannerUrl(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Add mock player to local list
  const handleAddMockPlayer = () => {
    if (!newMockName.trim()) {
      alert('Mock Player Name cannot be empty.');
      return;
    }
    const id = `mock-p-${Date.now()}`;
    const characterId = Math.floor(1000000000 + Math.random() * 9000000000).toString();
    setMockRoster([...mockRoster, { id, inGameName: newMockName, characterId, role: newMockRole }]);
    setNewMockName('');
  };

  const handleRemoveMockPlayer = (id: string) => {
    setMockRoster(mockRoster.filter((p) => p.id !== id));
  };

  // Roster validations checks
  const getRequiredActiveCount = (type: TeamType) => {
    if (type === 'Duo' || type === 'TDM 2v2') return 1; // plus captain = 2
    if (type === 'Squad' || type === 'TDM 4v4' || type === 'Clan') return 3; // plus captain = 4
    return 1;
  };

  const getMaxLimit = (type: TeamType) => {
    if (type === 'Duo' || type === 'TDM 2v2') return 2;
    if (type === 'Squad' || type === 'TDM 4v4') return 5;
    if (type === 'Clan') return 15;
    return 6;
  };

  const isRosterValid = () => {
    const totalMembersCount = mockRoster.length + 1; // mock players + Captain
    const required = getRequiredActiveCount(teamType) + 1;
    const max = getMaxLimit(teamType);
    return totalMembersCount >= required && totalMembersCount <= max;
  };

  // Stepper controllers
  const handleNextStep = () => {
    if (step === 1) {
      if (!teamName.trim() || teamName.length < 3) {
        alert('Team Name must be at least 3 characters.');
        return;
      }
      if (!shortName.trim() || shortName.length < 2 || shortName.length > 5) {
        alert('Short Name must be between 2 and 5 characters.');
        return;
      }
    }
    if (step === 2) {
      if (!tag.trim()) {
        setTag(shortName.toUpperCase());
      }
    }
    if (step === 3) {
      if (!isRosterValid()) {
        const req = getRequiredActiveCount(teamType) + 1;
        const max = getMaxLimit(teamType);
        alert(`Roster size validation failed. For a ${teamType} team, you need between ${req} and ${max} members.`);
        return;
      }
    }
    setStep(step + 1);
  };

  const handlePrevStep = () => {
    setStep(step - 1);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Call Provider to create team
    const res = createTeam({
      name: teamName,
      shortName,
      type: teamType,
      bio,
      preferredMode,
      preferredMap,
      skillLevel,
      region,
      language,
      logoUrl,
      bannerUrl,
      colorTheme,
      tag: tag || shortName.toUpperCase(),
      motto,
    });

    if (res.success && res.team) {
      // Seed mock roster members to the created team
      const seededRoster = [
        { playerId: user.id, inGameName: user.inGameName, characterId: user.characterId, role: 'Captain' as TeamRole, joinedAt: new Date().toISOString() },
        ...mockRoster.map((p) => ({
          playerId: p.id,
          inGameName: p.inGameName,
          characterId: p.characterId,
          role: p.role,
          joinedAt: new Date().toISOString(),
        })),
      ];

      // Save complete team back to repository
      const allTeams = localStorage.getItem('vonk:v1:teams');
      if (allTeams) {
        const list = JSON.parse(allTeams) as Team[];
        const index = list.findIndex((t) => t.id === res.team?.id);
        if (index > -1) {
          list[index].members = seededRoster;
          localStorage.setItem('vonk:v1:teams', JSON.stringify(list));
        }
      }

      alert(`Team "${teamName}" successfully created!`);
      router.push('/teams');
    } else {
      alert(res.error || 'Failed to create team.');
    }
  };

  return (
    <div className="max-w-xl mx-auto w-full pb-20 px-4 md:px-0 pt-4 text-left flex flex-col gap-6">
      {/* Back button */}
      <Link href="/teams" className="flex items-center gap-1.5 text-xs text-muted hover:text-foreground w-fit transition-colors">
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Arena</span>
      </Link>

      <div className="flex flex-col gap-1 border-b border-card-border pb-4">
        <h1 className="text-xl md:text-2xl font-black uppercase tracking-tight">Create an Esports Team</h1>
        <p className="text-xs text-muted">Step {step} of 4: Setup squad specifications.</p>
      </div>

      {/* Visual Stepper Indicators */}
      <div className="flex items-center justify-between gap-2 border-b border-card-border pb-4 bg-card-bg/20 px-3 py-2.5 rounded-xl">
        {[
          { num: 1, label: 'Details', icon: Compass },
          { num: 2, label: 'Branding', icon: Palette },
          { num: 3, label: 'Roster', icon: UserCheck },
          { num: 4, label: 'Review', icon: CheckCircle },
        ].map((s) => (
          <div key={s.num} className="flex items-center gap-1 text-xs">
            <span
              className={`h-5 w-5 rounded-full flex items-center justify-center font-extrabold text-[10px] ${
                step === s.num
                  ? 'bg-primary text-background'
                  : step > s.num
                  ? 'bg-primary/20 text-primary'
                  : 'bg-muted-bg text-muted'
              }`}
            >
              {s.num}
            </span>
            <span className={`hidden sm:inline font-bold ${step === s.num ? 'text-foreground' : 'text-muted'}`}>
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* STEP CONTENT PANES */}

      {/* STEP 1: BASIC DETAILS */}
      {step === 1 && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-extrabold uppercase text-muted tracking-wider">Team Name</label>
              <input
                type="text"
                placeholder="e.g. VONK Gladiators"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                className="w-full bg-[#0a0a0f] border border-card-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:border-primary/50 focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-extrabold uppercase text-muted tracking-wider">Short Tag Name</label>
              <input
                type="text"
                placeholder="e.g. VNK (2-5 characters)"
                maxLength={5}
                value={shortName}
                onChange={(e) => setShortName(e.target.value)}
                className="w-full bg-[#0a0a0f] border border-card-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:border-primary/50 focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-extrabold uppercase text-muted tracking-wider">Team Type</label>
              <select
                value={teamType}
                onChange={(e) => setTeamType(e.target.value as TeamType)}
                className="w-full bg-[#0a0a0f] border border-card-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:border-primary/50 focus:outline-none"
              >
                <option value="Squad">Squad (4+1 Players)</option>
                <option value="Duo">Duo (2 Players)</option>
                <option value="TDM 2v2">TDM 2v2 (2 Players)</option>
                <option value="TDM 4v4">TDM 4v4 (4 Players)</option>
                <option value="Clan">Clan (Configurable)</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-extrabold uppercase text-muted tracking-wider">Preferred Mode</label>
              <select
                value={preferredMode}
                onChange={(e) => setPreferredMode(e.target.value as TournamentMode)}
                className="w-full bg-[#0a0a0f] border border-card-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:border-primary/50 focus:outline-none"
              >
                <option value="Squad">Squad (TPP)</option>
                <option value="Duo">Duo (TPP)</option>
                <option value="Solo">Solo (TPP)</option>
                <option value="Invitational">Invitational Scrims</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-extrabold uppercase text-muted tracking-wider">Skill Level</label>
              <select
                value={skillLevel}
                onChange={(e) => setSkillLevel(e.target.value)}
                className="w-full bg-[#0a0a0f] border border-card-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:border-primary/50 focus:outline-none"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Pro">Pro Elite</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-extrabold uppercase text-muted tracking-wider">Region</label>
              <input
                type="text"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full bg-[#0a0a0f] border border-card-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:border-primary/50 focus:outline-none"
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-extrabold uppercase text-muted tracking-wider">Team Bio</label>
            <textarea
              placeholder="Tell other players about your team..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="w-full bg-[#0a0a0f] border border-card-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:border-primary/50 focus:outline-none"
            />
          </div>

          <button
            onClick={handleNextStep}
            className="w-full py-3 mt-4 bg-primary hover:bg-primary/95 text-background font-black text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
          >
            <span>Proceed to Branding</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* STEP 2: BRANDING */}
      {step === 2 && (
        <div className="flex flex-col gap-5">
          {/* Logo Upload (Base64) */}
          <div className="flex items-center gap-4 p-4 rounded-xl border border-card-border bg-card-bg/20">
            <div className="h-16 w-16 rounded-xl bg-slate-900 border border-card-border flex items-center justify-center shrink-0 relative overflow-hidden">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo Preview" className="h-full w-full object-cover" />
              ) : (
                <Users className="h-6 w-6 text-muted opacity-30" />
              )}
            </div>
            <div className="flex flex-col gap-2 text-left">
              <h4 className="text-xs font-black uppercase text-foreground">Team Logo</h4>
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-card-border bg-[#0a0a0f] text-foreground text-[10px] font-bold rounded-lg hover:bg-card-bg transition-colors"
              >
                <Camera className="h-3.5 w-3.5" />
                Upload Image
              </button>
              <input
                type="file"
                ref={logoInputRef}
                className="hidden"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, 'logo')}
              />
            </div>
          </div>

          {/* Banner Upload */}
          <div className="flex items-center gap-4 p-4 rounded-xl border border-card-border bg-card-bg/20">
            <div className="h-14 w-28 rounded-lg bg-slate-900 border border-card-border flex items-center justify-center shrink-0 relative overflow-hidden">
              {bannerUrl ? (
                <img src={bannerUrl} alt="Banner Preview" className="h-full w-full object-cover" />
              ) : (
                <Users className="h-6 w-6 text-muted opacity-30" />
              )}
            </div>
            <div className="flex flex-col gap-2 text-left">
              <h4 className="text-xs font-black uppercase text-foreground">Team Banner</h4>
              <button
                type="button"
                onClick={() => bannerInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-card-border bg-[#0a0a0f] text-foreground text-[10px] font-bold rounded-lg hover:bg-card-bg transition-colors"
              >
                <Camera className="h-3.5 w-3.5" />
                Upload Image
              </button>
              <input
                type="file"
                ref={bannerInputRef}
                className="hidden"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, 'banner')}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-extrabold uppercase text-muted tracking-wider">Accent Color</label>
              <input
                type="color"
                value={colorTheme}
                onChange={(e) => setColorTheme(e.target.value)}
                className="w-full h-10 bg-[#0a0a0f] border border-card-border rounded-xl cursor-pointer"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-extrabold uppercase text-muted tracking-wider">Team Motto</label>
              <input
                type="text"
                placeholder="e.g. Slay and Conquer"
                value={motto}
                onChange={(e) => setMotto(e.target.value)}
                className="w-full bg-[#0a0a0f] border border-card-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:border-primary/50 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex gap-4 mt-4">
            <button
              onClick={handlePrevStep}
              className="flex-1 py-3 bg-muted-bg hover:bg-muted-bg/85 text-muted font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
            >
              Back
            </button>
            <button
              onClick={handleNextStep}
              className="flex-1 py-3 bg-primary hover:bg-primary/95 text-background font-black text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
            >
              <span>Setup Roster</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: ROSTER SETUP */}
      {step === 3 && (
        <div className="flex flex-col gap-5">
          {/* Captain slot indicator */}
          <div className="p-3.5 rounded-xl border border-primary/20 bg-primary/[0.02] flex items-center justify-between">
            <div className="text-left flex flex-col">
              <span className="text-[9px] font-extrabold uppercase text-primary tracking-widest">Captain (You)</span>
              <span className="text-xs font-black text-foreground mt-0.5">{user.inGameName}</span>
              <span className="text-[9px] font-mono text-muted">{user.characterId}</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[8px] font-black uppercase tracking-wider border border-primary/20">
              Role: Captain
            </span>
          </div>

          {/* Add Mock Members Form */}
          <div className="p-4 rounded-xl border border-card-border bg-card-bg/25 flex flex-col gap-4 text-left">
            <h3 className="text-xs font-black uppercase text-foreground">Add Teammate (Mock Recruitment)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="In-Game Name (IGN)"
                value={newMockName}
                onChange={(e) => setNewMockName(e.target.value)}
                className="bg-[#0a0a0f] border border-card-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none"
              />
              <select
                value={newMockRole}
                onChange={(e) => setNewMockRole(e.target.value as TeamRole)}
                className="bg-[#0a0a0f] border border-card-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none"
              >
                <option value="Co-Captain">Co-Captain</option>
                <option value="Assaulter">Assaulter</option>
                <option value="Sniper">Sniper</option>
                <option value="Support">Support</option>
                <option value="IGL">IGL</option>
                <option value="Substitute">Substitute</option>
              </select>
            </div>
            <button
              onClick={handleAddMockPlayer}
              className="w-fit flex items-center gap-1.5 px-3 py-2 bg-primary/10 hover:bg-primary/20 text-primary font-black text-xs rounded-xl transition-colors touch-target"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add to Roster</span>
            </button>
          </div>

          {/* Local roster list */}
          <div className="flex flex-col gap-2">
            <span className="text-xs uppercase font-extrabold tracking-wider text-muted"> Roster Slots ({mockRoster.length + 1})</span>
            <div className="flex flex-col gap-2">
              {mockRoster.map((p) => (
                <div key={p.id} className="p-3 rounded-lg border border-card-border bg-[#0a0a0f] flex justify-between items-center">
                  <div className="text-left flex flex-col">
                    <span className="text-xs font-bold text-foreground">{p.inGameName}</span>
                    <span className="text-[9px] font-mono text-muted">ID: {p.characterId} • Role: {p.role}</span>
                  </div>
                  <button
                    onClick={() => handleRemoveMockPlayer(p.id)}
                    className="p-1 text-danger hover:text-danger/80 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4 mt-4">
            <button
              onClick={handlePrevStep}
              className="flex-1 py-3 bg-muted-bg hover:bg-muted-bg/85 text-muted font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
            >
              Back
            </button>
            <button
              onClick={handleNextStep}
              className="flex-1 py-3 bg-primary hover:bg-primary/95 text-background font-black text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
            >
              <span>Review Details</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: REVIEW & CREATE */}
      {step === 4 && (
        <form onSubmit={handleFormSubmit} className="flex flex-col gap-5 text-left">
          <div className="p-5 rounded-2xl border border-card-border bg-[#0d0d12]/60 flex flex-col gap-5">
            <div className="flex justify-between items-center border-b border-card-border pb-3">
              <h3 className="text-sm font-black uppercase text-foreground">{teamName}</h3>
              <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[9px] font-extrabold uppercase border border-primary/20">
                {teamType}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-bold">
              <div>
                <p className="text-[9px] text-muted uppercase">Short Name</p>
                <p className="text-foreground mt-0.5">{shortName}</p>
              </div>
              <div>
                <p className="text-[9px] text-muted uppercase">Preferred Map</p>
                <p className="text-foreground mt-0.5">{preferredMap}</p>
              </div>
              <div>
                <p className="text-[9px] text-muted uppercase">Skill Level</p>
                <p className="text-foreground mt-0.5">{skillLevel}</p>
              </div>
              <div>
                <p className="text-[9px] text-muted uppercase">Region</p>
                <p className="text-foreground mt-0.5">{region}</p>
              </div>
            </div>

            <div className="border-t border-card-border/50 pt-4 flex flex-col gap-2">
              <span className="text-[9px] font-extrabold uppercase text-muted tracking-wider">Roster Members ({mockRoster.length + 1})</span>
              <div className="flex flex-col gap-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="font-extrabold text-foreground">{user.inGameName}</span>
                  <span className="text-primary font-black uppercase text-[10px]">Captain</span>
                </div>
                {mockRoster.map((p) => (
                  <div key={p.id} className="flex justify-between text-foreground/80">
                    <span>{p.inGameName}</span>
                    <span className="text-muted font-bold">{p.role}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Validation readiness check */}
            <div className="border-t border-card-border/50 pt-4 flex items-center gap-2 text-xs">
              <CheckCircle className="h-4.5 w-4.5 text-primary" />
              <span className="text-muted">Roster size validation passes! Ready to register.</span>
            </div>
          </div>

          <div className="flex gap-4 mt-4">
            <button
              onClick={handlePrevStep}
              className="flex-1 py-3 bg-muted-bg hover:bg-muted-bg/85 text-muted font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
            >
              Back
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-primary hover:bg-primary/95 text-background font-black text-xs rounded-xl shadow-md transition-all active:scale-95 glow-primary"
            >
              Create Team Now
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
