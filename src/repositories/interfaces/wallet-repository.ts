import { Wallet } from '@/types';

export interface WalletRepository {
  getWallet(playerId: string): Wallet | null;
  saveWallet(wallet: Wallet): void;
  resetWallet(playerId: string): void;
}
