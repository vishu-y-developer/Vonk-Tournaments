'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Wallet,
  WalletTransaction,
  WalletSummary,
  WalletFilter,
  PrizeCategory,
  RefundReason,
  WalletTransactionDirection,
  BalanceValidationResult
} from '@/types';
import { walletService } from '@/lib/services/wallet-service';
import { localTransactionRepository } from '@/repositories/local/local-transaction-repository';
import { useAuth } from './AuthProvider';

interface WalletContextType {
  wallet: Wallet | null;
  balance: number;
  transactions: WalletTransaction[];
  walletSummary: WalletSummary | null;
  loading: boolean;
  error: string | null;
  addDemoBalance: (amount: number, description?: string) => { success: boolean; transaction?: WalletTransaction; error?: string };
  debitEntryFee: (amount: number, title: string, description: string, tournamentId?: string, tournamentName?: string) => { success: boolean; transaction?: WalletTransaction; error?: string };
  creditPrize: (amount: number, title: string, description: string, category: PrizeCategory, tournamentId?: string, tournamentName?: string) => { success: boolean; transaction?: WalletTransaction; error?: string };
  issueRefund: (amount: number, title: string, description: string, reason: RefundReason, tournamentId?: string, tournamentName?: string) => { success: boolean; transaction?: WalletTransaction; error?: string };
  claimBonus: (bonusId: string, name: string, amount: number, code: string) => { success: boolean; transaction?: WalletTransaction; error?: string };
  addAdjustment: (amount: number, direction: WalletTransactionDirection, title: string, description: string) => { success: boolean; transaction?: WalletTransaction; error?: string };
  getTransaction: (id: string) => WalletTransaction | null;
  filterTransactions: (filters: WalletFilter) => WalletTransaction[];
  validateSufficientBalance: (amount: number) => BalanceValidationResult;
  resetWallet: () => void;
  seedWalletData: () => void;
  refreshWallet: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [walletSummary, setWalletSummary] = useState<WalletSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isLoaded } = useAuth();

  const refreshWallet = useCallback(() => {
    if (!user) {
      setWallet(null);
      setBalance(0);
      setTransactions([]);
      setWalletSummary(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const w = walletService.getOrCreateWallet(user.id);
      const txs = localTransactionRepository.getByPlayerId(user.id);
      const summary = walletService.calculateWalletSummary(user.id);

      setWallet(w);
      setBalance(w.balance);
      setTransactions(txs);
      setWalletSummary(summary);
      setError(null);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to retrieve wallet data.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (isLoaded) {
      const timer = setTimeout(() => {
        refreshWallet();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isLoaded, refreshWallet]);

  const addDemoBalance = (amount: number, description?: string) => {
    if (!user) return { success: false, error: 'User profile not loaded.' };
    const res = walletService.addDemoBalance(user.id, amount, description);
    if (res.success) refreshWallet();
    return res;
  };

  const debitEntryFee = (
    amount: number,
    title: string,
    description: string,
    tournamentId?: string,
    tournamentName?: string
  ) => {
    if (!user) return { success: false, error: 'User profile not loaded.' };
    const res = walletService.debitEntryFee(user.id, amount, title, description, tournamentId, tournamentName);
    if (res.success) refreshWallet();
    return res;
  };

  const creditPrize = (
    amount: number,
    title: string,
    description: string,
    category: PrizeCategory,
    tournamentId?: string,
    tournamentName?: string
  ) => {
    if (!user) return { success: false, error: 'User profile not loaded.' };
    const res = walletService.creditPrize(user.id, amount, title, description, category, tournamentId, tournamentName);
    if (res.success) refreshWallet();
    return res;
  };

  const issueRefund = (
    amount: number,
    title: string,
    description: string,
    reason: RefundReason,
    tournamentId?: string,
    tournamentName?: string
  ) => {
    if (!user) return { success: false, error: 'User profile not loaded.' };
    const res = walletService.issueRefund(user.id, amount, title, description, reason, tournamentId, tournamentName);
    if (res.success) refreshWallet();
    return res;
  };

  const claimBonus = (bonusId: string, name: string, amount: number, code: string) => {
    if (!user) return { success: false, error: 'User profile not loaded.' };
    const res = walletService.claimBonus(user.id, bonusId, name, amount, code);
    if (res.success) refreshWallet();
    return res;
  };

  const addAdjustment = (amount: number, direction: WalletTransactionDirection, title: string, description: string) => {
    if (!user) return { success: false, error: 'User profile not loaded.' };
    const res = walletService.addAdjustment(user.id, amount, direction, title, description);
    if (res.success) refreshWallet();
    return res;
  };

  const getTransaction = (id: string) => {
    return localTransactionRepository.getById(id);
  };

  const filterTransactions = (filters: WalletFilter) => {
    return walletService.filterTransactions(transactions, filters);
  };

  const validateSufficientBalance = (amount: number) => {
    if (!user) return { sufficient: false, shortage: amount, message: 'User not loaded.' };
    return walletService.validateSufficientBalance(user.id, amount);
  };

  const resetWallet = () => {
    if (!user) return;
    walletService.resetWallet(user.id);
    refreshWallet();
  };

  const seedWalletData = () => {
    if (!user) return;
    walletService.seedWalletData(user.id);
    refreshWallet();
  };

  return (
    <WalletContext.Provider
      value={{
        wallet,
        balance,
        transactions,
        walletSummary,
        loading,
        error,
        addDemoBalance,
        debitEntryFee,
        creditPrize,
        issueRefund,
        claimBonus,
        addAdjustment,
        getTransaction,
        filterTransactions,
        validateSufficientBalance,
        resetWallet,
        seedWalletData,
        refreshWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
