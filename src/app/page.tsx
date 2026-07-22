'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTournaments } from '@/providers/TournamentProvider';
import { ROUTES } from '@/constants';
import TournamentCard from '@/components/tournaments/TournamentCard';
import Countdown from '@/components/common/Countdown';
import { Shield, Zap, Sparkles, Star, Users, Gamepad, Award, ChevronDown } from 'lucide-react';

export default function Home() {
  const { tournaments } = useTournaments();
  
  // Stats Counters state
  const [stats, setStats] = useState({
    activePlayers: 0,
    totalTournaments: 0,
    liveMatches: 0,
    prizesWon: 0,
  });

  // FAQ Expand state
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  useEffect(() => {
    // Animate stats counter mock values
    const targetStats = {
      activePlayers: 14250,
      totalTournaments: 320,
      liveMatches: 6,
      prizesWon: 145000,
    };

    let start = 0;
    const duration = 1500; // ms
    const stepTime = 30;
    const steps = duration / stepTime;
    
    const interval = setInterval(() => {
      start++;
      setStats({
        activePlayers: Math.min(targetStats.activePlayers, Math.round((targetStats.activePlayers / steps) * start)),
        totalTournaments: Math.min(targetStats.totalTournaments, Math.round((targetStats.totalTournaments / steps) * start)),
        liveMatches: Math.min(targetStats.liveMatches, Math.round((targetStats.liveMatches / steps) * start)),
        prizesWon: Math.min(targetStats.prizesWon, Math.round((targetStats.prizesWon / steps) * start)),
      });

      if (start >= steps) {
        clearInterval(interval);
      }
    }, stepTime);

    return () => clearInterval(interval);
  }, []);

  // Filter lists
  const featured = tournaments.filter((t) => t.featured && t.status !== 'Completed').slice(0, 2);
  const upcoming = tournaments.filter((t) => t.status === 'Upcoming' || t.status === 'Registration Open').slice(0, 4);
  const freeEntry = tournaments.filter((t) => t.entryFee === 0 && t.status !== 'Completed').slice(0, 4);
  const premium = tournaments.filter((t) => t.entryFee >= 50 && t.status !== 'Completed').slice(0, 4);

  // Hero main featured
  const heroFeatured = tournaments.find((t) => t.featured && t.status === 'Registration Open') || tournaments[0];

  const faqs = [
    {
      q: 'Is this a real money tournament platform?',
      a: 'No. VONK Tournaments is a client-side frontend design concept. All wallet balances, registration fees, transactions, and prize disbursements are simulated in your browser local storage. No real money or payment methods are connected.',
    },
    {
      q: 'How do I join a custom room in BGMI?',
      a: 'Once your registration is approved and the configured Room Release Time is reached, head to the "Match Room" tab on the tournament page to view the Room ID and Password. Use these credentials inside BGMI to join the lobby.',
    },
    {
      q: 'What happens if a match is cancelled?',
      a: 'If an organizer cancels a tournament, the registration fee is immediately credited back into your simulated wallet, and a refund transaction is added to your local wallet history.',
    },
    {
      q: 'How are placement and kill points calculated?',
      a: 'Our point calculations match standard competitive metrics: 1 Kill = 1 Point. Placement points range from 10 points for a Winner down to 1 point for 10th place, summing up to calculate your total points.',
    },
  ];

  return (
    <div className="flex flex-col gap-12 md:gap-20 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 md:pt-20 pb-8 flex flex-col items-center text-center px-4">
        {/* Background Glowing Circles */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-secondary/10 rounded-full blur-3xl -z-10 pointer-events-none" />

        {/* Brand visual header */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-card-border bg-card-bg/80 text-xs font-semibold tracking-wide text-foreground/90 mb-6 shadow-inner">
          <Sparkles className="h-4 w-4 text-primary animate-pulse" />
          <span>Next-Gen Mobile Tournaments</span>
        </div>

        {/* Large heading */}
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-none mb-6">
          COMPETE. CONQUER. <br />
          <span className="text-gradient">WIN REWARDS.</span>
        </h1>

        {/* Subtitle */}
        <p className="text-sm md:text-lg text-muted max-w-xl leading-relaxed mb-8">
          Join premium BGMI-style custom-room tournaments, coordinate your squad roster, monitor room release timers, and climb the platform rankings.
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href={ROUTES.TOURNAMENTS}
            className="px-6 py-3.5 rounded-xl bg-primary hover:bg-primary/95 text-background font-black text-sm transition-all hover:scale-105 active:scale-95 glow-primary"
          >
            Explore Tournaments
          </Link>
          <Link
            href={ROUTES.RULES}
            className="px-6 py-3.5 rounded-xl border border-card-border hover:border-primary/30 bg-card-bg/60 hover:bg-card-bg font-bold text-sm text-foreground transition-all"
          >
            Platform Rules
          </Link>
        </div>

        {/* 2. HERO FEATURED TOURNAMENT BANNER */}
        {heroFeatured && (
          <div className="w-full max-w-4xl mt-12 md:mt-16 rounded-2xl border border-card-border bg-card-bg/40 p-4 md:p-6 backdrop-blur-md relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/5 rounded-full blur-3xl -z-10" />
            <div className="flex flex-col md:flex-row items-center gap-6 justify-between text-left">
              <div className="flex-1 flex flex-col gap-2">
                <span className="text-[10px] font-black uppercase text-secondary tracking-widest flex items-center gap-1.5">
                  <Star className="h-3.5 w-3.5 fill-secondary" />
                  Featured Tournament
                </span>
                <h2 className="text-lg md:text-2xl font-black tracking-tight">{heroFeatured.title}</h2>
                <div className="flex flex-wrap gap-4 text-xs font-semibold text-muted mt-2">
                  <span className="flex items-center gap-1">
                    Prize: <strong className="text-gradient-prize">₹{heroFeatured.prizePool.toLocaleString()}</strong>
                  </span>
                  <span className="border-l border-card-border pl-4">
                    Fee: <strong className="text-foreground">{heroFeatured.entryFee === 0 ? 'FREE' : `₹${heroFeatured.entryFee}`}</strong>
                  </span>
                  <span className="border-l border-card-border pl-4">
                    Map: <strong className="text-foreground">{heroFeatured.map}</strong>
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-center md:items-end gap-3.5 w-full md:w-auto">
                <Countdown targetDate={heroFeatured.matchStart} className="text-xs font-bold text-right" />
                <Link
                  href={`${ROUTES.TOURNAMENTS}/${heroFeatured.slug}`}
                  className="w-full md:w-auto text-center px-5 py-2.5 rounded-lg bg-primary hover:bg-primary/95 text-background font-extrabold text-xs transition-all hover:scale-105 active:scale-95 glow-primary"
                >
                  Join Tournament
                </Link>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 3. PLATFORM STATISTICS BAR */}
      <section className="px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto rounded-2xl border border-card-border bg-card-bg/60 p-6 text-center shadow-lg divide-y-0 divide-x-0 md:divide-x divide-card-border/60">
          <div className="flex flex-col p-2.5">
            <span className="text-xl md:text-3xl font-black text-primary font-mono">
              {stats.activePlayers.toLocaleString()}+
            </span>
            <span className="text-[10px] font-bold text-muted uppercase tracking-wider mt-1">Active Players</span>
          </div>
          <div className="flex flex-col p-2.5">
            <span className="text-xl md:text-3xl font-black text-secondary font-mono">
              {stats.totalTournaments}+
            </span>
            <span className="text-[10px] font-bold text-muted uppercase tracking-wider mt-1">Total Tournaments</span>
          </div>
          <div className="flex flex-col p-2.5">
            <span className="text-xl md:text-3xl font-black text-foreground font-mono">
              {stats.liveMatches}
            </span>
            <span className="text-[10px] font-bold text-muted uppercase tracking-wider mt-1">Live Matches</span>
          </div>
          <div className="flex flex-col p-2.5">
            <span className="text-xl md:text-3xl font-black text-gradient-prize font-mono">
              ₹{stats.prizesWon.toLocaleString()}
            </span>
            <span className="text-[10px] font-bold text-muted uppercase tracking-wider mt-1">Prizes Distributed</span>
          </div>
        </div>
      </section>

      {/* 4. FEATURED TOURNAMENTS SECTION */}
      {featured.length > 0 && (
        <section className="px-4 flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-card-border pb-3">
            <h2 className="text-lg md:text-2xl font-black tracking-tight flex items-center gap-2">
              <Star className="h-5 w-5 text-secondary fill-secondary" />
              FEATURED MATCHES
            </h2>
            <Link href={ROUTES.TOURNAMENTS} className="text-xs font-bold text-primary hover:underline">
              See All
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featured.map((t) => (
              <TournamentCard key={t.id} tournament={t} />
            ))}
          </div>
        </section>
      )}

      {/* 5. UPCOMING TOURNAMENTS SECTION */}
      {upcoming.length > 0 && (
        <section className="px-4 flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-card-border pb-3">
            <h2 className="text-lg md:text-2xl font-black tracking-tight flex items-center gap-2">
              <Gamepad className="h-5 w-5 text-primary" />
              UPCOMING EVENTS
            </h2>
            <Link href={ROUTES.TOURNAMENTS} className="text-xs font-bold text-primary hover:underline">
              Browse More
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {upcoming.map((t) => (
              <TournamentCard key={t.id} tournament={t} />
            ))}
          </div>
        </section>
      )}

      {/* 6. FREE TOURNAMENTS SECTION */}
      {freeEntry.length > 0 && (
        <section className="px-4 flex flex-col gap-6 bg-primary/[0.01] py-8 border-t border-b border-primary/5">
          <div className="flex items-center justify-between border-b border-card-border pb-3">
            <div>
              <h2 className="text-lg md:text-2xl font-black tracking-tight flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                FREE ENTRYScrims
              </h2>
              <p className="text-[10px] text-muted font-bold uppercase tracking-wider mt-0.5">
                ₹0 entry fee. Zero risk, instant experience payouts.
              </p>
            </div>
            <Link href={ROUTES.TOURNAMENTS} className="text-xs font-bold text-primary hover:underline">
              Filter Free
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {freeEntry.map((t) => (
              <TournamentCard key={t.id} tournament={t} />
            ))}
          </div>
        </section>
      )}

      {/* 7. PREMIUM TOURNAMENTS */}
      {premium.length > 0 && (
        <section className="px-4 flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-card-border pb-3">
            <div>
              <h2 className="text-lg md:text-2xl font-black tracking-tight flex items-center gap-2">
                <Star className="h-5 w-5 text-gradient-prize fill-primary/20" />
                PREMIUM ARENAS
              </h2>
              <p className="text-[10px] text-muted font-bold uppercase tracking-wider mt-0.5">
                High stakes matches with massive prize pool payouts.
              </p>
            </div>
            <Link href={ROUTES.TOURNAMENTS} className="text-xs font-bold text-primary hover:underline">
              Filter Paid
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {premium.map((t) => (
              <TournamentCard key={t.id} tournament={t} />
            ))}
          </div>
        </section>
      )}

      {/* 8. HOW IT WORKS SECTION */}
      <section className="px-4 py-8 rounded-3xl border border-card-border bg-card-bg/20 text-center">
        <h2 className="text-xl md:text-3xl font-black tracking-tight mb-3">HOW IT WORKS</h2>
        <p className="text-xs text-muted max-w-sm mx-auto mb-10">
          Get registered and jump into battle in 4 simple steps
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-4xl mx-auto text-left">
          <div className="p-5 rounded-2xl border border-card-border bg-card-bg/60 flex flex-col gap-3">
            <span className="h-7 w-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-mono font-black text-primary text-xs">
              01
            </span>
            <h3 className="text-sm font-extrabold uppercase text-foreground">Create Profile</h3>
            <p className="text-xs text-muted leading-relaxed">
              Add your IGN (In-Game Name) and Character ID, verify your skill levels, and get ready.
            </p>
          </div>
          <div className="p-5 rounded-2xl border border-card-border bg-card-bg/60 flex flex-col gap-3">
            <span className="h-7 w-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-mono font-black text-primary text-xs">
              02
            </span>
            <h3 className="text-sm font-extrabold uppercase text-foreground">Register Team</h3>
            <p className="text-xs text-muted leading-relaxed">
              Join Solo or create your team roster using unique join codes. Complete mock wallet checkouts.
            </p>
          </div>
          <div className="p-5 rounded-2xl border border-card-border bg-card-bg/60 flex flex-col gap-3">
            <span className="h-7 w-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-mono font-black text-primary text-xs">
              03
            </span>
            <h3 className="text-sm font-extrabold uppercase text-foreground">Access Room</h3>
            <p className="text-xs text-muted leading-relaxed">
              Unlock simulated Custom Room ID and password exactly 15 minutes before the match start time.
            </p>
          </div>
          <div className="p-5 rounded-2xl border border-card-border bg-card-bg/60 flex flex-col gap-3">
            <span className="h-7 w-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-mono font-black text-primary text-xs">
              04
            </span>
            <h3 className="text-sm font-extrabold uppercase text-foreground">Submit Standings</h3>
            <p className="text-xs text-muted leading-relaxed">
              Play your match, upload screenshots of your placements/kills, and collect simulated winnings.
            </p>
          </div>
        </div>
      </section>

      {/* 9. WHY CHOOSE VONK */}
      <section className="px-4">
        <div className="flex flex-col gap-6 text-center">
          <h2 className="text-xl md:text-3xl font-black tracking-tight mb-2">WHY CHOOSE VONK</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto text-left">
            <div className="flex gap-4 p-5 rounded-2xl border border-card-border bg-card-bg/40">
              <Shield className="h-8 w-8 text-primary shrink-0" />
              <div>
                <h4 className="text-sm font-extrabold uppercase mb-1.5">Fair Play Verification</h4>
                <p className="text-xs text-muted leading-relaxed">
                  Strict anti-cheat policies, manual screenshot verification, and platform ban implementations.
                </p>
              </div>
            </div>
            <div className="flex gap-4 p-5 rounded-2xl border border-card-border bg-card-bg/40">
              <Zap className="h-8 w-8 text-secondary shrink-0" />
              <div>
                <h4 className="text-sm font-extrabold uppercase mb-1.5">Decoupled App-Ready Engine</h4>
                <p className="text-xs text-muted leading-relaxed">
                  Designed for fluid mobile rendering. Highly reactive layout controls, optimized for app translations.
                </p>
              </div>
            </div>
            <div className="flex gap-4 p-5 rounded-2xl border border-card-border bg-card-bg/40">
              <Users className="h-8 w-8 text-gradient-prize shrink-0" />
              <div>
                <h4 className="text-sm font-extrabold uppercase mb-1.5">Roster Roster Management</h4>
                <p className="text-xs text-muted leading-relaxed">
                  Generate unique joining codes, coordinate sub rosters, and invite mock team partners.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 10. FAQ ACCORDION SECTION */}
      <section className="px-4 max-w-3xl mx-auto w-full flex flex-col gap-6">
        <h2 className="text-xl md:text-3xl font-black tracking-tight text-center mb-2">
          FREQUENTLY ASKED QUESTIONS
        </h2>
        <div className="flex flex-col gap-3">
          {faqs.map((faq, idx) => {
            const isExpanded = expandedFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-xl border border-card-border bg-card-bg/60 overflow-hidden transition-all"
              >
                <button
                  onClick={() => setExpandedFaq(isExpanded ? null : idx)}
                  className="w-full flex items-center justify-between p-4 text-left text-sm font-bold text-foreground/90 hover:text-primary transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`h-4 w-4 text-muted transition-transform duration-300 ${
                      isExpanded ? 'rotate-180 text-primary' : ''
                    }`}
                  />
                </button>
                {isExpanded && (
                  <div className="px-4 pb-4 text-xs text-muted leading-relaxed border-t border-card-border/30 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 11. PWA INSTALL BANNER PROMOTION PLACEHOLDER */}
      <section className="px-4">
        <div className="max-w-4xl mx-auto rounded-2xl border border-dashed border-primary/20 bg-primary/[0.02] p-6 text-center flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-left flex flex-col gap-1.5">
            <span className="text-[10px] font-black text-primary uppercase tracking-widest">PWA Feature Coming Soon</span>
            <h3 className="text-base font-bold text-foreground">Install VONK Tournaments App</h3>
            <p className="text-xs text-muted max-w-md">
              Save this web app to your home screen for native-app like full-screen lobbies, quick room notifications, and lightning fast profiles access.
            </p>
          </div>
          <button
            onClick={() => alert('PWA installation configurations are prepared. Active native app downloads will release in subsequent revisions.')}
            className="px-5 py-2.5 rounded-lg border border-primary/20 bg-primary/10 text-primary font-bold text-xs hover:bg-primary/25 transition-all shrink-0 touch-target"
          >
            Add to Home Screen
          </button>
        </div>
      </section>
    </div>
  );
}
