'use client';

import { useWallet } from '@/providers/WalletProvider';
import { BalanceValidationResult } from '@/types';

export function useBalanceValidation() {
  const { validateSufficientBalance } = useWallet();

  const validate = (amount: number): BalanceValidationResult => {
    return validateSufficientBalance(amount);
  };

  return {
    validate,
  };
}
