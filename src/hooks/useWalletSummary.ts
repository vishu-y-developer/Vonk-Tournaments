'use client';

import { useWallet } from '@/providers/WalletProvider';

export function useWalletSummary() {
  const { walletSummary, loading, error } = useWallet();
  return {
    walletSummary,
    loading,
    error,
  };
}
