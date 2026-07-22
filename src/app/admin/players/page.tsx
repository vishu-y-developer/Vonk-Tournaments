'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useMemo } from 'react';
import { useAdmin } from '@/providers/AdminProvider';
import AdminShell from '@/components/admin/AdminShell';
import UserStatusBadge from '@/components/admin/UserStatusBadge';
import WalletManagementCard from '@/components/admin/WalletManagementCard';
import ModerationDialog from '@/components/admin/ModerationDialog';
import { Users, Search, Filter, ShieldAlert, RotateCcw, Wallet, Eye } from 'lucide-react';
import Image from 'next/image';

export default function AdminPlayersPage() {
  const { players, suspendPlayer, unsuspendPlayer, resetPlayerWallet, resetPlayerStats, addDemoCredit, deductDemoBalance } = useAdmin();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedPlayer, setSelectedPlayer] = useState<any | null>(null);
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [targetPlayerId, setTargetPlayerId] = useState<string | null>(null);

  const filteredPlayers = useMemo(() => {
    return players.filter((p) => {
      const matchSearch =
        p.username.toLowerCase().includes(search.toLowerCase()) ||
        p.inGameName.toLowerCase().includes(search.toLowerCase()) ||
        p.characterId.includes(search);
      const matchStatus = statusFilter === 'ALL' || p.onlineStatus.toUpperCase() === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [players, search, statusFilter]);

  const handleSuspendConfirm = (reason: string) => {
    if (targetPlayerId) {
      suspendPlayer(targetPlayerId, reason);
      alert(`Player ${targetPlayerId} suspended.`);
    }
  };

  return (
    <AdminShell>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-foreground uppercase tracking-tight flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            Player Accounts Management
          </h1>
          <p className="text-xs text-muted">
            Audit contestant profiles, inspect BGMI game IDs, moderate account statuses, and reset demo balances.
          </p>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row gap-3 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
            <input
              type="text"
              placeholder="Search by username, IGN, or BGMI ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-card-bg/40 border border-card-border rounded-xl text-xs text-foreground focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-3.5 w-3.5 text-muted hidden sm:inline" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-card-bg/50 border border-card-border rounded-xl px-3 py-2 text-xs font-semibold text-foreground focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="ONLINE">Online</option>
              <option value="OFFLINE">Offline / Suspended</option>
            </select>
          </div>
        </div>

        {/* Players List Table */}
        <div className="overflow-x-auto border border-card-border rounded-xl bg-card-bg/15">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-card-border bg-card-bg/30 text-[9px] uppercase font-black text-muted tracking-wider">
                <th className="p-3">Player / IGN</th>
                <th className="p-3">BGMI ID</th>
                <th className="p-3">Status</th>
                <th className="p-3">Matches / Wins</th>
                <th className="p-3">Demo Wallet</th>
                <th className="p-3 text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPlayers.map((p) => (
                <tr key={p.id} className="border-b border-card-border hover:bg-card-bg/20 transition-colors">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-card-bg border border-card-border overflow-hidden relative shrink-0">
                        {p.avatarUrl ? (
                          <Image src={p.avatarUrl} alt={p.username} fill className="object-cover" />
                        ) : (
                          <Users className="w-4 h-4 text-muted m-auto" />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-extrabold text-foreground">{p.username}</span>
                        <span className="text-[10px] text-muted">IGN: {p.inGameName}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 font-mono text-[11px] text-foreground">{p.characterId}</td>
                  <td className="p-3">
                    <UserStatusBadge status={p.onlineStatus} />
                  </td>
                  <td className="p-3 font-mono">
                    {p.stats.matchesPlayed} M / {p.stats.wins} W
                  </td>
                  <td className="p-3 font-mono font-bold text-gradient-prize">
                    ₹{p.walletBalance}
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex gap-1.5 justify-end">
                      <button
                        onClick={() => setSelectedPlayer(p)}
                        className="p-1.5 rounded-lg border border-card-border bg-card-bg text-muted hover:text-foreground"
                        title="Inspect & Wallet Moderation"
                      >
                        <Wallet className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => resetPlayerStats(p.id)}
                        className="p-1.5 rounded-lg border border-card-border bg-card-bg text-muted hover:text-foreground"
                        title="Reset Stats"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                      </button>
                      {p.onlineStatus === 'Offline' ? (
                        <button
                          onClick={() => unsuspendPlayer(p.id)}
                          className="px-2.5 py-1 bg-success/15 hover:bg-success/25 border border-success/30 text-success text-[10px] font-extrabold rounded-lg"
                        >
                          Unsuspend
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setTargetPlayerId(p.id);
                            setSuspendDialogOpen(true);
                          }}
                          className="px-2.5 py-1 bg-danger/15 hover:bg-danger/25 border border-danger/30 text-danger text-[10px] font-extrabold rounded-lg"
                        >
                          Suspend
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Selected Player Wallet Management Modal / Inline Card */}
        {selectedPlayer && (
          <div className="p-4 rounded-xl border border-primary/30 bg-primary/5 flex flex-col gap-3">
            <div className="flex justify-between items-center border-b border-card-border pb-2">
              <span className="text-xs font-black uppercase text-foreground">
                Wallet Adjustment: {selectedPlayer.username} (₹{selectedPlayer.walletBalance})
              </span>
              <button onClick={() => setSelectedPlayer(null)} className="text-xs text-muted">Close</button>
            </div>
            <WalletManagementCard
              playerId={selectedPlayer.id}
              onCredit={(amt, title, desc) => addDemoCredit(selectedPlayer.id, amt, title, desc)}
              onDeduct={(amt, title, desc) => deductDemoBalance(selectedPlayer.id, amt, title, desc)}
              onReset={() => resetPlayerWallet(selectedPlayer.id)}
            />
          </div>
        )}

        {/* Moderation Dialog */}
        <ModerationDialog
          isOpen={suspendDialogOpen}
          title="Suspend Player Account"
          actionName="Suspend Player"
          onConfirm={handleSuspendConfirm}
          onClose={() => setSuspendDialogOpen(false)}
        />
      </div>
    </AdminShell>
  );
}
