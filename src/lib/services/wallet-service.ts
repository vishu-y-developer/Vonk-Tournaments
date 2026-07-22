import {
  Player,
  Wallet,
  WalletTransaction,
  WalletTransactionType,
  WalletTransactionDirection,
  WalletTransactionStatus,
  WalletSummary,
  WalletFilter,
  DemoBonus,
  BonusStatus,
  PrizeCredit,
  PrizeCategory,
  RefundTransaction,
  RefundReason,
  BalanceValidationResult
} from '@/types';
import { localWalletRepository } from '@/repositories/local/local-wallet-repository';
import { localTransactionRepository } from '@/repositories/local/local-transaction-repository';
import { browserStorage } from '@/lib/storage/browser-storage';
import { STORAGE_KEYS } from '@/constants';

export class WalletService {
  private getActivePlayerId(playerId?: string): string {
    if (playerId) return playerId;
    if (typeof window === 'undefined') return 'user-player-1';
    const player = browserStorage.getItem<Player | null>(STORAGE_KEYS.USER, null);
    return player ? player.id : 'user-player-1';
  }

  // --- WALLET INITIALIZATION ---
  getOrCreateWallet(playerId?: string): Wallet {
    const activeId = this.getActivePlayerId(playerId);
    let wallet = localWalletRepository.getWallet(activeId);
    if (!wallet) {
      wallet = {
        playerId: activeId,
        balance: 0,
        totalAdded: 0,
        totalFeesPaid: 0,
        totalPrizesWon: 0,
        totalRefunds: 0,
        totalBonuses: 0,
        updatedAt: new Date().toISOString(),
      };
      localWalletRepository.saveWallet(wallet);
    }
    return wallet;
  }

  getBalance(playerId?: string): number {
    const wallet = this.getOrCreateWallet(playerId);
    return wallet.balance;
  }

  // --- ACTIONS ---

  addDemoBalance(playerId?: string, amount?: number, description = 'Simulated Balance Addition'): { success: boolean; transaction?: WalletTransaction; error?: string } {
    const activeId = this.getActivePlayerId(playerId);
    const amt = amount || 0;
    if (amt <= 0) return { success: false, error: 'Amount must be greater than zero.' };
    if (amt > 10000) return { success: false, error: 'Maximum single demo addition limit is ₹10,000.' };

    const wallet = this.getOrCreateWallet(activeId);
    const balanceBefore = wallet.balance;
    const balanceAfter = balanceBefore + amt;

    wallet.balance = balanceAfter;
    wallet.totalAdded += amt;
    wallet.updatedAt = new Date().toISOString();

    const transaction = this.createTransactionRecord({
      playerId: activeId,
      type: 'DEMO_CREDIT',
      direction: 'CREDIT',
      amount: amt,
      title: 'Demo Balance Added',
      description,
      status: 'SUCCESS',
      balanceBefore,
      balanceAfter,
    });

    localWalletRepository.saveWallet(wallet);
    localTransactionRepository.save(transaction);

    return { success: true, transaction };
  }

  debitEntryFee(
    playerId?: string,
    amount?: number,
    title = 'Entry Fee Deduction',
    description = 'Registered for tournament',
    tournamentId?: string,
    tournamentName?: string
  ): { success: boolean; transaction?: WalletTransaction; error?: string } {
    const activeId = this.getActivePlayerId(playerId);
    const amt = amount || 0;
    const wallet = this.getOrCreateWallet(activeId);
    if (wallet.balance < amt) {
      return { success: false, error: 'Insufficient demo balance.' };
    }

    const balanceBefore = wallet.balance;
    const balanceAfter = balanceBefore - amt;

    wallet.balance = balanceAfter;
    wallet.totalFeesPaid += amt;
    wallet.updatedAt = new Date().toISOString();

    const transaction = this.createTransactionRecord({
      playerId: activeId,
      type: 'ENTRY_FEE',
      direction: 'DEBIT',
      amount: amt,
      title,
      description,
      status: 'SUCCESS',
      balanceBefore,
      balanceAfter,
      tournamentId,
      tournamentName,
    });

    localWalletRepository.saveWallet(wallet);
    localTransactionRepository.save(transaction);

    return { success: true, transaction };
  }

  creditPrize(
    playerId?: string,
    amount?: number,
    title = 'Prize Winnings Credited',
    description = 'Match reward',
    category: PrizeCategory = 'Winner Prize',
    tournamentId?: string,
    tournamentName?: string
  ): { success: boolean; transaction?: WalletTransaction; error?: string } {
    const activeId = this.getActivePlayerId(playerId);
    const amt = amount || 0;
    const wallet = this.getOrCreateWallet(activeId);
    const balanceBefore = wallet.balance;
    const balanceAfter = balanceBefore + amt;

    wallet.balance = balanceAfter;
    wallet.totalPrizesWon += amt;
    wallet.updatedAt = new Date().toISOString();

    const transaction = this.createTransactionRecord({
      playerId: activeId,
      type: 'PRIZE_WINNING',
      direction: 'CREDIT',
      amount: amt,
      title,
      description,
      status: 'SUCCESS',
      balanceBefore,
      balanceAfter,
      tournamentId,
      tournamentName,
      metadata: { category }
    });

    localWalletRepository.saveWallet(wallet);
    localTransactionRepository.save(transaction);

    return { success: true, transaction };
  }

  issueRefund(
    playerId?: string,
    amount?: number,
    title = 'Simulated Entry Fee Refund',
    description = 'Refund processed',
    reason: RefundReason = 'Tournament Cancelled',
    tournamentId?: string,
    tournamentName?: string
  ): { success: boolean; transaction?: WalletTransaction; error?: string } {
    const activeId = this.getActivePlayerId(playerId);
    const amt = amount || 0;
    const wallet = this.getOrCreateWallet(activeId);
    const balanceBefore = wallet.balance;
    const balanceAfter = balanceBefore + amt;

    wallet.balance = balanceAfter;
    wallet.totalRefunds += amt;
    wallet.updatedAt = new Date().toISOString();

    const transaction = this.createTransactionRecord({
      playerId: activeId,
      type: 'REFUND',
      direction: 'CREDIT',
      amount: amt,
      title,
      description,
      status: 'SUCCESS',
      balanceBefore,
      balanceAfter,
      tournamentId,
      tournamentName,
      metadata: { reason }
    });

    localWalletRepository.saveWallet(wallet);
    localTransactionRepository.save(transaction);

    return { success: true, transaction };
  }

  claimBonus(playerId?: string, bonusId?: string, name = 'Promo Bonus', amount?: number, code = 'PROMO'): { success: boolean; transaction?: WalletTransaction; error?: string } {
    const activeId = this.getActivePlayerId(playerId);
    const bId = bonusId || `bonus-${Date.now()}`;
    const amt = amount || 0;

    const claimedKeys = browserStorage.getItem<string[]>('vonk:v1:wallet-bonuses', []);
    if (claimedKeys.includes(bId)) {
      return { success: false, error: 'This promo bonus has already been claimed.' };
    }

    const wallet = this.getOrCreateWallet(activeId);
    const balanceBefore = wallet.balance;
    const balanceAfter = balanceBefore + amt;

    wallet.balance = balanceAfter;
    wallet.totalBonuses += amt;
    wallet.updatedAt = new Date().toISOString();

    const transaction = this.createTransactionRecord({
      playerId: activeId,
      type: 'BONUS',
      direction: 'CREDIT',
      amount: amt,
      title: `Bonus Claimed: ${name}`,
      description: `Promo Code: ${code}`,
      status: 'SUCCESS',
      balanceBefore,
      balanceAfter,
    });

    localWalletRepository.saveWallet(wallet);
    localTransactionRepository.save(transaction);

    claimedKeys.push(bId);
    browserStorage.setItem('vonk:v1:wallet-bonuses', claimedKeys);

    return { success: true, transaction };
  }

  addAdjustment(playerId?: string, amount?: number, direction: WalletTransactionDirection = 'CREDIT', title = 'Adjustment Credited', description = 'Wallet reconciliation'): { success: boolean; transaction?: WalletTransaction; error?: string } {
    const activeId = this.getActivePlayerId(playerId);
    const amt = amount || 0;
    const wallet = this.getOrCreateWallet(activeId);
    const balanceBefore = wallet.balance;
    
    let balanceAfter = balanceBefore;
    if (direction === 'CREDIT') {
      balanceAfter += amt;
    } else {
      if (balanceBefore < amt) {
        return { success: false, error: 'Insufficient balance to adjust debit.' };
      }
      balanceAfter -= amt;
    }

    wallet.balance = balanceAfter;
    wallet.updatedAt = new Date().toISOString();

    const transaction = this.createTransactionRecord({
      playerId: activeId,
      type: 'ADJUSTMENT',
      direction,
      amount: amt,
      title,
      description,
      status: 'SUCCESS',
      balanceBefore,
      balanceAfter,
    });

    localWalletRepository.saveWallet(wallet);
    localTransactionRepository.save(transaction);

    return { success: true, transaction };
  }

  // --- VALIDATION UTIL ---
  validateSufficientBalance(playerId?: string, amount = 0): BalanceValidationResult {
    const activeId = this.getActivePlayerId(playerId);
    const balance = this.getBalance(activeId);
    if (balance >= amount) {
      return {
        sufficient: true,
        shortage: 0,
        message: 'Sufficient balance available.',
      };
    }
    const shortage = amount - balance;
    return {
      sufficient: false,
      shortage,
      message: `You need ₹${shortage} more in your demo wallet to complete this simulated registration.`,
    };
  }

  // --- ANALYTICS & SUMMARY ---
  calculateWalletSummary(playerId?: string): WalletSummary {
    const activeId = this.getActivePlayerId(playerId);
    const txList = localTransactionRepository.getByPlayerId(activeId);
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    let creditsThisMonth = 0;
    let debitsThisMonth = 0;

    const typeCounts: Record<WalletTransactionType, number> = {
      DEMO_CREDIT: 0,
      ENTRY_FEE: 0,
      PRIZE_WINNING: 0,
      REFUND: 0,
      BONUS: 0,
      PROMOTIONAL_CREDIT: 0,
      PENALTY: 0,
      ADJUSTMENT: 0,
    };

    txList.forEach((tx) => {
      const txDate = new Date(tx.createdAt);
      if (txDate.getFullYear() === currentYear && txDate.getMonth() === currentMonth) {
        if (tx.direction === 'CREDIT') {
          creditsThisMonth += tx.amount;
        } else {
          debitsThisMonth += tx.amount;
        }
      }
      typeCounts[tx.type]++;
    });

    let mostFrequentType: WalletTransactionType | 'None' = 'None';
    let maxCount = 0;
    Object.entries(typeCounts).forEach(([type, count]) => {
      if (count > maxCount) {
        maxCount = count;
        mostFrequentType = type as WalletTransactionType;
      }
    });

    return {
      creditsThisMonth,
      debitsThisMonth,
      netChange: creditsThisMonth - debitsThisMonth,
      mostFrequentType,
      recentTransactions: txList.slice(0, 5),
    };
  }

  // --- FILTERING & SORTING ---
  filterTransactions(list: WalletTransaction[], filters: WalletFilter): WalletTransaction[] {
    return list.filter((tx) => {
      // Type filter
      if (filters.type !== 'ALL' && tx.type !== filters.type) return false;

      // Direction filter
      if (filters.direction !== 'ALL' && tx.direction !== filters.direction) return false;

      // Status filter
      if (filters.status !== 'ALL' && tx.status !== filters.status) return false;

      // Search queries
      if (filters.searchQuery.trim()) {
        const query = filters.searchQuery.toLowerCase();
        const matchesTitle = tx.title.toLowerCase().includes(query);
        const matchesRef = tx.referenceId.toLowerCase().includes(query);
        const matchesTourney = tx.tournamentName ? tx.tournamentName.toLowerCase().includes(query) : false;
        if (!matchesTitle && !matchesRef && !matchesTourney) return false;
      }

      // Date Range filter
      const txDate = new Date(tx.createdAt);
      const now = new Date();
      if (filters.dateRange === 'TODAY') {
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        if (txDate < today) return false;
      } else if (filters.dateRange === 'LAST_7_DAYS') {
        const limit = new Date();
        limit.setDate(limit.getDate() - 7);
        if (txDate < limit) return false;
      } else if (filters.dateRange === 'LAST_30_DAYS') {
        const limit = new Date();
        limit.setDate(limit.getDate() - 30);
        if (txDate < limit) return false;
      } else if (filters.dateRange === 'THIS_MONTH') {
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        if (txDate < thisMonth) return false;
      } else if (filters.dateRange === 'CUSTOM' && filters.customStartDate) {
        const start = new Date(filters.customStartDate);
        if (txDate < start) return false;
        if (filters.customEndDate) {
          const end = new Date(filters.customEndDate);
          end.setHours(23, 59, 59, 999);
          if (txDate > end) return false;
        }
      }

      // Amount Range filter
      if (filters.amountRange === '0_100' && (tx.amount < 0 || tx.amount > 100)) return false;
      if (filters.amountRange === '101_500' && (tx.amount < 101 || tx.amount > 500)) return false;
      if (filters.amountRange === '501_1000' && (tx.amount < 501 || tx.amount > 1000)) return false;
      if (filters.amountRange === '1001_5000' && (tx.amount < 1001 || tx.amount > 5000)) return false;
      if (filters.amountRange === '5000_PLUS' && tx.amount <= 5000) return false;

      return true;
    });
  }

  sortTransactions(list: WalletTransaction[], sortBy: WalletFilter['sortBy']): WalletTransaction[] {
    const copy = [...list];
    if (sortBy === 'NEWEST') {
      return copy.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    if (sortBy === 'OLDEST') {
      return copy.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }
    if (sortBy === 'HIGHEST_AMOUNT') {
      return copy.sort((a, b) => b.amount - a.amount);
    }
    if (sortBy === 'LOWEST_AMOUNT') {
      return copy.sort((a, b) => a.amount - b.amount);
    }
    return copy;
  }

  // --- BACKWARDS COMPATIBILITY WRAPPERS (PHASE 1-4) ---
  withdrawEntryFee(amount: number, description: string): boolean {
    const activeId = this.getActivePlayerId();
    const res = this.debitEntryFee(activeId, amount, 'Entry Fee Deduction', description);
    return res.success;
  }

  creditRefund(amount: number, description: string): { success: boolean; transaction?: WalletTransaction } {
    const activeId = this.getActivePlayerId();
    return this.issueRefund(activeId, amount, 'Simulated Entry Fee Refund', description, 'Technical Issue');
  }

  creditWinnings(amount: number, description: string): void {
    const activeId = this.getActivePlayerId();
    this.creditPrize(activeId, amount, 'Prize Winnings Credited', description, 'Winner Prize');
  }

  getTransactions(): WalletTransaction[] {
    const activeId = this.getActivePlayerId();
    return localTransactionRepository.getByPlayerId(activeId);
  }

  // --- RESET & SEED ---
  resetWallet(playerId?: string): void {
    const activeId = this.getActivePlayerId(playerId);
    localWalletRepository.resetWallet(activeId);
    localTransactionRepository.reset(activeId);

    // Clear claimed bonuses
    browserStorage.setItem('vonk:v1:wallet-bonuses', []);
  }

  seedWalletData(playerId?: string): void {
    const activeId = this.getActivePlayerId(playerId);
    this.resetWallet(activeId);

    const now = new Date();
    const addHours = (d: Date, h: number) => {
      const copy = new Date(d);
      copy.setHours(copy.getHours() + h);
      return copy.toISOString();
    };

    const initialWallet: Wallet = {
      playerId: activeId,
      balance: 1000,
      totalAdded: 1000,
      totalFeesPaid: 200,
      totalPrizesWon: 500,
      totalRefunds: 50,
      totalBonuses: 100,
      updatedAt: now.toISOString(),
    };
    localWalletRepository.saveWallet(initialWallet);

    const initialTxs: WalletTransaction[] = [
      {
        id: 'tx-s1',
        playerId: activeId,
        type: 'DEMO_CREDIT',
        direction: 'CREDIT',
        amount: 1000,
        title: 'Demo Balance Added',
        description: 'Seeded initial demo currency',
        status: 'SUCCESS',
        balanceBefore: 0,
        balanceAfter: 1000,
        referenceId: 'VNK-TX-938174',
        createdAt: addHours(now, -48),
        updatedAt: addHours(now, -48),
        isDemo: true,
      },
      {
        id: 'tx-s2',
        playerId: activeId,
        type: 'ENTRY_FEE',
        direction: 'DEBIT',
        amount: 100,
        title: 'Entry Fee Deduction',
        description: 'Registered for Miramar Sniper Showdown',
        status: 'SUCCESS',
        balanceBefore: 1000,
        balanceAfter: 900,
        tournamentId: 'tour-1',
        tournamentName: 'Miramar Sniper Showdown',
        referenceId: 'VNK-TX-938175',
        createdAt: addHours(now, -36),
        updatedAt: addHours(now, -36),
        isDemo: true,
      },
      {
        id: 'tx-s3',
        playerId: activeId,
        type: 'BONUS',
        direction: 'CREDIT',
        amount: 100,
        title: 'Welcome Bonus Claimed',
        description: 'New User Promo Credit',
        status: 'SUCCESS',
        balanceBefore: 900,
        balanceAfter: 1000,
        referenceId: 'VNK-TX-938176',
        createdAt: addHours(now, -24),
        updatedAt: addHours(now, -24),
        isDemo: true,
      },
      {
        id: 'tx-s4',
        playerId: activeId,
        type: 'ENTRY_FEE',
        direction: 'DEBIT',
        amount: 100,
        title: 'Entry Fee Deduction',
        description: 'Registered for Erangel Clan War',
        status: 'SUCCESS',
        balanceBefore: 1000,
        balanceAfter: 900,
        tournamentId: 'tour-3',
        tournamentName: 'Erangel Clan War',
        referenceId: 'VNK-TX-938177',
        createdAt: addHours(now, -12),
        updatedAt: addHours(now, -12),
        isDemo: true,
      },
      {
        id: 'tx-s5',
        playerId: activeId,
        type: 'PRIZE_WINNING',
        direction: 'CREDIT',
        amount: 500,
        title: 'Prize Winnings Credited',
        description: 'Winner Prize: Miramar Sniper Showdown',
        status: 'SUCCESS',
        balanceBefore: 900,
        balanceAfter: 1400,
        tournamentId: 'tour-1',
        tournamentName: 'Miramar Sniper Showdown',
        referenceId: 'VNK-TX-938178',
        createdAt: addHours(now, -6),
        updatedAt: addHours(now, -6),
        metadata: { category: 'Winner Prize' },
        isDemo: true,
      },
      {
        id: 'tx-s6',
        playerId: activeId,
        type: 'REFUND',
        direction: 'CREDIT',
        amount: 50,
        title: 'Simulated Entry Fee Refund',
        description: 'Registration Rejected: Erangel Clan War',
        status: 'SUCCESS',
        balanceBefore: 1400,
        balanceAfter: 1450,
        tournamentId: 'tour-3',
        tournamentName: 'Erangel Clan War',
        referenceId: 'VNK-TX-938179',
        createdAt: addHours(now, -2),
        updatedAt: addHours(now, -2),
        metadata: { reason: 'Registration Rejected' },
        isDemo: true,
      },
    ];

    initialTxs.forEach((tx) => localTransactionRepository.save(tx));

    // Seed wallet balance sum: 1450
    initialWallet.balance = 1450;
    localWalletRepository.saveWallet(initialWallet);
  }

  // --- PRIVATE TOOLS ---
  private createTransactionRecord(params: {
    playerId: string;
    type: WalletTransactionType;
    direction: WalletTransactionDirection;
    amount: number;
    title: string;
    description: string;
    status: WalletTransactionStatus;
    balanceBefore: number;
    balanceAfter: number;
    tournamentId?: string;
    tournamentName?: string;
    metadata?: Record<string, unknown>;
  }): WalletTransaction {
    const referenceId = this.generateReferenceId();
    return {
      id: `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      playerId: params.playerId,
      type: params.type,
      direction: params.direction,
      amount: params.amount,
      title: params.title,
      description: params.description,
      status: params.status,
      balanceBefore: params.balanceBefore,
      balanceAfter: params.balanceAfter,
      tournamentId: params.tournamentId,
      tournamentName: params.tournamentName,
      referenceId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: params.metadata,
      isDemo: true,
    };
  }

  private generateReferenceId(): string {
    const chars = '0123456789';
    let code = 'VNK-TX-';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }
}

export const walletService = new WalletService();
export default walletService;
