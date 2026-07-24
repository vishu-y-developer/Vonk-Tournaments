'use client';

import React from 'react';
import Link from 'next/link';
import { Tournament } from '@/types';
import { ROUTES } from '@/constants';
import LevelBadge from '../common/LevelBadge';
import Image from 'next/image';
import { Calendar, Users, MapPin, Gamepad } from 'lucide-react';

interface TournamentCardProps {
  tournament: Tournament;
}

export const TournamentCard: React.FC<TournamentCardProps> = ({ tournament }) => {
  const isFree = tournament.entryFee === 0;
  const isFull = tournament.registeredParticipants >= tournament.maxParticipants;
  const slotsRemaining = tournament.maxParticipants - tournament.registeredParticipants;
  const progressPercent = Math.min(
    100,
    Math.round((tournament.registeredParticipants / tournament.maxParticipants) * 100)
  );

  const getStatusConfig = (status: Tournament['status']) => {
    switch (status) {
      case 'Registration Open':
        return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
      case 'Filling Fast':
        return 'bg-amber-500/10 border-amber-500/30 text-amber-400 animate-pulse';
      case 'Registration Closed':
        return 'bg-rose-500/10 border-rose-500/30 text-rose-400';
      case 'Room Released':
        return 'bg-blue-500/10 border-blue-500/30 text-blue-400';
      case 'Live':
        return 'bg-red-500/10 border-red-500/30 text-red-400 animate-pulse';
      case 'Completed':
        return 'bg-slate-500/10 border-slate-500/30 text-slate-400';
      case 'Cancelled':
      case 'Refunded':
        return 'bg-red-500/5 border-red-500/20 text-red-500/70 line-through';
      default:
        return 'bg-card-border/60 border-card-border text-muted';
    }
  };

  const formattedDate = new Date(tournament.matchStart).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

  const getBannerSrc = () => {
    if (tournament.banner && tournament.banner.startsWith('/')) return tournament.banner;
    if (tournament.game.toLowerCase().includes('free fire')) return '/assets/images/ff-thumb.jpg';
    if (tournament.game.toLowerCase().includes('bgmi')) return '/assets/images/bgmi-thumb.jpg';
    return '/assets/images/empty-state.jpg';
  };

  const getAccentColor = () => {
    if (tournament.game.toLowerCase().includes('free fire')) return 'bg-secondary text-background glow-secondary';
    return 'bg-primary text-background glow-primary';
  };

  return (
    <div className="group flex flex-col w-full rounded-2xl bg-card-bg border border-card-border overflow-hidden hover:border-card-hover-border transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/5">
      {/* Banner */}
      <div className="relative w-full h-40 md:h-44 bg-slate-900 overflow-hidden">
        {tournament.featured && (
          <span className={`absolute top-3 left-3 z-10 px-2.5 py-0.5 rounded font-black text-[9px] uppercase tracking-widest ${getAccentColor()}`}>
            Featured
          </span>
        )}

        <span
          className={`absolute top-3 right-3 z-10 px-2 py-0.5 rounded border text-[9px] font-black uppercase tracking-wider backdrop-blur-md ${getStatusConfig(
            tournament.status
          )}`}
        >
          {tournament.status}
        </span>

        <Image
          src={getBannerSrc()}
          alt={tournament.title || ''}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-80 mix-blend-luminosity hover:mix-blend-normal hover:opacity-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />

        {/* Level Badge Overlay */}
        <div className="absolute bottom-3 left-3">
          <LevelBadge level={tournament.level} />
        </div>
      </div>

      {/* Info Block */}
      <div className="flex-1 flex flex-col p-4 md:p-5">
        <h3 className="font-extrabold text-base md:text-lg tracking-tight text-foreground line-clamp-1 group-hover:text-primary transition-colors">
          {tournament.title}
        </h3>
        
        {/* Organizer */}
        <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-3">
          By {tournament.organizer}
        </p>

        {/* Mode / Map grid */}
        <div className="grid grid-cols-2 gap-2 text-xs text-foreground/80 mb-4 bg-muted-bg/50 p-2 rounded-lg border border-card-border">
          <div className="flex items-center gap-1.5 font-medium">
            <Users className="h-3.5 w-3.5 text-primary" />
            <span>
              {tournament.mode} ({tournament.perspective})
            </span>
          </div>
          <div className="flex items-center gap-1.5 font-medium">
            <MapPin className="h-3.5 w-3.5 text-secondary" />
            <span>{tournament.map}</span>
          </div>
        </div>

        {/* Entry fee and prize pool */}
        <div className="flex items-center justify-between py-2.5 border-t border-b border-card-border mb-4 bg-[#0a0a0f] px-3 rounded-lg">
          <div>
            <p className="text-[10px] font-bold text-muted uppercase tracking-wider">Prize Pool</p>
            <p className="text-base font-black text-gradient-prize">
              ₹{tournament.prizePool.toLocaleString()}
              {tournament.prizePoolType === 'DYNAMIC' && <span className="text-[9px] text-muted font-bold ml-0.5">*D</span>}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-muted uppercase tracking-wider">Entry Fee</p>
            <p className={`text-base font-black ${isFree ? 'text-primary' : 'text-foreground'}`}>
              {isFree ? 'FREE' : `₹${tournament.entryFee}`}
            </p>
          </div>
        </div>

        {/* Progress slots bar */}
        <div className="flex flex-col gap-1.5 mb-5">
          <div className="flex justify-between text-[11px] font-bold text-muted">
            <span>Slots: {progressPercent}% Filled</span>
            <span className={slotsRemaining <= 3 && slotsRemaining > 0 ? 'text-danger' : 'text-foreground/90'}>
              {slotsRemaining <= 0 ? 'Lobby Full' : `${slotsRemaining} / ${tournament.maxParticipants} Left`}
            </span>
          </div>
          <div className="w-full h-1.5 bg-[#171720] rounded-full overflow-hidden border border-card-border/50">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isFull
                  ? 'bg-rose-500'
                  : slotsRemaining <= 3
                  ? 'bg-amber-500'
                  : 'bg-primary'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Date time & CTAs */}
        <div className="mt-auto flex items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-1.5 text-xs text-muted font-semibold">
            <Calendar className="h-3.5 w-3.5 text-primary" />
            <span className="truncate max-w-[120px]">{formattedDate}</span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`${ROUTES.TOURNAMENTS}/${tournament.slug}`}
              className="px-3 py-1.5 rounded-lg border border-card-border hover:border-primary/40 hover:bg-card-bg text-xs font-bold text-foreground transition-all"
            >
              Details
            </Link>

            {tournament.status !== 'Completed' &&
            tournament.status !== 'Cancelled' &&
            tournament.status !== 'Refunded' &&
            !isFull ? (
              <Link
                href={`${ROUTES.TOURNAMENTS}/${tournament.slug}/register`}
                className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-background text-xs font-black transition-all hover:scale-105 active:scale-95 glow-primary"
              >
                Join
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TournamentCard;
