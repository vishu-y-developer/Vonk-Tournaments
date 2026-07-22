'use client';

import React, { use, useState, useMemo } from 'react';
import { useRegistrations } from '@/providers/RegistrationProvider';
import { useTournaments } from '@/providers/TournamentProvider';
import { useAuth } from '@/providers/AuthProvider';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Trophy, 
  Calendar, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Info,
  Copy,
  PlusCircle,
  FileText,
  HelpCircle,
  X,
  RotateCcw
} from 'lucide-react';
import { Registration, RegistrationActivity } from '@/types';

interface Params {
  registrationId: string;
}

export default function RegistrationDetailsPage({ params }: { params: Promise<Params> }) {
  const { registrationId } = use(params);
  const { getRegistration, cancelRegistration, getActivities } = useRegistrations();
  const { getTournamentById } = useTournaments();
  const { user } = useAuth();

  const reg = getRegistration(registrationId);
  const tournament = reg ? getTournamentById(reg.tournamentId) : null;
  const activities = useMemo(() => getActivities(registrationId), [getActivities, registrationId]);

  const [copied, setCopied] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState('Schedule Conflict');
  const [customReason, setCustomReason] = useState('');
  const [submittingCancel, setSubmittingCancel] = useState(false);

  const handleCopyId = () => {
    if (!reg) return;
    navigator.clipboard.writeText(reg.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirmCancel = () => {
    if (!reg) return;
    setSubmittingCancel(true);
    setTimeout(() => {
      const reason = cancelReason === 'Other' ? customReason : cancelReason;
      const res = cancelRegistration(reg.id, reason);
      setSubmittingCancel(false);
      if (res.success) {
        setCancelling(false);
      } else {
        alert(res.error || 'Failed to cancel slot.');
      }
    }, 800);
  };

  if (!reg) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-12 my-12">
        <AlertTriangle className="h-12 w-12 text-muted mb-4 opacity-40" />
        <h2 className="text-xl font-bold text-foreground">Registration Not Found</h2>
        <p className="text-xs text-muted max-w-sm mt-1.5 mb-6">
          The booking ID does not correspond to an active or archived registration.
        </p>
        <Link href="/registrations" className="px-5 py-2.5 bg-primary text-background font-black text-xs rounded-xl">
          View My Bookings
        </Link>
      </div>
    );
  }

  const isConfirmed = reg.status === 'CONFIRMED';
  const isWaitlist = reg.status === 'WAITLISTED';
  const isCancelled = reg.status === 'CANCELLED' || reg.status === 'REFUNDED';

  return (
    <div className="py-6 px-4 md:px-0 space-y-6">
      {/* Header back button */}
      <div className="flex items-center gap-3">
        <Link
          href="/registrations"
          className="p-2 border border-border bg-card rounded-lg hover:bg-white/5 text-muted hover:text-foreground transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <span className="text-[10px] font-black uppercase text-primary tracking-widest">Booking Invoice Details</span>
          <h1 className="text-lg md:text-2xl font-black text-foreground">Registration Summary</h1>
        </div>
      </div>

      {/* Main Details layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Summary Receipts cards */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Overview status box */}
          <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-border/40 pb-4">
              <div className="space-y-0.5">
                <span className="text-[9px] font-black uppercase text-muted tracking-wider">Registration ID</span>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black text-foreground">{reg.id}</h3>
                  <button onClick={handleCopyId} className="hover:text-foreground text-muted text-xs transition-all">
                    {copied ? 'Copied' : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              <span className={`px-2.5 py-1 rounded-full text-[9px] font-black tracking-wider uppercase border ${
                isConfirmed 
                  ? 'bg-green-500/10 text-green-400 border-green-500/20'
                  : isWaitlist 
                    ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                    : 'bg-red-500/10 text-red-400 border-red-500/20'
              }`}>
                {reg.status}
              </span>
            </div>

            {/* Timestamps */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="space-y-0.5 text-muted-foreground">
                <span>Roster Slot</span>
                <span className="font-bold text-foreground block text-sm">
                  {reg.slotNumber ? `Slot #${reg.slotNumber}` : 'Waitlist Queue'}
                </span>
              </div>
              <div className="space-y-0.5 text-muted-foreground">
                <span>Simulated Entry Fee</span>
                <span className="font-bold text-foreground block text-sm">₹{reg.entryFeePaid}</span>
              </div>
              <div className="space-y-0.5 text-muted-foreground">
                <span>Roster Format</span>
                <span className="font-bold text-foreground block text-sm">{tournament?.registrationFormat || 'Squad'}</span>
              </div>
              <div className="space-y-0.5 text-muted-foreground">
                <span>Registered Date</span>
                <span className="font-bold text-foreground block text-sm">
                  {new Date(reg.registeredAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {isCancelled && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 space-y-2 text-xs">
                <span className="font-bold text-red-400 block">Cancellation Log Details</span>
                <div className="grid grid-cols-2 gap-2 text-muted-foreground text-[11px]">
                  <div>Reason: <span className="text-foreground font-bold">{reg.cancellationReason || 'User Cancelled'}</span></div>
                  <div className="text-right">Simulated Refund: <span className="text-foreground font-bold">₹{reg.refundAmount || 0}</span></div>
                </div>
              </div>
            )}
          </div>

          {/* Roster profiles listings */}
          <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-border/40 pb-3">
              <Users className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-black uppercase text-foreground tracking-wider"> Roster Participants</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {reg.membersRegistered.map((member) => (
                <div key={member.playerId} className="rounded-xl border border-border/60 bg-black/20 p-3.5 space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-foreground">{member.inGameName}</span>
                    <span className="text-[8px] font-black uppercase bg-white/5 border border-border/60 px-1 rounded text-muted">
                      {member.role || 'Member'}
                    </span>
                  </div>
                  <div className="text-[10px] text-muted-foreground space-y-0.5">
                    <div>Character ID: <span className="text-foreground font-mono">{member.characterId || 'N/A'}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Timeline log */}
          <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-border/40 pb-3">
              <Clock className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-black uppercase text-foreground tracking-wider">Registration Timeline Activity</h3>
            </div>

            <div className="space-y-4 relative pl-4 before:absolute before:left-1.5 before:top-1 before:bottom-1 before:w-[1px] before:bg-border">
              {activities.map((act: RegistrationActivity) => (
                <div key={act.id} className="relative space-y-1 text-xs">
                  {/* node dot */}
                  <div className="absolute -left-[14.5px] top-1.5 h-2 w-2 rounded-full bg-primary ring-4 ring-card" />
                  <div className="flex justify-between items-center text-[10px] text-muted">
                    <span className="font-bold text-foreground">{act.type}</span>
                    <span>{new Date(act.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">{act.description}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Side: Sidebar details summary */}
        <div className="space-y-4">
          
          {/* Tournament Overview Widget */}
          {tournament && (
            <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
              <span className="text-[10px] font-black uppercase text-muted tracking-wider block">Target Tournament</span>
              
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
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <Link
                  href={`/tournaments/${tournament.slug}`}
                  className="w-full py-2 bg-primary hover:bg-yellow-500 text-background font-black text-xs text-center rounded-lg transition-all"
                >
                  View Tournament Page
                </Link>
                {reg.teamId && (
                  <Link
                    href={`/teams/${reg.teamId}`}
                    className="w-full py-2 border border-border bg-transparent text-muted hover:text-foreground text-xs font-bold text-center rounded-lg transition-all"
                  >
                    View Team Squad
                  </Link>
                )}
                {isConfirmed && (
                  <button
                    onClick={() => setCancelling(true)}
                    className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold text-xs rounded-lg transition-all"
                  >
                    Cancel Registration
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Simulated Disclaimer */}
          <div className="rounded-2xl border border-border bg-card p-4 space-y-2 text-[10px] text-muted-foreground leading-relaxed">
            <div className="flex gap-2">
              <Info className="h-4 w-4 shrink-0 text-primary" />
              <div className="space-y-0.5">
                <span className="font-bold text-foreground block">Play Money Notice</span>
                <p>
                  No real-world lobbies or server keys are issued. Check-ins are managed inside standard developer sandboxes.
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Cancellation Dialog modal overlay */}
      {cancelling && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80" onClick={() => setCancelling(false)} />
          <div className="relative rounded-2xl border border-border bg-card p-6 max-w-sm w-full space-y-4">
            <div className="flex justify-between items-start">
              <div className="space-y-0.5">
                <h3 className="text-base font-bold text-foreground">Cancel Registration</h3>
                <span className="text-[10px] text-muted font-bold">ID: {reg.id}</span>
              </div>
              <button onClick={() => setCancelling(false)} className="p-1 rounded hover:bg-white/10 text-muted hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-muted">Cancellation Reason</label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full rounded-xl border border-border bg-black/25 py-2 px-3 outline-none"
                >
                  <option value="Schedule Conflict">Schedule Conflict</option>
                  <option value="Team Roster Offline">Team Roster Offline</option>
                  <option value="Registered by Mistake">Registered by Mistake</option>
                  <option value="Other">Other Reason</option>
                </select>
              </div>

              {cancelReason === 'Other' && (
                <div className="space-y-1">
                  <label className="font-bold text-muted">Explain Reason</label>
                  <textarea
                    placeholder="Enter reason details..."
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    className="w-full h-16 rounded-xl border border-border bg-black/25 p-2 outline-none resize-none"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setCancelling(false)}
                className="flex-1 py-2 border border-border bg-transparent text-muted hover:text-foreground hover:bg-white/5 font-bold text-xs rounded-xl"
              >
                Back
              </button>
              <button
                disabled={submittingCancel}
                onClick={handleConfirmCancel}
                className="flex-1 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 font-bold border border-red-500/30 text-xs rounded-xl flex items-center justify-center gap-1.5"
              >
                {submittingCancel ? (
                  <>
                    <RotateCcw className="h-3 w-3 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>Confirm Cancel</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
