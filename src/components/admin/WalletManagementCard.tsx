'use client';

import React, { useState } from 'react';
import { Wallet } from 'lucide-react';

export const WalletManagementCard: React.FC<{
  playerId: string;
  onCredit: (amount: number, title: string, desc: string) => void;
  onDeduct: (amount: number, title: string, desc: string) => void;
  onReset: () => void;
}> = ({ playerId, onCredit, onDeduct, onReset }) => {
  const [amount, setAmount] = useState('500');
  const [reason, setReason] = useState('Demo Bonus Credit');

  const handleCredit = () => {
    const val = Number(amount);
    if (val > 0) {
      onCredit(val, 'Admin Credit', reason);
      alert(`Credited ₹${val} to ${playerId}`);
    }
  };

  const handleDeduct = () => {
    const val = Number(amount);
    if (val > 0) {
      onDeduct(val, 'Admin Deduction', reason);
      alert(`Deducted ₹${val} from ${playerId}`);
    }
  };

  return (
    <div className="p-4 rounded-xl border border-card-border bg-card-bg/20 flex flex-col gap-3">
      <h4 className="text-xs uppercase font-extrabold text-foreground flex items-center gap-1.5">
        <Wallet className="h-4 w-4 text-secondary" />
        Simulated Wallet Moderation
      </h4>

      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-1">
          <label className="text-[9px] uppercase font-bold text-muted">Amount (₹)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="p-2 bg-card-bg/60 border border-card-border rounded-lg text-xs"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[9px] uppercase font-bold text-muted">Reason Title</label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="p-2 bg-card-bg/60 border border-card-border rounded-lg text-xs"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleCredit}
          className="px-3 py-1.5 bg-success/15 hover:bg-success/25 border border-success/30 text-success text-xs font-extrabold rounded-lg transition-colors"
        >
          + Add Credit
        </button>
        <button
          onClick={handleDeduct}
          className="px-3 py-1.5 bg-warning/15 hover:bg-warning/25 border border-warning/30 text-warning text-xs font-extrabold rounded-lg transition-colors"
        >
          - Deduct Balance
        </button>
        <button
          onClick={onReset}
          className="px-3 py-1.5 bg-danger/15 hover:bg-danger/25 border border-danger/30 text-danger text-xs font-extrabold rounded-lg transition-colors"
        >
          Reset Wallet
        </button>
      </div>
    </div>
  );
};

export default WalletManagementCard;
