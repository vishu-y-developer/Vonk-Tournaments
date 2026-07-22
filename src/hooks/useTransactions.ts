'use client';

import { useWallet } from '@/providers/WalletProvider';

export function useTransactions() {
  const { transactions, loading, error, getTransaction, filterTransactions } = useWallet();
  return {
    transactions,
    loading,
    error,
    getTransaction,
    filterTransactions,
  };
}
