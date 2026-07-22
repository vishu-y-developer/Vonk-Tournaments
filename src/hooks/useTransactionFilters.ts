'use client';

import { useState } from 'react';
import { WalletFilter } from '@/types';

export function useTransactionFilters() {
  const [filters, setFilters] = useState<WalletFilter>({
    type: 'ALL',
    direction: 'ALL',
    status: 'ALL',
    dateRange: 'ALL_TIME',
    amountRange: 'ALL',
    searchQuery: '',
    sortBy: 'NEWEST',
  });

  const updateFilter = <K extends keyof WalletFilter>(key: K, value: WalletFilter[K]) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      type: 'ALL',
      direction: 'ALL',
      status: 'ALL',
      dateRange: 'ALL_TIME',
      amountRange: 'ALL',
      searchQuery: '',
      sortBy: 'NEWEST',
    });
  };

  return {
    filters,
    updateFilter,
    clearFilters,
  };
}
