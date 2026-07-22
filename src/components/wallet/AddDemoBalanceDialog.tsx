'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '@/providers/WalletProvider';
import { WalletTransaction } from '@/types';
import { IndianRupee, AlertTriangle, CheckCircle2, X } from 'lucide-react';

interface AddDemoBalanceDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddDemoBalanceDialog: React.FC<AddDemoBalanceDialogProps> = ({ isOpen, onClose }) => {
  const { balance, addDemoBalance } = useWallet();
  
  const [selectedPreset, setSelectedPreset] = useState<number | null>(100);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successTx, setSuccessTx] = useState<WalletTransaction | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);

  const presets = [50, 100, 250, 500, 1000, 2500];

  const handlePresetSelect = (amount: number) => {
    setSelectedPreset(amount);
    setCustomAmount('');
    setErrorText(null);
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedPreset(null);
    const value = e.target.value;
    
    // Only accept whole numbers
    if (value === '' || /^\d+$/.test(value)) {
      setCustomAmount(value);
      setErrorText(null);
    }
  };

  const getTargetAmount = (): number => {
    if (selectedPreset !== null) return selectedPreset;
    return customAmount ? parseInt(customAmount, 10) : 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText(null);

    const amount = getTargetAmount();

    // Validation
    if (amount <= 0) {
      setErrorText('Please select or enter an amount greater than zero.');
      return;
    }
    if (amount < 10) {
      setErrorText('Minimum deposit amount is ₹10.');
      return;
    }
    if (amount > 10000) {
      setErrorText('Maximum deposit amount is ₹10,000 per transaction.');
      return;
    }

    setIsSubmitting(true);

    // Simulate submission delay
    setTimeout(() => {
      const res = addDemoBalance(amount, 'Simulated Balance Addition via Preset/Custom Load');
      setIsSubmitting(false);

      if (res.success) {
        setSuccessTx(res.transaction || null);
      } else {
        setErrorText(res.error || 'Failed to credit balance.');
      }
    }, 1000);
  };

  const handleReset = () => {
    setSelectedPreset(100);
    setCustomAmount('');
    setSuccessTx(null);
    setErrorText(null);
    setIsSubmitting(false);
    onClose();
  };

  if (!isOpen) return null;

  const targetAmount = getTargetAmount();
  const balanceAfter = balance + targetAmount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={successTx ? handleReset : onClose}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-md overflow-hidden rounded-xl border border-border bg-card/95 text-card-foreground shadow-2xl backdrop-blur-md"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/80 px-5 py-4">
          <h3 className="text-sm font-black tracking-wider text-foreground">
            {successTx ? 'DEPOSIT COMPLETED' : 'ADD DEMO BALANCE'}
          </h3>
          <button 
            onClick={successTx ? handleReset : onClose}
            className="rounded-lg p-1 hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {!successTx ? (
              <motion.form 
                key="form"
                onSubmit={handleSubmit}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-5"
              >
                {/* Notice */}
                <div className="flex gap-3 rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-3 text-xs text-yellow-500">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <p className="leading-relaxed">
                    This deposit is completely simulated. No real credit card, bank transaction, or UPI payment will be processed.
                  </p>
                </div>

                {/* Current Balance Row */}
                <div className="flex items-center justify-between rounded-lg bg-white/5 p-3 text-xs">
                  <span className="text-muted">Current Balance</span>
                  <span className="font-bold text-foreground">₹{balance}</span>
                </div>

                {/* Presets */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black tracking-wider text-muted uppercase">Select Preset Amount</label>
                  <div className="grid grid-cols-3 gap-2">
                    {presets.map((amount) => (
                      <button
                        key={amount}
                        type="button"
                        onClick={() => handlePresetSelect(amount)}
                        className={`rounded-lg py-2.5 text-xs font-bold transition-all border ${
                          selectedPreset === amount
                            ? 'bg-primary/20 border-primary text-primary'
                            : 'bg-white/5 border-transparent text-muted-foreground hover:bg-white/10 hover:text-foreground'
                        }`}
                      >
                        ₹{amount}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Amount */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black tracking-wider text-muted uppercase">Or Custom Amount (₹)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-xs">₹</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={customAmount}
                      onChange={handleCustomAmountChange}
                      placeholder="Enter amount (e.g. 500)"
                      className="w-full rounded-lg border border-border bg-white/5 py-2.5 pl-7 pr-3 text-xs outline-none focus:border-primary/50 transition-colors"
                    />
                  </div>
                </div>

                {/* Pre-Confirmation Details */}
                {targetAmount >= 10 && (
                  <div className="rounded-lg border border-border/60 bg-white/5 p-4 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted">Load Amount</span>
                      <span className="font-semibold text-foreground">₹{targetAmount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Transaction Type</span>
                      <span className="text-primary font-bold">Simulated Load</span>
                    </div>
                    <div className="border-t border-border/40 my-2 pt-2 flex justify-between font-bold">
                      <span className="text-muted">Balance after Load</span>
                      <span className="text-green-400">₹{balanceAfter}</span>
                    </div>
                  </div>
                )}

                {/* Error Banner */}
                {errorText && (
                  <div className="text-[11px] text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg p-2.5 flex items-center gap-2">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    <span>{errorText}</span>
                  </div>
                )}

                {/* Action button */}
                <button
                  type="submit"
                  disabled={isSubmitting || targetAmount < 10}
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary py-3 text-xs font-black tracking-wider text-primary-foreground hover:bg-primary/95 disabled:opacity-50 transition-all uppercase"
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                      <span>Processing Sim Check...</span>
                    </>
                  ) : (
                    <span>Add Demo Balance</span>
                  )}
                </button>
              </motion.form>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-center py-6 space-y-5"
              >
                <div className="flex justify-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    className="rounded-full bg-green-500/10 p-3 border border-green-500/20 text-green-400"
                  >
                    <CheckCircle2 className="h-10 w-10" />
                  </motion.div>
                </div>

                <div className="space-y-1">
                  <h4 className="text-sm font-black text-foreground">DEMO FUNDS CREDITED</h4>
                  <p className="text-xs text-muted">₹{successTx.amount} added to your demo wallet.</p>
                </div>

                <div className="max-w-xs mx-auto rounded-lg border border-border/80 bg-white/5 p-4 text-[11px] text-left space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted">Ref ID</span>
                    <span className="font-mono text-foreground">{successTx.referenceId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">New Balance</span>
                    <span className="font-bold text-green-400">₹{successTx.balanceAfter}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Status</span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-green-500/20 text-green-400 tracking-wider">
                      {successTx.status}
                    </span>
                  </div>
                </div>

                <p className="text-[10px] text-muted max-w-xs mx-auto">
                  No actual money was moved. You can test checking your profile and wallet balance tabs.
                </p>

                <button
                  type="button"
                  onClick={handleReset}
                  className="rounded-lg border border-border hover:bg-white/10 px-5 py-2 text-xs font-bold text-foreground transition-all"
                >
                  Dismiss
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
