'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTeams } from '@/providers/TeamProvider';
import { useAuth } from '@/providers/AuthProvider';
import { ArrowLeft, Users, Check, X, ShieldAlert } from 'lucide-react';

export default function JoinRequests() {
  const { teamId } = useParams() as { teamId: string };
  const { user } = useAuth();
  const { myTeam, joinRequests, respondToJoinRequest } = useTeams();

  if (!user || !myTeam || myTeam.id !== teamId) {
    return (
      <div className="max-w-xl mx-auto w-full pb-20 px-4 md:px-0 pt-12 text-center">
        <h2 className="text-sm font-black text-foreground">NOT AUTHORIZED</h2>
      </div>
    );
  }

  const handleRespond = (requestId: string, approve: boolean, playerName: string) => {
    const res = respondToJoinRequest(requestId, approve);
    if (res.success) {
      alert(`Join request for ${playerName} has been ${approve ? 'approved' : 'rejected'}.`);
    } else {
      alert(res.error || 'Failed to process request.');
    }
  };

  const pendingRequests = joinRequests.filter((r) => r.status === 'Pending');

  return (
    <div className="flex flex-col gap-6 pb-20 px-4 md:px-0 pt-4 text-left">
      {/* Back button */}
      <Link href="/teams" className="flex items-center gap-1.5 text-xs text-muted hover:text-foreground w-fit transition-colors">
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Arena</span>
      </Link>

      <div className="flex flex-col gap-1 border-b border-card-border pb-4">
        <h1 className="text-xl md:text-2xl font-black uppercase tracking-tight flex items-center gap-2">
          <Users className="h-6 w-6 text-primary" />
          Join Requests Inbox
        </h1>
        <p className="text-xs text-muted">Review incoming requests from free agents wanting to join your roster.</p>
      </div>

      <div className="flex flex-col gap-4">
        {pendingRequests.length > 0 ? (
          pendingRequests.map((req) => (
            <div
              key={req.id}
              className="p-5 rounded-2xl border border-card-border bg-[#0d0d12] flex flex-col sm:flex-row justify-between sm:items-center gap-5 text-left"
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-black text-foreground">{req.playerName}</h4>
                  <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[8px] font-black uppercase">
                    Level: {req.playerLevel}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-6 text-[10px] font-bold text-muted uppercase">
                  <div>
                    <p>Matches</p>
                    <p className="text-foreground mt-0.5 font-mono text-xs font-black">{req.statsPreview.matchesPlayed}</p>
                  </div>
                  <div>
                    <p>K/D Ratio</p>
                    <p className="text-foreground mt-0.5 font-mono text-xs font-black">{req.statsPreview.kdRatio}</p>
                  </div>
                  <div>
                    <p>Win Rate</p>
                    <p className="text-foreground mt-0.5 font-mono text-xs font-black">{req.statsPreview.winRate}%</p>
                  </div>
                </div>

                <span className="text-[9px] font-extrabold text-secondary uppercase">
                  Preferred Role: {req.preferredRole}
                </span>
              </div>

              <div className="flex gap-2 shrink-0 self-end sm:self-center">
                <button
                  onClick={() => handleRespond(req.id, false, req.playerName)}
                  className="px-3.5 py-2 bg-danger/10 hover:bg-danger/25 text-danger font-extrabold text-xs rounded-xl transition-all border border-danger/15 flex items-center gap-1 touch-target active:scale-95"
                >
                  <X className="h-4 w-4" />
                  <span>Reject</span>
                </button>
                <button
                  onClick={() => handleRespond(req.id, true, req.playerName)}
                  className="px-3.5 py-2 bg-primary hover:bg-primary/95 text-background font-black text-xs rounded-xl transition-all flex items-center gap-1 touch-target active:scale-95 shadow-md"
                >
                  <Check className="h-4 w-4" />
                  <span>Approve</span>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="py-12 border border-card-border rounded-2xl text-center bg-card-bg/5 flex flex-col items-center justify-center gap-2">
            <span className="text-3xl">📭</span>
            <h3 className="text-xs font-black text-foreground">NO PENDING REQUESTS</h3>
            <p className="text-[10px] text-muted">Join requests from recruiting boards will show up here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
