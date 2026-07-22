'use client';

import React, { useState, useMemo } from 'react';
import { useRegistrations } from '@/providers/RegistrationProvider';
import { useTournaments } from '@/providers/TournamentProvider';
import { useAuth } from '@/providers/AuthProvider';
import Link from 'next/link';
import { 
  Trophy, 
  Calendar, 
  Search, 
  HelpCircle, 
  X, 
  AlertTriangle,
  History,
  Tag,
  ArrowRight,
  TrendingDown,
  XOctagon,
  RotateCcw
} from 'lucide-react';
import { Registration, RegistrationStatus } from '@/types';

export default function MyRegistrationsPage() {
  const { registrations, loading, cancelRegistration } = useRegistrations();
  const { tournaments } = useTournaments();
  const { user } = useAuth();

  const [nowTime] = useState(() => new Date());
  const nowMs = nowTime.getTime();

  const [activeTab, setActiveTab] = useState<'UPCOMING' | 'LIVE' | 'COMPLETED' | 'CANCELLED' | 'WAITLISTED' | 'ALL'>('UPCOMING');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'MATCH_DATE' | 'REG_DATE' | 'ENTRY_FEE' | 'STATUS'>('MATCH_DATE');
  
  // Cancellation Modal state
  const [cancellingReg, setCancellingReg] = useState<Registration | null>(null);
  const [cancelReason, setCancelReason] = useState('Schedule Conflict');
  const [customReason, setCustomReason] = useState('');
  const [isSubmittingCancel, setIsSubmittingCancel] = useState(false);

  // Match corresponding tournament banner helper
  const getTournamentBanner = (tId: string) => {
    const t = tournaments.find((item) => item.id === tId);
    return t ? t.banner : '/images/default-banner.jpg';
  };

  const getTournamentSlug = (tId: string) => {
    const t = tournaments.find((item) => item.id === tId);
    return t ? t.slug : '#';
  };

  const getTournamentMatchStart = (tId: string) => {
    const t = tournaments.find((item) => item.id === tId);
    return t ? t.matchStart : '';
  };

  // Filter & Search & Sort pipeline
  const processedRegs = useMemo(() => {
    if (!user) return [];
    
    // User registrations
    let list = registrations.filter((r) => r.playerId === user.id);

    // Apply Tab filter
    if (activeTab !== 'ALL') {
      list = list.filter((r) => {
        if (activeTab === 'UPCOMING') return r.status === 'CONFIRMED' || r.status === 'PENDING';
        if (activeTab === 'LIVE') return r.status === 'CONFIRMED' && new Date(getTournamentMatchStart(r.tournamentId)).getTime() <= nowMs && new Date(getTournamentMatchStart(r.tournamentId)).getTime() >= nowMs - 7200000;
        if (activeTab === 'COMPLETED') return r.status === 'COMPLETED';
        if (activeTab === 'CANCELLED') return r.status === 'CANCELLED' || r.status === 'REFUNDED';
        if (activeTab === 'WAITLISTED') return r.status === 'WAITLISTED';
        return true;
      });
    }

    // Apply Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((r) => 
        r.id.toLowerCase().includes(q) || 
        (r.tournamentTitle || '').toLowerCase().includes(q) ||
        (r.teamName && r.teamName.toLowerCase().includes(q))
      );
    }

    // Apply Sorting
    list.sort((a, b) => {
      if (sortBy === 'MATCH_DATE') {
        const dateA = new Date(getTournamentMatchStart(a.tournamentId)).getTime();
        const dateB = new Date(getTournamentMatchStart(b.tournamentId)).getTime();
        return dateA - dateB;
      }
      if (sortBy === 'REG_DATE') {
        return new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime();
      }
      if (sortBy === 'ENTRY_FEE') {
        return b.entryFeePaid - a.entryFeePaid;
      }
      if (sortBy === 'STATUS') {
        return a.status.localeCompare(b.status);
      }
      return 0;
    });

    return list;
  }, [registrations, user, activeTab, searchQuery, sortBy, tournaments]);

  const handleCancelClick = (reg: Registration) => {
    setCancellingReg(reg);
    setCancelReason('Schedule Conflict');
    setCustomReason('');
  };

  const handleConfirmCancel = () => {
    if (!cancellingReg) return;
    setIsSubmittingCancel(true);

    setTimeout(() => {
      const finalReason = cancelReason === 'Other' ? customReason : cancelReason;
      const res = cancelRegistration(cancellingReg.id, finalReason);
      setIsSubmittingCancel(false);
      
      if (res.success) {
        setCancellingReg(null);
      } else {
        alert(res.error || 'Failed to cancel registration.');
      }
    }, 800);
  };

  return (
    <div className="py-6 px-4 md:px-0 space-y-6">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-black uppercase text-primary tracking-widest">My Account Lobby</span>
          <h1 className="text-xl md:text-2xl font-black text-foreground">Registered Arenas</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage your slot bookings, rosters and cancellation refunds log.
          </p>
        </div>

        {/* Demo notices */}
        <div className="px-3 py-1.5 rounded-lg border border-yellow-500/20 bg-yellow-500/5 text-[10px] text-yellow-400 font-bold max-w-sm">
          Notice: Registration slot confirmations and wallet refunds are simulated locally.
        </div>
      </div>

      {/* Filter and Tab Controllers */}
      <div className="flex flex-col md:flex-row gap-3 justify-between items-start md:items-center border-b border-border pb-4">
        <div className="flex flex-wrap gap-1.5">
          {(['UPCOMING', 'LIVE', 'COMPLETED', 'CANCELLED', 'WAITLISTED', 'ALL'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === tab 
                  ? 'bg-primary text-background shadow-[0_2px_8px_rgba(251,191,36,0.2)]'
                  : 'bg-card border border-border text-muted hover:text-foreground hover:bg-white/5'
              }`}
            >
              {tab.charAt(0) + tab.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Search / Sorting */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64 min-w-[200px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted" />
            <input
              type="text"
              placeholder="Search by arena, ID, team..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-border bg-card pl-9 pr-4 py-2 text-xs outline-none focus:border-primary transition-all"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'MATCH_DATE' | 'REG_DATE' | 'ENTRY_FEE' | 'STATUS')}
            className="rounded-xl border border-border bg-card py-2 px-3 text-xs outline-none focus:border-primary"
          >
            <option value="MATCH_DATE">Match Date</option>
            <option value="REG_DATE">Registration Date</option>
            <option value="ENTRY_FEE">Entry Fee</option>
            <option value="STATUS">Status</option>
          </select>
        </div>
      </div>

      {/* Registrations List Grid */}
      {loading ? (
        <div className="text-center py-12 text-xs text-muted">Loading registrations...</div>
      ) : processedRegs.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-2xl bg-card/20 space-y-3">
          <Trophy className="h-10 w-10 text-muted mx-auto opacity-35" />
          <h4 className="text-sm font-bold text-foreground">No bookings found</h4>
          <p className="text-xs text-muted max-w-sm mx-auto">
            You don&apos;t have any dynamic bookings matching this tab filter or query.
          </p>
          <Link href="/tournaments" className="inline-block px-4 py-2 bg-primary text-background font-black text-xs rounded-xl hover:bg-yellow-500 transition-all">
            Join Tournaments
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {processedRegs.map((reg) => {
            const matchStart = getTournamentMatchStart(reg.tournamentId);
            const banner = getTournamentBanner(reg.tournamentId);
            const slug = getTournamentSlug(reg.tournamentId);
            const isConfirmed = reg.status === 'CONFIRMED';
            const isWaitlist = reg.status === 'WAITLISTED';
            const isCancelled = reg.status === 'CANCELLED' || reg.status === 'REFUNDED';
            
            return (
              <div 
                key={reg.id}
                className="rounded-2xl border border-border bg-card overflow-hidden hover:border-white/10 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top image layout */}
                  <div className="h-28 w-full relative bg-black/25">
                    <img 
                      src={banner} 
                      alt={reg.tournamentTitle}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
                    
                    {/* Status Badge */}
                    <div className="absolute top-3 right-3">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black tracking-wider uppercase border ${
                        isConfirmed 
                          ? 'bg-green-500/10 text-green-400 border-green-500/20'
                          : isWaitlist 
                            ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                            : 'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}>
                        {reg.status}
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 text-left space-y-0.5">
                      <span className="text-[8px] font-black uppercase text-primary tracking-wider">Reg ID: {reg.id}</span>
                      <h3 className="text-sm font-bold text-white truncate">{reg.tournamentTitle}</h3>
                    </div>
                  </div>

                  {/* Core detail summary */}
                  <div className="p-4 space-y-3 text-xs">
                    <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                      <div className="space-y-0.5">
                        <span className="text-[9px] font-bold text-muted uppercase">Slot No.</span>
                        <span className="font-bold text-foreground block">
                          {reg.slotNumber ? `Slot #${reg.slotNumber}` : 'Waitlist Queue'}
                        </span>
                      </div>
                      <div className="space-y-0.5 text-right">
                        <span className="text-[9px] font-bold text-muted uppercase">Invoice Cost</span>
                        <span className="font-bold text-foreground block">₹{reg.entryFeePaid}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-muted-foreground border-t border-border/40 pt-2.5">
                      <div className="space-y-0.5">
                        <span className="text-[9px] font-bold text-muted uppercase">Participant</span>
                        <span className="font-bold text-foreground block truncate">
                          {reg.teamName ? `Team: ${reg.teamName}` : `Player: ${user?.username}`}
                        </span>
                      </div>
                      <div className="space-y-0.5 text-right">
                        <span className="text-[9px] font-bold text-muted uppercase">Match Date</span>
                        <span className="font-bold text-foreground block">
                          {matchStart ? new Date(matchStart).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions row */}
                <div className="bg-black/10 px-4 py-3 border-t border-border flex justify-between gap-2">
                  <Link
                    href={`/registrations/${reg.id}`}
                    className="flex items-center gap-1 text-[10px] font-black text-muted hover:text-foreground transition-all uppercase"
                  >
                    <span>View Receipt</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>

                  {isConfirmed && (
                    <button
                      onClick={() => handleCancelClick(reg)}
                      className="px-2.5 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[10px] rounded-lg font-bold transition-all"
                    >
                      Cancel Slot
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancellation Dialog modal overlay */}
      {cancellingReg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80" onClick={() => setCancellingReg(null)} />
          <div className="relative rounded-2xl border border-border bg-card p-6 max-w-sm w-full space-y-4">
            <div className="flex justify-between items-start">
              <div className="space-y-0.5">
                <h3 className="text-base font-bold text-foreground">Cancel Registration</h3>
                <span className="text-[10px] text-muted font-bold">ID: {cancellingReg.id}</span>
              </div>
              <button onClick={() => setCancellingReg(null)} className="p-1 rounded hover:bg-white/10 text-muted hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-3 flex gap-2 text-xs text-red-400">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-bold">Important Refund Check</span>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  Cancellations are eligible for simulated refunds back to your demo wallet based on rules setup.
                </p>
              </div>
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
                onClick={() => setCancellingReg(null)}
                className="flex-1 py-2 border border-border bg-transparent text-muted hover:text-foreground hover:bg-white/5 font-bold text-xs rounded-xl"
              >
                Back
              </button>
              <button
                disabled={isSubmittingCancel}
                onClick={handleConfirmCancel}
                className="flex-1 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 font-bold border border-red-500/30 text-xs rounded-xl flex items-center justify-center gap-1.5"
              >
                {isSubmittingCancel ? (
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
