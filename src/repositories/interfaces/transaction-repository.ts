import { WalletTransaction } from '@/types';

export interface TransactionRepository {
  getAll(): WalletTransaction[];
  getById(id: string): WalletTransaction | null;
  getByPlayerId(playerId: string): WalletTransaction[];
  save(transaction: WalletTransaction): void;
  saveAll(transactions: WalletTransaction[]): void;
  reset(playerId: string): void;
}
