import { WalletTransaction } from '@/types';
import { TransactionRepository } from '../interfaces/transaction-repository';
import { browserStorage } from '@/lib/storage/browser-storage';
import { STORAGE_KEYS } from '@/constants';

export class LocalTransactionRepository implements TransactionRepository {
  getAll(): WalletTransaction[] {
    return browserStorage.getItem<WalletTransaction[]>(STORAGE_KEYS.TRANSACTIONS, []);
  }

  getById(id: string): WalletTransaction | null {
    const list = this.getAll();
    return list.find((tx) => tx.id === id) || null;
  }

  getByPlayerId(playerId: string): WalletTransaction[] {
    const list = this.getAll();
    return list.filter((tx) => tx.playerId === playerId);
  }

  save(transaction: WalletTransaction): void {
    const list = this.getAll();
    const index = list.findIndex((tx) => tx.id === transaction.id);
    if (index > -1) {
      list[index] = transaction;
    } else {
      list.unshift(transaction); // Latest first
    }
    browserStorage.setItem(STORAGE_KEYS.TRANSACTIONS, list);
  }

  saveAll(transactions: WalletTransaction[]): void {
    browserStorage.setItem(STORAGE_KEYS.TRANSACTIONS, transactions);
  }

  reset(playerId: string): void {
    const list = this.getAll().filter((tx) => tx.playerId !== playerId);
    browserStorage.setItem(STORAGE_KEYS.TRANSACTIONS, list);
  }
}

export const localTransactionRepository = new LocalTransactionRepository();
export default localTransactionRepository;
