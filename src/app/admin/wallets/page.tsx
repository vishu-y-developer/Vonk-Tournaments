'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { useAdmin } from '@/providers/AdminProvider';
import AdminShell from '@/components/admin/AdminShell';
import WalletManagementCard from '@/components/admin/WalletManagementCard';
import { Wallet, ShieldAlert } from 'lucide-react';

export default function AdminWalletsPage() {
  const { players, addDemoCredit, deductDemoBalance, resetPlayerWallet } = useAdmin();
  const [selectedPlayerId, setSelectedPlayerId] = useState(players[0]?.id || 'player-user');

  return (
    <AdminShell>
      <div className="flex flex-col gap-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-foreground uppercase tracking-tight flex items-center gap-2">
            <Wallet className="h-6 w-6 text-gradient-prize" />
            Platform Wallets & Demo Ledgers
          </h1>
          <p className="text-xs text-muted">
            Audit player simulated balances, deposit bonus credits, deduct demo balances, and review transaction ledgers.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-bold text-muted uppercase">Select Player Account</label>
          <select
            value={selectedPlayerId}
            onChange={(e) => setSelectedPlayerId(e.target.value)}
            className="p-3 bg-card-bg/60 border border-card-border rounded-xl text-xs text-foreground focus:outline-none"
          >
            {players.map((p) => (
              <option key={p.id} value={p.id}>
                {p.username} ({p.inGameName}) — Current Balance: ₹{p.walletBalance}
              </option>
            ))}
          </select>
        </div>

        <WalletManagementCard
          playerId={selectedPlayerId}
          onCredit={(amt, title, desc) => addDemoCredit(selectedPlayerId, amt, title, desc)}
          onDeduct={(amt, title, desc) => deductDemoBalance(selectedPlayerId, amt, title, desc)}
          onReset={() => resetPlayerWallet(selectedPlayerId)}
        />
      </div>
    </AdminShell>
  );
}
