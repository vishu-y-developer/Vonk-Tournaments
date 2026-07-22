'use client';

import React, { use } from 'react';
import { useTournaments } from '@/providers/TournamentProvider';
import { useTeams } from '@/providers/TeamProvider';
import { RegistrationWizard } from '@/components/registration/RegistrationWizard';
import Link from 'next/link';
import { ArrowLeft, Gamepad } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';

interface Params {
  slug: string;
}

export default function TournamentRegisterPage({ params }: { params: Promise<Params> }) {
  const { slug } = use(params);
  const { getTournamentBySlug } = useTournaments();
  const { user } = useAuth();
  const { myTeam } = useTeams();

  const tournament = getTournamentBySlug(slug);

  if (!tournament) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-12 my-12">
        <Gamepad className="h-12 w-12 text-muted mb-4 opacity-40 animate-pulse" />
        <h2 className="text-xl font-bold text-foreground">Tournament Not Found</h2>
        <p className="text-xs text-muted max-w-sm mt-1.5 mb-6">
          The tournament slot you are looking for does not exist.
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-12 my-12">
        <h2 className="text-xl font-bold text-foreground">Authentication Required</h2>
        <p className="text-xs text-muted max-w-sm mt-1.5 mb-6">
          Please select a player profile to proceed.
        </p>
      </div>
    );
  }

  return (
    <div className="py-6 px-4 md:px-0 space-y-6">
      <div className="flex items-center gap-2">
        <Link
          href={`/tournaments/${slug}`}
          className="p-2 border border-border bg-card rounded-lg hover:bg-white/5 text-muted hover:text-foreground transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <span className="text-[10px] font-black uppercase text-primary tracking-widest">Register Entrance</span>
          <h1 className="text-lg md:text-2xl font-black text-foreground">{tournament.title}</h1>
        </div>
      </div>

      <RegistrationWizard
        tournament={tournament}
        player={user}
        team={myTeam}
      />
    </div>
  );
}
