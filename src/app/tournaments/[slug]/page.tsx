'use client';

import React, { use, useState } from 'react';
import Link from 'next/link';
import { useTournaments } from '@/providers/TournamentProvider';
import { useAuth } from '@/providers/AuthProvider';
import { useWallet } from '@/providers/WalletProvider';
import { useRegistrations } from '@/providers/RegistrationProvider';
import { useTeams } from '@/providers/TeamProvider';
import { useResults } from '@/providers/ResultProvider';
import Countdown from '@/components/common/Countdown';
import LevelBadge from '@/components/common/LevelBadge';
import DynamicPrizeCalculator from '@/components/tournaments/DynamicPrizeCalculator';
import TournamentCard from '@/components/tournaments/TournamentCard';
import { ROUTES, LEGAL_DISCLAIMER } from '@/constants';
import { Calendar, Trophy, Info, Share2, Check, ArrowLeft, Gamepad } from 'lucide-react';

interface Params {
  slug: string;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export default function TournamentDetails({ params }: { params: Promise<Params> }) {
  const { slug } = use(params);
  const { getTournamentBySlug, tournaments } = useTournaments();
  const { role, user } = useAuth();
  const { balance } = useWallet();
  const { getTournamentRegistration, validateEligibility } = useRegistrations();
  const { myTeam } = useTeams();
  const { getTournamentStandings, getMVP } = useResults();

  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'calculator' | 'standings'>('details');

  const tournament = getTournamentBySlug(slug);

  if (!tournament) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-12 my-12">
        <Gamepad className="h-12 w-12 text-muted mb-4 opacity-40 animate-pulse" />
        <h2 className="text-xl font-bold text-foreground">Tournament Not Found</h2>
        <p className="text-xs text-muted max-w-sm mt-1.5 mb-6">
          The tournament slot you are looking for has been archived, cancelled, or does not exist.
        </p>
        <Link
          href={ROUTES.TOURNAMENTS}
          className="px-5 py-2.5 bg-primary text-background font-black text-xs rounded-xl transition-all"
        >
          Explore Other Arenas
        </Link>
      </div>
    );
  }

  // Similar tournaments recommendation
  const similarTournaments = tournaments
    .filter((t) => t.id !== tournament.id && (t.mode === tournament.mode || t.level === tournament.level) && t.status !== 'Completed')
    .slice(0, 3);

  const tourStandings = getTournamentStandings(tournament.id);
  const tourMVP = getMVP(tournament.id);

  // Check if player is allowed to register
  const userReg = user ? getTournamentRegistration(tournament.id, user.id) : null;
  const regValidation = user
    ? validateEligibility(tournament, user, myTeam)
    : { allowed: false, issues: [{ message: 'Please switch to Player role to register.' }] };

  const isFree = tournament.entryFee === 0;
  const progressPercent = Math.round((tournament.registeredParticipants / tournament.maxParticipants) * 100);

  const handleShare = () => {
    if (typeof window === 'undefined') return;
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedDate = new Date(tournament.matchStart).toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="flex flex-col gap-8 pb-20 px-4 md:px-0 pt-4">
      {/* Back navigation */}
      <div>
        <Link
          href={ROUTES.TOURNAMENTS}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-muted hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Explore</span>
        </Link>
      </div>

      {/* Banner & Main Meta Section */}
      <div className="relative rounded-3xl border border-card-border bg-card-bg overflow-hidden shadow-xl">
        <div className="h-56 md:h-72 w-full bg-slate-950 relative">
          <img
            src={tournament.banner}
            alt={tournament.title}
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card-bg via-transparent to-transparent" />
        </div>

        <div className="p-5 md:p-8 flex flex-col md:flex-row md:items-end gap-6 justify-between relative -mt-16 z-10">
          <div className="flex-1 flex flex-col gap-2.5">
            <div className="flex flex-wrap gap-2.5">
              <LevelBadge level={tournament.level} />
              <span className="px-2.5 py-0.5 rounded-full border border-card-border bg-[#09090d] text-[10px] font-extrabold uppercase text-muted tracking-wider">
                {tournament.status}
              </span>
            </div>
            <h1 className="text-xl md:text-3xl font-black tracking-tight mt-1">{tournament.title}</h1>
            <p className="text-xs text-muted leading-relaxed max-w-2xl">{tournament.description}</p>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <button
              onClick={handleShare}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-card-border bg-card-bg/60 hover:bg-card-bg text-xs font-bold transition-all active:scale-95 touch-target"
            >
              {copied ? <Check className="h-4 w-4 text-primary" /> : <Share2 className="h-4 w-4" />}
              <span>{copied ? 'Copied Link' : 'Share Arena'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid Layout: Main info (left) + Registration checkout sidebar (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Details Area - Left */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Tab bar header */}
          <div className="flex border-b border-card-border">
            <button
              onClick={() => setActiveTab('details')}
              className={`px-5 py-3 text-xs font-black uppercase tracking-wider transition-all border-b-2 ${
                activeTab === 'details' ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-foreground'
              }`}
            >
              Match Details
            </button>
            {tournament.prizePoolType === 'DYNAMIC' && (
              <button
                onClick={() => setActiveTab('calculator')}
                className={`px-5 py-3 text-xs font-black uppercase tracking-wider transition-all border-b-2 ${
                  activeTab === 'calculator' ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-foreground'
                }`}
              >
                Prize Calculator
              </button>
            )}
            <button
              onClick={() => setActiveTab('standings')}
              className={`px-5 py-3 text-xs font-black uppercase tracking-wider transition-all border-b-2 ${
                activeTab === 'standings' ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-foreground'
              }`}
            >
              Standings & Lobbies
            </button>
          </div>

          {/* TAB 1: DETAILS */}
          {activeTab === 'details' && (
            <div className="flex flex-col gap-6">
              {/* Match Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-[#0a0a0f] p-4 rounded-2xl border border-card-border">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-muted uppercase tracking-wider">Perspective</span>
                  <span className="text-xs font-extrabold text-foreground">{tournament.perspective}</span>
                </div>
                <div className="flex flex-col gap-1 border-l border-card-border/50 pl-4">
                  <span className="text-[10px] font-bold text-muted uppercase tracking-wider">Map</span>
                  <span className="text-xs font-extrabold text-foreground">{tournament.map}</span>
                </div>
                <div className="flex flex-col gap-1 border-l border-card-border/50 pl-4">
                  <span className="text-[10px] font-bold text-muted uppercase tracking-wider">Format Size</span>
                  <span className="text-xs font-extrabold text-foreground">
                    {tournament.teamSize === 1
                      ? 'Solo (1v100)'
                      : tournament.teamSize === 2
                      ? 'Duo (2v50)'
                      : `Squad (4v${tournament.maxParticipants})`}
                  </span>
                </div>
                <div className="flex flex-col gap-1 border-l border-card-border/50 pl-4">
                  <span className="text-[10px] font-bold text-muted uppercase tracking-wider">Per-Kill Bonus</span>
                  <span className="text-xs font-extrabold text-gradient-prize">₹{tournament.perKillReward} / Kill</span>
                </div>
              </div>

              {/* Match Schedule */}
              <div className="flex flex-col gap-3.5">
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-foreground">Match Schedule</h3>
                <div className="rounded-2xl border border-card-border bg-card-bg/40 p-5 flex flex-col gap-4">
                  <div className="flex items-start gap-3.5">
                    <Calendar className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-foreground/90">Match Date & Start Time</span>
                      <span className="text-xs text-muted mt-1">{formattedDate}</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3.5 border-t border-card-border/40 pt-4">
                    <Info className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-foreground/90">Room release policy</span>
                      <p className="text-[11px] text-muted leading-relaxed mt-1">
                        Credentials will release exactly **15 minutes** before the scheduled start time. Registered squads must check their lobby slots immediately to prevent disqualifications.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tournament Rules list */}
              <div className="flex flex-col gap-3.5">
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-foreground">Tournament Rules</h3>
                <ul className="flex flex-col gap-2">
                  {tournament.rules.map((rule, idx) => (
                    <li key={idx} className="flex gap-2 text-xs text-muted leading-relaxed">
                      <span className="text-primary font-bold">{idx + 1}.</span>
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Scoring System */}
              <div className="flex flex-col gap-3.5">
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-foreground">Scoring System</h3>
                <div className="rounded-2xl border border-card-border bg-card-bg/40 p-5 flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <p className="font-bold text-foreground/95 mb-1.5">Kill Points</p>
                      <p className="text-muted leading-relaxed">Each player kill awards **{tournament.scoringSystem.pointsPerKill} Point** directly to the team total.</p>
                    </div>
                    <div className="border-l border-card-border/50 pl-4">
                      <p className="font-bold text-foreground/95 mb-1.5">Placement points schedule</p>
                      <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono text-muted">
                        <span>🥇 1st: 10 pts</span>
                        <span>🥉 3rd: 5 pts</span>
                        <span>🥈 2nd: 6 pts</span>
                        <span>🎖️ 4th: 4 pts</span>
                        <span>🎖️ 5th: 3 pts</span>
                        <span>🎖️ 6-7th: 2 pts</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRIZE CALCULATOR */}
          {activeTab === 'calculator' && tournament.prizePoolType === 'DYNAMIC' && (
            <DynamicPrizeCalculator tournament={tournament} />
          )}

          {/* TAB 3: STANDINGS */}
          {activeTab === 'standings' && (
            <div className="space-y-4 text-left">
              {tourStandings.length === 0 ? (
                <div className="flex flex-col gap-4 text-center p-8 rounded-2xl border border-dashed border-card-border bg-card-bg/20">
                  <Trophy className="h-10 w-10 text-muted mx-auto opacity-30" />
                  <h4 className="text-sm font-bold text-foreground">Standings Not Released</h4>
                  <p className="text-xs text-muted max-w-sm mx-auto">
                    No scores have been submitted yet. Once the match goes live and results are compiled, placement rankings and kill logs will update in this view.
                  </p>
                </div>
              ) : (
                <div className="rounded-2xl border border-card-border bg-card-bg p-5 space-y-4">
                  <div className="flex justify-between items-center border-b border-card-border pb-3">
                    <div>
                      <h4 className="text-sm font-bold text-foreground">Tournament Standings Preview</h4>
                      <p className="text-[10px] text-muted">Standings compiled from active round performance cards.</p>
                    </div>
                    
                    <span className="text-[9px] font-black uppercase bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded">
                      Active
                    </span>
                  </div>

                  {/* Top three preview list */}
                  <div className="space-y-2 text-xs">
                    {tourStandings.slice(0, 3).map((standing) => {
                      const name = standing.participantId === 'team-soul' 
                        ? 'Team SouL' 
                        : standing.participantId === 'team-godl' 
                          ? 'GodLike Esports' 
                          : standing.participantId === 'team-user'
                            ? 'Apex Hunters'
                            : standing.participantId;
                            
                      return (
                        <div key={standing.participantId} className="flex justify-between items-center p-2.5 bg-black/25 rounded-xl border border-card-border/60">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-primary font-mono text-sm w-4">#{standing.rank}</span>
                            <span className="font-bold text-foreground">{name}</span>
                          </div>
                          <span className="font-bold text-muted font-mono">{standing.totalPoints} Pts</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* MVP display */}
                  {tourMVP && (
                    <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-3 flex items-center justify-between text-xs">
                      <div className="space-y-0.5">
                        <span className="text-[9px] font-black uppercase text-indigo-400 block">Tournament MVP Leader</span>
                        <span className="font-bold text-foreground">{tourMVP.reason}</span>
                      </div>
                      <span className="text-lg">🎖️</span>
                    </div>
                  )}

                  <Link
                    href={`/tournaments/${slug}/leaderboard`}
                    className="w-full py-2.5 bg-primary hover:bg-yellow-500 text-background font-black text-xs text-center rounded-xl transition-all block uppercase"
                  >
                    Open Full Leaderboard Standings
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Registration checkout sidebar - Right */}
        <div className="flex flex-col gap-6">
          {/* Card checkout */}
          <div className="rounded-2xl border border-card-border bg-card-bg p-5 md:p-6 shadow-xl sticky top-24">
            <div className="flex flex-col gap-4">
              <Countdown targetDate={tournament.matchStart} className="pb-3 border-b border-card-border" />

              {/* Slot meter */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-xs font-bold text-muted">
                  <span>Registered: {progressPercent}%</span>
                  <span className="text-foreground">
                    {tournament.registeredParticipants} / {tournament.maxParticipants} Squads
                  </span>
                </div>
                <div className="w-full h-2 bg-[#171720] rounded-full overflow-hidden border border-card-border">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Details pricing summary */}
              <div className="flex flex-col gap-2.5 pt-3 border-t border-card-border">
                <div className="flex justify-between text-xs">
                  <span className="text-muted">Simulated Entry Fee:</span>
                  <span className={`font-bold ${isFree ? 'text-primary' : 'text-foreground'}`}>
                    {isFree ? 'FREE' : `₹${tournament.entryFee}`}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted">Mock Prize Pool:</span>
                  <span className="font-extrabold text-gradient-prize">
                    ₹{tournament.prizePool.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-xs border-b border-card-border pb-3 mb-1">
                  <span className="text-muted">Skill Level Badge:</span>
                  <span className="font-bold text-foreground">{tournament.level}</span>
                </div>

                {role !== 'Guest' && user && (
                  <div className="flex justify-between text-xs pt-1.5">
                    <span className="text-muted">Simulated Wallet Balance:</span>
                    <span className="font-mono font-bold text-gradient-prize">
                      ₹{balance.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Validation alert if not allowed */}
              {!regValidation.allowed && role !== 'Guest' && !userReg && (
                <div className="p-3.5 rounded-xl bg-danger/10 border border-danger/25 text-[11px] text-danger/80 leading-relaxed font-semibold">
                  {(regValidation as any).issues ? (regValidation as any).issues[0]?.message : (regValidation as any).reason}
                </div>
              )}

              {/* Action buttons */}
              {role === 'Guest' ? (
                <div className="p-3 text-center border border-dashed border-card-border rounded-xl text-xs text-muted font-semibold bg-muted-bg/30">
                  ⚠️ Switch role to Player to register
                </div>
              ) : userReg ? (
                <div className="flex flex-col gap-2 w-full">
                  <div className="p-3 text-center rounded-xl bg-green-500/10 border border-green-500/25 text-xs font-black text-green-400">
                    Already Booked ({userReg.slotNumber ? `Slot #${userReg.slotNumber}` : 'Waitlist Queue'})
                  </div>
                  <Link
                    href={`/registrations/${userReg.id}`}
                    className="w-full text-center py-2.5 bg-primary hover:bg-yellow-500 text-background font-black text-xs tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-1"
                  >
                    View Registration Receipt
                  </Link>
                </div>
              ) : (
                <Link
                  href={`${ROUTES.TOURNAMENTS}/${tournament.slug}/register`}
                  className={`w-full text-center py-3 bg-primary hover:bg-primary/95 text-background font-black text-xs tracking-wider rounded-xl transition-all shadow-md active:scale-95 glow-primary ${
                    !regValidation.allowed ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''
                  }`}
                >
                  Register Now
                </Link>
              )}
            </div>
          </div>

          {/* Organizer Card */}
          <div className="rounded-2xl border border-card-border bg-card-bg/40 p-4 flex gap-4 items-center">
            <span className="h-10 w-10 bg-primary/10 border border-primary/20 flex items-center justify-center rounded-xl text-primary font-black text-xs shrink-0">
              VO
            </span>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-muted uppercase">Tournament Host</span>
              <span className="text-xs font-extrabold text-foreground flex items-center gap-1">
                {tournament.organizer}
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              </span>
              <span className="text-[10px] text-muted">Official VONK Partner</span>
            </div>
          </div>
        </div>
      </div>

      {/* Similar Tournaments recommendations */}
      {similarTournaments.length > 0 && (
        <div className="flex flex-col gap-6 mt-10 border-t border-card-border pt-10">
          <h3 className="text-sm md:text-base font-extrabold uppercase tracking-wide">
            Similar Tournament Matches
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {similarTournaments.map((t) => (
              <TournamentCard key={t.id} tournament={t} />
            ))}
          </div>
        </div>
      )}

      {/* Sticky Mobile Registration Bottom CTA */}
      <div className="md:hidden fixed bottom-14 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-t border-card-border px-4 py-3 flex items-center justify-between shadow-2xl">
        <div className="flex flex-col">
          <span className="text-[10px] text-muted font-bold uppercase tracking-wider">Entry Fee</span>
          <span className={`text-sm font-black ${isFree ? 'text-primary' : 'text-foreground'}`}>
            {isFree ? 'FREE' : `₹${tournament.entryFee}`}
          </span>
        </div>
        {role === 'Guest' ? (
          <span className="text-[10px] text-muted uppercase font-bold tracking-widest border border-dashed border-card-border px-3 py-1 rounded">
            Guest View
          </span>
        ) : userReg ? (
          <Link
            href={`/registrations/${userReg.id}`}
            className="px-5 py-2.5 bg-primary hover:bg-yellow-500 text-background font-black text-xs rounded-lg transition-all"
          >
            View Receipt
          </Link>
        ) : (
          <Link
            href={`${ROUTES.TOURNAMENTS}/${tournament.slug}/register`}
            className={`px-5 py-2.5 bg-primary hover:bg-primary/95 text-background font-black text-xs rounded-lg transition-all glow-primary ${
              !regValidation.allowed ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''
            }`}
          >
            Register Now
          </Link>
        )}
      </div>

      {/* Disclaimer */}
      <div className="mt-8 text-center text-[10px] text-muted max-w-3xl mx-auto border-t border-card-border/40 pt-4 leading-relaxed">
        {LEGAL_DISCLAIMER}
      </div>
    </div>
  );
}
