'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTeams } from '@/providers/TeamProvider';
import { useAuth } from '@/providers/AuthProvider';
import { ArrowLeft, Users, Activity, Trophy, TrendingUp, BarChart2 } from 'lucide-react';

export default function TeamStatistics() {
  const { teamId } = useParams() as { teamId: string };
  const { user } = useAuth();
  const { myTeam, teams } = useTeams();

  // Lookup matched team
  const team = useMemo(() => {
    return teams.find((t) => t.id === teamId) || null;
  }, [teams, teamId]);

  // Mock member contributions data
  const memberContributions = useMemo(() => {
    if (!team) return [];
    return team.members.map((member, idx) => {
      // Generate deterministic mock stats based on player name/index
      const baseMatches = team.stats.matches || 5;
      const factor = (idx + 1) * 1.5;
      const kills = Math.floor(team.stats.kills * (0.15 + idx * 0.1));
      const assists = Math.floor(kills * 0.4);
      const damage = kills * 180 + baseMatches * 200;
      const mvps = Math.floor(baseMatches * (0.05 + idx * 0.05));
      const contributionPercent = Math.min(95, Math.floor(20 + idx * 10));

      return {
        id: member.playerId,
        name: member.inGameName,
        role: member.role,
        matches: baseMatches,
        kills,
        assists,
        damage,
        mvps,
        contributionPercent,
      };
    });
  }, [team]);

  if (!user || !team) {
    return (
      <div className="max-w-xl mx-auto w-full pb-20 px-4 md:px-0 pt-12 text-center">
        <h2 className="text-sm font-black text-foreground">SQUAD NOT FOUND</h2>
        <Link href="/teams" className="text-xs text-primary hover:underline mt-2 inline-block">
          Return to Arena
        </Link>
      </div>
    );
  }

  // Calculate stats parameters
  const matches = team.stats.matches || 5;
  const wins = team.stats.wins || 0;
  const kills = team.stats.kills || 0;
  const winRate = matches > 0 ? Math.floor((wins / matches) * 100) : 0;
  const avgKills = matches > 0 ? (kills / matches).toFixed(1) : '0.0';
  const streak = team.stats.streak || 0;

  return (
    <div className="flex flex-col gap-6 pb-20 px-4 md:px-0 pt-4 text-left">
      {/* Back button */}
      <Link href="/teams" className="flex items-center gap-1.5 text-xs text-muted hover:text-foreground w-fit transition-colors">
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Arena</span>
      </Link>

      <div className="flex flex-col gap-1 border-b border-card-border pb-4">
        <h1 className="text-xl md:text-2xl font-black uppercase tracking-tight flex items-center gap-2">
          <Activity className="h-6 w-6 text-primary" />
          Squad Analytics & Charts
        </h1>
        <p className="text-xs text-muted">Review team-level performance, placement streaks, and member contribution stats.</p>
      </div>

      {/* Grid: Overview Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-[#0d0d12] border border-card-border rounded-2xl flex flex-col gap-1 text-left">
          <span className="text-[9px] font-bold text-muted uppercase">Win Rate ratio</span>
          <span className="text-xl font-black text-primary font-mono">{winRate}%</span>
        </div>
        <div className="p-4 bg-[#0d0d12] border border-card-border rounded-2xl flex flex-col gap-1 text-left">
          <span className="text-[9px] font-bold text-muted uppercase">Avg Kills per match</span>
          <span className="text-xl font-black text-secondary font-mono">{avgKills}</span>
        </div>
        <div className="p-4 bg-[#0d0d12] border border-card-border rounded-2xl flex flex-col gap-1 text-left">
          <span className="text-[9px] font-bold text-muted uppercase">Current Win Streak</span>
          <span className="text-xl font-black text-indigo-400 font-mono">{streak} Wins</span>
        </div>
        <div className="p-4 bg-[#0d0d12] border border-card-border rounded-2xl flex flex-col gap-1 text-left">
          <span className="text-[9px] font-bold text-muted uppercase">Favorite Map</span>
          <span className="text-xl font-black text-gradient-prize font-mono">{team.preferredMap || 'Erangel'}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* SVG Chart 1: Placement Trends (Line Chart) */}
        <div className="rounded-2xl border border-card-border bg-[#0d0d12]/50 p-5 flex flex-col gap-4">
          <span className="text-xs uppercase font-extrabold tracking-wider text-muted flex items-center gap-1.5">
            <TrendingUp className="h-4.5 w-4.5 text-primary" />
            Placement Trends (Past 5 Matches)
          </span>

          <div className="h-44 w-full relative flex items-center justify-center bg-card-bg/15 rounded-xl border border-card-border/50">
            {/* Draw inline SVG line graph */}
            <svg viewBox="0 0 400 150" className="w-full h-full p-2 overflow-visible">
              {/* grid lines */}
              <line x1="50" y1="20" x2="350" y2="20" stroke="#1f2937" strokeWidth="1" strokeDasharray="3,3" />
              <line x1="50" y1="70" x2="350" y2="70" stroke="#1f2937" strokeWidth="1" strokeDasharray="3,3" />
              <line x1="50" y1="120" x2="350" y2="120" stroke="#1f2937" strokeWidth="1" strokeDasharray="3,3" />

              {/* placement path: points coordinates: (50, 110), (125, 40), (200, 80), (275, 20), (350, 30) */}
              <path
                d="M 50 110 L 125 40 L 200 80 L 275 20 L 350 30"
                fill="none"
                stroke="#10b981"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Points labels */}
              <circle cx="50" cy="110" r="5" fill="#10b981" />
              <text x="45" y="100" fill="#9ca3af" fontSize="9" fontWeight="bold">#12</text>

              <circle cx="125" cy="40" r="5" fill="#10b981" />
              <text x="120" y="30" fill="#9ca3af" fontSize="9" fontWeight="bold">#3</text>

              <circle cx="200" cy="80" r="5" fill="#10b981" />
              <text x="195" y="70" fill="#9ca3af" fontSize="9" fontWeight="bold">#8</text>

              <circle cx="275" cy="20" r="5" fill="#10b981" />
              <text x="270" y="10" fill="#10b981" fontSize="9" fontWeight="bold">#1</text>

              <circle cx="350" cy="30" r="5" fill="#10b981" />
              <text x="345" y="20" fill="#9ca3af" fontSize="9" fontWeight="bold">#2</text>
            </svg>
          </div>
        </div>

        {/* SVG Chart 2: Kill Trends (Bar Chart) */}
        <div className="rounded-2xl border border-card-border bg-[#0d0d12]/50 p-5 flex flex-col gap-4">
          <span className="text-xs uppercase font-extrabold tracking-wider text-muted flex items-center gap-1.5">
            <BarChart2 className="h-4.5 w-4.5 text-primary" />
            Kill Stats Trends
          </span>

          <div className="h-44 w-full relative flex items-center justify-center bg-card-bg/15 rounded-xl border border-card-border/50">
            {/* Draw inline SVG bar graph */}
            <svg viewBox="0 0 400 150" className="w-full h-full p-2 overflow-visible">
              <line x1="50" y1="20" x2="350" y2="20" stroke="#1f2937" strokeWidth="1" strokeDasharray="3,3" />
              <line x1="50" y1="70" x2="350" y2="70" stroke="#1f2937" strokeWidth="1" strokeDasharray="3,3" />
              <line x1="50" y1="120" x2="350" y2="120" stroke="#1f2937" strokeWidth="1" strokeDasharray="3,3" />

              {/* Match bars */}
              {/* Bar 1 */}
              <rect x="75" y="50" width="20" height="70" fill="#8b5cf6" rx="4" />
              <text x="79" y="40" fill="#9ca3af" fontSize="9" fontWeight="bold">7K</text>
              {/* Bar 2 */}
              <rect x="145" y="20" width="20" height="100" fill="#8b5cf6" rx="4" />
              <text x="146" y="10" fill="#9ca3af" fontSize="9" fontWeight="bold">12K</text>
              {/* Bar 3 */}
              <rect x="215" y="60" width="20" height="60" fill="#8b5cf6" rx="4" />
              <text x="219" y="50" fill="#9ca3af" fontSize="9" fontWeight="bold">6K</text>
              {/* Bar 4 */}
              <rect x="285" y="10" width="20" height="110" fill="#8b5cf6" rx="4" />
              <text x="286" y="0" fill="#8b5cf6" fontSize="9" fontWeight="bold">15K</text>
            </svg>
          </div>
        </div>
      </div>

      {/* Table: Member Contributions comparison */}
      <div className="rounded-2xl border border-card-border bg-[#0d0d12] p-5 flex flex-col gap-4 text-left">
        <span className="text-xs uppercase font-extrabold tracking-wider text-muted flex items-center gap-1.5">
          <Users className="h-4.5 w-4.5 text-primary" />
          Member Contribution breakdown
        </span>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-foreground/80">
            <thead>
              <tr className="border-b border-card-border pb-2 text-[10px] uppercase font-extrabold tracking-widest text-muted">
                <th className="text-left pb-2 font-black">Teammate</th>
                <th className="text-center pb-2 font-black">Matches</th>
                <th className="text-center pb-2 font-black">Kills</th>
                <th className="text-center pb-2 font-black">Assists</th>
                <th className="text-center pb-2 font-black">Damage</th>
                <th className="text-center pb-2 font-black">MVPs</th>
                <th className="text-right pb-2 font-black">Contribution %</th>
              </tr>
            </thead>
            <tbody>
              {memberContributions.map((member) => (
                <tr key={member.id} className="border-b border-card-border/50 last:border-0">
                  <td className="py-3 text-left">
                    <p className="font-extrabold text-foreground">{member.name}</p>
                    <p className="text-[9px] text-muted font-bold uppercase">{member.role}</p>
                  </td>
                  <td className="py-3 text-center font-mono font-bold">{member.matches}</td>
                  <td className="py-3 text-center font-mono font-bold">{member.kills}</td>
                  <td className="py-3 text-center font-mono text-muted">{member.assists}</td>
                  <td className="py-3 text-center font-mono text-muted">{member.damage}</td>
                  <td className="py-3 text-center font-mono font-bold text-primary">{member.mvps}</td>
                  <td className="py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className="font-mono font-bold">{member.contributionPercent}%</span>
                      <div className="w-12 bg-muted-bg rounded-full h-1.5 overflow-hidden hidden sm:block">
                        <div
                          className="bg-primary h-full rounded-full"
                          style={{ width: `${member.contributionPercent}%` }}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
