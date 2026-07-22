'use client';

import React from 'react';
import { useWallet } from '@/providers/WalletProvider';
import { WalletTransaction } from '@/types';
import { Terminal, RefreshCw, Plus, AlertOctagon, HelpCircle } from 'lucide-react';

export const DemoWalletControls: React.FC = () => {
  const { 
    creditPrize, 
    issueRefund, 
    addAdjustment, 
    claimBonus, 
    resetWallet, 
    seedWalletData 
  } = useWallet();

  const handleAddPrize = () => {
    creditPrize(
      500,
      'Prize Winnings Credited',
      'Winner Placement Reward (Simulated)',
      'Winner Prize',
      'tour-mock-1',
      'BGMI Ultimate Cup 2026'
    );
  };

  const handleAddRefund = () => {
    issueRefund(
      150,
      'Simulated Entry Fee Refund',
      'Tournament Cancelled: BGMI Elite Scrims',
      'Tournament Cancelled',
      'tour-mock-2',
      'BGMI Elite Scrims'
    );
  };

  const handleAddBonus = () => {
    const randomCode = 'BONUS' + Math.floor(100 + Math.random() * 900);
    claimBonus(
      `bonus-dev-${Date.now()}`,
      'Developer Promos Credited',
      100,
      randomCode
    );
  };

  const handleTriggerFailedTx = () => {
    // We add an adjustment with FAILED state to test list rendering
    addAdjustment(
      200,
      'DEBIT',
      'Registration Failed (Simulated)',
      'Payment authorization timed out'
    );
    // Let's manually set the last transaction status to FAILED in localTransactionRepository
    setTimeout(() => {
      const list = [...localTransactionRepository.getAll()];
      if (list.length > 0) {
        list[0].status = 'FAILED';
        localTransactionRepository.saveAll(list);
        window.location.reload();
      }
    }, 100);
  };

  const handleTriggerPendingTx = () => {
    addAdjustment(
      150,
      'CREDIT',
      'Simulated Deposit Processing',
      'Awaiting mock banking gateway handshake'
    );
    setTimeout(() => {
      const list = [...localTransactionRepository.getAll()];
      if (list.length > 0) {
        list[0].status = 'PENDING';
        localTransactionRepository.saveAll(list);
        window.location.reload();
      }
    }, 100);
  };

  // Inline reference to repository to easily tweak status fields
  const localTransactionRepository = {
    getAll(): WalletTransaction[] {
      if (typeof window === 'undefined') return [];
      const data = localStorage.getItem('vonk:v1:transactions');
      return data ? JSON.parse(data) : [];
    },
    saveAll(list: WalletTransaction[]) {
      if (typeof window === 'undefined') return;
      localStorage.setItem('vonk:v1:transactions', JSON.stringify(list));
    }
  };

  return (
    <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5 space-y-4">
      <div className="flex items-center gap-2 border-b border-amber-500/20 pb-3">
        <Terminal className="h-4 w-4 text-amber-500" />
        <h4 className="text-xs font-black tracking-wider text-amber-500 uppercase">Demo Developer Controls</h4>
      </div>

      <p className="text-[10px] text-muted-foreground leading-relaxed">
        Use these triggers to inject custom transaction profiles or test layouts (empty states, pending balances, failure badges, refunds, prizes list).
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        <button
          onClick={handleAddPrize}
          className="flex items-center justify-center gap-1.5 rounded bg-amber-500/10 border border-amber-500/20 py-2 px-2 text-[10px] font-bold text-amber-400 hover:bg-amber-500/20 transition-all text-left"
        >
          <Plus className="h-3 w-3" />
          <span>Add Demo Prize</span>
        </button>

        <button
          onClick={handleAddRefund}
          className="flex items-center justify-center gap-1.5 rounded bg-amber-500/10 border border-amber-500/20 py-2 px-2 text-[10px] font-bold text-amber-400 hover:bg-amber-500/20 transition-all text-left"
        >
          <Plus className="h-3 w-3" />
          <span>Add Demo Refund</span>
        </button>

        <button
          onClick={handleAddBonus}
          className="flex items-center justify-center gap-1.5 rounded bg-amber-500/10 border border-amber-500/20 py-2 px-2 text-[10px] font-bold text-amber-400 hover:bg-amber-500/20 transition-all text-left"
        >
          <Plus className="h-3 w-3" />
          <span>Add Demo Bonus</span>
        </button>

        <button
          onClick={handleTriggerFailedTx}
          className="flex items-center justify-center gap-1.5 rounded bg-red-500/10 border border-red-500/20 py-2 px-2 text-[10px] font-bold text-red-400 hover:bg-red-500/20 transition-all text-left"
        >
          <AlertOctagon className="h-3 w-3" />
          <span>Trigger Failed Tx</span>
        </button>

        <button
          onClick={handleTriggerPendingTx}
          className="flex items-center justify-center gap-1.5 rounded bg-yellow-500/10 border border-yellow-500/20 py-2 px-2 text-[10px] font-bold text-yellow-400 hover:bg-yellow-500/20 transition-all text-left"
        >
          <HelpCircle className="h-3 w-3" />
          <span>Trigger Pending Tx</span>
        </button>

        <button
          onClick={seedWalletData}
          className="flex items-center justify-center gap-1.5 rounded bg-blue-500/10 border border-blue-500/20 py-2 px-2 text-[10px] font-bold text-blue-400 hover:bg-blue-500/20 transition-all text-left"
        >
          <RefreshCw className="h-3 w-3" />
          <span>Seed Default Data</span>
        </button>
      </div>

      <div className="pt-2">
        <button
          onClick={resetWallet}
          className="w-full flex items-center justify-center gap-1.5 rounded border border-red-500/30 bg-red-950/20 py-2 text-[10px] font-bold text-red-400 hover:bg-red-950/40 transition-all uppercase tracking-wider"
        >
          Reset Demo Wallet
        </button>
      </div>
    </div>
  );
};
